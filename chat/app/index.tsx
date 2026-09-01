import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';

export default function Index() {
  const { session, chatId } = useAuthStore();

  useEffect(() => {
    // Small delay so the store hydrates before redirecting
    const t = setTimeout(() => {
      if (session === null) {
        router.replace('/auth');
      } else if (session && !chatId) {
        router.replace('/pair');
      } else if (session && chatId) {
        router.replace('/chat');
      }
    }, 250);
    return () => clearTimeout(t);
  }, [session, chatId]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0f0a1a', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color="#c026d3" size="large" />
    </View>
  );
}
