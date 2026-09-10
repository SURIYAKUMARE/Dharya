import React, { useState, useMemo } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { SUBJECTS_DATA } from '../../data/curriculumData';
import {
  Search,
  BookOpen,
  ArrowRight,
  Clock,
  Award,
  GraduationCap,
  Layers,
  ChevronRight,
  FileCheck2,
  Bookmark,
  CheckCircle,
  Sparkles
} from 'lucide-react';

export const StudyHomePage: React.FC = () => {
  const { openSubject, openTopic, assessmentRecord } = useStudyApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'cs' | 'sciences' | 'systems'>('all');

  const filteredSubjects = useMemo(() => {
    let list = SUBJECTS_DATA;

    if (activeCategory === 'cs') {
      list = list.filter((s) => ['programming', 'data-structures', 'database'].includes(s.id));
    } else if (activeCategory === 'sciences') {
      list = list.filter((s) => ['mathematics', 'physics'].includes(s.id));
    } else if (activeCategory === 'systems') {
      list = list.filter((s) => ['java', 'python', 'ai-ml'].includes(s.id));
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;

    return list.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.topics.some(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.unitTitle.toLowerCase().includes(q) ||
            t.simpleExplanation.toLowerCase().includes(q)
        )
    );
  }, [searchQuery, activeCategory]);

  return (
    <div className="space-y-10 pb-20">
      {/* 1. Human-Crafted Institutional Hero Banner */}
      <div className="relative rounded-3xl p-6 sm:p-10 bg-[#0E1424] border border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-medium">
            <GraduationCap className="w-4 h-4 text-blue-400" />
            <span>Undergraduate Engineering Courseware • Semester IV</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Engineering Curriculum &amp; Assessment Library
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
            Authoritative textbook chapters, step-by-step mathematical proofs, working code architectures, and verified academic assessments across 8 core engineering disciplines.
          </p>

          {/* Search Bar */}
          <div className="pt-2">
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, formulas, algorithms (e.g. Eigenvalues, B+ Trees, Dijkstra, Asyncio)..."
                className="w-full pl-11 pr-10 py-3 rounded-xl bg-[#090D16] border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick-Search Tags */}
            <div className="flex items-center gap-2 pt-3 overflow-x-auto scrollbar-none text-[11px] font-mono text-slate-400">
              <span className="text-slate-500 shrink-0">Popular:</span>
              {[
                'Eigenvalues',
                'Fourier Series',
                'De Broglie',
                'Pointers',
                'AVL Trees',
                'Dijkstra',
                'Asyncio',
                'B+ Trees'
              ].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-2.5 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-blue-300 border border-white/5 whitespace-nowrap transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Academic Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1424] border border-slate-800/80 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 font-mono font-bold text-lg">
            8
          </div>
          <div>
            <div className="text-sm font-bold text-white">Core Courses</div>
            <div className="text-[11px] text-slate-400 font-mono">B.Tech Accredited</div>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1424] border border-slate-800/80 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-mono font-bold text-lg">
            32
          </div>
          <div>
            <div className="text-sm font-bold text-white">Syllabus Units</div>
            <div className="text-[11px] text-slate-400 font-mono">4 Units / Course</div>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1424] border border-slate-800/80 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">
              {assessmentRecord ? 'Verified (100%)' : 'Active Quizzes'}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">Conceptual MCQs</div>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1424] border border-slate-800/80 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">AICTE Aligned</div>
            <div className="text-[11px] text-slate-400 font-mono">GATE &amp; Exam Ready</div>
          </div>
        </div>
      </div>

      {/* 3. Course Catalog Section */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Engineering Disciplines
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select a discipline to access syllabus units, worked problem sets, and assessment modules.
            </p>
          </div>

          {/* Department Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0E1424] border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All (8)
            </button>
            <button
              onClick={() => setActiveCategory('cs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeCategory === 'cs'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Core CS (3)
            </button>
            <button
              onClick={() => setActiveCategory('sciences')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeCategory === 'sciences'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sciences (2)
            </button>
            <button
              onClick={() => setActiveCategory('systems')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeCategory === 'systems'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Software &amp; AI (3)
            </button>
          </div>
        </div>

        {/* 8 Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredSubjects.map((subject) => (
            <div
              key={subject.id}
              onClick={() => openSubject(subject.id)}
              className="group rounded-2xl bg-[#0E1424] hover:bg-[#121A30] border border-slate-800 hover:border-slate-700 transition-all duration-200 cursor-pointer p-5 flex flex-col justify-between shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <div className="space-y-4">
                {/* Header: Icon, Code & Credits */}
                <div className="flex items-center justify-between">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold border"
                    style={{
                      backgroundColor: `${subject.accent}15`,
                      borderColor: `${subject.accent}30`,
                      color: subject.accent,
                    }}
                  >
                    {subject.icon}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {subject.code}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-white/5">
                      {subject.credits} CR
                    </span>
                  </div>
                </div>

                {/* Title & Department */}
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                    {subject.title}
                  </h3>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
                    {subject.department}
                  </div>
                </div>

                <p className="text-xs text-slate-300/90 leading-relaxed line-clamp-2">
                  {subject.description}
                </p>

                {/* Micro-preview of the 4 units */}
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Curriculum Units ({subject.topics.length})
                  </div>
                  <div className="space-y-1">
                    {subject.topics.slice(0, 3).map((topic) => (
                      <div
                        key={topic.id}
                        className="text-[11px] text-slate-300 truncate flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-blue-400 transition-colors shrink-0" />
                        <span className="truncate">{topic.title}</span>
                      </div>
                    ))}
                    {subject.topics.length > 3 && (
                      <div className="text-[10px] text-slate-400 font-mono pl-3">
                        + {subject.topics.length - 3} more unit
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 font-medium">
                  {subject.topics.length} Units Available
                </span>
                <div className="flex items-center gap-1 text-xs font-bold text-blue-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Open Syllabus</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
