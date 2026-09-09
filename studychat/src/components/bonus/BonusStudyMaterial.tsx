import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMaskedFeature } from '../../hooks/useMaskedFeature';
import { Gift, Lock, Unlock, Sparkles, Volume2, Heart, Key, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export const BonusStudyMaterial: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { isMasked, title, description, courseCode } = useMaskedFeature('bonus');

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockKeyInput, setUnlockKeyInput] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleUnlock = () => {
    if (!isAuthenticated) return;
    setIsUnlocked(true);
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#8b5cf6', '#ec4899', '#f43f5e', '#10b981'],
    });
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="bg-[#0d0a17]/90 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 mb-1">
            <Gift className="w-4 h-4" />
            <span>{courseCode}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">{description}</p>
        </div>
      </div>

      {/* Main Surprise Container */}
      <div className="relative bg-[#0d0a17]/90 border border-purple-500/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl overflow-hidden text-center flex flex-col items-center">
        {/* Glow behind box */}
        <div className="absolute inset-0 bg-radial from-purple-500/15 via-transparent to-transparent pointer-events-none" />

        {!isUnlocked ? (
          // Locked Box View
          <div className="max-w-md w-full space-y-5 py-6">
            <div className="w-20 h-20 rounded-3xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 mx-auto shadow-xl shadow-purple-500/20 animate-bounce">
              <Lock className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">
                {isMasked ? 'Encrypted Faculty Assignment Drop' : 'A Special Surprise Waiting For You 🎁'}
              </h3>
              <p className="text-xs text-purple-200/70">
                {isMasked
                  ? 'Bonus derivation packet prepared by department faculty. Authorized access key required to decrypt.'
                  : `${currentUser?.partnerName || 'Your partner'} left a locked surprise letter and audio memo for you!`}
              </p>
            </div>

            {isAuthenticated ? (
              <div className="pt-4 space-y-3">
                <button
                  type="button"
                  onClick={handleUnlock}
                  className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-purple-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  <span>{isMasked ? 'Decrypt Bonus Resource' : 'Open My Surprise Box ✨'}</span>
                </button>
              </div>
            ) : (
              <div className="text-xs text-slate-500 font-mono py-2">
                Department credentials required to unlock
              </div>
            )}
          </div>
        ) : (
          // Unlocked Secret Content Reveal
          <div className="w-full space-y-6 text-left py-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  🎁
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isMasked ? 'Decrypted Supplementary Reference' : 'Letter From My Heart ❤️'}
                  </h3>
                  <span className="text-[10px] text-purple-300 font-mono">CONFIDENTIAL &amp; UNLOCKED</span>
                </div>
              </div>

              <button
                onClick={() => setIsUnlocked(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Relock Box
              </button>
            </div>

            {/* Content Note */}
            <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-slate-200 text-xs sm:text-sm leading-relaxed space-y-3 font-sans">
              <p className="italic text-purple-200">
                {isMasked
                  ? 'Theorem 7.3 Corollary: "For all symmetric positive-definite matrices A, all eigenvalues are strictly positive and real."'
                  : `"My dear ${currentUser?.partnerName || 'love'}, whenever you open this, I just want to remind you of how proud I am of you. Every day with you is my greatest gift. Keep shining brightly, my love!" 🌿❤️`}
              </p>
              {!isMasked && (
                <div className="text-right text-xs text-purple-300 font-bold font-serif">
                  — Always yours, {currentUser?.name}
                </div>
              )}
            </div>

            {/* Audio Voice Note Simulator */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className="w-10 h-10 rounded-xl bg-purple-500 hover:bg-purple-400 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 transition-all"
                >
                  <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                </button>
                <div>
                  <div className="text-xs font-bold text-white">
                    {isMasked ? 'Faculty Audio Lecture Summary.wav' : 'A Whisper For You (Voice Memo) 🎙️'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {isPlayingAudio ? 'Playing sweet message… (0:24)' : 'Duration: 0:48 • 320kbps'}
                  </div>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Verified
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
