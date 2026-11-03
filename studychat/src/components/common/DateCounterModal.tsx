import React, { useState, useEffect } from 'react';
import { Heart, Clock, Calendar, X, Share2, Copy, Check } from 'lucide-react';

export interface DateCounterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShareToChat?: (text: string) => void;
  partnerName?: string;
  isDark?: boolean;
}

export const DEFAULT_MILESTONE_DATE_STR = '2026-05-20T07:30:00';

export function getStoredMilestoneDate(): string {
  try {
    const saved = localStorage.getItem('dharya_milestone_date');
    if (saved) return saved;
  } catch {}
  return DEFAULT_MILESTONE_DATE_STR;
}

export function saveStoredMilestoneDate(dateStr: string): void {
  try {
    localStorage.setItem('dharya_milestone_date', dateStr);
  } catch {}
}

export function useDateCount(customDateStr?: string) {
  const [dateStr, setDateStr] = useState<string>(() => customDateStr || getStoredMilestoneDate());
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const targetTime = new Date(dateStr).getTime();
  const diffMs = Math.abs(now - targetTime);

  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  const displayHours = totalHours % 24;
  const displayMinutes = totalMinutes % 60;
  const displaySeconds = totalSeconds % 60;

  return {
    days: totalDays,
    hours: displayHours,
    minutes: displayMinutes,
    seconds: displaySeconds,
    totalDays,
    totalHours,
    totalMinutes,
    totalSeconds,
    dateStr,
    setDateStr,
  };
}

export const DateCounterModal: React.FC<DateCounterModalProps> = ({
  isOpen,
  onClose,
  onShareToChat,
  partnerName = 'Sadhana',
  isDark = true,
}) => {
  const [milestoneDateStr, setMilestoneDateStr] = useState<string>(() => getStoredMilestoneDate());
  const [isPm, setIsPm] = useState<boolean>(() => milestoneDateStr.includes('19:30'));
  const [copied, setCopied] = useState<boolean>(false);
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const targetTime = new Date(milestoneDateStr).getTime();
  const diffMs = Math.abs(now - targetTime);

  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  const displayHours = totalHours % 24;
  const displayMinutes = totalMinutes % 60;
  const displaySeconds = totalSeconds % 60;

  const months = Math.floor(totalDays / 30.4375);
  const remainingDays = Math.floor(totalDays % 30.4375);
  const weeks = Math.floor(totalDays / 7);

  const formattedDate = '20 May 2026';
  const formattedTime = isPm ? '07:30 PM (19:30)' : '07:30 AM';

  const handleToggleAmPm = () => {
    const nextIsPm = !isPm;
    setIsPm(nextIsPm);
    const newStr = nextIsPm ? '2026-05-20T19:30:00' : '2026-05-20T07:30:00';
    setMilestoneDateStr(newStr);
    saveStoredMilestoneDate(newStr);
  };

  const getShareText = () => {
    return `Special Milestone • 20 May 2026, 7:30\nTime Together: ${totalDays} days, ${displayHours}h ${displayMinutes}m ${displaySeconds}s\n(${totalDays} days of memories together)`;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(getShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToChat = () => {
    if (onShareToChat) {
      onShareToChat(getShareText());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="counter-modal-title"
        className={`w-full max-w-md rounded-2xl p-6 shadow-xl space-y-5 border transition-colors relative ${
          isDark
            ? 'bg-[#1A1D1C] border-[#2A302D] text-[#ECEEEB]'
            : 'bg-[#FFFFFF] border-[#E5E0D8] text-[#1F2421]'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-[#7E9F89]' : 'bg-[#4E6B58]'}`} />
              <span className={`text-[11px] font-mono tracking-wider uppercase ${isDark ? 'text-[#A3ADA5]' : 'text-[#5A655E]'}`}>
                Milestone Counter
              </span>
            </div>
            <h3 id="counter-modal-title" className="text-xl font-bold tracking-tight">
              Days Together
            </h3>
            <p className={`text-xs ${isDark ? 'text-[#8B968E]' : 'text-[#707A72]'}`}>
              Surya &amp; {partnerName} • Started 20 May 2026 at 7:30
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className={`p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
              isDark ? 'text-[#8B968E] hover:text-[#ECEEEB]' : 'text-[#707A72] hover:text-[#1F2421]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Counter Display Grid */}
        <div className="grid grid-cols-4 gap-2.5 py-1">
          {[
            { label: 'DAYS', val: totalDays, isPrimary: true },
            { label: 'HOURS', val: String(displayHours).padStart(2, '0') },
            { label: 'MINUTES', val: String(displayMinutes).padStart(2, '0') },
            { label: 'SECONDS', val: String(displaySeconds).padStart(2, '0') },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-center ${
                item.isPrimary
                  ? isDark
                    ? 'bg-[#222E26] border-[#34473B]'
                    : 'bg-[#EBF2ED] border-[#CFDFD3]'
                  : isDark
                  ? 'bg-[#212523] border-[#2A302D]'
                  : 'bg-[#F9F8F6] border-[#E8E4DD]'
              }`}
            >
              <div
                className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${
                  item.isPrimary
                    ? isDark ? 'text-[#A5C2AF]' : 'text-[#365340]'
                    : isDark ? 'text-[#ECEEEB]' : 'text-[#1F2421]'
                }`}
              >
                {item.val}
              </div>
              <div
                className={`text-[10px] font-mono tracking-wider mt-1 ${
                  item.isPrimary
                    ? isDark ? 'text-[#7E9F89]' : 'text-[#4E6B58]'
                    : isDark ? 'text-[#8B968E]' : 'text-[#707A72]'
                }`}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Details Card */}
        <div
          className={`p-4 rounded-xl border space-y-2.5 text-xs ${
            isDark ? 'bg-[#202422] border-[#2A302D]' : 'bg-[#F9F8F6] border-[#E8E4DD]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#7E9F89]" />
              <span className="font-medium">Origin date</span>
            </div>
            <span className="font-mono font-semibold">{formattedDate}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#2A302D] dark:border-[#2A302D] border-dashed">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#7E9F89]" />
              <span className="font-medium">Origin time</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold">{formattedTime}</span>
              <button
                type="button"
                onClick={handleToggleAmPm}
                className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                  isDark
                    ? 'bg-[#282F2B] hover:bg-[#313934] border-[#38433D] text-[#A5C2AF]'
                    : 'bg-[#EAE6DF] hover:bg-[#DDD8CF] border-[#D5CFC5] text-[#365340]'
                }`}
              >
                {isPm ? 'Use AM' : 'Use PM'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#2A302D] dark:border-[#2A302D] border-dashed">
            <span className="font-medium">Calendar breakdown</span>
            <span className="font-mono text-[#8B968E]">
              {months}m {remainingDays}d ({weeks}w)
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleCopyText}
            className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              isDark
                ? 'bg-[#222724] border-[#2E3531] hover:bg-[#282F2B] text-[#ECEEEB]'
                : 'bg-[#F0EDE8] border-[#E0DCD4] hover:bg-[#E8E4DD] text-[#1F2421]'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#7E9F89]" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          {onShareToChat && (
            <button
              type="button"
              onClick={handleSendToChat}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                isDark
                  ? 'bg-[#4E6B58] hover:bg-[#3D5646] text-[#FFFFFF]'
                  : 'bg-[#4E6B58] hover:bg-[#3D5646] text-[#FFFFFF]'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>Share in Chat</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
