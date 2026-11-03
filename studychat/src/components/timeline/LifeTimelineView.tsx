/**
 * LifeTimelineView.tsx
 * Ultra-modern, responsive Life Timeline and memory journal.
 * Features:
 * - Editorial memory journal aesthetic with glowing connected chronological spine
 * - Manually add life moments: Photo, Date, Headline Title, and Full Story of what incident happened
 * - Era & year groupings with sticky timeline badges and relative time chips ("Today", "6 months ago")
 * - Dynamic stats strip (Total moments, attached photos, earliest and newest milestones)
 * - Quick switchers: Back to Chats and Jump to Gallery
 * - Edit and Delete incident modal with safety confirmation
 * - Real-time full-text search across story descriptions, headlines, tags, and locations
 * - Interactive multi-incident photo lightbox with story caption overlays
 * - Copy incident story button with visual feedback
 * - Backed permanently by IndexedDB storage engine
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
  HardDrive,
  RefreshCw,
  Share2,
  BookOpen,
  ArrowLeft,
  Images,
  Copy,
  CheckCircle,
  Smile,
  Compass,
  Award,
  MoreVertical,
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
} from '../../services/galleryService';
import { moveToRecycleBin } from '../../services/recycleBinService';
import { DateCounterModal, useDateCount } from '../common/DateCounterModal';

export interface LifeTimelineViewProps {
  onBackToChat?: () => void;
  onOpenGallery?: () => void;
  onOpenRecycleBin?: () => void;
}

interface TagConfig {
  id: string;
  label: string;
  color: string;
  borderColor: string;
  bgGlow: string;
  dotColor: string;
}

const PRESET_TAGS: TagConfig[] = [
  { id: 'Milestone', label: 'Milestone', color: '#D48D98', borderColor: '#48282e', bgGlow: 'transparent', dotColor: '#D48D98' },
  { id: 'First Time', label: 'First Time', color: '#7E9F89', borderColor: '#2b3f33', bgGlow: 'transparent', dotColor: '#7E9F89' },
  { id: 'Special Date', label: 'Special Date', color: '#C8A97E', borderColor: '#453826', bgGlow: 'transparent', dotColor: '#C8A97E' },
  { id: 'Trip & Travel', label: 'Travel', color: '#7EA1B2', borderColor: '#243742', bgGlow: 'transparent', dotColor: '#7EA1B2' },
  { id: 'Campus Life', label: 'Campus', color: '#B594B8', borderColor: '#3e2840', bgGlow: 'transparent', dotColor: '#B594B8' },
  { id: 'Funny Incident', label: 'Funny Incident', color: '#D49D73', borderColor: '#453022', bgGlow: 'transparent', dotColor: '#D49D73' },
  { id: 'Achievement', label: 'Achievement', color: '#C9B078', borderColor: '#423720', bgGlow: 'transparent', dotColor: '#C9B078' },
];

function getTagConfig(tagName?: string): TagConfig {
  const found = PRESET_TAGS.find((t) => t.id === tagName);
  return (
    found || {
      id: tagName || 'Memory',
      label: tagName || 'Memory',
      color: '#7E9F89',
      borderColor: '#2b3f33',
      bgGlow: 'transparent',
      dotColor: '#7E9F89',
    }
  );
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 0) return 'Future Milestone';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  const years = Math.floor(diffDays / 365);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

function getEraLabel(dateStr: string, timestamp: number): string {
  const d = new Date(timestamp || dateStr);
  if (isNaN(d.getTime())) return 'Timeless Moments';
  const year = d.getFullYear();
  const month = d.getMonth();
  let season = 'Winter';
  if (month >= 2 && month <= 4) season = 'Spring';
  else if (month >= 5 && month <= 7) season = 'Summer';
  else if (month >= 8 && month <= 10) season = 'Autumn';
  return `${year} • ${season}`;
}

export const LifeTimelineView: React.FC<LifeTimelineViewProps> = ({
  onBackToChat,
  onOpenGallery,
  onOpenRecycleBin,
}) => {
  const { student, switchTab } = useStudyApp();
  const owner = student?.username || 'surya';

  // ── State ─────────────────────────────────────────────────────────
  const [incidents, setIncidents] = useState<TimelineIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('oldest');
  const [showStats, setShowStats] = useState(false);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState<boolean>(false);
  const dateCount = useDateCount();

  // ── Add / Edit Modal ──────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [editingIncident, setEditingIncident] = useState<TimelineIncident | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [storyText, setStoryText] = useState('');
  const [tag, setTag] = useState('Milestone');
  const [location, setLocation] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Delete Confirmation ───────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<TimelineIncident | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Lightbox Preview ──────────────────────────────────────────────
  const [previewIncidentIdx, setPreviewIncidentIdx] = useState<number | null>(null);

  // ── Toast & Clipboard ─────────────────────────────────────────────
  const [toast, setToast] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Load Incidents ────────────────────────────────────────────────
  const loadIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTimelineIncidents(owner);
      setIncidents(data);
    } catch (err) {
      console.error('[LifeTimelineView] load error:', err);
    } finally {
      setLoading(false);
    }
  }, [owner]);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  // Listen for incidents restored from the Recycle Bin
  useEffect(() => {
    const handleRestoredIncident = (e: any) => {
      const restored = e.detail?.incident;
      if (restored) {
        setIncidents((prev) =>
          prev.some((i) => i.id === restored.id)
            ? prev
            : [...prev, restored].sort((a, b) => b.timestamp - a.timestamp)
        );
      }
    };
    window.addEventListener('timeline_incident_restored', handleRestoredIncident);
    return () => window.removeEventListener('timeline_incident_restored', handleRestoredIncident);
  }, []);

  // ── Filtered & Sorted Incidents ───────────────────────────────────
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
          (i.incidentDate && i.incidentDate.includes(q)) ||
          (i.tag && i.tag.toLowerCase().includes(q)),
      );
    }

    list.sort((a, b) =>
      sortOrder === 'newest' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp,
    );

    return list;
  }, [incidents, selectedTag, searchQuery, sortOrder]);

  // Group into chronological eras
  const eraGroups = useMemo(() => {
    const groups: { era: string; items: TimelineIncident[] }[] = [];
    const map = new Map<string, TimelineIncident[]>();

    filteredIncidents.forEach((item) => {
      const era = getEraLabel(item.incidentDate, item.timestamp);
      if (!map.has(era)) {
        map.set(era, []);
      }
      map.get(era)!.push(item);
    });

    map.forEach((items, era) => {
      groups.push({ era, items });
    });

    return groups;
  }, [filteredIncidents]);

  // Photo-only incidents for the lightbox carousel
  const photoIncidents = useMemo(() => {
    return filteredIncidents.filter((i) => Boolean(i.photoUrl));
  }, [filteredIncidents]);

  // Summary statistics
  const stats = useMemo(() => {
    const total = incidents.length;
    const withPhoto = incidents.filter((i) => Boolean(i.photoUrl)).length;
    const totalWords = incidents.reduce(
      (sum, i) => sum + (i.incidentText ? i.incidentText.trim().split(/\s+/).length : 0),
      0,
    );
    const sorted = [...incidents].sort((a, b) => a.timestamp - b.timestamp);
    const earliest = sorted[0]?.incidentDate || 'None';
    const latest = sorted[sorted.length - 1]?.incidentDate || 'None';
    return { total, withPhoto, totalWords, earliest, latest };
  }, [incidents]);

  // ── Open Add Modal ────────────────────────────────────────────────
  const handleOpenAdd = () => {
    setEditingIncident(null);
    setTitle('');
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
    setStoryText('');
    setTag('Milestone');
    setLocation('');
    setPhotoFile(null);
    setPhotoPreview('');
    setShowModal(true);
  };

  // ── Open Edit Modal ───────────────────────────────────────────────
  const handleOpenEdit = (inc: TimelineIncident) => {
    setEditingIncident(inc);
    setTitle(inc.title);
    setDate(inc.incidentDate || new Date(inc.timestamp).toISOString().split('T')[0]);
    setStoryText(inc.incidentText);
    setTag(inc.tag || 'Milestone');
    setLocation(inc.location || '');
    setPhotoFile(null);
    setPhotoPreview(inc.photoUrl || '');
    setShowModal(true);
  };

  // Quick Date Helpers for Modal
  const setQuickDate = (type: 'today' | 'yesterday' | 'weekAgo') => {
    const d = new Date();
    if (type === 'yesterday') d.setDate(d.getDate() - 1);
    if (type === 'weekAgo') d.setDate(d.getDate() - 7);
    setDate(d.toISOString().split('T')[0]);
  };

  // ── File Selection ────────────────────────────────────────────────
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  // ── Save Incident ─────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date.trim() || !storyText.trim()) {
      showToast('Please fill in date, headline title, and incident story');
      return;
    }

    setIsSubmitting(true);
    const timestamp = new Date(date).getTime() || Date.now();

    try {
      if (editingIncident) {
        await updateTimelineIncident(
          editingIncident.id,
          {
            title: title.trim(),
            incidentDate: date,
            incidentText: storyText.trim(),
            tag,
            location: location.trim(),
            photoUrl: photoPreview || undefined,
            timestamp,
          },
          photoFile || undefined,
        );
        showToast('Life memory updated successfully ✓');
      } else {
        await createTimelineIncident(
          {
            owner,
            title: title.trim(),
            incidentDate: date,
            incidentText: storyText.trim(),
            tag,
            location: location.trim(),
            photoUrl: photoPreview,
            timestamp,
          },
          photoFile || undefined,
        );
        showToast('Incident recorded to Life Timeline ✓');
      }

      setShowModal(false);
      await loadIncidents();
    } catch (err) {
      console.error('[LifeTimelineView] save error:', err);
      showToast('Failed to save memory. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete Incident -> Moves to Recycle Bin ───────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
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
      showToast('Incident moved to Recycle Bin');
      setDeleteTarget(null);
    } catch (err) {
      console.error('[LifeTimelineView] delete error:', err);
      showToast('Failed to delete incident.');
    } finally {
      setDeleting(false);
    }
  };

  // ── Copy Incident Story ───────────────────────────────────────────
  const handleCopyStory = (inc: TimelineIncident) => {
    const textToCopy = `📅 ${inc.incidentDate} — ${inc.title}\n${inc.location ? `📍 ${inc.location}\n` : ''}\n${inc.incidentText}`;
    navigator.clipboard?.writeText(textToCopy);
    setCopiedId(inc.id);
    showToast('Story copied to clipboard ✓');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // ── Lightbox Navigation ───────────────────────────────────────────
  const openPhotoLightbox = (inc: TimelineIncident) => {
    const idx = photoIncidents.findIndex((i) => i.id === inc.id);
    if (idx !== -1) setPreviewIncidentIdx(idx);
  };

  const currentPreviewIncident =
    previewIncidentIdx !== null ? photoIncidents[previewIncidentIdx] : null;

  return (
    <div
      className="w-full h-full flex flex-col bg-[#0f1115] text-[#e3e3e3] overflow-hidden select-none font-sans"
      role="region"
      aria-label="Life Timeline & Memory Journal"
    >
      {/* ────────────────── TOP ELEVATED NAVIGATION ────────────────── */}
      <header className="bg-[#17191e]/90 backdrop-blur-xl border-b border-[#252830] px-3.5 sm:px-6 py-3 shrink-0 shadow-lg z-30">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-2.5">
          {/* Brand + Navigation Switchers */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            {/* Back to Chat Button */}
            {onBackToChat && (
              <button
                onClick={onBackToChat}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#20242c] hover:bg-[#2b303c] border border-[#2e3340] text-xs font-semibold text-[#8696a0] hover:text-white transition-all cursor-pointer active:scale-95"
                title="Back to Active Chat"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Chats</span>
              </button>
            )}

            {/* Restrained Brand Icon */}
            <div className="w-9 h-9 rounded-xl bg-[#1d2420] border border-[#2b3a30] text-[#7E9F89] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 stroke-[2]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-semibold text-[#ECEEEB] tracking-tight">
                  Memories
                </h1>
                {incidents.length > 0 && (
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#1d2420] text-[#7E9F89] border border-[#2b3a30]">
                    {incidents.length} memories
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#808B84]">
                Shared moments, personal dates, photos &amp; written stories
              </p>
            </div>
          </div>

          {/* Quick Floating Search Pill */}
          <div className="relative flex-1 max-w-sm mx-auto sm:mx-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#808B84] pointer-events-none" />
            <input
              type="text"
              placeholder="Search memories, stories, dates…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#131615] hover:bg-[#1a1f1c] focus:bg-[#131615] border border-[#2b332e] focus:border-[#7E9F89] text-xs sm:text-sm text-[#ECEEEB] placeholder-[#808B84] focus:outline-none focus:ring-1 focus:ring-[#7E9F89]/30 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#808B84] hover:text-white"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 justify-end shrink-0">
            {/* Primary "+ Add memory" CTA */}
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-[#4E6B58] hover:bg-[#3D5545] active:scale-95 text-white text-xs sm:text-sm font-medium transition-all shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 stroke-[2]" />
              <span>+ Add memory</span>
            </button>

            {/* Secondary Overflow Menu */}
            <div className="relative">
              <button
                onClick={() => setShowOverflowMenu(!showOverflowMenu)}
                className="w-9 h-9 rounded-xl bg-[#131615] hover:bg-[#232926] border border-[#2b332e] flex items-center justify-center text-[#808B84] hover:text-[#ECEEEB] transition-all cursor-pointer"
                title="More actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showOverflowMenu && (
                <div className="absolute right-0 top-11 w-48 bg-[#181c1b] border border-[#2b332e] rounded-xl shadow-2xl py-1.5 z-50 text-xs text-[#ECEEEB]">
                  {onOpenGallery && (
                    <button
                      onClick={() => {
                        onOpenGallery();
                        setShowOverflowMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-white/5 transition-colors flex items-center gap-2 text-[#7E9F89] font-medium"
                    >
                      <Images className="w-3.5 h-3.5 text-[#7E9F89]" />
                      <span>Gallery</span>
                    </button>
                  )}
                  {onOpenRecycleBin && (
                    <button
                      onClick={() => {
                        onOpenRecycleBin();
                        setShowOverflowMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-white/5 transition-colors flex items-center gap-2 text-rose-300 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Recycle Bin</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowStats((s) => !s);
                      setShowOverflowMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-white/5 transition-colors flex items-center gap-2 text-[#808B84] hover:text-[#ECEEEB]"
                  >
                    <Award className="w-3.5 h-3.5 text-[#7E9F89]" />
                    <span>{showStats ? 'Hide Statistics' : 'Show Statistics'}</span>
                  </button>
                  <button
                    onClick={() => {
                      loadIncidents();
                      setShowOverflowMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-white/5 transition-colors flex items-center gap-2 text-[#808B84] hover:text-[#ECEEEB]"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Optional Stats Banner ── */}
        {showStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2.5 px-3 mb-2 rounded-2xl bg-[#1b1e25] border border-[#2c3240] animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="text-center p-2 rounded-xl bg-black/20">
              <div className="text-[10px] text-[#8e918f] font-semibold uppercase">Total Moments</div>
              <div className="text-base font-extrabold text-white">{stats.total}</div>
            </div>
            <div className="text-center p-2 rounded-xl bg-black/20">
              <div className="text-[10px] text-[#8e918f] font-semibold uppercase">Photos Attached</div>
              <div className="text-base font-extrabold text-amber-400">{stats.withPhoto}</div>
            </div>
            <div className="text-center p-2 rounded-xl bg-black/20">
              <div className="text-[10px] text-[#8e918f] font-semibold uppercase">Words Recorded</div>
              <div className="text-base font-extrabold text-pink-400">{stats.totalWords}</div>
            </div>
            <div className="text-center p-2 rounded-xl bg-black/20">
              <div className="text-[10px] text-[#8e918f] font-semibold uppercase">First Milestone</div>
              <div className="text-xs font-mono font-bold text-sky-400 truncate">{stats.earliest}</div>
            </div>
          </div>
        )}

        {/* ── Special Date Counter Milestone Card (20 May 2026, 7:30) ── */}
        <div
          onClick={() => setShowMilestoneModal(true)}
          className="p-3.5 sm:p-4 rounded-xl bg-[#181c1b] border border-[#2b332e] hover:border-[#3d4941] shadow-xs cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2a1d20] border border-[#48282e] text-[#D48D98] flex items-center justify-center shrink-0">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold text-[#ECEEEB]">Milestone Countdown</span>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#2a1d20] text-[#D48D98] border border-[#48282e]">
                  20 May 2026, 7:30
                </span>
              </div>
              <p className="text-[11px] text-[#808B84] mt-0.5">
                Every second counted since our journey began
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#131615] px-3 py-1.5 rounded-lg border border-[#232926] font-mono text-xs">
            <div className="text-center px-1">
              <span className="text-sm sm:text-base font-semibold text-[#D48D98]">{dateCount.days}</span>
              <span className="text-[9px] text-[#808B84] uppercase ml-1">Days</span>
            </div>
            <span className="text-[#3d4941]">:</span>
            <div className="text-center px-1">
              <span className="text-sm sm:text-base font-semibold text-[#ECEEEB]">{String(dateCount.hours).padStart(2, '0')}</span>
              <span className="text-[9px] text-[#808B84] uppercase ml-1">h</span>
            </div>
            <span className="text-[#3d4941]">:</span>
            <div className="text-center px-1">
              <span className="text-sm sm:text-base font-semibold text-[#ECEEEB]">{String(dateCount.minutes).padStart(2, '0')}</span>
              <span className="text-[9px] text-[#808B84] uppercase ml-1">m</span>
            </div>
            <span className="text-[#3d4941]">:</span>
            <div className="text-center px-1">
              <span className="text-sm sm:text-base font-semibold text-[#7E9F89]">{String(dateCount.seconds).padStart(2, '0')}</span>
              <span className="text-[9px] text-[#808B84] uppercase ml-1">s</span>
            </div>
          </div>
        </div>

        {/* ── Filters & Category Tags ── */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pt-1">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedTag === 'all'
                  ? 'bg-[#2b3a30] text-[#7E9F89] border border-[#3d5244] shadow-xs'
                  : 'bg-[#181c1b] text-[#808B84] hover:text-[#ECEEEB] border border-[#2b332e]'
              }`}
            >
              All Moments{incidents.length > 0 ? ` (${incidents.length})` : ''}
            </button>
            {PRESET_TAGS.map((t) => {
              const count = incidents.filter((i) => i.tag === t.id).length;
              const isActive = selectedTag === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTag(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#2b3a30] text-[#7E9F89] border border-[#3d5244] shadow-xs'
                      : 'bg-[#181c1b] text-[#808B84] hover:text-[#ECEEEB] border border-[#2b332e]'
                  }`}
                >
                  <span>{t.label}</span>
                  {count > 0 && <span className="text-[10px] opacity-75 font-mono">({count})</span>}
                </button>
              );
            })}
          </div>

          {/* Sort order toggle */}
          <button
            onClick={() => setSortOrder((s) => (s === 'oldest' ? 'newest' : 'oldest'))}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181c1b] hover:bg-[#232926] border border-[#2b332e] text-[#ECEEEB] text-xs font-medium transition-all shrink-0 cursor-pointer"
            title="Toggle chronological timeline order"
          >
            <Filter className="w-3.5 h-3.5 text-[#7E9F89]" />
            <span>{sortOrder === 'oldest' ? 'Oldest First' : 'Newest First'}</span>
          </button>
        </div>
      </header>

      {/* ────────────────── MAIN CHRONOLOGICAL TIMELINE STREAM ────────────────── */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Skeletons Loading */}
          {loading && (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 rounded-2xl bg-[#181c1b] animate-pulse border border-[#2b332e]"
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredIncidents.length === 0 && (
            <div className="text-center py-20 px-6 bg-[#181c1b] rounded-2xl border border-[#2b332e] shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[#1d2420] border border-[#2b3a30] flex items-center justify-center text-[#7E9F89] mx-auto mb-4">
                <BookOpen className="w-7 h-7 stroke-[1.75]" />
              </div>
              <h3 className="text-base font-semibold text-[#ECEEEB] mb-1.5">
                {searchQuery || selectedTag !== 'all'
                  ? 'No matching memories found'
                  : 'No memories yet'}
              </h3>
              <p className="text-xs text-[#808B84] max-w-sm mx-auto mb-6 leading-relaxed">
                {searchQuery || selectedTag !== 'all'
                  ? 'Try clearing the search query or category filter to view all memories.'
                  : 'Save a photo, a date, or a story you want to remember.'}
              </p>
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4E6B58] hover:bg-[#3D5545] text-white text-xs font-medium shadow-xs mx-auto cursor-pointer transition-colors"
              >
                <PlusCircle className="w-4 h-4 stroke-[2]" />
                <span>+ Add memory</span>
              </button>
            </div>
          )}

          {/* Chronological Era Timeline Groups */}
          {!loading &&
            filteredIncidents.length > 0 &&
            eraGroups.map((group, groupIdx) => (
              <section key={group.era} className="space-y-6">
                {/* Era Marker Pill */}
                <div className="sticky top-2 z-20 flex items-center gap-3 py-1">
                  <div className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#181c1b]/95 backdrop-blur-xs border border-[#2b332e] text-[#ECEEEB] text-xs font-medium shadow-xs">
                    <Sparkles className="w-3 h-3 text-[#7E9F89]" />
                    <span>{group.era}</span>
                    <span className="text-[10px] text-[#808B84] font-mono">
                      ({group.items.length})
                    </span>
                  </div>
                  <div className="flex-1 h-[1px] bg-[#2b332e]" />
                </div>

                {/* Track Line with Incident Cards */}
                <div className="relative pl-7 sm:pl-9 border-l border-[#2b332e] space-y-7">
                  {group.items.map((inc) => {
                    const tagCfg = getTagConfig(inc.tag);
                    const dateObj = new Date(inc.timestamp || inc.incidentDate);
                    const formattedDate = !isNaN(dateObj.getTime())
                      ? dateObj.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : inc.incidentDate;
                    const relativeTime = formatRelativeTime(inc.timestamp);

                    return (
                      <article
                        key={inc.id}
                        className="relative bg-[#181c1b] border border-[#2b332e] hover:border-[#3d4941] rounded-2xl p-5 sm:p-6 shadow-xs transition-colors group"
                      >
                        {/* Clean Node Dot on Timeline Track */}
                        <div
                          className="absolute -left-[35px] sm:-left-[43px] top-6 w-4 h-4 rounded-full bg-[#131615] flex items-center justify-center transition-transform"
                          style={{ border: `2px solid ${tagCfg.dotColor}` }}
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: tagCfg.dotColor }}
                          />
                        </div>

                        {/* Header Row: Date Badge, Tag, Location & Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2b332e] pb-3 mb-4">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Calendar Date Badge */}
                            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#131615] text-[#ECEEEB] text-xs font-medium font-mono border border-[#232926]">
                              <Calendar className="w-3.5 h-3.5 text-[#7E9F89]" />
                              <span>{inc.incidentDate || formattedDate}</span>
                            </span>

                            {/* Relative time chip */}
                            <span className="text-[11px] text-[#808B84]">
                              • {relativeTime}
                            </span>

                            {/* Category Tag */}
                            {inc.tag && (
                              <span
                                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                                style={{
                                  backgroundColor: tagCfg.bgGlow,
                                  color: tagCfg.color,
                                  border: `1px solid ${tagCfg.borderColor}`,
                                }}
                              >
                                <Tag className="w-3 h-3" />
                                <span>{inc.tag}</span>
                              </span>
                            )}

                            {/* Location Pin */}
                            {inc.location && (
                              <span className="flex items-center gap-1 text-[11px] text-[#8e918f] ml-1">
                                <MapPin className="w-3 h-3 text-amber-400" />
                                <span>{inc.location}</span>
                              </span>
                            )}
                          </div>

                          {/* Action Buttons: Copy, Edit & Delete */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleCopyStory(inc)}
                              className="p-1.5 rounded-full hover:bg-white/10 text-[#8e918f] hover:text-white transition-colors cursor-pointer"
                              title="Copy Story"
                            >
                              {copiedId === inc.id ? (
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleOpenEdit(inc)}
                              className="p-1.5 rounded-full hover:bg-white/10 text-[#8e918f] hover:text-[#8ab4f8] transition-colors cursor-pointer"
                              title="Edit Incident"
                            >
                              <Edit2 className="w-4 h-4 text-[#8ab4f8]" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(inc)}
                              className="p-1.5 rounded-full hover:bg-rose-500/20 text-[#8e918f] hover:text-rose-400 transition-colors cursor-pointer"
                              title="Delete Incident"
                            >
                              <Trash2 className="w-4 h-4 text-rose-400" />
                            </button>
                          </div>
                        </div>

                        {/* Headline Title */}
                        <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mb-3.5 leading-snug">
                          {inc.title}
                        </h2>

                        {/* Incident Photo (if uploaded) */}
                        {inc.photoUrl && (
                          <div
                            onClick={() => openPhotoLightbox(inc)}
                            className="relative max-h-80 sm:max-h-96 rounded-2xl overflow-hidden bg-black/50 border border-[#2c3240] mb-4 cursor-pointer group/photo shadow-inner"
                          >
                            <img
                              src={inc.photoUrl}
                              alt={inc.title}
                              className="w-full h-full max-h-80 sm:max-h-96 object-cover object-center group-hover/photo:scale-102 transition-transform duration-300"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/25 group-hover/photo:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover/photo:opacity-100">
                              <span className="px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-xs font-bold text-white flex items-center gap-1.5 shadow-lg">
                                <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                                <span>View Photo Fullscreen</span>
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Written Incident Story Description */}
                        <div className="bg-[#121418] p-4 sm:p-5 rounded-2xl border border-[#242730] text-xs sm:text-sm text-[#e3e3e3] leading-relaxed whitespace-pre-line shadow-inner">
                          {inc.incidentText}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
        </div>
      </main>

      {/* ────────────────── ADD / EDIT INCIDENT MODAL ────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-150 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-[#1a1d24] border border-[#343a48] rounded-3xl p-5 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-150 my-6">
            <div className="flex items-center justify-between border-b border-[#282d38] pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#1d2420] border border-[#2b3a30] flex items-center justify-center text-[#7E9F89]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-[#ECEEEB]">
                    {editingIncident ? 'Edit Memory' : 'New Memory'}
                  </h3>
                  <p className="text-[11px] text-[#808B84]">
                    Save photos, dates &amp; meaningful memories
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-[#242934] hover:bg-[#2e3442] text-[#8e918f] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Incident Date Picker + Quick Chips */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#8e918f] uppercase">
                    Incident Date *
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setQuickDate('today')}
                      className="px-2 py-0.5 rounded-md bg-[#242934] hover:bg-[#2e3442] text-[10px] font-semibold text-amber-300"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate('yesterday')}
                      className="px-2 py-0.5 rounded-md bg-[#242934] hover:bg-[#2e3442] text-[10px] font-semibold text-[#8e918f] hover:text-white"
                    >
                      Yesterday
                    </button>
                  </div>
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#121418] border border-[#2e3340] focus:border-amber-400 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-400/40 transition-all font-mono"
                  required
                />
              </div>

              {/* Incident Headline Title */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#8e918f] uppercase">
                    Incident Headline / Title *
                  </label>
                  <span className="text-[10px] text-[#8e918f]">{title.length}/100</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. The Rainy Campus Walk, First Date at Corner Cafe"
                  value={title}
                  maxLength={100}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#121418] border border-[#2e3340] focus:border-amber-400 text-sm text-white placeholder-[#8e918f] focus:outline-none focus:ring-1 focus:ring-amber-400/40 transition-all"
                />
              </div>

              {/* Category / Mood Selector */}
              <div>
                <label className="block text-xs font-bold text-[#8e918f] mb-1.5 uppercase">
                  Category / Mood
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TAGS.map((t) => {
                    const isSelected = tag === t.id;
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setTag(t.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/25 text-amber-300 border border-amber-400 font-bold shadow-sm'
                            : 'bg-[#121418] text-[#8e918f] hover:text-white border border-[#2e3340]'
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Full Incident Story Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#8e918f] uppercase">
                    What incident happened? (Story Details) *
                  </label>
                  <span className="text-[10px] text-[#8e918f]">
                    {storyText.trim() ? storyText.trim().split(/\s+/).length : 0} words
                  </span>
                </div>
                <textarea
                  placeholder="Write the complete story of what happened that day. What made it memorable? How did you feel? What words were said?"
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  rows={4}
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-[#121418] border border-[#2e3340] focus:border-amber-400 text-xs sm:text-sm text-white placeholder-[#8e918f] focus:outline-none focus:ring-1 focus:ring-amber-400/40 leading-relaxed transition-all resize-none"
                />
              </div>

              {/* Photo Attachment with Live Preview */}
              <div>
                <label className="block text-xs font-bold text-[#8e918f] mb-1.5 uppercase">
                  Attach Photo (Optional)
                </label>

                {photoPreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-[#2e3340] max-h-48 bg-black/40">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full max-h-48 object-cover object-center"
                    />
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                      title="Remove Photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => photoInputRef.current?.click()}
                    className="p-4 rounded-2xl border-2 border-dashed border-[#2e3340] hover:border-amber-400/60 bg-[#121418]/60 hover:bg-amber-500/5 transition-all text-center cursor-pointer"
                  >
                    <Camera className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-white">
                      Click to browse or drop photo here
                    </p>
                    <p className="text-[10px] text-[#8e918f] mt-0.5">
                      JPG, PNG, WEBP, GIF supported
                    </p>
                  </div>
                )}

                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </div>

              {/* Location (Optional) */}
              <div>
                <label className="block text-xs font-bold text-[#8e918f] mb-1.5 uppercase">
                  Location (Optional)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e918f]" />
                  <input
                    type="text"
                    placeholder="e.g. Campus Lawn, Library 3rd Floor, Corner Cafe"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-[#121418] border border-[#2e3340] focus:border-amber-400 text-sm text-white placeholder-[#8e918f] focus:outline-none focus:ring-1 focus:ring-amber-400/40 transition-all"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#282d38]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-full bg-[#20242c] hover:bg-[#282d38] text-xs font-semibold text-[#8e918f] hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#4E6B58] hover:bg-[#3D5545] text-white text-xs sm:text-sm font-medium transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving…</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2]" />
                      <span>{editingIncident ? 'Save Changes' : '+ Save Memory'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────── DELETE CONFIRMATION MODAL ────────────────── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[220] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm bg-[#1a1d24] border border-[#343a48] rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">Delete from Life Timeline?</h3>
              <p className="text-xs text-[#8e918f] leading-relaxed">
                Are you sure you want to delete{' '}
                <strong className="text-white">"{deleteTarget.title}"</strong>? This incident and
                its story will be permanently removed.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-full bg-[#20242c] hover:bg-[#282d38] text-xs font-semibold text-[#8e918f] hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── FULLSCREEN PHOTO VIEWER LIGHTBOX ────────────────── */}
      {currentPreviewIncident && previewIncidentIdx !== null && (
        <div
          className="fixed inset-0 z-[250] bg-black/95 flex flex-col justify-between p-4 backdrop-blur-md animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          {/* Lightbox Topbar */}
          <div className="flex items-center justify-between z-10 px-2 py-1">
            <div>
              <h4 className="text-sm font-bold text-white">
                {currentPreviewIncident.title}
              </h4>
              <p className="text-xs text-[#8e918f]">
                {currentPreviewIncident.incidentDate} •{' '}
                {previewIncidentIdx + 1} of {photoIncidents.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {currentPreviewIncident.photoUrl && (
                <a
                  href={currentPreviewIncident.photoUrl}
                  download={`incident-${currentPreviewIncident.title}.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                  title="Download photo"
                >
                  <Share2 className="w-4 h-4" />
                </a>
              )}
              <button
                onClick={() => setPreviewIncidentIdx(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                title="Close viewer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Center Stage */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            {photoIncidents.length > 1 && (
              <button
                onClick={() =>
                  setPreviewIncidentIdx((prev) =>
                    prev !== null
                      ? (prev - 1 + photoIncidents.length) % photoIncidents.length
                      : 0,
                  )
                }
                className="absolute left-2 sm:left-4 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                title="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img
              src={currentPreviewIncident.photoUrl}
              alt={currentPreviewIncident.title}
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />

            {photoIncidents.length > 1 && (
              <button
                onClick={() =>
                  setPreviewIncidentIdx((prev) =>
                    prev !== null ? (prev + 1) % photoIncidents.length : 0,
                  )
                }
                className="absolute right-2 sm:right-4 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                title="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Lightbox Caption Story Overlay */}
          <div className="max-w-2xl mx-auto w-full bg-[#17191e]/90 border border-white/10 rounded-2xl p-4 text-xs sm:text-sm text-[#e3e3e3] leading-relaxed shadow-2xl">
            <div className="font-semibold text-amber-300 text-xs mb-1">
              Memory Narrative:
            </div>
            <p className="line-clamp-3">{currentPreviewIncident.incidentText}</p>
          </div>
        </div>
      )}

      {/* ── SPECIAL MILESTONE DATE COUNTER MODAL (20 MAY 2026, 7:30) ── */}
      <DateCounterModal
        isOpen={showMilestoneModal}
        onClose={() => setShowMilestoneModal(false)}
        partnerName="Sadhana"
        isDark={true}
      />

      {/* ────────────────── TOAST ALERT ────────────────── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] px-5 py-2.5 rounded-full bg-[#1e222b] border border-amber-500/40 text-white text-xs sm:text-sm font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-150">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
};

export default LifeTimelineView;
