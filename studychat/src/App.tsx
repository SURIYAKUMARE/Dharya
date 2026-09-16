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
import { PrivatePortalNav } from './components/chat/PrivatePortalNav';
import { InteractivePlantGarden } from './components/garden/InteractivePlantGarden';
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
      case 'garden':
        if (!isChatAuthenticated) {
          return <DharyaLoginPage />;
        }
        return <InteractivePlantGarden />;
      case 'planner':
        return <PlannerView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <StudyHomePage />;
    }
  };

  const isPrivate = activeTab === 'chat' || activeTab === 'garden';

  return (
    <div
      className={`min-h-screen flex flex-col relative transition-colors duration-200 ${
        isPrivate
          ? 'bg-[#0B0F17] text-slate-100 selection:bg-emerald-500/25 selection:text-emerald-200'
          : 'bg-[#FAF8F5] text-[#1E293B] selection:bg-blue-200 selection:text-blue-900'
      }`}
    >
      {/* Subtle Engineering Dot Grid Pattern for private dark mode on desktop */}
      {isPrivate && (
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-15 hidden md:block"
          style={{
            backgroundImage:
              'radial-gradient(#10b981 0.75px, transparent 0.75px), radial-gradient(#38bdf8 0.75px, #0B0F17 0.75px)',
            backgroundSize: '36px 36px',
            backgroundPosition: '0 0, 18px 18px',
          }}
        />
      )}

      {/* Top Navigation: Dedicated Private Navigation when authenticated in Chat or Garden; Academic Navbar on public study pages */}
      {isPrivate ? <PrivatePortalNav /> : <StudyNavbar />}

      {/* Main Container: Fullscreen in Chat/Garden, Padded in Portal with Mobile Bottom Clearance */}
      <main
        className={`relative z-10 flex-1 w-full flex flex-col ${
          isPrivate
            ? 'p-0 md:p-3 max-w-5xl mx-auto h-full justify-center'
            : 'max-w-7xl mx-auto p-3.5 pb-28 sm:p-6 sm:pb-16 md:pb-8'
        }`}
      >
        {renderActiveView()}
      </main>

      {/* Mobile Bottom Navigation (Only for public academic pages) */}
      {!isPrivate && <StudyBottomNav />}

      {/* Academic Desktop Footer (Only visible on academic pages) */}
      {!isPrivate && (
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
