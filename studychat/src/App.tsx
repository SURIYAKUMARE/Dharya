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

  // Route protection guard: redirect unauthenticated chat access
  React.useEffect(() => {
    if (activeTab === 'chat' && !isChatAuthenticated) {
      switchTab('chat-login');
    }
  }, [activeTab, isChatAuthenticated, switchTab]);

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
        if (!isChatAuthenticated) {
          return <DharyaLoginPage />;
        }
        return <WhatsAppChatView />;
      case 'planner':
        return <PlannerView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <StudyHomePage />;
    }
  };

  const isChat = activeTab === 'chat';

  return (
    <div
      className={`min-h-screen flex flex-col relative transition-colors duration-200 ${
        isChat
          ? 'bg-[#0B0F17] text-slate-100 selection:bg-blue-500/25 selection:text-blue-200'
          : 'bg-[#FAF8F5] text-[#1E293B] selection:bg-blue-200 selection:text-blue-900'
      }`}
    >
      {/* Subtle Engineering Dot Grid Pattern for chat dark mode on desktop */}
      {isChat && (
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-15 hidden md:block"
          style={{
            backgroundImage:
              'radial-gradient(#38bdf8 0.75px, transparent 0.75px), radial-gradient(#818cf8 0.75px, #0B0F17 0.75px)',
            backgroundSize: '36px 36px',
            backgroundPosition: '0 0, 18px 18px',
          }}
        />
      )}

      {/* Top Academic Navigation (Hidden in Chat for authentic mobile WhatsApp feel) */}
      {!isChat && <StudyNavbar />}

      {/* Main Study Container: Fullscreen in Chat, Padded in Portal with Mobile Bottom Clearance */}
      <main
        className={`relative z-10 flex-1 w-full flex flex-col ${
          isChat
            ? 'p-0 md:p-4 max-w-5xl mx-auto h-full justify-center'
            : 'max-w-7xl mx-auto p-3.5 pb-28 sm:p-6 sm:pb-16 md:pb-8'
        }`}
      >
        {renderActiveView()}
      </main>

      {/* Mobile Bottom Navigation (Hidden in Chat and on Desktop) */}
      {!isChat && <StudyBottomNav />}

      {/* Academic Desktop Footer (Only visible on laptop/desktop web application) */}
      {!isChat && (
        <footer className="relative z-10 py-4 px-6 text-center text-xs hidden md:flex items-center justify-between font-mono border-t border-[#E5DFD5] bg-[#FAF8F5] text-[#64748B]">
          <div>Open Library • Engineering Curriculum &amp; Conceptual Assessment Platform</div>
          <div className="text-[11px] opacity-75">AICTE &amp; GATE STANDARD • FALL 2026</div>
        </footer>
      )}
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
