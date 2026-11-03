import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft, Trash2, RotateCcw, AlertTriangle, FileText,
  MessageSquare, Image as ImageIcon,
} from 'lucide-react-native';
import { Colors } from '../src/lib/colors';
import { useChatStore } from '../src/store/chatStore';
import {
  RecycleBinItem, fetchRecycleBinItems, restoreRecycleItem,
  deletePermanently, emptyRecycleBin,
} from '../src/services/recycleBinService';

export default function RecycleBinScreen() {
  const { theme } = useChatStore();
  const C = Colors[theme];

  const [items, setItems] = useState<RecycleBinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'chat' | 'gallery'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    const data = await fetchRecycleBinItems();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleRestore = async (item: RecycleBinItem) => {
    setProcessingId(item.id);
    const ok = await restoreRecycleItem(item.id);
    if (ok) {
      await loadItems();
    } else {
      Alert.alert('Error', 'Could not restore this item.');
    }
    setProcessingId(null);
  };

  const handleDeletePermanently = (item: RecycleBinItem) => {
    Alert.alert(
      'Delete Permanently',
      `Are you sure you want to permanently erase "${item.title || 'this item'}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(item.id);
            await deletePermanently(item.id);
            await loadItems();
            setProcessingId(null);
          },
        },
      ]
    );
  };

  const handleEmptyBin = () => {
    if (items.length === 0) return;
    Alert.alert(
      'Empty Recycle Bin',
      `Permanently delete all ${items.length} items? Everything will be erased forever.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Empty Everything',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            await emptyRecycleBin();
            await loadItems();
            setLoading(false);
          },
        },
      ]
    );
  };

  const filteredItems = items.filter((i) => {
    if (filter === 'all') return true;
    return i.source === filter;
  });

  const renderItem = ({ item }: { item: RecycleBinItem }) => {
    const isBusy = processingId === item.id;
    const dateFormatted = new Date(item.deletedAt).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
        <View style={s.cardBody}>
          {item.mediaUrl ? (
            <Image source={{ uri: item.mediaUrl }} style={s.thumb} />
          ) : (
            <View style={[s.iconPlaceholder, { backgroundColor: C.card, borderColor: C.border }]}>
              {item.source === 'chat' ? (
                <MessageSquare size={20} color={C.accent} />
              ) : (
                <FileText size={20} color={C.textMuted} />
              )}
            </View>
          )}

          <View style={s.meta}>
            <View style={s.titleRow}>
              <Text style={[s.itemTitle, { color: C.text }]} numberOfLines={1}>
                {item.title || (item.source === 'chat' ? 'Chat Message' : 'Shared Photo')}
              </Text>
              <View style={[s.tag, { backgroundColor: C.accent + '20' }]}>
                <Text style={[s.tagTxt, { color: C.accent }]}>{item.source.toUpperCase()}</Text>
              </View>
            </View>

            {item.previewText ? (
              <Text style={[s.previewTxt, { color: C.textSecondary }]} numberOfLines={2}>
                {item.previewText}
              </Text>
            ) : null}

            <Text style={[s.dateTxt, { color: C.textMuted }]}>Deleted {dateFormatted}</Text>
          </View>
        </View>

        <View style={[s.actionsRow, { borderTopColor: C.border }]}>
          <TouchableOpacity
            style={[s.restoreBtn, { backgroundColor: C.card, borderColor: C.border }]}
            onPress={() => handleRestore(item)}
            disabled={isBusy}
          >
            {isBusy ? (
              <ActivityIndicator size="small" color={C.accent} />
            ) : (
              <>
                <RotateCcw size={14} color={C.accent} />
                <Text style={[s.restoreBtnTxt, { color: C.accent }]}>Restore</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={s.deleteBtn}
            onPress={() => handleDeletePermanently(item)}
            disabled={isBusy}
          >
            <Trash2 size={14} color="#ef4444" />
            <Text style={s.deleteBtnTxt}>Delete Forever</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[s.root, { backgroundColor: C.bg }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={22} color={C.text} />
        </TouchableOpacity>

        <View style={s.headerTitleCol}>
          <Text style={[s.headerTitle, { color: C.text }]}>Recycle Bin</Text>
          <Text style={[s.headerSub, { color: C.textSecondary }]}>
            {items.length} {items.length === 1 ? 'item' : 'items'} discarded
          </Text>
        </View>

        {items.length > 0 && (
          <TouchableOpacity
            style={[s.emptyBinBtn, { borderColor: '#ef4444' + '55', backgroundColor: '#ef4444' + '18' }]}
            onPress={handleEmptyBin}
          >
            <Trash2 size={14} color="#ef4444" />
            <Text style={s.emptyBinTxt}>Empty Bin</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={[s.tabs, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        {(['all', 'chat', 'gallery'] as const).map((tab) => {
          const active = filter === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[
                s.tab,
                active && [s.tabActive, { borderBottomColor: C.accent }],
              ]}
              onPress={() => setFilter(tab)}
            >
              <Text
                style={[
                  s.tabTxt,
                  { color: active ? C.accent : C.textMuted },
                  active && { fontWeight: '700' },
                ]}
              >
                {tab === 'all' ? 'All Items' : tab === 'chat' ? 'Chat' : 'Media'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      {loading ? (
        <View style={s.centerLoading}>
          <ActivityIndicator size="large" color={C.accent} />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.emptyContainer}>
              <View style={[s.emptyIconCircle, { backgroundColor: C.surface, borderColor: C.border }]}>
                <Trash2 size={32} color={C.textMuted} />
              </View>
              <Text style={[s.emptyTitle, { color: C.text }]}>Recycle Bin is Empty</Text>
              <Text style={[s.emptyDesc, { color: C.textSecondary }]}>
                Items deleted from the chat or gallery are kept here for safe recovery before permanent deletion.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    marginTop: 1,
  },
  emptyBinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  emptyBinTxt: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    paddingVertical: 12,
    marginRight: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {},
  tabTxt: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardBody: {
    flexDirection: 'row',
    padding: 14,
    gap: 12,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  iconPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagTxt: {
    fontSize: 9,
    fontWeight: '800',
  },
  previewTxt: {
    fontSize: 12,
    lineHeight: 16,
  },
  dateTxt: {
    fontSize: 11,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  restoreBtnTxt: {
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteBtnTxt: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
