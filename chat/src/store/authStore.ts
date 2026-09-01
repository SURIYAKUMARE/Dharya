import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

interface AuthState {
  session:    Session | null;
  user:       User | null;
  profile:    Profile | null;
  chatId:     string | null;
  partnerId:  string | null;
  loading:    boolean;
  setSession:      (s: Session | null) => void;
  setProfile:      (p: Profile | null) => void;
  setChatId:       (id: string | null) => void;
  setPartnerId:    (id: string | null) => void;
  loadProfile:     () => Promise<void>;
  fetchOrCreateChat: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session:   null,
  user:      null,
  profile:   null,
  chatId:    null,
  partnerId: null,
  loading:   false,

  setSession: (session) => set({ session, user: session?.user ?? null }),
  setProfile: (profile) => set({ profile }),
  setChatId:  (chatId)  => set({ chatId }),
  setPartnerId: (partnerId) => set({ partnerId }),

  loadProfile: async () => {
    const uid = get().user?.id;
    if (!uid) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();
    if (data) set({ profile: data as Profile });
  },

  fetchOrCreateChat: async () => {
    const uid = get().user?.id;
    if (!uid) return;

    const { data: memberRows } = await supabase
      .from('chat_members')
      .select('chat_id')
      .eq('user_id', uid)
      .limit(1);

    if (memberRows && memberRows.length > 0) {
      const chatId = memberRows[0].chat_id as string;
      set({ chatId });

      const { data: members } = await supabase
        .from('chat_members')
        .select('user_id')
        .eq('chat_id', chatId)
        .neq('user_id', uid);

      if (members && members.length > 0) {
        set({ partnerId: members[0].user_id as string });
      }
    }
  },
}));
