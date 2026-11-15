import React from 'react';
import { Gift, Zap, Trophy, Award, Sparkles, CheckCircle2 } from 'lucide-react';

export const RewardsView: React.FC = () => {
  const badges = [
    { title: 'Algorithm Prodigy', desc: 'Solved 300+ advanced coding problems', icon: '⚡', color: 'from-amber-400 to-orange-500', unlocked: true },
    { title: 'Streak Titan', desc: 'Maintained a 30-day continuous solving streak', icon: '🔥', color: 'from-rose-500 to-pink-600', unlocked: true },
    { title: 'GATE Ranker', desc: 'Scored above 90% in accredited mock exams', icon: '🏆', color: 'from-blue-500 to-indigo-600', unlocked: true },
    { title: 'Full Stack Master', desc: 'Successfully deployed 5 production microservices', icon: '🚀', color: 'from-purple-500 to-indigo-600', unlocked: true },
    { title: 'System Architect', desc: 'Completed Low-Level Design & High-Level Design tracks', icon: '🏛️', color: 'from-emerald-400 to-teal-600', unlocked: false }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0875E1] to-[#07549A] text-white p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">Achievements</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif mt-1">Rewards &amp; Karma Points</h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            Redeem accumulated points for 1-on-1 mock interviews, course vouchers, and verified certifications.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur border border-white/20 p-4 rounded-2xl text-center self-start sm:self-auto">
          <div className="text-xs uppercase text-blue-200 font-mono">Available Points</div>
          <div className="text-3xl font-black font-mono text-amber-300">8,019</div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[#172B4D]">Earned Badges &amp; Accreditations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((b, i) => (
            <div
              key={i}
              className={`p-5 rounded-3xl border transition-all flex items-start gap-4 ${
                b.unlocked ? 'bg-white border-[#E2E8F0] shadow-xs' : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${b.color} text-2xl flex items-center justify-center shrink-0 shadow-sm`}
              >
                {b.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#172B4D]">{b.title}</h4>
                  {b.unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{b.desc}</p>
                <div className="mt-2 text-[10px] font-mono font-bold text-amber-600">
                  {b.unlocked ? 'Unlocked • +500 pts' : 'In Progress (80%)'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
