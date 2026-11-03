import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';

export default function Index() {
  const { session, chatId, fetchOrCreateChat } = useAuthStore();

  useEffect(() => {
    const initApp = async () => {
      if (session && !chatId) {
        await fetchOrCreateChat();
      }

      const t = setTimeout(() => {
        if (!session) {
          router.replace('/auth');
        } else if (!chatId) {
          router.replace('/pair');
        } else {
          router.replace('/chat');
        }
      }, 300);

      return () => clearTimeout(t);
    };

    initApp();
  }, [session, chatId]);

  return (
    <View style={{ flex: 1, backgroundColor: '#131615', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color="#7E9F89" size="large" />
    </View>
  );
}
