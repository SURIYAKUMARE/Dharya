import React, { useState } from 'react';
import { AlgoTutorSidebar, DashboardActiveView } from './AlgoTutorSidebar';
import { AlgoTutorHeader } from './AlgoTutorHeader';
import { MainDashboardOverview } from './MainDashboardOverview';
import { AcademicCoursesView } from './AcademicCoursesView';
import { ProblemSolvingView } from './ProblemSolvingView';
import { AttendanceView } from './AttendanceView';
import { CodingPracticeView } from './CodingPracticeView';
import { McqPracticeView } from './McqPracticeView';
import { ResumeBuilderView } from './ResumeBuilderView';
import { JobsView } from './JobsView';
import { RewardsView } from './RewardsView';
import { EvaluationView } from '../evaluation/EvaluationView';
import {
  BookSlotView,
  ProjectsView,
  CompanyPrepView,
  SqlPracticeView,
  NotesView,
  TrackRequestView,
  HelpSupportView,
  SettingsView
} from './MiscViews';

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

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <MainDashboardOverview onNavigate={setCurrentView} studentName="Surya" />;
      case 'courses':
        return <AcademicCoursesView />;
      case 'book-slot':
        return <BookSlotView />;
      case 'problem-solving':
        return <ProblemSolvingView />;
      case 'attendance':
        return <AttendanceView />;
      case 'assessment-results':
        return <EvaluationView />;
      case 'rewards':
        return <RewardsView />;
      case 'mcq':
        return <McqPracticeView />;
      case 'coding':
        return <CodingPracticeView />;
      case 'projects':
        return <ProjectsView />;
      case 'company-prep':
        return <CompanyPrepView />;
      case 'sql-practice':
        return <SqlPracticeView />;
      case 'notes':
        return <NotesView />;
      case 'resume-builder':
        return <ResumeBuilderView />;
      case 'jobs':
        return <JobsView />;
      case 'track-request':
        return <TrackRequestView />;
      case 'help-support':
        return <HelpSupportView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <MainDashboardOverview onNavigate={setCurrentView} studentName="Surya" />;
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
          onOpenAcademicDisguise={onOpenLibraryDisguise}
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
