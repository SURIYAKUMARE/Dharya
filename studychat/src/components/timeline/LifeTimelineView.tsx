/**
 * LifeTimelineView.tsx
 * 
 * Pixel-Perfect Replica of the Winding Milestone Trail Design:
 * - Exact curved green dashed path with waypoints
 * - Heart loop in the center
 * - Teardrop location pins with pink ground anchor pills
 * - Pastel Mint Green & Blossom Pink milestone cards
 * - Bottom pill banner: "My Journey | Jul 2024 – Nov 2026 | 7 Milestones"
 * - Interactive: Clicking any card opens the memory modal
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Camera,
  Heart,
  Quote,
} from 'lucide-react';
import { useStudyApp } from '../../context/StudyAppContext';
import {
  TimelineIncident,
  fetchTimelineIncidents,
  createTimelineIncident,
} from '../../services/galleryService';

export interface LifeTimelineViewProps {
  isDark?: boolean;
  onBackToChat?: () => void;
  onOpenGallery?: () => void;
  onOpenRecycleBin?: () => void;
}

export interface MilestoneItem {
  id: string;
  theme: 'green' | 'pink';
  iconType: 'building' | 'graduation' | 'medal' | 'rocket' | 'microsoft' | 'code' | 'trophy';
  dateStr: string;
  title: string;
  subtitle: string;
  description: string;
  // Card foreignObject coordinates in 860x850
  cardX: number;
  cardY: number;
  cardW: number;
  cardH: number;
  // Pin coordinate in 860x850
  pinX: number;
  pinY: number;
  isFirstBase?: boolean;
}

const MILESTONES: MilestoneItem[] = [
  {
    id: 'm1',
    theme: 'green',
    iconType: 'building',
    dateStr: 'Jul 2024',
    title: 'College Began',
    subtitle: 'Started my Engineering journey',
    description: 'Started my Engineering journey at college. Meeting new friends, first lectures, and exciting dreams ahead for the four years to come.',
    pinX: 100,
    pinY: 690,
    cardX: 138,
    cardY: 640,
    cardW: 290,
    cardH: 84,
    isFirstBase: true,
  },
  {
    id: 'm2',
    theme: 'pink',
    iconType: 'graduation',
    dateStr: 'Sep 2025',
    title: 'Year 2 – AIML',
    subtitle: 'Rathinam Technical Campus',
    description: 'Stepping into 2nd year Artificial Intelligence & Machine Learning specialization at Rathinam Technical Campus. Advanced curriculum and lab projects.',
    pinX: 300,
    pinY: 546,
    cardX: 348,
    cardY: 500,
    cardW: 280,
    cardH: 84,
  },
  {
    id: 'm3',
    theme: 'green',
    iconType: 'medal',
    dateStr: 'Jan 2026',
    title: 'Certification',
    subtitle: 'Completed Microsoft Fabric',
    description: 'Successfully completed the comprehensive Microsoft Fabric certification, demonstrating proficiency in cloud analytics and data workflows.',
    pinX: 480,
    pinY: 444,
    cardX: 508,
    cardY: 380,
    cardW: 260,
    cardH: 84,
  },
  {
    id: 'm4',
    theme: 'green',
    iconType: 'rocket',
    dateStr: 'Mar 2026',
    title: 'Project Launch',
    subtitle: 'TrustGuard AI (Live)',
    description: 'TrustGuard AI launched live into production! An intelligent real-time security framework with adaptive threat defense.',
    pinX: 320,
    pinY: 400,
    cardX: 60,
    cardY: 335,
    cardW: 240,
    cardH: 84,
  },
  {
    id: 'm5',
    theme: 'pink',
    iconType: 'microsoft',
    dateStr: 'Jun 2026',
    title: 'Internship',
    subtitle: 'Started Microsoft Internship',
    description: 'Kicked off prestigious software engineering summer internship at Microsoft, collaborating on enterprise cloud engineering systems.',
    pinX: 500,
    pinY: 260,
    cardX: 528,
    cardY: 196,
    cardW: 260,
    cardH: 84,
  },
  {
    id: 'm6',
    theme: 'pink',
    iconType: 'code',
    dateStr: 'Sep 2026',
    title: 'Hackathon',
    subtitle: 'Won SAKTHI HACKFEST\'26',
    description: 'Bagged the 1st prize championship at SAKTHI HACKFEST\'26 after building a high-impact prototype in 36 continuous hours.',
    pinX: 364,
    pinY: 208,
    cardX: 90,
    cardY: 142,
    cardW: 250,
    cardH: 84,
  },
  {
    id: 'm7',
    theme: 'green',
    iconType: 'trophy',
    dateStr: 'Nov 2026',
    title: 'SIH 2026',
    subtitle: 'Finalist – NIYAM Project',
    description: 'Selected as national grand finalists at Smart India Hackathon (SIH 2026) presenting the NIYAM Project to nationwide juries.',
    pinX: 544,
    pinY: 100,
    cardX: 572,
    cardY: 36,
    cardW: 260,
    cardH: 84,
  },
];

export const LifeTimelineView: React.FC<LifeTimelineViewProps> = ({
  isDark = false,
  onBackToChat,
}) => {
  const { student } = useStudyApp();
  const owner = student?.username || 'surya';

  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form states for adding custom memory
  const [customTitle, setCustomTitle] = useState('');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [customStory, setCustomStory] = useState('');
  const [customLocation, setCustomLocation] = useState('');

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

  const handleSaveCustomMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customStory.trim()) return;

    try {
      await createTimelineIncident({
        owner,
        title: customTitle.trim(),
        incidentDate: customDate,
        incidentText: customStory.trim(),
        location: customLocation.trim(),
        tag: 'Milestone',
        timestamp: new Date(customDate).getTime() || Date.now(),
      });
      showToast('Recorded new memory to timeline 🎉');
      setShowAddModal(false);
      setCustomTitle('');
      setCustomStory('');
      setCustomLocation('');
    } catch {
      showToast('Could not save memory');
    }
  };

  const renderIcon = (type: MilestoneItem['iconType'], theme: 'green' | 'pink') => {
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
      default:
        return <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" style={{ color }} strokeWidth={2.1} />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#FDFCF9] overflow-y-auto overflow-x-hidden font-sans select-none relative">
      {/* ── Toast Notification ── */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-white/10 animate-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-rose-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── Subtle Top Bar with Back & Add Action ── */}
      <div className="w-full max-w-[880px] mx-auto px-4 py-3 flex items-center justify-between shrink-0 z-20">
        {onBackToChat ? (
          <button
            onClick={onBackToChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Chat</span>
          </button>
        ) : <div />}

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
          <span>+ Add Memory</span>
        </button>
      </div>

      {/* ── Main Canvas Stage Matching the Exact Reference Image ── */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 pb-8">
        <div className="w-full max-w-[860px] mx-auto">
          <svg
            viewBox="0 0 860 850"
            className="w-full h-auto drop-shadow-sm select-none"
            style={{ maxHeight: 'calc(100vh - 80px)' }}
          >
            {/* ── 1. The Continuous Green Dashed Path ── */}
            <path
              d="M 100 690 C 140 640, 220 590, 300 546 C 360 510, 430 490, 480 444 C 460 480, 370 460, 320 400 C 310 360, 360 365, 400 356 C 370 320, 340 270, 380 270 C 400 270, 406 290, 408 300 C 410 290, 416 270, 436 270 C 476 270, 450 320, 400 356 C 430 320, 470 290, 500 260 C 510 220, 430 236, 364 208 C 340 180, 470 150, 544 100"
              fill="none"
              stroke="#236B38"
              strokeWidth="2.6"
              strokeDasharray="6,6"
              strokeLinecap="round"
            />

            {/* ── 2. Waypoint Pins and Glowing Pink Ground Pills ── */}
            {MILESTONES.map((m) => {
              if (m.isFirstBase) {
                return (
                  <g key={`pin-${m.id}`} transform={`translate(${m.pinX}, ${m.pinY})`}>
                    {/* Wider Pink Pill Base for College Began */}
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
                <g key={`pin-${m.id}`} transform={`translate(${m.pinX}, ${m.pinY})`}>
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

            {/* ── 3. Exact 7 Milestone Cards ── */}
            {MILESTONES.map((m) => {
              const isGreen = m.theme === 'green';

              return (
                <foreignObject
                  key={`card-${m.id}`}
                  x={m.cardX}
                  y={m.cardY}
                  width={m.cardW}
                  height={m.cardH}
                >
                  <div
                    onClick={() => setSelectedMilestone(m)}
                    className="w-full h-full cursor-pointer flex items-center p-3 rounded-[18px] transition-transform duration-150 hover:scale-[1.02] select-none"
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
                    <div className="min-w-0 flex-1 leading-none">
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

                      {/* Bottom: Subtitle */}
                      <div className="text-[11px] text-[#475569] font-medium truncate mt-1 leading-snug">
                        {m.subtitle}
                      </div>
                    </div>
                  </div>
                </foreignObject>
              );
            })}

            {/* ── 4. Exact Bottom Summary Banner: My Journey | Jul 2024 – Nov 2026 | 7 Milestones ── */}
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
                      Jul 2024 – Nov 2026
                    </p>
                  </div>
                </div>

                {/* Right: Target Bullseye & Milestone Count */}
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50/80 border border-rose-200 text-[#FF2D78] font-extrabold text-sm shadow-2xs">
                  <Target className="w-4 h-4 text-[#FF2D78] stroke-[2.4]" />
                  <span>7 Milestones</span>
                </div>
              </div>
            </foreignObject>
          </svg>
        </div>
      </div>

      {/* ── Milestone Detail Inspection Modal ── */}
      {selectedMilestone && (
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

            <div className="flex gap-2">
              <button
                onClick={() =>
                  handleCopyStory(
                    selectedMilestone.title,
                    selectedMilestone.dateStr,
                    selectedMilestone.description
                  )
                }
                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedId === selectedMilestone.title ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedId === selectedMilestone.title ? 'Copied' : 'Copy Story'}</span>
              </button>

              <button
                onClick={() => setSelectedMilestone(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#236B38] hover:bg-[#1B5E20] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
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
                  placeholder="e.g. Mastered React, Cloud Deployment..."
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
                  <label className="text-xs font-bold text-slate-500">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Campus, Online, City..."
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500">Story & Details</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe this milestone chapter..."
                  value={customStory}
                  onChange={(e) => setCustomStory(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
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
