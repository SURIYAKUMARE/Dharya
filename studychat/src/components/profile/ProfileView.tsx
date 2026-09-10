import React, { useState } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { Award, CheckCircle2, Calendar, BookOpen, Clock, ShieldCheck, LogOut, Edit3, X, Save, User } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ProfileView: React.FC = () => {
  const { student, updateStudentProfile, assessmentRecord, isChatAuthenticated, logoutChat, tasks } = useStudyApp();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(student?.name || 'Surya');
  const [editStudentId, setEditStudentId] = useState(student?.studentId || 'ENG-2024-0910');
  const [editDepartment, setEditDepartment] = useState(student?.department || 'Computer Science & Engineering');
  const [editSemester, setEditSemester] = useState(student?.semester || 'Semester 4');

  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const pendingTasks = tasks.filter((t) => t.status === 'Pending').length;

  const handleOpenEdit = () => {
    setEditName(student?.name || 'Surya');
    setEditStudentId(student?.studentId || 'ENG-2024-0910');
    setEditDepartment(student?.department || 'Computer Science & Engineering');
    setEditSemester(student?.semester || 'Semester 4');
    setIsEditing(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    updateStudentProfile({
      name: editName.trim(),
      studentId: editStudentId.trim() || 'ENG-2024-0910',
      department: editDepartment.trim() || 'Computer Science & Engineering',
      semester: editSemester.trim() || 'Semester 4',
    });

    setIsEditing(false);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#a855f7', '#10b981'],
    });
  };

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6 pb-20">
      {/* Student Profile Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0E1424] border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 border border-blue-400/30 flex items-center justify-center text-white text-2xl font-black shadow-lg uppercase">
            {student?.name ? student.name.charAt(0) : 'S'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">
                {student?.name || 'Surya'}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                {student?.studentId || 'ENG-2024-0910'}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              {student?.department || 'Department of Computer Science & Engineering'} • {student?.semester || 'Semester 4'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Edit Profile / Change Name Button */}
          <button
            onClick={handleOpenEdit}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-slate-700 text-xs font-semibold text-blue-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

          {isChatAuthenticated && (
            <button
              onClick={logoutChat}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/30 text-xs font-semibold text-slate-400 hover:text-rose-300 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Academic Highlights & Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0E1424] border border-slate-800 space-y-1">
          <div className="text-2xl font-extrabold text-blue-400 font-mono">
            {assessmentRecord ? '1' : '0'}
          </div>
          <div className="text-xs font-bold text-white">Assessments</div>
          <div className="text-[10px] text-slate-400 font-mono">Verified Completed</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0E1424] border border-slate-800 space-y-1">
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {completedTasks}
          </div>
          <div className="text-xs font-bold text-white">Tasks Done</div>
          <div className="text-[10px] text-slate-400 font-mono">Manual Study Plans</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0E1424] border border-slate-800 space-y-1">
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            {pendingTasks}
          </div>
          <div className="text-xs font-bold text-white">Pending Tasks</div>
          <div className="text-[10px] text-slate-400 font-mono">On Schedule</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0E1424] border border-slate-800 space-y-1">
          <div className="text-2xl font-extrabold text-cyan-400 font-mono">
            {isChatAuthenticated ? 'Verified' : 'Enrolled'}
          </div>
          <div className="text-xs font-bold text-white">Academic Standing</div>
          <div className="text-[10px] text-slate-400 font-mono">
            {isChatAuthenticated ? 'Active Student' : 'Course Registered'}
          </div>
        </div>
      </div>

      {/* Assessment Verification Record */}
      <div className="p-6 rounded-2xl bg-[#0E1424] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Assessment Records</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Academic Verification</span>
        </div>

        {assessmentRecord ? (
          <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs font-mono text-blue-400 font-bold">
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
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold font-mono">
                {assessmentRecord.percentage}% PASSED
              </span>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-[#090D16] border border-dashed border-slate-800 text-center text-xs text-slate-400 font-mono">
            No assessments completed yet. Study a textbook topic and complete its assessment to log scores here.
          </div>
        )}
      </div>

      {/* Edit Profile / Change Name Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-[#0E1424] border border-slate-700 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Update Profile &amp; Name</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Student Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your name (e.g. Surya or Sadhana)"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[#090D16] border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Student ID / Roll Number
                </label>
                <input
                  type="text"
                  value={editStudentId}
                  onChange={(e) => setEditStudentId(e.target.value)}
                  placeholder="e.g. ENG-2024-0910"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#090D16] border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Academic Department
                </label>
                <input
                  type="text"
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  placeholder="e.g. Computer Science &amp; Engineering"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#090D16] border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Semester
                </label>
                <input
                  type="text"
                  value={editSemester}
                  onChange={(e) => setEditSemester(e.target.value)}
                  placeholder="e.g. Semester 4"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#090D16] border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
