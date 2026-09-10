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
  BookMarked
} from 'lucide-react';

export const StudyHomePage: React.FC = () => {
  const { openSubject, openTopic } = useStudyApp();
  const [searchQuery, setSearchQuery] = useState('');

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
    <div className="space-y-8 pb-24 -mt-2">
      {/* 1. Open Library Banner & Academic Search */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5DFD5] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF3FB] border border-[#BFDBFE] text-[#1D4ED8] text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Digital Engineering Repository • B.Tech Semester IV</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight mt-2 font-serif">
              Open Engineering Library
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-2xl font-normal">
              Borrow authoritative textbooks, access unit-by-unit syllabus problem sets, and complete accredited module assessments.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 self-start sm:self-auto bg-[#FAF8F5] px-4 py-2.5 rounded-xl border border-[#E8E1D7]">
            <div className="text-center">
              <div className="text-sm font-bold text-[#1E293B] font-mono">8</div>
              <div className="text-[10px] text-[#64748B] uppercase">Courses</div>
            </div>
            <div className="h-6 w-px bg-[#E2E8F0]" />
            <div className="text-center">
              <div className="text-sm font-bold text-[#1E293B] font-mono">32</div>
              <div className="text-[10px] text-[#64748B] uppercase">Units</div>
            </div>
            <div className="h-6 w-px bg-[#E2E8F0]" />
            <div className="text-center">
              <div className="text-sm font-bold text-[#10B981] font-mono">100%</div>
              <div className="text-[10px] text-[#64748B] uppercase">Verified</div>
            </div>
          </div>
        </div>

        {/* Search Bar (Open Library style) */}
        <div className="pt-1">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books, authors, algorithms, or formulas (e.g. Otranto, Eigenvalues, CLRS, Pointers)..."
              className="w-full pl-11 pr-10 py-3 rounded-xl bg-[#FAF8F5] border border-[#CBD5E1] text-[#1E293B] placeholder-[#94A3B8] text-xs sm:text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8] hover:text-[#1E293B]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filter Search Chips */}
          <div className="flex items-center gap-2 pt-3 overflow-x-auto scrollbar-none text-[11px] text-[#64748B]">
            <span className="font-medium shrink-0">Popular in Library:</span>
            {[
              'Castle of Otranto',
              'Nation of Idiots',
              'CLRS Algorithms',
              'Higher Math Grewal',
              'C Language K&R',
              'Modern Physics',
              'Deep Learning'
            ].map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="px-2.5 py-0.5 rounded-md bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] border border-[#E2E8F0] whitespace-nowrap transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Search Results View (if user searched) */}
      {searchResults && (
        <div className="bg-white rounded-2xl p-6 border border-[#E5DFD5] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <h3 className="font-serif text-lg font-bold text-[#1E293B]">
              Search Results ({searchResults.length})
            </h3>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-[#2563EB] hover:underline"
            >
              Clear Search
            </button>
          </div>

          {searchResults.length === 0 ? (
            <p className="text-xs text-[#64748B] py-4">
              No matching books found for "{searchQuery}". Try searching for algorithms, physics, mathematics, or classic titles.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {searchResults.map((book) => (
                <div
                  key={book.id}
                  onClick={() => openTopic(book.topicId)}
                  className="cursor-pointer group flex flex-col items-center"
                >
                  <div className="w-full h-44 rounded overflow-hidden shadow-md group-hover:scale-105 transition-transform bg-[#F1F5F9] flex flex-col justify-between p-2.5 border border-[#E2E8F0]">
                    <span className="text-[9px] font-mono font-bold text-[#2563EB] uppercase">
                      {book.tag}
                    </span>
                    <h4 className="text-xs font-bold text-[#1E293B] line-clamp-3">
                      {book.title}
                    </h4>
                    <span className="text-[9px] text-[#64748B] truncate">
                      {book.author}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openTopic(book.topicId);
                    }}
                    className="w-full mt-2 py-1.5 rounded bg-[#1273C4] text-white text-xs font-medium hover:bg-[#0F60A8] transition-colors"
                  >
                    Open Reader
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. The Three Open Library Shelves (Faithfully Matching Reference Image) */}
      <div className="space-y-10">
        {LIBRARY_SHELVES.map((shelf) => (
          <OpenLibraryShelf key={shelf.id} shelf={shelf} />
        ))}
      </div>

      {/* 4. Engineering Disciplines Catalog (32 Units Available) */}
      <div className="pt-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3 px-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#1E293B] tracking-tight">
              Curriculum Disciplines &amp; Problem Sets
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Access complete 4-unit course modules, mathematical derivations, and academic assessments.
            </p>
          </div>
          <span className="text-xs font-mono text-[#2563EB] bg-[#EFF6FF] px-3 py-1 rounded-lg border border-[#DBEAFE] font-semibold self-start sm:self-auto">
            8 Core Courses • 32 Modular Units
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUBJECTS_DATA.map((subject) => (
            <div
              key={subject.id}
              onClick={() => openSubject(subject.id)}
              className="bg-white rounded-xl p-5 border border-[#E2E8F0] hover:border-[#93C5FD] shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold border"
                    style={{
                      backgroundColor: `${subject.accent}15`,
                      borderColor: `${subject.accent}30`,
                      color: subject.accent,
                    }}
                  >
                    {subject.icon}
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
                    {subject.code}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#1E293B] group-hover:text-[#2563EB] transition-colors">
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
                <div className="pt-2 border-t border-[#F1F5F9] space-y-1">
                  {subject.topics.slice(0, 3).map((topic) => (
                    <div
                      key={topic.id}
                      className="text-[11px] text-[#64748B] truncate flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1] group-hover:bg-[#2563EB] transition-colors shrink-0" />
                      <span className="truncate">{topic.title}</span>
                    </div>
                  ))}
                  {subject.topics.length > 3 && (
                    <div className="text-[10px] text-[#94A3B8] font-mono pl-3">
                      + {subject.topics.length - 3} more unit
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-semibold text-[#2563EB]">
                <span>Open Syllabus</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
