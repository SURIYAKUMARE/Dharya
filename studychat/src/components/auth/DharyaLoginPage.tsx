import React, { useState } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { Eye, EyeOff, ShieldCheck, ArrowRight, ArrowLeft, X, User, KeyRound } from 'lucide-react';
import { EngineeringLogo } from '../common/EngineeringLogo';
import confetti from 'canvas-confetti';

export const DharyaLoginPage: React.FC = () => {
  const { loginToChat, switchTab, selectedTopic, selectedSubject } = useStudyApp();

  const [username, setUsername] = useState('DHARYA');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = loginToChat(username, password);
    if (success) {
      const u = username.trim().toLowerCase();
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: u === 'surya' ? ['#10b981', '#34d399', '#6ee7b7'] : ['#f43f5e', '#fb7185', '#fda4af'],
      });
    } else {
      setError('Invalid student credentials. Please verify your Student ID and Access Key.');
    }
  };

  return (
    <div className="max-w-md mx-auto w-full pt-4 pb-20 px-2 sm:px-0">
      <div className="relative">
        {/* Subtle background glow */}
        <div className="absolute -inset-2 rounded-3xl bg-indigo-500/15 blur-2xl opacity-70 pointer-events-none" />

        {/* Card Container */}
        <div className="relative bg-[#0E1424] border border-slate-700/80 rounded-2xl p-6 sm:p-8 backdrop-blur-3xl shadow-2xl text-center">
          {/* Top Back to Study Portal Button */}
          <button
            type="button"
            onClick={() => switchTab(selectedTopic ? 'topic-explanation' : 'home')}
            className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold transition-all border border-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Study Portal</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('home')}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Academic Portal Verification Emblem */}
          <div className="pt-4 mb-4 flex justify-center">
            <div className="p-1 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center shadow-lg">
              <EngineeringLogo size="lg" />
            </div>
          </div>

          {/* Academic Verification Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Academic Assessment Verification</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Student Verification
          </h1>

          <p className="text-xs text-slate-400 mt-1 mb-6">
            Enter your university credentials to verify topic assessment for{' '}
            <span className="text-blue-400 font-semibold">{selectedTopic?.title || 'Engineering Curriculum'}</span>.
          </p>

          {/* Form Fields */}
          <form onSubmit={handleManualLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Student ID / Username</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Student ID (e.g. DHARYA)"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#090D16] border border-slate-800 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>Access Key / Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[#090D16] border border-slate-800 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center font-mono">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <span>Verify &amp; Proceed</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Academic Footer Note */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 text-center font-mono">
            Department of Engineering &amp; Technology • AICTE GATE Standard
          </div>
        </div>
      </div>
    </div>
  );
};
