import React, { useState, useEffect } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { Eye, EyeOff, Lock, Sparkles, KeyRound, ArrowRight, ArrowLeft, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export const DharyaLoginPage: React.FC = () => {
  const { loginToChat, quickLogin, switchTab, selectedTopic } = useStudyApp();

  const [selectedUser, setSelectedUser] = useState<'surya' | 'sadhana'>('surya');
  const [username, setUsername] = useState('surya');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [secretPin, setSecretPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Live detection logic
  const getDetectedName = (): 'surya' | 'sadhana' | 'dharya' | null => {
    const u = username.trim().toLowerCase();
    if (u === 'surya') return 'surya';
    if (u === 'sadhana') return 'sadhana';
    if (u === 'dharya') return 'dharya';
    return null;
  };

  const detected = getDetectedName();

  const handleSelectUser = (user: 'surya' | 'sadhana') => {
    setSelectedUser(user);
    setUsername(user);
    setPassword(user === 'surya' ? '09/10/2007' : '29/02/2008');
    setError('');
  };

  useEffect(() => {
    // Pre-populate with Surya default password
    setPassword('09/10/2007');
  }, []);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = loginToChat(username, password);
    if (success) {
      fireConfetti(detected === 'sadhana' ? 'sadhana' : 'surya');
    } else {
      setError('Invalid student credentials. Only verified Surya & Sadhana accounts are authorized.');
    }
  };

  const handleQuickLogin = (user: 'surya' | 'sadhana') => {
    const success = quickLogin(user);
    if (success) {
      fireConfetti(user);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    const pin = secretPin.trim();
    if (pin === '0910' || pin === '1430' || pin === '09/10') {
      quickLogin('surya');
      fireConfetti('surya');
    } else if (pin === '2902' || pin === '29/02') {
      quickLogin('sadhana');
      fireConfetti('sadhana');
    } else {
      setPinError('Incorrect 4-digit PIN. Restricted access.');
    }
  };

  const fireConfetti = (user: 'surya' | 'sadhana') => {
    confetti({
      particleCount: 80,
      spread: 75,
      origin: { y: 0.6 },
      colors: user === 'surya' ? ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'] : ['#f43f5e', '#fb7185', '#fda4af', '#f472b6'],
    });
  };

  const displayTitleName = detected === 'sadhana' ? 'Sadhana' : detected === 'surya' ? 'Surya' : 'Dharya';

  return (
    <div className="max-w-md mx-auto w-full pt-4 pb-20 px-2 sm:px-0">
      {/* Background radial glow */}
      <div className="relative">
        <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-violet-600/30 via-fuchsia-600/20 to-pink-600/30 blur-2xl opacity-80 pointer-events-none" />

        {/* Card Container */}
        <div className="relative bg-[#0d071a]/95 border border-purple-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-center">
          {/* Top Back to Study Portal Button */}
          <button
            type="button"
            onClick={() => switchTab(selectedTopic ? 'topic-explanation' : 'home')}
            className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Study Portal</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('home')}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Glowing Animated Monogram Emblem */}
          <div className="pt-4 mb-4 flex justify-center">
            <div className="relative w-20 h-20 flex items-center justify-center">
              {/* Outer pulsing rings */}
              <div className="absolute inset-0 rounded-full border border-purple-500/30 animate-ping opacity-25" />
              <div className="absolute -inset-1 rounded-full border border-violet-500/40 opacity-60" />
              
              {/* Radial Center Disc */}
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-violet-700 via-purple-600 to-pink-500 flex items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.6)]">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <text x="7" y="30" fontSize="26" fontFamily="Georgia,serif" fontWeight="900" fill="white" opacity="0.95">
                    D
                  </text>
                  <circle cx="31" cy="9" r="2.2" fill="rgba(255,255,255,0.9)" />
                  <circle cx="31" cy="9" r="4" fill="rgba(255,255,255,0.18)" />
                  <line x1="31" y1="4.5" x2="31" y2="13.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeLinecap="round" />
                  <line x1="26.5" y1="9" x2="35.5" y2="9" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeLinecap="round" />
                </svg>
              </div>

              {/* Orbital Light Dots */}
              <div className="absolute w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_8px_#f472b6] top-0 left-2 animate-pulse" />
              <div className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] bottom-1 right-2 animate-pulse" />
            </div>
          </div>

          {/* Badge: Back Again */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-200 text-[11px] font-bold uppercase tracking-wider mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Back Again</span>
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back,
            <span className="block bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent font-serif italic text-3xl sm:text-4xl mt-0.5">
              {displayTitleName}
            </span>
          </h1>

          <p className="text-xs text-purple-200/70 mt-1 mb-5">
            Your special world is waiting ✨
          </p>

          {/* 2-User Switcher Bar (Surya & Sadhana Only) */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            <button
              type="button"
              onClick={() => handleSelectUser('surya')}
              className={`px-3 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 border ${
                selectedUser === 'surya'
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${selectedUser === 'surya' ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-emerald-600'}`} />
              <span>🌿 Surya</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectUser('sadhana')}
              className={`px-3 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 border ${
                selectedUser === 'sadhana'
                  ? 'bg-rose-500/20 border-rose-400/50 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${selectedUser === 'sadhana' ? 'bg-rose-400 shadow-[0_0_8px_#f43f5e]' : 'bg-rose-600'}`} />
              <span>❤️ Sadhana</span>
            </button>
          </div>

          {/* ⚡ 1-Click Instant Access Box */}
          <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/50 to-indigo-950/40 border border-purple-500/30 flex items-center justify-between gap-3 text-left">
            <div>
              <div className="text-[11px] font-extrabold text-purple-300 flex items-center gap-1.5 uppercase tracking-wide">
                <span>⚡</span> <span>INSTANT CHAT ACCESS</span>
              </div>
              <div className="text-[11px] text-purple-200/70">
                {selectedUser === 'surya' ? 'Surya account ready' : 'Sadhana account ready'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleQuickLogin(selectedUser)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              <span>Enter Chat</span>
              <span>✦</span>
            </button>
          </div>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-purple-500/20" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono">
              <span className="bg-[#0d071a] px-3 text-purple-300/60">Or Sign In With Key</span>
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleManualLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-purple-200/80 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username (surya or sadhana)"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-white text-sm placeholder-purple-300/30 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-200/80 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-white text-sm placeholder-purple-300/30 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all font-mono pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-purple-300/60 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Live Name Detection Indicator */}
            {detected && (
              <div
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  detected === 'surya'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : detected === 'sadhana'
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                    : 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full animate-ping ${
                      detected === 'surya' ? 'bg-emerald-400' : detected === 'sadhana' ? 'bg-rose-400' : 'bg-purple-400'
                    }`}
                  />
                  <span>
                    {detected === 'surya'
                      ? 'Surya detected ✓'
                      : detected === 'sadhana'
                      ? 'Sadhana detected ✓'
                      : 'Dharya detected ✓'}
                  </span>
                </div>
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
              </div>
            )}

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center font-mono">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-purple-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <span>Login to Chat</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Secret Room PIN Button */}
          <div className="mt-5 pt-4 border-t border-purple-500/20 text-center">
            <button
              type="button"
              onClick={() => setShowSecretModal(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-purple-950/20 hover:bg-purple-900/30 border border-purple-500/20 hover:border-purple-400/40 text-purple-200/80 hover:text-purple-100 text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              <KeyRound className="w-3.5 h-3.5 text-purple-400" />
              <span>Secret Room Access (Private PIN)</span>
            </button>
          </div>

          {/* Footer Note */}
          <div className="mt-4 pt-3 text-[11px] text-purple-300/50 flex flex-col items-center gap-1.5 font-serif italic">
            <span>Only someone special knows the way in</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500/30" />
              <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_6px_#c084fc]" />
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500/30" />
            </div>
          </div>
        </div>
      </div>

      {/* Secret PIN Modal */}
      {showSecretModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-[#0d071a] border border-purple-500/40 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <button
              type="button"
              onClick={() => setShowSecretModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300 mx-auto flex items-center justify-center">
              <Lock className="w-6 h-6 text-purple-400" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Private Security PIN</h3>
              <p className="text-xs text-purple-200/70 mt-1">
                Enter your 4-digit anniversary or birthday PIN to enter the private room directly.
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <input
                type="password"
                maxLength={8}
                value={secretPin}
                onChange={(e) => setSecretPin(e.target.value)}
                placeholder="••••"
                autoFocus
                className="w-full text-center tracking-[0.6em] text-2xl font-mono py-3 rounded-xl bg-purple-950/40 border border-purple-500/40 text-white focus:outline-none focus:border-purple-400"
              />

              {pinError && (
                <div className="text-xs text-rose-400 font-mono">
                  {pinError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowSecretModal(false)}
                  className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg"
                >
                  Unlock ✦
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
