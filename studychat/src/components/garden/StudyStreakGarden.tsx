import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMaskedFeature } from '../../hooks/useMaskedFeature';
import { Sprout, Droplets, Sparkles, Award, CheckCircle2, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StreakData {
  count: number;
  lastCheckInDate: string;
  history: Array<{ date: string; user: string; note: string }>;
}

export const StudyStreakGarden: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { isMasked, title, description, courseCode } = useMaskedFeature('streak');

  const [streakData, setStreakData] = useState<StreakData>(() => {
    try {
      const saved = localStorage.getItem('studyportal_garden_streak_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      count: 42,
      lastCheckInDate: new Date().toISOString().split('T')[0],
      history: [
        { date: '2026-09-08', user: 'surya', note: 'Linear Algebra problem set solved together 🌿' },
        { date: '2026-09-07', user: 'sadhana', note: 'Evening study revision and shared notes ❤️' },
        { date: '2026-09-06', user: 'surya', note: 'Calculus derivatives mastery session ✨' },
      ],
    };
  });

  const [hasWateredToday, setHasWateredToday] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setHasWateredToday(streakData.lastCheckInDate === todayStr && streakData.count > 0);
  }, [streakData, todayStr]);

  const handleWaterGarden = () => {
    if (!isAuthenticated || hasWateredToday || !currentUser) return;

    const newCount = streakData.count + 1;
    const newEntry = {
      date: todayStr,
      user: currentUser.id,
      note: currentUser.id === 'surya' ? 'Logged study focus & watered our garden 🌿' : 'Study revision complete with Surya ❤️',
    };

    const updated: StreakData = {
      count: newCount,
      lastCheckInDate: todayStr,
      history: [newEntry, ...streakData.history],
    };

    setStreakData(updated);
    setHasWateredToday(true);
    localStorage.setItem('studyportal_garden_streak_v1', JSON.stringify(updated));

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: currentUser.id === 'surya' ? ['#10b981', '#34d399', '#6ee7b7'] : ['#f43f5e', '#fb7185', '#f472b6'],
    });
  };

  // Plant stage visualization (sprout -> bud -> blooming flower)
  const getGrowthStage = () => {
    if (streakData.count < 7) return { stage: 'Seedling', icon: '🌱', percent: 25 };
    if (streakData.count < 30) return { stage: 'Sprouting Vine', icon: '🌿', percent: 65 };
    if (streakData.count < 60) return { stage: 'Blooming Blossom', icon: '🌸', percent: 85 };
    return { stage: 'Evergreen Love Tree', icon: '🌳', percent: 100 };
  };

  const growth = getGrowthStage();

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full space-y-6">
      {/* Top Academic Disguise Header */}
      <div className="bg-[#0d0a17]/90 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <Sprout className="w-4 h-4" />
            <span>{courseCode}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">{description}</p>
        </div>

        {/* Big Streak Metric Card */}
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
          <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
            {streakData.count}
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              {isMasked ? 'Days Logged' : 'Days Together'}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono">100% Consistency</div>
          </div>
        </div>
      </div>

      {/* Main Interactive Garden Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[#0d0a17]/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute inset-0 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

          {/* Plant Animation Canvas Graphic */}
          <div className="relative mb-6">
            <div className="w-36 h-36 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-6xl shadow-2xl shadow-emerald-500/20 animate-pulse">
              {growth.icon}
            </div>
            <div className="absolute -bottom-2 inset-x-0 flex justify-center">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-[#0A0A0F] border border-emerald-500/40 text-emerald-300 shadow">
                {growth.stage}
              </span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-white mb-1">
            {isMasked ? 'Focus Continuity Metric' : 'Our Ever-Growing Garden 🌿❤️'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mb-6">
            {isMasked
              ? 'Each logged academic study session nurtures the institutional focus plant. Keep your study streak alive!'
              : 'Every single day Surya and Sadhana connect, our garden blooms stronger. Water it today to keep our streak alive! ✨'}
          </p>

          {/* Water Garden / Log Study Button */}
          {isAuthenticated ? (
            <button
              onClick={handleWaterGarden}
              disabled={hasWateredToday}
              className={`px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg ${
                hasWateredToday
                  ? 'bg-white/10 border border-white/10 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/25 hover:scale-105 active:scale-95'
              }`}
            >
              <Droplets className={`w-4 h-4 ${hasWateredToday ? 'text-slate-400' : 'text-cyan-300'}`} />
              <span>
                {hasWateredToday
                  ? 'Watered for Today ✓'
                  : isMasked
                  ? 'Log Today’s Study Session'
                  : 'Water Our Garden Together 💧'}
              </span>
            </button>
          ) : (
            <div className="text-xs text-slate-500 font-mono">
              Log in with Student ID to log today's session
            </div>
          )}
        </div>

        {/* Recent Session Logs / Cover Story Feed */}
        <div className="bg-[#0d0a17]/90 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl flex flex-col">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-4 pb-3 border-b border-white/10">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>{isMasked ? 'Study Log History' : 'Recent Check-in Notes'}</span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px]">
            {streakData.history.map((h, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 text-left space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{h.date}</span>
                  <span className="text-emerald-400 font-bold uppercase">{h.user}</span>
                </div>
                <p className="text-xs text-slate-200">
                  {isMasked ? 'Completed 3.5 hrs focus module & verified formula sheet.' : h.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
