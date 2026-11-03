import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Switch, Alert, Modal, ScrollView,
} from 'react-native';
import {
  LogOut, Moon, Sun, BellOff, Image as ImageIcon,
  X, Trash2, Heart, BookOpen, Shield, ChevronRight,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase, uploadMedia, signOut } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { ColorPalette } from '../lib/colors';
import { router } from 'expo-router';
import { MilestoneCounterModal } from './MilestoneCounterModal';

interface Props {
  visible: boolean;
  onClose: () => void;
  C: ColorPalette;
}

const MUTE_OPTIONS = [
  { label: '1 hour', hours: 1 },
  { label: '8 hours', hours: 8 },
  { label: 'Always', hours: 87600 },
  { label: 'Unmute', hours: 0 },
];

export function SettingsSheet({ visible, onClose, C }: Props) {
  const { user, profile, chatId, partnerId } = useAuthStore();
  const { theme, setTheme, settings, setSettings } = useChatStore();
  const [muteLoading, setMuteLoading] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);

  async function handleMute(hours: number) {
    if (!chatId || !user) return;
    setMuteLoading(true);
    const muted_until = hours === 0
      ? null
      : new Date(Date.now() + hours * 3_600_000).toISOString();
    const { data } = await supabase
      .from('chat_settings')
      .upsert({ chat_id: chatId, user_id: user.id, muted_until })
      .select().single();
    if (data) setSettings(data as any);
    setMuteLoading(false);
  }

  async function changeWallpaper() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], quality: 0.75,
    });
    if (res.canceled || !res.assets?.[0]) return;
    const a = res.assets[0];
    const url = await uploadMedia(user!.id, 'wallpaper.jpg', a.uri, 'image/jpeg');
    const { data } = await supabase
      .from('chat_settings')
      .upsert({ chat_id: chatId!, user_id: user!.id, wallpaper_url: url })
      .select().single();
    if (data) setSettings(data as any);
  }

  async function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out', style: 'destructive', onPress: async () => {
          onClose();
          await signOut();
          router.replace('/auth');
        },
      },
    ]);
  }

  const isMuted = settings?.muted_until && new Date(settings.muted_until) > new Date();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={[s.sheet, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={s.handle} />

          <View style={s.header}>
            <View>
              <Text style={[s.title, { color: C.text }]}>Settings & Space</Text>
              <Text style={[s.sub, { color: C.textSecondary }]}>
                {profile?.display_name || user?.email || 'Dharya'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={22} color={C.iconDefault} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Romantic Milestone Counter */}
            <TouchableOpacity
              style={[s.navCard, { backgroundColor: C.card, borderColor: C.border }]}
              onPress={() => setShowMilestoneModal(true)}
            >
              <View style={[s.iconBox, { backgroundColor: C.accent + '22' }]}>
                <Heart size={18} color={C.accent} fill={C.accent} />
              </View>
              <View style={s.navCardInfo}>
                <Text style={[s.navCardTitle, { color: C.text }]}>Days Together</Text>
                <Text style={[s.navCardSub, { color: C.textSecondary }]}>
                  Milestone date: 20 May 2026, 7:30
                </Text>
              </View>
              <ChevronRight size={18} color={C.textMuted} />
            </TouchableOpacity>

            {/* Recycle Bin navigation */}
            <TouchableOpacity
              style={[s.navCard, { backgroundColor: C.card, borderColor: C.border }]}
              onPress={() => {
                onClose();
                router.push('/recycle-bin');
              }}
            >
              <View style={[s.iconBox, { backgroundColor: '#ef4444' + '22' }]}>
                <Trash2 size={18} color="#ef4444" />
              </View>
              <View style={s.navCardInfo}>
                <Text style={[s.navCardTitle, { color: C.text }]}>Recycle Bin</Text>
                <Text style={[s.navCardSub, { color: C.textSecondary }]}>
                  View and restore deleted messages and photos
                </Text>
              </View>
              <ChevronRight size={18} color={C.textMuted} />
            </TouchableOpacity>

            {/* Engineering Study Library */}
            <TouchableOpacity
              style={[s.navCard, { backgroundColor: C.card, borderColor: C.border }]}
              onPress={() => {
                onClose();
                router.push('/study');
              }}
            >
              <View style={[s.iconBox, { backgroundColor: C.accent + '22' }]}>
                <BookOpen size={18} color={C.accent} />
              </View>
              <View style={s.navCardInfo}>
                <Text style={[s.navCardTitle, { color: C.text }]}>Study Library</Text>
                <Text style={[s.navCardSub, { color: C.textSecondary }]}>
                  Engineering textbooks, syllabus & problem sets
                </Text>
              </View>
              <ChevronRight size={18} color={C.textMuted} />
            </TouchableOpacity>

            <View style={[s.divider, { backgroundColor: C.border }]} />

            {/* Dark mode */}
            <View style={[s.row, { borderBottomColor: C.border }]}>
              {theme === 'dark'
                ? <Moon size={20} color={C.iconDefault} />
                : <Sun size={20} color={C.iconDefault} />}
              <Text style={[s.rowLabel, { color: C.text }]}>Dark theme</Text>
              <Switch
                value={theme === 'dark'}
                onValueChange={(v) => setTheme(v ? 'dark' : 'light')}
                trackColor={{ true: C.accent, false: C.border }}
                thumbColor="#fff"
              />
            </View>

            {/* Wallpaper */}
            <TouchableOpacity
              style={[s.row, { borderBottomColor: C.border }]}
              onPress={changeWallpaper}
            >
              <ImageIcon size={20} color={C.iconDefault} />
              <Text style={[s.rowLabel, { color: C.text }]}>Chat wallpaper</Text>
              {settings?.wallpaper_url && (
                <Text style={{ color: C.accent, fontSize: 12, fontWeight: '700' }}>Custom ✓</Text>
              )}
            </TouchableOpacity>

            {/* Mute */}
            <View style={[s.section, { borderBottomColor: C.border }]}>
              <View style={[s.row, { borderBottomWidth: 0, paddingVertical: 8 }]}>
                <BellOff size={20} color={C.iconDefault} />
                <Text style={[s.rowLabel, { color: C.text }]}>
                  {isMuted
                    ? `Muted until ${new Date(settings!.muted_until!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : 'Mute notifications'}
                </Text>
              </View>
              <View style={s.muteRow}>
                {MUTE_OPTIONS.map((o) => (
                  <TouchableOpacity
                    key={o.label}
                    style={[s.muteBtn, { borderColor: C.border, backgroundColor: C.card }]}
                    onPress={() => handleMute(o.hours)}
                    disabled={muteLoading}
                  >
                    <Text style={{ color: C.text, fontSize: 12, fontWeight: '600' }}>{o.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sign out */}
            <TouchableOpacity style={s.row} onPress={handleSignOut}>
              <LogOut size={20} color="#ff5a5a" />
              <Text style={[s.rowLabel, { color: '#ff5a5a', fontWeight: '700' }]}>Sign out</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Milestone Modal */}
          <MilestoneCounterModal
            visible={showMilestoneModal}
            onClose={() => setShowMilestoneModal(false)}
            C={C}
            partnerName="Sadhana"
          />
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,.6)',
  },
  sheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    maxHeight: '88%',
    borderWidth: 1,
    paddingBottom: 36,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,.25)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: 12,
    marginTop: 2,
  },
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navCardInfo: {
    flex: 1,
    gap: 2,
  },
  navCardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  navCardSub: {
    fontSize: 11,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: {
    fontSize: 15,
    flex: 1,
  },
  section: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 12,
  },
  muteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  muteBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
});
