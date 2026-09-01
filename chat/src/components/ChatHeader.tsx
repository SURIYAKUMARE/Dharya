import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Search, Image as ImageIcon, MoreVertical, ArrowLeft } from 'lucide-react-native';
import { ColorPalette } from '../lib/colors';
import { formatLastSeen } from '../lib/utils';

interface Props {
  partnerName:     string;
  partnerOnline:   boolean;
  partnerLastSeen: string | null;
  partnerTyping:   boolean;
  C:               ColorPalette;
  onSearchToggle:  () => void;
  onGallery:       () => void;
  onSettings:      () => void;
}

export function ChatHeader({
  partnerName, partnerOnline, partnerLastSeen, partnerTyping,
  C, onSearchToggle, onGallery, onSettings,
}: Props) {
  const statusText = partnerTyping ? 'typing…'
    : partnerOnline ? 'online'
    : formatLastSeen(partnerLastSeen);

  const statusColor = partnerTyping ? C.accent
    : partnerOnline ? C.accentGreen
    : C.textMuted;

  return (
    <View style={[s.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
      <TouchableOpacity onPress={() => router.back()} style={s.back} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <ArrowLeft size={22} color={C.text} />
      </TouchableOpacity>

      <View style={[s.avatar, { backgroundColor: C.accent + '33' }]}>
        <Text style={[s.avatarTxt, { color: C.accent }]}>
          {partnerName.charAt(0).toUpperCase() || '?'}
        </Text>
      </View>

      <View style={s.mid}>
        <Text style={[s.name, { color: C.text }]} numberOfLines={1}>{partnerName}</Text>
        <Text style={[s.status, { color: statusColor }]} numberOfLines={1}>{statusText}</Text>
      </View>

      <View style={s.actions}>
        <TouchableOpacity onPress={onSearchToggle} style={s.iconBtn}>
          <Search size={20} color={C.iconDefault} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onGallery} style={s.iconBtn}>
          <ImageIcon size={20} color={C.iconDefault} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onSettings} style={s.iconBtn}>
          <MoreVertical size={20} color={C.iconDefault} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10,
               paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, gap: 10 },
  back:      { padding: 4 },
  avatar:    { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontSize: 17, fontWeight: '700' },
  mid:       { flex: 1, gap: 1 },
  name:      { fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  status:    { fontSize: 12 },
  actions:   { flexDirection: 'row' },
  iconBtn:   { padding: 8 },
});
