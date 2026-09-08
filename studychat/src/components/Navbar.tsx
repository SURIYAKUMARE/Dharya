import React from 'react';
import { ArrowRight, BookOpen, Sparkles, MessageSquare } from 'lucide-react';

interface NavbarProps {
  onLoginClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLoginClick }) => {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#0A0A0F]/80 border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo Mark */}
        <div className="flex items-center gap-3 cursor-pointer select-none">
          {/* Colored square icon */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-violet-500/25 border border-white/20">
            <BookOpen className="w-5 h-5 text-white" />
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xl font-bold tracking-tight text-white font-sans">
              Study<span className="text-violet-400">Chat</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/40">
              <Sparkles className="w-2.5 h-2.5 text-violet-400" />
              ENGINEERING
            </span>
          </div>
        </div>

        {/* Right Action: Login to Chat Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={onLoginClick}
            className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-indigo-500 shadow-xl shadow-violet-600/35 hover:shadow-violet-600/60 border border-violet-400/40 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-violet-200 group-hover:scale-110 transition-transform" />
            <span>Login to Chat</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 text-violet-200" />
          </button>
        </div>
      </div>
    </header>
  );
};
