import React from 'react';
import { McqAnalyticsData } from '../../services/dashboardApiService';
import { HelpCircle, CheckCircle2, XCircle, Award } from 'lucide-react';

interface McqAnalyticsCardProps {
  data: McqAnalyticsData;
}

export const McqAnalyticsCard: React.FC<McqAnalyticsCardProps> = ({ data }) => {
  // Doughnut Math calculations:
  // Accuracy: 78.18% (Green/Purple)
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const correctStroke = (data.correctAnswers / data.solvedQuestions) * circumference;
  const incorrectStroke = circumference - correctStroke;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#635BFF] flex items-center justify-center">
            <HelpCircle className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[#172B4D]">
            MCQ Performance Analytics
          </h3>
        </div>
        <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
          Accuracy: {data.accuracyPercentage}%
        </span>
      </div>

      {/* Main Stats & Doughnut Row */}
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
            {/* Correct Answers (Emerald #39BF82) */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#39BF82"
              strokeWidth="14"
              strokeDasharray={`${correctStroke} ${circumference}`}
              strokeDashoffset="0"
              className="transition-all duration-700"
            />
            {/* Incorrect Answers (Purple #635BFF) */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#635BFF"
              strokeWidth="14"
              strokeDasharray={`${incorrectStroke} ${circumference}`}
              strokeDashoffset={-correctStroke}
              className="transition-all duration-700"
            />
          </svg>

          {/* Centered Accuracy Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-xl font-black text-[#172B4D] font-mono leading-none">
              {data.accuracyPercentage}%
            </span>
            <span className="text-[10px] text-[#64748B] font-semibold uppercase mt-0.5">
              Accuracy
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="w-full flex-1 grid grid-cols-2 gap-2.5">
          {/* Card 1: Total Bank */}
          <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="text-[10px] font-semibold text-[#64748B] uppercase">Total MCQs</div>
            <div className="text-base font-extrabold text-[#172B4D] font-mono mt-0.5">
              {data.totalMcqInBank.toLocaleString()}
            </div>
            <div className="text-[10px] text-[#94A3B8]">In Question Bank</div>
          </div>

          {/* Card 2: Solved */}
          <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="text-[10px] font-semibold text-[#64748B] uppercase">Solved</div>
            <div className="text-base font-extrabold text-[#0875E1] font-mono mt-0.5">
              {data.solvedQuestions}
            </div>
            <div className="text-[10px] text-[#94A3B8]">Questions Attempted</div>
          </div>

          {/* Card 3: Correct */}
          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <div className="text-[10px] font-semibold text-emerald-800 uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Correct
            </div>
            <div className="text-base font-extrabold text-emerald-700 font-mono mt-0.5">
              {data.correctAnswers}
            </div>
            <div className="text-[10px] text-emerald-600 font-medium">Right Answers</div>
          </div>

          {/* Card 4: Total Score */}
          <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200">
            <div className="text-[10px] font-semibold text-purple-800 uppercase flex items-center gap-1">
              <Award className="w-3 h-3 text-[#635BFF]" />
              Score
            </div>
            <div className="text-base font-extrabold text-[#635BFF] font-mono mt-0.5">
              {data.totalScore}
            </div>
            <div className="text-[10px] text-purple-600 font-medium">Success Ratio</div>
          </div>
        </div>
      </div>
    </div>
  );
};
