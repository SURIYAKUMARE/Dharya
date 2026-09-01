import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { supabase } from '../lib/supabase';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';

export function usePresence() {
  const { chatId, user } = useAuthStore();
  const { setPartnerTyping, setPartnerOnline, setPartnerLastSeen } = useChatStore();
  const channelRef    = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!chatId || !user) return;

    const ch = supabase.channel(`presence:${chatId}`, {
      config: { presence: { key: user.id } },
    });

    ch.on('presence', { event: 'sync' }, () => {
      const state = ch.presenceState<{ typing: boolean }>();
      const others = Object.entries(state).filter(([k]) => k !== user.id);
      if (others.length > 0) {
        const [, presences] = others[0];
        const p = presences[0] as { typing: boolean };
        setPartnerTyping(p?.typing ?? false);
        setPartnerOnline(true);
      } else {
        setPartnerOnline(false);
        setPartnerTyping(false);
      }
    })
    .on('presence', { event: 'join' }, ({ key }) => {
      if (key !== user.id) setPartnerOnline(true);
    })
    .on('presence', { event: 'leave' }, ({ key }) => {
      if (key !== user.id) {
        setPartnerOnline(false);
        setPartnerTyping(false);
        refreshPartnerLastSeen();
      }
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await ch.track({ typing: false, online: true });
        await updateLastSeen();
      }
    });

    channelRef.current = ch;

    const interval  = setInterval(updateLastSeen, 30_000);
    const appSub    = AppState.addEventListener('change', async (state) => {
      if (state === 'active')  { await ch.track({ typing: false, online: true }); await updateLastSeen(); }
      else                     { await updateLastSeen(); await ch.untrack(); }
    });

    return () => {
      ch.unsubscribe();
      clearInterval(interval);
      appSub.remove();
    };
  }, [chatId, user?.id]);

  async function updateLastSeen() {
    if (!user) return;
    await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', user.id);
  }

  async function refreshPartnerLastSeen() {
    const { partnerId } = useAuthStore.getState();
    if (!partnerId) return;
    const { data } = await supabase.from('profiles').select('last_seen').eq('id', partnerId).single();
    if (data) setPartnerLastSeen(data.last_seen as string);
  }

  function onTypingStart() {
    const ch = channelRef.current;
    if (!ch) return;
    ch.track({ typing: true, online: true });
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => ch.track({ typing: false, online: true }), 3000);
  }

  function onTypingStop() {
    const ch = channelRef.current;
    if (!ch) return;
    if (typingTimer.current) clearTimeout(typingTimer.current);
    ch.track({ typing: false, online: true });
  }

  return { onTypingStart, onTypingStop };
}
