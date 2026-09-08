import React from 'react';
import { Book as BookType } from '../data/books';
import { Star, Layers, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface BookCardProps {
  book: BookType;
  onOpenBook: (book: BookType) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onOpenBook }) => {
  return (
    <motion.div
      whileHover={{
        y: -4,
        transition: { duration: 0.2, ease: 'easeOut' },
      }}
      className="group relative flex rounded-2xl overflow-hidden glass-card transition-all duration-300 min-h-[290px] border border-white/10 hover:border-white/25"
      style={
        {
          '--card-accent': book.accent,
        } as React.CSSProperties
      }
    >
      {/* ── Left-Edge Colored Accent Bar with Vertical Rotated Category Label ── */}
      <div
        className="w-8 sm:w-9 flex-shrink-0 flex items-center justify-center relative overflow-hidden border-r border-white/10 select-none"
        style={{ backgroundColor: book.accent }}
      >
        {/* Subtle spine highlight & shadow overlay */}
        <div className="absolute inset-y-0 left-0 w-1 bg-white/30" />
        <div className="absolute inset-y-0 right-0 w-1.5 bg-black/25" />

        {/* Vertical Rotated Category Label */}
        <span
          className="text-[9px] sm:text-[10px] font-black tracking-widest text-white uppercase transform -rotate-90 whitespace-nowrap opacity-95 pointer-events-none drop-shadow-sm"
          style={{ width: '220px', textAlign: 'center' }}
        >
          {book.categoryLabel}
        </span>
      </div>

      {/* ── Main Glassmorphic Card Body ── */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between gap-4">
        {/* Top Row: Category Badge Pill + Star Rating (Right-Aligned) */}
        <div className="flex items-center justify-between gap-2">
          <div
            className="inline-flex items-center gap-1.5 text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-md border"
            style={{
              backgroundColor: `${book.accent}20`,
              borderColor: `${book.accent}45`,
              color: book.accent,
            }}
          >
            <Sparkles className="w-3 h-3" />
            <span>{book.badge}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-md border border-white/10">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-slate-200">{book.rating}</span>
          </div>
        </div>

        {/* Title, Author Byline & Accent Icon Tile */}
        <div className="space-y-3">
          <div className="flex items-start gap-3.5">
            {/* Rounded-Square Tile matching accent color */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0 border shadow-md"
              style={{
                backgroundColor: `${book.accent}22`,
                borderColor: `${book.accent}55`,
                color: book.accent,
              }}
            >
              {book.icon}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug line-clamp-2 group-hover:text-white transition-colors">
                {book.title}
              </h3>
              <p
                className="text-xs font-semibold mt-1 truncate"
                style={{ color: book.accent }}
              >
                By {book.author}
              </p>
            </div>
          </div>

          {/* 2-line description in muted gray */}
          <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
            {book.description}
          </p>
        </div>

        {/* Meta Row: Syllabus units + page count separated by bullet */}
        <div className="flex items-center gap-2 text-xs text-slate-400 py-1.5 px-3 rounded-lg bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-slate-300">{book.unitsCount} Syllabus Units</span>
          </div>
          <span className="text-slate-600 font-bold">•</span>
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-slate-300">{book.pages} Pages</span>
          </div>
        </div>

        {/* Footer Row: Small Italic Edition Label Left + Prominent Gradient "Open Book →" Button Right */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] gap-3">
          <span className="text-[11px] italic text-slate-400 truncate max-w-[140px] sm:max-w-[160px]">
            {book.edition}
          </span>

          <button
            onClick={() => onOpenBook(book)}
            className={`group/btn relative inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r ${book.accentGradient} shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] border border-white/20`}
          >
            <span>Open Book</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
