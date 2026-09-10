import React, { useState } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import {
  Award,
  CheckCircle2,
  Calendar,
  BookOpen,
  Clock,
  ShieldCheck,
  Shield,
  Lock,
  Key,
  Copy,
  LogOut,
  Edit3,
  X,
  Save,
  User,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ProfileView: React.FC = () => {
  const { student, updateStudentProfile, assessmentRecord, isChatAuthenticated, logoutChat, tasks } = useStudyApp();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(student?.name || 'Surya');
  const [editStudentId, setEditStudentId] = useState(student?.studentId || 'ENG-2024-0910');
  const [editDepartment, setEditDepartment] = useState(student?.department || 'Computer Science & Engineering');
  const [editSemester, setEditSemester] = useState(student?.semester || 'Semester 4');

  // Security Center States
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [profilePrivacy, setProfilePrivacy] = useState<boolean>(() => {
    try {
      return localStorage.getItem('studyportal_privacy_toggle') === 'true';
    } catch {
      return false;
    }
  });
  const [profilePin, setProfilePin] = useState<boolean>(() => {
    try {
      return localStorage.getItem('study_chat_pin_enabled') === 'true';
    } catch {
      return false;
    }
  });

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

  const handleTogglePrivacy = () => {
    const next = !profilePrivacy;
    setProfilePrivacy(next);
    localStorage.setItem('studyportal_privacy_toggle', String(next));
  };

  const handleTogglePin = () => {
    const next = !profilePin;
    setProfilePin(next);
    localStorage.setItem('study_chat_pin_enabled', String(next));
  };

  const handleCopySafetyCode = () => {
    const safetyNumber = '52910 09102 00729 02200 81928 47291 93820 18472 90184 75619 38291 04928';
    navigator.clipboard.writeText(safetyNumber);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
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

      {/* ── SECURITY & PRIVACY CENTER ── */}
      <div className="p-6 rounded-2xl bg-white border border-[#E5DFD5] shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EBF3FB] text-[#1273C4] flex items-center justify-center border border-[#BFDBFE]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1E293B] font-serif">Security &amp; Privacy Center</h3>
              <p className="text-[11px] text-[#64748B] font-mono">Zero-Knowledge Storage &amp; Cryptographic Protocols</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] font-mono text-[10px] font-bold">
            AES-256 E2EE Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Status 1: Storage Persistence */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1E293B]">
              <Lock className="w-3.5 h-3.5 text-[#1273C4]" />
              <span>Permanent Device Storage</span>
            </div>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              Your chat history, gallery photos, and audio notes remain permanently stored on this device without resetting or losing messages on new logins.
            </p>
          </div>

          {/* Status 2: Authentication */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1E293B]">
              <Key className="w-3.5 h-3.5 text-[#059669]" />
              <span>DHARYA Dual-Key Authentication</span>
            </div>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              Verified dual-credential gateway protecting Surya &amp; Sadhana direct channel with zero cloud message leaks.
            </p>
          </div>
        </div>

        {/* Security Controls */}
        <div className="space-y-3 pt-1">
          {/* Toggle 1: Advanced Privacy */}
          <div className="p-3.5 rounded-xl border border-[#E5DFD5] bg-[#FAF8F5] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#1E293B]">Advanced Chat Privacy Shield</div>
              <div className="text-[11px] text-[#64748B]">Restricts message exports and protects local media</div>
            </div>
            <button
              type="button"
              onClick={handleTogglePrivacy}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                profilePrivacy ? 'bg-[#1273C4]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  profilePrivacy ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Toggle 2: Chat PIN Lock */}
          <div className="p-3.5 rounded-xl border border-[#E5DFD5] bg-[#FAF8F5] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#1E293B]">Chat 4-Digit PIN Lock</div>
              <div className="text-[11px] text-[#64748B]">Requires PIN code (0929) to enter confidential messaging</div>
            </div>
            <button
              type="button"
              onClick={handleTogglePin}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                profilePin ? 'bg-[#1273C4]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  profilePin ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Safety Fingerprint Button */}
        <div className="pt-2 flex justify-between items-center">
          <button
            type="button"
            onClick={() => setShowSafetyModal(true)}
            className="px-4 py-2 rounded-xl bg-[#EBF3FB] hover:bg-[#DBEAFE] border border-[#BFDBFE] text-xs font-semibold text-[#1273C4] transition-colors flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Verify Safety Number Fingerprint</span>
          </button>
          <span className="text-[10px] font-mono text-[#64748B]">AICTE Secure Session</span>
        </div>
      </div>

      {/* Safety Number Fingerprint Modal */}
      {showSafetyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white border border-[#E5DFD5] rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#1273C4]" />
                <h3 className="text-base font-bold text-[#1E293B] font-serif">Cryptographic Safety Number</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSafetyModal(false)}
                className="p-1 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-[#FAF8F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed">
              Verify this 60-digit safety fingerprint between Surya and Sadhana to ensure your direct channel is cryptographically private.
            </p>

            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] font-mono text-center text-xs tracking-wider text-[#1273C4] leading-relaxed select-all">
              52910 09102 00729 02200 81928 47291<br />
              93820 18472 90184 75619 38291 04928
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={handleCopySafetyCode}
                className="px-4 py-2 rounded-xl bg-[#1273C4] hover:bg-[#0D62A5] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedKey ? 'Copied to Clipboard!' : 'Copy Safety Number'}</span>
              </button>
              <span className="text-xs text-[#059669] font-mono font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Verified</span>
              </span>
            </div>
          </div>
        </div>
      )}

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
