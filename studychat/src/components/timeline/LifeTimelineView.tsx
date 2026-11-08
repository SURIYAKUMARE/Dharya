/**
 * LifeTimelineView.tsx
 * Ultra-unique, interactive Life Timeline & Memory River for Dharya.
 * Features:
 * - Winding chronological memory river with glowing gradient spine
 * - Alternating left/right desktop milestone cards with connector branches
 * - Relationship journey counter integration ("Days Together" milestone ribbons)
 * - Category tags with vivid color coding (Milestone, First Time, Special Date, Travel, Campus, Funny, Achievement)
 * - Photo attachments with interactive lightbox viewer
 * - Story playback / "Relive Journey" automatic memory walk-through
 * - Real-time full-text search across stories, dates, headlines, and locations
 * - Add, Edit, Copy Story, and Move-to-Recycle-Bin support
 * - Backed permanently by IndexedDB browser storage engine
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

function getRelativeTime(dateStr: string, timestamp: number): string {
  try {
    const target = new Date(dateStr).getTime() || timestamp;
    const diffDays = Math.round((Date.now() - target) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays > 1 && diffDays < 30) return `${diffDays} days ago`;
    if (diffDays >= 30 && diffDays < 365) return `${Math.floor(diffDays / 30)} mo ago`;
    if (diffDays >= 365) return `${(diffDays / 365).toFixed(1)} yr ago`;
    return 'Upcoming';
  } catch {
    return 'Milestone';
  }
}

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

  // ── Data State ───────────────────────────────────────────────────
  const [incidents, setIncidents] = useState<TimelineIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

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

  // ── Filtered Incidents ───────────────────────────────────────────
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

  const handleCopyStory = (inc: TimelineIncident) => {
    const text = `📖 ${inc.incidentDate} — ${inc.title}\n${inc.location ? `📍 ${inc.location}\n` : ''}\n"${inc.incidentText}"`;
    navigator.clipboard?.writeText(text);
    setCopiedId(inc.id);
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

  return (
    <div
      className={`w-full h-full flex flex-col overflow-hidden relative select-none font-sans transition-colors ${
        isDark ? 'bg-[#0c1317] text-[#e9edef]' : 'bg-[#f8fafc] text-[#0f172a]'
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
        className={`px-4 sm:px-6 py-3.5 border-b z-30 shrink-0 transition-colors ${
          isDark ? 'bg-[#111b21] border-[#222e35]' : 'bg-white border-slate-200'
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

            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-500 text-white flex items-center justify-center shadow-md">
              <Heart className="w-5 h-5 fill-white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight">Our Life Timeline</h1>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isDark
                      ? 'bg-rose-500/15 text-rose-400'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {incidents.length} chapters
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-[#8696a0]' : 'text-slate-500'}`}>
                Surya & {partnerName}'s private story stream
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search chapters, memories, dates, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-9 py-2 rounded-2xl text-xs sm:text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                isDark
                  ? 'bg-[#1f2c34] border-[#2a3942] text-white placeholder-[#8696a0]'
                  : 'bg-slate-100/80 border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Relive Journey Button */}
            {filteredIncidents.length > 0 && (
              <button
                onClick={() => {
                  setLightboxIncidentIdx(0);
                  setIsRelivingJourney(true);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  isDark
                    ? 'border-[#222e35] hover:bg-white/5 text-rose-400'
                    : 'border-rose-200 hover:bg-rose-50 text-rose-600'
                }`}
                title="Watch auto-playing memory slideshow"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Relive Journey</span>
              </button>
            )}

            {/* Add memory CTA */}
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Record Memory</span>
            </button>
          </div>
        </div>

        {/* ── Category Filter Pills ── */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pt-3 border-t mt-3 border-slate-200/60 dark:border-slate-800 scrollbar-none">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                selectedTag === 'all'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : isDark
                  ? 'text-[#8696a0] hover:bg-white/5 hover:text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              All Chapters ({incidents.length})
            </button>

            {PRESET_TAGS.map((t) => {
              const active = selectedTag === t.id;
              const count = incidents.filter((i) => i.tag === t.id).length;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTag(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                    active
                      ? `${t.bgBadge} ${t.borderBadge} border shadow-sm font-bold`
                      : isDark
                      ? 'text-[#8696a0] hover:bg-white/5 hover:text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{t.emoji}</span>
                  <span>{t.label}</span>
                  {count > 0 && <span className="text-[10px] opacity-80">({count})</span>}
                </button>
              );
            })}
          </div>

          {/* Sort order toggle */}
          <button
            onClick={() => setSortOrder((s: SortOrder) => (s === 'newest' ? 'oldest' : 'newest'))}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 shrink-0 ${
              isDark
                ? 'border-[#222e35] text-[#8696a0] hover:text-white'
                : 'border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Filter className="w-3 h-3" />
            <span>{sortOrder === 'newest' ? 'Newest first' : 'Storyline (Oldest first)'}</span>
          </button>
        </div>
      </header>

      {/* ── Scrollable Timeline River ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Relationship Counter Banner */}
        {dateCount && (
          <div
            className={`max-w-4xl mx-auto rounded-3xl p-5 border relative overflow-hidden transition-all ${
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

        {/* Loading state */}
        {loading && (
          <div className="max-w-3xl mx-auto space-y-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-44 rounded-3xl bg-slate-200 dark:bg-white/5 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredIncidents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold">No memories in this view</h3>
            <p className={`text-xs mt-1 mb-5 ${isDark ? 'text-[#8696a0]' : 'text-slate-500'}`}>
              {searchQuery
                ? `No chapters match "${searchQuery}"`
                : 'Begin documenting your life journey by adding your first memorable incident.'}
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-colors"
            >
              Record First Memory
            </button>
          </div>
        )}

        {/* ── THE MEMORY RIVER (Alternating Desktop / Fluid Mobile) ── */}
        {!loading && filteredIncidents.length > 0 && (
          <div className="relative max-w-5xl mx-auto py-4">
            {/* Illuminated Center Spine */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-gradient-to-b from-rose-500 via-pink-400 via-purple-500 to-amber-500 rounded-full opacity-40 shadow-[0_0_12px_rgba(244,63,94,0.3)] pointer-events-none" />

            {/* Stream of Milestone Cards */}
            <div className="space-y-10 sm:space-y-12">
              {filteredIncidents.map((inc, index) => {
                const tagConfig = getTagConfig(inc.tag);
                const isEven = index % 2 === 0;
                const relativeTime = getRelativeTime(inc.incidentDate, inc.timestamp);

                return (
                  <div
                    key={inc.id}
                    className={`relative flex items-center flex-col md:flex-row ${
                      isEven ? 'md:flex-row-reverse' : ''
                    }`}
                  >
                    {/* Glowing Milestone Spine Node */}
                    <div
                      className={`absolute left-6 md:left-1/2 -translate-x-1/2 z-20 w-10 h-10 rounded-2xl flex items-center justify-center text-base border-2 bg-white dark:bg-[#111b21] shadow-lg transition-transform hover:scale-110 ${tagConfig.glow} ${tagConfig.borderBadge}`}
                      style={{ borderColor: tagConfig.color }}
                      title={`${inc.tag || 'Memory'}: ${inc.incidentDate}`}
                    >
                      <span>{tagConfig.emoji}</span>
                    </div>

                    {/* Milestone Card Container */}
                    <div
                      className={`w-full pl-14 md:pl-0 md:w-[46%] ${
                        isEven ? 'md:pr-10' : 'md:pl-10'
                      }`}
                    >
                      <article
                        className={`rounded-3xl p-5 border transition-all duration-300 hover:shadow-xl group relative overflow-hidden ${
                          isDark
                            ? 'bg-[#182229]/90 border-[#2a3942] hover:border-rose-500/40 text-white'
                            : 'bg-white border-slate-200/90 hover:border-rose-300 text-slate-900 shadow-sm'
                        }`}
                      >
                        {/* Top Metadata Row */}
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

                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                            {relativeTime}
                          </span>
                        </div>

                        {/* Attached Photo */}
                        {inc.photoUrl && (
                          <div
                            onClick={() => setLightboxIncidentIdx(index)}
                            className="relative mb-4 rounded-2xl overflow-hidden aspect-video bg-black/30 cursor-pointer group/photo shadow-md"
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

                        {/* Title & Location */}
                        <div className="space-y-1 mb-3">
                          <h2 className="text-base sm:text-lg font-bold tracking-tight leading-snug">
                            {inc.title}
                          </h2>
                          {inc.location && (
                            <p className="text-xs text-rose-500 flex items-center gap-1 font-medium">
                              <MapPin className="w-3 h-3" />
                              <span>{inc.location}</span>
                            </p>
                          )}
                        </div>

                        {/* Story Content with Quote Styling */}
                        <div
                          className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line border relative ${
                            isDark
                              ? 'bg-[#111b21] border-[#222e35] text-slate-200'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <Quote className="w-4 h-4 text-rose-500/40 mb-1" />
                          <p>{inc.incidentText}</p>
                        </div>

                        {/* Bottom Action Strip */}
                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200/50 dark:border-white/5 text-xs">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopyStory(inc)}
                              className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 ${
                                copiedId === inc.id
                                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                                  : isDark
                                  ? 'border-[#222e35] text-[#8696a0] hover:text-white hover:bg-white/5'
                                  : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                              }`}
                              title="Copy Story"
                            >
                              {copiedId === inc.id ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span className="text-[10px]">
                                {copiedId === inc.id ? 'Copied' : 'Story'}
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

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTarget(inc)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title="Move to Recycle Bin"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </article>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Lightbox & Slideshow Modal ── */}
      {lightboxIncidentIdx !== null && activeLightboxItem && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between text-white animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="px-4 py-3 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-white/70">
                {lightboxIncidentIdx + 1} / {filteredIncidents.length}
              </span>
              <span className="text-xs font-bold text-rose-400">
                {activeLightboxItem.incidentDate}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRelivingJourney(!isRelivingJourney)}
                className={`p-2 rounded-xl transition-colors ${
                  isRelivingJourney ? 'bg-rose-600 text-white' : 'hover:bg-white/10'
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

          {/* Center Stage */}
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
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300">
                  {activeLightboxItem.tag || 'Milestone'}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {activeLightboxItem.title}
                </h3>
                {activeLightboxItem.location && (
                  <p className="text-xs text-rose-400 font-medium">
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
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
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
              {/* Headline */}
              <div>
                <label className="text-xs font-semibold text-slate-400">Headline Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Our First Long Walk, Campus Coffee Meetup..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full mt-1 px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                    isDark
                      ? 'bg-[#111b21] border-[#2a3942] text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {/* Date & Location Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Date Happened</label>
                  <input
                    type="date"
                    required
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className={`w-full mt-1 px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-rose-500 ${
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
                    placeholder="e.g. Library rooftop, Beach..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={`w-full mt-1 px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                      isDark
                        ? 'bg-[#111b21] border-[#2a3942] text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Tag Picker */}
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

              {/* Story Narrative */}
              <div>
                <label className="text-xs font-semibold text-slate-400">What Happened? (Full Story)</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write the full memory, conversation, or feelings here..."
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  className={`w-full mt-1 px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                    isDark
                      ? 'bg-[#111b21] border-[#2a3942] text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="text-xs font-semibold text-slate-400">Attach Photo (Optional)</label>
                <div className="mt-1 flex items-center gap-3">
                  {photoPreview ? (
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-rose-500 shrink-0">
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
                          ? 'border-[#2a3942] hover:border-rose-500 text-slate-400'
                          : 'border-slate-300 hover:border-rose-500 text-slate-500'
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

              {/* Form buttons */}
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
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-md"
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
