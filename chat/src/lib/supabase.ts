import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SUPABASE_URL      = process.env.EXPO_PUBLIC_SUPABASE_URL      ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[Supabase] Missing env vars — copy .env.local.example to .env.local and fill in your values.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: Platform.OS !== 'web' ? AsyncStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
});

export async function signOut() {
  await supabase.auth.signOut();
}

/**
 * Upload a file to the chat-media bucket and return its storage URL.
 * Uses base64 encoding so it works on both native (expo-file-system) and web (fetch blob).
 */
export async function uploadMedia(
  userId: string,
  fileName: string,
  fileUri: string,
  mimeType: string
): Promise<string> {
  const path = `${userId}/${Date.now()}_${fileName}`;

  let body: Uint8Array;
  if (Platform.OS === 'web') {
    const res  = await fetch(fileUri);
    const blob = await res.blob();
    body = new Uint8Array(await blob.arrayBuffer());
  } else {
    const FileSystem = await import('expo-file-system');
    const b64 = await FileSystem.readAsStringAsync(fileUri, { encoding: 'base64' });
    body = base64ToUint8(b64);
  }

  const { error } = await supabase.storage
    .from('chat-media')
    .upload(path, body, { contentType: mimeType, upsert: false });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from('chat-media').getPublicUrl(path);
  return data.publicUrl;
}

function base64ToUint8(b64: string): Uint8Array {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}
