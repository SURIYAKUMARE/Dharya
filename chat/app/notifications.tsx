import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { router } from 'expo-router';
import {
  ArrowLeft, Bell, CheckCheck, Trash2,
  Sparkles, MessageSquare, BookOpen, ClipboardList, FileText
} from 'lucide-react-native';
import { useNotificationStore } from '../src/store/notificationStore';
import { useChatStore } from '../src/store/chatStore';
import { Colors } from '../src/lib/colors';
import { getTypeConfig, getRelativeTimeString } from '../src/components/NotificationPanel';
import { AppNotification } from '../src/types';

export default function NotificationsScreen() {
  const { theme } = useChatStore();
  const C = Colors[theme];

  const {
    notifications,
    markAllRead,
    markRead,
    remove,
    notifyNewMessage,
    notifyTeacherMaterial,
    notifyTeacherAssessment,
    notifyAssignment,
  } = useNotificationStore();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [showSim, setShowSim] = useState(false);

  const unreadList = notifications.filter((n) => !n.read);
  const displayList = filter === 'unread' ? unreadList : notifications;

  const handleAction = (item: AppNotification) => {
    markRead(item.id);
    if (item.actionRoute) {
      router.push(item.actionRoute as any);
    }
  };

  return (
    <SafeAreaView style={[s.root, { backgroundColor: C.bg }]} edges={['top', 'bottom'] as any}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={22} color={C.text} />
        </TouchableOpacity>

        <View style={s.headerTitleWrap}>
          <Text style={[s.headerTitle, { color: C.text }]}>Notifications</Text>
          <Text style={[s.headerSub, { color: C.textSecondary }]}>
            {unreadList.length} unread updates
          </Text>
        </View>

        {unreadList.length > 0 && (
          <TouchableOpacity
            style={[s.markAllBtn, { borderColor: C.border }]}
            onPress={markAllRead}
          >
            <CheckCheck size={14} color={C.accent} />
            <Text style={[s.markAllTxt, { color: C.accent }]}>Mark all</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={[s.filterRow, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity
          style={[
            s.filterTab,
            filter === 'all' && { backgroundColor: C.accent + '22', borderColor: C.accent + '55' },
          ]}
          onPress={() => setFilter('all')}
        >
          <Text style={[s.filterTxt, { color: filter === 'all' ? C.accent : C.textSecondary }]}>
            All ({notifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            s.filterTab,
            filter === 'unread' && { backgroundColor: C.accent + '22', borderColor: C.accent + '55' },
          ]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[s.filterTxt, { color: filter === 'unread' ? C.accent : C.textSecondary }]}>
            Unread ({unreadList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            s.simToggle,
            { borderColor: showSim ? C.accent : C.border, backgroundColor: showSim ? C.accent + '15' : 'transparent' },
          ]}
          onPress={() => setShowSim(!showSim)}
        >
          <Sparkles size={12} color={showSim ? C.accent : C.textMuted} />
          <Text style={[s.simToggleTxt, { color: showSim ? C.accent : C.textMuted }]}>
            {showSim ? 'Hide' : 'Test Triggers'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Simulators */}
      {showSim && (
        <View style={[s.simBox, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[s.simTitle, { color: C.textMuted }]}>TRIGGER DEMO NOTIFICATIONS</Text>
          <View style={s.simBtns}>
            <TouchableOpacity
              style={[s.simBtn, { backgroundColor: '#a855f720', borderColor: '#a855f750' }]}
              onPress={() => notifyNewMessage('Arun', 'Hey, let us prepare for the AI assessment!')}
            >
              <MessageSquare size={13} color="#a855f7" />
              <Text style={[s.simBtnTxt, { color: '#a855f7' }]}>+ Message (Arun)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.simBtn, { backgroundColor: '#10b98120', borderColor: '#10b98150' }]}
              onPress={() => notifyTeacherMaterial('Data Structures', 'data-structures')}
            >
              <BookOpen size={13} color="#10b981" />
              <Text style={[s.simBtnTxt, { color: '#10b981' }]}>+ Study Material</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.simBtn, { backgroundColor: '#3b82f620', borderColor: '#3b82f650' }]}
              onPress={() => notifyTeacherAssessment('Engineering Mathematics')}
            >
              <ClipboardList size={13} color="#3b82f6" />
              <Text style={[s.simBtnTxt, { color: '#3b82f6' }]}>+ Assessment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.simBtn, { backgroundColor: '#f59e0b20', borderColor: '#f59e0b50' }]}
              onPress={() => notifyAssignment('Python Programming')}
            >
              <FileText size={13} color="#f59e0b" />
              <Text style={[s.simBtnTxt, { color: '#f59e0b' }]}>+ Assignment</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* List */}
      <ScrollView contentContainerStyle={s.listContainer}>
        {displayList.length === 0 ? (
          <View style={s.emptyState}>
            <Bell size={42} color={C.textMuted} style={{ opacity: 0.4 }} />
            <Text style={[s.emptyTitle, { color: C.text }]}>No notifications</Text>
            <Text style={[s.emptySub, { color: C.textSecondary }]}>
              You are all caught up!
            </Text>
          </View>
        ) : (
          displayList.map((item) => {
            const config = getTypeConfig(item.type);
            const Icon = config.icon;
            const timeStr = getRelativeTimeString(item.timestamp);

            return (
              <View
                key={item.id}
                style={[
                  s.item,
                  {
                    backgroundColor: item.read ? C.surface : C.card,
                    borderColor: item.read ? C.border : config.color + '44',
                    borderLeftWidth: item.read ? 1 : 4,
                    borderLeftColor: item.read ? C.border : config.color,
                  },
                ]}
              >
                <View style={[s.iconBox, { backgroundColor: config.color + '22' }]}>
                  <Icon size={20} color={config.color} />
                </View>
                <View style={s.itemContent}>
                  <View style={s.itemTop}>
                    <Text style={[s.itemTitle, { color: C.text }]}>{item.title}</Text>
                    <Text style={[s.itemTime, { color: C.textMuted }]}>{timeStr}</Text>
                  </View>
                  <Text style={[s.itemMsg, { color: C.textSecondary }]}>{item.message}</Text>

                  <View style={s.itemFooter}>
                    {item.sender && (
                      <Text style={[s.itemSender, { color: C.textMuted }]}>
                        From: {item.sender}
                      </Text>
                    )}
                    <View style={s.itemActions}>
                      {item.actionLabel && (
                        <TouchableOpacity
                          style={[s.actionBtn, { backgroundColor: config.color }]}
                          onPress={() => handleAction(item)}
                        >
                          <Text style={s.actionBtnTxt}>{item.actionLabel}</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={s.deleteBtn}
                        onPress={() => remove(item.id)}
                      >
                        <Trash2 size={13} color={C.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitleWrap: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  headerSub: { fontSize: 12 },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  markAllTxt: { fontSize: 11, fontWeight: '700' },
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
  filterTxt: { fontSize: 12, fontWeight: '700' },
  simToggle: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  simToggleTxt: { fontSize: 11, fontWeight: '700' },
  simBox: { padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 8 },
  simTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  simBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  simBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  simBtnTxt: { fontSize: 11, fontWeight: '700' },
  listContainer: { padding: 16, gap: 10 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  emptySub: { fontSize: 13 },
  item: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemContent: { flex: 1, gap: 5 },
  itemTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemTitle: { fontSize: 14, fontWeight: '800' },
  itemTime: { fontSize: 11 },
  itemMsg: { fontSize: 12, lineHeight: 17 },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    flexWrap: 'wrap',
    gap: 8,
  },
  itemSender: { fontSize: 11, fontWeight: '600' },
  itemActions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 'auto' },
  actionBtn: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  actionBtnTxt: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
  deleteBtn: { padding: 4 },
});
