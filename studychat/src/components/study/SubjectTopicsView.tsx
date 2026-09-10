import React, { useState, useMemo } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { SUBJECTS_DATA } from '../../data/curriculumData';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  ChevronRight,
  Layers,
  GraduationCap,
  Award,
  FileCheck2,
  BookmarkCheck,
  CheckCircle2
} from 'lucide-react';

export const SubjectTopicsView: React.FC = () => {
  const { selectedSubject, openTopic, switchTab, openSubject } = useStudyApp();
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  const currentSubject = selectedSubject || SUBJECTS_DATA[0];

  const filteredTopics = useMemo(() => {
    if (filterDifficulty === 'all') return currentSubject.topics;
    return currentSubject.topics.filter((t) => t.difficulty.toLowerCase() === filterDifficulty.toLowerCase());
  }, [currentSubject, filterDifficulty]);

  return (
    <div className="space-y-8 pb-20">
      {/* 1. Academic Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DFD5] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => switchTab('home')}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F6F3EE] border border-[#DDD5C7] text-xs font-semibold text-[#334155] hover:text-[#0F172A] shadow-sm transition-all flex items-center gap-2"
            title="Back to All Courses"
          >
            <ArrowLeft className="w-4 h-4 text-[#64748B]" />
            <span className="hidden sm:inline">All Courses</span>
          </button>

          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#1273C4] font-semibold">
              <span>{currentSubject.code}</span>
              <span className="text-[#CBD5E1]">•</span>
              <span className="text-[#64748B]">{currentSubject.department}</span>
              <span className="text-[#CBD5E1]">•</span>
              <span className="text-[#64748B]">{currentSubject.credits} Credits</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight font-serif">
              {currentSubject.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1 rounded-lg text-xs font-mono font-medium bg-[#EBF3FB] text-[#1D4ED8] border border-[#BFDBFE]">
            Syllabus: AICTE &amp; GATE Model
          </span>
        </div>
      </div>

      {/* 2. Course Syllabus Banner */}
      <div className="rounded-2xl p-6 sm:p-7 bg-white border border-[#E5DFD5] shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold border shrink-0 shadow-sm"
              style={{
                backgroundColor: `${currentSubject.accent}15`,
                borderColor: `${currentSubject.accent}30`,
                color: currentSubject.accent,
              }}
            >
              {currentSubject.icon}
            </div>
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-[#1E293B] font-serif">Course Curriculum &amp; Modular Syllabus</h2>
              <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl leading-relaxed">
                {currentSubject.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto shrink-0">
            <div className="px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] text-center flex-1 sm:flex-none">
              <div className="text-[10px] font-mono text-[#64748B] uppercase">Modular Units</div>
              <div className="text-base font-bold text-[#1E293B] font-mono">{currentSubject.topics.length} Units</div>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] text-center flex-1 sm:flex-none">
              <div className="text-[10px] font-mono text-[#64748B] uppercase">Estimated Study</div>
              <div className="text-base font-bold text-[#059669] font-mono">
                {currentSubject.topics.reduce((acc, t) => acc + t.estimatedMinutes, 0)} Mins
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Horizontal Course Switcher Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {SUBJECTS_DATA.map((sub) => {
          const isSelected = sub.id === currentSubject.id;
          return (
            <button
              key={sub.id}
              onClick={() => openSubject(sub.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#1273C4] text-white shadow-sm border border-[#1273C4]'
                  : 'bg-white text-[#475569] hover:text-[#0F172A] hover:bg-[#F8F6F1] border border-[#DDD5C7] shadow-2xs'
              }`}
            >
              <span>{sub.icon}</span>
              <span>{sub.title}</span>
              <span className="text-[10px] font-mono opacity-80">({sub.topics.length})</span>
            </button>
          );
        })}
      </div>

      {/* 4. Syllabus Units List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-[#1E293B] font-serif flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#1273C4]" />
            <span>Syllabus Units &amp; Textbook Chapters</span>
          </h3>

          {/* Difficulty Filter Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-white border border-[#DDD5C7] self-start sm:self-auto text-xs shadow-2xs">
            {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterDifficulty(lvl)}
                className={`px-3 py-1 rounded capitalize font-medium transition-all ${
                  filterDifficulty === lvl
                    ? 'bg-[#1273C4] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Units Cards Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredTopics.map((topic, index) => (
            <div
              key={topic.id}
              onClick={() => openTopic(topic.id)}
              className="group p-5 sm:p-6 rounded-2xl bg-white hover:bg-[#FDFBF7] border border-[#E5DFD5] hover:border-[#1273C4]/60 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
            >
              <div className="space-y-2.5 flex-1">
                {/* Header Meta: Unit Number + Title + Level + Reading Time */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#EBF3FB] text-[#1D4ED8] font-mono text-[11px] font-bold border border-[#BFDBFE]">
                    Unit {topic.unitNumber || index + 1}
                  </span>
                  <span className="text-xs font-mono text-[#64748B]">
                    {topic.unitTitle}
                  </span>
                  <span className="text-[#CBD5E1]">•</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono border ${
                      topic.difficulty === 'Beginner'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : topic.difficulty === 'Intermediate'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {topic.difficulty}
                  </span>
                  <span className="text-xs text-[#64748B] flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                    <span>{topic.estimatedMinutes} mins read</span>
                  </span>
                </div>

                {/* Topic Title */}
                <h4 className="text-lg font-bold text-[#1E293B] group-hover:text-[#1273C4] font-serif transition-colors">
                  {topic.title}
                </h4>

                {/* Intuitive One-Liner Description */}
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed max-w-3xl">
                  {topic.simpleExplanation}
                </p>

                {/* Formula / Code Snippet Preview Pill */}
                {topic.formulasOrCode && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#FAF8F5] border border-[#E8E2D8] text-[11px] font-mono text-[#334155]">
                    <span className="text-[#1273C4] font-bold">
                      {topic.formulasOrCode.type === 'formula' ? 'Key Formula:' : 'Code Pattern:'}
                    </span>
                    <span className="truncate max-w-md text-[#475569]">
                      {topic.formulasOrCode.content.slice(0, 70)}
                      {topic.formulasOrCode.content.length > 70 ? '...' : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* Right Action & Assessment Badge */}
              <div className="flex flex-col items-end gap-2 shrink-0 self-stretch md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-[#E5DFD5]">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#047857] bg-[#ECFDF5] px-2.5 py-1 rounded-md border border-[#A7F3D0]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Assessment Ready</span>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-[#1273C4] group-hover:translate-x-0.5 transition-transform">
                  <span>Read Chapter &amp; Notes</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
