import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import {
  Search, Image as ImageIcon, MoreVertical, ArrowLeft,
  Bell, GraduationCap, Users
} from 'lucide-react-native';
import { ColorPalette } from '../lib/colors';
import { formatLastSeen } from '../lib/utils';
import { useNotificationStore } from '../store/notificationStore';
import { UserRole } from '../types';
import { BookEngineeringLogo } from './BookEngineeringLogo';

interface Props {
  partnerName:         string;
  partnerOnline:       boolean;
  partnerLastSeen:     string | null;
  partnerTyping:       boolean;
  C:                   ColorPalette;
  currentRole?:        UserRole;
  onRoleSwitchToggle?: () => void;
  onSearchToggle:      () => void;
  onGallery:           () => void;
  onSettings:          () => void;
  onNotificationToggle?: () => void;
}

export function ChatHeader({
  partnerName,
  partnerOnline,
  partnerLastSeen,
  partnerTyping,
  C,
  currentRole = 'Student',
  onRoleSwitchToggle,
  onSearchToggle,
  onGallery,
  onSettings,
  onNotificationToggle,
}: Props) {
  const { unreadCount, togglePanel } = useNotificationStore();
  const unread = unreadCount();

  // Subtle pulse animation for notification bell when unread > 0
  const bellScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (unread > 0) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(bellScale, {
            toValue: 1.18,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(bellScale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      bellScale.setValue(1);
    }
  }, [unread]);

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

  const handleBellPress = () => {
    if (onNotificationToggle) {
      onNotificationToggle();
    } else {
      togglePanel();
    }
  };

  return (
    <View style={[s.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
      {/* Back to study library */}
      <TouchableOpacity
        onPress={() => router.push('/study')}
        style={s.back}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel="Go to Study Library"
      >
        <ArrowLeft size={20} color={C.text} />
      </TouchableOpacity>

      {/* Avatar */}
      <View style={[s.avatar, { backgroundColor: C.accent + '33', borderColor: C.accent + '55' }]}>
        <Text style={[s.avatarTxt, { color: C.accent }]}>
          {partnerName.charAt(0).toUpperCase() || '?'}
        </Text>
        {partnerOnline && <View style={[s.onlineDot, { backgroundColor: C.accentGreen }]} />}
      </View>

      {/* Name and Status */}
      <View style={s.mid}>
        <View style={s.nameRow}>
          <Text style={[s.name, { color: C.text }]} numberOfLines={1}>
            {partnerName}
          </Text>
          {currentRole && (
            <TouchableOpacity
              style={[s.roleBadge, { backgroundColor: C.accent + '22', borderColor: C.accent + '44' }]}
              onPress={onRoleSwitchToggle}
              activeOpacity={0.7}
            >
              <Text style={[s.roleText, { color: C.accent }]}>{currentRole}</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={[s.status, { color: statusColor }]} numberOfLines={1}>
          {statusText}
        </Text>
      </View>

      {/* Actions */}
      <View style={s.actions}>
        {/* Study Library Quick Link */}
        <TouchableOpacity
          onPress={() => router.push('/study')}
          style={s.iconBtn}
          accessibilityLabel="Engineering Study Library"
        >
          <BookEngineeringLogo size={22} />
        </TouchableOpacity>

        {/* Search */}
        <TouchableOpacity onPress={onSearchToggle} style={s.iconBtn} accessibilityLabel="Search chat">
          <Search size={19} color={C.iconDefault} />
        </TouchableOpacity>

        {/* Role / Conversation Switcher */}
        {onRoleSwitchToggle && (
          <TouchableOpacity
            onPress={onRoleSwitchToggle}
            style={s.iconBtn}
            accessibilityLabel="Switch contacts and roles"
          >
            <Users size={19} color={C.iconDefault} />
          </TouchableOpacity>
        )}

        {/* ── Notification Bell with Red Badge ────────────────────────────── */}
        <TouchableOpacity
          onPress={handleBellPress}
          style={s.bellBtn}
          activeOpacity={0.8}
          accessibilityLabel="Notifications"
        >
          <Animated.View style={{ transform: [{ scale: bellScale }] }}>
            <Bell size={20} color={unread > 0 ? C.accent : C.iconDefault} />
          </Animated.View>
          {unread > 0 && (
            <View style={s.redBadge}>
              <Text style={s.badgeCount}>{unread > 99 ? '99+' : unread}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Gallery */}
        <TouchableOpacity onPress={onGallery} style={s.iconBtn} accessibilityLabel="Media gallery">
          <ImageIcon size={19} color={C.iconDefault} />
        </TouchableOpacity>

        {/* Settings */}
        <TouchableOpacity onPress={onSettings} style={s.iconBtn} accessibilityLabel="Settings">
          <MoreVertical size={19} color={C.iconDefault} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  back: {
    padding: 6,
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
  },
  name: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  status: {
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 7,
  },
  bellBtn: {
    padding: 7,
    position: 'relative',
  },
  redBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: '#ef4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  badgeCount: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
  },
});
