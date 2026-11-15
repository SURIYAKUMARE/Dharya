import React, { useState } from 'react';
import { AlgoTutorSidebar, DashboardActiveView } from './AlgoTutorSidebar';
import { AlgoTutorHeader } from './AlgoTutorHeader';
import { MainDashboardOverview } from './MainDashboardOverview';
import { AcademicCoursesView } from './AcademicCoursesView';
import { ProblemSolvingView } from './ProblemSolvingView';
import { AttendanceView } from './AttendanceView';
import { CodingPracticeView } from './CodingPracticeView';
import { McqPracticeView } from './McqPracticeView';
import { RewardsView } from './RewardsView';
import { EvaluationView } from '../evaluation/EvaluationView';
import { NotesView, SettingsView } from './MiscViews';
import { useStudyApp } from '../../context/StudyAppContext';

interface AlgoTutorDashboardPageProps {
  onOpenLibraryDisguise?: () => void;
  onLogout?: () => void;
}

export const AlgoTutorDashboardPage: React.FC<AlgoTutorDashboardPageProps> = ({
  onOpenLibraryDisguise,
  onLogout
}) => {
  const [currentView, setCurrentView] = useState<DashboardActiveView>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const { student, switchTab } = useStudyApp();

  const handleOpenLibrary = () => {
    if (onOpenLibraryDisguise) {
      onOpenLibraryDisguise();
    } else {
      switchTab('home');
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <MainDashboardOverview onNavigate={setCurrentView} studentName={student?.name || 'SADHANA N'} />;
      case 'courses':
        return <AcademicCoursesView onNavigate={setCurrentView} />;
      case 'coding':
        return <CodingPracticeView />;
      case 'problem-solving':
        return <ProblemSolvingView />;
      case 'mcq':
        return <McqPracticeView />;
      case 'assessment-results':
        return <EvaluationView />;
      case 'attendance':
        return <AttendanceView />;
      case 'rewards':
        return <RewardsView />;
      case 'notes':
        return <NotesView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <MainDashboardOverview onNavigate={setCurrentView} studentName={student?.name || 'SADHANA N'} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F9FC] text-[#172B4D] flex">
      {/* 1. Left Sidebar — 220px desktop width */}
      <AlgoTutorSidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Canvas (offset by 220px on lg screens) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[220px] transition-all">
        {/* Sticky Top Header */}
        <AlgoTutorHeader
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onOpenAcademicDisguise={handleOpenLibrary}
          onLogout={onLogout}
          onSelectView={setCurrentView}
        />

        {/* Inner Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto animate-in fade-in duration-200">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
};
