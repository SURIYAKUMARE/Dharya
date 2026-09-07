import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft, ChevronRight, BookOpen, CheckCircle,
  Clock, Sparkles, X, Award, FileText, HelpCircle
} from 'lucide-react-native';
import { getSubject, Topic, Difficulty } from '../../src/data/studyData';
import { useChatStore } from '../../src/store/chatStore';
import { Colors, ColorPalette } from '../../src/lib/colors';
import { BookEngineeringLogo } from '../../src/components/BookEngineeringLogo';

// ─── difficulty pill ──────────────────────────────────────────────────────────
const DIFF_COLOR: Record<Difficulty, string> = {
  Beginner:     '#10b981',
  Intermediate: '#f59e0b',
  Advanced:     '#ef4444',
};

function DiffPill({ diff }: { diff: Difficulty }) {
  const color = DIFF_COLOR[diff];
  return (
    <View style={[pill.root, { backgroundColor: color + '22', borderColor: color + '44' }]}>
      <Text style={[pill.txt, { color }]}>{diff}</Text>
    </View>
  );
}
const pill = StyleSheet.create({
  root: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 3, borderWidth: 1 },
  txt:  { fontSize: 11, fontWeight: '700' },
});

// ─── topic card ───────────────────────────────────────────────────────────────
function TopicCard({
  topic,
  accent,
  C,
  isStudied,
  onStudy,
}: {
  topic: Topic;
  accent: string;
  C: ColorPalette;
  isStudied: boolean;
  onStudy: (topic: Topic) => void;
}) {
  return (
    <View style={[tc.card, { backgroundColor: C.surface, borderColor: isStudied ? '#10b981' : C.border }]}>
      {/* Topic Number / Check */}
      <View style={[tc.numBox, { backgroundColor: isStudied ? '#10b98122' : accent + '1e' }]}>
        {isStudied ? (
          <CheckCircle size={20} color="#10b981" />
        ) : (
          <Text style={[tc.num, { color: accent }]}>{String(topic.number).padStart(2, '0')}</Text>
        )}
      </View>

      {/* Main Topic Information */}
      <View style={tc.body}>
        <View style={tc.row}>
          <Text style={[tc.name, { color: C.text }]} numberOfLines={1}>{topic.name}</Text>
          <DiffPill diff={topic.difficulty} />
        </View>

        <Text style={[tc.desc, { color: C.textSecondary }]} numberOfLines={2}>
          {topic.description}
        </Text>

        {/* Formula / Key Equation Pill */}
        {topic.formula && (
          <View style={[tc.formulaBox, { backgroundColor: accent + '10', borderColor: accent + '30' }]}>
            <Text style={[tc.formulaLabel, { color: accent }]}>Formula:</Text>
            <Text style={[tc.formulaCode, { color: C.text }]} numberOfLines={1}>{topic.formula}</Text>
          </View>
        )}

        {/* Meta info */}
        {topic.questionsCount && (
          <View style={tc.metaRow}>
            <HelpCircle size={12} color={C.textMuted} />
            <Text style={[tc.metaText, { color: C.textMuted }]}>
              {topic.questionsCount} GATE / University practice questions
            </Text>
          </View>
        )}
      </View>

      {/* Study Button */}
      <TouchableOpacity
        style={[
          tc.studyBtn,
          {
            backgroundColor: isStudied ? '#10b981' : accent,
          },
        ]}
        onPress={() => onStudy(topic)}
        activeOpacity={0.82}
      >
        <Text style={tc.studyTxt}>{isStudied ? 'Reviewed' : 'Study'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const tc = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  numBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  num: {
    fontSize: 15,
    fontWeight: '900',
  },
  body: {
    flex: 1,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  desc: {
    fontSize: 12,
    lineHeight: 18,
  },
  formulaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  formulaLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  formulaCode: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  studyBtn: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
    flexShrink: 0,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  studyTxt: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
});

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function SubjectTopicsScreen() {
  const { subject: slug } = useLocalSearchParams<{ subject: string }>();
  const { theme } = useChatStore();
  const C = Colors[theme];

  const subject = getSubject(slug ?? '');

  // Local study progress tracking
  const [studiedIds, setStudiedIds] = useState<Set<string>>(new Set());
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);

  // Unknown subject guard
  if (!subject) {
    return (
      <SafeAreaView style={[s.root, { backgroundColor: C.bg }]}>
        <View style={s.notFound}>
          <Text style={[s.notFoundTxt, { color: C.textMuted }]}>Subject not found.</Text>
          <TouchableOpacity onPress={() => router.replace('/study')}>
            <Text style={{ color: C.accent, marginTop: 12, fontWeight: '700' }}>← Back to Study Library</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Count by difficulty
  const counts = subject.topics.reduce<Record<Difficulty, number>>(
    (acc, t) => ({ ...acc, [t.difficulty]: (acc[t.difficulty] ?? 0) + 1 }),
    {} as Record<Difficulty, number>
  );

  const toggleStudied = (topicId: string) => {
    setStudiedIds((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  };

  const progressPercent = Math.round((studiedIds.size / subject.topics.length) * 100);

  return (
    <SafeAreaView style={[s.root, { backgroundColor: C.bg }]} edges={['top', 'bottom']}>
      {/* Top Bar with Book & Engineering Logo */}
      <View style={[s.topBar, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <TouchableOpacity
          onPress={() => router.push('/study')}
          style={s.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={20} color={C.text} />
        </TouchableOpacity>

        <View style={s.topBarCenter}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <BookEngineeringLogo size={24} />
            <Text style={[s.topBarTitle, { color: C.text }]} numberOfLines={1}>
              {subject.title}
            </Text>
          </View>
          <Text style={[s.topBarSub, { color: C.textSecondary }]}>
            {studiedIds.size} of {subject.topics.length} topics prepared • By {subject.author}
          </Text>
        </View>

        {/* Quick Next to Login / Chat */}
        <TouchableOpacity
          style={[s.quickNextBtn, { backgroundColor: subject.accent + '22', borderColor: subject.accent + '44' }]}
          onPress={() => router.push('/login')}
        >
          <Text style={[s.quickNextTxt, { color: subject.accent }]}>Next</Text>
          <ChevronRight size={14} color={subject.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero Textbook Banner */}
        <View style={[s.hero, { backgroundColor: subject.accent + '14', borderColor: subject.accent + '33' }]}>
          <View style={[s.heroCoverIcon, { backgroundColor: subject.accent + '28' }]}>
            <Text style={[s.heroIcon, { color: subject.accent }]}>{subject.icon}</Text>
          </View>
          <View style={s.heroInfo}>
            <View style={s.heroBadgeRow}>
              <View style={[s.heroPill, { backgroundColor: subject.accent }]}>
                <Text style={s.heroPillTxt}>{subject.badge}</Text>
              </View>
              <Text style={[s.heroChapters, { color: C.textSecondary }]}>
                {subject.author} • {subject.edition}
              </Text>
            </View>

            <Text style={[s.heroTitle, { color: C.text }]}>{subject.title}</Text>
            <Text style={[s.heroDesc, { color: C.textSecondary }]}>{subject.description}</Text>

            {/* Difficulty breakdown chips */}
            <View style={s.heroStats}>
              {(Object.entries(counts) as [Difficulty, number][]).map(([d, n]) => (
                <View key={d} style={[s.statChip, { backgroundColor: DIFF_COLOR[d] + '22', borderColor: DIFF_COLOR[d] + '44' }]}>
                  <Text style={[s.statTxt, { color: DIFF_COLOR[d] }]}>{n} {d}</Text>
                </View>
              ))}
              <View style={[s.statChip, { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' }]}>
                <Text style={[s.statTxt, { color: C.textMuted }]}>{subject.pages} Pages</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={[s.progressCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={s.progressRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Award size={16} color={subject.accent} />
              <Text style={[s.progressLabel, { color: C.text }]}>Study Preparation</Text>
            </View>
            <Text style={[s.progressPercent, { color: subject.accent }]}>{progressPercent}% Prepared</Text>
          </View>
          <View style={[s.progressBarBg, { backgroundColor: C.border }]}>
            <View style={[s.progressBarFill, { width: `${progressPercent}%`, backgroundColor: subject.accent }]} />
          </View>
        </View>

        {/* Section Header */}
        <View style={s.sectionRow}>
          <Text style={[s.sectionLabel, { color: C.textMuted }]}>
            TEXTBOOK SYLLABUS UNITS ({subject.topics.length})
          </Text>
          <Text style={[s.sectionHint, { color: C.textMuted }]}>
            Click 'Study' on any topic to review key formulas & derivations
          </Text>
        </View>

        {/* Topic Cards */}
        {subject.topics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            accent={subject.accent}
            C={C}
            isStudied={studiedIds.has(topic.id)}
            onStudy={(t) => setActiveTopic(t)}
          />
        ))}

        {/* ── Large Next → Continue to Chat Button ─────────────────────── */}
        <View style={[s.nextSection, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={s.nextTextWrap}>
            <Text style={[s.nextTitle, { color: C.text }]}>
              Finished reviewing {subject.shortTitle} syllabus?
            </Text>
            <Text style={[s.nextHint, { color: C.textSecondary }]}>
              Continue to the chat application to collaborate with teachers, peers, and ask doubts.
            </Text>
          </View>

          <TouchableOpacity
            style={[s.nextBtn, { backgroundColor: subject.accent }]}
            onPress={() => router.push('/login')}
            activeOpacity={0.85}
          >
            <Text style={s.nextBtnTxt}>Next → Continue to Chat</Text>
            <ChevronRight size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Interactive Topic Study Modal ─────────────────────────────── */}
      <Modal
        visible={activeTopic !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveTopic(null)}
      >
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, { backgroundColor: C.surface, borderColor: C.border }]}>
            {activeTopic && (
              <>
                <View style={s.modalHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                    <View style={[s.modalNum, { backgroundColor: subject.accent + '22' }]}>
                      <Text style={[s.modalNumTxt, { color: subject.accent }]}>
                        {String(activeTopic.number).padStart(2, '0')}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.modalTitle, { color: C.text }]}>{activeTopic.name}</Text>
                      <Text style={[s.modalSub, { color: C.textSecondary }]}>{subject.title} • {subject.author}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setActiveTopic(null)} style={s.modalClose}>
                    <X size={20} color={C.textMuted} />
                  </TouchableOpacity>
                </View>

                <View style={s.modalBody}>
                  <View style={[s.modalDescBox, { backgroundColor: C.card, borderColor: C.border }]}>
                    <Text style={[s.modalSectionLabel, { color: C.textMuted }]}>SYLLABUS OVERVIEW</Text>
                    <Text style={[s.modalDesc, { color: C.text }]}>{activeTopic.description}</Text>
                  </View>

                  {/* Highlight Formula if present */}
                  {activeTopic.formula && (
                    <View style={[s.modalFormulaBox, { backgroundColor: subject.accent + '15', borderColor: subject.accent + '40' }]}>
                      <Text style={[s.modalFormulaLabel, { color: subject.accent }]}>KEY FORMULA / EQUATION</Text>
                      <Text style={[s.modalFormulaCode, { color: C.text }]}>{activeTopic.formula}</Text>
                    </View>
                  )}

                  <View style={s.keyTakeaways}>
                    <Text style={[s.modalSectionLabel, { color: C.textMuted }]}>CORE STUDY HIGHLIGHTS</Text>
                    <View style={s.bulletItem}>
                      <Sparkles size={15} color={subject.accent} />
                      <Text style={[s.bulletText, { color: C.textSecondary }]}>
                        Important theorem proofs, core formulas, and engineering derivations.
                      </Text>
                    </View>
                    <View style={s.bulletItem}>
                      <Clock size={15} color={subject.accent} />
                      <Text style={[s.bulletText, { color: C.textSecondary }]}>
                        Recommended study time: 45 - 60 minutes with practice problem sets.
                      </Text>
                    </View>
                    <View style={s.bulletItem}>
                      <BookOpen size={15} color={subject.accent} />
                      <Text style={[s.bulletText, { color: C.textSecondary }]}>
                        {activeTopic.questionsCount ? `${activeTopic.questionsCount} standard exam problems.` : 'Standard university exam problems.'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={s.modalFooter}>
                  <TouchableOpacity
                    style={[
                      s.modalMarkBtn,
                      {
                        backgroundColor: studiedIds.has(activeTopic.id) ? '#10b981' : subject.accent,
                      },
                    ]}
                    onPress={() => {
                      toggleStudied(activeTopic.id);
                    }}
                    activeOpacity={0.85}
                  >
                    <CheckCircle size={16} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={s.modalMarkBtnTxt}>
                      {studiedIds.has(activeTopic.id) ? 'Studied ✓' : 'Mark as Studied'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[s.modalChatBtn, { borderColor: C.border }]}
                    onPress={() => {
                      setActiveTopic(null);
                      router.push('/login');
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.modalChatBtnTxt, { color: C.text }]}>Discuss in Chat →</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundTxt: {
    fontSize: 16,
    fontWeight: '600',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
  },
  topBarCenter: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  topBarSub: {
    fontSize: 11,
    marginTop: 1,
  },
  quickNextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickNextTxt: {
    fontSize: 12,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 18,
    paddingTop: 20,
    maxWidth: 860,
    width: '100%',
    alignSelf: 'center',
  },
  hero: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 18,
    marginBottom: 18,
  },
  heroCoverIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  heroIcon: {
    fontSize: 28,
    fontWeight: '900',
  },
  heroInfo: {
    flex: 1,
    gap: 6,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  heroPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  heroPillTxt: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  heroChapters: {
    fontSize: 12,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  heroDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  statChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  statTxt: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    gap: 10,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 2,
    flexWrap: 'wrap',
    gap: 6,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  sectionHint: {
    fontSize: 11,
  },
  nextSection: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    marginTop: 16,
    gap: 16,
  },
  nextTextWrap: {
    gap: 4,
  },
  nextTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  nextHint: {
    fontSize: 13,
    lineHeight: 19,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  nextBtnTxt: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    gap: 18,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalNum: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalNumTxt: {
    fontSize: 14,
    fontWeight: '900',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 12,
    marginTop: 1,
  },
  modalClose: {
    padding: 4,
  },
  modalBody: {
    gap: 14,
  },
  modalDescBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  modalSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  modalDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
  modalFormulaBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  modalFormulaLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  modalFormulaCode: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  keyTakeaways: {
    gap: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  modalMarkBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  modalMarkBtnTxt: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  modalChatBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalChatBtnTxt: {
    fontSize: 13,
    fontWeight: '700',
  },
});
