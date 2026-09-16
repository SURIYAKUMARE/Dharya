import { getSupabase, ExtendedChatMessage } from './supabaseClient';

export const CHAT_ID = 'dharya-surya-sadhana';

/**
 * Converts a Supabase PostgreSQL row to an ExtendedChatMessage
 */
export function rowToMessage(row: any): ExtendedChatMessage {
  const sender: 'surya' | 'sadhana' =
    row.sender_id === 'dharya' || row.sender_id === 'surya' ? 'surya' : 'sadhana';

  const createdAtMs = row.created_at ? new Date(row.created_at).getTime() : Date.now();
  const timeStr = new Date(createdAtMs).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  let msgType: 'text' | 'image' | 'video' | 'voice' | 'poll' | 'document' = 'text';
  if (row.poll_question) msgType = 'poll';
  else if (row.media_type === 'image') msgType = 'image';
  else if (row.media_type === 'video') msgType = 'video';
  else if (row.media_type === 'voice' || row.media_type === 'audio') msgType = 'voice';
  else if (row.media_type === 'document') msgType = 'document';

  let replyToObj: { id: string; sender: string; text: string } | undefined = undefined;
  if (row.reply_to) {
    if (typeof row.reply_to === 'object') {
      replyToObj = row.reply_to;
    } else if (typeof row.reply_to === 'string') {
      try {
        replyToObj = JSON.parse(row.reply_to);
      } catch {
        replyToObj = { id: row.reply_to, sender: '', text: '' };
      }
    }
  } else if (row.formatted_content?.replyTo) {
    replyToObj = row.formatted_content.replyTo;
  }

  let pollObj: ExtendedChatMessage['poll'] = undefined;
  if (row.poll_question && Array.isArray(row.poll_options)) {
    pollObj = {
      question: row.poll_question,
      options: row.poll_options,
      pollType: (row.poll_type as any) || 'single',
    };
  }

  const status: 'sending' | 'sent' | 'delivered' | 'read' =
    row.status === 'read'
      ? 'read'
      : row.status === 'delivered'
      ? 'delivered'
      : row.status === 'sending'
      ? 'sending'
      : 'sent';

  const isStarred = Array.isArray(row.starred_by) && row.starred_by.length > 0;

  return {
    id: String(row.id),
    sender,
    text: row.content || '',
    time: timeStr,
    timestamp: createdAtMs,
    read: status === 'read',
    status,
    type: msgType,
    mediaUrl: row.media_url || undefined,
    thumbnailUrl: row.media_thumb || undefined,
    reactions:
      typeof row.reactions === 'object' && row.reactions !== null ? row.reactions : {},
    replyTo: replyToObj,
    isViewOnce: !!row.view_once,
    isOpened: Array.isArray(row.viewed_by) && row.viewed_by.length > 0,
    transcript: row.formatted_content?.transcript || undefined,
    isPinned: !!row.pinned,
    isStarred,
    fileSizeKb: row.media_size ? Math.round(row.media_size / 1024) : undefined,
    duration: row.media_duration ? String(row.media_duration) : undefined,
    documentName: row.media_name || undefined,
    documentSize: row.media_size
      ? row.media_size > 1048576
        ? `${(row.media_size / 1048576).toFixed(1)} MB`
        : `${Math.round(row.media_size / 1024)} KB`
      : undefined,
    documentUrl: msgType === 'document' ? row.media_url : undefined,
    audioUrl: msgType === 'voice' ? row.media_url : undefined,
    audioDuration: row.media_duration || undefined,
    poll: pollObj,
  };
}

/**
 * Converts an ExtendedChatMessage to a Supabase messages table row
 */
