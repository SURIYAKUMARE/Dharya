import React, { useState } from 'react';
import {
  View, TextInput, TouchableOpacity, StyleSheet,
  Platform, Alert, Text, Pressable, Image, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Send, Paperclip, Mic, X, Camera, ImagePlus, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { ColorPalette } from '../lib/colors';
import { Message } from '../types';
import { uploadMedia } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface SelectedMedia {
  id: string;
  uri: string;
  fileName: string;
  mimeType: string;
  type: 'image' | 'video';
}

interface Props {
  C: ColorPalette;
  onSend: (text: string) => void;
  onSendMedia: (url: string, type: Message['media_type'], caption?: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  replyTo: Message | null;
  onClearReply: () => void;
}

export function MessageInput({
  C,
  onSend,
  onSendMedia,
  onTypingStart,
  onTypingStop,
  replyTo,
  onClearReply,
}: Props) {
  const { user } = useAuthStore();
  const [text, setText] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [showAttach, setShowAttach] = useState(false);
  const [pendingMedia, setPendingMedia] = useState<SelectedMedia[]>([]);
  const [uploading, setUploading] = useState(false);

  function handleChange(val: string) {
    setText(val);
    val.length > 0 ? onTypingStart() : onTypingStop();
  }

  // ── Handle Sending Text or Photos ─────────────────────────
  async function handleSend() {
    if (uploading) return;

    // If there are pending media items, upload and send each one
    if (pendingMedia.length > 0) {
      if (!user) {
        Alert.alert('Session error', 'Please log in again to send photos.');
        return;
      }
      setUploading(true);
      const caption = text.trim() || undefined;

      try {
        const uploadPromises = pendingMedia.map(async (item) => {
          const publicUrl = await uploadMedia(
            user.id,
            item.fileName,
            item.uri,
            item.mimeType
          );
          return { publicUrl, type: item.type };
        });

        const results = await Promise.all(uploadPromises);

        // Send all uploaded photos to chat
        results.forEach((res, index) => {
          // Attach caption to the first photo if provided
          const photoCaption = index === 0 ? caption : undefined;
          onSendMedia(res.publicUrl, res.type, photoCaption);
        });

        // Reset state
        setPendingMedia([]);
        setText('');
        onTypingStop();
      } catch (err: any) {
        console.error('[MessageInput] Upload error:', err);
        Alert.alert('Upload failed', 'Some photos could not be uploaded. Please try again.');
      } finally {
        setUploading(false);
      }
      return;
    }

    // Otherwise send text message
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText('');
    onTypingStop();
  }

  // ── Multi-photo Library Picker ────────────────────────────
  async function pickMultiPhotos() {
    setShowAttach(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant photo library access to share pictures.');
      return;
    }

    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: true,
        selectionLimit: 10,
        quality: 0.85,
      });

      if (res.canceled || !res.assets || res.assets.length === 0) return;

      const newItems: SelectedMedia[] = res.assets.map((a, idx) => ({
        id: `media_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
        uri: a.uri,
        fileName: a.fileName ?? `photo_${Date.now()}_${idx}.jpg`,
        mimeType: a.mimeType ?? (a.type === 'video' ? 'video/mp4' : 'image/jpeg'),
        type: a.type === 'video' ? 'video' : 'image',
      }));

      setPendingMedia((prev) => [...prev, ...newItems]);
    } catch (err) {
      console.error('[MessageInput] pickMultiPhotos error:', err);
    }
  }

  // ── Camera Capture ─────────────────────────────────────────
  async function takePhoto() {
    setShowAttach(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to take pictures.');
      return;
    }

    try {
      const res = await ImagePicker.launchCameraAsync({
        quality: 0.85,
      });

      if (res.canceled || !res.assets?.[0]) return;
      const a = res.assets[0];

      const newItem: SelectedMedia = {
        id: `media_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        uri: a.uri,
        fileName: a.fileName ?? `camera_${Date.now()}.jpg`,
        mimeType: a.mimeType ?? 'image/jpeg',
        type: 'image',
      };

      setPendingMedia((prev) => [...prev, newItem]);
    } catch (err) {
      console.error('[MessageInput] takePhoto error:', err);
    }
  }

  // ── Document Picker ───────────────────────────────────────
  async function pickDocument() {
    setShowAttach(false);
    try {
      const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (res.canceled || !res.assets?.[0]) return;
      const a = res.assets[0];
      if (!user) return;

      setUploading(true);
      const url = await uploadMedia(
        user.id,
        a.name,
        a.uri,
        a.mimeType ?? 'application/octet-stream'
      );
      onSendMedia(url, 'document', a.name);
    } catch (err) {
      console.error('[MessageInput] pickDocument error:', err);
    } finally {
      setUploading(false);
    }
  }

  // ── Remove single pending photo before sending ────────────
  function removePendingPhoto(id: string) {
    setPendingMedia((prev) => prev.filter((m) => m.id !== id));
  }

  // ── Audio Recording ───────────────────────────────────────
  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
    } catch (e) {
      Alert.alert('Cannot record', String(e));
    }
  }

  async function stopRecording() {
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    if (!uri || !user) return;

    try {
      setUploading(true);
      const url = await uploadMedia(user.id, `voice_${Date.now()}.m4a`, uri, 'audio/m4a');
      onSendMedia(url, 'audio');
    } finally {
      setUploading(false);
    }
  }

  // Web keyboard: Enter sends, Shift+Enter adds newline
  const onKeyPress = Platform.OS === 'web'
    ? (e: any) => {
        if (e.nativeEvent.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      }
    : undefined;

  const canSend = text.trim().length > 0 || pendingMedia.length > 0;

  return (
    <View style={s.container}>
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

      {/* Multi-photo Preview Strip before sending */}
      {pendingMedia.length > 0 && (
        <View style={[s.previewStrip, { backgroundColor: C.surface, borderTopColor: C.border }]}>
          <View style={s.previewStripHeader}>
            <Text style={[s.previewStripCount, { color: C.textSecondary }]}>
              {pendingMedia.length} {pendingMedia.length === 1 ? 'photo' : 'photos'} ready to send
            </Text>
            <TouchableOpacity
              onPress={() => setPendingMedia([])}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[s.previewClearAll, { color: C.textMuted }]}>Clear all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.previewList}>
            {pendingMedia.map((item) => (
              <View key={item.id} style={s.previewCard}>
                <Image source={{ uri: item.uri }} style={s.previewThumb} />
                <TouchableOpacity
                  style={s.removeBtn}
                  onPress={() => removePendingPhoto(item.id)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <X size={12} color="#ffffff" />
                </TouchableOpacity>
                {item.type === 'video' && (
                  <View style={s.videoTag}>
                    <Text style={s.videoTagTxt}>VID</Text>
                  </View>
                )}
              </View>
            ))}

            {/* Add more button */}
            <TouchableOpacity
              style={[s.addMoreBtn, { borderColor: C.border, backgroundColor: C.card }]}
              onPress={pickMultiPhotos}
            >
              <ImagePlus size={20} color={C.accent} />
              <Text style={[s.addMoreTxt, { color: C.accent }]}>+ Add</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Main input bar */}
      <View style={[s.bar, { backgroundColor: C.surface, borderTopColor: C.border }]}>
        <TouchableOpacity
          style={s.iconBtn}
          onPress={() => setShowAttach(!showAttach)}
          accessibilityLabel="Attach files or photos"
        >
          <Paperclip size={21} color={showAttach ? C.accent : C.iconDefault} />
        </TouchableOpacity>

        <TextInput
          style={[s.input, { backgroundColor: C.inputBg, color: C.text }]}
          placeholder={pendingMedia.length > 0 ? 'Add a caption…' : 'A quiet word…'}
          placeholderTextColor={C.textMuted}
          value={text}
          onChangeText={handleChange}
          multiline
          maxLength={4000}
          onKeyPress={onKeyPress}
          editable={!uploading}
        />

        {uploading ? (
          <View style={s.uploadingBox}>
            <ActivityIndicator size="small" color={C.accent} />
          </View>
        ) : !canSend ? (
          <Pressable
            style={[s.iconBtn, recording && s.recording]}
            onLongPress={startRecording}
            onPressOut={stopRecording}
            accessibilityLabel="Record voice message"
          >
            <Mic size={21} color={recording ? '#ff4d4d' : C.iconDefault} />
          </Pressable>
        ) : (
          <TouchableOpacity
            style={[s.sendBtn, { backgroundColor: C.accent }]}
            onPress={handleSend}
            accessibilityLabel="Send message"
          >
            <Send size={18} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Attachment popover menu */}
      {showAttach && (
        <View style={[s.attachMenu, { backgroundColor: C.card, borderColor: C.border }]}>
          <TouchableOpacity style={s.attachOpt} onPress={pickMultiPhotos}>
            <ImagePlus size={20} color={C.accent} />
            <Text style={[s.attachLabel, { color: C.text }]}>Photos & Videos (Multiple)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.attachOpt} onPress={takePhoto}>
            <Camera size={20} color={C.accent} />
            <Text style={[s.attachLabel, { color: C.text }]}>Take Photo with Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.attachOpt} onPress={pickDocument}>
            <Paperclip size={20} color={C.accent} />
            <Text style={[s.attachLabel, { color: C.text }]}>Send Document</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    width: '100%',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 120,
    minHeight: 44,
  },
  iconBtn: {
    padding: 9,
    alignSelf: 'flex-end',
  },
  recording: {
    backgroundColor: 'rgba(255,77,77,.15)',
    borderRadius: 20,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  uploadingBox: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderLeftWidth: 3,
  },
  replyLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  replySnip: {
    fontSize: 13,
  },
  previewStrip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  previewStripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  previewStripCount: {
    fontSize: 12,
    fontWeight: '700',
  },
  previewClearAll: {
    fontSize: 11,
    fontWeight: '600',
  },
  previewList: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  previewCard: {
    position: 'relative',
    width: 68,
    height: 68,
    borderRadius: 10,
    overflow: 'hidden',
  },
  previewThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoTag: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  videoTagTxt: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '900',
  },
  addMoreBtn: {
    width: 68,
    height: 68,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  addMoreTxt: {
    fontSize: 11,
    fontWeight: '800',
  },
  attachMenu: {
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 8,
    gap: 2,
    borderWidth: 1,
    borderRadius: 16,
    marginHorizontal: 10,
    marginBottom: 8,
  },
  attachOpt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 10,
  },
  attachLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
