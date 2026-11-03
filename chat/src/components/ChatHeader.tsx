import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import {
  Search, Image as ImageIcon, MoreVertical, ArrowLeft,
  Bell, BookOpen, Trash2, Heart, Sparkles,
} from 'lucide-react-native';
import { ColorPalette } from '../lib/colors';
import { formatLastSeen } from '../lib/utils';
import { useNotificationStore } from '../store/notificationStore';
import { MilestoneCounterModal, DEFAULT_MILESTONE_DATE_STR } from './MilestoneCounterModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  partnerName: string;
  partnerOnline: boolean;
  partnerLastSeen: string | null;
  partnerTyping: boolean;
  C: ColorPalette;
  onSearchToggle: () => void;
  onGallery: () => void;
  onSettings: () => void;
  onShareMilestoneToChat?: (text: string) => void;
}

export function ChatHeader({
  partnerName,
  partnerOnline,
  partnerLastSeen,
  partnerTyping,
  C,
  onSearchToggle,
  onGallery,
  onSettings,
  onShareMilestoneToChat,
}: Props) {
  const { unreadCount, togglePanel } = useNotificationStore();
  const unread = unreadCount();

  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneDays, setMilestoneDays] = useState<number>(0);

  // Calculate days for the milestone pill
  useEffect(() => {
    const updateCountdown = async () => {
      const savedDate = (await AsyncStorage.getItem('@dharya_milestone_date')) || DEFAULT_MILESTONE_DATE_STR;
      const targetTime = new Date(savedDate).getTime();
      const diffMs = Math.abs(Date.now() - targetTime);
      setMilestoneDays(Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  const statusText = partnerTyping
    ? 'typing…'
    : partnerOnline
    ? 'online'
    : formatLastSeen(partnerLastSeen);

  const statusColor = partnerTyping
    ? C.accent
    : partnerOnline
    ? C.accentGreen
    : C.textMuted;

  return (
    <View style={[s.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
      {/* Partner Avatar */}
      <View style={[s.avatar, { backgroundColor: C.accent + '25', borderColor: C.accent + '44' }]}>
        <Text style={[s.avatarTxt, { color: C.accent }]}>
          {partnerName.charAt(0).toUpperCase() || 'S'}
        </Text>
        {partnerOnline && <View style={[s.onlineDot, { backgroundColor: C.accentGreen }]} />}
      </View>

      {/* Name and Status */}
      <View style={s.mid}>
        <View style={s.nameRow}>
          <Text style={[s.name, { color: C.text }]} numberOfLines={1}>
            {partnerName || 'Dharya'}
          </Text>

          {/* Romantic Milestone Countdown Pill */}
          <TouchableOpacity
            style={[s.milestonePill, { backgroundColor: C.card, borderColor: C.border }]}
            onPress={() => setShowMilestoneModal(true)}
            activeOpacity={0.8}
            accessibilityLabel="View days together counter"
          >
            <Heart size={10} color={C.accent} fill={C.accent} />
            <Text style={[s.milestoneText, { color: C.textSecondary }]}>
              {milestoneDays}d together
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[s.status, { color: statusColor }]} numberOfLines={1}>
          {statusText}
        </Text>
      </View>

      {/* Header Actions */}
      <View style={s.actions}>
        {/* Search in chat */}
        <TouchableOpacity
          onPress={onSearchToggle}
          style={s.iconBtn}
          accessibilityLabel="Search conversation"
        >
          <Search size={18} color={C.iconDefault} />
        </TouchableOpacity>

        {/* Media Gallery */}
        <TouchableOpacity
          onPress={onGallery}
          style={s.iconBtn}
          accessibilityLabel="Shared media gallery"
        >
          <ImageIcon size={18} color={C.iconDefault} />
        </TouchableOpacity>

        {/* Recycle Bin */}
        <TouchableOpacity
          onPress={() => router.push('/recycle-bin')}
          style={s.iconBtn}
          accessibilityLabel="Recycle Bin"
        >
          <Trash2 size={18} color={C.iconDefault} />
        </TouchableOpacity>

        {/* Study Library Link */}
        <TouchableOpacity
          onPress={() => router.push('/study')}
          style={s.iconBtn}
          accessibilityLabel="Engineering Study Library"
        >
          <BookOpen size={18} color={C.iconDefault} />
        </TouchableOpacity>

        {/* Settings */}
        <TouchableOpacity
          onPress={onSettings}
          style={s.iconBtn}
          accessibilityLabel="Settings"
        >
          <MoreVertical size={18} color={C.iconDefault} />
        </TouchableOpacity>
      </View>

      {/* Milestone Modal */}
      <MilestoneCounterModal
        visible={showMilestoneModal}
        onClose={() => setShowMilestoneModal(false)}
        C={C}
        partnerName={partnerName}
        onShareToChat={onShareMilestoneToChat}
      />
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  avatarTxt: {
    fontSize: 16,
    fontWeight: '800',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  mid: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  milestonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  milestoneText: {
    fontSize: 10,
    fontWeight: '700',
  },
  status: {
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  iconBtn: {
    padding: 7,
  },
});
