import React from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { BookOpen, Calendar, User, Layers } from 'lucide-react';
import { EngineeringLogo } from '../common/EngineeringLogo';

export const StudyNavbar: React.FC = () => {
  const { activeTab, switchTab } = useStudyApp();
  const isLibraryTheme = activeTab !== 'chat';

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-200 ${
        isLibraryTheme
          ? 'bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E5DFD5]'
          : 'bg-[#0B0F17]/90 backdrop-blur-md border-b border-slate-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Engineering Logo & Platform Name */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => switchTab('home')}
          >
            <div className="group-hover:scale-105 transition-transform">
              <EngineeringLogo size="md" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`font-black text-sm sm:text-base tracking-tight ${
                    isLibraryTheme ? 'text-[#1E293B]' : 'text-white'
                  }`}
                >
                  ENGIHUB
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                    isLibraryTheme
                      ? 'bg-[#EBF3FB] text-[#2563EB] border border-[#BFDBFE]'
                      : 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                  }`}
                >
                  All Engineering Departments
                </span>
              </div>
              <p
                className={`text-[11px] tracking-tight hidden sm:block font-mono ${
                  isLibraryTheme ? 'text-[#64748B]' : 'text-slate-400'
                }`}
              >
                Learn • Connect • Grow • B.Tech Engineering Portal
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
                  : isLibraryTheme
                  ? 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1EBE3]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
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
                  : isLibraryTheme
                  ? 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1EBE3]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
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
                  : isLibraryTheme
                  ? 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1EBE3]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
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
                  : isLibraryTheme
                  ? 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1EBE3]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <User className="w-4 h-4 text-inherit" />
              <span>Profile</span>
            </button>
          </nav>

          {/* Right Indicator (Academic Semester Tag) */}
          <div className="flex items-center gap-2">
            <div
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-2 ${
                isLibraryTheme
                  ? 'bg-[#F4EEE8] border-[#E5DFD5] text-[#334155]'
                  : 'bg-[#0E1424] border-slate-800 text-slate-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="hidden sm:inline">Semester 4 • B.Tech CSE</span>
              <span className="sm:hidden">Sem 4</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
