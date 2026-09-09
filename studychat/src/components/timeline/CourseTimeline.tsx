import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMaskedFeature } from '../../hooks/useMaskedFeature';
import { GitBranch, CheckCircle2, Lock, Sparkles, Plus, Calendar, Bookmark, Heart } from 'lucide-react';

interface Milestone {
  id: string;
  moduleCode: string;
  publicTitle: string;
  publicSummary: string;
  publicDate: string;
  privateTitle: string;
  privateNote: string;
  privateDate: string;
  tag: string;
  completed: boolean;
}

export const CourseTimeline: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { isMasked, title, description, courseCode } = useMaskedFeature('modules');

  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: 'm1',
      moduleCode: 'MOD-01',
      publicTitle: 'Curriculum Foundations & Orientation',
      publicSummary: 'Completed fundamental coursework in matrix theory and mathematical transforms.',
      publicDate: 'Oct 09, 2024',
      privateTitle: 'The Day Our Journey Began 🌿❤️',
      privateNote: 'The exact day our private world sparked into life. Everything became brighter and full of meaning.',
      privateDate: 'October 09',
      tag: 'First Day',
      completed: true,
    },
    {
      id: 'm2',
      moduleCode: 'MOD-02',
      publicTitle: 'Applied Laboratory Practicum & Fieldwork',
      publicSummary: 'Hands-on collaborative problem solving and laboratory data acquisition.',
      publicDate: 'Dec 24, 2024',
      privateTitle: 'Our First Long Evening Walk & Coffee ☕',
      privateNote: 'Cold winter breeze, warm hot chocolate, and endless conversations where time just melted away.',
      privateDate: 'December 24',
      tag: 'Special Memory',
      completed: true,
    },
    {
      id: 'm3',
      moduleCode: 'MOD-03',
      publicTitle: 'Midterm Research Colloquium & Synthesis',
      publicSummary: 'Departmental review of algorithmic optimizations and graph traversal models.',
      publicDate: 'Feb 29, 2025',
      privateTitle: 'Sadhana’s Special Leap Birthday Celebration ✨🎂',
      privateNote: 'Celebrating your rare and beautiful day with surprise letters and unforgettable smiles.',
      privateDate: 'February 29',
      tag: 'Birthday',
      completed: true,
    },
    {
      id: 'm4',
      moduleCode: 'MOD-04',
      publicTitle: 'Advanced Capstone Integration & Field Deployment',
      publicSummary: 'Final comprehensive architecture deployment and collaborative review session.',
      publicDate: 'Upcoming',
      privateTitle: 'Our Next Big Adventure & Anniversary Getaway 🏖️',
      privateNote: 'Counting down the days until our next holiday together. The best chapters are yet to be written.',
      privateDate: 'Coming Soon',
      tag: 'Future Dream',
      completed: false,
    },
  ]);

  const [activeItem, setActiveItem] = useState<string | null>('m1');

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="bg-[#0d0a17]/90 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <GitBranch className="w-4 h-4" />
            <span>{courseCode}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">{description}</p>
        </div>

        {/* Syllabus Progress Bar */}
        <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-right">
          <div className="text-[10px] text-slate-400 font-mono">SEMESTER PROGRESS</div>
          <div className="text-lg font-black text-emerald-400">75% Completed</div>
        </div>
      </div>

      {/* Chronological Milestone Feed */}
      <div className="relative pl-6 sm:pl-8 border-l border-white/10 space-y-6">
        {milestones.map((m, idx) => {
          const isExpanded = activeItem === m.id;
          return (
            <div key={m.id} className="relative group">
              {/* Timeline Node Dot */}
              <div
                className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] transition-all ${
                  m.completed
                    ? 'bg-emerald-500 border-emerald-300 text-black font-bold shadow-[0_0_10px_#10b981]'
                    : 'bg-[#0A0A0F] border-slate-600 text-slate-400'
                }`}
              >
                {m.completed ? '✓' : idx + 1}
              </div>

              {/* Milestone Card */}
              <div
                onClick={() => setActiveItem(isExpanded ? null : m.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer backdrop-blur-xl ${
                  isExpanded
                    ? 'bg-white/10 border-emerald-500/40 shadow-xl'
                    : 'bg-[#0d0a17]/80 border-white/10 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-slate-300 border border-white/10">
                    {m.moduleCode}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{isMasked ? m.publicDate : m.privateDate}</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1">
                  {isMasked ? m.publicTitle : m.privateTitle}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isMasked ? m.publicSummary : isExpanded ? m.privateNote : m.publicSummary}
                </p>

                {/* Authenticated Expansion Details */}
                {!isMasked && isExpanded && (
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-emerald-300 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                      <span>{m.tag}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">Surya &amp; Sadhana Milestone</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
