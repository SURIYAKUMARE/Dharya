import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Switch, Alert, Modal, ScrollView,
} from 'react-native';
import { LogOut, Moon, Sun, BellOff, Image as ImageIcon, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase, uploadMedia, signOut } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { ColorPalette } from '../lib/colors';
import { router } from 'expo-router';

interface Props {
  visible:  boolean;
  onClose:  () => void;
  C:        ColorPalette;
}

const MUTE_OPTIONS = [
  { label: '1 hour',  hours: 1 },
  { label: '8 hours', hours: 8 },
  { label: 'Always',  hours: 87600 },
  { label: 'Unmute',  hours: 0 },
];

export function SettingsSheet({ visible, onClose, C }: Props) {
  const { user, chatId } = useAuthStore();
  const { theme, setTheme, settings, setSettings } = useChatStore();
  const [muteLoading, setMuteLoading] = useState(false);

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
      mediaTypes: ['images'], quality: 0.7,
    });
    if (res.canceled || !res.assets?.[0]) return;
    const a   = res.assets[0];
    const url = await uploadMedia(user!.id, 'wallpaper.jpg', a.uri, 'image/jpeg');
    const { data } = await supabase
      .from('chat_settings')
      .upsert({ chat_id: chatId!, user_id: user!.id, wallpaper_url: url })
      .select().single();
    if (data) setSettings(data as any);
  }

  async function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure?', [
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
            <Text style={[s.title, { color: C.text }]}>Settings</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={22} color={C.iconDefault} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Dark mode */}
            <View style={[s.row, { borderBottomColor: C.border }]}>
              {theme === 'dark'
                ? <Moon size={20} color={C.iconDefault} />
                : <Sun  size={20} color={C.iconDefault} />}
              <Text style={[s.rowLabel, { color: C.text }]}>Dark mode</Text>
              <Switch
                value={theme === 'dark'}
                onValueChange={(v) => setTheme(v ? 'dark' : 'light')}
                trackColor={{ true: C.accent }}
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
                <Text style={{ color: C.textMuted, fontSize: 12 }}>Custom ✓</Text>
              )}
            </TouchableOpacity>

            {/* Mute */}
            <View style={[s.section, { borderBottomColor: C.border }]}>
              <View style={[s.row, { borderBottomWidth: 0 }]}>
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
                    style={[s.muteBtn, { borderColor: C.border }]}
                    onPress={() => handleMute(o.hours)}
                    disabled={muteLoading}
                  >
                    <Text style={{ color: C.text, fontSize: 12 }}>{o.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sign out */}
            <TouchableOpacity style={s.row} onPress={handleSignOut}>
              <LogOut size={20} color="#ff5a5a" />
              <Text style={[s.rowLabel, { color: '#ff5a5a' }]}>Sign out</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay:  { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,.55)' },
  sheet:    { borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20,
              maxHeight: '80%', borderWidth: 1, paddingBottom: 36 },
  handle:   { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,.2)',
              alignSelf: 'center', marginBottom: 16 },
  header:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title:    { fontSize: 18, fontWeight: '800' },
  row:      { flexDirection: 'row', alignItems: 'center', gap: 14,
              paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  rowLabel: { fontSize: 15, flex: 1 },
  section:  { borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: 12 },
  muteRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  muteBtn:  { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
});
