import React from 'react';
import { ProblemOfTheDay } from '../../services/dashboardApiService';
import { Sparkles, Code2, ArrowRight, CheckCircle2, Zap } from 'lucide-react';

interface ProblemOfTheDayCardProps {
  problem: ProblemOfTheDay;
  onSolveClick: () => void;
}

export const ProblemOfTheDayCard: React.FC<ProblemOfTheDayCardProps> = ({
  problem,
  onSolveClick
}) => {
  return (
    <div className="bg-gradient-to-br from-white via-white to-blue-50/40 rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#635BFF] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-full">
              Daily Challenge
            </span>
            <h3 className="text-sm sm:text-base font-bold text-[#172B4D] mt-0.5">
              Problem of the Day
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-mono font-bold">
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>+{problem.points} pts</span>
        </div>
      </div>

      {/* Problem Content Preview */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
              problem.difficulty === 'Easy'
                ? 'bg-emerald-100 text-emerald-800'
                : problem.difficulty === 'Medium'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {problem.difficulty}
          </span>
          <span className="text-xs text-[#64748B] font-mono">Acceptance: {problem.acceptanceRate}</span>
        </div>

        <h4 className="text-base font-bold text-[#172B4D] leading-snug">
          {problem.title}
        </h4>

        <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3">
          {problem.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {problem.tags.map((tag, i) => (
            <span
              key={i}
              className="text-[10px] font-medium bg-[#F1F5F9] text-[#475569] px-2 py-0.5 rounded-md"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Solve Now CTA Button */}
      <button
        onClick={onSolveClick}
        className="w-full py-3 rounded-2xl bg-[#0875E1] hover:bg-[#07549A] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-98"
      >
        <Code2 className="w-4 h-4" />
        <span>Solve Problem Now</span>
        <ArrowRight className="w-4 h-4 ml-1" />
      </button>
    </div>
  );
};
