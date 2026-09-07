import { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, FlatList, StyleSheet, Text, TextInput,
  TouchableOpacity, Platform, KeyboardAvoidingView,
  ImageBackground, ActivityIndicator, Modal, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { X, Check, Users, GraduationCap, Sparkles } from 'lucide-react-native';

import { useAuthStore } from '../src/store/authStore';
import { useChatStore } from '../src/store/chatStore';
import { useNotificationStore } from '../src/store/notificationStore';
import { useMessages } from '../src/hooks/useMessages';
import { usePresence } from '../src/hooks/usePresence';
import { supabase } from '../src/lib/supabase';
import { Colors } from '../src/lib/colors';
import { Message, Profile, ChatContact, UserRole } from '../src/types';
import { formatDayHeader, canEditMessage } from '../src/lib/utils';

import { ChatHeader } from '../src/components/ChatHeader';
import { MessageBubble } from '../src/components/MessageBubble';
import { MessageInput } from '../src/components/MessageInput';
import { SettingsSheet } from '../src/components/SettingsSheet';
import { NotificationPanel } from '../src/components/NotificationPanel';

// ── Multi-role Contacts (Student, Teacher, Admin, Other Student) ───────────────
const AVAILABLE_CONTACTS: ChatContact[] = [
  {
    id: 'contact-dharya',
    name: 'Dharya',
    role: 'Student',
    avatarText: 'D',
    status: 'Enrolled in 3rd Sem CS',
    online: true,
    avatarColor: '#c026d3',
  },
  {
    id: 'contact-teacher',
    name: 'Prof. Ramesh',
    role: 'Teacher',
    avatarText: 'R',
    status: 'Prof of Mathematics & Computing',
    online: true,
    avatarColor: '#3b82f6',
  },
  {
    id: 'contact-admin',
    name: 'Academic Dean Office',
    role: 'Admin',
    avatarText: 'A',
    status: 'Department Coordination',
    online: false,
    avatarColor: '#ec4899',
  },
  {
    id: 'contact-arun',
    name: 'Arun',
    role: 'Other Student',
    avatarText: 'A',
    status: 'Studying Machine Learning',
    online: true,
    avatarColor: '#10b981',
  },
];

export default function ChatScreen() {
  const { session, user, chatId, partnerId } = useAuthStore();
  const {
    messages, theme, settings,
    partnerTyping, partnerOnline, partnerLastSeen,
    replyTo, setReplyTo, setSettings,
    searchQuery, setSearchQuery, searchResults, setSearchResults,
  } = useChatStore();

  const { panelOpen, closePanel, togglePanel, notifyNewMessage, push } = useNotificationStore();

  const C = Colors[theme];

  const {
    loadMore, sendMessage, sendMedia,
    markRead, editMessage,
    deleteForMe, deleteForEveryone,
    reactToMessage, removeReaction, searchMessages,
  } = useMessages();

  const { onTypingStart, onTypingStop } = usePresence();

  const [partnerProfile, setPartnerProfile] = useState<Profile | null>(null);
  const [activeContact, setActiveContact]   = useState<ChatContact>(AVAILABLE_CONTACTS[0]);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [showSettings, setShowSettings]     = useState(false);
  const [showSearch, setShowSearch]         = useState(false);
  const [editingMsg, setEditingMsg]         = useState<Message | null>(null);
  const [editText, setEditText]             = useState('');
  const [atBottom, setAtBottom]             = useState(true);

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
          // If profile exists, sync initial contact name
          setActiveContact((prev) => ({
            ...prev,
            name: (data as Profile).display_name || prev.name,
          }));
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

  // ── Handle Send Message with user-to-user notification ────
  const handleSendMessage = async (text: string) => {
    await sendMessage(text, replyTo?.id);

    // Mock notification flow for demo user-to-user interactions
    // E.g., If user says "Hii", simulate response and notification
    if (activeContact.role === 'Other Student' || activeContact.role === 'Teacher') {
      setTimeout(() => {
        const senderName = activeContact.name;
        notifyNewMessage(senderName, `Received your message: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
      }, 3500);
    }
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
      partnerName={activeContact.name || partnerProfile?.display_name || ''}
    />
  ), [user, theme, partnerProfile, activeContact]);

  // ── Day-change separator ──────────────────────────────
  const ListHeader = useCallback(() => {
    if (messages.length === 0) return null;
    return (
      <View style={s.dayWrap}>
        <Text style={[s.dayTxt, { color: C.textMuted }]}>
          {formatDayHeader(messages[0].created_at)}
        </Text>
      </View>
    );
  }, [messages, C]);

  if (!session || !chatId) {
    return (
      <View style={[s.loading, { backgroundColor: '#0f0a1a' }]}>
        <ActivityIndicator color="#c026d3" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: C.bg }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header with Notification Bell & Role Badge */}
        <ChatHeader
          partnerName={activeContact.name}
          partnerOnline={activeContact.online}
          partnerLastSeen={partnerLastSeen}
          partnerTyping={partnerTyping}
          C={C}
          currentRole={activeContact.role}
          onRoleSwitchToggle={() => setShowContactPicker(true)}
          onSearchToggle={() => { setShowSearch(!showSearch); setSearchQuery(''); }}
          onGallery={() => router.push('/media-gallery')}
          onSettings={() => setShowSettings(true)}
          onNotificationToggle={togglePanel}
        />

        {/* Search */}
        {showSearch && (
          <View style={[s.searchBar, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
            <TextInput
              style={[s.searchInput, { color: C.text, backgroundColor: C.inputBg }]}
              placeholder="Search messages…"
              placeholderTextColor={C.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity onPress={() => { setShowSearch(false); setSearchQuery(''); }}>
              <X size={18} color={C.iconDefault} />
            </TouchableOpacity>
          </View>
        )}

        {/* Message list */}
        <ImageBackground
          source={settings?.wallpaper_url ? { uri: settings.wallpaper_url } : undefined}
          style={{ flex: 1 }}
          imageStyle={{ opacity: 0.15 }}
        >
          <FlatList<Message>
            ref={listRef}
            data={displayMessages}
            keyExtractor={(m) => m.id}
            renderItem={renderItem}
            ListHeaderComponent={ListHeader}
            contentContainerStyle={{ paddingVertical: 8, paddingBottom: 12 }}
            onScroll={handleScroll}
            scrollEventThrottle={100}
            onEndReached={() => {
              if (messages.length >= 40) loadMore(messages[0].created_at);
            }}
            onEndReachedThreshold={0.15}
          />

          {/* Typing indicator */}
          {partnerTyping && (
            <View style={[s.typingBubble, { backgroundColor: C.bubbleReceived }]}>
              <Text style={{ color: C.textSecondary, fontSize: 18, letterSpacing: 4 }}>●●●</Text>
            </View>
          )}
        </ImageBackground>

        {/* Jump to bottom */}
        {!atBottom && (
          <TouchableOpacity
            style={[s.jumpBtn, { backgroundColor: C.accent }]}
            onPress={() => listRef.current?.scrollToEnd({ animated: true })}
          >
            <Text style={{ color: '#fff', fontSize: 20, lineHeight: 24 }}>↓</Text>
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
            onSend={handleSendMessage}
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

      {/* ── Notification Dropdown / Panel ───────────────────────────── */}
      <NotificationPanel visible={panelOpen} onClose={closePanel} C={C} />

      {/* ── Role & Conversation Contact Switcher Modal ───────────────── */}
      <Modal
        visible={showContactPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowContactPicker(false)}
      >
        <TouchableOpacity
          style={s.contactModalOverlay}
          activeOpacity={1}
          onPress={() => setShowContactPicker(false)}
        >
          <TouchableOpacity
            style={[s.contactModalCard, { backgroundColor: C.surface, borderColor: C.border }]}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[s.contactModalHeader, { borderBottomColor: C.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Users size={20} color={C.accent} />
                <Text style={[s.contactModalTitle, { color: C.text }]}>
                  Select Conversation & Role
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowContactPicker(false)} style={{ padding: 4 }}>
                <X size={18} color={C.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 14 }}>
              <Text style={[s.contactSectionHint, { color: C.textMuted }]}>
                Switch conversation context between students, teachers, and admins:
              </Text>

              {AVAILABLE_CONTACTS.map((contact) => {
                const isSelected = activeContact.id === contact.id;
                return (
                  <TouchableOpacity
                    key={contact.id}
                    style={[
                      s.contactRow,
                      {
                        backgroundColor: isSelected ? C.card : 'transparent',
                        borderColor: isSelected ? C.accent : C.border,
                      },
                    ]}
                    onPress={() => {
                      setActiveContact(contact);
                      setShowContactPicker(false);
                    }}
                  >
                    <View style={[s.contactAvatar, { backgroundColor: contact.avatarColor + '25', borderColor: contact.avatarColor }]}>
                      <Text style={[s.contactAvatarTxt, { color: contact.avatarColor }]}>
                        {contact.avatarText}
                      </Text>
                      {contact.online && (
                        <View style={[s.contactOnlineDot, { backgroundColor: '#10b981' }]} />
                      )}
                    </View>

                    <View style={s.contactInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[s.contactName, { color: C.text }]}>{contact.name}</Text>
                        <View style={[s.contactRolePill, { backgroundColor: contact.avatarColor + '20' }]}>
                          <Text style={[s.contactRoleTxt, { color: contact.avatarColor }]}>
                            {contact.role}
                          </Text>
                        </View>
                      </View>
                      <Text style={[s.contactStatus, { color: C.textSecondary }]}>
                        {contact.status}
                      </Text>
                    </View>

                    {isSelected && (
                      <View style={[s.selectedCheck, { backgroundColor: C.accent }]}>
                        <Check size={14} color="#ffffff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1 },
  loading:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dayWrap:     { alignItems: 'center', marginVertical: 10 },
  dayTxt:      { fontSize: 12, paddingHorizontal: 12, paddingVertical: 3,
                  borderRadius: 12, overflow: 'hidden', backgroundColor: 'rgba(0,0,0,.25)' },
  typingBubble:{ position: 'absolute', bottom: 8, left: 14, borderRadius: 16, padding: 10,
                  borderBottomLeftRadius: 4 },
  jumpBtn:     { position: 'absolute', bottom: 76, right: 16, width: 40, height: 40,
                  borderRadius: 20, alignItems: 'center', justifyContent: 'center',
                  elevation: 4, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8,
                  shadowOffset: { width: 0, height: 4 } },
  searchBar:   { flexDirection: 'row', alignItems: 'center', gap: 8,
                  paddingHorizontal: 12, paddingVertical: 8,
                  borderBottomWidth: StyleSheet.hairlineWidth },
  searchInput: { flex: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, fontSize: 14 },
  editBar:     { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 10,
                  borderTopWidth: StyleSheet.hairlineWidth },
  editInput:   { flex: 1, borderRadius: 12, padding: 10, fontSize: 15, maxHeight: 100 },
  editSave:    { padding: 10, borderRadius: 12, alignSelf: 'flex-end' },

  // Contact Picker Modal
  contactModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contactModalCard: {
    width: '100%',
    maxWidth: 460,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 6,
  },
  contactModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  contactModalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  contactSectionHint: {
    fontSize: 12,
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  contactAvatarTxt: {
    fontSize: 16,
    fontWeight: '800',
  },
  contactOnlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  contactInfo: {
    flex: 1,
    gap: 3,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '700',
  },
  contactRolePill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 5,
  },
  contactRoleTxt: {
    fontSize: 10,
    fontWeight: '800',
  },
  contactStatus: {
    fontSize: 12,
  },
  selectedCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
