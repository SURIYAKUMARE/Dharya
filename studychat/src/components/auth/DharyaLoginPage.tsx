import React, { useState, useEffect } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { User, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, BookOpen, GraduationCap } from 'lucide-react';
import campusBg from '../../assets/campus_bg.jpg';

export const DharyaLoginPage: React.FC = () => {
  const { quickLogin, switchTab, setAssessmentNotice } = useStudyApp();

  // Inputs are strictly never pre-filled or pre-written
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Force blank inputs whenever this screen mounts
    setUsername('');
    setPassword('');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const u = username.trim().toUpperCase();
    const p = password.trim();

    // Secret authorized credentials
    const isMatchingUsername = u === 'DHARYA' || u === 'SURYA' || u === 'SADHANA' || u === '';

    // Password for Surya: "09/10/2007" -> Secretly enters chat as Surya
    if (isMatchingUsername && (p === '09/10/2007' || p === '09102007')) {
      quickLogin('surya');
      switchTab('chat');
      return;
    }

    // Password for Sadhana: "29/02/2008" -> Secretly enters chat as Sadhana
    if (isMatchingUsername && (p === '29/02/2008' || p === '29022008')) {
      quickLogin('sadhana');
      switchTab('chat');
      return;
    }

    // Direct password match fallback
    if (p === '09/10/2007' || p === '09102007') {
      quickLogin('surya');
      switchTab('chat');
      return;
    }

    if (p === '29/02/2008' || p === '29022008') {
      quickLogin('sadhana');
      switchTab('chat');
      return;
    }

    // ── IF WRONG PASSWORD OR WRONG USERNAME: IMMEDIATELY REDIRECT TO ASSESSMENT PAGE! ──
    setAssessmentNotice('Identity verification required. Please complete the module examination to verify active course enrollment.');
    switchTab('assessment');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 font-sans select-none overflow-hidden">
      {/* 1. Fullscreen College Campus Background - Exact Original Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${campusBg})`
        }}
      />

      {/* 2. Soft Ambient Tint for Natural Readability */}
      <div className="absolute inset-0 bg-black/25 pointer-events-none" />

      {/* 3. Main Academic Authentication Container */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#0B132B]/88 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-md text-white space-y-6">

          {/* Top Bar: Academic Session Badge & Library Shortcut */}
          <div className="flex items-center justify-between text-xs pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="text-slate-300 font-mono tracking-wider uppercase text-[10.5px] font-semibold">
                Academic Portal • 2026
              </span>
            </div>
            <button
              type="button"
              onClick={() => switchTab('home')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white transition-all border border-white/10 cursor-pointer text-xs font-medium"
              title="Return to Engineering Library & Curriculum"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>Library Hub</span>
            </button>
          </div>

          {/* Academic Portal Header */}
          <div className="text-center space-y-2 pt-1">
            <div className="w-13 h-13 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 border border-blue-400/30 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <GraduationCap className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/30 text-[10px] font-mono font-bold tracking-wider uppercase mb-1">
                AICTE &amp; GATE MODEL SYLLABUS
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white font-serif">
                Student Assessment Portal
              </h1>
            </div>
            <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
              Verify your student identity to take proctored course assessments or record semester scores.
            </p>
          </div>

          {/* Secure Verification Form (Completely blank, no pre-fill, autofill disabled) */}
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4 pt-1">
            {/* Student ID / Username Input */}
            <div className="space-y-1.5">
              <label htmlFor="academic_student_id" className="block text-xs font-semibold text-slate-300">
                Student ID / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="academic_student_id"
                  name="academic_student_id"
                  type="text"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck="false"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter Student ID / Username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-all font-sans"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label htmlFor="academic_student_passkey" className="block text-xs font-semibold text-slate-300">
                Verification Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="academic_student_passkey"
                  name="academic_student_passkey"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck="false"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white text-sm font-semibold transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Verifying...' : 'Verify Student Access'}</span>
                <ArrowRight className="w-4 h-4 text-blue-200" />
              </button>
            </div>
          </form>

          {/* Academic Verification Footer */}
          <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5 border-t border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Authorized Proctored Academic Session</span>
          </div>

        </div>
      </div>
    </div>
  );
};
