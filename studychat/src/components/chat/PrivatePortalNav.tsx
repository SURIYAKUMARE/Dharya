import React from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { MessageSquare, Images, Clock, BookOpen } from 'lucide-react';

export const PrivatePortalNav: React.FC = () => {
  const { activeTab, switchTab, student } = useStudyApp();

  const isChat = activeTab === 'chat';
  const isGallery = activeTab === 'gallery';
  const isTimeline = activeTab === 'timeline';

  // Get total gallery items from local storage
  const galleryCount = (() => {
    try {
      const saved = localStorage.getItem('dharya_gallery_v2');
      if (saved) return JSON.parse(saved).length;
    } catch {}
    return 12;
  })();

  return (
    <header className="sticky top-0 z-40 bg-[#111b21]/95 backdrop-blur-xl border-b border-[#2a3942] px-3 sm:px-6 py-2 select-none">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Exit to Academic Study Portal */}
        <button
          onClick={() => switchTab('home')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-[#8696a0] hover:text-white transition-all text-xs font-semibold border border-[#2a3942] cursor-pointer active:scale-95 shrink-0"
          title="Exit to Open Library Study Portal"
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Study Library</span>
          <span className="sm:hidden">Library</span>
        </button>

        {/* Center: Dedicated Switcher (Chat vs Gallery vs Life Timeline) */}
        <div className="flex items-center p-1 rounded-2xl bg-[#202c33] border border-[#2a3942] shadow-inner gap-1">
          {/* Chat Tab */}
          <button
            onClick={() => switchTab('chat')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              isChat
                ? 'bg-[#00a884] text-white shadow-md scale-102'
                : 'text-[#8696a0] hover:text-[#e9edef] hover:bg-white/5'
            }`}
          >
            <MessageSquare className={`w-4 h-4 ${isChat ? 'stroke-[2.5]' : ''}`} />
            <span>Chat</span>
          </button>

          {/* Gallery Tab */}
          <button
            onClick={() => switchTab('gallery')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer relative ${
              isGallery
                ? 'bg-[#00a884] text-white shadow-md scale-102'
                : 'text-[#8696a0] hover:text-[#e9edef] hover:bg-white/5'
            }`}
          >
            <Images className={`w-4 h-4 ${isGallery ? 'stroke-[2.5]' : 'text-[#00a884]'}`} />
            <span>Gallery</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
              isGallery ? 'bg-black/30 text-white' : 'bg-[#111b21] text-[#00a884] border border-[#00a884]/30'
            }`}>
              {galleryCount}
            </span>
          </button>

          {/* Life Timeline Tab */}
          <button
            onClick={() => switchTab('timeline')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer relative ${
              isTimeline
                ? 'bg-[#00a884] text-white shadow-md scale-102'
                : 'text-[#8696a0] hover:text-[#e9edef] hover:bg-white/5'
            }`}
          >
            <Clock className={`w-4 h-4 ${isTimeline ? 'stroke-[2.5]' : 'text-amber-400'}`} />
            <span>Timeline</span>
          </button>
        </div>

        {/* Right: Active User Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#202c33] border border-[#2a3942] text-xs font-mono text-[#d1d7db]">
            <span className="w-2 h-2 rounded-full bg-[#00a884] animate-pulse" />
            <span className="font-semibold text-white capitalize">{student?.name || 'Surya'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
