import React from 'react';
import { useStudyApp, AppNavTab } from '../../context/StudyAppContext';
import { BookOpen, Layers, Calendar, User } from 'lucide-react';

export const StudyBottomNav: React.FC = () => {
  const { activeTab, switchTab } = useStudyApp();

  if (activeTab === 'chat') return null;

  const navItems = [
    { id: 'home' as AppNavTab, label: 'Home', icon: BookOpen },
    { id: 'subjects' as AppNavTab, label: 'Subjects', icon: Layers },
    { id: 'planner' as AppNavTab, label: 'Planner', icon: Calendar },
    { id: 'profile' as AppNavTab, label: 'Profile', icon: User },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-xl border-t border-[#E5DFD5] px-3 pt-1.5 pb-[calc(env(safe-area-inset-bottom,0px)+6px)] flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)] select-none"
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
            className={`flex flex-col items-center justify-center transition-all duration-150 active:scale-95 ${
              isActive
                ? 'bg-[#EBF3FB] text-[#1273C4] border border-[#BFDBFE]/80 px-3.5 py-1 rounded-2xl shadow-2xs font-bold'
                : 'text-[#64748B] hover:text-[#1E293B] px-2.5 py-1 font-medium'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
            <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
