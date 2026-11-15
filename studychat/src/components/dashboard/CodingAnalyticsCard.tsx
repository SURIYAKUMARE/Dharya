import React, { useState } from 'react';
import { CodingAnalyticsData } from '../../services/dashboardApiService';
import { Code2, ChevronRight, CheckCircle2, Filter } from 'lucide-react';

interface CodingAnalyticsCardProps {
  data: CodingAnalyticsData;
  onFilterClick?: (difficulty: 'Easy' | 'Medium' | 'Hard' | 'All') => void;
}

export const CodingAnalyticsCard: React.FC<CodingAnalyticsCardProps> = ({
  data,
  onFilterClick
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');

  // Doughnut Math calculations:
  // Radii: 60, circumference: 2 * PI * 60 = ~376.99
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  const totalSolved = data.totalSolved; // 380
  const easyPct = (data.easy.solved / totalSolved) * 100; // 55.0%
  const medPct = (data.medium.solved / totalSolved) * 100; // 27.37%
  const hardPct = (data.hard.solved / totalSolved) * 100; // 17.63%

  const easyStroke = (easyPct / 100) * circumference;
  const medStroke = (medPct / 100) * circumference;
  const hardStroke = (hardPct / 100) * circumference;

  const handleSelect = (diff: 'All' | 'Easy' | 'Medium' | 'Hard') => {
    setSelectedDifficulty(diff);
    if (onFilterClick) onFilterClick(diff);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0875E1] flex items-center justify-center">
            <Code2 className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[#172B4D]">
            Coding Problems Solved
          </h3>
        </div>
        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
          Total: {data.totalSolved}
        </span>
      </div>

      {/* Main Doughnut & Breakdown Row */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
        {/* Doughnut Chart */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
            {/* Background ring */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#F1F5F9"
              strokeWidth="14"
            />
            {/* Easy segment (Green) */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#39BF82"
              strokeWidth="14"
              strokeDasharray={`${easyStroke} ${circumference}`}
              strokeDashoffset="0"
              className="transition-all duration-700"
            />
            {/* Medium segment (Orange) */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#FF9F1C"
              strokeWidth="14"
              strokeDasharray={`${medStroke} ${circumference}`}
              strokeDashoffset={-easyStroke}
              className="transition-all duration-700"
            />
            {/* Hard segment (Red) */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#E11D48"
              strokeWidth="14"
              strokeDasharray={`${hardStroke} ${circumference}`}
              strokeDashoffset={-(easyStroke + medStroke)}
              className="transition-all duration-700"
            />
          </svg>

          {/* Centered Total Count */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-2xl font-black text-[#172B4D] font-mono leading-none">
              {data.totalSolved}
            </span>
            <span className="text-[10px] text-[#64748B] font-semibold uppercase mt-0.5">
              Solved
            </span>
          </div>
        </div>

        {/* Breakdown Progress Bars */}
        <div className="w-full flex-1 space-y-3">
          {/* Easy: 209 / 3287 */}
          <div
            onClick={() => handleSelect('Easy')}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              selectedDifficulty === 'Easy'
                ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-200'
                : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className="text-[#39BF82] flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-[#39BF82]" />
                Easy
              </span>
              <span className="font-mono text-[#172B4D]">
                {data.easy.solved} <span className="text-slate-400 font-normal">/ {data.easy.total}</span>
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#39BF82] h-full rounded-full"
                style={{ width: `${(data.easy.solved / data.easy.total) * 100}%` }}
              />
            </div>
          </div>

          {/* Medium: 104 / 2333 */}
          <div
            onClick={() => handleSelect('Medium')}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              selectedDifficulty === 'Medium'
                ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-200'
                : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className="text-[#FF9F1C] flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-[#FF9F1C]" />
                Medium
              </span>
              <span className="font-mono text-[#172B4D]">
                {data.medium.solved} <span className="text-slate-400 font-normal">/ {data.medium.total}</span>
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#FF9F1C] h-full rounded-full"
                style={{ width: `${(data.medium.solved / data.medium.total) * 100}%` }}
              />
            </div>
          </div>

          {/* Hard: 67 / 1564 */}
          <div
            onClick={() => handleSelect('Hard')}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              selectedDifficulty === 'Hard'
                ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-200'
                : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-rose-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className="text-[#E11D48] flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-[#E11D48]" />
                Hard
              </span>
              <span className="font-mono text-[#172B4D]">
                {data.hard.solved} <span className="text-slate-400 font-normal">/ {data.hard.total}</span>
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#E11D48] h-full rounded-full"
                style={{ width: `${(data.hard.solved / data.hard.total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
