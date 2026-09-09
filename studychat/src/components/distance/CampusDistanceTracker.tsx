import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMaskedFeature } from '../../hooks/useMaskedFeature';
import { Compass, Radio, MapPin, Heart, Wifi, Navigation, RefreshCw } from 'lucide-react';

export const CampusDistanceTracker: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { isMasked, title, description, courseCode } = useMaskedFeature('location');

  // Hardcoded believable coordinates or distance
  const [distanceKm, setDistanceKm] = useState(14.8);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncDistance = () => {
    setIsSyncing(true);
    setTimeout(() => {
      // Fluctuate slightly to feel live
      const variation = +(14.5 + Math.random() * 0.8).toFixed(1);
      setDistanceKm(variation);
      setIsSyncing(false);
    }, 1200);
  };

  const partnerName = currentUser?.partnerName || 'Partner';
  const partnerEmoji = currentUser?.partnerEmoji || '❤️';

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="bg-[#0d0a17]/90 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <Compass className="w-4 h-4" />
            <span>{courseCode}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">{description}</p>
        </div>

        <button
          onClick={handleSyncDistance}
          disabled={isSyncing}
          className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-mono text-emerald-300 flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing…' : 'Ping Telemetry'}</span>
        </button>
      </div>

      {/* Main Distance Card */}
      <div className="bg-[#0d0a17]/90 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Background Radar Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-64 h-64 rounded-full border border-emerald-500/30 animate-ping" />
          <div className="w-96 h-96 rounded-full border border-emerald-500/20" />
        </div>

        {/* Pulse Beacon Indicator */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
            <Radio className="w-10 h-10 animate-pulse" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 shadow-[0_0_12px_#10b981]" />
        </div>

        {/* Distance Value */}
        <div className="space-y-1 mb-6">
          <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-white font-mono">
            {distanceKm} km
          </div>
          <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            {isMasked ? 'Inter-Campus Network Telemetry Link' : `Distance Between Surya & ${partnerName}`}
          </p>
        </div>

        {/* Informational Box */}
        <div className="w-full max-w-md p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 leading-relaxed space-y-2">
          {isMasked ? (
            <div className="font-mono text-[11px] text-slate-400 space-y-1 text-left">
              <div className="flex justify-between">
                <span>NODE ORIGIN:</span>
                <span className="text-emerald-400 font-bold">CAMPUS-NORTH (LAT 13.0827)</span>
              </div>
              <div className="flex justify-between">
                <span>NODE TARGET:</span>
                <span className="text-emerald-400 font-bold">CAMPUS-SOUTH (LAT 13.0381)</span>
              </div>
              <div className="flex justify-between">
                <span>SIGNAL LATENCY:</span>
                <span className="text-white">4.2 ms • Bandwidth 1 Gbps</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-emerald-300 font-semibold">
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                <span>Two hearts beating in real-time sync</span>
              </div>
              <p className="text-slate-300 italic text-[11px]">
                "Distance only means so little when someone means so much."
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
