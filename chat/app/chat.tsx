import { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, FlatList, StyleSheet, Text, TextInput,
  TouchableOpacity, Platform, KeyboardAvoidingView,
  ImageBackground, ActivityIndicator, Modal, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { X, Heart, Sparkles, Trash2, Share2 } from 'lucide-react-native';

import { useAuthStore } from '../src/store/authStore';
import { useChatStore } from '../src/store/chatStore';
import { useMessages } from '../src/hooks/useMessages';
import { usePresence } from '../src/hooks/usePresence';
import { supabase } from '../src/lib/supabase';
import { Colors } from '../src/lib/colors';
import { Message, Profile } from '../src/types';
import { formatDayHeader } from '../src/lib/utils';

import { ChatHeader } from '../src/components/ChatHeader';
import { MessageBubble } from '../src/components/MessageBubble';
import { MessageInput } from '../src/components/MessageInput';
import { SettingsSheet } from '../src/components/SettingsSheet';

export default function ChatScreen() {
  const { session, user, chatId, partnerId } = useAuthStore();
  const {
    messages, theme, settings,
    partnerTyping, partnerOnline, partnerLastSeen,
    replyTo, setReplyTo, setSettings,
    searchQuery, setSearchQuery, searchResults, setSearchResults,
  } = useChatStore();

  const C = Colors[theme];

  const {
    loadMore, sendMessage, sendMedia,
    markRead, editMessage,
    deleteForMe, deleteForEveryone,
    reactToMessage, removeReaction, searchMessages,
  } = useMessages();

  const { onTypingStart, onTypingStop } = usePresence();

  const [partnerProfile, setPartnerProfile] = useState<Profile | null>(null);
  const [showSettings, setShowSettings]     = useState(false);
  const [showSearch, setShowSearch]         = useState(false);
  const [editingMsg, setEditingMsg]         = useState<Message | null>(null);
  const [editText, setEditText]             = useState('');
  const [atBottom, setAtBottom]             = useState(true);
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);

  const listRef     = useRef<FlatList<Message>>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Guards ─────────────────────────────────────────────
  useEffect(() => {
    if (!session) { router.replace('/auth'); return; }
    if (!chatId)  { router.replace('/pair'); return; }
  }, [session, chatId]);

  // ── Load partner profile + settings ──────────────────
  useEffect(() => {
    if (!partnerId || !chatId || !user) return;
    supabase.from('profiles').select('*').eq('id', partnerId).single()
      .then(({ data }) => {
        if (data) {
          setPartnerProfile(data as Profile);
        }
      });
    supabase.from('chat_settings').select('*')
      .eq('chat_id', chatId).eq('user_id', user.id).maybeSingle()
      .then(({ data }) => { if (data) setSettings(data as any); });
  }, [partnerId, chatId, user]);

  // ── Auto scroll ───────────────────────────────────────
  useEffect(() => {
    if (atBottom && messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  // ── Search ────────────────────────────────────────────
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      const res = await searchMessages(searchQuery);
      setSearchResults(res);
    }, 400);
  }, [searchQuery]);

  // ── Handle emoji reaction from bubble ─────────────────
  async function handleReact(msg: Message & { _emojiPick?: string }) {
    if (!msg._emojiPick) return;
    const existing = msg.reactions?.find((r) => r.user_id === user?.id);
    if (existing?.emoji === msg._emojiPick) await removeReaction(msg.id);
    else await reactToMessage(msg.id, msg._emojiPick);
  }

  // ── Commit edit ───────────────────────────────────────
  async function commitEdit() {
    if (!editingMsg || !editText.trim()) return;
    await editMessage(editingMsg.id, editText.trim());
    setEditingMsg(null);
    setEditText('');
  }

  function handleScroll(e: any) {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    setAtBottom(contentSize.height - layoutMeasurement.height - contentOffset.y < 80);
  }

  const partnerDisplayName = partnerProfile?.display_name || 'Sadhana';

  // ── Send milestone text directly to chat ──────────────
  const handleShareMilestone = async (text: string) => {
    await sendMessage(text);
  };

  const displayMessages = showSearch && searchQuery.trim() ? searchResults : messages;

  // ── Message item ──────────────────────────────────────
  const renderItem = useCallback(({ item }: { item: Message }) => (
    <MessageBubble
      message={item}
      isMine={item.sender_id === user?.id}
      theme={theme}
      onReply={setReplyTo}
      onEdit={(msg) => { setEditingMsg(msg); setEditText(msg.content ?? ''); }}
      onDeleteForMe={deleteForMe}
      onDeleteForEveryone={deleteForEveryone}
      onReact={handleReact}
      onMarkRead={markRead}
      partnerName={partnerDisplayName}
    />
  ), [user, theme, partnerDisplayName]);

  // ── Day-change separator ──────────────────────────────
  const ListHeader = useCallback(() => {
    if (messages.length === 0) return null;
    return (
      <View style={s.dayWrap}>
        <Text style={[s.dayTxt, { color: C.textMuted, backgroundColor: C.surface }]}>
          {formatDayHeader(messages[0].created_at)}
        </Text>
      </View>
    );
  }, [messages, C]);

  if (!session || !chatId) {
    return (
      <View style={[s.loading, { backgroundColor: C.bg }]}>
        <ActivityIndicator color={C.accent} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: C.bg }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header with Romantic Milestone Pill & Presences */}
        <ChatHeader
          partnerName={partnerDisplayName}
          partnerOnline={partnerOnline}
          partnerLastSeen={partnerLastSeen}
          partnerTyping={partnerTyping}
          C={C}
          onSearchToggle={() => { setShowSearch(!showSearch); setSearchQuery(''); }}
          onGallery={() => router.push('/media-gallery')}
          onSettings={() => setShowSettings(true)}
          onShareMilestoneToChat={handleShareMilestone}
        />

        {/* Search */}
        {showSearch && (
          <View style={[s.searchBar, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
            <TextInput
              style={[s.searchInput, { color: C.text, backgroundColor: C.inputBg }]}
              placeholder="Search quiet words…"
              placeholderTextColor={C.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity onPress={() => { setShowSearch(false); setSearchQuery(''); }} style={{ padding: 6 }}>
              <X size={18} color={C.iconDefault} />
            </TouchableOpacity>
          </View>
        )}

        {/* Message list */}
        <ImageBackground
          source={settings?.wallpaper_url ? { uri: settings.wallpaper_url } : undefined}
          style={{ flex: 1 }}
          imageStyle={{ opacity: 0.12 }}
        >
          <FlatList<Message>
            ref={listRef}
            data={displayMessages}
            keyExtractor={(m) => m.id}
            renderItem={renderItem}
            ListHeaderComponent={ListHeader}
            contentContainerStyle={{ paddingVertical: 10, paddingBottom: 16 }}
            onScroll={handleScroll}
            scrollEventThrottle={100}
            onEndReached={() => {
              if (messages.length >= 40) loadMore(messages[0].created_at);
            }}
            onEndReachedThreshold={0.15}
            ListEmptyComponent={
              <View style={s.emptyChat}>
                <View style={[s.emptyIcon, { backgroundColor: C.surface, borderColor: C.border }]}>
                  <Heart size={24} color={C.accent} />
                </View>
                <Text style={[s.emptyTitle, { color: C.text }]}>A quiet personal space</Text>
                <Text style={[s.emptySub, { color: C.textSecondary }]}>
                  Messages and photos shared between Surya and {partnerDisplayName} are private.
                </Text>
              </View>
            }
          />

          {/* Typing indicator */}
          {partnerTyping && (
            <View style={[s.typingBubble, { backgroundColor: C.bubbleReceived, borderColor: C.border }]}>
              <Text style={{ color: C.accent, fontSize: 13, fontWeight: '700' }}>
                {partnerDisplayName} is writing…
              </Text>
            </View>
          )}
        </ImageBackground>

        {/* Jump to bottom */}
        {!atBottom && (
          <TouchableOpacity
            style={[s.jumpBtn, { backgroundColor: C.accent }]}
            onPress={() => listRef.current?.scrollToEnd({ animated: true })}
            accessibilityLabel="Scroll to newest messages"
          >
            <Text style={{ color: '#fff', fontSize: 18, lineHeight: 22 }}>↓</Text>
          </TouchableOpacity>
        )}

        {/* Edit bar */}
        {editingMsg && (
          <View style={[s.editBar, { backgroundColor: C.card, borderTopColor: C.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[{ fontSize: 11, color: C.accent, marginBottom: 4, paddingLeft: 2 }]}>
                Editing message
              </Text>
              <TextInput
                style={[s.editInput, { color: C.text, backgroundColor: C.inputBg }]}
                value={editText}
                onChangeText={setEditText}
                autoFocus
                multiline
              />
            </View>
            <TouchableOpacity style={[s.editSave, { backgroundColor: C.accent }]} onPress={commitEdit}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setEditingMsg(null); setEditText(''); }} style={{ padding: 8, alignSelf: 'flex-end' }}>
              <X size={18} color={C.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Input */}
        {!editingMsg && (
          <MessageInput
            C={C}
            onSend={(text) => sendMessage(text, replyTo?.id)}
            onSendMedia={(url, type, caption) => sendMedia(url, type, caption, replyTo?.id)}
            onTypingStart={onTypingStart}
            onTypingStop={onTypingStop}
            replyTo={replyTo}
            onClearReply={() => setReplyTo(null)}
          />
        )}
      </KeyboardAvoidingView>

      {/* Settings Sheet */}
      <SettingsSheet visible={showSettings} onClose={() => setShowSettings(false)} C={C} />

      {/* Fullscreen Media Viewer Modal */}
      {previewMediaUrl && (
        <Modal visible={true} transparent animationType="fade" onRequestClose={() => setPreviewMediaUrl(null)}>
          <View style={s.fullscreenMediaBg}>
            <TouchableOpacity style={s.fullscreenCloseBtn} onPress={() => setPreviewMediaUrl(null)}>
              <X size={24} color="#ffffff" />
            </TouchableOpacity>
            <Image source={{ uri: previewMediaUrl }} style={s.fullscreenMediaImg} resizeMode="contain" />
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dayWrap: { alignItems: 'center', marginVertical: 10 },
  dayTxt: {
    fontSize: 11,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  typingBubble: {
    position: 'absolute',
    bottom: 8,
    left: 14,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  jumpBtn: {
    position: 'absolute',
    bottom: 76,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchInput: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  editBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  editInput: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  editSave: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'flex-end',
  },
  emptyChat: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    paddingHorizontal: 30,
    gap: 10,
  },
  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
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
  fullscreenMediaBg: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  fullscreenMediaImg: {
    width: '100%',
    height: '80%',
  },
});
