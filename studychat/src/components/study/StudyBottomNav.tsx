import React from 'react';
import { useStudyApp, AppNavTab } from '../../context/StudyAppContext';
import { BookOpen, Layers, Calendar, User } from 'lucide-react';

export const StudyBottomNav: React.FC = () => {
  const { activeTab, switchTab } = useStudyApp();

  const navItems = [
    { id: 'home' as AppNavTab, label: 'Home', icon: BookOpen },
    { id: 'subjects' as AppNavTab, label: 'Subjects', icon: Layers },
    { id: 'planner' as AppNavTab, label: 'Planner', icon: Calendar },
    { id: 'profile' as AppNavTab, label: 'Profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0F]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-2 flex items-center justify-around shadow-2xl">
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
              isActive ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
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
