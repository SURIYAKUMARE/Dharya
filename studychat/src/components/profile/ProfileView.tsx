import React, { useState } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import {
  Award,
  LogOut,
  Edit3,
  X,
  Save,
  User,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';
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
      colors: ['#2563eb', '#10b981', '#f59e0b'],
    });
  };

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6 pb-24 -mt-1">
      {/* Student Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5DFD5] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle Background Radial Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4.5 relative z-10">
          <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-3xl font-black shadow-md flex items-center justify-center uppercase shrink-0">
            {student?.name ? student.name.charAt(0) : 'S'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] font-serif">
                {student?.name || 'Surya'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-[#EBF3FB] text-[#1D4ED8] border border-[#BFDBFE]">
                {student?.studentId || 'ENG-2024-0910'}
              </span>
            </div>
            <p className="text-xs text-[#64748B] font-mono">
              {student?.department || 'Department of Computer Science & Engineering'} • {student?.semester || 'Semester 4'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end relative z-10">
          {/* Edit Profile Button */}
          <button
            onClick={handleOpenEdit}
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-[#F6F3EE] border border-[#DDD5C7] text-xs font-bold text-[#1273C4] hover:text-[#0D62A5] shadow-2xs hover:shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>

          {isChatAuthenticated && (
            <button
              onClick={logoutChat}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-rose-50 border border-[#DDD5C7] hover:border-rose-200 text-xs font-bold text-[#64748B] hover:text-rose-600 shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Academic Highlights & Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E5DFD5] shadow-xs space-y-1">
          <div className="text-2xl font-extrabold text-[#1273C4] font-mono">
            {assessmentRecord ? '1' : '0'}
          </div>
          <div className="text-xs font-bold text-[#0F172A]">Assessments</div>
          <div className="text-[10px] text-[#64748B] font-mono">Verified Completed</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E5DFD5] shadow-xs space-y-1">
          <div className="text-2xl font-extrabold text-[#059669] font-mono">
            {completedTasks}
          </div>
          <div className="text-xs font-bold text-[#0F172A]">Tasks Done</div>
          <div className="text-[10px] text-[#64748B] font-mono">Manual Study Goals</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E5DFD5] shadow-xs space-y-1">
          <div className="text-2xl font-extrabold text-[#D97706] font-mono">
            {pendingTasks}
          </div>
          <div className="text-xs font-bold text-[#0F172A]">Pending Tasks</div>
          <div className="text-[10px] text-[#64748B] font-mono">On Schedule</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E5DFD5] shadow-xs space-y-1">
          <div className="text-2xl font-extrabold text-[#2563EB] font-mono">
            {isChatAuthenticated ? 'Active' : 'Enrolled'}
          </div>
          <div className="text-xs font-bold text-[#0F172A]">Standing</div>
          <div className="text-[10px] text-[#64748B] font-mono">
            {isChatAuthenticated ? 'Verified Student' : 'Course Registered'}
          </div>
        </div>
      </div>

      {/* Assessment Verification Record */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E5DFD5] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#1273C4]" />
            <h3 className="text-base font-bold text-[#0F172A] font-serif">Assessment Records</h3>
          </div>
          <span className="text-xs font-mono text-[#64748B]">Academic Transcript</span>
        </div>

        {assessmentRecord ? (
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs font-mono text-[#1273C4] font-bold">
                {assessmentRecord.subjectTitle}
              </div>
              <h4 className="text-sm font-bold text-[#0F172A] font-serif">{assessmentRecord.topicTitle}</h4>
              <p className="text-[11px] text-[#64748B] font-mono">
                Verified: {new Date(assessmentRecord.completedAt).toLocaleDateString()}
              </p>
            </div>

            <div className="text-right">
              <div className="text-xl font-extrabold text-[#059669] font-mono">
                {assessmentRecord.score} / {assessmentRecord.total}
              </div>
              <span className="text-[10px] px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] font-bold font-mono">
                {assessmentRecord.percentage}% PASSED
              </span>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[#FAF8F5] border border-dashed border-[#DDD5C7] text-center text-xs text-[#64748B] font-mono">
            No assessments completed yet. Select a textbook topic and pass its timed assessment to record scores here.
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="relative bg-white border border-[#E5DFD5] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#1273C4]" />
                <h3 className="text-lg font-bold text-[#0F172A] font-serif">Update Profile Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#FAF8F5] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Student Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your name (e.g. Surya or Sadhana)"
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#CBD5E1] text-[#0F172A] text-sm focus:outline-none focus:border-[#1273C4]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Student ID / Roll Number
                </label>
                <input
                  type="text"
                  value={editStudentId}
                  onChange={(e) => setEditStudentId(e.target.value)}
                  placeholder="e.g. ENG-2024-0910"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#CBD5E1] text-[#0F172A] text-sm focus:outline-none focus:border-[#1273C4] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Academic Department
                </label>
                <input
                  type="text"
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#CBD5E1] text-[#0F172A] text-sm focus:outline-none focus:border-[#1273C4]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1.5">
                  Semester
                </label>
                <input
                  type="text"
                  value={editSemester}
                  onChange={(e) => setEditSemester(e.target.value)}
                  placeholder="e.g. Semester 4"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#CBD5E1] text-[#0F172A] text-sm focus:outline-none focus:border-[#1273C4]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#EDE8E1] border border-[#DDD5C7] text-[#475569] text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-[#1273C4] hover:bg-[#0D62A5] text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
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
