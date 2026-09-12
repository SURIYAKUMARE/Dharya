import React, { useState } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { Lock, User, KeyRound, ArrowRight, ShieldCheck, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ChatAuthModal: React.FC = () => {
  const { loginToChat, switchTab, assessmentRecord } = useStudyApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // loginToChat routes to face-verification on valid credentials,
    // and routes to assessment on incorrect password
    loginToChat(username, password);
  };

  return (
    <div className="max-w-md mx-auto w-full space-y-6 pt-6 pb-20">
      <div className="relative bg-[#0d0a18]/95 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        {/* Close / Back to Home */}
        <button
          onClick={() => switchTab('home')}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Emblem & Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Lock className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase">
            <ShieldCheck className="w-3 h-3" />
            <span>Assessment Verified ✓</span>
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Chat Authentication
          </h2>

          <p className="text-xs text-slate-300">
            Enter your student credentials to access the AI Study Assistant for{' '}
            <span className="text-indigo-400 font-semibold">{assessmentRecord?.topicTitle || 'Engineering'}</span>.
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Student Username / ID</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. sec2511xx"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/60 transition-all font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              <span>Password</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="new-password"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/60 transition-all font-sans"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center font-mono">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>Log In &amp; Open Chat</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/10 text-center text-[11px] text-slate-500 font-mono">
          Strict Student Authentication Gate • Assessment Record Verified
        </div>
      </div>
    </div>
  );
};
