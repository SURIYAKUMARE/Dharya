import React, { useState } from 'react';
import {
  FileText,
  Settings,
  BookOpen,
  ArrowRight,
  Sparkles,
  User,
  CheckCircle2
} from 'lucide-react';
import { SUBJECTS_DATA } from '../../data/curriculumData';
import { useStudyApp } from '../../context/StudyAppContext';

// 1. Handcrafted Syllabus Notes View connected to Real Curriculum
export const NotesView: React.FC = () => {
  const { openSubject, openTopic } = useStudyApp();

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-gradient-to-r from-[#0875E1] via-[#07549A] to-[#0A417A] text-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-2 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md">
          <FileText className="w-3.5 h-3.5" />
          <span>Curriculum Lecture Notes</span>
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif">Handcrafted Revision Notes</h1>
        <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
          Comprehensive unit-by-unit engineering lecture notes, formula sheets, code implementations, and exam cheat sheets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SUBJECTS_DATA.map((subject) => (
          <div
            key={subject.id}
            className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-xs hover:border-[#0875E1] hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {subject.code}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {subject.topics.length} Lecture Units
                </span>
              </div>
              <h4 className="text-base font-bold text-[#172B4D] group-hover:text-[#0875E1] transition-colors">
                {subject.title} Revision Pack
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2">
                Includes unit step-by-step breakdowns, key formulas, common exam pitfalls, and reference citations.
              </p>
            </div>

            <button
              onClick={() => openSubject(subject.id)}
              className="w-full mt-2 py-2.5 rounded-xl bg-slate-50 hover:bg-[#0875E1] text-slate-700 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-200 hover:border-[#0875E1]"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Open Subject Notes ({subject.code})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// 2. Settings & Profile View connected to student state
export const SettingsView: React.FC = () => {
  const { student, updateStudentProfile } = useStudyApp();
  const [name, setName] = useState(student?.name || 'Surya');
  const [semester, setSemester] = useState(student?.semester || '4th Semester');
  const [studentId] = useState(student?.studentId || 'ENG-2024-0910');
  const [department, setDepartment] = useState(student?.department || 'Computer Science & Engineering');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    updateStudentProfile({
      name: name.trim() || 'Surya',
      semester: semester.trim(),
      department: department.trim()
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12 max-w-2xl">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0875E1] flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#172B4D]">Student Profile &amp; Preferences</h3>
            <p className="text-xs text-slate-500">Manage your identity and academic records across the portal</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1.5">Student Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:border-[#0875E1] focus:ring-1 focus:ring-[#0875E1]"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1.5">Department / Branch</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:border-[#0875E1]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1.5">Academic Semester</label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:border-[#0875E1]"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1.5">Roll Number (Verified)</label>
              <input
                type="text"
                value={studentId}
                disabled
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 font-mono text-slate-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-[#0875E1] hover:bg-[#07549A] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            {isSaved ? 'Saved Successfully! ✔' : 'Save Changes'}
          </button>
          {isSaved && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> Updated student profile
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
