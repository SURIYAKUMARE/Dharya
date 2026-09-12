import React, { useState } from 'react';
import { useAuth, UserKey } from '../../context/AuthContext';
import { ShieldCheck, Lock, User, ArrowRight, Sparkles, KeyRound } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LoginCardProps {
  onSuccess: () => void;
  onOpenSecretModal: () => void;
}

export const LoginCard: React.FC<LoginCardProps> = ({ onSuccess, onOpenSecretModal }) => {
  const { login, directLogin, detectUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Live detection
  const detectedUserKey = detectUser(username, password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = login(username, password);
    if (success) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: detectedUserKey === 'surya' ? ['#10b981', '#34d399', '#a7f3d0'] : ['#f43f5e', '#fb7185', '#fda4af'],
      });
      onSuccess();
    } else {
      setError('Invalid academic credentials. Please verify your Student ID and Access Key.');
    }
  };

  const handleQuickLogin = (key: UserKey) => {
    directLogin(key);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: key === 'surya' ? ['#10b981', '#34d399', '#a7f3d0'] : ['#f43f5e', '#fb7185', '#fda4af'],
    });
    onSuccess();
  };

  return (
    <div className="w-full max-w-md mx-auto relative">
      {/* Background glow behind card */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-purple-500/20 blur-xl opacity-70 pointer-events-none" />

      <div className="relative bg-[#0d0a17]/90 border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        {/* Academic Card Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Academic Portal Verification</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Institutional Login</h2>
          <p className="text-xs text-slate-400">
            Enter your university credentials to access engineering research repositories.
          </p>
        </div>

        {/* 2-User Direct Switcher (Surya & Sadhana Only) */}
        <div className="mb-6">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Verified Student Profiles</span>
            <span className="text-[10px] text-emerald-400 font-mono">2 Registered Users</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('surya')}
              className="px-3 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold text-xs transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
              <span>🌿 Surya</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('sadhana')}
              className="px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold text-xs transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_#f43f5e]" />
              <span>❤️ Sadhana</span>
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Student Username / ID</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. surya or sadhana"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Portal Password / Access Key</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter access key"
                autoComplete="new-password"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Live Name Detection Indicator */}
          {detectedUserKey && (
            <div
              className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                detectedUserKey === 'surya'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 animate-bounce" />
              <span>
                {detectedUserKey === 'surya' ? 'Surya detected ✓' : 'Sadhana detected ✓'}
              </span>
            </div>
          )}

          {error && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>Verify &amp; Enter Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Secondary Secret Room PIN Access */}
        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={onOpenSecretModal}
            className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-2"
          >
            <KeyRound className="w-3.5 h-3.5 text-purple-400" />
            <span>Secret Room Access (Private PIN)</span>
          </button>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">
            Department security vault • Restricted 4-digit key required
          </p>
        </div>
      </div>
    </div>
  );
};
