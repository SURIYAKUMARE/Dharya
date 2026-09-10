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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => switchTab('home')}
            className="p-2.5 rounded-xl bg-[#0E1424] hover:bg-[#151E36] border border-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-xs font-semibold"
            title="Back to All Courses"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">All Courses</span>
          </button>

          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
              <span>{currentSubject.code}</span>
              <span>•</span>
              <span>{currentSubject.department}</span>
              <span>•</span>
              <span className="text-slate-400">{currentSubject.credits} Credits</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {currentSubject.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1 rounded-lg text-xs font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Syllabus: AICTE &amp; GATE Model
          </span>
        </div>
      </div>

      {/* 2. Course Syllabus Banner */}
      <div className="rounded-2xl p-6 bg-[#0E1424] border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold border shrink-0 shadow-inner"
              style={{
                backgroundColor: `${currentSubject.accent}18`,
                borderColor: `${currentSubject.accent}35`,
                color: currentSubject.accent,
              }}
            >
              {currentSubject.icon}
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white">Course Curriculum &amp; Modular Syllabus</h2>
              <p className="text-xs text-slate-300/90 max-w-2xl leading-relaxed">
                {currentSubject.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto shrink-0">
            <div className="px-4 py-2.5 rounded-xl bg-[#090D16] border border-slate-800 text-center flex-1 sm:flex-none">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Modular Units</div>
              <div className="text-base font-bold text-white font-mono">{currentSubject.topics.length} Units</div>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-[#090D16] border border-slate-800 text-center flex-1 sm:flex-none">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Estimated Study</div>
              <div className="text-base font-bold text-emerald-400 font-mono">
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
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-[#0E1424] text-slate-400 hover:text-white hover:bg-[#141C33] border border-slate-800'
              }`}
            >
              <span>{sub.icon}</span>
              <span>{sub.title}</span>
              <span className="text-[10px] font-mono opacity-70">({sub.topics.length})</span>
            </button>
          );
        })}
      </div>

      {/* 4. Syllabus Units List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Syllabus Units &amp; Textbook Chapters</span>
          </h3>

          {/* Difficulty Filter Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0E1424] border border-slate-800 self-start sm:self-auto text-xs">
            {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterDifficulty(lvl)}
                className={`px-3 py-1 rounded capitalize font-medium transition-all ${
                  filterDifficulty === lvl
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
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
              className="group p-5 sm:p-6 rounded-2xl bg-[#0E1424] hover:bg-[#121A30] border border-slate-800 hover:border-slate-700 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
            >
              <div className="space-y-2.5 flex-1">
                {/* Header Meta: Unit Number + Title + Level + Reading Time */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-mono text-[11px] font-bold border border-blue-500/20">
                    Unit {topic.unitNumber || index + 1}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {topic.unitTitle}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono border ${
                      topic.difficulty === 'Beginner'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                        : topic.difficulty === 'Intermediate'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/25'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                    }`}
                  >
                    {topic.difficulty}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{topic.estimatedMinutes} mins read</span>
                  </span>
                </div>

                {/* Topic Title */}
                <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                  {topic.title}
                </h4>

                {/* Intuitive One-Liner Description */}
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  {topic.simpleExplanation}
                </p>

                {/* Formula / Code Snippet Preview Pill */}
                {topic.formulasOrCode && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#090D16] border border-slate-800 text-[11px] font-mono text-slate-300">
                    <span className="text-blue-400 font-bold">
                      {topic.formulasOrCode.type === 'formula' ? 'Key Formula:' : 'Code Pattern:'}
                    </span>
                    <span className="truncate max-w-md text-slate-300">
                      {topic.formulasOrCode.content.slice(0, 70)}
                      {topic.formulasOrCode.content.length > 70 ? '...' : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* Right Action & Assessment Badge */}
              <div className="flex flex-col items-end gap-2 shrink-0 self-stretch md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Assessment Ready</span>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-blue-400 group-hover:translate-x-0.5 transition-transform">
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
