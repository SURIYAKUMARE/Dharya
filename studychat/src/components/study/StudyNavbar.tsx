import React from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { BookOpen, Calendar, User, Layers } from 'lucide-react';
import { EngineeringLogo } from '../common/EngineeringLogo';

export const StudyNavbar: React.FC = () => {
  const { activeTab, switchTab } = useStudyApp();

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E5DFD5] pt-[env(safe-area-inset-top,0px)] transition-colors select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3 sm:gap-4">
          {/* Engineering Logo & Platform Name */}
          <div
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
            onClick={() => switchTab('home')}
          >
            <div className="group-hover:scale-105 transition-transform shrink-0">
              <EngineeringLogo size="md" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-sm sm:text-base tracking-tight text-[#1E293B]">
                  ENGIHUB
                </span>
                <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider bg-[#EBF3FB] text-[#2563EB] border border-[#BFDBFE]">
                  All Engineering
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] tracking-tight hidden xs:block sm:block font-mono text-[#64748B]">
                Learn • Connect • Grow
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => switchTab('home')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'home'
                  ? 'bg-[#1273C4] text-white shadow-sm'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1EBE3]'
              }`}
            >
              <BookOpen className="w-4 h-4 text-inherit" />
              <span>Home</span>
            </button>

            <button
              onClick={() => switchTab('subjects')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'subjects' || activeTab === 'topic-explanation'
                  ? 'bg-[#1273C4] text-white shadow-sm'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1EBE3]'
              }`}
            >
              <Layers className="w-4 h-4 text-inherit" />
              <span>Subjects</span>
            </button>

            <button
              onClick={() => switchTab('planner')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'planner'
                  ? 'bg-[#1273C4] text-white shadow-sm'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1EBE3]'
              }`}
            >
              <Calendar className="w-4 h-4 text-inherit" />
              <span>Planner</span>
            </button>

            <button
              onClick={() => switchTab('profile')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'profile'
                  ? 'bg-[#1273C4] text-white shadow-sm'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1EBE3]'
              }`}
            >
              <User className="w-4 h-4 text-inherit" />
              <span>Profile</span>
            </button>
          </nav>

          {/* Right Indicator (Academic Semester Tag / Tap to view profile on mobile) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => switchTab('profile')}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-[#E5DFD5] bg-[#F4EEE8] hover:bg-[#EFE8E0] text-[#334155] text-xs font-mono flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer shadow-2xs"
              title="View Profile"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="hidden sm:inline">Semester 4 • B.Tech CSE</span>
              <span className="sm:hidden font-bold text-[11px]">Sem 4</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
