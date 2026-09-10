import React from 'react';
import { useStudyApp, AppNavTab } from '../../context/StudyAppContext';
import { BookOpen, Layers, Calendar, User } from 'lucide-react';

export const StudyBottomNav: React.FC = () => {
  const { activeTab, switchTab } = useStudyApp();
  const isLibraryTheme = activeTab !== 'chat';

  const navItems = [
    { id: 'home' as AppNavTab, label: 'Home', icon: BookOpen },
    { id: 'subjects' as AppNavTab, label: 'Subjects', icon: Layers },
    { id: 'planner' as AppNavTab, label: 'Planner', icon: Calendar },
    { id: 'profile' as AppNavTab, label: 'Profile', icon: User },
  ];

  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 px-2 py-2 flex items-center justify-around shadow-2xl backdrop-blur-2xl transition-colors ${
        isLibraryTheme
          ? 'bg-[#FAF8F5]/95 border-t border-[#E5DFD5]'
          : 'bg-[#0B0F17]/95 border-t border-slate-800'
      }`}
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
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
              isActive
                ? isLibraryTheme
                  ? 'text-[#1273C4] font-bold'
                  : 'text-blue-400 font-bold'
                : isLibraryTheme
                ? 'text-[#64748B] hover:text-[#1E293B]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
