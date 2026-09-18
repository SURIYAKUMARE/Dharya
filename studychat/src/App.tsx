import React from 'react';
import { StudyAppProvider, useStudyApp } from './context/StudyAppContext';
import { StudyNavbar } from './components/study/StudyNavbar';
import { StudyBottomNav } from './components/study/StudyBottomNav';
import { StudyHomePage } from './components/study/StudyHomePage';
import { SubjectTopicsView } from './components/study/SubjectTopicsView';
import { TopicExplanationView } from './components/study/TopicExplanationView';
import { AssessmentModal } from './components/assessment/AssessmentModal';
import { DharyaLoginPage } from './components/auth/DharyaLoginPage';
import { WhatsAppChatView } from './components/chat/WhatsAppChatView';
import { PlannerView } from './components/planner/PlannerView';
import { ProfileView } from './components/profile/ProfileView';

function AppContent() {
  const { activeTab, isChatAuthenticated, switchTab } = useStudyApp();

  // Route protection guard: redirect unauthenticated access to private features
  React.useEffect(() => {
    if ((activeTab === 'chat' || activeTab === 'garden') && !isChatAuthenticated) {
      switchTab('chat-login');
    }
  }, [activeTab, isChatAuthenticated, switchTab]);

  const isPrivate = activeTab === 'chat' || activeTab === 'garden';

  // In WhatsApp Chat or Garden when authenticated: full-screen authentic WhatsApp Web experience
  if (isPrivate && isChatAuthenticated) {
    return <WhatsAppChatView initialTab={activeTab === 'garden' ? 'garden' : 'chat'} />;
  }

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
      case 'chat':
      case 'garden':
        return <DharyaLoginPage />;
      case 'planner':
        return <PlannerView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <StudyHomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative transition-colors duration-200 bg-[#FAF8F5] text-[#1E293B] selection:bg-blue-200 selection:text-blue-900">
      {/* Top Academic Navigation for Public Curriculum Pages */}
      <StudyNavbar />

      {/* Main Academic Container */}
      <main className="relative z-10 flex-1 w-full flex flex-col max-w-7xl mx-auto p-3.5 pb-28 sm:p-6 sm:pb-16 md:pb-8">
        {renderActiveView()}
      </main>

      {/* Mobile Bottom Navigation for Academic Pages */}
      <StudyBottomNav />

      {/* Academic Desktop Footer */}
      <footer className="relative z-10 py-4 px-6 text-center text-xs hidden md:flex items-center justify-between font-mono border-t border-[#E5DFD5] bg-[#FAF8F5] text-[#64748B]">
        <div>Open Library • Engineering Curriculum &amp; Conceptual Assessment Platform</div>
        <div className="text-[11px] opacity-75">AICTE &amp; GATE STANDARD • FALL 2026</div>
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
