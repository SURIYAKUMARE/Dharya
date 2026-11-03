import React, { useEffect, useState, useCallback } from 'react';
import {
  View, FlatList, Image, StyleSheet, Text,
  TouchableOpacity, Dimensions, Modal, ActivityIndicator, Alert, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Trash2, Share2, X, Play, Image as ImageIcon } from 'lucide-react-native';
import { supabase } from '../src/lib/supabase';
import { useAuthStore } from '../src/store/authStore';
import { useChatStore } from '../src/store/chatStore';
import { Colors } from '../src/lib/colors';
import { Message } from '../src/types';
import { moveToRecycleBin } from '../src/services/recycleBinService';

const { width } = Dimensions.get('window');
const SPACING = 2;
const SIZE = (width - SPACING * 4) / 3;

export default function MediaGallery() {
  const { chatId, user } = useAuthStore();
  const { theme } = useChatStore();
  const C = Colors[theme];

  const [media, setMedia] = useState<Message[]>([]);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState<Message | null>(null);

  const loadMedia = useCallback(async () => {
    if (!chatId) return;
    setLoading(true);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .in('media_type', ['image', 'video'])
      .not('media_url', 'is', null)
      .not('deleted_for', 'cs', `{${user?.id ?? ''}}`)
      .order('created_at', { ascending: false });

    setMedia((data ?? []) as Message[]);
    setLoading(false);
  }, [chatId, user]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const handleDeleteMedia = (item: Message) => {
    Alert.alert(
      'Move to Recycle Bin',
      'This photo will be moved to your Recycle Bin. You can recover it or erase it permanently later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Move to Bin',
          style: 'destructive',
          onPress: async () => {
            // 1. Save to Recycle Bin
            await moveToRecycleBin({
              originalId: item.id,
              source: 'gallery',
              title: item.media_caption || `Photo from ${new Date(item.created_at).toLocaleDateString()}`,
              previewText: item.media_caption ?? undefined,
              mediaUrl: item.media_url ?? undefined,
              mediaType: item.media_type as any,
              ownerId: user?.id,
              originalData: item,
            });

            // 2. Hide from user in Supabase
            const ids = [...(item.deleted_for ?? []), user?.id ?? ''];
            await supabase.from('messages').update({ deleted_for: ids }).eq('id', item.id);

            // 3. Remove locally
            setMedia((prev) => prev.filter((m) => m.id !== item.id));
            setActiveItem(null);
          },
        },
      ]
    );
  };

  const handleShareMedia = async (item: Message) => {
    if (!item.media_url) return;
    try {
      await Share.share({ url: item.media_url, message: item.media_caption || 'Shared from Dharya' });
    } catch {}
  };

  const filteredMedia = media.filter((m) => {
    if (filter === 'all') return true;
    return m.media_type === filter;
  });

  return (
    <SafeAreaView style={[s.root, { backgroundColor: C.bg }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={22} color={C.text} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={[s.title, { color: C.text }]}>Shared Media</Text>
          <Text style={[s.subtitle, { color: C.textSecondary }]}>
            {media.length} {media.length === 1 ? 'item' : 'items'} in this conversation
          </Text>
        </View>

        {/* Shortcut to Recycle Bin */}
        <TouchableOpacity
          style={[s.binBtn, { backgroundColor: C.card, borderColor: C.border }]}
          onPress={() => router.push('/recycle-bin')}
          accessibilityLabel="Open Recycle Bin"
        >
          <Trash2 size={16} color={C.iconDefault} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={[s.filterTabs, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        {(['all', 'image', 'video'] as const).map((tab) => {
          const active = filter === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[s.tab, active && [s.tabActive, { borderBottomColor: C.accent }]]}
              onPress={() => setFilter(tab)}
            >
              <Text
                style={[
                  s.tabTxt,
                  { color: active ? C.accent : C.textMuted },
                  active && { fontWeight: '700' },
                ]}
              >
                {tab === 'all' ? 'All Media' : tab === 'image' ? 'Photos' : 'Videos'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Grid */}
      {loading ? (
        <View style={s.loadingBox}>
          <ActivityIndicator size="large" color={C.accent} />
        </View>
      ) : (
        <FlatList
          data={filteredMedia}
          numColumns={3}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              style={s.thumbWrapper}
              onPress={() => setActiveItem(item)}
            >
              <Image source={{ uri: item.media_url! }} style={s.thumb} resizeMode="cover" />
              {item.media_type === 'video' && (
                <View style={s.videoBadge}>
                  <Play size={12} color="#ffffff" fill="#ffffff" />
                </View>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={s.emptyBox}>
              <View style={[s.emptyCircle, { backgroundColor: C.surface, borderColor: C.border }]}>
                <ImageIcon size={30} color={C.textMuted} />
              </View>
              <Text style={[s.emptyTitle, { color: C.text }]}>No Media Shared Yet</Text>
              <Text style={[s.emptySub, { color: C.textSecondary }]}>
                Photos and videos you and your partner send in the chat will appear here.
              </Text>
            </View>
          }
        />
      )}

      {/* Fullscreen Photo/Video Modal */}
      {activeItem && (
        <Modal visible={true} transparent animationType="fade" onRequestClose={() => setActiveItem(null)}>
          <View style={s.modalOverlay}>
            <View style={s.modalTopBar}>
              <TouchableOpacity onPress={() => setActiveItem(null)} style={s.modalBtn}>
                <X size={22} color="#ffffff" />
              </TouchableOpacity>

              <View style={s.modalActions}>
                <TouchableOpacity onPress={() => handleShareMedia(activeItem)} style={s.modalBtn}>
                  <Share2 size={20} color="#ffffff" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleDeleteMedia(activeItem)} style={s.modalBtn}>
                  <Trash2 size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>

            <Image source={{ uri: activeItem.media_url! }} style={s.modalImg} resizeMode="contain" />

            {activeItem.media_caption ? (
              <View style={s.modalCaptionBox}>
                <Text style={s.modalCaptionTxt}>{activeItem.media_caption}</Text>
              </View>
            ) : null}
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  subtitle: { fontSize: 11, marginTop: 1 },
  binBtn: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    paddingVertical: 10,
    marginRight: 18,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {},
  tabTxt: { fontSize: 13, fontWeight: '600' },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbWrapper: {
    width: SIZE,
    height: SIZE,
    margin: SPACING / 2,
    position: 'relative',
  },
  thumb: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  videoBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
    padding: 4,
    borderRadius: 12,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    paddingHorizontal: 30,
    gap: 10,
  },
  emptyCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTopBar: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  modalImg: {
    width: '100%',
    height: '75%',
  },
  modalCaptionBox: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.65)',
    padding: 14,
    borderRadius: 12,
  },
  modalCaptionTxt: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
  },
});
