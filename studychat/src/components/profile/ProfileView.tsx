import React, { useState } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import {
  Award,
  LogOut,
  Edit3,
  X,
  Save,
  User
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
      colors: ['#6366f1', '#a855f7', '#10b981'],
    });
  };

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6 pb-20">
      {/* Student Profile Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5DFD5] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1273C4] text-white text-2xl font-black shadow-md flex items-center justify-center uppercase">
            {student?.name ? student.name.charAt(0) : 'S'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#1E293B] font-serif">
                {student?.name || 'Surya'}
              </h2>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EBF3FB] text-[#1D4ED8] border border-[#BFDBFE]">
                {student?.studentId || 'ENG-2024-0910'}
              </span>
            </div>
            <p className="text-xs text-[#64748B] font-mono">
              {student?.department || 'Department of Computer Science & Engineering'} • {student?.semester || 'Semester 4'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Edit Profile / Change Name Button */}
          <button
            onClick={handleOpenEdit}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F6F3EE] border border-[#DDD5C7] text-xs font-semibold text-[#1273C4] hover:text-[#0D62A5] shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

          {isChatAuthenticated && (
            <button
              onClick={logoutChat}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 border border-[#DDD5C7] hover:border-rose-200 text-xs font-semibold text-[#64748B] hover:text-rose-600 shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Academic Highlights & Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-sm space-y-1">
          <div className="text-2xl font-extrabold text-[#1273C4] font-mono">
            {assessmentRecord ? '1' : '0'}
          </div>
          <div className="text-xs font-bold text-[#1E293B]">Assessments</div>
          <div className="text-[10px] text-[#64748B] font-mono">Verified Completed</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-sm space-y-1">
          <div className="text-2xl font-extrabold text-[#059669] font-mono">
            {completedTasks}
          </div>
          <div className="text-xs font-bold text-[#1E293B]">Tasks Done</div>
          <div className="text-[10px] text-[#64748B] font-mono">Manual Study Plans</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-sm space-y-1">
          <div className="text-2xl font-extrabold text-[#D97706] font-mono">
            {pendingTasks}
          </div>
          <div className="text-xs font-bold text-[#1E293B]">Pending Tasks</div>
          <div className="text-[10px] text-[#64748B] font-mono">On Schedule</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-sm space-y-1">
          <div className="text-2xl font-extrabold text-[#0284C7] font-mono">
            {isChatAuthenticated ? 'Verified' : 'Enrolled'}
          </div>
          <div className="text-xs font-bold text-[#1E293B]">Academic Standing</div>
          <div className="text-[10px] text-[#64748B] font-mono">
            {isChatAuthenticated ? 'Active Student' : 'Course Registered'}
          </div>
        </div>
      </div>

      {/* Assessment Verification Record */}
      <div className="p-6 rounded-2xl bg-white border border-[#E5DFD5] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#1273C4]" />
            <h3 className="text-base font-bold text-[#1E293B] font-serif">Assessment Records</h3>
          </div>
          <span className="text-xs font-mono text-[#64748B]">Academic Verification</span>
        </div>

        {assessmentRecord ? (
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs font-mono text-[#1273C4] font-bold">
                {assessmentRecord.subjectTitle}
              </div>
              <h4 className="text-sm font-bold text-[#1E293B] font-serif">{assessmentRecord.topicTitle}</h4>
              <p className="text-[11px] text-[#64748B] font-mono">
                Verified: {new Date(assessmentRecord.completedAt).toLocaleDateString()}
              </p>
            </div>

            <div className="text-right">
              <div className="text-lg font-black text-[#059669] font-mono">
                {assessmentRecord.score} / {assessmentRecord.total}
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] font-bold font-mono">
                {assessmentRecord.percentage}% PASSED
              </span>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-[#FAF8F5] border border-dashed border-[#DDD5C7] text-center text-xs text-[#64748B] font-mono">
            No assessments completed yet. Study a textbook topic and complete its assessment to log scores here.
          </div>
        )}
      </div>

      {/* Edit Profile / Change Name Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white border border-[#E5DFD5] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#1273C4]" />
                <h3 className="text-lg font-bold text-[#1E293B] font-serif">Update Profile &amp; Name</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-[#FAF8F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                  Student Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your name (e.g. Surya or Sadhana)"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-[#1E293B] text-sm focus:outline-none focus:border-[#1273C4] focus:ring-2 focus:ring-[#1273C4]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                  Student ID / Roll Number
                </label>
                <input
                  type="text"
                  value={editStudentId}
                  onChange={(e) => setEditStudentId(e.target.value)}
                  placeholder="e.g. ENG-2024-0910"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-[#1E293B] text-sm focus:outline-none focus:border-[#1273C4] focus:ring-2 focus:ring-[#1273C4]/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                  Academic Department
                </label>
                <input
                  type="text"
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-[#1E293B] text-sm focus:outline-none focus:border-[#1273C4] focus:ring-2 focus:ring-[#1273C4]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                  Semester
                </label>
                <input
                  type="text"
                  value={editSemester}
                  onChange={(e) => setEditSemester(e.target.value)}
                  placeholder="e.g. Semester 4"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-[#1E293B] text-sm focus:outline-none focus:border-[#1273C4] focus:ring-2 focus:ring-[#1273C4]/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#EDE8E1] border border-[#DDD5C7] text-[#475569] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#1273C4] hover:bg-[#0D62A5] text-white text-xs font-bold shadow-md flex items-center gap-1.5"
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
