import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { Message } from '../types';

export type RecycleItemSource = 'chat' | 'gallery' | 'timeline' | 'note';

export interface RecycleBinItem {
  id: string;
  originalId: string;
  source: RecycleItemSource;
  title: string;
  previewText?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'document';
  ownerId?: string;
  deletedAt: number;
  originalData: any;
}

const STORAGE_KEY = '@dharya_mobile_recycle_bin_v1';

/**
 * Fetch all items currently in the Recycle Bin
 */
export async function fetchRecycleBinItems(): Promise<RecycleBinItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const items: RecycleBinItem[] = JSON.parse(raw);
    return items.sort((a, b) => b.deletedAt - a.deletedAt);
  } catch (err) {
    console.warn('[recycleBinService] Error reading AsyncStorage:', err);
    return [];
  }
}

/**
 * Get the total number of items currently in the Recycle Bin
 */
export async function getRecycleBinCount(): Promise<number> {
  const items = await fetchRecycleBinItems();
  return items.length;
}

/**
 * Move an item to the Recycle Bin
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
    const current = await fetchRecycleBinItems();
    const updated = [binItem, ...current.filter((i) => i.originalId !== item.originalId)];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('[recycleBinService] Error moving item to bin:', err);
  }

  return binItem;
}

/**
 * Restore an item from the Recycle Bin back to active views
 */
export async function restoreRecycleItem(binId: string): Promise<boolean> {
  try {
    const items = await fetchRecycleBinItems();
    const target = items.find((i) => i.id === binId);
    if (!target) return false;

    // If it is a chat message, remove user from deleted_for in Supabase if applicable
    if (target.source === 'chat' && target.originalData) {
      const msg = target.originalData as Message;
      if (msg.id) {
        try {
          await supabase
            .from('messages')
            .update({ deleted_for: [] })
            .eq('id', msg.id);
        } catch (e) {
          console.warn('[recycleBinService] Supabase restore warning:', e);
        }
      }
    }

    // Remove from local Recycle Bin
    const remaining = items.filter((i) => i.id !== binId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
    return true;
  } catch (err) {
    console.error('[recycleBinService] Error restoring item:', err);
    return false;
  }
}

/**
 * Permanently delete an item from the Recycle Bin forever
 */
export async function deletePermanently(binId: string): Promise<boolean> {
  try {
    const items = await fetchRecycleBinItems();
    const target = items.find((i) => i.id === binId);
    if (!target) return false;

    // If chat message, delete permanently from Supabase
    if (target.source === 'chat' && target.originalId) {
      try {
        await supabase
          .from('messages')
          .delete()
          .eq('id', target.originalId);
      } catch (e) {
        console.warn('[recycleBinService] Supabase permanent delete warning:', e);
      }
    }

    // Remove from local Recycle Bin
    const remaining = items.filter((i) => i.id !== binId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
    return true;
  } catch (err) {
    console.error('[recycleBinService] Error deleting permanently:', err);
    return false;
  }
}

/**
 * Empty the entire Recycle Bin forever
 */
export async function emptyRecycleBin(): Promise<boolean> {
  try {
    const items = await fetchRecycleBinItems();
    // Erase all messages from remote Supabase if any
    const chatMsgIds = items
      .filter((i) => i.source === 'chat' && i.originalId)
      .map((i) => i.originalId);

    if (chatMsgIds.length > 0) {
      try {
        await supabase.from('messages').delete().in('id', chatMsgIds);
      } catch (e) {
        console.warn('[recycleBinService] Remote bulk delete warning:', e);
      }
    }

    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    console.error('[recycleBinService] Error emptying bin:', err);
    return false;
  }
}
