import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Platform, StatusBar, TextInput, useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Search, ArrowRight, Sparkles, Star, Layers } from 'lucide-react-native';
import { SUBJECTS, Subject } from '../../src/data/studyData';
import { useChatStore } from '../../src/store/chatStore';
import { Colors, ColorPalette } from '../../src/lib/colors';
import { BookEngineeringLogo } from '../../src/components/BookEngineeringLogo';

// ─── Realistic Engineering Textbook Card ───────────────────────────────────────────
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
          transform: [{ translateY: hovered ? -6 : 0 }],
          shadowColor: hovered ? subject.accent : '#000',
          shadowOpacity: hovered ? 0.35 : 0.12,
          shadowRadius: hovered ? 20 : 10,
        },
      ]}
      onPress={() => router.push(`/study/${subject.id}` as any)}
      activeOpacity={0.88}
      {...(Platform.OS === 'web'
        ? {
            onMouseEnter: () => setHovered(true),
            onMouseLeave: () => setHovered(false),
          }
        : {})}
    >
      {/* 3D Bound Book Spine on Left */}
      <View style={[s.spineContainer, { backgroundColor: subject.accent }]}>
        <View style={s.spineHighlight} />
        <View style={s.spineRibTop} />
        <View style={s.spineRibMid} />
        <View style={s.spineRibBot} />
        <View style={s.spineShadow} />
        <Text style={s.spineText} numberOfLines={1}>{subject.shortTitle.toUpperCase()}</Text>
      </View>

      {/* Front Textbook Cover */}
      <View style={s.coverBody}>
        {/* Top Header with Edition Badge */}
        <View style={s.coverTopRow}>
          <View style={[s.badgePill, { backgroundColor: subject.accent + '22', borderColor: subject.accent + '55' }]}>
            <Sparkles size={11} color={subject.accent} style={{ marginRight: 4 }} />
            <Text style={[s.badgeText, { color: subject.accent }]}>{subject.badge}</Text>
          </View>
          <View style={s.ratingRow}>
            <Star size={12} color="#fbbf24" fill="#fbbf24" style={{ marginRight: 3 }} />
            <Text style={[s.ratingText, { color: C.text }]}>{subject.rating}</Text>
          </View>
        </View>

        {/* Center Title & Technical Schematic Graphic */}
        <View style={s.centerContent}>
          <View style={s.titleRow}>
            <View style={[s.iconEmblem, { backgroundColor: subject.accent + '1a', borderColor: subject.accent + '44' }]}>
              <Text style={[s.iconText, { color: subject.accent }]}>{subject.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.cardTitle, { color: C.text }]} numberOfLines={2}>
                {subject.title}
              </Text>
              <Text style={[s.authorByline, { color: subject.accent }]}>
                {subject.author}
              </Text>
            </View>
          </View>

          <Text style={[s.cardDesc, { color: C.textSecondary }]} numberOfLines={2}>
            {subject.description}
          </Text>
        </View>

        {/* Edition & Specification Bar */}
        <View style={[s.editionBar, { backgroundColor: subject.accent + '0d', borderColor: subject.accent + '25' }]}>
          <View style={s.specItem}>
            <Layers size={12} color={C.textMuted} style={{ marginRight: 4 }} />
            <Text style={[s.specText, { color: C.textMuted }]}>{subject.topics.length} Syllabus Units</Text>
          </View>
          <View style={s.specDivider} />
          <View style={s.specItem}>
            <Text style={[s.specText, { color: C.textMuted }]}>{subject.pages} Pages</Text>
          </View>
        </View>

        {/* Footer with "Open Book" action */}
        <View style={s.cardFooter}>
          <Text style={[s.editionLabel, { color: C.textMuted }]} numberOfLines={1}>
            {subject.edition}
          </Text>
          <TouchableOpacity
            style={[s.openBtn, { backgroundColor: subject.accent }]}
            onPress={() => router.push(`/study/${subject.id}` as any)}
            activeOpacity={0.85}
          >
            <BookOpen size={13} color="#ffffff" style={{ marginRight: 5 }} />
            <Text style={s.openBtnTxt}>Open Book</Text>
            <ArrowRight size={13} color="#ffffff" style={{ marginLeft: 3 }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Right Edge: Realistic Stacked Paper Pages */}
      <View style={s.paperEdgeContainer}>
        <View style={s.paperPage1} />
        <View style={s.paperPage2} />
        <View style={s.paperPage3} />
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
      s.author.toLowerCase().includes(q) ||
      s.topics.some((t) => t.name.toLowerCase().includes(q))
    );
  });

  return (
    <SafeAreaView style={[s.root, { backgroundColor: C.bg }]} edges={['top', 'bottom']}>
      {/* Top Navigation Bar with Custom Book & Engineering Gear Logo */}
      <View style={[s.navBar, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <View style={s.brandRow}>
          <BookEngineeringLogo size={42} />
          <View style={{ marginLeft: 10 }}>
            <View style={s.brandTitleRow}>
              <Text style={[s.brandName, { color: C.text }]}>StudyChat</Text>
              <View style={[s.proTag, { backgroundColor: C.accent + '25' }]}>
                <Sparkles size={10} color={C.accent} />
                <Text style={[s.proText, { color: C.accent }]}>ENGINEERING</Text>
              </View>
            </View>
            <Text style={[s.brandSub, { color: C.textSecondary }]}>Digital Textbook Library</Text>
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
          <View style={s.heroLogoBadge}>
            <BookEngineeringLogo size={32} />
            <Text style={[s.heroBadge, { color: C.accent }]}>
              ENGINEERING CURRICULUM • GATE & AICTE STANDARD
            </Text>
          </View>

          <Text style={[s.heroTitle, { color: C.text }]}>
            Engineering Study Library
          </Text>
          <Text style={[s.heroSub, { color: C.textSecondary }]}>
            Learn. Practice. Prepare. Master textbook chapters, theorems, and practice problem sets.
          </Text>

          {/* Search bar */}
          <View style={[s.searchBox, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Search size={18} color={C.textMuted} style={s.searchIcon} />
            <TextInput
              style={[s.searchInput, { color: C.text }]}
              placeholder="Search textbooks, authors, topics (e.g. Khurmi, Grewal, Matrices, Thermodynamics)..."
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

        {/* Section Header with Bookshelf styling */}
        <View style={s.sectionHeaderRow}>
          <View style={s.sectionHeaderLeft}>
            <Text style={[s.sectionTitle, { color: C.text }]}>
              {filteredSubjects.length} {filteredSubjects.length === 1 ? 'TEXTBOOK' : 'TEXTBOOKS'} AVAILABLE
            </Text>
            <Text style={[s.sectionDesc, { color: C.textMuted }]}>
              Standard University Editions with Comprehensive Syllabus Units
            </Text>
          </View>
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
              Connect directly with professors, peers, and study groups in real-time chat.
            </Text>
          </View>
          <TouchableOpacity
            style={[s.bottomBannerBtn, { backgroundColor: C.accent }]}
            onPress={() => router.push('/login')}
            activeOpacity={0.85}
          >
            <Text style={s.bottomBannerBtnTxt}>Next: Continue to Chat</Text>
            <ArrowRight size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  proTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  proText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  brandSub: {
    fontSize: 11,
    marginTop: 1,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  skipTxt: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },
  hero: {
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 32,
  },
  heroLogoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(99,102,241,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.25)',
    marginBottom: 12,
  },
  heroBadge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.8,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 15,
    textAlign: 'center',
    maxWidth: 580,
    lineHeight: 22,
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 640,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
  },
  clearBtn: {
    padding: 4,
  },
  sectionHeaderRow: {
    marginBottom: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  sectionHeaderLeft: {
    gap: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  sectionDesc: {
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    justifyContent: 'flex-start',
  },

  // 3D Realistic Engineering Textbook Card
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 6,
    minHeight: 220,
  },
  spineContainer: {
    width: 26,
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
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  spineRibTop: {
    position: 'absolute',
    top: 24,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  spineRibMid: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  spineRibBot: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  spineShadow: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  spineText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    transform: [{ rotate: '-90deg' }],
    width: 170,
    textAlign: 'center',
    opacity: 0.9,
  },
  coverBody: {
    flex: 1,
    padding: 16,
    gap: 8,
    justifyContent: 'space-between',
  },
  coverTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
  },
  centerContent: {
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconEmblem: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
    fontWeight: '900',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  authorByline: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  editionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  specText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
    gap: 6,
  },
  editionLabel: {
    fontSize: 10,
    fontWeight: '600',
    flex: 1,
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  openBtnTxt: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 11,
  },

  // Right Edge: Realistic Stacked Paper Pages
  paperEdgeContainer: {
    width: 8,
    backgroundColor: '#1a1329',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paperPage1: {
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  paperPage2: {
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  paperPage3: {
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  // Bottom Banner
  bottomBanner: {
    marginTop: 34,
    borderRadius: 18,
    borderWidth: 1,
    padding: 22,
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bottomBannerBtnTxt: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
});
