import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Platform, StatusBar, TextInput, useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Search, ArrowRight, Sparkles, GraduationCap } from 'lucide-react-native';
import { SUBJECTS, Subject } from '../../src/data/studyData';
import { useChatStore } from '../../src/store/chatStore';
import { Colors, ColorPalette } from '../../src/lib/colors';

// ─── Realistic Digital Book Card ───────────────────────────────────────────────
function BookCard({
  subject,
  C,
  cardWidth,
}: {
  subject: Subject;
  C: ColorPalette;
  cardWidth: number | string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <TouchableOpacity
      style={[
        s.card,
        {
          width: cardWidth as any,
          backgroundColor: C.surface,
          borderColor: hovered ? subject.accent : C.border,
          transform: [{ translateY: hovered ? -4 : 0 }],
          shadowColor: hovered ? subject.accent : '#000',
          shadowOpacity: hovered ? 0.25 : 0.08,
        },
      ]}
      onPress={() => router.push(`/study/${subject.id}` as any)}
      activeOpacity={0.88}
      // Web hover events
      {...(Platform.OS === 'web'
        ? {
            onMouseEnter: () => setHovered(true),
            onMouseLeave: () => setHovered(false),
          }
        : {})}
    >
      {/* 3D Realistic Book Spine Effect */}
      <View style={[s.spineContainer, { backgroundColor: subject.accent }]}>
        <View style={s.spineHighlight} />
        <View style={s.spineShadow} />
        <Text style={s.spineText}>{subject.shortTitle.toUpperCase()}</Text>
      </View>

      {/* Book Cover / Front Body */}
      <View style={s.coverBody}>
        {/* Top Header inside book */}
        <View style={s.coverTopRow}>
          <View style={[s.iconBadge, { backgroundColor: subject.accent + '22', borderColor: subject.accent + '44' }]}>
            <Text style={[s.iconText, { color: subject.accent }]}>{subject.icon}</Text>
          </View>
          <View style={[s.chapterBadge, { backgroundColor: subject.accent + '1a', borderColor: subject.accent + '33' }]}>
            <Text style={[s.chapterText, { color: subject.accent }]}>
              {subject.chapters} Chapters
            </Text>
          </View>
        </View>

        {/* Title & Description */}
        <View style={s.textContainer}>
          <Text style={[s.cardTitle, { color: C.text }]} numberOfLines={2}>
            {subject.title}
          </Text>
          <Text style={[s.cardDesc, { color: C.textSecondary }]} numberOfLines={2}>
            {subject.description}
          </Text>
        </View>

        {/* Footer with "Open Book" button */}
        <View style={s.cardFooter}>
          <View style={s.footerTopicsHint}>
            <Text style={[s.topicCountHint, { color: C.textMuted }]}>
              {subject.topics.length} topics • Practice ready
            </Text>
          </View>
          <TouchableOpacity
            style={[s.openBtn, { backgroundColor: subject.accent }]}
            onPress={() => router.push(`/study/${subject.id}` as any)}
            activeOpacity={0.85}
          >
            <BookOpen size={14} color="#ffffff" style={{ marginRight: 5 }} />
            <Text style={s.openBtnTxt}>Open Book</Text>
            <ArrowRight size={13} color="#ffffff" style={{ marginLeft: 3 }} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Study Library Screen ────────────────────────────────────────────────
export default function StudyLibraryScreen() {
  const { theme } = useChatStore();
  const C = Colors[theme];
  const { width } = useWindowDimensions();
  const [search, setSearch] = useState('');

  // Responsive layout calculation:
  // Desktop (>1024px): 3 columns
  // Tablet (640-1024px): 2 columns
  // Mobile (<640px): 1 column (full width)
  const isDesktop = width >= 980;
  const isTablet = width >= 640 && width < 980;
  const cardWidth = isDesktop ? '31.5%' : isTablet ? '48.2%' : '100%';

  const filteredSubjects = SUBJECTS.filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.topics.some((t) => t.name.toLowerCase().includes(q))
    );
  });

  return (
    <SafeAreaView style={[s.root, { backgroundColor: C.bg }]} edges={['top', 'bottom']}>
      {/* Top Navigation Bar */}
      <View style={[s.navBar, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <View style={s.brandRow}>
          <View style={[s.brandIcon, { backgroundColor: C.accent + '22' }]}>
            <GraduationCap size={22} color={C.accent} />
          </View>
          <View>
            <View style={s.brandTitleRow}>
              <Text style={[s.brandName, { color: C.text }]}>StudyChat</Text>
              <View style={[s.proTag, { backgroundColor: C.accent + '25' }]}>
                <Sparkles size={10} color={C.accent} />
                <Text style={[s.proText, { color: C.accent }]}>LIBRARY</Text>
              </View>
            </View>
            <Text style={[s.brandSub, { color: C.textSecondary }]}>Engineering Digital Books</Text>
          </View>
        </View>

        {/* Skip to Login / Continue */}
        <TouchableOpacity
          style={[s.skipBtn, { borderColor: C.accent + '55', backgroundColor: C.accent + '15' }]}
          onPress={() => router.push('/login')}
          activeOpacity={0.8}
        >
          <Text style={[s.skipTxt, { color: C.accent }]}>Login to Chat</Text>
          <ArrowRight size={14} color={C.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={s.hero}>
          <Text style={[s.heroBadge, { color: C.accent, backgroundColor: C.accent + '18' }]}>
            ENGINEERING CURRICULUM
          </Text>
          <Text style={[s.heroTitle, { color: C.text }]}>
            Engineering Study Library
          </Text>
          <Text style={[s.heroSub, { color: C.textSecondary }]}>
            Learn. Practice. Prepare. Master your engineering subjects chapter by chapter.
          </Text>

          {/* Search bar */}
          <View style={[s.searchBox, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Search size={18} color={C.textMuted} style={s.searchIcon} />
            <TextInput
              style={[s.searchInput, { color: C.text }]}
              placeholder="Search subjects, topics (e.g. Matrices, Python, Neural Networks)..."
              placeholderTextColor={C.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} style={s.clearBtn}>
                <Text style={{ color: C.textMuted, fontSize: 13, fontWeight: '700' }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Section Header */}
        <View style={s.sectionHeaderRow}>
          <Text style={[s.sectionTitle, { color: C.textMuted }]}>
            {filteredSubjects.length} {filteredSubjects.length === 1 ? 'SUBJECT' : 'SUBJECTS'} AVAILABLE
          </Text>
          <Text style={[s.sectionDesc, { color: C.textMuted }]}>
            Click any book to explore topics & study material
          </Text>
        </View>

        {/* Grid of Subjects */}
        <View style={s.grid}>
          {filteredSubjects.map((subject) => (
            <BookCard
              key={subject.id}
              subject={subject}
              C={C}
              cardWidth={cardWidth}
            />
          ))}
        </View>

        {/* Bottom Banner */}
        <View style={[s.bottomBanner, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={s.bottomBannerContent}>
            <Text style={[s.bottomBannerTitle, { color: C.text }]}>
              Ready to collaborate and discuss?
            </Text>
            <Text style={[s.bottomBannerSub, { color: C.textSecondary }]}>
              Connect directly with teachers, mentors, and fellow engineering students in real time.
            </Text>
          </View>
          <TouchableOpacity
            style={[s.bottomBannerBtn, { backgroundColor: C.accent }]}
            onPress={() => router.push('/login')}
            activeOpacity={0.85}
          >
            <Text style={s.bottomBannerBtnTxt}>Continue to Chat</Text>
            <ArrowRight size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },

  // Navigation
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  brandTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandName: { fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  proTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  brandSub: { fontSize: 11, marginTop: 1 },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  skipTxt: { fontSize: 13, fontWeight: '700' },

  // Scroll content
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },

  // Hero
  hero: {
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 26,
    marginTop: 6,
  },
  heroBadge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  heroSub: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 580,
    lineHeight: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 580,
    marginTop: 18,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, outlineStyle: 'none' as any },
  clearBtn: { padding: 4 },

  // Section Header
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  sectionDesc: {
    fontSize: 12,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'flex-start',
  },

  // Realistic Digital Book Card
  card: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 4,
  },
  spineContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  spineHighlight: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  spineShadow: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  spineText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    transform: [{ rotate: '-90deg' }],
    width: 140,
    textAlign: 'center',
    opacity: 0.85,
  },
  coverBody: {
    flex: 1,
    padding: 16,
    gap: 10,
    justifyContent: 'space-between',
  },
  coverTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
    fontWeight: '900',
  },
  chapterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  chapterText: {
    fontSize: 11,
    fontWeight: '700',
  },
  textContainer: {
    gap: 4,
    marginTop: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
    marginTop: 4,
    flexWrap: 'wrap',
    gap: 8,
  },
  footerTopicsHint: {
    flex: 1,
  },
  topicCountHint: {
    fontSize: 11,
    fontWeight: '600',
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 13,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  openBtnTxt: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },

  // Bottom Banner
  bottomBanner: {
    marginTop: 34,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  bottomBannerContent: {
    flex: 1,
    minWidth: 260,
    gap: 4,
  },
  bottomBannerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  bottomBannerSub: {
    fontSize: 13,
    lineHeight: 19,
  },
  bottomBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bottomBannerBtnTxt: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
});
