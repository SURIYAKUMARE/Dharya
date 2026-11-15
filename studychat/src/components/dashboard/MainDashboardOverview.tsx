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
  PROBLEM_OF_THE_DAY,
  DashboardWelcomeStats,
  McqAnalyticsData
} from '../../services/dashboardApiService';
import { DashboardActiveView } from './AlgoTutorSidebar';
import { useStudyApp } from '../../context/StudyAppContext';
import { SUBJECTS_DATA } from '../../data/curriculumData';
import { getEvaluationStats } from '../../data/evaluationStorage';

interface MainDashboardOverviewProps {
  onNavigate: (view: DashboardActiveView) => void;
  studentName?: string;
}

export const MainDashboardOverview: React.FC<MainDashboardOverviewProps> = ({
  onNavigate,
  studentName
}) => {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const { student } = useStudyApp();

  const activeName = studentName || student?.name || 'SADHANA N';
  const evalStats = getEvaluationStats();

  // Connect live stats from real application data
  const liveWelcomeStats: DashboardWelcomeStats = {
    totalCourses: SUBJECTS_DATA.length || 10,
    attendancePercentage: 92,
    studentRank: 54,
    pointsEarned: 8019 + (evalStats.totalPassed * 150)
  };

  const liveMcqStats: McqAnalyticsData = {
    totalMcqInBank: 39538,
    solvedQuestions: evalStats.totalQuestionsAnswered > 0 ? evalStats.totalQuestionsAnswered : INITIAL_MCQ_ANALYTICS.solvedQuestions,
    correctAnswers: evalStats.totalQuestionsAnswered > 0 ? Math.round(evalStats.totalQuestionsAnswered * (evalStats.accuracyRatePercentage / 100)) : INITIAL_MCQ_ANALYTICS.correctAnswers,
    accuracyPercentage: evalStats.accuracyRatePercentage > 0 ? evalStats.accuracyRatePercentage : INITIAL_MCQ_ANALYTICS.accuracyPercentage,
    totalScore: evalStats.totalQuestionsAnswered > 0 
      ? `${Math.round(evalStats.totalQuestionsAnswered * (evalStats.accuracyRatePercentage / 100))}/${evalStats.totalQuestionsAnswered}` 
      : INITIAL_MCQ_ANALYTICS.totalScore
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Large Blue Gradient Welcome Banner & 4 Stat Cards */}
      <WelcomeBanner stats={liveWelcomeStats} studentName={activeName} />

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
            <div onClick={() => onNavigate('mcq')} className="cursor-pointer">
              <McqAnalyticsCard data={liveMcqStats} />
            </div>
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
