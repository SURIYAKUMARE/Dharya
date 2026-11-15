import React, { useState } from 'react';
import { VideoResource } from '../../data/bookMediaResources';
import {
  Play,
  Youtube,
  Clock,
  ExternalLink,
  Sparkles,
  Layers,
  GraduationCap,
  ListVideo,
  ChevronRight
} from 'lucide-react';

interface BookVideoPlayerProps {
  videos: VideoResource[];
  bookTitle?: string;
}

export const BookVideoPlayer: React.FC<BookVideoPlayerProps> = ({ videos, bookTitle }) => {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const activeVideo = videos[activeVideoIndex] || videos[0];

  if (!videos || videos.length === 0) return null;

  return (
    <div className="rounded-3xl bg-white border border-[#E5DFD5] shadow-sm overflow-hidden space-y-0">
      {/* Header Bar */}
      <div className="px-6 py-4.5 bg-gradient-to-r from-red-500/5 via-orange-500/5 to-transparent border-b border-[#E8E2D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/20 shrink-0">
            <Youtube className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                Curated Video Lectures ({videos.length})
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">•</span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                NPTEL, MIT OCW &amp; Top Educators
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold font-serif text-[#0F172A] mt-0.5">
              Interactive Video Masterclasses
            </h3>
          </div>
        </div>

        <a
          href={`https://www.youtube.com/watch?v=${activeVideo.youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-red-600 transition-all shadow-2xs self-start sm:self-auto"
        >
          <span>Open on YouTube</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Main Video Screen Area (8 cols) */}
        <div className="lg:col-span-8 p-4 sm:p-6 lg:border-r border-[#E8E2D8] space-y-4">
          {/* Responsive 16:9 Video Embed */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg border border-black/10">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?autoplay=0&rel=0&modestbranding=1`}
              title={activeVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {/* Active Video Meta Details */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {activeVideo.topicTag}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{activeVideo.duration}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-[#0F172A]">
                {activeVideo.channel}
              </span>
              {activeVideo.institution && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500">
                    {activeVideo.institution}
                  </span>
                </>
              )}
            </div>

            <h4 className="text-base sm:text-xl font-bold text-[#0F172A] font-serif leading-snug">
              {activeVideo.title}
            </h4>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {activeVideo.description}
            </p>

            {/* Video Chapters / Timestamps */}
            {activeVideo.timestamps && activeVideo.timestamps.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] space-y-2">
                <div className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ListVideo className="w-3.5 h-3.5 text-red-500" />
                  <span>Key Video Timestamps &amp; Chapters</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeVideo.timestamps.map((ts, idx) => (
                    <a
                      key={idx}
                      href={`https://www.youtube.com/watch?v=${activeVideo.youtubeId}&t=${ts.time.replace(':', 'm')}s`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-white hover:bg-red-50/60 border border-slate-200/80 text-xs flex items-center justify-between gap-2 text-slate-700 hover:text-red-700 transition-all shadow-2xs group"
                    >
                      <span className="truncate font-medium">{ts.label}</span>
                      <span className="font-mono text-[10px] font-bold text-red-600 px-1.5 py-0.5 rounded bg-red-50 border border-red-200 shrink-0">
                        {ts.time}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Playlist Drawer (4 cols) */}
        <div className="lg:col-span-4 p-4 sm:p-6 bg-[#FAF8F5]/80 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ListVideo className="w-4 h-4 text-red-500" />
              <span>Video Playlist</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {activeVideoIndex + 1} / {videos.length}
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[480px] pr-1">
            {videos.map((vid, idx) => {
              const isSelected = activeVideoIndex === idx;
              return (
                <button
                  key={vid.id}
                  onClick={() => setActiveVideoIndex(idx)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-white border-red-300 shadow-md ring-2 ring-red-500/20'
                      : 'bg-white/70 hover:bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="relative w-16 h-12 rounded-xl bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center text-white shadow-2xs">
                    <img
                      src={`https://img.youtube.com/vi/${vid.youtubeId}/mqdefault.jpg`}
                      alt={vid.title}
                      className="w-full h-full object-cover opacity-85"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play className="w-4 h-4 fill-white text-white drop-shadow" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] font-mono font-bold text-red-600 uppercase truncate">
                        {vid.channel}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {vid.duration}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">
                      {vid.title}
                    </h5>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-3 border-t border-[#E8E2D8] text-[11px] text-slate-500 font-mono">
            💡 Tip: Embedded videos run in ad-free privacy enhanced mode without tracking.
          </div>
        </div>
      </div>
    </div>
  );
};
