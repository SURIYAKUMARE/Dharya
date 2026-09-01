import { create } from 'zustand';
import { Message, Reaction, ChatSettings } from '../types';

interface ChatState {
  messages: Message[];
  settings: ChatSettings | null;
  partnerTyping: boolean;
  partnerOnline: boolean;
  partnerLastSeen: string | null;
  replyTo: Message | null;
  searchQuery: string;
  searchResults: Message[];
  theme: 'dark' | 'light';

  setMessages: (msgs: Message[]) => void;
  prependMessages: (msgs: Message[]) => void;
  upsertMessage: (msg: Message) => void;
  removeMessage: (id: string) => void;
  setReactions: (messageId: string, reactions: Reaction[]) => void;
  setSettings: (s: ChatSettings) => void;
  setPartnerTyping: (v: boolean) => void;
  setPartnerOnline: (v: boolean) => void;
  setPartnerLastSeen: (ts: string | null) => void;
  setReplyTo: (msg: Message | null) => void;
  setSearchQuery: (q: string) => void;
  setSearchResults: (msgs: Message[]) => void;
  setTheme: (t: 'dark' | 'light') => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  settings: null,
  partnerTyping: false,
  partnerOnline: false,
  partnerLastSeen: null,
  replyTo: null,
  searchQuery: '',
  searchResults: [],
  theme: 'dark',

  setMessages: (msgs) => set({ messages: msgs }),

  prependMessages: (msgs) =>
    set({ messages: [...msgs, ...get().messages] }),

  upsertMessage: (msg) => {
    const existing = get().messages;
    const idx = existing.findIndex((m) => m.id === msg.id);
    if (idx === -1) {
      set({ messages: [...existing, msg] });
    } else {
      const updated = [...existing];
      updated[idx] = { ...updated[idx], ...msg };
      set({ messages: updated });
    }
  },

  removeMessage: (id) =>
    set({ messages: get().messages.filter((m) => m.id !== id) }),

  setReactions: (messageId, reactions) => {
    const updated = get().messages.map((m) =>
      m.id === messageId ? { ...m, reactions } : m
    );
    set({ messages: updated });
  },

  setSettings: (settings) => set({ settings }),

  setPartnerTyping: (partnerTyping) => set({ partnerTyping }),

  setPartnerOnline: (partnerOnline) => set({ partnerOnline }),

  setPartnerLastSeen: (partnerLastSeen) => set({ partnerLastSeen }),

  setReplyTo: (replyTo) => set({ replyTo }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setSearchResults: (searchResults) => set({ searchResults }),

  setTheme: (theme) => set({ theme }),
}));
