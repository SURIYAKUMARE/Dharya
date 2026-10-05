/**
 * LifeTimelineView.tsx
 * Interactive Life Timeline where users can manually record life incidents and memories.
 * Features:
 * - Manually add life moments: Photo, Date, Headline Title, and Full Story of what incident happened!
 * - Chronological vertical timeline track with milestone pins and date badges
 * - Category/Mood tags & location indicators
 * - Edit and Delete life incidents with confirmation
 * - Real-time search across story texts, titles, and locations
 * - Fullscreen photo preview
 * - Persistent high-capacity storage backed by IndexedDB
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
} from 'lucide-react';
import { useStudyApp } from '../../context/StudyAppContext';
import {
  TimelineIncident,
  fetchTimelineIncidents,
  createTimelineIncident,
  updateTimelineIncident,
  deleteTimelineIncident,
} from '../../services/galleryService';

const PRESET_TAGS = [
  { id: 'Milestone', label: 'Milestone 💖' },
  { id: 'First Time', label: 'First Time ✨' },
  { id: 'Special Date', label: 'Special Date ☕' },
  { id: 'Trip & Travel', label: 'Trip & Travel ✈️' },
  { id: 'Campus Life', label: 'Campus Life 🎓' },
  { id: 'Funny Incident', label: 'Funny Incident 😄' },
  { id: 'Achievement', label: 'Achievement 🏆' },
];

export const LifeTimelineView: React.FC = () => {
  const { student, switchTab } = useStudyApp();
  const owner = student?.username || 'surya';

  // ── State ─────────────────────────────────────────────────────────
  const [incidents, setIncidents]       = useState<TimelineIncident[]>([]);
  const [loading, setLoading]           = useState(true);
  const [searchQuery, setSearchQuery]   = useState('');
  const [selectedTag, setSelectedTag]   = useState<string>('all');
  const [sortOrder, setSortOrder]       = useState<'oldest' | 'newest'>('oldest');

  // ── Add / Edit Modal ──────────────────────────────────────────────
  const [showModal, setShowModal]             = useState(false);
  const [editingIncident, setEditingIncident] = useState<TimelineIncident | null>(null);
  const [title, setTitle]                     = useState('');
  const [date, setDate]                       = useState('');
  const [storyText, setStoryText]             = useState('');
  const [tag, setTag]                         = useState('Milestone');
  const [location, setLocation]               = useState('');
  const [photoFile, setPhotoFile]             = useState<File | null>(null);
  const [photoPreview, setPhotoPreview]       = useState<string>('');

  // ── Delete Confirmation ───────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<TimelineIncident | null>(null);
  const [deleting, setDeleting]         = useState(false);

  // ── Lightbox Preview ──────────────────────────────────────────────
  const [previewIncident, setPreviewIncident] = useState<TimelineIncident | null>(null);

  // ── Toast ─────────────────────────────────────────────────────────
  const [toast, setToast] = useState<string | null>(null);
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
      console.warn('[LifeTimelineView] load error:', err);
    } finally {
      setLoading(false);
    }
  }, [owner]);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  // ── Filtered & Sorted Incidents ───────────────────────────────────
  const filteredIncidents = React.useMemo(() => {
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
          (i.incidentDate && i.incidentDate.includes(q)),
      );
    }

    list.sort((a, b) =>
      sortOrder === 'newest' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp,
    );

    return list;
  }, [incidents, selectedTag, searchQuery, sortOrder]);

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

  // ── File Selection ────────────────────────────────────────────────
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // ── Save Incident ─────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date.trim() || !storyText.trim()) {
      showToast('Please fill in title, date, and story');
      return;
    }

    const timestamp = new Date(date).getTime() || Date.now();

    if (editingIncident) {
      await updateTimelineIncident(
        editingIncident.id,
        {
          title: title.trim(),
          incidentDate: date,
          incidentText: storyText.trim(),
          tag,
          location: location.trim(),
          timestamp,
        },
        photoFile || undefined,
      );
      showToast('Life memory updated ✓');
    } else {
      await createTimelineIncident(
        {
          owner,
          title: title.trim(),
          incidentDate: date,
          incidentText: storyText.trim(),
          tag,
          location: location.trim(),
          timestamp,
        },
        photoFile || undefined,
      );
      showToast('Incident added to timeline ✓');
    }

    setShowModal(false);
    loadIncidents();
  };

  // ── Delete Incident ───────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await deleteTimelineIncident(deleteTarget.id);
    setDeleting(false);
    setIncidents((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    showToast('Memory deleted from timeline');
    setDeleteTarget(null);
  };

  return (
    <div
      className="w-full h-full flex flex-col bg-[#131314] text-[#e3e3e3] overflow-hidden select-none font-sans"
      role="region"
      aria-label="Life Timeline"
    >
      {/* ────────────────── TOP NAVBAR ────────────────── */}
      <header className="bg-[#1e1f20] border-b border-[#2d2f31] px-4 sm:px-6 py-3.5 shrink-0 shadow-sm z-30">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
              <Clock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  Life Timeline
                </h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#28292a] text-amber-300 border border-[#3c4043]">
                  {incidents.length} moments
                </span>
              </div>
              <p className="text-xs text-[#8e918f]">
                Record your real incidents, dates, photos &amp; stories manually
              </p>
            </div>
          </div>

          {/* Search Pill */}
          <div className="relative flex-1 max-w-sm mx-auto sm:mx-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e918f] pointer-events-none" />
            <input
              type="text"
              placeholder="Search incidents, stories, locations…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 rounded-full bg-[#28292a] hover:bg-[#333538] focus:bg-[#1e1f20] border border-[#3c4043] focus:border-amber-400 text-sm text-white placeholder-[#8e918f] focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8e918f] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 justify-end shrink-0">
            <button
              onClick={loadIncidents}
              disabled={loading}
              className="w-9 h-9 rounded-full bg-[#28292a] hover:bg-[#333538] border border-[#3c4043] flex items-center justify-center text-[#c4c7c5] hover:text-white transition-all cursor-pointer"
              title="Refresh timeline"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* PROMINENT "+ Add Life Incident" BUTTON */}
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>+ Add Life Incident</span>
            </button>
          </div>
        </div>

        {/* Filters & Sort Controls */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pt-1">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedTag === 'all'
                  ? 'bg-white text-black font-bold'
                  : 'bg-[#28292a] text-[#8e918f] hover:text-white'
              }`}
            >
              All Moments ({incidents.length})
            </button>
            {PRESET_TAGS.map((t) => {
              const count = incidents.filter((i) => i.tag === t.id).length;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTag(t.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    selectedTag === t.id
                      ? 'bg-amber-400 text-black font-bold'
                      : 'bg-[#28292a] text-[#8e918f] hover:text-white'
                  }`}
                >
                  <span>{t.label}</span>
                  {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
                </button>
              );
            })}
          </div>

          {/* Sort order toggle */}
          <button
            onClick={() => setSortOrder((s) => (s === 'oldest' ? 'newest' : 'oldest'))}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#28292a] hover:bg-[#333538] border border-[#3c4043] text-[#c4c7c5] text-xs font-semibold transition-all shrink-0 cursor-pointer"
            title="Toggle chronological order"
          >
            <Filter className="w-3 h-3" />
            <span>{sortOrder === 'oldest' ? 'Story Order (Oldest First)' : 'Newest First'}</span>
          </button>
        </div>
      </header>

      {/* ────────────────── MAIN TIMELINE STREAM ────────────────── */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Skeletons Loading */}
          {loading && (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-44 rounded-3xl bg-[#1e1f20] animate-pulse border border-[#2d2f31]" />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredIncidents.length === 0 && (
            <div className="text-center py-20 px-6 bg-[#1e1f20]/50 rounded-3xl border border-[#2d2f31]">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto mb-4">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                {searchQuery || selectedTag !== 'all' ? 'No matching incidents found' : 'Your Life Timeline is Ready'}
              </h3>
              <p className="text-xs sm:text-sm text-[#8e918f] max-w-sm mx-auto mb-6 leading-relaxed">
                {searchQuery || selectedTag !== 'all'
                  ? 'Try clearing the search query or tag filter.'
                  : 'Start writing your life journey! Add a photo, pick the date, and write what incident happened.'}
              </p>
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/30 mx-auto cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                <span>+ Write First Life Incident</span>
              </button>
            </div>
          )}

          {/* Chronological Timeline Track */}
          {!loading && filteredIncidents.length > 0 && (
            <div className="relative pl-6 sm:pl-8 border-l-2 border-[#3c4043] space-y-8 my-4">
              {filteredIncidents.map((inc) => {
                const dateObj = new Date(inc.timestamp);
                const formattedDate = dateObj.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                });

                return (
                  <article
                    key={inc.id}
                    className="relative bg-[#1e1f20] border border-[#2d2f31] hover:border-amber-400/50 rounded-3xl p-5 sm:p-7 shadow-md hover:shadow-2xl transition-all duration-200 group"
                  >
                    {/* Glowing Node Dot on Timeline Track */}
                    <div className="absolute -left-[31px] sm:-left-[39px] top-6 w-5 h-5 rounded-full bg-[#131314] border-3 border-amber-400 flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    </div>

                    {/* Header Row: Date Badge, Tag, Location & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2d2f31] pb-3 mb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Calendar Date Badge */}
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#28292a] text-amber-300 text-xs font-bold font-mono border border-[#3c4043]">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          <span>{inc.incidentDate || formattedDate}</span>
                        </span>

                        {/* Category Tag */}
                        {inc.tag && (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#28292a] text-[#c4c7c5] text-[11px] font-medium border border-[#3c4043]">
                            <Tag className="w-3 h-3 text-rose-400" />
                            <span>{inc.tag}</span>
                          </span>
                        )}

                        {/* Location Pin */}
                        {inc.location && (
                          <span className="flex items-center gap-1 text-[11px] text-[#8e918f]">
                            <MapPin className="w-3 h-3 text-amber-400" />
                            <span>{inc.location}</span>
                          </span>
                        )}
                      </div>

                      {/* Action Buttons: Edit & Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(inc)}
                          className="p-1.5 rounded-full hover:bg-white/10 text-[#8e918f] hover:text-white transition-colors cursor-pointer"
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
                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-3">
                      {inc.title}
                    </h3>

                    {/* Incident Photo (if uploaded) */}
                    {inc.photoUrl && (
                      <div
                        onClick={() => setPreviewIncident(inc)}
                        className="relative max-h-80 sm:max-h-96 rounded-2xl overflow-hidden bg-black/40 border border-[#2d2f31] mb-4 cursor-pointer group/photo shadow-inner"
                      >
                        <img
                          src={inc.photoUrl}
                          alt={inc.title}
                          className="w-full h-full max-h-80 sm:max-h-96 object-cover object-center group-hover/photo:scale-102 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover/photo:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover/photo:opacity-100">
                          <span className="px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm text-xs font-semibold text-white flex items-center gap-1.5">
                            <ZoomIn className="w-3.5 h-3.5" />
                            <span>View Photo Fullscreen</span>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Written Incident Story Description */}
                    <div className="bg-[#131314] p-4 sm:p-5 rounded-2xl border border-[#2d2f31] text-xs sm:text-sm text-[#e3e3e3] leading-relaxed whitespace-pre-line shadow-inner">
                      {inc.incidentText}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ────────────────── ADD / EDIT INCIDENT MODAL ────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-[#1e1f20] border border-[#3c4043] rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-[#2d2f31] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {editingIncident ? 'Edit Life Incident' : 'Add Incident to Life Timeline'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-[#8e918f] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Incident Headline Title */}
              <div>
                <label className="block text-xs font-bold text-[#8e918f] mb-1.5 uppercase">
                  Incident Headline / Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rainy Day Walk, First Trip to Ooty, Birthday Surprise"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#131314] border border-[#3c4043] text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-xs font-bold text-[#8e918f] mb-1.5 uppercase">
                  Date When Incident Happened *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#131314] border border-[#3c4043] text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Photo Upload Area */}
              <div>
                <label className="block text-xs font-bold text-[#8e918f] mb-1.5 uppercase">
                  Attach Photo (Optional)
                </label>
                {photoPreview ? (
                  <div className="relative rounded-2xl overflow-hidden max-h-48 border border-[#3c4043] bg-black">
                    <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview('');
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center cursor-pointer"
                      title="Remove photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => photoInputRef.current?.click()}
                    className="p-4 rounded-2xl border-2 border-dashed border-[#3c4043] hover:border-amber-400 bg-[#131314] text-center cursor-pointer transition-colors"
                  >
                    <Camera className="w-6 h-6 text-[#8e918f] mx-auto mb-1" />
                    <span className="text-xs text-[#c4c7c5] font-semibold block">
                      Click to upload photo for this incident
                    </span>
                    <span className="text-[10px] text-[#8e918f]">JPG, PNG, WEBP</span>
                  </div>
                )}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
              </div>

              {/* What incident happened? Text Area */}
              <div>
                <label className="block text-xs font-bold text-[#8e918f] mb-1.5 uppercase">
                  What Happened? (Write the full story / incident) *
                </label>
                <textarea
                  rows={4}
                  placeholder="Write what incident happened in detail... conversations, funny moments, thoughts, and why this day was unforgettable."
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#131314] border border-[#3c4043] text-white text-sm focus:outline-none focus:border-amber-400 leading-relaxed resize-none"
                />
              </div>

              {/* Tag & Location Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#8e918f] mb-1.5 uppercase">
                    Category Tag
                  </label>
                  <select
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#131314] border border-[#3c4043] text-white text-sm focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {PRESET_TAGS.map((t) => (
                      <option key={t.id} value={t.id} className="bg-[#1e1f20] text-white">
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8e918f] mb-1.5 uppercase">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Marina Beach, Corner Cafe"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#131314] border border-[#3c4043] text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-full bg-[#28292a] text-[#c4c7c5] hover:text-white text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white text-xs font-bold transition-all shadow-md shadow-amber-500/30 cursor-pointer"
                >
                  {editingIncident ? 'Update Incident' : 'Save to Timeline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────── DELETE INCIDENT CONFIRMATION MODAL ────────────────── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm bg-[#1e1f20] border border-[#3c4043] rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Incident?</h3>
                <p className="text-xs text-[#8e918f]">Remove this memory from life timeline</p>
              </div>
            </div>
            <p className="text-xs text-[#e3e3e3] bg-[#131314] p-3 rounded-2xl border border-[#2d2f31] mb-5">
              "{deleteTarget.title}" ({deleteTarget.incidentDate})
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-full bg-[#28292a] text-[#c4c7c5] hover:text-white text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-rose-600/30"
              >
                Delete Memory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── FULLSCREEN PHOTO VIEWER MODAL ────────────────── */}
      {previewIncident && previewIncident.photoUrl && (
        <div
          className="fixed inset-0 z-[250] flex flex-col justify-between bg-black/95 text-white p-4 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setPreviewIncident(null)}
        >
          <div className="flex items-center justify-between z-10">
            <div>
              <h2 className="text-base font-bold text-white">{previewIncident.title}</h2>
              <p className="text-xs text-[#8e918f]">{previewIncident.incidentDate}</p>
            </div>
            <button
              onClick={() => setPreviewIncident(null)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
            <img
              src={previewIncident.photoUrl}
              alt={previewIncident.title}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="max-w-xl mx-auto text-center text-xs text-[#c4c7c5] bg-[#1e1f20]/90 p-3 rounded-2xl border border-[#3c4043]">
            {previewIncident.incidentText}
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] px-4 py-2.5 rounded-full bg-[#1e1f20] border border-[#3c4043] text-white text-xs font-semibold shadow-2xl pointer-events-none">
          {toast}
        </div>
      )}
    </div>
  );
};

export default LifeTimelineView;
