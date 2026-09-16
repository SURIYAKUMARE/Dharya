import React from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { BookOpen, Calendar, User, Layers, Search, Sparkles } from 'lucide-react';
import { EngineeringLogo } from '../common/EngineeringLogo';

export const StudyNavbar: React.FC = () => {
  const { activeTab, switchTab, student } = useStudyApp();

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/92 backdrop-blur-xl border-b border-[#E2D9CC]/90 pt-[env(safe-area-inset-top,0px)] transition-all select-none shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 sm:h-16 gap-3 sm:gap-4">
          {/* Engineering Logo & Brand */}
          <div
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
            onClick={() => switchTab('home')}
          >
            <div className="group-hover:scale-105 group-hover:rotate-[-2deg] transition-transform duration-200 shrink-0 drop-shadow-sm">
              <EngineeringLogo size="md" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-sm sm:text-base tracking-tight text-[#0F172A] font-serif">
                  ENGIHUB
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-blue-50 to-indigo-50 text-[#1D4ED8] border border-blue-200/80 shadow-2xs">
                  Academic Portal
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] tracking-tight hidden xs:block sm:block font-mono text-[#64748B]">
                Learn • Assess • Connect
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F1ECE4]/80 p-1 rounded-2xl border border-[#E5DFD5]">
            <button
              onClick={() => switchTab('home')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'home'
                  ? 'bg-white text-[#1273C4] shadow-sm font-bold border border-black/5'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-white/50'
              }`}
            >
              <BookOpen className={`w-3.5 h-3.5 ${activeTab === 'home' ? 'text-[#1273C4]' : 'text-[#64748B]'}`} />
              <span>Library</span>
            </button>

            <button
              onClick={() => switchTab('subjects')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'subjects' || activeTab === 'topic-explanation'
                  ? 'bg-white text-[#1273C4] shadow-sm font-bold border border-black/5'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-white/50'
              }`}
            >
              <Layers className={`w-3.5 h-3.5 ${activeTab === 'subjects' || activeTab === 'topic-explanation' ? 'text-[#1273C4]' : 'text-[#64748B]'}`} />
              <span>Curriculum</span>
            </button>

            <button
              onClick={() => switchTab('planner')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'planner'
                  ? 'bg-white text-[#1273C4] shadow-sm font-bold border border-black/5'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-white/50'
              }`}
            >
              <Calendar className={`w-3.5 h-3.5 ${activeTab === 'planner' ? 'text-[#1273C4]' : 'text-[#64748B]'}`} />
              <span>Planner</span>
            </button>

            <button
              onClick={() => switchTab('profile')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'profile'
                  ? 'bg-white text-[#1273C4] shadow-sm font-bold border border-black/5'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-white/50'
              }`}
            >
              <User className={`w-3.5 h-3.5 ${activeTab === 'profile' ? 'text-[#1273C4]' : 'text-[#64748B]'}`} />
              <span>Profile</span>
            </button>
          </nav>

          {/* Right Indicator: Student Profile Status Pill */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => switchTab('profile')}
              className="px-3 py-1.5 rounded-xl border border-[#E0D8CC] bg-white hover:bg-[#F9F6F0] text-[#334155] hover:text-[#0F172A] text-xs font-mono flex items-center gap-2 transition-all duration-150 shadow-2xs hover:shadow-sm group cursor-pointer"
              title="View Student Profile"
            >
              <div className="relative flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute" />
              </div>
              <span className="hidden sm:inline font-semibold">
                {student?.name || 'Surya'} • {student?.semester || 'Sem 4'}
              </span>
              <span className="sm:hidden font-bold text-[11px]">
                {student?.name || 'Surya'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
