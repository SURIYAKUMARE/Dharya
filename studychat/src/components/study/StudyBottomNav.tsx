import React from 'react';
import { useStudyApp, AppNavTab } from '../../context/StudyAppContext';
import { BookOpen, Layers, Calendar, MessageSquare, User, Lock } from 'lucide-react';

export const StudyBottomNav: React.FC = () => {
  const { activeTab, switchTab, isChatUnlocked } = useStudyApp();

  const navItems = [
    { id: 'home' as AppNavTab, label: 'Home', icon: BookOpen },
    { id: 'subjects' as AppNavTab, label: 'Subjects', icon: Layers },
    { id: 'planner' as AppNavTab, label: 'Planner', icon: Calendar },
    { id: 'chat' as AppNavTab, label: 'Chat', icon: MessageSquare, locked: !isChatUnlocked },
    { id: 'profile' as AppNavTab, label: 'Profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0F]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-2 flex items-center justify-around shadow-2xl">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          activeTab === item.id ||
          (item.id === 'subjects' && activeTab === 'topic-explanation') ||
          (item.id === 'chat' && activeTab === 'chat-login');

        return (
          <button
            key={item.id}
            onClick={() => switchTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
              isActive ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.locked && (
                <div className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <Lock className="w-2 h-2" />
                </div>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-1">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
