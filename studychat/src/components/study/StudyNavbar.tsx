import React from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { BookOpen, Calendar, User, Layers } from 'lucide-react';

export const StudyNavbar: React.FC = () => {
  const { activeTab, switchTab } = useStudyApp();

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F17]/90 backdrop-blur-md border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Platform Name */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => switchTab('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="font-serif font-black text-lg text-blue-400">D+</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">Study Portal</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/25 uppercase tracking-wider">
                  Academic
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-tight hidden sm:block font-mono">
                B.Tech Curriculum &amp; Examination Repository
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => switchTab('home')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'home'
                  ? 'bg-blue-600 text-white shadow-sm'
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
                  ? 'bg-blue-600 text-white shadow-sm'
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
                  ? 'bg-blue-600 text-white shadow-sm'
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
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <User className="w-4 h-4 text-inherit" />
              <span>Profile</span>
            </button>
          </nav>

          {/* Right Indicator (Academic Semester Tag) */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-[#0E1424] border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="hidden sm:inline">Semester 4 • B.Tech CSE</span>
              <span className="sm:hidden">Sem 4</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
