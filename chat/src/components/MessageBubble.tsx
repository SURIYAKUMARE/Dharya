import { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Pressable, Image, Animated,
} from 'react-native';
import { Pencil, Trash2, Reply, CornerUpLeft, FileText, Mic } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { Message } from '../types';
import { StatusIcon } from './StatusIcon';
import { Colors, ColorPalette } from '../lib/colors';
import { formatMessageTime, canEditMessage } from '../lib/utils';

interface Props {
  message:              Message;
  isMine:               boolean;
  theme:                'dark' | 'light';
  onReply:              (msg: Message) => void;
  onEdit:               (msg: Message) => void;
  onDeleteForMe:        (msg: Message) => void;
  onDeleteForEveryone:  (msg: Message) => void;
  onReact:              (msg: Message & { _emojiPick?: string }) => void;
  onMarkRead:           (id: string) => void;
  partnerName:          string;
}

const EMOJIS = ['❤️','😂','😮','😢','👍','🙏'];

export function MessageBubble({
  message, isMine, theme, onReply, onEdit,
  onDeleteForMe, onDeleteForEveryone, onReact, onMarkRead,
}: Props) {
  const C: ColorPalette  = Colors[theme];
  const [showActions, setShowActions] = useState(false);
  const [showEmojis, setShowEmojis]   = useState(false);
  const [sound, setSound]             = useState<Audio.Sound | null>(null);
  const [playing, setPlaying]         = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const bubbleBg  = isMine ? C.bubbleSent : C.bubbleReceived;
  const textColor = isMine ? '#fff' : C.text;

  // Mark read on render (for received messages not yet read)
  useState(() => {
    if (!isMine && (message.status === 'sent' || message.status === 'delivered')) {
      onMarkRead(message.id);
    }
  });

  function handleLongPress() {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1,    duration: 80, useNativeDriver: true }),
    ]).start();
    setShowActions(true);
  }

  async function toggleAudio() {
    if (!message.media_url) return;
    if (sound) {
      if (playing) { await sound.pauseAsync(); setPlaying(false); }
      else         { await sound.playAsync();  setPlaying(true); }
      return;
    }
    const { sound: s } = await Audio.Sound.createAsync({ uri: message.media_url });
    setSound(s);
    setPlaying(true);
    await s.playAsync();
    s.setOnPlaybackStatusUpdate((st) => {
      if ('didJustFinish' in st && st.didJustFinish) setPlaying(false);
    });
  }

  const reactions = message.reactions ?? [];

  return (
    <View style={[s.row, isMine ? s.rowRight : s.rowLeft]}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onLongPress={handleLongPress}
          onPress={() => showActions && setShowActions(false)}
          delayLongPress={380}
        >
          {/* Reply preview */}
          {message.reply_to_id && message.reply_to && (
            <View style={[s.replyPreview, { borderLeftColor: C.accent },
              isMine ? s.replyRight : s.replyLeft]}>
              <CornerUpLeft size={11} color={C.accent} />
              <Text style={[s.replyTxt, { color: C.textSecondary }]} numberOfLines={1}>
                {message.reply_to.content ?? '📎 Media'}
              </Text>
            </View>
          )}

          <View style={[s.bubble, { backgroundColor: bubbleBg },
            isMine ? s.bubbleRight : s.bubbleLeft]}>

            {/* Image */}
            {message.media_type === 'image' && message.media_url && (
              <Image source={{ uri: message.media_url }} style={s.img} resizeMode="cover" />
            )}

            {/* Video placeholder */}
            {message.media_type === 'video' && message.media_url && (
              <View style={[s.img, { backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ color: '#fff', fontSize: 32 }}>▶</Text>
              </View>
            )}

            {/* Audio */}
            {message.media_type === 'audio' && (
              <TouchableOpacity style={s.audioRow} onPress={toggleAudio}>
                <Mic size={18} color={playing ? C.accent : C.iconDefault} />
                <View style={s.waveform}>
                  {[4,8,12,6,10,14,8,5,9,11,7,12].map((h, i) => (
                    <View key={i} style={[s.wavBar,
                      { height: h * 2, backgroundColor: playing ? C.accent : C.iconDefault }]} />
                  ))}
                </View>
                <Text style={{ color: textColor, fontSize: 12 }}>{playing ? 'Pause' : 'Play'}</Text>
              </TouchableOpacity>
            )}

            {/* Document */}
            {message.media_type === 'document' && message.media_url && (
              <View style={s.docRow}>
                <FileText size={22} color={C.accent} />
                <Text style={[s.docName, { color: textColor }]} numberOfLines={2}>
                  {message.media_url.split('/').pop() ?? 'Document'}
                </Text>
              </View>
            )}

            {/* Text */}
            {message.content ? (
              <Text style={[s.text, { color: textColor }]}>{message.content}</Text>
            ) : null}

            {/* Caption */}
            {message.media_caption ? (
              <Text style={[s.caption, { color: textColor }]}>{message.media_caption}</Text>
            ) : null}

            {/* Footer */}
            <View style={s.footer}>
              {message.edited_at && (
                <Text style={[s.meta, { color: isMine ? 'rgba(255,255,255,.5)' : C.textMuted }]}>edited</Text>
              )}
              <Text style={[s.meta, { color: isMine ? 'rgba(255,255,255,.5)' : C.textMuted }]}>
                {formatMessageTime(message.created_at)}
              </Text>
              {isMine && <StatusIcon status={message.status} theme={theme} size={13} />}
            </View>
          </View>

          {/* Reactions */}
          {reactions.length > 0 && (
            <View style={[s.reactions, isMine && s.reactionsRight]}>
              {reactions.map((r) => (
                <Text key={r.id} style={s.reactionEmoji}>{r.emoji}</Text>
              ))}
            </View>
          )}
        </Pressable>
      </Animated.View>

      {/* Emoji picker */}
      {showEmojis && (
        <View style={[s.emojiPicker, { backgroundColor: C.card, borderColor: C.border },
          isMine ? s.emojiRight : s.emojiLeft]}>
          {EMOJIS.map((e) => (
            <TouchableOpacity key={e} onPress={() => {
              onReact({ ...message, _emojiPick: e } as any);
              setShowEmojis(false);
              setShowActions(false);
            }}>
              <Text style={s.emojiOpt}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Action menu */}
      {showActions && (
        <View style={[s.menu, { backgroundColor: C.card, borderColor: C.border },
          isMine ? s.menuRight : s.menuLeft]}>
          <ActionBtn icon={<Reply size={14} color={C.text} />} label="Reply"
            onPress={() => { onReply(message); setShowActions(false); }} C={C} />
          <ActionBtn icon={<Text style={{ fontSize: 13 }}>😊</Text>} label="React"
            onPress={() => { setShowEmojis(true); setShowActions(false); }} C={C} />
          {isMine && canEditMessage(message.created_at) && (
            <ActionBtn icon={<Pencil size={14} color={C.text} />} label="Edit"
              onPress={() => { onEdit(message); setShowActions(false); }} C={C} />
          )}
          <ActionBtn icon={<Trash2 size={14} color={C.textMuted} />} label="Delete for me"
            onPress={() => { onDeleteForMe(message); setShowActions(false); }} C={C} />
          {isMine && (
            <ActionBtn icon={<Trash2 size={14} color="#ff5a5a" />} label="Delete for all"
              onPress={() => { onDeleteForEveryone(message); setShowActions(false); }} C={C} />
          )}
        </View>
      )}
    </View>
  );
}

function ActionBtn({ icon, label, onPress, C }: {
  icon: React.ReactNode; label: string; onPress: () => void; C: ColorPalette;
}) {
  return (
    <TouchableOpacity style={s.actionBtn} onPress={onPress}>
      {icon}
      <Text style={[s.actionLabel, { color: C.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  row:          { marginVertical: 2, marginHorizontal: 10 },
  rowLeft:      { alignItems: 'flex-start' },
  rowRight:     { alignItems: 'flex-end' },
  bubble:       { maxWidth: '78%', borderRadius: 18, padding: 10, paddingBottom: 6 },
  bubbleLeft:   { borderBottomLeftRadius: 4 },
  bubbleRight:  { borderBottomRightRadius: 4 },
  text:         { fontSize: 15, lineHeight: 22 },
  caption:      { fontSize: 13, marginTop: 4 },
  meta:         { fontSize: 11 },
  footer:       { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, justifyContent: 'flex-end' },
  replyPreview: { flexDirection: 'row', alignItems: 'center', gap: 4,
                   borderLeftWidth: 3, paddingLeft: 8, marginBottom: 4, opacity: 0.75, maxWidth: '78%' },
  replyLeft:    { alignSelf: 'flex-start' },
  replyRight:   { alignSelf: 'flex-end' },
  replyTxt:     { fontSize: 12, flex: 1 },
  img:          { width: 220, height: 160, borderRadius: 12 },
  audioRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 160 },
  waveform:     { flexDirection: 'row', alignItems: 'center', gap: 2, flex: 1 },
  wavBar:       { width: 3, borderRadius: 2 },
  docRow:       { flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 160 },
  docName:      { fontSize: 13, flex: 1 },
  reactions:    { flexDirection: 'row', gap: 2, marginTop: 2, marginLeft: 8 },
  reactionsRight:{ justifyContent: 'flex-end', marginLeft: 0, marginRight: 8 },
  reactionEmoji:{ fontSize: 16 },
  menu:         { position: 'absolute', bottom: '100%', zIndex: 50, borderRadius: 14,
                   borderWidth: 1, padding: 4, minWidth: 150,
                   shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 12,
                   shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  menuLeft:     { left: 0 },
  menuRight:    { right: 0 },
  actionBtn:    { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10 },
  actionLabel:  { fontSize: 14 },
  emojiPicker:  { position: 'absolute', bottom: '100%', zIndex: 51, flexDirection: 'row',
                   gap: 2, padding: 10, borderRadius: 24, borderWidth: 1,
                   shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10,
                   shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  emojiLeft:    { left: 0 },
  emojiRight:   { right: 0 },
  emojiOpt:     { fontSize: 22 },
});
