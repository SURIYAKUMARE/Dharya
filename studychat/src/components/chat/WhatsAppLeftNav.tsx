import React from 'react';
import {
  MessageSquare,
  CircleDot,
  Images,
  GitBranch,
  X,
} from 'lucide-react';
import { DHARYA_LOGO_DATA_URI } from '../../assets/dharyaLogoDataUri';

export type MainNavView = 'chat' | 'status' | 'gallery' | 'timeline' | 'recycle';

export interface WhatsAppLeftNavProps {
  activeView: MainNavView;
  onSelectView: (view: MainNavView) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  isDark?: boolean;
  studentName?: string;
  isPartnerOnline?: boolean;
  unreadCount?: number;
  onOpenProfile?: () => void;
  onOpenAcademicMode?: () => void;
  onLogout?: () => void;
}

export const WhatsAppLeftNav: React.FC<WhatsAppLeftNavProps> = ({
  activeView,
  onSelectView,
  isOpenMobile = false,
  onCloseMobile,
  isDark = false,
  studentName = 'Surya',
  isPartnerOnline = false,
  unreadCount = 0,
}) => {
  const isSelected = (view: MainNavView) => activeView === view;

  // Render a navigation item copied directly from the reference image UI & UX:
  // - Rounded pill container
  // - Left curved bracket accent `(` when active
  // - Crisp outline icons matching the reference
  // - Royal blue active text and icon
  // - Medium-weight slate inactive text with subtle hover
  const renderItem = (
    label: string,
    view: MainNavView,
    icon: React.ReactNode,
    badge?: React.ReactNode
  ) => {
    const active = isSelected(view);

    const handleClick = () => {
      onSelectView(view);
      if (onCloseMobile) {
        onCloseMobile();
      }
    };

    return (
      <button
        onClick={handleClick}
        className={`w-full group relative flex items-center justify-between px-3.5 py-2.5 my-0.5 rounded-2xl text-[14.5px] transition-all duration-150 select-none text-left ${
          active
            ? isDark
              ? 'bg-[#1e293b]/90 text-[#38bdf8] border border-[#0284c7]/40 font-semibold shadow-sm'
              : 'bg-[#f4f8ff] text-[#1d68f6] border border-[#2563eb]/25 font-semibold shadow-[0_1px_3px_rgba(37,99,235,0.06)]'
            : isDark
            ? 'text-[#94a3b8] hover:bg-[#1f2c34] hover:text-[#f1f5f9] border border-transparent font-medium'
            : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a] border border-transparent font-medium'
        }`}
      >
        {/* Exact curved blue indicator `(` copied from the reference image */}
        {active && (
          <svg
            className="absolute -left-[1px] top-1/2 -translate-y-1/2 w-3 h-8 pointer-events-none drop-shadow-sm"
            viewBox="0 0 10 32"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M 7.5 3 C 1.8 8, 1.8 24, 7.5 29"
              stroke={isDark ? '#38bdf8' : '#1d68f6'}
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          </svg>
        )}

        <div className="flex items-center gap-3.5 min-w-0">
          <span
            className={`w-5 h-5 flex items-center justify-center shrink-0 transition-colors ${
              active
                ? isDark
                  ? 'text-[#38bdf8]'
                  : 'text-[#1d68f6]'
                : isDark
                ? 'text-[#94a3b8] group-hover:text-[#e2e8f0]'
                : 'text-[#5b6b82] group-hover:text-[#1e293b]'
            }`}
          >
            {icon}
          </span>
          <span className="truncate tracking-[-0.01em]">{label}</span>
        </div>

        {badge && <div className="shrink-0 ml-2">{badge}</div>}
      </button>
    );
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between">
      {/* ─── Top Brand Header with Dharya Heart Logo (Navigation Bar Side) ─── */}
      <div
        className={`px-4 py-3.5 border-b flex items-center justify-between shrink-0 select-none ${
          isDark ? 'border-[#222e35] bg-[#111b21]' : 'border-slate-100 bg-white'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-10 h-10 rounded-2xl overflow-hidden shadow-sm shrink-0 border border-slate-200/80 dark:border-white/10 bg-white flex items-center justify-center p-0.5 group">
            <img
              src={DHARYA_LOGO_DATA_URI}
              alt="Dharya Logo"
              className="w-full h-full object-contain rounded-xl transition-transform duration-200 group-hover:scale-105"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2
                className={`text-[15px] font-bold tracking-tight leading-tight truncate ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Dhanya
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            </div>
            <p
              className={`text-[11px] font-medium leading-tight truncate ${
                isDark ? 'text-[#8696a0]' : 'text-[#64748b]'
              }`}
            >
              Private Portal
            </p>
          </div>
        </div>

        {/* Mobile close button when rendered in slide-out drawer */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden cursor-pointer"
            title="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Scrollable menu content */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 scrollbar-thin">
        {/* ─── SECTION 1: OPERATIONS (1. Chat & 2. Status) ─── */}
        <div className="mb-5">
          <h3
            className={`text-[11px] font-bold uppercase tracking-[0.08em] px-3.5 mb-2 select-none ${
              isDark ? 'text-[#8696a0]' : 'text-[#5b6b82]'
            }`}
          >
            OPERATIONS
          </h3>

          {/* 1. Chat */}
          {renderItem(
            'Chat',
            'chat',
            <MessageSquare className="w-5 h-5" strokeWidth={1.9} />,
            unreadCount > 0 ? (
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#1d68f6] text-white shadow-sm">
                {unreadCount}
              </span>
            ) : undefined
          )}

          {/* 2. Status */}
          {renderItem(
            'Status',
            'status',
            <CircleDot className="w-5 h-5" strokeWidth={1.9} />,
            isPartnerOnline ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            ) : undefined
          )}
        </div>

        {/* ─── SECTION 2: ADMINISTRATION (3. Gallery & 4. Timeline) ─── */}
        <div className="mb-5">
          <h3
            className={`text-[11px] font-bold uppercase tracking-[0.08em] px-3.5 mb-2 select-none ${
              isDark ? 'text-[#8696a0]' : 'text-[#5b6b82]'
            }`}
          >
            ADMINISTRATION
          </h3>

          {/* 3. Gallery */}
          {renderItem(
            'Gallery',
            'gallery',
            <Images className="w-5 h-5" strokeWidth={1.9} />
          )}

          {/* 4. Timeline */}
          {renderItem(
            'Timeline',
            'timeline',
            <GitBranch className="w-5 h-5" strokeWidth={1.9} />
          )}
        </div>
      </div>

      {/* ─── User identity at bottom ─── */}
      <div className={`px-4 py-3 border-t ${isDark ? 'border-[#222e35]' : 'border-slate-200'}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
            {(studentName[0] || 'S').toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className={`text-[12px] font-bold truncate ${isDark ? 'text-[#e9edef]' : 'text-[#0f172a]'}`}>
              {studentName}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              <p className={`text-[10px] ${isDark ? 'text-[#8696a0]' : 'text-[#64748b]'}`}>
                Online
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop Permanent Sidebar on the Left Free Space ── */}
      <aside
        className={`hidden md:block w-64 shrink-0 h-full border-r z-40 transition-colors shadow-[1px_0_4px_rgba(0,0,0,0.02)] select-none ${
          isDark
            ? 'bg-[#111b21] border-[#222e35] text-[#e9edef]'
            : 'bg-white border-[#e2e8f0] text-[#0f172a]'
        }`}
      >
        {navContent}
      </aside>

      {/* ── Mobile Slide-out Drawer (Backdrop + Sidebar) ── */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer content */}
          <div
            className={`relative w-72 max-w-[80vw] h-full shadow-2xl z-10 transition-colors ${
              isDark
                ? 'bg-[#111b21] border-r border-[#222e35] text-[#e9edef]'
                : 'bg-white border-r border-[#e2e8f0] text-[#0f172a]'
            }`}
          >
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
