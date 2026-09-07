import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Platform, Modal,
} from 'react-native';
import { router } from 'expo-router';
import {
  Bell, MessageSquare, ClipboardList, BookOpen,
  FileText, Megaphone, CheckCheck, Trash2, X,
  ChevronRight, Sparkles, Send, Check
} from 'lucide-react-native';
import { useNotificationStore } from '../store/notificationStore';
import { AppNotification, NotificationType } from '../types';
import { Colors, ColorPalette } from '../lib/colors';

// ─── Format Relative Time ──────────────────────────────────────────────────────
export function getRelativeTimeString(iso: string): string {
  try {
    const diffMs = Date.now() - new Date(iso).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } catch {
    return 'Recently';
  }
}

// ─── Notification Type Meta ───────────────────────────────────────────────────
interface TypeConfig {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  label: string;
}

export function getTypeConfig(type: NotificationType): TypeConfig {
  switch (type) {
    case 'assessment':
      return { icon: ClipboardList, color: '#3b82f6', label: 'Assessment' };
    case 'study_material':
      return { icon: BookOpen, color: '#10b981', label: 'Study Material' };
    case 'message':
      return { icon: MessageSquare, color: '#a855f7', label: 'Chat Message' };
    case 'assignment':
      return { icon: FileText, color: '#f59e0b', label: 'Assignment' };
    case 'announcement':
      return { icon: Megaphone, color: '#ec4899', label: 'Announcement' };
    case 'general':
    default:
      return { icon: Bell, color: '#06b6d4', label: 'Notification' };
  }
}

