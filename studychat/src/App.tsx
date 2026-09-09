import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AcademicShell } from './components/common/AcademicShell';
import { LoginCard } from './components/auth/LoginCard';
import { SecretArchiveModal } from './components/auth/SecretArchiveModal';
import { CourseDiscussion } from './components/chat/CourseDiscussion';
import { StudyStreakGarden } from './components/garden/StudyStreakGarden';
import { CourseTimeline } from './components/timeline/CourseTimeline';
import { ResourceGallery } from './components/gallery/ResourceGallery';
import { ExamScheduleTracker } from './components/schedule/ExamScheduleTracker';
import { BonusStudyMaterial } from './components/bonus/BonusStudyMaterial';
import { ConceptPuzzle } from './components/puzzle/ConceptPuzzle';
import { CampusDistanceTracker } from './components/distance/CampusDistanceTracker';
import { Lock, X } from 'lucide-react';

function PortalContent() {
  const [activeTab, setActiveTab] = useState('discuss');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);
  const { isAuthenticated, secretMode } = useAuth();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'discuss':
        return <CourseDiscussion />;
      case 'streak':
        return <StudyStreakGarden />;
      case 'modules':
        return <CourseTimeline />;
      case 'notes':
        return <ResourceGallery />;
      case 'schedule':
        return <ExamScheduleTracker />;
      case 'bonus':
        return <BonusStudyMaterial />;
      case 'practice':
        return <ConceptPuzzle />;
      case 'location':
        return <CampusDistanceTracker />;
      default:
        return <CourseDiscussion />;
    }
  };

  return (
    <AcademicShell
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab)}
      onOpenLoginModal={() => setIsLoginModalOpen(true)}
      onOpenSecretModal={() => setIsSecretModalOpen(true)}
    >
      {/* Active Component */}
      {renderActiveTab()}

      {/* Institutional Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full text-slate-400 hover:text-white bg-black/40 hover:bg-black/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <LoginCard
              onSuccess={() => setIsLoginModalOpen(false)}
              onOpenSecretModal={() => {
                setIsLoginModalOpen(false);
                setIsSecretModalOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Secret Room Access (Private PIN) Modal */}
      <SecretArchiveModal
        isOpen={isSecretModalOpen}
        onClose={() => setIsSecretModalOpen(false)}
        onSuccess={() => {
          setIsSecretModalOpen(false);
          setActiveTab('bonus');
        }}
      />
    </AcademicShell>
  );
}

export function App() {
  return (
    <AuthProvider>
      <PortalContent />
    </AuthProvider>
  );
}

export default App;