export function messageToRow(msg: ExtendedChatMessage): any {
  return {
    id: msg.id,
    chat_id: CHAT_ID,
    sender_id: msg.sender,
    content: msg.text || '',
    formatted_content: {
      transcript: msg.transcript || null,
      replyTo: msg.replyTo || null,
    },
    media_url: msg.mediaUrl || msg.documentUrl || msg.audioUrl || null,
    media_type: msg.type || 'text',
    media_name: msg.documentName || null,
    media_thumb: msg.thumbnailUrl || null,
    media_size: msg.fileSizeKb ? msg.fileSizeKb * 1024 : null,
    media_duration: msg.audioDuration || (msg.duration ? parseInt(msg.duration) || null : null),
    view_once: !!msg.isViewOnce,
    viewed_by: msg.isOpened ? [msg.sender === 'surya' ? 'sadhana' : 'surya'] : [],
    reply_to: null, // safely avoid FK constraint violations; preserved in formatted_content
    status: msg.status || 'sent',
    delivered_at:
      msg.status === 'delivered' || msg.status === 'read' ? new Date().toISOString() : null,
    read_at: msg.status === 'read' ? new Date().toISOString() : null,
    reactions: msg.reactions || {},
    starred_by: msg.isStarred ? ['all'] : [],
    pinned: !!msg.isPinned,
    poll_question: msg.poll?.question || null,
    poll_options: msg.poll?.options || null,
    poll_type: msg.poll?.pollType || 'single',
    created_at: new Date(msg.timestamp || Date.now()).toISOString(),
  };
}

/**
 * Fetch all messages from Supabase
 */
export async function fetchRemoteMessages(): Promise<ExtendedChatMessage[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', CHAT_ID)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('[chatSync] fetchRemoteMessages error:', error.message);
      return [];
    }
    if (!data || !Array.isArray(data)) return [];

    return data.map(rowToMessage);
  } catch (err) {
    console.warn('[chatSync] fetchRemoteMessages failed:', err);
    return [];
  }
}

/**
 * Save / upsert a single message to Supabase
 */
export async function saveRemoteMessage(msg: ExtendedChatMessage): Promise<boolean> {
  try {
    const supabase = getSupabase();
    const row = messageToRow(msg);
    const { error } = await supabase.from('messages').upsert(row, { onConflict: 'id' });
    if (error) {
      console.warn('[chatSync] saveRemoteMessage error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[chatSync] saveRemoteMessage failed:', err);
    return false;
  }
}

/**
 * Update message status (delivered / read) in Supabase
 */
export async function updateRemoteStatus(
  msgId: string,
  status: 'delivered' | 'read'
): Promise<boolean> {
  try {
    const supabase = getSupabase();
    const updateData: any = { status };
    if (status === 'read') {
      updateData.read_at = new Date().toISOString();
    } else if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }
    const { error } = await supabase.from('messages').update(updateData).eq('id', msgId);
    if (error) {
      console.warn('[chatSync] updateRemoteStatus error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[chatSync] updateRemoteStatus failed:', err);
    return false;
  }
}

/**
 * Mark all incoming messages from the other user as read in Supabase
 */
export async function markAllIncomingAsRead(
  currentUser: 'surya' | 'sadhana'
): Promise<boolean> {
  try {
    const supabase = getSupabase();
    const partnerUser = currentUser === 'surya' ? 'sadhana' : 'surya';
    const otherSenders = partnerUser === 'surya' ? ['surya', 'dharya'] : ['sadhana'];

    const { error } = await supabase
      .from('messages')
      .update({ status: 'read', read_at: new Date().toISOString() })
      .eq('chat_id', CHAT_ID)
      .in('sender_id', otherSenders)
      .neq('status', 'read');

    if (error) {
      console.warn('[chatSync] markAllIncomingAsRead error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[chatSync] markAllIncomingAsRead failed:', err);
    return false;
  }
}

/**
 * Update message reactions in Supabase
 */
export async function updateRemoteReactions(
  msgId: string,
  reactions: Record<string, string[]>
): Promise<boolean> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('messages')
      .update({ reactions })
      .eq('id', msgId);
    if (error) {
      console.warn('[chatSync] updateRemoteReactions error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[chatSync] updateRemoteReactions failed:', err);
    return false;
  }
}

/**
 * Update message pinned state in Supabase
 */
export async function updateRemotePin(
  msgId: string,
  pinned: boolean
): Promise<boolean> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('messages')
      .update({
        pinned,
        pinned_at: pinned ? new Date().toISOString() : null,
      })
      .eq('id', msgId);
    if (error) {
      console.warn('[chatSync] updateRemotePin error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[chatSync] updateRemotePin failed:', err);
    return false;
  }
}

