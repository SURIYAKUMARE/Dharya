import React from 'react';
import { useStudyApp, AppNavTab } from '../../context/StudyAppContext';
import { BookOpen, Layers, Calendar, User } from 'lucide-react';

export const StudyBottomNav: React.FC = () => {
  const { activeTab, switchTab } = useStudyApp();

  if (activeTab === 'chat') return null;

  const navItems = [
    { id: 'home' as AppNavTab, label: 'Library', icon: BookOpen },
    { id: 'subjects' as AppNavTab, label: 'Curriculum', icon: Layers },
    { id: 'planner' as AppNavTab, label: 'Planner', icon: Calendar },
    { id: 'profile' as AppNavTab, label: 'Profile', icon: User },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-2xl border-t border-[#E2D9CC] px-4 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+8px)] flex items-center justify-around shadow-[0_-8px_30px_rgba(0,0,0,0.08)] select-none"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          activeTab === item.id ||
          (item.id === 'subjects' && activeTab === 'topic-explanation');

        return (
          <button
            key={item.id}
            onClick={() => switchTab(item.id)}
            className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 relative px-3 py-1 rounded-2xl ${
              isActive
                ? 'bg-[#1273C4] text-white shadow-md font-bold scale-105'
                : 'text-[#64748B] hover:text-[#1E293B] font-medium'
            }`}
          >
            <Icon className={`w-4.5 h-4.5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold' : ''}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
