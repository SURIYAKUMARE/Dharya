import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../src/lib/supabase';
import { useAuthStore } from '../src/store/authStore';
import { useChatStore } from '../src/store/chatStore';

export default function RootLayout() {
  const { setSession, loadProfile, fetchOrCreateChat } = useAuthStore();
  const { theme } = useChatStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadProfile();
        fetchOrCreateChat();
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadProfile();
        fetchOrCreateChat();
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="pair" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="media-gallery" />
      </Stack>
    </GestureHandlerRootView>
  );
}
