import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  CalendarCheck,
  Code2,
  CalendarDays,
  Award,
  Gift,
  HelpCircle,
  FolderGit2,
  Briefcase,
  Database,
  FileText,
  FileEdit,
  Building2,
  Clock,
  Settings,
  X,
  ChevronRight,
  BookOpen
} from 'lucide-react';

export type DashboardActiveView =
  | 'dashboard'
  | 'courses'
  | 'book-slot'
  | 'problem-solving'
  | 'attendance'
  | 'assessment-results'
  | 'rewards'
  | 'mcq'
  | 'coding'
  | 'projects'
  | 'company-prep'
  | 'sql-practice'
  | 'notes'
  | 'resume-builder'
  | 'jobs'
  | 'track-request'
  | 'help-support'
  | 'settings';

interface AlgoTutorSidebarProps {
  currentView: DashboardActiveView;
  onSelectView: (view: DashboardActiveView) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface MenuItem {
  id: DashboardActiveView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const MENU_SECTIONS: MenuSection[] = [
  {
    title: 'Overview',
    items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }]
  },
  {
    title: 'Academic',
    items: [
      { id: 'courses', label: 'Academic Courses', icon: GraduationCap, badge: '38', badgeColor: 'bg-blue-100 text-blue-700' },
      { id: 'book-slot', label: 'Book Slot', icon: CalendarCheck }
    ]
  },
  {
    title: 'My Activity',
    items: [
      { id: 'problem-solving', label: 'Problem Solving', icon: Code2, badge: '380', badgeColor: 'bg-emerald-100 text-emerald-800' },
      { id: 'attendance', label: 'Attendance', icon: CalendarDays },
      { id: 'assessment-results', label: 'Assessment Results', icon: Award },
      { id: 'rewards', label: 'Rewards', icon: Gift, badge: '8019 pts', badgeColor: 'bg-amber-100 text-amber-800' }
    ]
  },
  {
    title: 'Practice',
    items: [
      { id: 'mcq', label: 'MCQ Practice', icon: HelpCircle },
      { id: 'coding', label: 'Coding Practice', icon: Code2, badge: 'POTD', badgeColor: 'bg-purple-100 text-purple-700' },
      { id: 'projects', label: 'Projects', icon: FolderGit2 },
      { id: 'company-prep', label: 'Company Preparation', icon: Building2 },
      { id: 'sql-practice', label: 'SQL Practice', icon: Database }
    ]
  },
  {
    title: 'Learning Resources',
    items: [{ id: 'notes', label: 'Notes', icon: FileText }]
  },
  {
    title: 'Career',
    items: [
      { id: 'resume-builder', label: 'Resume Builder', icon: FileEdit, badge: 'PRO', badgeColor: 'bg-indigo-100 text-indigo-700' },
      { id: 'jobs', label: 'Jobs', icon: Briefcase, badge: 'Hot', badgeColor: 'bg-rose-100 text-rose-700' }
    ]
  },
  {
    title: 'Support',
    items: [
      { id: 'track-request', label: 'Track Request', icon: Clock },
      { id: 'help-support', label: 'Help & Support', icon: HelpCircle },
      { id: 'settings', label: 'Settings', icon: Settings }
    ]
  }
];

export const AlgoTutorSidebar: React.FC<AlgoTutorSidebarProps> = ({
  currentView,
  onSelectView,
  isOpenMobile,
  onCloseMobile
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container: 220px desktop width */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[220px] bg-white border-r border-[#E2E8F0] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-[#F1F5F9] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSelectView('dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0875E1] to-[#38BDF8] flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <span className="font-black text-lg tracking-wider font-mono">A</span>
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-[#172B4D]">
                Algo<span className="text-[#0875E1]">Tutor</span>
              </div>
              <div className="text-[10px] text-[#64748B] font-medium tracking-tight">Student LMS Portal</div>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections with Independent Scrolling */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 text-xs scrollbar-thin scrollbar-thumb-slate-200">
          {MENU_SECTIONS.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                {section.title}
              </div>

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectView(item.id);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left font-medium transition-all duration-150 cursor-pointer group ${
                        isActive
                          ? 'bg-[#0875E1] text-white shadow-xs font-semibold'
                          : 'text-[#475569] hover:bg-[#F4F9FC] hover:text-[#0875E1]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                            isActive ? 'text-white' : 'text-[#64748B] group-hover:text-[#0875E1]'
                          }`}
                        />
                        <span className="truncate text-xs">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 font-mono ${
                            isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Student Profile Summary in Sidebar */}
        <div className="p-3 border-t border-[#F1F5F9] bg-[#FAF8F5]/80 flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
            S
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-[#172B4D] truncate">Surya</div>
            <div className="text-[10px] text-[#64748B] truncate font-mono">Rank #54 • 8019 pts</div>
          </div>
        </div>
      </aside>
    </>
  );
};
