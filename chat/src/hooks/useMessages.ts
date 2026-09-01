import { useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import { supabase } from '../lib/supabase';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { Message, Reaction } from '../types';

const PAGE_SIZE = 40;

export function useMessages() {
  const { chatId, user, partnerId } = useAuthStore();
  const { upsertMessage, setMessages, prependMessages, setReactions } = useChatStore();
  const channelRef        = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const readDebounceRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingReadRef    = useRef<Set<string>>(new Set());

  // ── Initial load ────────────────────────────────────────
  const loadMessages = useCallback(async () => {
    if (!chatId || !user) return;
    const { data, error } = await supabase
      .from('messages')
      .select('*, reactions(*)')
      .eq('chat_id', chatId)
      .not('deleted_for', 'cs', `{${user.id}}`)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);

    if (error) { console.error('[messages] load', error); return; }
    setMessages(((data ?? []) as Message[]).reverse());
  }, [chatId, user, setMessages]);

  // ── Paginate older messages ──────────────────────────────
  const loadMore = useCallback(async (beforeDate: string) => {
    if (!chatId || !user) return;
    const { data } = await supabase
      .from('messages')
      .select('*, reactions(*)')
      .eq('chat_id', chatId)
      .lt('created_at', beforeDate)
      .not('deleted_for', 'cs', `{${user.id}}`)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE);
    if (data) prependMessages(((data) as Message[]).reverse());
  }, [chatId, user, prependMessages]);

  // ── Send text ────────────────────────────────────────────
  const sendMessage = useCallback(async (content: string, replyToId?: string) => {
    if (!chatId || !user) return;
    const optId: string = `opt-${Date.now()}`;
    const optimistic: Message = {
      id: optId, chat_id: chatId, sender_id: user.id,
      content, media_url: null, media_type: null, media_caption: null,
      reply_to_id: replyToId ?? null, status: 'sending',
      delivered_at: null, read_at: null, edited_at: null,
      deleted_for: [], view_once: false, viewed: false,
      created_at: new Date().toISOString(), _optimistic: true,
    };
    upsertMessage(optimistic);

    const { data, error } = await supabase
      .from('messages')
      .insert({ chat_id: chatId, sender_id: user.id, content, reply_to_id: replyToId ?? null, status: 'sent' })
      .select().single();

    if (error) { console.error('[sendMessage]', error); return; }
    upsertMessage({ ...optimistic, ...data, _optimistic: false });
  }, [chatId, user, upsertMessage]);

  // ── Send media ───────────────────────────────────────────
  const sendMedia = useCallback(async (
    mediaUrl: string, mediaType: Message['media_type'],
    caption?: string, replyToId?: string, viewOnce?: boolean
  ) => {
    if (!chatId || !user) return;
    const { data, error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId, sender_id: user.id,
        media_url: mediaUrl, media_type: mediaType,
        media_caption: caption ?? null,
        reply_to_id: replyToId ?? null,
        view_once: viewOnce ?? false, status: 'sent',
      })
      .select().single();
    if (error) { console.error('[sendMedia]', error); return; }
    upsertMessage(data as Message);
  }, [chatId, user, upsertMessage]);

  // ── Mark delivered ───────────────────────────────────────
  const markDelivered = useCallback(async (ids: string[]) => {
    if (!ids.length) return;
    await supabase.from('messages')
      .update({ status: 'delivered', delivered_at: new Date().toISOString() })
      .in('id', ids).eq('status', 'sent').neq('sender_id', user?.id ?? '');
  }, [user]);

  // ── Mark read (debounced batch) ──────────────────────────
  const markRead = useCallback((id: string) => {
    pendingReadRef.current.add(id);
    if (readDebounceRef.current) clearTimeout(readDebounceRef.current);
    readDebounceRef.current = setTimeout(async () => {
      const ids = [...pendingReadRef.current];
      pendingReadRef.current.clear();
      if (!ids.length) return;
      await supabase.from('messages')
        .update({ status: 'read', read_at: new Date().toISOString() })
        .in('id', ids).neq('sender_id', user?.id ?? '');
    }, 300);
  }, [user]);

  // ── Edit ─────────────────────────────────────────────────
  const editMessage = useCallback(async (id: string, newContent: string) => {
    const { data } = await supabase.from('messages')
      .update({ content: newContent, edited_at: new Date().toISOString() })
      .eq('id', id).eq('sender_id', user?.id ?? '').select().single();
    if (data) upsertMessage(data as Message);
  }, [user, upsertMessage]);

  // ── Delete for me ────────────────────────────────────────
  const deleteForMe = useCallback(async (msg: Message) => {
    const ids = [...(msg.deleted_for ?? []), user?.id ?? ''];
    await supabase.from('messages').update({ deleted_for: ids }).eq('id', msg.id);
    upsertMessage({ ...msg, deleted_for: ids });
  }, [user, upsertMessage]);

  // ── Delete for everyone ──────────────────────────────────
  const deleteForEveryone = useCallback(async (msg: Message) => {
    const ids = [msg.sender_id, partnerId ?? ''].filter(Boolean);
    await supabase.from('messages')
      .update({ deleted_for: ids, content: null, media_url: null })
      .eq('id', msg.id);
    upsertMessage({ ...msg, deleted_for: ids, content: null, media_url: null });
  }, [partnerId, upsertMessage]);

  // ── React / un-react ─────────────────────────────────────
  const reactToMessage = useCallback(async (msgId: string, emoji: string) => {
    if (!user) return;
    await supabase.from('reactions').upsert(
      { message_id: msgId, user_id: user.id, emoji },
      { onConflict: 'message_id,user_id' }
    );
  }, [user]);

  const removeReaction = useCallback(async (msgId: string) => {
    if (!user) return;
    await supabase.from('reactions').delete()
      .eq('message_id', msgId).eq('user_id', user.id);
  }, [user]);

  // ── Full-text search ─────────────────────────────────────
  const searchMessages = useCallback(async (query: string): Promise<Message[]> => {
    if (!chatId || !query.trim()) return [];
    const { data } = await supabase.from('messages').select('*')
      .eq('chat_id', chatId).ilike('content', `%${query}%`)
      .order('created_at', { ascending: false }).limit(50);
    return (data ?? []) as Message[];
  }, [chatId]);

  // ── Realtime subscription ────────────────────────────────
  useEffect(() => {
    if (!chatId || !user) return;
    loadMessages();

    const channel = supabase.channel(`chat:${chatId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        async (payload) => {
          const msg = payload.new as Message;
          if (msg.deleted_for?.includes(user.id)) return;
          upsertMessage(msg);
          if (msg.sender_id !== user.id) await markDelivered([msg.id]);
        })
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        (payload) => {
          const msg = payload.new as Message;
          if (!msg.deleted_for?.includes(user.id)) upsertMessage(msg);
        })
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'reactions' },
        async (payload) => {
          const rid = (payload.new as Reaction)?.message_id ?? (payload.old as Reaction)?.message_id;
          if (!rid) return;
          const { data } = await supabase.from('reactions').select('*').eq('message_id', rid);
          setReactions(rid, (data ?? []) as Reaction[]);
        })
      .subscribe();

    channelRef.current = channel;

    const appSub = AppState.addEventListener('change', async (state) => {
      if (state === 'active') {
        const { data } = await supabase.from('messages').select('id')
          .eq('chat_id', chatId).eq('status', 'sent').neq('sender_id', user.id);
        if (data?.length) await markDelivered(data.map((d) => d.id as string));
      }
    });

    return () => {
      channel.unsubscribe();
      appSub.remove();
      if (readDebounceRef.current) clearTimeout(readDebounceRef.current);
    };
  }, [chatId, user?.id]);

  return {
    loadMore, sendMessage, sendMedia, markRead,
    editMessage, deleteForMe, deleteForEveryone,
    reactToMessage, removeReaction, searchMessages,
  };
}
