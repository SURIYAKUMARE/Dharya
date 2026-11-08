import React from 'react';
import {
  MessageSquare,
  CircleDot,
  Images,
  GitBranch,
  GraduationCap,
  BookOpen,
  UserCircle,
  Palette,
  ShieldCheck,
  X,
  Sparkles,
} from 'lucide-react';

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
  onOpenProfile,
  onOpenAcademicMode,
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
    view: MainNavView | null,
    icon: React.ReactNode,
    onClickCustom?: () => void,
    badge?: React.ReactNode
  ) => {
    const active = view !== null && isSelected(view);

    const handleClick = () => {
      if (onClickCustom) {
        onClickCustom();
      } else if (view) {
        onSelectView(view);
      }
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
      {/* Scrollable menu content */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 scrollbar-thin">
        {/* Mobile close header */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/60 dark:border-slate-800 md:hidden">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              D
            </div>
            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Dharya Navigation
            </span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
            undefined,
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
            undefined,
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

        {/* ─── SECTION 3: INTELLIGENCE ─── */}
        <div className="mb-5">
          <h3
            className={`text-[11px] font-bold uppercase tracking-[0.08em] px-3.5 mb-2 select-none ${
              isDark ? 'text-[#8696a0]' : 'text-[#5b6b82]'
            }`}
          >
            INTELLIGENCE
          </h3>

          {/* Academic Mode (Disguise trigger) */}
          {renderItem(
            'Academic Mode',
            null,
            <GraduationCap className="w-5 h-5" strokeWidth={1.9} />,
            onOpenAcademicMode,
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
              Disguise
            </span>
          )}

          {/* Audit logs (Recycle Bin) */}
          {renderItem(
            'Audit logs',
            'recycle',
            <ShieldCheck className="w-5 h-5" strokeWidth={1.9} />
          )}
        </div>

        {/* ─── SECTION 4: RESOURCES ─── */}
        <div className="mb-4">
          <h3
            className={`text-[11px] font-bold uppercase tracking-[0.08em] px-3.5 mb-2 select-none ${
              isDark ? 'text-[#8696a0]' : 'text-[#5b6b82]'
            }`}
          >
            RESOURCES
          </h3>

          {/* Knowledge base */}
          {renderItem(
            'Knowledge base',
            null,
            <BookOpen className="w-5 h-5" strokeWidth={1.9} />,
            () => {
              onSelectView('status');
            }
          )}

          {/* Account profile */}
          {renderItem(
            'Account profile',
            null,
            <UserCircle className="w-5 h-5" strokeWidth={1.9} />,
            onOpenProfile,
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {studentName}
            </span>
          )}
        </div>
      </div>

      {/* ─── BOTTOM FOOTER (Divider + Design system) ─── */}
      <div className="shrink-0 px-3.5 pb-4 pt-1">
        <div className={`border-t mb-3 ${isDark ? 'border-[#222e35]' : 'border-slate-200'}`} />

        {renderItem(
          'Design system',
          null,
          <Palette className="w-5 h-5" strokeWidth={1.9} />,
          onOpenProfile,
          <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
            Active
          </span>
        )}
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
