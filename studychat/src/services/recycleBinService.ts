/**
 * recycleBinService.ts
 * Universal Recycle Bin system across the platform:
 * - When any item is deleted in Chat, Gallery, or Life Timeline, it moves to the Recycle Bin.
 * - Items in the Recycle Bin are hidden from Chat, Gallery, and Life Timeline.
 * - Users can restore items back to their original location with 1 click.
 * - Users can permanently erase items (Delete Permanently / Empty Bin) forever.
 */

import {
  STORE_RECYCLE,
  STORE_MEDIA,
  STORE_TIMELINE,
  idbGetAll,
  idbPut,
  idbDelete,
  GalleryItem,
  TimelineIncident,
  deletePhoto,
} from './galleryService';
import { LOCAL_MESSAGES_KEY, ExtendedChatMessage } from './supabaseClient';
import { saveRemoteMessage, deleteRemoteMessage } from './chatSyncService';

export type RecycleItemSource = 'chat' | 'gallery' | 'timeline';

export interface RecycleBinItem {
  id: string;             // unique bin record ID: e.g. "bin_chat_1728..."
  originalId: string;     // ID of the original message, photo, or incident
  source: RecycleItemSource;
  title: string;          // Human-readable title
  previewText?: string;   // Text snippet / message / incident story
  mediaUrl?: string;      // Photo / video preview URL
  mediaType?: 'photo' | 'video' | 'audio';
  owner: string;          // 'surya' | 'sadhana' | 'guest'
  deletedAt: number;      // Epoch ms timestamp of deletion
  originalData: any;      // Full serialized payload for complete restoration
}

const LOCAL_BIN_FALLBACK_KEY = 'dharya_recycle_bin_v1';

function notifyBinChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('recycle_bin_updated'));
  }
}

/**
 * Fetch all items currently in the Recycle Bin
 */
export async function fetchRecycleBinItems(owner?: string): Promise<RecycleBinItem[]> {
  try {
    const items = await idbGetAll<RecycleBinItem>(STORE_RECYCLE);
    if (items && items.length > 0) {
      const filtered = owner ? items.filter((i) => !i.owner || i.owner === owner) : items;
      return filtered.sort((a, b) => b.deletedAt - a.deletedAt);
    }
  } catch (err) {
    console.warn('[recycleBinService] idbGetAll failed, trying fallback:', err);
  }

  // LocalStorage Fallback
  try {
    const raw = localStorage.getItem(LOCAL_BIN_FALLBACK_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as RecycleBinItem[];
      const filtered = owner ? parsed.filter((i) => !i.owner || i.owner === owner) : parsed;
      return filtered.sort((a, b) => b.deletedAt - a.deletedAt);
    }
  } catch {}

  return [];
}

/**
 * Move an item to the Recycle Bin (Called instead of permanent deletion)
 */
export async function moveToRecycleBin(
  item: Omit<RecycleBinItem, 'id' | 'deletedAt'>
): Promise<RecycleBinItem> {
  const id = `bin_${item.source}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const binItem: RecycleBinItem = {
    ...item,
    id,
    deletedAt: Date.now(),
  };

  try {
    await idbPut(STORE_RECYCLE, binItem);
  } catch (err) {
    console.warn('[recycleBinService] idbPut error:', err);
  }

  // Sync to fallback
  try {
    const current = await fetchRecycleBinItems();
    const updated = [binItem, ...current.filter((i) => i.id !== id)];
    localStorage.setItem(LOCAL_BIN_FALLBACK_KEY, JSON.stringify(updated));
  } catch {}

  notifyBinChange();
  return binItem;
}

/**
 * Restore an item from the Recycle Bin back to its original location
 */
export async function restoreRecycleItem(binId: string): Promise<boolean> {
  const items = await fetchRecycleBinItems();
  const target = items.find((i) => i.id === binId);
  if (!target) return false;

  try {
    // 1. Restore according to source
    if (target.source === 'chat') {
      const msg = target.originalData as ExtendedChatMessage;
      if (msg) {
        // Restore to local messages
        try {
          const raw = localStorage.getItem(LOCAL_MESSAGES_KEY);
          const currentMsgs: ExtendedChatMessage[] = raw ? JSON.parse(raw) : [];
          if (!currentMsgs.some((m) => m.id === msg.id)) {
            const nextMsgs = [...currentMsgs, msg].sort((a, b) => a.timestamp - b.timestamp);
            localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(nextMsgs));
          }
        } catch {}

        // Save back to remote Supabase DB
        saveRemoteMessage(msg).catch(() => {});

        // Broadcast restore event
        window.dispatchEvent(
          new CustomEvent('whatsapp_message_restored', { detail: { message: msg } })
        );
      }
    } else if (target.source === 'gallery') {
      const galleryItem = target.originalData as GalleryItem;
      if (galleryItem) {
        await idbPut(STORE_MEDIA, galleryItem);
        window.dispatchEvent(
          new CustomEvent('gallery_item_restored', { detail: { item: galleryItem } })
        );
      }
    } else if (target.source === 'timeline') {
      const incident = target.originalData as TimelineIncident;
      if (incident) {
        await idbPut(STORE_TIMELINE, incident);
        window.dispatchEvent(
          new CustomEvent('timeline_incident_restored', { detail: { incident } })
        );
      }
    }

    // 2. Remove from Recycle Bin
    await idbDelete(STORE_RECYCLE, binId);

    // Remove from fallback
    try {
      const remaining = items.filter((i) => i.id !== binId);
      localStorage.setItem(LOCAL_BIN_FALLBACK_KEY, JSON.stringify(remaining));
    } catch {}

    notifyBinChange();
    return true;
  } catch (err) {
    console.error('[recycleBinService] restoreRecycleItem error:', err);
    return false;
  }
}

/**
 * Permanently erase an item from storage forever
 */
export async function deleteRecycleItemPermanently(binId: string): Promise<boolean> {
  const items = await fetchRecycleBinItems();
  const target = items.find((i) => i.id === binId);
  if (!target) return false;

  try {
    // 1. Erase from backing store forever
    if (target.source === 'chat') {
      await deleteRemoteMessage(target.originalId);
    } else if (target.source === 'gallery') {
      if (target.originalData) {
        await deletePhoto(target.originalData as GalleryItem);
      }
    } else if (target.source === 'timeline') {
      await idbDelete(STORE_TIMELINE, target.originalId);
    }

    // 2. Erase from Recycle Bin
    await idbDelete(STORE_RECYCLE, binId);

    // Erase from fallback
    try {
      const remaining = items.filter((i) => i.id !== binId);
      localStorage.setItem(LOCAL_BIN_FALLBACK_KEY, JSON.stringify(remaining));
    } catch {}

    notifyBinChange();
    return true;
  } catch (err) {
    console.error('[recycleBinService] deleteRecycleItemPermanently error:', err);
    return false;
  }
}

/**
 * Empty the entire Recycle Bin permanently
 */
export async function emptyRecycleBin(owner?: string): Promise<boolean> {
  const items = await fetchRecycleBinItems(owner);
  for (const item of items) {
    await deleteRecycleItemPermanently(item.id);
  }
  notifyBinChange();
  return true;
}
