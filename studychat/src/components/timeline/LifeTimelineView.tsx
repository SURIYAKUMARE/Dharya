/**
 * LifeTimelineView.tsx
 * Ultra-unique, interactive Life Timeline & Serpentine Memory River for Dharya.
 * 
 * Accurately replicates the serpentine winding path design:
 * - Continuous dashed green trail with waypoints and heart loop in the center
 * - Teardrop location markers with glowing magenta anchor capsules
 * - Mint Green and Blossom Pink pastel milestone cards matching the reference image
 * - Bottom frosted summary pill: "My Journey | Jul 2024 – Nov 2026 | 7 Milestones"
 * - Clickable cards that open story details, lightbox photo viewer, and memory editor
 * - Seamless integration with IndexedDB for custom memories
 * - View mode toggle between "Trail Map" (reference design) and "Story Stream"
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Clock,
  Calendar,
  Camera,
  Plus,
  PlusCircle,
  Edit2,
  Trash2,
  MapPin,
  Tag,
  Search,
  Filter,
  Sparkles,
  Heart,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
  Check,
  Upload,
  Share2,
  BookOpen,
  ArrowLeft,
  Images,
  Copy,
  CheckCircle,
  Play,
  Pause,
  Award,
  Compass,
  Star,
  Quote,
  Building2,
  GraduationCap,
  Rocket,
  LayoutGrid,
  Code2,
  Trophy,
  Target,
  GitCommit,
  Map,
} from 'lucide-react';
import { useStudyApp } from '../../context/StudyAppContext';
import {
  TimelineIncident,
  fetchTimelineIncidents,
  createTimelineIncident,
  updateTimelineIncident,
  deleteTimelineIncident,
  STORE_TIMELINE,
  idbDelete,
  SortOrder,
} from '../../services/galleryService';
import { moveToRecycleBin } from '../../services/recycleBinService';
import { useDateCount } from '../common/DateCounterModal';

export interface LifeTimelineViewProps {
  isDark?: boolean;
  onBackToChat?: () => void;
  onOpenGallery?: () => void;
  onOpenRecycleBin?: () => void;
}

interface TagConfig {
  id: string;
  label: string;
  color: string;
  bgBadge: string;
  borderBadge: string;
  glow: string;
  emoji: string;
}

const PRESET_TAGS: TagConfig[] = [
  { id: 'Milestone', label: 'Milestone', color: '#f43f5e', bgBadge: 'bg-rose-500/10 text-rose-500', borderBadge: 'border-rose-500/30', glow: 'shadow-[0_0_12px_rgba(244,63,94,0.4)]', emoji: '💖' },
  { id: 'First Time', label: 'First Time', color: '#10b981', bgBadge: 'bg-emerald-500/10 text-emerald-500', borderBadge: 'border-emerald-500/30', glow: 'shadow-[0_0_12px_rgba(16,185,129,0.4)]', emoji: '🌸' },
  { id: 'Special Date', label: 'Special Date', color: '#f59e0b', bgBadge: 'bg-amber-500/10 text-amber-500', borderBadge: 'border-amber-500/30', glow: 'shadow-[0_0_12px_rgba(245,158,11,0.4)]', emoji: '☕' },
  { id: 'Trip & Travel', label: 'Travel', color: '#0ea5e9', bgBadge: 'bg-sky-500/10 text-sky-500', borderBadge: 'border-sky-500/30', glow: 'shadow-[0_0_12px_rgba(14,165,233,0.4)]', emoji: '✈️' },
  { id: 'Campus Life', label: 'Campus', color: '#8b5cf6', bgBadge: 'bg-purple-500/10 text-purple-500', borderBadge: 'border-purple-500/30', glow: 'shadow-[0_0_12px_rgba(139,92,246,0.4)]', emoji: '🎓' },
  { id: 'Funny Incident', label: 'Funny Incident', color: '#f97316', bgBadge: 'bg-orange-500/10 text-orange-500', borderBadge: 'border-orange-500/30', glow: 'shadow-[0_0_12px_rgba(249,115,22,0.4)]', emoji: '😂' },
  { id: 'Achievement', label: 'Achievement', color: '#eab308', bgBadge: 'bg-yellow-500/10 text-yellow-500', borderBadge: 'border-yellow-500/30', glow: 'shadow-[0_0_12px_rgba(234,179,8,0.4)]', emoji: '🏆' },
];

function getTagConfig(tagName?: string): TagConfig {
  const found = PRESET_TAGS.find((t) => t.id === tagName);
  return (
    found || {
      id: tagName || 'Memory',
      label: tagName || 'Memory',
      color: '#10b981',
      bgBadge: 'bg-emerald-500/10 text-emerald-500',
      borderBadge: 'border-emerald-500/30',
      glow: 'shadow-[0_0_12px_rgba(16,185,129,0.4)]',
      emoji: '✨',
    }
  );
}

export interface JourneyMilestone {
  id: string;
  title: string;
  subtitle: string;
  dateStr: string;
  theme: 'green' | 'pink';
  iconType: 'building' | 'graduation' | 'medal' | 'rocket' | 'microsoft' | 'code' | 'trophy';
  pinX: number; // percentage X in container
  pinY: number; // percentage Y in container
  cardSide: 'left' | 'right';
  description: string;
  location?: string;
  photoUrl?: string;
}

export const DEFAULT_JOURNEY_MILESTONES: JourneyMilestone[] = [
  {
    id: 'm1',
    title: 'College Began',
    subtitle: 'Started my Engineering journey',
    dateStr: 'Jul 2024',
    theme: 'green',
    iconType: 'building',
    pinX: 13,
    pinY: 83,
    cardSide: 'right',
    description: 'Began the college journey! Exploring campus corridors, attending our very first lectures, meeting brilliant peers, and charting out ambitious dreams for the future.',
    location: 'College Campus',
  },
  {
    id: 'm2',
    title: 'Year 2 – AIML',
    subtitle: 'Rathinam Technical Campus',
    dateStr: 'Sep 2025',
    theme: 'pink',
    iconType: 'graduation',
    pinX: 38,
    pinY: 71,
    cardSide: 'right',
    description: 'Stepping into 2nd year Artificial Intelligence & Machine Learning at Rathinam Technical Campus. Diving deep into data structures, algorithms, neural networks, and research labs.',
    location: 'Rathinam Technical Campus',
  },
  {
    id: 'm3',
    title: 'Certification',
    subtitle: 'Completed Microsoft Fabric',
    dateStr: 'Jan 2026',
    theme: 'green',
    iconType: 'medal',
    pinX: 62,
    pinY: 59,
    cardSide: 'right',
    description: 'Successfully cleared the official Microsoft Fabric Analytics & Cloud Engineering certification after intensive hands-on practical architectures.',
    location: 'Microsoft Certified Portal',
  },
  {
    id: 'm4',
    title: 'Project Launch',
    subtitle: 'TrustGuard AI (Live)',
    dateStr: 'Mar 2026',
    theme: 'green',
    iconType: 'rocket',
    pinX: 42,
    pinY: 48,
    cardSide: 'left',
    description: 'TrustGuard AI officially released live into production! An intelligent real-time security framework safeguarding digital workflows with adaptive defense.',
    location: 'Cloud Production Release',
  },
  {
    id: 'm5',
    title: 'Internship',
    subtitle: 'Started Microsoft Internship',
    dateStr: 'Jun 2026',
    theme: 'pink',
    iconType: 'microsoft',
    pinX: 64,
    pinY: 31,
    cardSide: 'right',
    description: 'Joined Microsoft for the software engineering summer internship program. Building enterprise features and collaborating with world-class engineering teams.',
    location: 'Microsoft Technology Center',
  },
  {
    id: 'm6',
    title: 'Hackathon',
    subtitle: 'Won SAKTHI HACKFEST\'26',
    dateStr: 'Sep 2026',
    theme: 'pink',
    iconType: 'code',
    pinX: 47,
    pinY: 23,
    cardSide: 'left',
    description: 'Bagged the coveted 1st Prize Championship at SAKTHI HACKFEST\'26 after building a high-impact prototype across 36 hours of relentless teamwork.',
    location: 'Sakthi Hackfest Arena',
  },
  {
    id: 'm7',
    title: 'SIH 2026',
    subtitle: 'Finalist – NIYAM Project',
    dateStr: 'Nov 2026',
    theme: 'green',
    iconType: 'trophy',
    pinX: 69,
    pinY: 12,
    cardSide: 'right',
    description: 'Selected as national grand finalists at Smart India Hackathon (SIH 2026) representing the NIYAM Project on the national stage in front of industry juries.',
    location: 'SIH National Grand Finale',
  },
];

export const LifeTimelineView: React.FC<LifeTimelineViewProps> = ({
  isDark = true,
  onBackToChat,
  onOpenGallery,
  onOpenRecycleBin,
}) => {
  const { student } = useStudyApp();
  const owner = student?.username || 'surya';
  const partnerName = owner === 'surya' ? 'Sadhana' : 'Surya';
  const dateCount = useDateCount();

  // ── View Mode: 'trail' (Winding Path Map) vs 'stream' (Chronological Story Cards) ──
  const [viewMode, setViewMode] = useState<'trail' | 'stream'>('trail');

  // ── Data State ───────────────────────────────────────────────────
  const [incidents, setIncidents] = useState<TimelineIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  // ── Selected Milestone Modal State (from clicking trail cards) ──
  const [selectedMilestone, setSelectedMilestone] = useState<JourneyMilestone | null>(null);

  // ── Modals & Creator State ───────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [editingIncident, setEditingIncident] = useState<TimelineIncident | null>(null);
  const [title, setTitle] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [storyText, setStoryText] = useState('');
  const [tag, setTag] = useState('Milestone');
  const [location, setLocation] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<TimelineIncident | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // ── Lightbox & Relive Slideshow ──────────────────────────────────
  const [lightboxIncidentIdx, setLightboxIncidentIdx] = useState<number | null>(null);
  const [isRelivingJourney, setIsRelivingJourney] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reliveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMsg(null), 3000);
  }, []);

  // ── Load All Incidents ───────────────────────────────────────────
  const loadIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTimelineIncidents(owner);
      setIncidents(data);
    } catch {
      showToast('Could not load timeline incidents');
    } finally {
      setLoading(false);
    }
  }, [owner, showToast]);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  // ── Filtered Incidents for Story Stream ──────────────────────────
  const filteredIncidents = useMemo(() => {
    let list = [...incidents];

    if (selectedTag !== 'all') {
      list = list.filter((i) => i.tag === selectedTag);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.incidentText.toLowerCase().includes(q) ||
          (i.location && i.location.toLowerCase().includes(q)) ||
          (i.incidentDate && i.incidentDate.includes(q))
      );
    }

    list.sort((a, b) =>
      sortOrder === 'newest' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp
    );

    return list;
  }, [incidents, selectedTag, searchQuery, sortOrder]);

  // Combine custom incidents with default milestones for the trail
  const activeTrailMilestones = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return DEFAULT_JOURNEY_MILESTONES.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.subtitle.toLowerCase().includes(q) ||
          m.dateStr.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
      );
    }
    return DEFAULT_JOURNEY_MILESTONES;
  }, [searchQuery]);

  // ── Open Add/Edit Modal ──────────────────────────────────────────
  const handleOpenAdd = () => {
    setEditingIncident(null);
    setTitle('');
    setIncidentDate(new Date().toISOString().split('T')[0]);
    setStoryText('');
    setTag('Milestone');
    setLocation('');
    setPhotoFile(null);
    setPhotoPreview('');
    setShowModal(true);
  };

  const handleOpenEdit = (inc: TimelineIncident) => {
    setEditingIncident(inc);
    setTitle(inc.title);
    setIncidentDate(inc.incidentDate);
    setStoryText(inc.incidentText);
    setTag(inc.tag || 'Milestone');
    setLocation(inc.location || '');
    setPhotoFile(null);
    setPhotoPreview(inc.photoUrl || '');
    setShowModal(true);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSaveIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !storyText.trim() || !incidentDate) {
      showToast('Please fill in headline, date, and story text');
      return;
    }

    setIsSubmitting(true);
    const timestamp = new Date(incidentDate).getTime() || Date.now();

    try {
      if (editingIncident) {
        await updateTimelineIncident(
          editingIncident.id,
          {
            ...editingIncident,
            title: title.trim(),
            incidentDate,
            incidentText: storyText.trim(),
            tag,
            location: location.trim(),
            photoUrl: photoPreview || undefined,
            timestamp,
          },
          photoFile || undefined
        );
        showToast('Memory updated successfully ✨');
      } else {
        await createTimelineIncident(
          {
            owner,
            title: title.trim(),
            incidentDate,
            incidentText: storyText.trim(),
            tag,
            location: location.trim(),
            photoUrl: photoPreview,
            timestamp,
          },
          photoFile || undefined
        );
        showToast('Recorded new milestone to timeline 🎉');
      }

      setShowModal(false);
      await loadIncidents();
    } catch {
      showToast('Failed to save memory. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await moveToRecycleBin({
        originalId: deleteTarget.id,
        source: 'timeline',
        title: deleteTarget.title || 'Timeline Incident',
        previewText: deleteTarget.incidentText || deleteTarget.incidentDate,
        mediaUrl: deleteTarget.photoUrl,
        mediaType: 'photo',
        owner: deleteTarget.owner,
        originalData: deleteTarget,
      });
      await idbDelete(STORE_TIMELINE, deleteTarget.id);
      setIncidents((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      showToast('Moved to Recycle Bin 🗑️');
      setDeleteTarget(null);
    } catch {
      showToast('Failed to delete incident');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyStory = (titleStr: string, dateStr: string, descStr: string) => {
    const text = `📖 ${dateStr} — ${titleStr}\n"${descStr}"`;
    navigator.clipboard?.writeText(text);
    setCopiedId(titleStr);
    showToast('Copied story to clipboard ✨');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // ── Slideshow Relive Journey ─────────────────────────────────────
  useEffect(() => {
    if (isRelivingJourney && filteredIncidents.length > 0) {
      reliveTimerRef.current = setInterval(() => {
        setLightboxIncidentIdx((prev) => {
          if (prev === null) return 0;
          if (prev + 1 >= filteredIncidents.length) {
            setIsRelivingJourney(false);
            return null;
          }
          return prev + 1;
        });
      }, 4500);
    } else if (reliveTimerRef.current) {
      clearInterval(reliveTimerRef.current);
    }
    return () => {
      if (reliveTimerRef.current) clearInterval(reliveTimerRef.current);
    };
  }, [isRelivingJourney, filteredIncidents.length]);

  const activeLightboxItem =
    lightboxIncidentIdx !== null ? filteredIncidents[lightboxIncidentIdx] : null;

  // Render milestone icon matching the exact reference image
  const renderMilestoneIcon = (type: JourneyMilestone['iconType'], theme: 'green' | 'pink') => {
    const isGreen = theme === 'green';
    const colorClass = isGreen ? 'text-[#15803D]' : 'text-[#BE185D]';
    switch (type) {
      case 'building':
        return <Building2 className={`w-5 h-5 sm:w-6 sm:h-6 ${colorClass}`} strokeWidth={2.2} />;
      case 'graduation':
        return <GraduationCap className={`w-5 h-5 sm:w-6 sm:h-6 ${colorClass}`} strokeWidth={2.2} />;
      case 'medal':
        return <Award className={`w-5 h-5 sm:w-6 sm:h-6 ${colorClass}`} strokeWidth={2.2} />;
      case 'rocket':
        return <Rocket className={`w-5 h-5 sm:w-6 sm:h-6 ${colorClass}`} strokeWidth={2.2} />;
      case 'microsoft':
        return <LayoutGrid className={`w-5 h-5 sm:w-6 sm:h-6 ${colorClass}`} strokeWidth={2.2} />;
      case 'code':
        return <Code2 className={`w-5 h-5 sm:w-6 sm:h-6 ${colorClass}`} strokeWidth={2.2} />;
      case 'trophy':
        return <Trophy className={`w-5 h-5 sm:w-6 sm:h-6 ${colorClass}`} strokeWidth={2.2} />;
      default:
        return <Sparkles className={`w-5 h-5 sm:w-6 sm:h-6 ${colorClass}`} strokeWidth={2.2} />;
    }
  };

  return (
    <div
      className={`w-full h-full flex flex-col overflow-hidden relative select-none font-sans transition-colors ${
        isDark ? 'bg-[#0c1317] text-[#e9edef]' : 'bg-[#fafcf8] text-[#0f172a]'
      }`}
    >
      {/* ── Toast Notification ── */}
      {toastMsg && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-white/10 animate-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-rose-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── Top Header Bar ── */}
      <header
        className={`px-4 sm:px-6 py-3 border-b z-30 shrink-0 transition-colors ${
          isDark ? 'bg-[#111b21] border-[#222e35]' : 'bg-white border-slate-200/90'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Title & Brand */}
          <div className="flex items-center gap-3">
            {onBackToChat && (
              <button
                onClick={onBackToChat}
                className={`p-2 rounded-xl border transition-colors md:hidden ${
                  isDark
                    ? 'border-[#222e35] hover:bg-white/5 text-[#aebac1]'
                    : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
                title="Back to Chat"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#15803D] via-[#059669] to-[#be185d] text-white flex items-center justify-center shadow-md">
              <Compass className="w-5 h-5 text-white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight">Timeline Journey</h1>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isDark
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  Jul 2024 – Nov 2026
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-[#8696a0]' : 'text-slate-500'}`}>
                Winding Milestone Path • 7 Chapters
              </p>
            </div>
          </div>

          {/* View Mode Switcher: Trail Map vs Story Stream */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className={`p-1 rounded-2xl border flex items-center gap-1 ${
              isDark ? 'bg-[#182229] border-[#2a3942]' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setViewMode('trail')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  viewMode === 'trail'
                    ? 'bg-[#15803D] text-white shadow-sm font-bold'
                    : isDark
                    ? 'text-[#8696a0] hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Winding Trail Map View"
              >
                <Map className="w-3.5 h-3.5" />
                <span>Trail Map</span>
              </button>

              <button
                onClick={() => setViewMode('stream')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  viewMode === 'stream'
                    ? 'bg-[#15803D] text-white shadow-sm font-bold'
                    : isDark
                    ? 'text-[#8696a0] hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Story Stream List View"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Story Stream</span>
              </button>
            </div>

            {/* Add memory CTA */}
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Record Memory</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Scrollable Timeline Stage ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-6 lg:p-8 scrollbar-thin">
        {/* ═══════════════════════════════════════════════════════════════
            VIEW 1: WINDING SERPENTINE TRAIL MAP (Reference Design)
        ═══════════════════════════════════════════════════════════════ */}
        {viewMode === 'trail' && (
          <div className="max-w-4xl mx-auto py-2 sm:py-6">
            {/* The Trail Board with SVG Path & Overlaid Cards */}
            <div className="relative w-full aspect-[800/1180] min-h-[780px] sm:min-h-[960px] md:min-h-[1050px] select-none">
              {/* Background ambient subtle glow */}
              <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* ── SVG Winding Green Dashed Trail & Heart Loop ── */}
              <svg
                viewBox="0 0 800 1180"
                className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
              >
                {/* Defs for gradients & filters */}
                <defs>
                  <filter id="trail-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#15803d" floodOpacity="0.25" />
                  </filter>
                </defs>

                {/* 1. Path from Node 1 (Jul 2024) to Heart */}
                <path
                  d="M 104 980 C 140 940, 240 890, 304 840 C 370 795, 470 755, 496 698 C 508 642, 420 615, 336 570 C 330 520, 360 480, 410 470"
                  fill="none"
                  stroke="#15803d"
                  strokeWidth="2.5"
                  strokeDasharray="6,6"
                  strokeLinecap="round"
                  filter="url(#trail-glow)"
                />

                {/* 2. Heart Loop in the Center */}
                <path
                  d="M 420 500 C 370 450 330 395 380 355 C 410 330 420 370 420 380 C 420 370 430 330 460 355 C 510 395 470 450 420 500 Z"
                  fill="none"
                  stroke="#15803d"
                  strokeWidth="2.5"
                  strokeDasharray="6,6"
                  strokeLinecap="round"
                  filter="url(#trail-glow)"
                />

                {/* 3. Path from Heart to Node 7 (Nov 2026) */}
                <path
                  d="M 425 470 C 455 435, 485 395, 512 368 C 525 325, 460 295, 376 273 C 350 240, 465 190, 552 143"
                  fill="none"
                  stroke="#15803d"
                  strokeWidth="2.5"
                  strokeDasharray="6,6"
                  strokeLinecap="round"
                  filter="url(#trail-glow)"
                />
              </svg>

              {/* ── Soft Heart Pulse inside the Loop ── */}
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
                style={{ left: '52.5%', top: '36.5%' }}
              >
                <Heart className="w-8 h-8 text-rose-500/20 fill-rose-500/10 animate-pulse" />
              </div>

              {/* ── 7 Waypoint Nodes (Markers + Pastel Cards) ── */}
              {activeTrailMilestones.map((m) => {
                const isGreen = m.theme === 'green';

                return (
                  <React.Fragment key={m.id}>
                    {/* Waypoint Location Pin & Ground Capsule */}
                    <div
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none"
                      style={{ left: `${m.pinX}%`, top: `${m.pinY}%` }}
                    >
                      {/* Green Teardrop Map Marker Pin */}
                      <div className="relative -top-1 transition-transform hover:scale-125 duration-200">
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#15803D] drop-shadow-[0_2px_4px_rgba(0,0,0,0.22)]"
                        >
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
                        </svg>
                        {/* White inner center circle dot */}
                        <span className="absolute top-[6px] sm:top-[8px] md:top-[9px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white shadow-xs" />
                      </div>

                      {/* Glowing Pink/Magenta Anchor Capsule */}
                      <div className="w-3.5 h-1.5 sm:w-4 sm:h-2 rounded-full bg-[#E11D48] shadow-[0_0_8px_rgba(225,29,72,0.7)] mt-[-2px]" />
                    </div>

                    {/* Milestone Pastel Card */}
                    <div
                      className="absolute -translate-y-1/2 z-10 w-[46%] sm:w-[42%] md:w-[38%] max-w-[310px]"
                      style={{
                        top: `${m.pinY}%`,
                        ...(m.cardSide === 'right'
                          ? { left: `calc(${m.pinX}% + 14px)` }
                          : { right: `calc(${100 - m.pinX}% + 14px)` }),
                      }}
                    >
                      <div
                        onClick={() => setSelectedMilestone(m)}
                        className={`rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 md:p-4 border transition-all duration-200 hover:scale-[1.025] hover:shadow-xl cursor-pointer select-none flex items-center gap-2.5 sm:gap-3.5 ${
                          isGreen
                            ? isDark
                              ? 'bg-[#12281e]/92 border-[#15803d]/45 hover:border-[#22c55e]/70 shadow-[0_4px_20px_rgba(21,128,61,0.18)] text-white'
                              : 'bg-[#F0FDF4] border-[#BBF7D0] hover:border-[#86EFAC] shadow-[0_6px_22px_rgba(22,101,52,0.07)] text-slate-900'
                            : isDark
                            ? 'bg-[#2a1722]/92 border-[#be185d]/45 hover:border-[#f43f5e]/70 shadow-[0_4px_20px_rgba(190,24,93,0.18)] text-white'
                            : 'bg-[#FDF2F8] border-[#FBCFE8] hover:border-[#F472B6] shadow-[0_6px_22px_rgba(190,24,93,0.07)] text-slate-900'
                        }`}
                      >
                        {/* Icon Container Badge */}
                        <div
                          className={`w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border ${
                            isGreen
                              ? isDark
                                ? 'bg-[#1b4332] border-[#2d6a4f]'
                                : 'bg-[#DCFCE7] border-[#86EFAC]/50'
                              : isDark
                              ? 'bg-[#4c1d38] border-[#831843]'
                              : 'bg-[#FCE7F3] border-[#F472B6]/50'
                          }`}
                        >
                          {renderMilestoneIcon(m.iconType, m.theme)}
                        </div>

                        {/* Text & Date Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1 sm:gap-1.5">
                            <Calendar
                              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${
                                isGreen
                                  ? isDark ? 'text-emerald-400' : 'text-[#166534]'
                                  : isDark ? 'text-rose-400' : 'text-[#9D174D]'
                              }`}
                            />
                            <span
                              className={`text-[10px] sm:text-[11.5px] font-semibold ${
                                isGreen
                                  ? isDark ? 'text-emerald-400' : 'text-[#166534]'
                                  : isDark ? 'text-rose-400' : 'text-[#9D174D]'
                              }`}
                            >
                              {m.dateStr}
                            </span>
                          </div>

                          <h3
                            className={`text-[12px] sm:text-[14px] md:text-[15px] font-extrabold tracking-tight truncate leading-tight mt-0.5 ${
                              isGreen
                                ? isDark ? 'text-[#e9edef]' : 'text-[#0F172A]'
                                : isDark ? 'text-[#fda4af]' : 'text-[#9F1239]'
                            }`}
                          >
                            {m.title}
                          </h3>

                          <p
                            className={`text-[9.5px] sm:text-[11px] truncate leading-snug mt-0.5 ${
                              isDark ? 'text-[#8696a0]' : 'text-[#475569]'
                            }`}
                          >
                            {m.subtitle}
                          </p>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* ── Bottom Summary Banner: My Journey | Jul 2024 – Nov 2026 | 7 Milestones ── */}
            <div className="mt-6 px-2">
              <div
                className={`w-full max-w-2xl mx-auto rounded-3xl p-3.5 sm:p-4.5 border transition-all duration-300 shadow-lg flex items-center justify-between select-none ${
                  isDark
                    ? 'bg-[#182229]/95 border-[#2a3942] text-white shadow-black/40'
                    : 'bg-white/95 border-[#E2E8F0] text-slate-900 shadow-slate-200/50'
                }`}
              >
                {/* Left: Pink Journey Chain Icon & Title */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-rose-50 to-pink-100 dark:from-rose-950/40 dark:to-pink-900/40 border border-rose-300/60 dark:border-rose-800 text-[#E11D48] flex items-center justify-center shrink-0 shadow-xs">
                    <GitCommit className="w-5 h-5 sm:w-6 sm:h-6 rotate-45" strokeWidth={2.5} />
                  </div>

                  <div className="h-7 w-px bg-slate-200 dark:bg-white/10 shrink-0" />

                  <div className="min-w-0">
                    <h4 className="text-sm sm:text-base font-extrabold tracking-tight text-[#0F172A] dark:text-[#E9EDEF] truncate">
                      My Journey
                    </h4>
                    <p className="text-[11px] sm:text-xs text-[#64748B] dark:text-[#8696A0] font-medium truncate">
                      Jul 2024 – Nov 2026
                    </p>
                  </div>
                </div>

                {/* Right: Pink Target Circle & Milestone Count */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-[#BE185D] dark:text-rose-400 font-extrabold text-xs sm:text-sm shrink-0 shadow-2xs">
                  <Target className="w-4 h-4 text-[#BE185D] dark:text-rose-400 stroke-[2.3]" />
                  <span>7 Milestones</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            VIEW 2: DETAILED STORY STREAM (Chronological Timeline Cards)
        ═══════════════════════════════════════════════════════════════ */}
        {viewMode === 'stream' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Relationship Counter Banner */}
            {dateCount && (
              <div
                className={`rounded-3xl p-5 border relative overflow-hidden transition-all ${
                  isDark
                    ? 'bg-gradient-to-r from-rose-950/40 via-[#182229] to-pink-950/40 border-[#2a3942]'
                    : 'bg-gradient-to-r from-rose-50 via-white to-pink-50 border-rose-200/80 shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg shrink-0">
                      <Sparkles className="w-6 h-6 fill-white" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider font-extrabold text-rose-500">
                        Relationship Milestone Journey
                      </p>
                      <p className="text-base sm:text-lg font-bold mt-0.5">
                        {dateCount.dateStr} • {dateCount.days}d {dateCount.hours}h {dateCount.minutes}m {dateCount.seconds}s
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-center px-3 py-1.5 rounded-2xl bg-white/10 backdrop-blur-sm">
                      <p className="text-xs font-bold text-rose-500">{incidents.length}</p>
                      <p className="text-[10px] text-slate-400">Recorded</p>
                    </div>
                    <div className="text-center px-3 py-1.5 rounded-2xl bg-white/10 backdrop-blur-sm">
                      <p className="text-xs font-bold text-emerald-500">
                        {incidents.filter((i) => i.photoUrl).length}
                      </p>
                      <p className="text-[10px] text-slate-400">Photos</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty state when no custom memories recorded yet */}
            {filteredIncidents.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center max-w-sm mx-auto">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-[#15803d] flex items-center justify-center mb-4">
                  <Compass className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold">Document Your Story</h3>
                <p className={`text-xs mt-1 mb-5 ${isDark ? 'text-[#8696a0]' : 'text-slate-500'}`}>
                  Record personal memories and reflections. They will be archived permanently in your private timeline.
                </p>
                <button
                  onClick={handleOpenAdd}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors"
                >
                  Record First Memory
                </button>
              </div>
            )}

            {/* Stream of custom memories */}
            {filteredIncidents.length > 0 && (
              <div className="space-y-6">
                {filteredIncidents.map((inc, index) => {
                  const tagConfig = getTagConfig(inc.tag);

                  return (
                    <article
                      key={inc.id}
                      className={`rounded-3xl p-5 border transition-all duration-300 hover:shadow-xl group relative overflow-hidden ${
                        isDark
                          ? 'bg-[#182229]/90 border-[#2a3942] hover:border-emerald-500/40 text-white'
                          : 'bg-white border-slate-200/90 hover:border-emerald-300 text-slate-900 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${tagConfig.bgBadge} ${tagConfig.borderBadge}`}
                          >
                            {tagConfig.emoji} {tagConfig.label}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {inc.incidentDate}
                          </span>
                        </div>
                      </div>

                      {inc.photoUrl && (
                        <div
                          onClick={() => setLightboxIncidentIdx(index)}
                          className="relative mb-4 rounded-2xl overflow-hidden aspect-video bg-black/30 cursor-pointer group/photo shadow-md max-w-md"
                        >
                          <img
                            src={inc.photoUrl}
                            alt={inc.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover/photo:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-sm text-white text-xs font-semibold flex items-center gap-1.5">
                              <ZoomIn className="w-3.5 h-3.5" />
                              <span>View Full Photo</span>
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="space-y-1 mb-3">
                        <h2 className="text-base sm:text-lg font-bold tracking-tight leading-snug">
                          {inc.title}
                        </h2>
                        {inc.location && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                            <MapPin className="w-3 h-3" />
                            <span>{inc.location}</span>
                          </p>
                        )}
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line border relative ${
                          isDark
                            ? 'bg-[#111b21] border-[#222e35] text-slate-200'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <Quote className="w-4 h-4 text-emerald-500/40 mb-1" />
                        <p>{inc.incidentText}</p>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200/50 dark:border-white/5 text-xs">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyStory(inc.title, inc.incidentDate, inc.incidentText)}
                            className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 ${
                              copiedId === inc.title
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                                : isDark
                                ? 'border-[#222e35] text-[#8696a0] hover:text-white hover:bg-white/5'
                                : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                            title="Copy Story"
                          >
                            {copiedId === inc.title ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span className="text-[10px]">
                              {copiedId === inc.title ? 'Copied' : 'Story'}
                            </span>
                          </button>

                          <button
                            onClick={() => handleOpenEdit(inc)}
                            className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 ${
                              isDark
                                ? 'border-[#222e35] text-[#8696a0] hover:text-white hover:bg-white/5'
                                : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                            title="Edit Memory"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Edit</span>
                          </button>
                        </div>

                        <button
                          onClick={() => setDeleteTarget(inc)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Move to Recycle Bin"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modal: Milestone Detail Card (When clicking on Trail Map) ── */}
      {selectedMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border ${
              selectedMilestone.theme === 'green'
                ? isDark
                  ? 'bg-[#12281e] border-[#15803d]/50 text-white'
                  : 'bg-[#F0FDF4] border-[#BBF7D0] text-slate-900'
                : isDark
                ? 'bg-[#2a1722] border-[#be185d]/50 text-white'
                : 'bg-[#FDF2F8] border-[#FBCFE8] text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                    selectedMilestone.theme === 'green'
                      ? isDark
                        ? 'bg-[#1b4332] border-[#2d6a4f]'
                        : 'bg-[#DCFCE7] border-[#86EFAC]/60'
                      : isDark
                      ? 'bg-[#4c1d38] border-[#831843]'
                      : 'bg-[#FCE7F3] border-[#F472B6]/60'
                  }`}
                >
                  {renderMilestoneIcon(selectedMilestone.iconType, selectedMilestone.theme)}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-bold text-slate-500">
                      {selectedMilestone.dateStr}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold tracking-tight">
                    {selectedMilestone.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedMilestone(null)}
                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              📍 {selectedMilestone.subtitle}
            </p>

            <div className="p-4 rounded-2xl bg-white/70 dark:bg-black/30 border border-black/5 dark:border-white/10 text-xs sm:text-sm leading-relaxed mb-5">
              <p>{selectedMilestone.description}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  handleCopyStory(
                    selectedMilestone.title,
                    selectedMilestone.dateStr,
                    selectedMilestone.description
                  )
                }
                className="flex-1 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/10 hover:bg-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedId === selectedMilestone.title ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedId === selectedMilestone.title ? 'Copied' : 'Copy Story'}</span>
              </button>

              <button
                onClick={() => setSelectedMilestone(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox & Slideshow Modal ── */}
      {lightboxIncidentIdx !== null && activeLightboxItem && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between text-white animate-in fade-in duration-200">
          <div className="px-4 py-3 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-white/70">
                {lightboxIncidentIdx + 1} / {filteredIncidents.length}
              </span>
              <span className="text-xs font-bold text-emerald-400">
                {activeLightboxItem.incidentDate}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRelivingJourney(!isRelivingJourney)}
                className={`p-2 rounded-xl transition-colors ${
                  isRelivingJourney ? 'bg-emerald-600 text-white' : 'hover:bg-white/10'
                }`}
                title={isRelivingJourney ? 'Pause Slideshow' : 'Play Slideshow'}
              >
                {isRelivingJourney ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  setLightboxIncidentIdx(null);
                  setIsRelivingJourney(false);
                }}
                className="p-2 rounded-xl hover:bg-white/10 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 relative flex items-center justify-center p-4">
            <button
              onClick={() =>
                setLightboxIncidentIdx((prev) =>
                  prev !== null
                    ? (prev - 1 + filteredIncidents.length) % filteredIncidents.length
                    : 0
                )
              }
              className="absolute left-4 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="max-w-2xl w-full text-center space-y-4">
              {activeLightboxItem.photoUrl && (
                <img
                  src={activeLightboxItem.photoUrl}
                  alt={activeLightboxItem.title}
                  className="max-h-[50vh] mx-auto rounded-3xl object-contain shadow-2xl"
                />
              )}
              <div className="space-y-2 px-4">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300">
                  {activeLightboxItem.tag || 'Milestone'}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {activeLightboxItem.title}
                </h3>
                {activeLightboxItem.location && (
                  <p className="text-xs text-emerald-400 font-medium">
                    📍 {activeLightboxItem.location}
                  </p>
                )}
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-xl mx-auto italic">
                  "{activeLightboxItem.incidentText}"
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                setLightboxIncidentIdx((prev) =>
                  prev !== null ? (prev + 1) % filteredIncidents.length : 0
                )
              }
              className="absolute right-4 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="p-3 bg-black/40 border-t border-white/10 text-center text-xs text-slate-400">
            Use arrow keys or buttons to navigate our relationship journey
          </div>
        </div>
      )}

      {/* ── Record/Edit Memory Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div
            className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl border my-8 ${
              isDark ? 'bg-[#182229] border-[#222e35] text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#15803d]" />
                <h3 className="font-bold text-base">
                  {editingIncident ? 'Edit Milestone Chapter' : 'Record New Memory'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveIncident} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400">Headline Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hackathon Victory, New Certification, First Meetup..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full mt-1 px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark
                      ? 'bg-[#111b21] border-[#2a3942] text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Date Happened</label>
                  <input
                    type="date"
                    required
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className={`w-full mt-1 px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDark
                        ? 'bg-[#111b21] border-[#2a3942] text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400">Location (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Campus, Convention Center..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={`w-full mt-1 px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDark
                        ? 'bg-[#111b21] border-[#2a3942] text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Category Tag</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {PRESET_TAGS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTag(t.id)}
                      className={`text-xs px-2.5 py-1 rounded-xl border transition-all ${
                        tag === t.id
                          ? `${t.bgBadge} ${t.borderBadge} border-2 font-bold`
                          : 'border-slate-300 dark:border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {t.emoji} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">What Happened? (Full Story)</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write the full memory, story, or feelings here..."
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  className={`w-full mt-1 px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark
                      ? 'bg-[#111b21] border-[#2a3942] text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Attach Photo (Optional)</label>
                <div className="mt-1 flex items-center gap-3">
                  {photoPreview ? (
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-emerald-500 shrink-0">
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoFile(null);
                          setPhotoPreview('');
                        }}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`h-20 flex-1 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-2 text-xs transition-colors ${
                        isDark
                          ? 'border-[#2a3942] hover:border-emerald-500 text-slate-400'
                          : 'border-slate-300 hover:border-emerald-500 text-slate-500'
                      }`}
                    >
                      <Camera className="w-5 h-5 mb-1" />
                      <span>Choose Photo or Snapshot</span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md"
                >
                  {isSubmitting ? 'Saving...' : editingIncident ? 'Update Milestone' : 'Record to Timeline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border ${
              isDark ? 'bg-[#182229] border-[#222e35] text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-center text-base">Move Incident to Recycle Bin?</h3>
            <p className="text-xs text-center text-slate-400 mt-1 mb-5">
              "{deleteTarget.title}" will be moved safely to your Recycle Bin and can be restored anytime.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                {isDeleting ? 'Deleting...' : 'Move to Trash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
