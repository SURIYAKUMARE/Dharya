import React from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { User, Award, CheckCircle2, Calendar, BookOpen, Clock, ShieldCheck, LogOut } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { student, assessmentRecord, isChatAuthenticated, logoutChat, tasks } = useStudyApp();

  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const pendingTasks = tasks.filter((t) => t.status === 'Pending').length;

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6 pb-20">
      {/* Student Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0d0a18]/90 border border-white/10 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 border border-white/20 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-indigo-500/20">
            {student ? student.name.charAt(0) : 'S'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">
                {student ? student.name : 'Engineering Student'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {student ? student.studentId : 'ID: ENG-2026'}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              {student ? student.department : 'Department of Computer Science & Engineering'} • Semester 4
            </p>
          </div>
        </div>

        {isChatAuthenticated && (
          <button
            onClick={logoutChat}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-xs font-semibold text-slate-400 hover:text-rose-300 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of Chat</span>
          </button>
        )}
      </div>

      {/* Academic Highlights & Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
          <div className="text-2xl font-extrabold text-indigo-400 font-mono">
            {assessmentRecord ? '1' : '0'}
          </div>
          <div className="text-xs font-bold text-white">Assessments</div>
          <div className="text-[10px] text-slate-400">Verified Completed</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {completedTasks}
          </div>
          <div className="text-xs font-bold text-white">Tasks Done</div>
          <div className="text-[10px] text-slate-400">Manual Study Plans</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            {pendingTasks}
          </div>
          <div className="text-xs font-bold text-white">Pending Tasks</div>
          <div className="text-[10px] text-slate-400">On Schedule</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
          <div className="text-2xl font-extrabold text-pink-400 font-mono">
            {isChatAuthenticated ? 'Active' : 'Locked'}
          </div>
          <div className="text-xs font-bold text-white">AI Chat Access</div>
          <div className="text-[10px] text-slate-400">
            {isChatAuthenticated ? 'Verified' : 'Assessment Required'}
          </div>
        </div>
      </div>

      {/* Assessment Verification Record */}
      <div className="p-6 rounded-3xl bg-[#0d0a18]/90 border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Assessment Records</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Academic Verification</span>
        </div>

        {assessmentRecord ? (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs font-mono text-indigo-400 font-bold">
                {assessmentRecord.subjectTitle}
              </div>
              <h4 className="text-sm font-bold text-white">{assessmentRecord.topicTitle}</h4>
              <p className="text-[11px] text-slate-400 font-mono">
                Verified: {new Date(assessmentRecord.completedAt).toLocaleDateString()}
              </p>
            </div>

            <div className="text-right">
              <div className="text-lg font-black text-emerald-400 font-mono">
                {assessmentRecord.score} / {assessmentRecord.total}
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                {assessmentRecord.percentage}% PASSED
              </span>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center text-xs text-slate-400 font-mono">
            No assessments completed yet. Study a textbook topic and complete its assessment to log scores here.
          </div>
        )}
      </div>
    </div>
  );
};
