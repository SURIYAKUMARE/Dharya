import React from 'react';
import { Search, Settings, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  booksCount: number;
}

export const Hero: React.FC<HeroProps> = ({
  searchQuery,
  onSearchChange,
  booksCount,
}) => {
  return (
    <div className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
      {/* Subtle radial gradient glow (deep purple/indigo) behind hero section */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[360px] pointer-events-none rounded-full blur-[130px] opacity-40"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.45) 0%, rgba(99, 102, 241, 0.2) 45%, transparent 75%)'
        }}
      />

      <div className="relative max-w-4xl mx-auto flex flex-col items-center">
        {/* Top Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/40 bg-violet-500/10 backdrop-blur-md mb-6 shadow-sm shadow-violet-500/20"
        >
          <Settings className="w-3.5 h-3.5 text-violet-400 animate-[spin_8s_linear_infinite]" />
          <span className="text-[11px] font-extrabold tracking-wider uppercase text-violet-300">
            ENGINEERING CURRICULUM • GATE & AICTE STANDARD
          </span>
        </motion.div>

        {/* Large Italic Serif Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif italic text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-5"
        >
          Engineering Study Library
        </motion.h1>

        {/* Subheading in Muted Gray */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8"
        >
          Learn. Practice. Prepare. Master textbook syllabus units, governing engineering equations, and exam problem banks across core departments.
        </motion.p>

        {/* Full-Width Rounded-Full Search Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-2xl relative"
        >
          <div className="relative flex items-center">
            <Search className="absolute left-5 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search engineering textbooks, authors, topics (e.g. Khurmi, Grewal, Matrices, Thermodynamics)..."
              className="w-full pl-13 pr-12 py-3.5 sm:py-4 rounded-full bg-white/[0.07] backdrop-blur-xl border border-white/15 text-white placeholder-slate-400 text-sm sm:text-base outline-none transition-all duration-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 shadow-xl shadow-black/40"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-4 p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between px-4 mt-2.5 text-xs text-slate-500">
            <span>Showing {booksCount} engineering reference volumes</span>
            <span>Instant syllabus index lookup</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
