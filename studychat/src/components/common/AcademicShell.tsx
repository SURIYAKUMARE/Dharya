import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  MessageSquare,
  Sprout,
  GitBranch,
  FileText,
  Calendar,
  Gift,
  Grid3X3,
  Compass,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  GraduationCap,
  Shield,
  BookOpen
} from 'lucide-react';

interface AcademicShellProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenSecretModal: () => void;
  onOpenLoginModal: () => void;
  children: React.ReactNode;
  streakCount?: number;
}

export const AcademicShell: React.FC<AcademicShellProps> = ({
  activeTab,
  onTabChange,
  onOpenSecretModal,
  onOpenLoginModal,
  children,
  streakCount = 42,
}) => {
  const { currentUser, isAuthenticated, disguiseMode, toggleDisguise, logout, secretMode } = useAuth();

  const navItems = [
    { id: 'discuss', label: disguiseMode || !isAuthenticated ? 'Discuss' : 'Chat', icon: MessageSquare, badge: null },
    { id: 'streak', label: disguiseMode || !isAuthenticated ? 'Streak Garden' : 'Our Garden', icon: Sprout, badge: `${streakCount}d` },
    { id: 'modules', label: disguiseMode || !isAuthenticated ? 'Timeline' : 'Milestones', icon: GitBranch, badge: null },
    { id: 'notes', label: disguiseMode || !isAuthenticated ? 'Notes' : 'Gallery', icon: FileText, badge: null },
    { id: 'schedule', label: disguiseMode || !isAuthenticated ? 'Schedule' : 'Dates', icon: Calendar, badge: null },
    { id: 'bonus', label: disguiseMode || !isAuthenticated ? 'Bonus Material' : 'Surprise Box', icon: Gift, badge: 'New' },
    { id: 'practice', label: disguiseMode || !isAuthenticated ? 'Concept Puzzle' : 'Photo Puzzle', icon: Grid3X3, badge: null },
    { id: 'location', label: disguiseMode || !isAuthenticated ? 'Campus Link' : 'Distance', icon: Compass, badge: null },
  ];

  // Soft ambient glow background computation
  const getAmbientGlow = () => {
    if (!isAuthenticated || disguiseMode) {
      return 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(16, 185, 129, 0.12) 0%, rgba(10, 10, 15, 0.95) 75%)';
    }
    if (currentUser?.id === 'surya') {
      return 'radial-gradient(ellipse 80% 55% at 50% -10%, rgba(16, 185, 129, 0.22) 0%, rgba(10, 10, 15, 0.95) 75%)';
    }
    return 'radial-gradient(ellipse 80% 55% at 50% -10%, rgba(244, 63, 94, 0.22) 0%, rgba(10, 10, 15, 0.95) 75%)';
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-slate-100 flex flex-col selection:bg-emerald-500/25 selection:text-emerald-200">
      {/* Dynamic Ambient Background */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-700 z-0"
        style={{ background: getAmbientGlow() }}
      />

      {/* Disguise Panic Indicator Banner (if active) */}
      {disguiseMode && (
        <div className="relative z-50 bg-emerald-950/90 border-b border-emerald-500/30 text-emerald-300 text-xs py-1.5 px-4 flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>DISGUISE CAMOUFLAGE ACTIVE — Viewing Academic Syllabus Shell</span>
          </div>
          <button
            onClick={toggleDisguise}
            className="text-[11px] underline font-sans hover:text-white transition-colors"
          >
            Exit Camouflage
          </button>
        </div>
      )}

      {/* Academic Top Header */}
      <header className="sticky top-0 z-40 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo and Academic Branding */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('discuss')}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/5">
                <span className="font-serif font-black text-lg text-emerald-400">D+</span>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-tight text-white">Study Portal</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 uppercase tracking-wider">
                    Institutional
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 tracking-tight">Department of Engineering Academic Resources</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`relative px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-white/10 text-white shadow-sm border border-white/15'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2">
              {/* Panic Disguise Camouflage Toggle */}
              {isAuthenticated && (
                <button
                  onClick={toggleDisguise}
                  title={disguiseMode ? 'Resume Authenticated View' : 'Instant Disguise Camouflage (Academic Mask)'}
                  className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
                    disguiseMode
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {disguiseMode ? <EyeOff className="w-4 h-4 text-emerald-400" /> : <Eye className="w-4 h-4" />}
                  <span className="hidden xl:inline text-[11px] font-medium">
                    {disguiseMode ? 'Masked' : 'Disguise'}
                  </span>
                </button>
              )}

              {/* Secret Archive PIN Button */}
              <button
                onClick={onOpenSecretModal}
                title="Department Archive (Security Clearance PIN)"
                className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
                  secretMode
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Lock className={`w-4 h-4 ${secretMode ? 'text-purple-400' : 'text-slate-400'}`} />
                <span className="hidden lg:inline text-[11px] font-medium">
                  {secretMode ? 'Archive Open' : 'Archive'}
                </span>
              </button>

              {/* User Profile / Login Button */}
              {isAuthenticated && currentUser ? (
                <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-inner"
                      style={{ backgroundColor: currentUser.accentColor }}
                    >
                      {currentUser.emoji}
                    </div>
                    <span className="text-xs font-bold text-white hidden sm:inline">{currentUser.name}</span>
                  </div>
                  <button
                    onClick={logout}
                    title="Sign Out to Academic Mask"
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenLoginModal}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Institutional Login</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation (Scrollable Row) */}
        <div className="md:hidden border-t border-white/5 overflow-x-auto scrollbar-none px-3 py-2 flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Feature Container */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col">
        {children}
      </main>

      {/* Academic Disguise Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#0A0A0F]/60 backdrop-blur py-4 px-6 text-center text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span>Study Portal • Accredited Engineering Library &amp; Collaboration Platform</span>
        </div>
        <div className="font-mono text-[10px] text-slate-600">
          NODE-ENGR-301 • TLS-V1.3 SECURE VERIFIED
        </div>
      </footer>
    </div>
  );
};
