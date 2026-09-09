import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Unlock, X, KeyRound, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SecretArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SecretArchiveModal: React.FC<SecretArchiveModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { unlockSecretMode, secretMode, lockSecretMode } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDigitClick = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError('');
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const verifyPin = (candidatePin: string) => {
    const ok = unlockSecretMode(candidatePin);
    if (ok) {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#c026d3', '#ec4899', '#f43f5e', '#a855f7'],
      });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 400);
    } else {
      setError('Incorrect institutional PIN. Security archive remains locked.');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-[#120a22]/95 border border-purple-500/30 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Academic Disguise Header */}
        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 mb-3 shadow-lg shadow-purple-500/20">
          {secretMode ? <Unlock className="w-6 h-6 text-purple-400" /> : <Lock className="w-6 h-6 text-purple-400" />}
        </div>
        <div className="text-center space-y-1 mb-6">
          <h3 className="text-lg font-bold text-white tracking-tight">Department Archive Access</h3>
          <p className="text-xs text-purple-200/70">
            {secretMode ? 'Archive vault is currently unlocked.' : 'Enter 4-digit department security clearance PIN'}
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex items-center gap-3 mb-6">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full border transition-all duration-200 ${
                idx < pin.length
                  ? 'bg-purple-400 border-purple-300 scale-110 shadow-[0_0_8px_#c026d3]'
                  : 'bg-white/10 border-white/20'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="text-xs text-rose-400 bg-rose-500/15 border border-rose-500/30 rounded-xl px-3 py-1.5 mb-4 text-center font-mono">
            {error}
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-[240px] mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitClick(digit)}
              className="h-12 rounded-2xl bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/40 text-lg font-bold text-white transition-all active:scale-95 flex items-center justify-center"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPin('')}
            className="h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-400 transition-all flex items-center justify-center"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigitClick('0')}
            className="h-12 rounded-2xl bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/40 text-lg font-bold text-white transition-all active:scale-95 flex items-center justify-center"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-2xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-xs font-semibold text-rose-300 transition-all flex items-center justify-center"
          >
            ⌫
          </button>
        </div>

        {secretMode && (
          <button
            onClick={() => {
              lockSecretMode();
              setPin('');
            }}
            className="text-xs text-rose-400 hover:underline mt-2 font-mono"
          >
            Relock Department Archive
          </button>
        )}

        <div className="mt-4 pt-3 border-t border-white/10 text-center w-full">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 font-mono">
            <KeyRound className="w-3 h-3 text-purple-400" />
            <span>Cleared for Surya &amp; Sadhana only</span>
          </div>
        </div>
      </div>
    </div>
  );
};
