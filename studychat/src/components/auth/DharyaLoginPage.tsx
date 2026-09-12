import React, { useState } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { Eye, EyeOff, ShieldCheck, ArrowRight, ArrowLeft, X, User, KeyRound } from 'lucide-react';
import { EngineeringLogo } from '../common/EngineeringLogo';
import confetti from 'canvas-confetti';

export const DharyaLoginPage: React.FC = () => {
  const { loginToChat, switchTab, selectedTopic, selectedSubject } = useStudyApp();

  const [username, setUsername] = useState('');
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
      switchTab('chat');
    }
  };

  return (
    <div className="max-w-md mx-auto w-full pt-4 pb-20 px-2 sm:px-0">
      <div className="relative">
        {/* Subtle background glow */}
        <div className="absolute -inset-2 rounded-3xl bg-indigo-500/15 blur-2xl opacity-70 pointer-events-none" />

        {/* Card Container */}
        <div className="relative bg-white border border-[#E5DFD5] rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
          {/* Top Back to Study Portal Button */}
          <button
            type="button"
            onClick={() => switchTab(selectedTopic ? 'topic-explanation' : 'home')}
            className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#EDE8E1] text-[#475569] hover:text-[#1E293B] text-xs font-semibold transition-all border border-[#DDD5C7]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Study Portal</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('home')}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-[#FAF8F5]"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Academic Portal Verification Emblem */}
          <div className="pt-4 mb-4 flex justify-center">
            <div className="p-1 rounded-2xl bg-[#EBF3FB] border border-[#BFDBFE] flex items-center justify-center shadow-sm">
              <EngineeringLogo size="lg" />
            </div>
          </div>

          {/* Academic Verification Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#EBF3FB] border border-[#BFDBFE] text-[#1D4ED8] text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span>Academic Assessment Verification</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight font-serif">
            Student Verification
          </h1>

          <p className="text-xs text-[#64748B] mt-1 mb-6">
            Enter your university credentials to verify topic assessment for{' '}
            <span className="text-[#1273C4] font-semibold">{selectedTopic?.title || 'Engineering Curriculum'}</span>.
          </p>

          {/* Form Fields */}
          <form onSubmit={handleManualLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Student ID / Username</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Student ID (e.g. sec2511xx)"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-[#1E293B] text-sm placeholder-[#94A3B8] focus:outline-none focus:border-[#1273C4] focus:ring-2 focus:ring-[#1273C4]/20 transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Access Key / Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter access key"
                  autoComplete="new-password"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-[#1E293B] text-sm placeholder-[#94A3B8] focus:outline-none focus:border-[#1273C4] focus:ring-2 focus:ring-[#1273C4]/20 transition-all font-sans pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#64748B] hover:text-[#1E293B] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-[#BE123C] text-xs text-center font-mono">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-[#1273C4] hover:bg-[#0D62A5] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Verify &amp; Proceed</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Academic Footer Note */}
          <div className="mt-6 pt-4 border-t border-[#E5DFD5] text-[11px] text-[#94A3B8] text-center font-mono">
            Department of Engineering &amp; Technology • AICTE GATE Standard
          </div>
        </div>
      </div>
    </div>
  );
};
