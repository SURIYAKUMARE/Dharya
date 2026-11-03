import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, ScrollView, Share,
} from 'react-native';
import { Calendar, Clock, X, Copy, Share2, Check, Sparkles } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorPalette } from '../lib/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
  C: ColorPalette;
  partnerName?: string;
  onShareToChat?: (text: string) => void;
}

export const DEFAULT_MILESTONE_DATE_STR = '2026-05-20T07:30:00';
const STORAGE_KEY = '@dharya_milestone_date';

export function MilestoneCounterModal({
  visible,
  onClose,
  C,
  partnerName = 'Sadhana',
  onShareToChat,
}: Props) {
  const [dateStr, setDateStr] = useState<string>(DEFAULT_MILESTONE_DATE_STR);
  const [isPm, setIsPm] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved) {
        setDateStr(saved);
        setIsPm(saved.includes('19:30'));
      }
    });
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [visible]);

  const targetTime = new Date(dateStr).getTime();
  const diffMs = Math.abs(now - targetTime);

  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  const displayHours = totalHours % 24;
  const displayMinutes = totalMinutes % 60;
  const displaySeconds = totalSeconds % 60;

  const months = Math.floor(totalDays / 30.4375);
  const remainingDays = Math.floor(totalDays % 30.4375);
  const weeks = Math.floor(totalDays / 7);

  const formattedDate = '20 May 2026';
  const formattedTime = isPm ? '07:30 PM (19:30)' : '07:30 AM';

  const toggleAmPm = async () => {
    const nextIsPm = !isPm;
    setIsPm(nextIsPm);
    const newStr = nextIsPm ? '2026-05-20T19:30:00' : '2026-05-20T07:30:00';
    setDateStr(newStr);
    await AsyncStorage.setItem(STORAGE_KEY, newStr);
  };

  const getShareText = () => {
    return `Special Milestone • 20 May 2026, 7:30\nTime Together: ${totalDays} days, ${displayHours}h ${displayMinutes}m ${displaySeconds}s\n(Surya & ${partnerName} • A quiet personal space for two)`;
  };

  const handleSystemShare = async () => {
    try {
      await Share.share({ message: getShareText() });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleSendToChat = () => {
    if (onShareToChat) {
      onShareToChat(getShareText());
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        style={s.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={[s.header, { borderBottomColor: C.border }]}>
            <View style={{ flex: 1 }}>
              <View style={s.pillHeader}>
                <View style={[s.dot, { backgroundColor: C.accent }]} />
                <Text style={[s.subLabel, { color: C.accent }]}>MILESTONE COUNTER</Text>
              </View>
              <Text style={[s.title, { color: C.text }]}>Days Together</Text>
              <Text style={[s.subtitle, { color: C.textSecondary }]}>
                Surya & {partnerName} • 20 May 2026 at 7:30
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <X size={20} color={C.iconDefault} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
            {/* Countdown Grid */}
            <View style={s.grid}>
              <View style={[s.gridItem, s.gridItemPrimary, { backgroundColor: C.accent + '1c', borderColor: C.accent + '44' }]}>
                <Text style={[s.numberPrimary, { color: C.accent }]}>{totalDays}</Text>
                <Text style={[s.label, { color: C.accent }]}>DAYS</Text>
              </View>
              <View style={[s.gridItem, { backgroundColor: C.card, borderColor: C.border }]}>
                <Text style={[s.number, { color: C.text }]}>{String(displayHours).padStart(2, '0')}</Text>
                <Text style={[s.label, { color: C.textMuted }]}>HOURS</Text>
              </View>
              <View style={[s.gridItem, { backgroundColor: C.card, borderColor: C.border }]}>
                <Text style={[s.number, { color: C.text }]}>{String(displayMinutes).padStart(2, '0')}</Text>
                <Text style={[s.label, { color: C.textMuted }]}>MINS</Text>
              </View>
              <View style={[s.gridItem, { backgroundColor: C.card, borderColor: C.border }]}>
                <Text style={[s.number, { color: C.text }]}>{String(displaySeconds).padStart(2, '0')}</Text>
                <Text style={[s.label, { color: C.textMuted }]}>SECS</Text>
              </View>
            </View>

            {/* Details Box */}
            <View style={[s.detailsBox, { backgroundColor: C.card, borderColor: C.border }]}>
              <View style={s.detailRow}>
                <View style={s.detailLeft}>
                  <Calendar size={15} color={C.accent} />
                  <Text style={[s.detailName, { color: C.text }]}>Origin date</Text>
                </View>
                <Text style={[s.detailVal, { color: C.text }]}>{formattedDate}</Text>
              </View>

              <View style={[s.divider, { backgroundColor: C.border }]} />

              <View style={s.detailRow}>
                <View style={s.detailLeft}>
                  <Clock size={15} color={C.accent} />
                  <Text style={[s.detailName, { color: C.text }]}>Origin time</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[s.detailVal, { color: C.text }]}>{formattedTime}</Text>
                  <TouchableOpacity
                    style={[s.amPmBtn, { borderColor: C.border, backgroundColor: C.surface }]}
                    onPress={toggleAmPm}
                  >
                    <Text style={[s.amPmTxt, { color: C.accent }]}>{isPm ? 'Use AM' : 'Use PM'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[s.divider, { backgroundColor: C.border }]} />

              <View style={s.detailRow}>
                <Text style={[s.detailName, { color: C.textSecondary }]}>Calendar breakdown</Text>
                <Text style={[s.detailVal, { color: C.textMuted }]}>
                  {months}m {remainingDays}d ({weeks}w)
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View style={s.actionRow}>
              <TouchableOpacity
                style={[s.actionBtn, { backgroundColor: C.card, borderColor: C.border }]}
                onPress={handleSystemShare}
              >
                {copied ? <Check size={16} color={C.accent} /> : <Copy size={16} color={C.text} />}
                <Text style={[s.actionTxt, { color: C.text }]}>
                  {copied ? 'Shared / Copied' : 'Share / Copy'}
                </Text>
              </TouchableOpacity>

              {onShareToChat && (
                <TouchableOpacity
                  style={[s.actionBtnPrimary, { backgroundColor: C.accent }]}
                  onPress={handleSendToChat}
                >
                  <Share2 size={16} color="#ffffff" />
                  <Text style={s.actionTxtPrimary}>Send to Chat</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  subLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  content: {
    padding: 18,
    gap: 16,
  },
  grid: {
    flexDirection: 'row',
    gap: 8,
  },
  gridItem: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridItemPrimary: {},
  numberPrimary: {
    fontSize: 24,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  number: {
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  label: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  detailsBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailName: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  amPmBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  amPmTxt: {
    fontSize: 10,
    fontWeight: '800',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionTxt: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionTxtPrimary: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
