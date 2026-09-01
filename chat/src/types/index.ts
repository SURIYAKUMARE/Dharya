export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';
export type MediaType = 'image' | 'video' | 'audio' | 'document';

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  last_seen: string;
  theme: 'dark' | 'light';
}

export interface Chat {
  id: string;
  created_at: string;
}

export interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string | null;
  media_url: string | null;
  media_type: MediaType | null;
  media_caption: string | null;
  reply_to_id: string | null;
  reply_to?: Message | null;
  status: MessageStatus;
  delivered_at: string | null;
  read_at: string | null;
  edited_at: string | null;
  deleted_for: string[];
  view_once: boolean;
  viewed: boolean;
  created_at: string;
  reactions?: Reaction[];
  // optimistic-only fields
  _optimistic?: boolean;
}

export interface ChatSettings {
  chat_id: string;
  user_id: string;
  wallpaper_url: string | null;
  muted_until: string | null;
}

export interface InviteCode {
  code: string;
  owner_id: string;
  chat_id: string | null;
  used_by: string | null;
  created_at: string;
  expires_at: string;
}
