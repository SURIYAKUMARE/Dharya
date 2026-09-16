import React, { useState, useMemo } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { LIBRARY_SHELVES } from '../../data/libraryShelves';
import { SUBJECTS_DATA } from '../../data/curriculumData';
import { OpenLibraryShelf } from './OpenLibraryShelf';
import {
  Search,
  BookOpen,
  GraduationCap,
  Layers,
  ChevronRight,
  Sparkles,
  ExternalLink,
  BookMarked,
  CheckCircle2,
  Clock,
  Award
} from 'lucide-react';
import { EngineeringLogo } from '../common/EngineeringLogo';

export const StudyHomePage: React.FC = () => {
  const { openSubject, openTopic } = useStudyApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'eie' | 'cs' | 'software' | 'sciences'>('all');

  const filteredSubjects = useMemo(() => {
    if (activeCategory === 'eie') {
      return SUBJECTS_DATA.filter((s) => ['sensors-transducers', 'control-systems'].includes(s.id));
    }
    if (activeCategory === 'cs') {
      return SUBJECTS_DATA.filter((s) => ['programming', 'data-structures', 'database'].includes(s.id));
    }
    if (activeCategory === 'software') {
      return SUBJECTS_DATA.filter((s) => ['java', 'python', 'ai-ml'].includes(s.id));
    }
    if (activeCategory === 'sciences') {
      return SUBJECTS_DATA.filter((s) => ['mathematics', 'physics'].includes(s.id));
    }
    return SUBJECTS_DATA;
  }, [activeCategory]);

  // Filtered books when searching
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const allBooks = LIBRARY_SHELVES.flatMap((s) => s.books);
    return allBooks.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.publisher.toLowerCase().includes(q) ||
        b.tag.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="space-y-8 pb-24 -mt-1">
      {/* 1. Open Library Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#FAF8F5] to-[#F3EDE3] rounded-3xl p-6 sm:p-9 border border-[#E5DFD5] shadow-sm space-y-6">
        {/* Subtle Decorative Background Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="hidden sm:flex shrink-0 p-1 bg-white rounded-2xl border border-[#E5DFD5] shadow-xs">
              <EngineeringLogo size="lg" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF3FB] border border-[#BFDBFE] text-[#1D4ED8] text-xs font-semibold shadow-2xs">
                <GraduationCap className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>AICTE &amp; GATE Model Syllabus 2026</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mt-1.5 font-serif">
                Open Engineering Library
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-2xl font-normal leading-relaxed">
                Borrow authoritative textbooks, access unit-by-unit syllabus problem sets, and complete proctored module assessments across all disciplines.
              </p>
            </div>
          </div>

          {/* Quick Stats Counter Card */}
          <div className="flex items-center gap-3 self-start sm:self-auto bg-white/80 backdrop-blur px-4 py-2.5 rounded-2xl border border-[#E5DFD5] shadow-2xs">
            <div className="text-center px-1">
              <div className="text-base font-extrabold text-[#0F172A] font-mono">10</div>
              <div className="text-[10px] text-[#64748B] uppercase font-semibold">Courses</div>
            </div>
            <div className="h-7 w-px bg-[#E2E8F0]" />
            <div className="text-center px-1">
              <div className="text-base font-extrabold text-[#0F172A] font-mono">40</div>
              <div className="text-[10px] text-[#64748B] uppercase font-semibold">Units</div>
            </div>
            <div className="h-7 w-px bg-[#E2E8F0]" />
            <div className="text-center px-1">
              <div className="text-base font-extrabold text-[#059669] font-mono">100%</div>
              <div className="text-[10px] text-[#64748B] uppercase font-semibold">Verified</div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative z-10 pt-1">
          <div className="relative max-w-3xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search engineering textbooks, authors, algorithms, or formulas (e.g. Sawhney, Ogata, LVDT, PID, CLRS, Grewal)..."
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white border border-[#CBD5E1] text-[#0F172A] placeholder-[#94A3B8] text-xs sm:text-sm focus:outline-none focus:border-[#2563EB] focus:ring-3 focus:ring-[#2563EB]/15 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-xs text-[#94A3B8] hover:text-[#0F172A] rounded-full hover:bg-slate-100"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filter Search Chips */}
          <div className="flex items-center gap-2 pt-3 overflow-x-auto scrollbar-none text-[11px] text-[#64748B]">
            <span className="font-semibold shrink-0 text-[#475569]">Popular in Library:</span>
            {[
              'Sawhney Measurements',
              'Ogata Control Systems',
              'Strain Gauges & LVDT',
              'Pt100 RTD',
              'PID Tuning',
              'CLRS Algorithms',
              'Higher Math Grewal',
              'C Language K&R'
            ].map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 hover:text-blue-700 text-[#334155] border border-[#E2E8F0] whitespace-nowrap transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Search Results View (if user searched) */}
      {searchResults && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E5DFD5] shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div className="flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-[#2563EB]" />
              <h3 className="font-serif text-lg font-bold text-[#0F172A]">
                Search Results ({searchResults.length})
              </h3>
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-[#2563EB] hover:underline font-semibold cursor-pointer"
            >
              Clear Search
            </button>
          </div>

          {searchResults.length === 0 ? (
            <p className="text-xs text-[#64748B] py-6 text-center">
              No matching textbooks found for "{searchQuery}". Try searching for algorithms, physics, mathematics, or classic titles.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {searchResults.map((book) => (
                <div
                  key={book.id}
                  onClick={() => openTopic(book.topicId)}
                  className="cursor-pointer group flex flex-col items-center"
                >
                  <div className="w-full h-44 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all bg-[#F8FAFC] flex flex-col justify-between p-3 border border-[#E2E8F0]">
                    <span className="text-[9px] font-mono font-bold text-[#2563EB] uppercase tracking-wider">
                      {book.tag}
                    </span>
                    <h4 className="text-xs font-bold text-[#0F172A] line-clamp-3">
                      {book.title}
                    </h4>
                    <span className="text-[9px] text-[#64748B] truncate font-medium">
                      {book.author}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openTopic(book.topicId);
                    }}
                    className="w-full mt-2 py-1.5 rounded-xl bg-[#1273C4] text-white text-xs font-medium hover:bg-[#0F60A8] transition-colors shadow-2xs"
                  >
                    Open Reader
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. The Open Library Shelves */}
      <div className="space-y-10">
        {LIBRARY_SHELVES.map((shelf) => (
          <OpenLibraryShelf key={shelf.id} shelf={shelf} />
        ))}
      </div>

      {/* 4. Engineering Disciplines Catalog (10 Courses • 40 Units) */}
      <div className="pt-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4 px-1">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#2563EB] font-bold uppercase tracking-wider mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Full Curriculum</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#0F172A] tracking-tight">
              Disciplines &amp; Problem Sets
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Explore complete 4-unit course modules with step-by-step mathematical derivations and accredited assessments.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-mono text-[#2563EB] bg-[#EFF6FF] px-3 py-1.5 rounded-xl border border-[#DBEAFE] font-bold shadow-2xs">
              10 Courses • 40 Units
            </span>
          </div>
        </div>

        {/* Discipline Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none p-1.5 bg-[#F1ECE4] rounded-2xl border border-[#E5DFD5] w-fit">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-white text-[#0F172A] shadow-sm font-bold'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-white/50'
            }`}
          >
            All (10)
          </button>
          <button
            onClick={() => setActiveCategory('eie')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'eie'
                ? 'bg-white text-amber-800 shadow-sm font-bold border border-amber-200'
                : 'text-[#B45309] hover:bg-amber-100/60'
            }`}
          >
            <span>⚡</span>
            <span>EIE &amp; Instrumentation (2)</span>
          </button>
          <button
            onClick={() => setActiveCategory('cs')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === 'cs'
                ? 'bg-white text-[#0F172A] shadow-sm font-bold'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-white/50'
            }`}
          >
            Core CS (3)
          </button>
          <button
            onClick={() => setActiveCategory('software')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === 'software'
                ? 'bg-white text-[#0F172A] shadow-sm font-bold'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-white/50'
            }`}
          >
            Software &amp; AI (3)
          </button>
          <button
            onClick={() => setActiveCategory('sciences')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeCategory === 'sciences'
                ? 'bg-white text-[#0F172A] shadow-sm font-bold'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-white/50'
            }`}
          >
            Sciences (2)
          </button>
        </div>

        {/* Subject Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredSubjects.map((subject) => (
            <div
              key={subject.id}
              onClick={() => openSubject(subject.id)}
              className="bg-white rounded-2xl p-5 border border-[#E2E8F0] hover:border-[#93C5FD] shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer group flex flex-col justify-between hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold border shadow-2xs group-hover:scale-105 transition-transform"
                    style={{
                      backgroundColor: `${subject.accent}15`,
                      borderColor: `${subject.accent}30`,
                      color: subject.accent,
                    }}
                  >
                    {subject.icon}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]">
                    {subject.code}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors leading-snug">
                    {subject.title}
                  </h3>
                  <div className="text-[11px] text-[#64748B] font-mono mt-0.5 truncate">
                    {subject.department}
                  </div>
                </div>

                <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed">
                  {subject.description}
                </p>

                {/* 4 Units Preview */}
                <div className="pt-2.5 border-t border-[#F1F5F9] space-y-1.5">
                  {subject.topics.slice(0, 3).map((topic) => (
                    <div
                      key={topic.id}
                      className="text-[11px] text-[#64748B] truncate flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1] group-hover:bg-[#2563EB] transition-colors shrink-0" />
                      <span className="truncate">{topic.title}</span>
                    </div>
                  ))}
                  {subject.topics.length > 3 && (
                    <div className="text-[10px] text-[#94A3B8] font-mono pl-3.5">
                      + {subject.topics.length - 3} more unit
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-bold text-[#2563EB]">
                <span>Explore Syllabus</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
