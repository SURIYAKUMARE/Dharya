import React, { useState } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { Eye, EyeOff, ShieldCheck, ArrowRight, BookOpen, KeyRound, User, Lock } from 'lucide-react';

export const DharyaLoginPage: React.FC = () => {
  const { loginToChat, quickLogin, switchTab } = useStudyApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = loginToChat(username, password);
      if (success) {
        switchTab('chat');
      } else {
        setError('Invalid credentials. Please verify your Student ID and Access Key.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSignIn = (user: 'surya' | 'sadhana') => {
    quickLogin(user);
    switchTab('chat');
  };

  return (
    <div className="min-h-screen bg-[#131615] flex items-center justify-center p-4 sm:p-6 text-[#ECEEEB] font-sans relative">
      <div className="w-full max-w-md">
        <div className="bg-[#1A1D1C] border border-[#2A302D] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          
          {/* Top Bar: Quiet Mode & Camouflage Switch */}
          <div className="flex items-center justify-between text-xs pb-3 border-b border-[#242A27]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#7E9F89]" />
              <span className="text-[#A3ADA5] font-mono tracking-wider uppercase text-[11px]">Private Space</span>
            </div>
            <button
              type="button"
              onClick={() => switchTab('home')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222724] hover:bg-[#282F2B] text-[#9EA7A0] hover:text-[#ECEEEB] transition-colors border border-[#2D3531] cursor-pointer text-xs"
              title="Open Academic Curriculum & Notes Portal"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#7E9F89]" />
              <span>Academic Mode</span>
            </button>
          </div>

          {/* Quiet Branding Header */}
          <div className="text-center space-y-1.5 pt-1">
            <h1 className="text-2xl font-bold tracking-tight text-[#ECEEEB]">
              Dharya
            </h1>
            <p className="text-xs text-[#8B968E] max-w-xs mx-auto leading-relaxed">
              A quiet personal space for Surya &amp; Sadhana
            </p>
          </div>

          {/* Profile Selector */}
          <div className="space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#707A72] text-center">
              Continue as
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Surya Profile Button - Sage accent */}
              <button
                type="button"
                onClick={() => handleQuickSignIn('surya')}
                className="p-3.5 rounded-xl bg-[#202522] hover:bg-[#262C29] border border-[#2E3632] hover:border-[#4E6B58] transition-all text-left flex items-center gap-3 cursor-pointer group active:scale-[0.99]"
              >
                <div className="w-10 h-10 rounded-full bg-[#2B3830] border border-[#3E5246] flex items-center justify-center font-bold text-sm text-[#A5C2AF] shrink-0">
                  S
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#ECEEEB] leading-tight">
                    Surya
                  </div>
                  <div className="text-[11px] text-[#7E9F89] mt-0.5">Enter space</div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#707A72] group-hover:text-[#A5C2AF] transition-colors" />
              </button>

              {/* Sadhana Profile Button - Muted Rose accent */}
              <button
                type="button"
                onClick={() => handleQuickSignIn('sadhana')}
                className="p-3.5 rounded-xl bg-[#222122] hover:bg-[#2A2829] border border-[#342D30] hover:border-[#7A4B53] transition-all text-left flex items-center gap-3 cursor-pointer group active:scale-[0.99]"
              >
                <div className="w-10 h-10 rounded-full bg-[#36272B] border border-[#52383F] flex items-center justify-center font-bold text-sm text-[#D8A1AA] shrink-0">
                  S
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#ECEEEB] leading-tight">
                    Sadhana
                  </div>
                  <div className="text-[11px] text-[#D48D98] mt-0.5">Enter space</div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#707A72] group-hover:text-[#D8A1AA] transition-colors" />
              </button>
            </div>
          </div>

          {/* Manual Access Key Form */}
          <div className="pt-2">
            {!showManualForm ? (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowManualForm(true)}
                  className="text-xs text-[#707A72] hover:text-[#A3ADA5] transition-colors inline-flex items-center gap-1.5 cursor-pointer font-sans"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sign in with access key</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleManualLogin} className="space-y-4 pt-3 border-t border-[#242A27] text-left">
                <div>
                  <label htmlFor="login-username" className="block text-xs font-medium text-[#A3ADA5] mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#707A72]" />
                    <span>Username or Student ID</span>
                  </label>
                  <input
                    id="login-username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="surya or sadhana"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141716] border border-[#2E3430] text-[#ECEEEB] text-sm placeholder-[#555E58] focus:outline-none focus:border-[#7E9F89] transition-colors font-sans"
                  />
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-xs font-medium text-[#A3ADA5] mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#707A72]" />
                    <span>Access Key / Password</span>
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter access key"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141716] border border-[#2E3430] text-[#ECEEEB] text-sm placeholder-[#555E58] focus:outline-none focus:border-[#7E9F89] transition-colors font-sans pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#707A72] hover:text-[#ECEEEB] transition-colors cursor-pointer p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div role="alert" className="p-3 rounded-xl bg-[#2A1D1F] border border-[#52292E] text-[#E08D93] text-xs leading-relaxed">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#4E6B58] hover:bg-[#3D5646] active:bg-[#354B3D] text-[#FFFFFF] font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isLoading ? 'Verifying...' : 'Verify and Enter'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Quiet Security Footer */}
          <div className="pt-3 text-center text-[11px] text-[#707A72] flex items-center justify-center gap-1.5 border-t border-[#242A27]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#7E9F89]" />
            <span>Encrypted private session</span>
          </div>

        </div>
      </div>
    </div>
  );
};
