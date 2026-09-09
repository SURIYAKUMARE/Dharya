import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMaskedFeature } from '../../hooks/useMaskedFeature';
import { Calendar, Clock, MapPin, Sparkles, CheckCircle, AlertCircle, Heart } from 'lucide-react';

interface ScheduleEvent {
  id: string;
  courseCode: string;
  publicExamName: string;
  publicVenue: string;
  publicDate: string;
  targetTimestamp: number;
  privatePlanName: string;
  privateVenue: string;
  privateNotes: string;
}

export const ExamScheduleTracker: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { isMasked, title, description, courseCode } = useMaskedFeature('schedule');

  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [events] = useState<ScheduleEvent[]>([
    {
      id: 'e1',
      courseCode: 'EXAM-301',
      publicExamName: 'Midterm Practicum IV: Matrix Calculus & Numerical Systems',
      publicVenue: 'Examination Hall 3 • Academic Block B',
      publicDate: 'In 3 days',
      targetTimestamp: Date.now() + 3 * 86400000 + 5 * 3600000,
      privatePlanName: 'Surprise Candlelight Dinner & Dessert Night 🍝🍰',
      privateVenue: 'Skyline Bistro & Terrace Garden',
      privateNotes: 'Table reserved for two. Dress warm for terrace stargazing afterwards!',
    },
    {
      id: 'e2',
      courseCode: 'LAB-204',
      publicExamName: 'Laboratory Defense: Algorithms & Complexity Analysis',
      publicVenue: 'Computing Research Wing • Room 104',
      publicDate: 'In 9 days',
      targetTimestamp: Date.now() + 9 * 86400000 + 2 * 3600000,
      privatePlanName: 'Weekend Beach Getaway & Sunset Walk 🌊🌅',
      privateVenue: 'Coastline Sands & Sea Breeze Promenade',
      privateNotes: 'Taking a long walk by the waves, packing our favorite snacks and music playlist.',
    },
    {
      id: 'e3',
      courseCode: 'VIVA-401',
      publicExamName: 'Comprehensive Viva Voce & Departmental Capstone',
      publicVenue: 'Senate Conference Hall',
      publicDate: 'In 24 days',
      targetTimestamp: Date.now() + 24 * 86400000 + 8 * 3600000,
      privatePlanName: 'Our Big Milestone Anniversary Celebration 💖🥂',
      privateVenue: 'Our Secret Favorite Spot',
      privateNotes: 'A whole day dedicated just to us, with handmade gifts and unforgettable smiles.',
    },
  ]);

  const formatCountdown = (target: number) => {
    const diff = Math.max(0, target - currentTime);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds };
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="bg-[#0d0a17]/90 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <Calendar className="w-4 h-4" />
            <span>{courseCode}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">{description}</p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-emerald-300">
          <Clock className="w-3.5 h-3.5" />
          <span>Live Timetable Sync</span>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {events.map((ev) => {
          const { days, hours, minutes, seconds } = formatCountdown(ev.targetTimestamp);
          return (
            <div
              key={ev.id}
              className="bg-[#0d0a17]/90 border border-white/10 hover:border-emerald-500/30 rounded-3xl p-6 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                    {ev.courseCode}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{isMasked ? ev.publicVenue : ev.privateVenue}</span>
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white">
                  {isMasked ? ev.publicExamName : ev.privatePlanName}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {isMasked
                    ? 'Admit card verification required 15 minutes prior to commencement. Calculators permitted.'
                    : ev.privateNotes}
                </p>
              </div>

              {/* Countdown Clocks */}
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-3 text-center self-stretch md:self-auto justify-center">
                <div className="px-2">
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">{days}</div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Days</div>
                </div>
                <div className="text-slate-500 font-bold">:</div>
                <div className="px-2">
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">{hours}</div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Hours</div>
                </div>
                <div className="text-slate-500 font-bold">:</div>
                <div className="px-2">
                  <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">{minutes}</div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Min</div>
                </div>
                <div className="text-slate-500 font-bold">:</div>
                <div className="px-2">
                  <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">{seconds}</div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Sec</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
