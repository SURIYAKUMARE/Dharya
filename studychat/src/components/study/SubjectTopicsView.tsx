import React from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { SUBJECTS_DATA } from '../../data/curriculumData';
import { ArrowLeft, Clock, BookOpen, ChevronRight, Layers, GraduationCap } from 'lucide-react';

export const SubjectTopicsView: React.FC = () => {
  const { selectedSubject, openTopic, switchTab, openSubject } = useStudyApp();

  const currentSubject = selectedSubject || SUBJECTS_DATA[0];

  return (
    <div className="space-y-6 pb-16">
      {/* Subject Header with Back Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => switchTab('home')}
          className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
          title="Back to All Subjects"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
            <span>{currentSubject.code}</span>
            <span>•</span>
            <span>{currentSubject.department}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {currentSubject.title}
          </h1>
        </div>
      </div>

      {/* Subject Description Card */}
      <div
        className="rounded-3xl p-6 border border-white/10 shadow-xl backdrop-blur-xl"
        style={{
          background: `radial-gradient(ellipse at top left, ${currentSubject.accentLight} 0%, rgba(13,10,24,0.95) 75%)`,
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg border"
              style={{
                backgroundColor: `${currentSubject.accent}20`,
                borderColor: `${currentSubject.accent}40`,
                color: currentSubject.accent,
              }}
            >
              {currentSubject.icon}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Course Curriculum Units</h2>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed mt-0.5">
                {currentSubject.description}
              </p>
            </div>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-right self-stretch sm:self-auto">
            <div className="text-[10px] font-mono text-slate-400">UNITS</div>
            <div className="text-lg font-black text-white">{currentSubject.topics.length} Available</div>
          </div>
        </div>
      </div>

      {/* Horizontal Subject Switcher Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {SUBJECTS_DATA.map((sub) => {
          const isSelected = sub.id === currentSubject.id;
          return (
            <button
              key={sub.id}
              onClick={() => openSubject(sub.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/50 shadow-sm'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              <span>{sub.icon}</span>
              <span>{sub.title}</span>
            </button>
          );
        })}
      </div>

      {/* Topics List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Select Topic to Study</span>
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {currentSubject.topics.map((topic, index) => (
            <div
              key={topic.id}
              onClick={() => openTopic(topic.id)}
              className="group p-6 rounded-3xl bg-[#0d0a18]/90 border border-white/10 hover:border-indigo-500/40 transition-all duration-300 hover:scale-[1.01] cursor-pointer shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-white/10 text-slate-300 font-mono text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border ${
                      topic.difficulty === 'Beginner'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : topic.difficulty === 'Intermediate'
                        ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                        : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {topic.difficulty}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{topic.estimatedMinutes} mins read</span>
                  </span>
                </div>

                <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {topic.title}
                </h4>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {topic.simpleExplanation}
                </p>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform self-end sm:self-center">
                <span>Open Textbook Page</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
