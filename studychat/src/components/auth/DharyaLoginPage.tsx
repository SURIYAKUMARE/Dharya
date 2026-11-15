import React, { useState, useEffect } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { User, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, BookOpen, GraduationCap, AlertCircle } from 'lucide-react';
import campusBg from '../../assets/campus_bg.jpg';

export const DharyaLoginPage: React.FC = () => {
  const { quickLogin, switchTab, setAssessmentNotice } = useStudyApp();

  // Inputs are strictly never pre-filled or pre-written
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Force blank inputs whenever this screen mounts
    setUsername('');
    setPassword('');
    setErrorMessage('');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const u = username.trim().toUpperCase();
    const p = password.trim();

    // 1. Authorized Credential Set 1: SEC25EI091 & Sn@2902
    if (u === 'SEC25EI091' && (p === 'Sn@2902' || p === 'sn@2902' || p === '29/02/2008' || p === '29022008')) {
      quickLogin('sadhana');
      return;
    }

    // 2. Authorized Credential Set 2: "SADHANA" / "DHARYA" & "09/10/2007" / "29/02/2008" / "Sn@2902"
    if ((u === 'SADHANA' || u === 'SADHANA N' || u === 'DHARYA' || u === '') && (p === '09/10/2007' || p === '09102007' || p === '29/02/2008' || p === '29022008' || p === 'Sn@2902' || p === 'sn@2902')) {
      quickLogin('sadhana');
      return;
    }

    // Direct password match fallback if username is omitted
    if (p === 'Sn@2902' || p === 'sn@2902' || p === '09/10/2007' || p === '09102007' || p === '29/02/2008' || p === '29022008') {
      quickLogin('sadhana');
      return;
    }

    // ── IF WRONG USERNAME OR WRONG PASSWORD: TELL THEM IT IS WRONG! ──
    setIsLoading(false);
    setErrorMessage('Wrong username and password');
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
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] text-slate-900 space-y-6">

          {/* Top Bar: Academic Session Badge & Library Shortcut */}
          <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
              <span className="text-slate-600 font-mono tracking-wider uppercase text-[10.5px] font-semibold">
                Academic Portal • 2026
              </span>
            </div>
            <button
              type="button"
              onClick={() => switchTab('home')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-all border border-slate-200 cursor-pointer text-xs font-medium shadow-2xs"
              title="Return to Engineering Library & Curriculum"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Library Hub</span>
            </button>
          </div>

          {/* Academic Portal Header */}
          <div className="text-center space-y-2 pt-1">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 border border-blue-400/30 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <GraduationCap className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold tracking-wider uppercase mb-1">
                SRI SAIRAM ENGINEERING COLLEGE
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-serif">
                Student Assessment Portal
              </h1>
              <div className="text-[11px] font-medium text-blue-600 mt-0.5">
                Dept. of Electronics and Instrumentation Engineering
              </div>
            </div>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Verify student credentials (SEC25EI091) to take proctored course assessments or record semester scores.
            </p>
          </div>

          {/* Secure Verification Form (Completely blank, no pre-fill, autofill disabled) */}
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4 pt-1">
            {/* Student ID / Username Input */}
            <div className="space-y-1.5">
              <label htmlFor="academic_student_id" className="block text-xs font-semibold text-slate-700">
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
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="e.g. SEC25EI091 or Student ID"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 shadow-xs transition-all font-sans ${
                    errorMessage ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/20'
                  }`}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label htmlFor="academic_student_passkey" className="block text-xs font-semibold text-slate-700">
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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Enter password"
                  className={`w-full pl-10 pr-11 py-2.5 rounded-xl bg-white border text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 shadow-xs transition-all font-sans ${
                    errorMessage ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message if wrong username/password */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-rose-800">{errorMessage}</div>
                  <div className="text-[11px] text-rose-600 font-normal">
                    Please verify your institutional student ID and password before retrying.
                  </div>
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white text-sm font-semibold transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Verifying...' : 'Verify Student Access'}</span>
                <ArrowRight className="w-4 h-4 text-blue-200" />
              </button>
            </div>
          </form>

          {/* Academic Verification Footer */}
          <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5 border-t border-slate-100">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Authorized Proctored Academic Session</span>
          </div>

        </div>
      </div>
    </div>
  );
};
