import { useState } from 'react';
import {
  View, TextInput, TouchableOpacity, StyleSheet,
  Platform, Alert, Text, Pressable,
} from 'react-native';
import { Send, Paperclip, Mic, X, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { ColorPalette } from '../lib/colors';
import { Message } from '../types';
import { uploadMedia } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface Props {
  C:              ColorPalette;
  onSend:         (text: string) => void;
  onSendMedia:    (url: string, type: Message['media_type'], caption?: string) => void;
  onTypingStart:  () => void;
  onTypingStop:   () => void;
  replyTo:        Message | null;
  onClearReply:   () => void;
}

export function MessageInput({
  C, onSend, onSendMedia, onTypingStart, onTypingStop, replyTo, onClearReply,
}: Props) {
  const { user }                = useAuthStore();
  const [text, setText]         = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [showAttach, setShowAttach] = useState(false);

  function handleChange(val: string) {
    setText(val);
    val.length > 0 ? onTypingStart() : onTypingStop();
  }

  function handleSend() {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText('');
    onTypingStop();
  }

  async function pickImage() {
    setShowAttach(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'], quality: 0.8,
    });
    if (res.canceled || !res.assets?.[0]) return;
    const a   = res.assets[0];
    const url = await uploadMedia(user!.id, a.fileName ?? 'media', a.uri, a.mimeType ?? 'image/jpeg');
    onSendMedia(url, a.type === 'video' ? 'video' : 'image');
  }

  async function pickDocument() {
    setShowAttach(false);
    const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (res.canceled || !res.assets?.[0]) return;
    const a   = res.assets[0];
    const url = await uploadMedia(user!.id, a.name, a.uri, a.mimeType ?? 'application/octet-stream');
    onSendMedia(url, 'document');
  }

  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
    } catch (e) { Alert.alert('Cannot record', String(e)); }
  }

  async function stopRecording() {
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    if (!uri) return;
    const url = await uploadMedia(user!.id, `voice_${Date.now()}.m4a`, uri, 'audio/m4a');
    onSendMedia(url, 'audio');
  }

  // Web: Enter sends, Shift+Enter adds newline
  const onKeyPress = Platform.OS === 'web'
    ? (e: any) => {
        if (e.nativeEvent.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      }
    : undefined;

  return (
    <View>
      {/* Reply banner */}
      {replyTo && (
        <View style={[s.replyBar, { backgroundColor: C.card, borderLeftColor: C.accent }]}>
          <View style={{ flex: 1 }}>
            <Text style={[s.replyLabel, { color: C.accent }]}>Replying to</Text>
            <Text style={[s.replySnip, { color: C.textSecondary }]} numberOfLines={1}>
              {replyTo.content ?? '📎 Media'}
            </Text>
          </View>
          <TouchableOpacity onPress={onClearReply} style={{ padding: 6 }}>
            <X size={16} color={C.textMuted} />
          </TouchableOpacity>
        </View>
      )}

      <View style={[s.bar, { backgroundColor: C.surface, borderTopColor: C.border }]}>
        <TouchableOpacity style={s.iconBtn} onPress={() => setShowAttach(!showAttach)}>
          <Paperclip size={22} color={showAttach ? C.accent : C.iconDefault} />
        </TouchableOpacity>

        <TextInput
          style={[s.input, { backgroundColor: C.inputBg, color: C.text }]}
          placeholder="Message…"
          placeholderTextColor={C.textMuted}
          value={text}
          onChangeText={handleChange}
          multiline
          maxLength={4000}
          onKeyPress={onKeyPress}
        />

        {text.trim().length === 0 ? (
          <Pressable
            style={[s.iconBtn, recording && s.recording]}
            onLongPress={startRecording}
            onPressOut={stopRecording}
          >
            <Mic size={22} color={recording ? '#ff4d4d' : C.iconDefault} />
          </Pressable>
        ) : (
          <TouchableOpacity
            style={[s.sendBtn, { backgroundColor: C.accent }]}
            onPress={handleSend}
          >
            <Send size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Attach menu */}
      {showAttach && (
        <View style={[s.attachMenu, { backgroundColor: C.card, borderColor: C.border }]}>
          <TouchableOpacity style={s.attachOpt} onPress={pickImage}>
            <Camera size={22} color={C.accent} />
            <Text style={[s.attachLabel, { color: C.text }]}>Photo / Video</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.attachOpt} onPress={pickDocument}>
            <Paperclip size={22} color={C.accent} />
            <Text style={[s.attachLabel, { color: C.text }]}>Document</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  bar:        { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 8,
                paddingVertical: 8, gap: 6, borderTopWidth: StyleSheet.hairlineWidth },
  input:      { flex: 1, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 10,
                fontSize: 15, maxHeight: 120, minHeight: 44 },
  iconBtn:    { padding: 9, alignSelf: 'flex-end' },
  recording:  { backgroundColor: 'rgba(255,77,77,.15)', borderRadius: 20 },
  sendBtn:    { width: 40, height: 40, borderRadius: 20, alignItems: 'center',
                justifyContent: 'center', alignSelf: 'flex-end' },
  replyBar:   { flexDirection: 'row', alignItems: 'center', gap: 10,
                paddingHorizontal: 14, paddingVertical: 8, borderLeftWidth: 3 },
  replyLabel: { fontSize: 11, fontWeight: '700' },
  replySnip:  { fontSize: 13 },
  attachMenu: { borderTopWidth: StyleSheet.hairlineWidth, padding: 12, gap: 4,
                borderWidth: 1, borderRadius: 18, margin: 8, marginTop: 0 },
  attachOpt:  { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 12 },
  attachLabel:{ fontSize: 15 },
});
