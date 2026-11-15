import React, { useState } from 'react';
import { ACADEMIC_COURSES, AcademicCourseItem } from '../../services/dashboardApiService';
import { GraduationCap, BookOpen, Clock, CheckCircle2, Play, Search, Filter } from 'lucide-react';

export const AcademicCoursesView: React.FC = () => {
  const [courses, setCourses] = useState<AcademicCourseItem[]>(ACADEMIC_COURSES);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Computer Science', 'System Design', 'Full Stack', 'Cloud & DevOps'];

  const filtered = courses.filter((c) => {
    const matchCat = selectedCategory === 'All' || c.category === selectedCategory;
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0875E1] to-[#07549A] text-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-2">
        <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">
          Enrolled Modules
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif">Academic Courses &amp; Curriculum</h1>
        <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
          Access your syllabus lectures, assignments, and verified course progress across accredited modules.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0875E1] text-white'
                  : 'bg-[#F4F9FC] text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search course..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#F4F9FC] border border-[#CBD5E1] text-xs text-[#172B4D] focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {course.code}
                </span>
                <span className="text-xs text-slate-500 font-medium">{course.category}</span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-[#172B4D] leading-snug">
                {course.title}
              </h3>

              <div className="text-xs text-[#64748B]">
                Instructor: <strong className="text-[#172B4D]">{course.instructor}</strong>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Course Progress</span>
                  <span className="font-mono text-blue-600">{course.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0875E1] h-full rounded-full transition-all duration-500"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>{course.completedLessons} of {course.totalLessons} Lessons</span>
                  <span>{course.hours} Hours</span>
                </div>
              </div>

              {/* Next Lesson Preview */}
              <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Up Next</div>
                <div className="font-semibold text-slate-800 line-clamp-1">
                  {course.nextLessonTitle}
                </div>
              </div>
            </div>

            <button className="w-full py-2.5 rounded-xl bg-[#0875E1] hover:bg-[#07549A] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs">
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Continue Lesson</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
