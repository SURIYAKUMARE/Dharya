import React from 'react';
import {
  GraduationCap,
  CalendarCheck,
  Trophy,
  Zap,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { DashboardWelcomeStats } from '../../services/dashboardApiService';

interface WelcomeBannerProps {
  stats: DashboardWelcomeStats;
  studentName?: string;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  stats,
  studentName = 'Student'
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-4">
      {/* 1. Large Blue Gradient Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0875E1] via-[#07549A] to-[#0A417A] text-white p-6 sm:p-8 shadow-lg shadow-blue-900/10 border border-blue-400/20">
        {/* Decorative Subtle Background Orbs */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-300/15 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-blue-100 text-xs font-semibold border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{currentDate}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif">
              Welcome Back, {studentName}! 👋
            </h1>

            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Check out the latest updates on your courses, review your weekly problem-solving milestones, and keep your daily streak alive.
            </p>
          </div>

          {/* Educational Modern Illustration (SVG / Glass Card) */}
          <div className="hidden md:flex items-center justify-center shrink-0">
            <div className="relative w-40 h-32 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 p-4 flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-200">Daily Goal</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="text-center py-1">
                <div className="text-3xl font-black font-mono">19 / 20</div>
                <div className="text-[10px] text-blue-100">Problems Solved</div>
              </div>
              <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: '95%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Four Statistic Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Courses — 38 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E2E8F0] shadow-xs hover:shadow-md hover:border-blue-300 transition-all group flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-semibold text-[#172B4D]">Total Courses</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0875E1] flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-[#172B4D] font-mono">
              {stats.totalCourses}
            </div>
            <div className="text-[11px] text-[#64748B] mt-0.5">Enrolled modules</div>
          </div>
        </div>

        {/* Card 2: Attendance — 0% */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E2E8F0] shadow-xs hover:shadow-md hover:border-blue-300 transition-all group flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-semibold text-[#172B4D]">Attendance</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-[#172B4D] font-mono">
              {stats.attendancePercentage}%
            </div>
            <div className="text-[11px] text-[#64748B] mt-0.5">Live sessions attended</div>
          </div>
        </div>

        {/* Card 3: Student Rank — 54 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E2E8F0] shadow-xs hover:shadow-md hover:border-blue-300 transition-all group flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-semibold text-[#172B4D]">Student Rank</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">
              #{stats.studentRank}
            </div>
            <div className="text-[11px] text-[#64748B] mt-0.5">Global student ranking</div>
          </div>
        </div>

        {/* Card 4: Points Earned — 8019 */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E2E8F0] shadow-xs hover:shadow-md hover:border-blue-300 transition-all group flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-semibold text-[#172B4D]">Points Earned</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
              {stats.pointsEarned.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#64748B] mt-0.5">Karma points accumulated</div>
          </div>
        </div>
      </div>
    </div>
  );
};
