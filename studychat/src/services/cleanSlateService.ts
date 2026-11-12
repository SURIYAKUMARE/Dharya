/**
 * cleanSlateService.ts
 * 
 * Provides automated clean-slate migration and on-demand data reset.
 * Ensures that the application starts completely fresh like a brand new user:
 * - 0 chat messages (local storage + remote Supabase)
 * - 0 photos or videos in Gallery (IndexedDB + local storage + remote)
 * - 0 recycle bin records
 * - 0 status updates, views, reactions, or highlights
 * - 0 demo milestones on Life Timeline
 */

import { clearRemoteChat, CHAT_ID, STUDY_GROUP_CHAT_ID } from './chatSyncService';
import { statusService } from './statusService';
import { smartNotificationService } from './smartNotificationService';
import { getSupabase } from './supabaseClient';

export const CLEAN_SLATE_VERSION_KEY = 'dhanya_clean_slate_fresh_v6';

/**
 * Synchronous and thorough wipe of all browser local storage and IndexedDB
 */
export function purgeAllLocalDataSync(): void {
  if (typeof window === 'undefined') return;

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (
        k.startsWith('studyportal_messages') ||
        k.startsWith('dharya_draft_') ||
        k.startsWith('dharya_gallery_') ||
        k.startsWith('dhanya_status_') ||
        k.startsWith('studyportal_gallery') ||
        k.startsWith('studyportal_unread') ||
        k.startsWith('dharya_recycle_') ||
        k.startsWith('dharya_timeline_') ||
        k.startsWith('dhanya_timeline_') ||
        k.startsWith('whatsapp_active_') ||
        k.startsWith('whatsapp_last_seen_') ||
        k === 'dharya_chat_cleared' ||
        k === 'dharya_active_chat_id'
      ) {
        keysToRemove.push(k);
      }
    }

    keysToRemove.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {}
    });

    // Explicit keys for safety
    const explicitKeys = [
      'studyportal_messages_v1',
      'studyportal_messages_v1_dharya-surya-sadhana',
      'studyportal_messages_v1_engineering-study-circle',
      'studyportal_gallery_v1',
      'dharya_gallery_v2',
      'dharya_gallery_items_v1',
      'dharya_gallery_items_v2',
      'dharya_gallery_items_v3',
      'dharya_recycle_bin_v1',
      'dhanya_status_items_v1',
      'dhanya_status_items_v2',
      'dhanya_status_items_v3',
      'dhanya_status_views_v1',
      'dhanya_status_views_v2',
      'dhanya_status_views_v3',
      'dhanya_status_reactions_v1',
      'dhanya_status_reactions_v2',
      'dhanya_status_reactions_v3',
      'dhanya_status_replies_v1',
      'dhanya_status_replies_v2',
      'dhanya_status_replies_v3',
      'dhanya_status_highlights_v1',
      'dhanya_status_highlights_v2',
      'dhanya_status_highlights_v3',
      'dhanya_status_muted_v1',
      'dhanya_status_muted_v2',
      'dhanya_status_muted_v3',
      'dhanya_timeline_milestones_clean_v1',
      'dharya_timeline_milestones_v1',
      'dharya_timeline_milestones_v2',
      'dharya_timeline_milestones_v3',
    ];

    explicitKeys.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {}
    });

    // Reset status service in memory
    statusService.clearAll();

    // Reset smart notifications in memory
    smartNotificationService.clearAllNotifications();

    // Wipe IndexedDB databases
    if ('indexedDB' in window) {
      try {
        window.indexedDB.deleteDatabase('dharya_gallery_db_v2');
        window.indexedDB.deleteDatabase('dharya_gallery_db');
      } catch (idbErr) {
        console.warn('[cleanSlate] Failed to delete IndexedDB:', idbErr);
      }
    }
  } catch (err) {
    console.warn('[cleanSlate] Error during local purge:', err);
  }
}

/**
 * Full clean-slate reset: LocalStorage, IndexedDB, and Remote Supabase databases
 */
export async function performFullCleanSlateReset(): Promise<void> {
  // 1. Wipe local browser state
  purgeAllLocalDataSync();

  // 2. Wipe remote Supabase messages
  try {
    await Promise.allSettled([
      clearRemoteChat(CHAT_ID),
      clearRemoteChat(STUDY_GROUP_CHAT_ID),
    ]);
  } catch (sbErr) {
    console.warn('[cleanSlate] Remote messages clear warning:', sbErr);
  }

  // 3. Wipe remote Supabase gallery_photos if table exists
  try {
    const sb = getSupabase();
    await sb.from('gallery_photos').delete().neq('id', '___non_existent___');
  } catch (photoErr) {
    // If table doesn't exist or RLS restricts, safe to ignore
    console.warn('[cleanSlate] Remote gallery_photos clear warning:', photoErr);
  }

  // 4. Mark clean slate version as applied
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CLEAN_SLATE_VERSION_KEY, 'true');
    } catch {}
  }
}

/**
 * Automatically invoked on application boot.
 * If the clean slate version has not yet been applied on this browser, run the purge once.
 */
export function autoRunCleanSlateOnBoot(): void {
  if (typeof window === 'undefined') return;

  try {
    const isApplied = localStorage.getItem(CLEAN_SLATE_VERSION_KEY);
    if (isApplied !== 'true') {
      console.log('[cleanSlate] Applying clean-slate fresh user reset...');
      purgeAllLocalDataSync();
      // Background remote wipe
      performFullCleanSlateReset().catch(() => {});
      localStorage.setItem(CLEAN_SLATE_VERSION_KEY, 'true');
    }
  } catch (e) {
    console.warn('[cleanSlate] Auto-run error:', e);
  }
}
