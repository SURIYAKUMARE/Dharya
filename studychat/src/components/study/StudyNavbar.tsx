import React from 'react';
import { useStudyApp, AppNavTab } from '../../context/StudyAppContext';
import { BookOpen, Calendar, MessageSquare, User, Lock, Layers, Sparkles, CheckCircle2 } from 'lucide-react';

export const StudyNavbar: React.FC = () => {
  const { activeTab, switchTab, isChatUnlocked, isChatAuthenticated, isAssessmentCompleted } = useStudyApp();

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0F]/85 backdrop-blur-xl border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Platform Name */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => switchTab('home')}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/10 group-hover:scale-105 transition-transform">
              <span className="font-serif font-black text-lg text-indigo-400">D+</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">Study Portal</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 uppercase tracking-wider">
                  Academic
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-tight hidden sm:block">
                Engineering Curriculum &amp; Assessment Platform
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => switchTab('home')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'home'
                  ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Home</span>
            </button>

            <button
              onClick={() => switchTab('subjects')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'subjects' || activeTab === 'topic-explanation'
                  ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4 text-violet-400" />
              <span>Subjects</span>
            </button>

            <button
              onClick={() => switchTab('planner')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'planner'
                  ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Planner</span>
            </button>

            {/* Chat Tab with Lock Indicator */}
            <button
              onClick={() => switchTab('chat')}
              className={`relative px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'chat' || activeTab === 'chat-login'
                  ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                  : isChatUnlocked
                  ? 'text-slate-300 hover:text-white hover:bg-white/5'
                  : 'text-slate-500 cursor-not-allowed opacity-80'
              }`}
              title={
                isChatUnlocked
                  ? 'Educational AI Study Assistant'
                  : 'Complete a topic assessment to unlock Chat'
              }
            >
              <MessageSquare className={`w-4 h-4 ${isChatUnlocked ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>Chat</span>
              {!isChatUnlocked ? (
                <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                  <Lock className="w-2.5 h-2.5 text-amber-400" />
                  <span>Locked</span>
                </span>
              ) : isChatAuthenticated ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
              ) : (
                <span className="text-[10px] font-mono text-cyan-400">Unlocked</span>
              )}
            </button>

            <button
              onClick={() => switchTab('profile')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'profile'
                  ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-4 h-4 text-pink-400" />
              <span>Profile</span>
            </button>
          </nav>

          {/* Right Indicator (Academic Semester Tag) */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="hidden sm:inline">Semester 4 • Engineering</span>
              <span className="sm:hidden">Sem 4</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
