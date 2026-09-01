import { useEffect, useState } from 'react';
import {
  View, FlatList, Image, StyleSheet, Text,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { supabase } from '../src/lib/supabase';
import { useAuthStore } from '../src/store/authStore';
import { useChatStore } from '../src/store/chatStore';
import { Colors } from '../src/lib/colors';
import { Message } from '../src/types';

const { width } = Dimensions.get('window');
const SIZE = (width - 4) / 3;

export default function MediaGallery() {
  const { chatId } = useAuthStore();
  const { theme }  = useChatStore();
  const C          = Colors[theme];
  const [media, setMedia] = useState<Message[]>([]);

  useEffect(() => {
    if (!chatId) return;
    supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .in('media_type', ['image', 'video'])
      .not('media_url', 'is', null)
      .order('created_at', { ascending: false })
      .then(({ data }) => setMedia((data ?? []) as Message[]));
  }, [chatId]);

  return (
    <SafeAreaView style={[s.root, { backgroundColor: C.bg }]}>
      <View style={[s.header, { borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <ArrowLeft size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={[s.title, { color: C.text }]}>Media · {media.length}</Text>
      </View>

      <FlatList
        data={media}
        numColumns={3}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <Image source={{ uri: item.media_url! }} style={s.thumb} />
        )}
        ListEmptyComponent={
          <Text style={[s.empty, { color: C.textMuted }]}>No media shared yet</Text>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
            borderBottomWidth: StyleSheet.hairlineWidth },
  back:   { padding: 4 },
  title:  { fontSize: 17, fontWeight: '700' },
  thumb:  { width: SIZE, height: SIZE, margin: 1, backgroundColor: '#1a1228' },
  empty:  { textAlign: 'center', marginTop: 64, fontSize: 15 },
});
