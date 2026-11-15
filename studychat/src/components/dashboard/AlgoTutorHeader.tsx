import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface AlgoTutorHeaderProps {
  onToggleSidebar: () => void;
  onOpenAcademicDisguise?: () => void;
  onLogout?: () => void;
  onSelectView?: (view: any) => void;
}

export const AlgoTutorHeader: React.FC<AlgoTutorHeaderProps> = ({
  onToggleSidebar,
  onOpenAcademicDisguise,
  onLogout,
  onSelectView
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] h-16 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
          aria-label="Toggle Sidebar Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems, courses, topics, or interview questions..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F4F9FC] border border-[#E2E8F0] text-xs text-[#172B4D] placeholder-[#94A3B8] focus:outline-none focus:border-[#0875E1] focus:ring-2 focus:ring-[#0875E1]/15 transition-all"
          />
        </div>
      </div>

      {/* Right: Actions, Notification, Profile Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Switch to Library Disguise Button */}
        {onOpenAcademicDisguise && (
          <button
            onClick={onOpenAcademicDisguise}
            className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-[#0875E1] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Open Engineering Library"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Open Library</span>
          </button>
        )}

        {/* Dark/Light Mode Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E11D48] ring-2 ring-white" />
          </button>

          {/* Notifications Dropdown */}
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-4 space-y-3 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-bold text-xs text-[#172B4D]">Notifications</span>
                <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  2 New
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
                  <div className="font-semibold text-blue-950">Daily Coding Streak Active! 🔥</div>
                  <p className="text-[11px] text-blue-800">You solved 19 problems this week. Keep up the momentum!</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-semibold text-slate-900">New Assignment Graded</div>
                  <p className="text-[11px] text-slate-600">Your OS-401 Multi-Threaded Scheduler scored 96/100 (A+).</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 mx-0.5" />

        {/* Student Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              S
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-[#172B4D] leading-tight">Surya</div>
              <div className="text-[10px] text-[#64748B] font-medium leading-tight">Student</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-2 space-y-1 z-50 animate-in fade-in duration-150">
              <div className="px-3 py-2 border-b border-slate-100 text-xs">
                <div className="font-bold text-[#172B4D]">Surya</div>
                <div className="text-[10px] text-[#64748B] font-mono">ENG-2024-0910</div>
              </div>

              <button
                onClick={() => {
                  if (onSelectView) onSelectView('settings');
                  setIsProfileMenuOpen(false);
                }}
                className="w-full px-3 py-1.5 rounded-lg text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => {
                  if (onSelectView) onSelectView('settings');
                  setIsProfileMenuOpen(false);
                }}
                className="w-full px-3 py-1.5 rounded-lg text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Settings</span>
              </button>

              <div className="border-t border-slate-100 my-1" />

              <button
                onClick={() => {
                  if (onLogout) onLogout();
                  setIsProfileMenuOpen(false);
                }}
                className="w-full px-3 py-1.5 rounded-lg text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
