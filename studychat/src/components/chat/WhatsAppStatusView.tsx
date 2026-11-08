import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CircleDot,
  Plus,
  Sparkles,
  Heart,
  MessageSquare,
  Images,
  GitBranch,
  Send,
  Lock,
  X
} from 'lucide-react';

interface WhatsAppStatusViewProps {
  isDark?: boolean;
  studentName?: string;
  partnerName?: string;
  partnerUser?: 'surya' | 'sadhana';
  isPartnerOnline?: boolean;
  partnerLastSeen?: number | null;
  dateCount?: {
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
    totalDays?: number;
    dateStr?: string;
  } | string | null;
  onBackToChat?: () => void;
  onOpenGallery?: () => void;
  onOpenTimeline?: () => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  doodleSvgUri?: string;
}

const PRESET_STATUSES = [
  'Studying for upcoming exams 📚',
  'Available to chat on Dharya 💬',
  'In college / lectures 🏫',
  'Listening to music 🎧',
  'Thinking of you ❤️',
  'Coding new features ✨',
];

export const WhatsAppStatusView: React.FC<WhatsAppStatusViewProps> = ({
  isDark = false,
  studentName = 'Surya',
  partnerName = 'Sadhana',
  isPartnerOnline = false,
  partnerLastSeen,
  dateCount,
  onBackToChat,
  onOpenGallery,
  onOpenTimeline,
  showToast,
  doodleSvgUri,
}) => {
  const [myStatus, setMyStatus] = useState<string>(() => {
    try {
      return localStorage.getItem('dharya_my_status') || 'Loving every moment with you ✨';
    } catch {
      return 'Loving every moment with you ✨';
    }
  });

  const [partnerStatus] = useState<string>(() => {
    try {
      return localStorage.getItem('dharya_partner_status') || 'Always by your side ❤️';
    } catch {
      return 'Always by your side ❤️';
    }
  });

  const [isEditingMyStatus, setIsEditingMyStatus] = useState(false);
  const [editingText, setEditingText] = useState(myStatus);
  const [selectedStory, setSelectedStory] = useState<'my' | 'partner' | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('dharya_my_status', myStatus);
    } catch {
      // ignore
    }
  }, [myStatus]);

  const handleSaveStatus = () => {
    if (!editingText.trim()) return;
    setMyStatus(editingText.trim());
    setIsEditingMyStatus(false);
    if (showToast) {
      showToast('Status updated successfully!', 'success');
    }
  };

  const formattedDateCount = typeof dateCount === 'string'
    ? dateCount
    : dateCount
    ? `${dateCount.dateStr || '20 May 2026'} • ${dateCount.days ?? 0}d ${dateCount.hours ?? 0}h ${dateCount.minutes ?? 0}m ${dateCount.seconds ?? 0}s`
    : null;

  const formattedLastSeen = partnerLastSeen
    ? `Last seen today at ${new Date(partnerLastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'Last seen today';

  return (
    <div
      className={`w-full h-full flex flex-col overflow-y-auto select-none transition-colors ${
        isDark ? 'bg-[#0c1317] text-[#e9edef]' : 'bg-[#f0f2f5] text-[#111b21]'
      }`}
      style={
        doodleSvgUri
          ? {
              backgroundImage: `url("${doodleSvgUri}")`,
              backgroundRepeat: 'repeat',
            }
          : undefined
      }
    >
      {/* ── Top Header ── */}
      <header
        className={`px-4 sm:px-6 py-3.5 flex items-center justify-between border-b sticky top-0 z-20 backdrop-blur-md shadow-sm ${
          isDark
            ? 'bg-[#1f2c34]/95 border-[#2a3942]'
            : 'bg-white/95 border-[#e2e8f0]'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToChat}
            className={`p-2 rounded-full transition-colors ${
              isDark
                ? 'hover:bg-white/10 text-[#aebac1] hover:text-white'
                : 'hover:bg-slate-100 text-[#54656f] hover:text-[#111b21]'
            }`}
            title="Back to Chat"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <CircleDot className="w-5 h-5 text-emerald-500 animate-pulse" />
              <h1 className="text-base sm:text-lg font-bold tracking-tight">Status & Presence</h1>
            </div>
            <p className={`text-xs ${isDark ? 'text-[#8696a0]' : 'text-slate-500'}`}>
              Real-time updates, presence & private notes
            </p>
          </div>
        </div>

        {/* Live partner badge */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              isPartnerOnline
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-500/10 border-slate-500/20 text-slate-500'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isPartnerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span>{isPartnerOnline ? `${partnerName} is Online` : 'Last seen recently'}</span>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* ── Relationship Banner ── */}
        {formattedDateCount && (
          <div
            className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 border transition-all ${
              isDark
                ? 'bg-gradient-to-r from-emerald-950/40 via-[#182229] to-sky-950/40 border-[#2a3942]'
                : 'bg-gradient-to-r from-emerald-50 via-white to-sky-50 border-emerald-100 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-md">
                  <Heart className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-bold text-rose-500">
                    Relationship Journey
                  </p>
                  <p className="text-sm sm:text-base font-bold mt-0.5">{formattedDateCount}</p>
                </div>
              </div>
              <button
                onClick={onOpenTimeline}
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-colors"
              >
                <span>Timeline</span>
                <GitBranch className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ── Status Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* 1. My Status Card */}
          <div
            className={`rounded-2xl p-5 border transition-all ${
              isDark
                ? 'bg-[#182229] border-[#2a3942]'
                : 'bg-white border-[#e2e8f0] shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600">
                My Status
              </h2>
              <button
                onClick={() => {
                  setEditingText(myStatus);
                  setIsEditingMyStatus(!isEditingMyStatus);
                }}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isEditingMyStatus ? 'Cancel' : 'Update'}
              </button>
            </div>

            <div className="flex items-start gap-4">
              {/* Avatar with Status Ring */}
              <div
                onClick={() => setSelectedStory('my')}
                className="relative cursor-pointer shrink-0 group"
              >
                <div className="w-14 h-14 rounded-full p-[2.5px] bg-gradient-to-tr from-emerald-500 via-teal-400 to-blue-500 shadow-md">
                  <div className="w-full h-full rounded-full bg-[#00a884] flex items-center justify-center text-white font-bold text-lg">
                    {studentName[0]?.toUpperCase() || 'S'}
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center ring-2 ring-white dark:ring-[#182229]">
                  <Plus className="w-3 h-3 stroke-[3]" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{studentName}</p>
                <p className={`text-xs mt-0.5 line-clamp-2 ${isDark ? 'text-[#8696a0]' : 'text-slate-600'}`}>
                  "{myStatus}"
                </p>
                <p className={`text-[10px] mt-1.5 ${isDark ? 'text-[#8696a0]' : 'text-slate-400'}`}>
                  Visible only to {partnerName}
                </p>
              </div>
            </div>

            {/* In-place editor */}
            {isEditingMyStatus && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    maxLength={100}
                    placeholder="Enter what's on your mind..."
                    className={`flex-1 px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? 'bg-[#111b21] border-[#2a3942] text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                  <button
                    onClick={handleSaveStatus}
                    className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shrink-0"
                    title="Save Status"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                {/* Preset suggestions */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRESET_STATUSES.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setEditingText(preset)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                        isDark
                          ? 'border-[#2a3942] hover:bg-white/5 text-[#8696a0]'
                          : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Partner's Status Card */}
          <div
            className={`rounded-2xl p-5 border transition-all ${
              isDark
                ? 'bg-[#182229] border-[#2a3942]'
                : 'bg-white border-[#e2e8f0] shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-600">
                {partnerName}'s Updates
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                {isPartnerOnline ? 'Active Now' : 'Recent'}
              </span>
            </div>

            <div className="flex items-start gap-4">
              {/* Partner Avatar with Status Ring */}
              <div
                onClick={() => setSelectedStory('partner')}
                className="relative cursor-pointer shrink-0 group"
              >
                <div
                  className={`w-14 h-14 rounded-full p-[2.5px] transition-all ${
                    isPartnerOnline
                      ? 'bg-gradient-to-tr from-emerald-400 via-teal-300 to-emerald-600 ring-2 ring-emerald-500/40 shadow-lg animate-pulse'
                      : 'bg-gradient-to-tr from-slate-400 to-slate-500'
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[#00a884] to-[#128c7e] flex items-center justify-center text-white font-bold text-lg">
                    {partnerName[0]?.toUpperCase() || 'P'}
                  </div>
                </div>
                {isPartnerOnline && (
                  <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#182229]" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm">{partnerName}</p>
                  {isPartnerOnline && (
                    <span className="text-[10px] font-semibold text-emerald-500">● Online</span>
                  )}
                </div>
                <p className={`text-xs mt-0.5 line-clamp-2 ${isDark ? 'text-[#8696a0]' : 'text-slate-600'}`}>
                  "{partnerStatus}"
                </p>
                <p className={`text-[10px] mt-1.5 ${isDark ? 'text-[#8696a0]' : 'text-slate-400'}`}>
                  {isPartnerOnline ? 'Active right now on Dharya' : formattedLastSeen}
                </p>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <button
                onClick={onBackToChat}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-[#00a884] hover:bg-[#008f6f] text-white transition-colors shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </button>
              <button
                onClick={() => setSelectedStory('partner')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                  isDark
                    ? 'border-[#2a3942] hover:bg-white/5 text-[#8696a0]'
                    : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>View Story</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Quick Access Features ── */}
        <div
          className={`rounded-2xl p-5 border ${
            isDark ? 'bg-[#182229] border-[#2a3942]' : 'bg-white border-[#e2e8f0] shadow-sm'
          }`}
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Quick Navigation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={onBackToChat}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                isDark
                  ? 'border-[#2a3942] hover:bg-white/5 hover:border-blue-500/40'
                  : 'border-slate-200 hover:bg-blue-50/50 hover:border-blue-300'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">1. Chat</p>
                <p className="text-[11px] text-slate-500">Live conversation</p>
              </div>
            </button>

            <button
              onClick={onOpenGallery}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                isDark
                  ? 'border-[#2a3942] hover:bg-white/5 hover:border-emerald-500/40'
                  : 'border-slate-200 hover:bg-emerald-50/50 hover:border-emerald-300'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Images className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">3. Gallery</p>
                <p className="text-[11px] text-slate-500">Photos & media</p>
              </div>
            </button>

            <button
              onClick={onOpenTimeline}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                isDark
                  ? 'border-[#2a3942] hover:bg-white/5 hover:border-purple-500/40'
                  : 'border-slate-200 hover:bg-purple-50/50 hover:border-purple-300'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">4. Timeline</p>
                <p className="text-[11px] text-slate-500">Life milestones</p>
              </div>
            </button>
          </div>
        </div>

        {/* ── Security & Private Space Card ── */}
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-xs ${
            isDark
              ? 'bg-[#111b21] border-[#2a3942] text-[#8696a0]'
              : 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
          }`}
        >
          <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
          <p>
            Your presence, notes, and statuses are end-to-end isolated for Surya & Sadhana with PostgreSQL Row-Level Security.
          </p>
        </div>
      </div>

      {/* ── Story Modal Viewer ── */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 via-[#111b21] to-[#0c1317] text-white p-6 shadow-2xl border border-white/10">
            {/* Close button */}
            <button
              onClick={() => setSelectedStory(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center font-bold text-lg text-white">
                {selectedStory === 'partner' ? partnerName[0] : studentName[0]}
              </div>
              <div>
                <h4 className="font-bold text-base">
                  {selectedStory === 'partner' ? partnerName : studentName}
                </h4>
                <p className="text-xs text-white/60">
                  {selectedStory === 'partner' && isPartnerOnline ? 'Online now' : 'Status update'}
                </p>
              </div>
            </div>

            {/* Story Content Box */}
            <div className="my-8 text-center px-4 py-8 rounded-2xl bg-white/5 border border-white/10">
              <Sparkles className="w-7 h-7 text-amber-400 mx-auto mb-3" />
              <p className="text-lg font-medium tracking-tight text-white/90">
                "{selectedStory === 'partner' ? partnerStatus : myStatus}"
              </p>
              {formattedDateCount && (
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300">
                  <Heart className="w-3.5 h-3.5 fill-rose-300" />
                  <span>{formattedDateCount}</span>
                </div>
              )}
            </div>

            {/* Footer Quick Reaction */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedStory(null);
                  if (showToast) showToast('Sent ❤️ to status!', 'success');
                }}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>Love</span>
              </button>
              <button
                onClick={() => {
                  setSelectedStory(null);
                  onBackToChat && onBackToChat();
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#00a884] hover:bg-[#008f6f] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Reply</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
