import React, { useState, useMemo } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { SUBJECTS_DATA } from '../../data/curriculumData';
import {
  Search,
  BookOpen,
  Sparkles,
  ArrowRight,
  Clock,
  Award,
  GraduationCap,
  Layers,
  ChevronRight,
  TrendingUp,
  FileCheck2
} from 'lucide-react';

export const StudyHomePage: React.FC = () => {
  const { openSubject, openTopic, assessmentRecord } = useStudyApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSubjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return SUBJECTS_DATA;
    return SUBJECTS_DATA.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.topics.some((t) => t.title.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Learning Banner */}
      <div className="relative rounded-3xl p-6 sm:p-10 overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-white/10 shadow-2xl">
        {/* Soft background glow */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Undergraduate &amp; GATE Engineering Syllabus</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Engineering Study &amp; Assessment Library
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Master textbook units, study detailed step-by-step proofs, and complete conceptual assessments across core computer science and engineering disciplines.
          </p>

          {/* Search Box */}
          <div className="pt-2">
            <div className="relative max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search engineering subjects, topics, or formulas..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#0A0A0F]/90 border border-white/15 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Study Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0d0a18]/80 border border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
            8
          </div>
          <div>
            <div className="text-xs font-bold text-white">Engineering Subjects</div>
            <div className="text-[10px] text-slate-400 font-mono">Curated Syllabi</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d0a18]/80 border border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">
              {assessmentRecord ? '1 Completed' : 'Assessments'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Topic MCQs</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d0a18]/80 border border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">100% Manual</div>
            <div className="text-[10px] text-slate-400 font-mono">Student Planner</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d0a18]/80 border border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400 font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Verified</div>
            <div className="text-[10px] text-slate-400 font-mono">Academic Content</div>
          </div>
        </div>
      </div>

      {/* Engineering Subjects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Engineering Subjects
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a subject to explore textbook topics, worked examples, and take assessments.
            </p>
          </div>
          <span className="text-xs font-mono text-indigo-400 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            {filteredSubjects.length} Courses
          </span>
        </div>

        {/* 8 Subject Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredSubjects.map((subject) => (
            <div
              key={subject.id}
              onClick={() => openSubject(subject.id)}
              className="group relative rounded-3xl bg-[#0d0a18]/90 border border-white/10 hover:border-indigo-500/40 p-6 transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-xl flex flex-col justify-between overflow-hidden"
              style={{
                background: `radial-gradient(ellipse at top left, ${subject.accentLight} 0%, rgba(13,10,24,0.95) 70%)`,
              }}
            >
              <div>
                {/* Header with Icon and Code */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg border"
                    style={{
                      backgroundColor: `${subject.accent}20`,
                      borderColor: `${subject.accent}40`,
                      color: subject.accent,
                    }}
                  >
                    {subject.icon}
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-white/10 text-slate-300 border border-white/10">
                    {subject.code}
                  </span>
                </div>

                {/* Subject Title & Department */}
                <div className="space-y-1 mb-3">
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {subject.title}
                  </h3>
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    {subject.department}
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
                  {subject.description}
                </p>
              </div>

              {/* Card Footer with Topics Count and Action */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  {subject.topics.length} {subject.topics.length === 1 ? 'Topic' : 'Topics'} Available
                </span>
                <div className="flex items-center gap-1 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
                  <span>Explore</span>
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