/**
 * Update message starred state in Supabase
 */
export async function updateRemoteStar(
  msgId: string,
  isStarred: boolean
): Promise<boolean> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('messages')
      .update({
        starred_by: isStarred ? ['all'] : [],
      })
      .eq('id', msgId);
    if (error) {
      console.warn('[chatSync] updateRemoteStar error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[chatSync] updateRemoteStar failed:', err);
    return false;
  }
}

/**
 * Update poll options / votes in Supabase
 */
export async function updateRemotePoll(
  msgId: string,
  poll: ExtendedChatMessage['poll']
): Promise<boolean> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('messages')
      .update({
        poll_question: poll?.question || null,
        poll_options: poll?.options || null,
        poll_type: poll?.pollType || 'single',
      })
      .eq('id', msgId);
    if (error) {
      console.warn('[chatSync] updateRemotePoll error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[chatSync] updateRemotePoll failed:', err);
    return false;
  }
}

/**
 * Delete a message from Supabase
 */
export async function deleteRemoteMessage(msgId: string): Promise<boolean> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from('messages').delete().eq('id', msgId);
    if (error) {
      console.warn('[chatSync] deleteRemoteMessage error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[chatSync] deleteRemoteMessage failed:', err);
    return false;
  }
}

/**
 * Merge local and remote message lists seamlessly without duplicates
 */
export function mergeMessages(
  localMsgs: ExtendedChatMessage[],
  remoteMsgs: ExtendedChatMessage[]
): ExtendedChatMessage[] {
  const map = new Map<string, ExtendedChatMessage>();

  // Insert remote messages first (authoritative DB data)
  for (const rm of remoteMsgs) {
    map.set(rm.id, rm);
  }

  // Merge local messages:
  for (const lm of localMsgs) {
    const existing = map.get(lm.id);
    if (!existing) {
      // Local message not in DB yet (e.g. freshly sent offline/optimistic)
      map.set(lm.id, lm);
      // Background save to Supabase
      saveRemoteMessage(lm).catch(() => {});
    } else {
      // If local has more advanced status or reactions, preserve or merge
      const statusRank: Record<string, number> = {
        sending: 0,
        sent: 1,
        delivered: 2,
        read: 3,
      };
      const remoteRank = statusRank[existing.status || 'sent'] ?? 1;
      const localRank = statusRank[lm.status || 'sent'] ?? 1;
      const higherStatus = localRank > remoteRank ? lm.status : existing.status;

      // Merge reactions
      const mergedReactions: Record<string, string[]> = {
        ...(existing.reactions || {}),
        ...(lm.reactions || {}),
      };

      map.set(lm.id, {
        ...existing,
        status: higherStatus,
        read: higherStatus === 'read' || existing.read || lm.read,
        reactions: mergedReactions,
        isPinned: existing.isPinned !== undefined ? existing.isPinned : lm.isPinned,
        isStarred: existing.isStarred !== undefined ? existing.isStarred : lm.isStarred,
        isOpened: existing.isOpened || lm.isOpened,
        poll: existing.poll || lm.poll,
        replyTo: existing.replyTo || lm.replyTo,
        documentName: existing.documentName || lm.documentName,
        documentSize: existing.documentSize || lm.documentSize,
        documentUrl: existing.documentUrl || lm.documentUrl,
        audioUrl: existing.audioUrl || lm.audioUrl,
        audioDuration: existing.audioDuration || lm.audioDuration,
      });
    }
  }

  // Return sorted array
  return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
}
