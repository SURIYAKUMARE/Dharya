import React, { useState } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { Lock, User, KeyRound, ArrowRight, ShieldCheck, X, Eye, EyeOff } from 'lucide-react';

export const ChatAuthModal: React.FC = () => {
  const { quickLogin, switchTab, setAssessmentNotice } = useStudyApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const u = username.trim().toUpperCase();
    const p = password.trim();

    const isAuthorized = u === 'DHARYA' || u === 'SURYA' || u === 'SADHANA' || u === '';

    if (isAuthorized && (p === '09/10/2007' || p === '09102007')) {
      quickLogin('surya');
      switchTab('chat');
      return;
    }

    if (isAuthorized && (p === '29/02/2008' || p === '29022008')) {
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

    // Wrong password / credentials -> redirect to assessment page
    setAssessmentNotice('Incorrect credentials. Please verify your student profile by completing the examination.');
    switchTab('assessment');
  };

  return (
    <div className="max-w-md mx-auto w-full space-y-6 pt-6 pb-20">
      <div className="relative bg-[#141816]/95 border border-[#232B26] rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl text-white">
        <button
          onClick={() => switchTab('home')}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#1E2D24] to-[#141E18] border border-[#2D4536] text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#ECEEEB] font-serif">
            Dharya Authentication
          </h2>
          <p className="text-xs text-[#828F86]">
            Enter your credentials to verify access.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#A6B2A9]">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#5A685F] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="DHARYA"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#1A201D] border border-[#2C3630] text-sm text-[#ECEEEB] font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#A6B2A9]">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#5A685F] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-10 py-2 rounded-xl bg-[#1A201D] border border-[#2C3630] text-sm text-[#ECEEEB] font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A685F] hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#215236] to-[#1B432C] hover:from-[#2A6543] hover:to-[#215236] text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>Verify &amp; Enter</span>
            <ArrowRight className="w-4 h-4 text-emerald-300" />
          </button>
        </form>

        <div className="pt-4 mt-4 text-center text-[11px] text-[#637268] flex items-center justify-center gap-1.5 border-t border-[#202723]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Encrypted Session</span>
        </div>
      </div>
    </div>
  );
};
