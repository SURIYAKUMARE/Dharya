import React, { useState, useMemo } from 'react';
import { LeaderboardStudent } from '../../services/dashboardApiService';
import { Trophy, Search, X, Award, Medal, Crown } from 'lucide-react';

interface FullLeaderboardModalProps {
  students: LeaderboardStudent[];
  isOpen: boolean;
  onClose: () => void;
}

export const FullLeaderboardModal: React.FC<FullLeaderboardModalProps> = ({
  students,
  isOpen,
  onClose
}) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'weekly' | 'allTime'>('weekly');

  const filtered = useMemo(() => {
    return students.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
  }, [students, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-[#E2E8F0] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0875E1] to-[#07549A] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Global Student Leaderboard</h3>
              <p className="text-xs text-blue-100">Top performers across problem solving &amp; MCQs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student by name..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-[#CBD5E1] text-xs text-[#172B4D] focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="inline-flex p-1 bg-white rounded-xl border border-[#CBD5E1]">
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                activeTab === 'weekly' ? 'bg-[#0875E1] text-white' : 'text-slate-600'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setActiveTab('allTime')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                activeTab === 'allTime' ? 'bg-[#0875E1] text-white' : 'text-slate-600'
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        {/* List of Students */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {filtered.map((student) => {
            const isTop1 = student.rank === 1;
            const isTop2 = student.rank === 2;
            const isTop3 = student.rank === 3;
            const isSelf = student.name.includes('(You)');

            return (
              <div
                key={student.rank}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                  isSelf
                    ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-200'
                    : 'bg-white border-[#E2E8F0] hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 text-center font-black font-mono text-sm">
                    {isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : `#${student.rank}`}
                  </div>
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#172B4D] flex items-center gap-1.5">
                      <span>{student.name}</span>
                      {isSelf && (
                        <span className="text-[9px] bg-blue-600 text-white font-mono px-1.5 py-0.2 rounded">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#64748B]">
                      {student.batch} • {student.solved} Solved
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-extrabold text-[#172B4D] font-mono">
                    {student.points.toLocaleString()} pts
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold">
                    {student.accuracy}% Accuracy
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] text-center text-xs text-slate-500">
          Rankings update every Sunday at 23:59 IST based on verified code submissions.
        </div>
      </div>
    </div>
  );
};
