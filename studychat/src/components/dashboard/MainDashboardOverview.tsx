import React, { useState } from 'react';
import { WelcomeBanner } from './WelcomeBanner';
import { CodingAnalyticsCard } from './CodingAnalyticsCard';
import { McqAnalyticsCard } from './McqAnalyticsCard';
import { WeeklyProblemChart } from './WeeklyProblemChart';
import { LeaderboardWidget } from './LeaderboardWidget';
import { ProblemOfTheDayCard } from './ProblemOfTheDayCard';
import { FullLeaderboardModal } from './FullLeaderboardModal';
import {
  INITIAL_WELCOME_STATS,
  INITIAL_CODING_ANALYTICS,
  INITIAL_MCQ_ANALYTICS,
  INITIAL_WEEKLY_ACTIVITY,
  INITIAL_LEADERBOARD,
  PROBLEM_OF_THE_DAY
} from '../../services/dashboardApiService';
import { DashboardActiveView } from './AlgoTutorSidebar';

interface MainDashboardOverviewProps {
  onNavigate: (view: DashboardActiveView) => void;
  studentName?: string;
}

export const MainDashboardOverview: React.FC<MainDashboardOverviewProps> = ({
  onNavigate,
  studentName = 'Surya'
}) => {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Large Blue Gradient Welcome Banner & 4 Stat Cards */}
      <WelcomeBanner stats={INITIAL_WELCOME_STATS} studentName={studentName} />

      {/* 2. Main Analytics & Right Widgets Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left 2 Columns: Coding Analytics, MCQ Analytics, Weekly Chart */}
        <div className="xl:col-span-2 space-y-6">
          {/* Top Analytics Cards: Coding Problems & MCQ Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <CodingAnalyticsCard
              data={INITIAL_CODING_ANALYTICS}
              onFilterClick={() => onNavigate('coding')}
            />
            <McqAnalyticsCard data={INITIAL_MCQ_ANALYTICS} />
          </div>

          {/* Full-Width Weekly Problem Solving Activity Chart */}
          <WeeklyProblemChart data={INITIAL_WEEKLY_ACTIVITY} />
        </div>

        {/* Right 1 Column: Problem of the Day & Leaderboard Podium */}
        <div className="space-y-6">
          {/* Problem of the Day */}
          <ProblemOfTheDayCard
            problem={PROBLEM_OF_THE_DAY}
            onSolveClick={() => onNavigate('coding')}
          />

          {/* Student Leaderboard Podium */}
          <LeaderboardWidget
            students={INITIAL_LEADERBOARD}
            onViewAllClick={() => setIsLeaderboardOpen(true)}
          />
        </div>
      </div>

      {/* Full Leaderboard Modal */}
      <FullLeaderboardModal
        students={INITIAL_LEADERBOARD}
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />
    </div>
  );
};
