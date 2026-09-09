import React from 'react';
import { StudyAppProvider, useStudyApp } from './context/StudyAppContext';
import { StudyNavbar } from './components/study/StudyNavbar';
import { StudyBottomNav } from './components/study/StudyBottomNav';
import { StudyHomePage } from './components/study/StudyHomePage';
import { SubjectTopicsView } from './components/study/SubjectTopicsView';
import { TopicExplanationView } from './components/study/TopicExplanationView';
import { AssessmentModal } from './components/assessment/AssessmentModal';
import { DharyaLoginPage } from './components/auth/DharyaLoginPage';
import { StudentChatView } from './components/chat/StudentChatView';
import { PlannerView } from './components/planner/PlannerView';
import { ProfileView } from './components/profile/ProfileView';

function AppContent() {
  const { activeTab } = useStudyApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <StudyHomePage />;
      case 'subjects':
        return <SubjectTopicsView />;
      case 'topic-explanation':
        return <TopicExplanationView />;
      case 'assessment':
        return <AssessmentModal />;
      case 'chat-login':
        return <DharyaLoginPage />;
      case 'chat':
        return <StudentChatView />;
      case 'planner':
        return <PlannerView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <StudyHomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-slate-100 flex flex-col selection:bg-indigo-500/25 selection:text-indigo-200">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,102,241,0.12)_0%,#0A0A0F_75%)] z-0" />

      {/* Top Academic Navigation */}
      <StudyNavbar />

      {/* Main Study Container */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col">
        {renderActiveView()}
      </main>

      {/* Mobile Bottom Navigation */}
      <StudyBottomNav />

      {/* Academic Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#0A0A0F]/80 backdrop-blur py-4 px-6 text-center text-xs text-slate-500 hidden sm:flex items-center justify-between">
        <div>Study Portal • Engineering Curriculum &amp; Conceptual Assessment Platform</div>
        <div className="font-mono text-[11px] text-slate-600">AICTE &amp; GATE STANDARD • 2026</div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <StudyAppProvider>
      <AppContent />
    </StudyAppProvider>
  );
}

export default App;
