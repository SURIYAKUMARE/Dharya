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
        return <WhatsAppChatView />;
      case 'planner':
        return <PlannerView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <StudyHomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col selection:bg-blue-500/25 selection:text-blue-200 relative">
      {/* Subtle Engineering Dot Grid Pattern */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-15"
        style={{
          backgroundImage: 'radial-gradient(#38bdf8 0.75px, transparent 0.75px), radial-gradient(#818cf8 0.75px, #0B0F17 0.75px)',
          backgroundSize: '36px 36px',
          backgroundPosition: '0 0, 18px 18px',
        }}
      />

      {/* Top Academic Navigation */}
      <StudyNavbar />

      {/* Main Study Container */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col">
        {renderActiveView()}
      </main>

      {/* Mobile Bottom Navigation */}
      <StudyBottomNav />

      {/* Academic Footer */}
      <footer className="relative z-10 border-t border-slate-800 bg-[#0B0F17]/90 backdrop-blur py-4 px-6 text-center text-xs text-slate-400 hidden sm:flex items-center justify-between font-mono">
        <div>Study Portal • Engineering Curriculum &amp; Conceptual Assessment Platform</div>
        <div className="text-[11px] text-slate-500">AICTE &amp; GATE STANDARD • FALL 2026</div>
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
