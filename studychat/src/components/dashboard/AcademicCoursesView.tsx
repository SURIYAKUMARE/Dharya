import React, { useState } from 'react';
import { SUBJECTS_DATA, Subject } from '../../data/curriculumData';
import { useStudyApp } from '../../context/StudyAppContext';
import { DashboardActiveView } from './AlgoTutorSidebar';
import {
  GraduationCap,
  BookOpen,
  Clock,
  Play,
  Search,
  Layers,
  ChevronRight,
  Sparkles,
  Award
} from 'lucide-react';

interface AcademicCoursesViewProps {
  onNavigate?: (view: DashboardActiveView) => void;
}

export const AcademicCoursesView: React.FC<AcademicCoursesViewProps> = ({ onNavigate }) => {
  const { openSubject, openTopic } = useStudyApp();
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  const departments = ['All', 'Computer Science', 'Information Technology', 'Core Engineering'];

  const filteredSubjects = SUBJECTS_DATA.filter((sub) => {
    const matchDept =
      selectedDept === 'All' ||
      (selectedDept === 'Computer Science' && sub.department.includes('Computer')) ||
      (selectedDept === 'Information Technology' && (sub.department.includes('Information') || sub.title.includes('Data') || sub.title.includes('Cyber'))) ||
      (selectedDept === 'Core Engineering' && !sub.department.includes('Computer'));
    const matchSearch =
      sub.title.toLowerCase().includes(search.toLowerCase()) ||
      sub.code.toLowerCase().includes(search.toLowerCase()) ||
      sub.description.toLowerCase().includes(search.toLowerCase());
    return matchDept && matchSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0875E1] via-[#07549A] to-[#0A417A] text-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-2 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>10 AICTE Accredited Courses</span>
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif">Academic Courses &amp; Curriculum</h1>
        <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
          Access complete syllabus lecture units, authoritative textbook references, and interactive MCQs for all enrolled engineering disciplines.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedDept === dept
                  ? 'bg-[#0875E1] text-white shadow-xs'
                  : 'bg-[#F4F9FC] text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search course title, code (e.g. CS-301)..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#F4F9FC] border border-[#CBD5E1] text-xs text-[#172B4D] placeholder-slate-400 focus:outline-none focus:border-[#0875E1]"
          />
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSubjects.map((subject, idx) => {
          // Compute estimated completion & first topic
          const firstTopic = subject.topics && subject.topics.length > 0 ? subject.topics[0] : null;
          const estimatedHours = Math.round(subject.topics.reduce((acc, t) => acc + (t.estimatedMinutes || 25), 0) / 60);

          return (
            <div
              key={subject.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs hover:border-[#0875E1] hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {subject.code}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{subject.department}</span>
                </div>

                <h3 className="text-lg font-bold text-[#172B4D] leading-snug group-hover:text-[#0875E1] transition-colors">
                  {subject.title}
                </h3>

                <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                  {subject.description}
                </p>

                {/* Course Metadata Pills */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#64748B] pt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 font-mono">
                    <Layers className="w-3 h-3 text-blue-600" />
                    <span>{subject.topicsCount || subject.topics.length} Units</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 font-mono">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>~{estimatedHours || 12} Hours</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold">
                    <Award className="w-3 h-3" />
                    <span>{subject.credits || 4} Credits</span>
                  </span>
                </div>

                {/* Next Topic Preview */}
                {firstTopic && (
                  <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Featured Unit</div>
                    <div className="font-semibold text-slate-800 line-clamp-1">
                      {firstTopic.title}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => openSubject(subject.id)}
                  className="w-full py-2.5 rounded-xl bg-[#0875E1] hover:bg-[#07549A] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Open Course Units & Topics"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Open Course</span>
                </button>

                <button
                  onClick={() => {
                    if (firstTopic) {
                      openTopic(firstTopic.id);
                    } else {
                      openSubject(subject.id);
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Study Topic Handbook"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Start Topic</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
