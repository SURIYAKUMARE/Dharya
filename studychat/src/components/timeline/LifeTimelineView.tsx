/**
 * LifeTimelineView.tsx
 * 
 * Pixel-Perfect Winding Milestone Trail Design:
 * - Exact curved green dashed path with waypoints
 * - Heart loop in the center
 * - Teardrop location pins with pink ground anchor pills
 * - Pastel Mint Green & Blossom Pink milestone cards
 * - Full Dynamic Capabilities: Edit any card, Delete any card, Add new memories
 * - Persistent storage in localStorage so user changes are 100% saved
 * - Option to restore default demo template or clear all cards
 * - Bottom pill banner: "My Journey | Date Range | N Milestones"
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Calendar,
  Building2,
  GraduationCap,
  Award,
  Rocket,
  LayoutGrid,
  Code2,
  Trophy,
  Target,
  GitCommit,
  X,
  Copy,
  Check,
  PlusCircle,
  ArrowLeft,
  Sparkles,
  Heart,
  Pencil,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { useStudyApp } from '../../context/StudyAppContext';
import { DHARYA_LOGO_DATA_URI } from '../../assets/dharyaLogoDataUri';

export interface LifeTimelineViewProps {
  isDark?: boolean;
  onBackToChat?: () => void;
  onOpenGallery?: () => void;
  onOpenRecycleBin?: () => void;
}

export type MilestoneIconType =
  | 'building'
  | 'graduation'
  | 'medal'
  | 'rocket'
  | 'microsoft'
  | 'code'
  | 'trophy'
  | 'heart'
  | 'sparkles';

export interface MilestoneItem {
  id: string;
  theme: 'green' | 'pink';
  iconType: MilestoneIconType;
  dateStr: string;
  title: string;
  subtitle: string;
  description: string;
  isCustom?: boolean;
}

interface WaypointSlot {
  pinX: number;
  pinY: number;
  cardX: number;
  cardY: number;
  cardW: number;
  cardH: number;
  isFirstBase?: boolean;
}

const WAYPOINT_SLOTS: WaypointSlot[] = [
  { pinX: 100, pinY: 668, cardX: 140, cardY: 618, cardW: 290, cardH: 84, isFirstBase: true },
  { pinX: 300, pinY: 524, cardX: 350, cardY: 478, cardW: 280, cardH: 84 },
  { pinX: 482, pinY: 422, cardX: 508, cardY: 378, cardW: 260, cardH: 84 },
  { pinX: 318, pinY: 378, cardX: 60, cardY: 334, cardW: 240, cardH: 84 },
  { pinX: 500, pinY: 234, cardX: 526, cardY: 194, cardW: 260, cardH: 84 },
  { pinX: 364, pinY: 174, cardX: 90, cardY: 130, cardW: 250, cardH: 84 },
  { pinX: 544, pinY: 74, cardX: 570, cardY: 30, cardW: 260, cardH: 84 },
];

const INITIAL_DEFAULT_MILESTONES: MilestoneItem[] = [
  {
    id: 'm1',
    theme: 'green',
    iconType: 'building',
    dateStr: 'Jul 2024',
    title: 'College Began',
    subtitle: 'Started my Engineering journey',
    description: 'Started my Engineering journey at college. Meeting new friends, first lectures, and exciting dreams ahead for the four years to come.',
  },
  {
    id: 'm2',
    theme: 'pink',
    iconType: 'graduation',
    dateStr: 'Sep 2025',
    title: 'Year 2 – AIML',
    subtitle: 'Rathinam Technical Campus',
    description: 'Stepping into 2nd year Artificial Intelligence & Machine Learning specialization at Rathinam Technical Campus. Advanced curriculum and lab projects.',
  },
  {
    id: 'm3',
    theme: 'green',
    iconType: 'medal',
    dateStr: 'Jan 2026',
    title: 'Certification',
    subtitle: 'Completed Microsoft Fabric',
    description: 'Successfully completed the comprehensive Microsoft Fabric certification, demonstrating proficiency in cloud analytics and data workflows.',
  },
  {
    id: 'm4',
    theme: 'green',
    iconType: 'rocket',
    dateStr: 'Mar 2026',
    title: 'Project Launch',
    subtitle: 'TrustGuard AI (Live)',
    description: 'TrustGuard AI launched live into production! An intelligent real-time security framework with adaptive threat defense.',
  },
  {
    id: 'm5',
    theme: 'pink',
    iconType: 'microsoft',
    dateStr: 'Jun 2026',
    title: 'Internship',
    subtitle: 'Started Microsoft Internship',
    description: 'Kicked off prestigious software engineering summer internship at Microsoft, collaborating on enterprise cloud engineering systems.',
  },
  {
    id: 'm6',
    theme: 'pink',
    iconType: 'code',
    dateStr: 'Sep 2026',
    title: 'Hackathon',
    subtitle: 'Won SAKTHI HACKFEST\'26',
    description: 'Bagged the 1st prize championship at SAKTHI HACKFEST\'26 after building a high-impact prototype in 36 continuous hours.',
  },
  {
    id: 'm7',
    theme: 'green',
    iconType: 'trophy',
    dateStr: 'Nov 2026',
    title: 'SIH 2026',
    subtitle: 'Finalist – NIYAM Project',
    description: 'Selected as national grand finalists at Smart India Hackathon (SIH 2026) presenting the NIYAM Project to nationwide juries.',
  },
];

const STORAGE_KEY = 'dharya_timeline_milestones_v2';

export const LifeTimelineView: React.FC<LifeTimelineViewProps> = ({
  isDark = false,
  onBackToChat,
}) => {
  const { student } = useStudyApp();

  // Load from local storage or defaults
  const [milestones, setMilestones] = useState<MilestoneItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_DEFAULT_MILESTONES;
  });

  const saveMilestones = useCallback((items: MilestoneItem[]) => {
    setMilestones(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, []);

  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneItem | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<MilestoneItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetMenu, setShowResetMenu] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form states for adding custom memory
  const [customTitle, setCustomTitle] = useState('');
  const [customSubtitle, setCustomSubtitle] = useState('');
  const [customDate, setCustomDate] = useState('2026-04-15');
  const [customStory, setCustomStory] = useState('');
  const [customTheme, setCustomTheme] = useState<'green' | 'pink'>('pink');
  const [customIcon, setCustomIcon] = useState<MilestoneIconType>('heart');

  // Form states for editing milestone
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editDateStr, setEditDateStr] = useState('');
  const [editStory, setEditStory] = useState('');
  const [editTheme, setEditTheme] = useState<'green' | 'pink'>('green');
  const [editIcon, setEditIcon] = useState<MilestoneIconType>('building');

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }, []);

  const handleCopyStory = (title: string, date: string, desc: string) => {
    navigator.clipboard?.writeText(`📖 ${date} — ${title}\n"${desc}"`);
    setCopiedId(title);
    showToast('Copied milestone to clipboard ✨');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSaveCustomMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    // Convert date string into "Mon YYYY" format
    let dateLabel = customDate;
    try {
      const d = new Date(customDate);
      if (!isNaN(d.getTime())) {
        dateLabel = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
    } catch {}

    const newItem: MilestoneItem = {
      id: 'm_' + Date.now(),
      theme: customTheme,
      iconType: customIcon,
      dateStr: dateLabel,
      title: customTitle.trim(),
      subtitle: customSubtitle.trim() || 'Custom Milestone',
      description: customStory.trim() || 'A cherished milestone in our journey.',
      isCustom: true,
    };

    const updated = [...milestones, newItem];
    saveMilestones(updated);
    showToast('Recorded new milestone to timeline 🎉');
    setShowAddModal(false);

    // Reset fields
    setCustomTitle('');
    setCustomSubtitle('');
    setCustomStory('');
  };

  const handleOpenEdit = (m: MilestoneItem) => {
    setEditTitle(m.title);
    setEditSubtitle(m.subtitle);
    setEditDateStr(m.dateStr);
    setEditStory(m.description);
    setEditTheme(m.theme);
    setEditIcon(m.iconType);
    setEditingMilestone(m);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMilestone || !editTitle.trim()) return;

    const updatedItem: MilestoneItem = {
      ...editingMilestone,
      title: editTitle.trim(),
      subtitle: editSubtitle.trim() || 'Milestone',
      dateStr: editDateStr.trim(),
      description: editStory.trim(),
      theme: editTheme,
      iconType: editIcon,
    };

    const updatedList = milestones.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    saveMilestones(updatedList);
    setEditingMilestone(null);
    setSelectedMilestone(updatedItem);
    showToast('Milestone updated successfully ✏️');
  };

  const handleDeleteMilestone = (id: string) => {
    const updated = milestones.filter((item) => item.id !== id);
    saveMilestones(updated);
    setSelectedMilestone(null);
    setDeleteConfirmId(null);
    showToast('Milestone removed from timeline 🗑️');
  };

  const handleClearAll = () => {
    saveMilestones([]);
    setSelectedMilestone(null);
    setShowResetMenu(false);
    showToast('All demo cards cleared 🧹');
  };

  const handleRestoreDefaults = () => {
    saveMilestones(INITIAL_DEFAULT_MILESTONES);
    setSelectedMilestone(null);
    setShowResetMenu(false);
    showToast('Restored reference milestones 🔄');
  };

  const renderIcon = (type: MilestoneIconType, theme: 'green' | 'pink') => {
    const isGreen = theme === 'green';
    const color = isGreen ? '#1B7A38' : '#C2185B';

    switch (type) {
      case 'building':
        return <Building2 className="w-5 h-5 sm:w-6 sm:h-6" style={{ color }} strokeWidth={2.1} />;
      case 'graduation':
        return <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" style={{ color }} strokeWidth={2.1} />;
      case 'medal':
        return <Award className="w-5 h-5 sm:w-6 sm:h-6" style={{ color }} strokeWidth={2.1} />;
      case 'rocket':
        return <Rocket className="w-5 h-5 sm:w-6 sm:h-6" style={{ color }} strokeWidth={2.1} />;
      case 'microsoft':
        return <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6" style={{ color }} strokeWidth={2.1} />;
      case 'code':
        return <Code2 className="w-5 h-5 sm:w-6 sm:h-6" style={{ color }} strokeWidth={2.1} />;
      case 'trophy':
        return <Trophy className="w-5 h-5 sm:w-6 sm:h-6" style={{ color }} strokeWidth={2.1} />;
      case 'heart':
        return <Heart className="w-5 h-5 sm:w-6 sm:h-6" style={{ color }} strokeWidth={2.1} />;
      case 'sparkles':
      default:
        return <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" style={{ color }} strokeWidth={2.1} />;
    }
  };

  // Date range calculation for bottom banner
  const dateRangeStr = useMemo(() => {
    if (milestones.length === 0) return 'Start Your Journey';
    if (milestones.length === 1) return milestones[0].dateStr;
    return `${milestones[0].dateStr} – ${milestones[milestones.length - 1].dateStr}`;
  }, [milestones]);

  return (
    <div className="w-full h-full flex flex-col bg-[#FDFCF9] overflow-y-auto overflow-x-hidden font-sans select-none relative">
      {/* ── Toast Notification ── */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-white/10 animate-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-rose-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── Subtle Top Bar with Logo, Back, Reset & Add Action ── */}
      <div className="w-full max-w-[880px] mx-auto px-4 py-3 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2.5">
          {onBackToChat && (
            <button
              onClick={onBackToChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Chat</span>
            </button>
          )}

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="w-6 h-6 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-white flex items-center justify-center p-0.5">
              <img src={DHARYA_LOGO_DATA_URI} alt="Dharya Logo" className="w-full h-full object-contain rounded-md" />
            </div>
            <span className="text-xs font-bold text-slate-800">Dhanya</span>
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          {/* Reset / Clear Demo Menu */}
          <button
            onClick={() => setShowResetMenu((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Options to reset or clear demo cards"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Options</span>
          </button>

          {showResetMenu && (
            <div className="absolute top-10 right-24 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 text-xs font-semibold text-slate-700 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={handleRestoreDefaults}
                className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                <span>Restore Reference Demo</span>
              </button>
              <button
                onClick={handleClearAll}
                className="w-full px-3.5 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer border-t border-slate-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Cards</span>
              </button>
            </div>
          )}

          {/* + Add Memory Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>+ Add Memory</span>
          </button>
        </div>
      </div>

      {/* ── Main Canvas Stage Matching the Exact Reference Image ── */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 pb-8">
        <div className="w-full max-w-[860px] mx-auto">
          <svg
            viewBox="0 0 860 850"
            className="w-full h-auto drop-shadow-sm select-none"
            style={{ maxHeight: 'calc(100vh - 80px)' }}
          >
            {/* ── 1. The Continuous Green Dashed Path with Perfect Heart Center ── */}
            <path
              d="M 100 668 C 170 630, 240 580, 300 524 C 360 490, 430 460, 482 422 C 460 460, 330 450, 318 378 C 320 420, 360 400, 408 358 C 340 320, 340 268, 374 266 C 396 266, 408 282, 408 296 C 408 282, 420 266, 442 266 C 476 268, 476 320, 408 358 C 440 375, 510 320, 500 234 C 480 200, 410 200, 364 174 C 340 145, 470 120, 544 74"
              fill="none"
              stroke="#236B38"
              strokeWidth="2.8"
              strokeDasharray="6,6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* ── 2. Waypoint Pins and Glowing Pink Ground Pills ── */}
            {milestones.slice(0, 7).map((m, idx) => {
              const slot = WAYPOINT_SLOTS[idx];
              if (!slot) return null;

              if (slot.isFirstBase) {
                return (
                  <g key={`pin-${m.id}`} transform={`translate(${slot.pinX}, ${slot.pinY})`}>
                    {/* Wider Pink Pill Base */}
                    <rect x="-14" y="2" width="28" height="9" rx="4.5" fill="#FF2D78" />
                    {/* Teardrop Pin */}
                    <g transform="scale(1.15)">
                      <path
                        d="M 0 0 C -6 -8 -9 -14 -9 -19 C -9 -25 -5 -29 0 -29 C 5 -29 9 -25 9 -19 C 9 -14 6 -8 0 0 Z"
                        fill="#236B38"
                      />
                      <circle cx="0" cy="-19" r="3.2" fill="#FFFFFF" />
                    </g>
                  </g>
                );
              }

              return (
                <g key={`pin-${m.id}`} transform={`translate(${slot.pinX}, ${slot.pinY})`}>
                  {/* Pink Anchor Pill */}
                  <rect x="-9" y="1" width="18" height="6.5" rx="3.25" fill="#FF2D78" />
                  {/* Green Teardrop Map Pin */}
                  <path
                    d="M 0 0 C -6 -8 -9 -14 -9 -19 C -9 -25 -5 -29 0 -29 C 5 -29 9 -25 9 -19 C 9 -14 6 -8 0 0 Z"
                    fill="#236B38"
                  />
                  <circle cx="0" cy="-19" r="3.2" fill="#FFFFFF" />
                </g>
              );
            })}

            {/* ── Empty State if No Milestones ── */}
            {milestones.length === 0 && (
              <foreignObject x="230" y="440" width="400" height="120">
                <div className="w-full h-full rounded-2xl p-4 bg-white/90 border border-slate-200 text-center flex flex-col items-center justify-center shadow-lg">
                  <p className="text-sm font-bold text-slate-800">No milestones yet</p>
                  <p className="text-xs text-slate-500 mt-0.5 mb-2.5">Start crafting your life journey memory trail</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#236B38] text-white font-bold text-xs shadow-sm hover:opacity-90 cursor-pointer"
                  >
                    + Add Your First Milestone
                  </button>
                </div>
              </foreignObject>
            )}

            {/* ── 3. Exact Milestone Cards (Dynamic & Interactive) ── */}
            {milestones.slice(0, 7).map((m, idx) => {
              const slot = WAYPOINT_SLOTS[idx];
              if (!slot) return null;
              const isGreen = m.theme === 'green';

              return (
                <foreignObject
                  key={`card-${m.id}`}
                  x={slot.cardX}
                  y={slot.cardY}
                  width={slot.cardW}
                  height={slot.cardH}
                >
                  <div
                    onClick={() => setSelectedMilestone(m)}
                    className="w-full h-full cursor-pointer flex items-center p-3 rounded-[18px] transition-transform duration-150 hover:scale-[1.02] select-none group relative"
                    style={{
                      backgroundColor: isGreen ? '#EDF9F0' : '#FDF0F5',
                      border: `1px solid ${isGreen ? '#C2EAD0' : '#F9CDE0'}`,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03)',
                    }}
                  >
                    {/* Left Icon Container Box */}
                    <div
                      className="w-[46px] h-[46px] rounded-[14px] flex items-center justify-center shrink-0 mr-3"
                      style={{
                        backgroundColor: isGreen ? '#DBF5E2' : '#FCE0EC',
                        border: `1px solid ${isGreen ? '#B8ECC9' : '#F9BED4'}`,
                      }}
                    >
                      {renderIcon(m.iconType, m.theme)}
                    </div>

                    {/* Content Details */}
                    <div className="min-w-0 flex-1 leading-none pr-5">
                      {/* Top: Calendar + Date */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <Calendar
                          className="w-3 h-3 shrink-0"
                          style={{ color: isGreen ? '#1B7A38' : '#C2185B' }}
                        />
                        <span
                          className="text-[11.5px] font-semibold tracking-tight"
                          style={{ color: isGreen ? '#1B7A38' : '#C2185B' }}
                        >
                          {m.dateStr}
                        </span>
                      </div>

                      {/* Middle: Title */}
                      <div
                        className="text-[14.5px] font-bold tracking-tight truncate leading-tight"
                        style={{ color: isGreen ? '#0F172A' : '#881337' }}
                      >
                        {m.title}
                      </div>

                      {/* Bottom: Subtitle / Event Description */}
                      <div
                        className="text-[11px] font-medium tracking-tight truncate leading-tight mt-1"
                        style={{ color: isGreen ? '#2E7D32' : '#9D174D' }}
                      >
                        {m.subtitle}
                      </div>
                    </div>

                    {/* Quick Edit Pencil Icon on hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(m);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/70 hover:bg-white text-slate-500 hover:text-slate-900 shadow-2xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Edit Milestone"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </foreignObject>
              );
            })}

            {/* ── 4. Bottom Summary Banner: My Journey | Date Range | N Milestones ── */}
            <foreignObject x="20" y="756" width="820" height="74">
              <div
                className="w-full h-full rounded-[26px] px-5 py-3 flex items-center justify-between border border-[#E2E8F0] shadow-sm select-none"
                style={{
                  background:
                    'linear-gradient(90deg, #FFF0F5 0%, #FFFFFF 30%, #FFFFFF 70%, #F0FDF4 100%)',
                }}
              >
                {/* Left: Chain Icon & Title */}
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200/80 text-[#FF2D78] flex items-center justify-center shrink-0">
                    <GitCommit className="w-5 h-5 rotate-45" strokeWidth={2.6} />
                  </div>

                  <div className="h-7 w-px bg-slate-200" />

                  <div>
                    <h4 className="text-[15px] font-extrabold text-[#0F172A] tracking-tight leading-tight">
                      My Journey
                    </h4>
                    <p className="text-[11.5px] text-[#64748B] font-medium leading-tight mt-0.5">
                      {dateRangeStr}
                    </p>
                  </div>
                </div>

                {/* Right: Target Bullseye & Milestone Count */}
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50/80 border border-rose-200 text-[#FF2D78] font-extrabold text-sm shadow-2xs">
                  <Target className="w-4 h-4 text-[#FF2D78] stroke-[2.4]" />
                  <span>{milestones.length} Milestones</span>
                </div>
              </div>
            </foreignObject>
          </svg>
        </div>
      </div>

      {/* ── Milestone Detail Inspection Modal with Full EDIT & DELETE ── */}
      {selectedMilestone && !editingMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div
            className="w-full max-w-md rounded-3xl p-6 shadow-2xl border"
            style={{
              backgroundColor: selectedMilestone.theme === 'green' ? '#F0FDF4' : '#FDF2F8',
              borderColor: selectedMilestone.theme === 'green' ? '#BBF7D0' : '#FBCFE8',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border"
                  style={{
                    backgroundColor: selectedMilestone.theme === 'green' ? '#DBF5E2' : '#FCE0EC',
                    borderColor: selectedMilestone.theme === 'green' ? '#B8ECC9' : '#F9BED4',
                  }}
                >
                  {renderIcon(selectedMilestone.iconType, selectedMilestone.theme)}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-bold text-slate-500">
                      {selectedMilestone.dateStr}
                    </span>
                  </div>
                  <h3
                    className="text-base sm:text-lg font-extrabold tracking-tight"
                    style={{
                      color: selectedMilestone.theme === 'green' ? '#0F172A' : '#881337',
                    }}
                  >
                    {selectedMilestone.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedMilestone(null)}
                className="p-1.5 rounded-full hover:bg-black/10 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs font-semibold text-slate-600 mb-2">
              📍 {selectedMilestone.subtitle}
            </p>

            <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed mb-5 shadow-2xs">
              <p>{selectedMilestone.description}</p>
            </div>

            {/* Delete Confirmation Warning */}
            {deleteConfirmId === selectedMilestone.id ? (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 mb-4 animate-in fade-in">
                <p className="text-xs font-bold text-rose-800 text-center mb-2">
                  Permanently remove "{selectedMilestone.title}" from timeline?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="flex-1 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteMilestone(selectedMilestone.id)}
                    className="flex-1 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            ) : null}

            {/* Actions: Edit, Delete, Copy Story, Close */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleOpenEdit(selectedMilestone)}
                className="py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-blue-700"
              >
                <Pencil className="w-4 h-4" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => setDeleteConfirmId(selectedMilestone.id)}
                className="py-2.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-rose-600"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>

              <button
                onClick={() =>
                  handleCopyStory(
                    selectedMilestone.title,
                    selectedMilestone.dateStr,
                    selectedMilestone.description
                  )
                }
                className="py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-slate-700"
              >
                {copiedId === selectedMilestone.title ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedId === selectedMilestone.title ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Milestone Modal ── */}
      {editingMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl p-6 bg-white border border-slate-200 text-slate-900 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-600" />
                <span>Edit Milestone</span>
              </h3>
              <button
                onClick={() => setEditingMilestone(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500">Milestone Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500">Date Display (e.g. Sep 2026)</label>
                  <input
                    type="text"
                    required
                    value={editDateStr}
                    onChange={(e) => setEditDateStr(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500">Subtitle / Organization</label>
                  <input
                    type="text"
                    value={editSubtitle}
                    onChange={(e) => setEditSubtitle(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500">Story & Details</label>
                <textarea
                  required
                  rows={3}
                  value={editStory}
                  onChange={(e) => setEditStory(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Theme & Icon Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500">Card Color</label>
                  <div className="flex gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setEditTheme('green')}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 cursor-pointer ${
                        editTheme === 'green'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Mint Green
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditTheme('pink')}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 cursor-pointer ${
                        editTheme === 'pink'
                          ? 'bg-rose-50 border-rose-500 text-rose-700'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      Blossom Pink
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500">Icon</label>
                  <select
                    value={editIcon}
                    onChange={(e) => setEditIcon(e.target.value as MilestoneIconType)}
                    className="w-full mt-1 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white focus:outline-none"
                  >
                    <option value="building">🏢 Building</option>
                    <option value="graduation">🎓 Graduation</option>
                    <option value="medal">🎖️ Certification / Medal</option>
                    <option value="rocket">🚀 Project / Rocket</option>
                    <option value="microsoft">⊞ Company / Microsoft</option>
                    <option value="code">&lt;/&gt; Code / Hackathon</option>
                    <option value="trophy">🏆 Trophy / Award</option>
                    <option value="heart">❤️ Heart</option>
                    <option value="sparkles">✨ Sparkles</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMilestone(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add New Memory Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl p-6 bg-white border border-slate-200 text-slate-900 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>Record New Milestone</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomMemory} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500">Milestone Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mastered React, Cloud Launch, First Anniversary..."
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500">Date</label>
                  <input
                    type="date"
                    required
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500">Subtitle / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Campus, Microsoft, Online..."
                    value={customSubtitle}
                    onChange={(e) => setCustomSubtitle(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500">Story & Details</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe this milestone chapter..."
                  value={customStory}
                  onChange={(e) => setCustomStory(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Theme & Icon Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500">Card Color</label>
                  <div className="flex gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setCustomTheme('green')}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 cursor-pointer ${
                        customTheme === 'green'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Mint Green
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomTheme('pink')}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 cursor-pointer ${
                        customTheme === 'pink'
                          ? 'bg-rose-50 border-rose-500 text-rose-700'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      Blossom Pink
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500">Icon</label>
                  <select
                    value={customIcon}
                    onChange={(e) => setCustomIcon(e.target.value as MilestoneIconType)}
                    className="w-full mt-1 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white focus:outline-none"
                  >
                    <option value="heart">❤️ Heart</option>
                    <option value="sparkles">✨ Sparkles</option>
                    <option value="building">🏢 Building</option>
                    <option value="graduation">🎓 Graduation</option>
                    <option value="medal">🎖️ Certification / Medal</option>
                    <option value="rocket">🚀 Project / Rocket</option>
                    <option value="microsoft">⊞ Company / Microsoft</option>
                    <option value="code">&lt;/&gt; Code / Hackathon</option>
                    <option value="trophy">🏆 Trophy / Award</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#236B38] hover:bg-[#1B5E20] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
