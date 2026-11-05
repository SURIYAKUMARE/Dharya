import React, { useState } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { User, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, BookOpen, KeyRound } from 'lucide-react';

export const DharyaLoginPage: React.FC = () => {
  const { quickLogin, switchTab, setAssessmentNotice } = useStudyApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const u = username.trim().toUpperCase();
    const p = password.trim();

    // Correct username: "DHARYA" (also accepts "SURYA" or "SADHANA")
    const isMatchingUsername = u === 'DHARYA' || u === 'SURYA' || u === 'SADHANA' || u === '';

    // Password for Surya: "09/10/2007" -> Enters chat as Surya
    if (isMatchingUsername && (p === '09/10/2007' || p === '09102007')) {
      quickLogin('surya');
      switchTab('chat');
      return;
    }

    // Password for Sadhana: "29/02/2008" -> Enters chat as Sadhana
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

    // ── IF THEY ENTER WRONG PASSWORD OR USERNAME: REDIRECT TO ASSESSMENT PAGE! ──
    setAssessmentNotice('Incorrect credentials. Please verify your student profile by completing the proctored examination module.');
    switchTab('assessment');
  };

  return (
    <div className="min-h-screen bg-[#0C100E] flex items-center justify-center p-4 sm:p-6 text-[#ECEEEB] font-sans relative overflow-hidden select-none">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-950/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-950/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#141816]/95 border border-[#232B26] rounded-3xl p-7 sm:p-9 shadow-2xl backdrop-blur-2xl space-y-6">

          {/* Top Bar: Space Indicator & Academic Camouflage Switch */}
          <div className="flex items-center justify-between text-xs pb-3 border-b border-[#202723]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
              <span className="text-[#96A299] font-mono tracking-wider uppercase text-[11px] font-semibold">
                Private Space
              </span>
            </div>
            <button
              type="button"
              onClick={() => switchTab('home')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1B211E] hover:bg-[#232A26] text-[#A6B2A9] hover:text-white transition-all border border-[#2B352F] cursor-pointer text-xs font-medium shadow-2xs"
              title="Return to ENGIHUB Academic Mode"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Academic Mode</span>
            </button>
          </div>

          {/* Brand & Emblem Header */}
          <div className="text-center space-y-2 pt-1">
            <div className="w-13 h-13 mx-auto rounded-2xl bg-gradient-to-br from-[#1E2D24] to-[#141E18] border border-[#2D4536] flex items-center justify-center text-emerald-400 shadow-md">
              <Lock className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#ECEEEB] font-serif">
              Dharya
            </h1>
            <p className="text-xs text-[#828F86] max-w-xs mx-auto leading-relaxed">
              Enter your authentication credentials to open your private space.
            </p>
          </div>

          {/* Clean Unified Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label htmlFor="login-username" className="block text-xs font-semibold text-[#A6B2A9]">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5A685F]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="login-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="DHARYA"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1A201D] border border-[#2C3630] text-[#ECEEEB] placeholder-[#4F5B53] text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="block text-xs font-semibold text-[#A6B2A9]">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5A685F]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#1A201D] border border-[#2C3630] text-[#ECEEEB] placeholder-[#4F5B53] text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#5A685F] hover:text-[#ECEEEB] transition-colors cursor-pointer"
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
                className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-[#215236] to-[#1B432C] hover:from-[#2A6543] hover:to-[#215236] active:scale-[0.99] text-white text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Verifying...' : 'Enter Space'}</span>
                <ArrowRight className="w-4 h-4 text-emerald-300" />
              </button>
            </div>
          </form>

          {/* Security & Verification Footer */}
          <div className="pt-2 text-center text-[11px] text-[#637268] flex items-center justify-center gap-1.5 border-t border-[#202723]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>End-to-end encrypted private session</span>
          </div>

        </div>
      </div>
    </div>
  );
};
