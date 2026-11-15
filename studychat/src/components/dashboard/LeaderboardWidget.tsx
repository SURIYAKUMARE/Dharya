import React from 'react';
import { LeaderboardStudent } from '../../services/dashboardApiService';
import { Trophy, Award, ChevronRight, Crown } from 'lucide-react';

interface LeaderboardWidgetProps {
  students: LeaderboardStudent[];
  onViewAllClick?: () => void;
}

export const LeaderboardWidget: React.FC<LeaderboardWidgetProps> = ({
  students,
  onViewAllClick
}) => {
  const topThree = students.slice(0, 3);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#172B4D]">
              Student Leaderboard
            </h3>
            <p className="text-[11px] text-[#64748B]">Top performers this week</p>
          </div>
        </div>

        <button
          onClick={onViewAllClick}
          className="text-xs font-semibold text-[#0875E1] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Podium Layout */}
      <div className="grid grid-cols-3 gap-2 items-end pt-4 pb-2">
        {/* Rank 2 (Silver) */}
        {topThree[1] && (
          <div className="flex flex-col items-center text-center space-y-1.5">
            <div className="relative">
              <img
                src={topThree[1].avatar}
                alt={topThree[1].name}
                className="w-12 h-12 rounded-full border-2 border-slate-300 object-cover shadow-sm"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-200 border border-slate-400 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                2
              </span>
            </div>
            <div className="w-full">
              <div className="text-xs font-bold text-[#172B4D] truncate">{topThree[1].name}</div>
              <div className="text-[10px] font-mono text-slate-500 font-semibold">{topThree[1].points} pts</div>
            </div>
            <div className="w-full h-16 rounded-t-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-500">🥈 Silver</span>
            </div>
          </div>
        )}

        {/* Rank 1 (Gold - Elevated in Center) */}
        {topThree[0] && (
          <div className="flex flex-col items-center text-center space-y-1.5 -mt-3">
            <div className="relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-amber-500">
                <Crown className="w-4 h-4 fill-amber-400" />
              </div>
              <img
                src={topThree[0].avatar}
                alt={topThree[0].name}
                className="w-14 h-14 rounded-full border-2 border-amber-400 object-cover shadow-md ring-2 ring-amber-300"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 border border-amber-500 text-amber-950 text-[10px] font-black flex items-center justify-center shadow-xs">
                1
              </span>
            </div>
            <div className="w-full">
              <div className="text-xs font-bold text-[#172B4D] truncate">{topThree[0].name}</div>
              <div className="text-[10px] font-mono text-amber-600 font-extrabold">{topThree[0].points} pts</div>
            </div>
            <div className="w-full h-22 rounded-t-xl bg-gradient-to-t from-amber-100 to-amber-50 border border-amber-300 flex items-center justify-center shadow-2xs">
              <span className="text-xs font-bold text-amber-800">🥇 Gold</span>
            </div>
          </div>
        )}

        {/* Rank 3 (Bronze) */}
        {topThree[2] && (
          <div className="flex flex-col items-center text-center space-y-1.5">
            <div className="relative">
              <img
                src={topThree[2].avatar}
                alt={topThree[2].name}
                className="w-12 h-12 rounded-full border-2 border-amber-700/40 object-cover shadow-sm"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-100 border border-amber-800/40 text-amber-900 text-[10px] font-bold flex items-center justify-center">
                3
              </span>
            </div>
            <div className="w-full">
              <div className="text-xs font-bold text-[#172B4D] truncate">{topThree[2].name}</div>
              <div className="text-[10px] font-mono text-slate-500 font-semibold">{topThree[2].points} pts</div>
            </div>
            <div className="w-full h-12 rounded-t-xl bg-amber-50/60 border border-amber-200 flex items-center justify-center">
              <span className="text-xs font-bold text-amber-700">🥉 Bronze</span>
            </div>
          </div>
        )}
      </div>

      {/* Button to View Full Leaderboard */}
      <button
        onClick={onViewAllClick}
        className="w-full py-2.5 rounded-xl bg-[#F4F9FC] hover:bg-blue-50 text-[#0875E1] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#E2E8F0]"
      >
        <span>View Full Leaderboard</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