// ─── Single Notification Row ──────────────────────────────────────────────────
function NotificationItem({
  item,
  C,
  onPressAction,
}: {
  item: AppNotification;
  C: ColorPalette;
  onPressAction: (item: AppNotification) => void;
}) {
  const { markRead, remove } = useNotificationStore();
  const config = getTypeConfig(item.type);
  const IconComponent = config.icon;
  const timeStr = getRelativeTimeString(item.timestamp);

  return (
    <View
      style={[
        ni.itemRow,
        {
          backgroundColor: item.read ? C.surface : C.card,
          borderColor: item.read ? C.border : config.color + '44',
          borderLeftWidth: item.read ? 1 : 4,
          borderLeftColor: item.read ? C.border : config.color,
        },
      ]}
    >
      {/* Type Icon Badge */}
      <View style={[ni.iconWrap, { backgroundColor: config.color + '22' }]}>
        <IconComponent size={20} color={config.color} />
      </View>

      {/* Main Info */}
      <View style={ni.contentWrap}>
        <View style={ni.titleRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
            <Text style={[ni.title, { color: C.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            {!item.read && (
              <View style={[ni.unreadDot, { backgroundColor: config.color }]} />
            )}
          </View>
          <Text style={[ni.timeText, { color: C.textMuted }]}>{timeStr}</Text>
        </View>

        <Text style={[ni.message, { color: C.textSecondary }]}>
          {item.message}
        </Text>

        {/* Sender & Action button */}
        <View style={ni.footerRow}>
          {item.sender && (
            <View style={[ni.senderChip, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Text style={[ni.senderText, { color: C.textMuted }]}>From: {item.sender}</Text>
            </View>
          )}

          <View style={ni.actionsGroup}>
            {/* Primary Action Button e.g. "Study Now" / "View Assessment" */}
            {item.actionLabel && (
              <TouchableOpacity
                style={[ni.actionBtn, { backgroundColor: config.color }]}
                onPress={() => onPressAction(item)}
                activeOpacity={0.85}
              >
                <Text style={ni.actionBtnTxt}>{item.actionLabel}</Text>
                <ChevronRight size={12} color="#ffffff" />
              </TouchableOpacity>
            )}

            {/* Mark as read */}
            {!item.read && (
              <TouchableOpacity
                style={[ni.iconActionBtn, { borderColor: C.border }]}
                onPress={() => markRead(item.id)}
                accessibilityLabel="Mark as read"
              >
                <Check size={14} color={C.textSecondary} />
              </TouchableOpacity>
            )}

            {/* Delete */}
            <TouchableOpacity
              style={[ni.iconActionBtn, { borderColor: C.border }]}
              onPress={() => remove(item.id)}
              accessibilityLabel="Delete notification"
            >
              <Trash2 size={13} color={C.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const ni = StyleSheet.create({
  itemRow: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  contentWrap: {
    flex: 1,
    gap: 5,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  message: {
    fontSize: 12,
    lineHeight: 17,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    flexWrap: 'wrap',
    gap: 8,
  },
  senderChip: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  senderText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 'auto',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  actionBtnTxt: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  iconActionBtn: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─── Notification Panel Component ─────────────────────────────────────────────
interface NotificationPanelProps {
  visible: boolean;
  onClose: () => void;
  C: ColorPalette;
}

export function NotificationPanel({ visible, onClose, C }: NotificationPanelProps) {
  const {
    notifications,
    markAllRead,
    markRead,
    notifyNewMessage,
    notifyTeacherMaterial,
    notifyTeacherAssessment,
    notifyAssignment,
    notifyAnnouncement,
  } = useNotificationStore();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [showSimulators, setShowSimulators] = useState(false);

  if (!visible) return null;

  const unreadList = notifications.filter((n) => !n.read);
  const displayList = filter === 'unread' ? unreadList : notifications;

  const handleAction = (item: AppNotification) => {
    markRead(item.id);
    onClose();
    if (item.actionRoute) {
      router.push(item.actionRoute as any);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={np.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={[np.card, { backgroundColor: C.surface, borderColor: C.border }]}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={[np.header, { borderBottomColor: C.border }]}>
            <View style={np.headerTitleRow}>
              <Bell size={20} color={C.accent} />
              <Text style={[np.headerTitle, { color: C.text }]}>Notifications</Text>
              {unreadList.length > 0 && (
                <View style={[np.badgePill, { backgroundColor: '#ef4444' }]}>
                  <Text style={np.badgePillTxt}>{unreadList.length} new</Text>
                </View>
              )}
            </View>

            <View style={np.headerActions}>
              {unreadList.length > 0 && (
                <TouchableOpacity
                  style={[np.markAllBtn, { borderColor: C.border }]}
                  onPress={markAllRead}
                >
                  <CheckCheck size={14} color={C.accent} />
                  <Text style={[np.markAllTxt, { color: C.accent }]}>Mark all</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={np.closeBtn}>
                <X size={18} color={C.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Filter Pills */}
          <View style={[np.filterRow, { borderBottomColor: C.border }]}>
            <TouchableOpacity
              style={[
                np.filterTab,
                filter === 'all' && { backgroundColor: C.accent + '22', borderColor: C.accent + '55' },
              ]}
              onPress={() => setFilter('all')}
            >
              <Text
                style={[
                  np.filterTxt,
                  { color: filter === 'all' ? C.accent : C.textSecondary },
                ]}
              >
                All ({notifications.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                np.filterTab,
                filter === 'unread' && { backgroundColor: C.accent + '22', borderColor: C.accent + '55' },
              ]}
              onPress={() => setFilter('unread')}
            >
              <Text
                style={[
                  np.filterTxt,
                  { color: filter === 'unread' ? C.accent : C.textSecondary },
                ]}
              >
                Unread ({unreadList.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                np.simToggleBtn,
                { borderColor: showSimulators ? C.accent : C.border, backgroundColor: showSimulators ? C.accent + '15' : 'transparent' },
              ]}
              onPress={() => setShowSimulators(!showSimulators)}
            >
              <Sparkles size={12} color={showSimulators ? C.accent : C.textMuted} />
              <Text style={[np.simToggleTxt, { color: showSimulators ? C.accent : C.textMuted }]}>
                {showSimulators ? 'Hide Simulator' : 'Test Events'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Test Event Simulator Toolbar (User-to-User mock logic) */}
          {showSimulators && (
            <View style={[np.simTray, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[np.simHeading, { color: C.textMuted }]}>
                MOCK NOTIFICATION TRIGGERS (STUDY & CHAT)
              </Text>
              <View style={np.simGrid}>
                <TouchableOpacity
                  style={[np.simBtn, { backgroundColor: '#a855f720', borderColor: '#a855f750' }]}
                  onPress={() => notifyNewMessage('Arun (Student)', 'Hey! Have you solved question 4 from Matrices?')}
                >
                  <MessageSquare size={13} color="#a855f7" />
                  <Text style={[np.simBtnTxt, { color: '#a855f7' }]}>+ Msg from Arun</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[np.simBtn, { backgroundColor: '#10b98120', borderColor: '#10b98150' }]}
                  onPress={() => notifyTeacherMaterial('Data Structures', 'data-structures')}
                >
                  <BookOpen size={13} color="#10b981" />
                  <Text style={[np.simBtnTxt, { color: '#10b981' }]}>+ Teacher: Material</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[np.simBtn, { backgroundColor: '#3b82f620', borderColor: '#3b82f650' }]}
                  onPress={() => notifyTeacherAssessment('Engineering Mathematics')}
                >
                  <ClipboardList size={13} color="#3b82f6" />
                  <Text style={[np.simBtnTxt, { color: '#3b82f6' }]}>+ Teacher: Assessment</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[np.simBtn, { backgroundColor: '#f59e0b20', borderColor: '#f59e0b50' }]}
                  onPress={() => notifyAssignment('Python Programming')}
                >
                  <FileText size={13} color="#f59e0b" />
                  <Text style={[np.simBtnTxt, { color: '#f59e0b' }]}>+ New Assignment</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Notifications Scroll List */}
          <ScrollView style={np.listScroll} showsVerticalScrollIndicator={false}>
            {displayList.length === 0 ? (
              <View style={np.emptyWrap}>
                <Bell size={36} color={C.textMuted} style={{ opacity: 0.5 }} />
                <Text style={[np.emptyTitle, { color: C.text }]}>
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </Text>
                <Text style={[np.emptySub, { color: C.textSecondary }]}>
                  You're all caught up! Use 'Test Events' above to simulate incoming messages or study alerts.
                </Text>
              </View>
            ) : (
              displayList.map((item) => (
                <NotificationItem
                  key={item.id}
                  item={item}
                  C={C}
                  onPressAction={handleAction}
                />
              ))
            )}
            <View style={{ height: 16 }} />
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const np = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'web' ? 56 : 64,
    paddingRight: Platform.OS === 'web' ? 24 : 12,
    paddingLeft: 12,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '82%',
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  badgePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgePillTxt: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  markAllTxt: {
    fontSize: 11,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterTxt: {
    fontSize: 12,
    fontWeight: '700',
  },
  simToggleBtn: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  simToggleTxt: {
    fontSize: 11,
    fontWeight: '700',
  },
  simTray: {
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  simHeading: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  simGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  simBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  simBtnTxt: {
    fontSize: 11,
    fontWeight: '700',
  },
  listScroll: {
    padding: 14,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
