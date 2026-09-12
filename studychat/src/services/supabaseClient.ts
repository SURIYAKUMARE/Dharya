import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SB_URL = 'https://xnkmbmhtwtnndyuzmuay.supabase.co';
export const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhua21ibWh0d3RubmR5dXptdWF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNzU2NDksImV4cCI6MjEwMzg1MTY0OX0.ThzeYAEvAH_Xg0bH1FmJCKdKx16yeKTpNnFG6PqADzA';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(SB_URL, SB_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
  return supabaseInstance;
}

export interface ChatMessage {
  id: string;
  sender: 'surya' | 'sadhana';
  text: string;
  time: string;
  timestamp: number;
  read: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  type?: 'text' | 'image' | 'voice';
  mediaUrl?: string;
  reactions?: Record<string, string[]>;
  replyTo?: { id: string; sender: string; text: string };
  isSecret?: boolean;
}

export const LOCAL_MESSAGES_KEY = 'studyportal_messages_v1';
export const LOCAL_STREAK_KEY = 'studyportal_streak_v1';
export const LOCAL_GALLERY_KEY = 'studyportal_gallery_v1';
export const LOCAL_MILESTONES_KEY = 'studyportal_milestones_v1';
export const LOCAL_DATES_KEY = 'studyportal_dates_v1';
export const LOCAL_SURPRISE_KEY = 'studyportal_surprise_v1';
export const LOCAL_COORDS_KEY = 'studyportal_coords_v1';
