import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Images,
  FileText,
  FileAudio,
  Star,
  ShieldCheck,
  Heart,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Eye,
  EyeOff,
  Palette,
  Trash2,
  LogOut,
  Download,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  User,
  Clock,
  Sparkles,
  Check
} from 'lucide-react';
import { ExtendedChatMessage } from '../../services/supabaseClient';
import { THEMES, ThemeId } from '../../config/themes';

export type SidePanelMode = 'none' | 'search' | 'media' | 'info' | 'settings' | 'starred' | 'recycle';

interface ChatSidePanelProps {
  mode: SidePanelMode;
  onClose: () => void;
  isDark: boolean;
  activeTheme: any;
  partnerName: string;
  partnerUser: 'surya' | 'sadhana';
  currentUser: 'surya' | 'sadhana';
  isPartnerOnline: boolean;
  partnerLastSeen: number | null;
  messages: ExtendedChatMessage[];
  onJumpToMessage: (msgId: string) => void;
  onOpenLightbox?: (url: string, type: 'image' | 'video') => void;
  onToggleStar: (msgId: string) => void;
  onOpenDateCount: () => void;
  dateCount: { days: number; hours: number; minutes: number; seconds: number };
  onSelectTheme: (themeId: ThemeId) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  browserNotificationsEnabled: boolean;
  onRequestBrowserNotifications: () => void;
  hideNotificationPreview: boolean;
  onToggleHidePreview: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  readReceiptsEnabled: boolean;
  onToggleReadReceipts: () => void;
  shareLastSeen: boolean;
  onToggleShareLastSeen: () => void;
  onLogout: () => void;
  onOpenRecycleBinFull: () => void;
  onRestoreMessage?: (msgId: string) => void;
  onPermanentDeleteMessage?: (msgId: string) => void;
}

export const ChatSidePanel: React.FC<ChatSidePanelProps> = ({
  mode,
  onClose,
  isDark,
  activeTheme,
  partnerName,
  partnerUser,
  currentUser,
  isPartnerOnline,
  partnerLastSeen,
  messages,
  onJumpToMessage,
  onOpenLightbox,
  onToggleStar,
  onOpenDateCount,
  dateCount,
  onSelectTheme,
  soundEnabled,
  onToggleSound,
  browserNotificationsEnabled,
  onRequestBrowserNotifications,
  hideNotificationPreview,
  onToggleHidePreview,
  isMuted,
  onToggleMute,
  readReceiptsEnabled,
  onToggleReadReceipts,
  shareLastSeen,
  onToggleShareLastSeen,
  onLogout,
  onOpenRecycleBinFull,
  onRestoreMessage,
  onPermanentDeleteMessage,
}) => {
  // Search query in panel
  const [panelSearchQuery, setPanelSearchQuery] = useState('');

  // Media tab filter
  const [mediaTabFilter, setMediaTabFilter] = useState<'all' | 'media' | 'docs' | 'voice'>('all');

  // Search Results computation
  const searchResults = useMemo(() => {
    const q = panelSearchQuery.trim().toLowerCase();
    if (!q) return [];
    return messages.filter(
      (m) =>
        !m.deletedForAll &&
        (m.text?.toLowerCase().includes(q) ||
          m.documentName?.toLowerCase().includes(q) ||
          m.sender?.toLowerCase().includes(q))
    );
  }, [messages, panelSearchQuery]);

  // Starred messages
  const starredMessages = useMemo(() => {
    return messages.filter((m) => m.isStarred && !m.deletedForAll);
  }, [messages]);

  // Shared media computation
  const sharedMediaItems = useMemo(() => {
    return messages.filter((m) => {
      if (m.deletedForAll) return false;
      if (mediaTabFilter === 'media') {
        return m.type === 'image' || m.type === 'video' || (m.mediaUrl && !m.documentName);
      }
      if (mediaTabFilter === 'docs') {
        return m.type === 'document' || Boolean(m.documentName);
      }
      if (mediaTabFilter === 'voice') {
        return m.type === 'voice';
      }
      return m.type === 'image' || m.type === 'video' || m.type === 'document' || m.type === 'voice' || m.mediaUrl;
    });
  }, [messages, mediaTabFilter]);

  // Soft-deleted messages (if any)
  const deletedMessages = useMemo(() => {
    return messages.filter((m) => m.deletedFor?.includes(currentUser));
  }, [messages, currentUser]);

  if (mode === 'none') return null;

  const renderHeader = (title: string, icon: React.ReactNode) => (
    <div
      className={`h-[56px] md:h-[60px] px-4 flex items-center justify-between border-b shrink-0 transition-colors ${
        isDark ? 'bg-[#1f2c34] border-[#2a3942] text-[#e9edef]' : 'bg-[#f0f2f5] border-[#d1d7db] text-[#111b21]'
      }`}
    >
      <div className="flex items-center gap-2.5 font-semibold text-sm">
        {icon}
        <span>{title}</span>
      </div>
      <button
        onClick={onClose}
        className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
        title="Close side panel"
      >
        <X className="w-5 h-5 text-[#8696a0] hover:text-[#ECEEEB]" />
      </button>
    </div>
  );

  return (
    <aside
      className={`w-full sm:w-[380px] lg:w-[420px] h-full shrink-0 border-l flex flex-col z-40 transition-colors shadow-xl ${
        isDark ? 'bg-[#111b21] border-[#2a3942] text-[#e9edef]' : 'bg-[#ffffff] border-[#d1d7db] text-[#111b21]'
      }`}
    >
      {/* ── 1. SEARCH IN CONVERSATION ── */}
      {mode === 'search' && (
        <div className="flex flex-col h-full">
          {renderHeader('Search in Chat', <Search className="w-4 h-4 text-[#7E9F89]" />)}

          {/* Search Input Bar */}
          <div className="p-3 border-b border-inherit">
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all focus-within:ring-1 focus-within:ring-[#7E9F89] ${
                isDark ? 'bg-[#181c1b] border-[#2b332e] text-[#ECEEEB]' : 'bg-[#f0f2f5] border-[#d1d7db] text-[#111b21]'
              }`}
            >
              <Search className="w-4 h-4 text-[#8696a0]" />
              <input
                type="text"
                value={panelSearchQuery}
                onChange={(e) => setPanelSearchQuery(e.target.value)}
                placeholder="Search messages, files, dates..."
                className="w-full bg-transparent outline-none text-sm placeholder-[#707A72]"
                autoFocus
              />
              {panelSearchQuery && (
                <button
                  onClick={() => setPanelSearchQuery('')}
                  className="text-xs text-[#8696a0] hover:text-[#ECEEEB] p-0.5"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="text-[11px] text-[#8696a0] mt-1.5 px-1 font-mono">
              {panelSearchQuery
                ? `${searchResults.length} ${searchResults.length === 1 ? 'match' : 'matches'} found`
                : 'Type above to search full conversation history'}
            </div>
          </div>

          {/* Search Results List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {panelSearchQuery.trim() === '' ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-[#707A72]">
                <Search className="w-10 h-10 mb-2 opacity-30 text-[#7E9F89]" />
                <p className="text-sm font-medium">Search conversation</p>
                <p className="text-xs mt-1">Search for messages, notes, and shared moments with {partnerName}</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-[#707A72]">
                <p className="text-sm font-medium">No results found</p>
                <p className="text-xs mt-1">No messages match &ldquo;{panelSearchQuery}&rdquo;</p>
              </div>
            ) : (
              searchResults.map((msg) => {
                const isMe = msg.sender === currentUser;
                return (
                  <div
                    key={msg.id}
                    onClick={() => {
                      onJumpToMessage(msg.id);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer group hover:scale-[1.01] active:scale-[0.99] ${
                      isDark
                        ? 'bg-[#181c1b] border-[#262c28] hover:border-[#4E6B58] text-[#ECEEEB]'
                        : 'bg-[#fafafa] border-[#e5e5e5] hover:border-[#7E9F89] text-[#111b21]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={`font-semibold ${isMe ? 'text-[#7E9F89]' : 'text-[#D48D98]'}`}>
                        {isMe ? 'You' : partnerName}
                      </span>
                      <span className="text-[10px] text-[#707A72] font-mono">{msg.time}</span>
                    </div>
                    <p className="text-xs text-[#A3ADA5] line-clamp-2 leading-relaxed">
                      {msg.text || (msg.type === 'document' ? `📄 ${msg.documentName}` : msg.type || 'Attachment')}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── 2. SHARED MEDIA & DOCUMENTS ── */}
      {mode === 'media' && (
        <div className="flex flex-col h-full">
          {renderHeader('Shared Media & Docs', <Images className="w-4 h-4 text-[#7E9F89]" />)}

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 p-2.5 border-b border-inherit overflow-x-auto text-xs">
            {(
              [
                { id: 'all', label: 'All', icon: <Sparkles className="w-3 h-3" /> },
                { id: 'media', label: 'Photos & Videos', icon: <Images className="w-3 h-3" /> },
                { id: 'docs', label: 'Documents', icon: <FileText className="w-3 h-3" /> },
                { id: 'voice', label: 'Voice Notes', icon: <FileAudio className="w-3 h-3" /> },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMediaTabFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap text-xs ${
                  mediaTabFilter === tab.id
                    ? 'bg-[#4E6B58] text-white shadow-xs'
                    : isDark
                    ? 'bg-[#181c1b] text-[#A3ADA5] hover:bg-[#202622] hover:text-[#ECEEEB]'
                    : 'bg-[#f0f2f5] text-[#555E58] hover:bg-[#e4e6eb]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Items Content */}
          <div className="flex-1 overflow-y-auto p-3">
            {sharedMediaItems.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-[#707A72]">
                <Images className="w-10 h-10 mb-2 opacity-30 text-[#7E9F89]" />
                <p className="text-sm font-medium">No media found</p>
                <p className="text-xs mt-1">Photos, videos, and documents you share will appear here</p>
              </div>
            ) : mediaTabFilter === 'media' || mediaTabFilter === 'all' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {sharedMediaItems
                    .filter((m) => m.type === 'image' || m.type === 'video' || (m.mediaUrl && !m.documentName))
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (item.mediaUrl && onOpenLightbox) {
                            onOpenLightbox(item.mediaUrl, item.type === 'video' ? 'video' : 'image');
                          } else {
                            onJumpToMessage(item.id);
                          }
                        }}
                        className="aspect-square rounded-xl overflow-hidden bg-black/40 border border-white/5 relative group cursor-pointer shadow-xs"
                      >
                        {item.type === 'video' ? (
                          <div className="w-full h-full flex items-center justify-center bg-black/60">
                            <span className="text-xs font-mono text-white/80">🎬 Video</span>
                          </div>
                        ) : (
                          <img
                            src={item.mediaUrl || item.thumbnailUrl}
                            alt="Shared"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        )}
                        <span className="absolute bottom-1 right-1 text-[9px] font-mono px-1 rounded bg-black/60 text-white/90">
                          {item.time}
                        </span>
                      </div>
                    ))}
                </div>

                {/* Documents Section if any */}
                {sharedMediaItems.filter((m) => m.type === 'document' || Boolean(m.documentName)).length > 0 && (
                  <div className="pt-3 border-t border-inherit space-y-2">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#707A72]">
                      Files &amp; Documents
                    </div>
                    {sharedMediaItems
                      .filter((m) => m.type === 'document' || Boolean(m.documentName))
                      .map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => onJumpToMessage(doc.id)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                            isDark
                              ? 'bg-[#181c1b] border-[#262c28] hover:border-[#4E6B58]'
                              : 'bg-[#fafafa] border-[#e5e5e5] hover:border-[#7E9F89]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[#4E6B58]/20 text-[#7E9F89] flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate">{doc.documentName || doc.text || 'Document'}</p>
                              <p className="text-[10px] text-[#707A72] font-mono">{doc.documentSize || doc.time}</p>
                            </div>
                          </div>
                          {doc.mediaUrl && (
                            <a
                              href={doc.mediaUrl}
                              download={doc.documentName || 'attachment'}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-[#7E9F89]"
                              title="Download document"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {sharedMediaItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onJumpToMessage(item.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isDark
                        ? 'bg-[#181c1b] border-[#262c28] hover:border-[#4E6B58]'
                        : 'bg-[#fafafa] border-[#e5e5e5] hover:border-[#7E9F89]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#4E6B58]/20 text-[#7E9F89] flex items-center justify-center shrink-0">
                        {item.type === 'voice' ? <FileAudio className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">
                          {item.type === 'voice' ? `Voice Note (${item.duration || '0:05'})` : item.documentName || item.text}
                        </p>
                        <p className="text-[10px] text-[#707A72] font-mono">{item.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 3. CONTACT & CONVERSATION INFO ── */}
      {mode === 'info' && (
        <div className="flex flex-col h-full overflow-y-auto">
          {renderHeader('Contact Info', <User className="w-4 h-4 text-[#7E9F89]" />)}

          <div className="p-6 text-center space-y-4 border-b border-inherit">
            <div className="relative inline-block">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-xl ring-2 ${
                  partnerUser === 'surya'
                    ? 'bg-gradient-to-tr from-[#3D5545] to-[#7E9F89] ring-[#7E9F89]/40'
                    : 'bg-gradient-to-tr from-[#7A4B53] to-[#D48D98] ring-[#D48D98]/40'
                }`}
              >
                {partnerName[0]}
              </div>
              {isPartnerOnline && (
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#7E9F89] border-2 border-[#111b21] shadow-xs" />
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold">{partnerName}</h3>
              <p className="text-xs text-[#7E9F89] font-medium mt-0.5">
                {isPartnerOnline ? 'Online now' : 'Private Connection'}
              </p>
              <p className="text-[11px] text-[#707A72] font-mono mt-1">
                {partnerUser === 'surya' ? 'Student ID: ENG-2024-0910' : 'Student ID: ENG-2024-2902'}
              </p>
            </div>
          </div>

          {/* Romantic Milestone Date Counter Card */}
          <div className="p-4 space-y-3 border-b border-inherit">
            <div
              onClick={onOpenDateCount}
              className={`p-4 rounded-2xl border transition-all cursor-pointer group shadow-sm ${
                isDark
                  ? 'bg-[#1b191a] border-[#38262b] hover:border-[#D48D98]/50'
                  : 'bg-[#FDF4F5] border-[#F0D5D8] hover:border-[#D48D98]'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold text-[#D48D98]">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 fill-current animate-pulse" />
                  <span>Milestone Countdown</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#D48D98]/20">
                  20 May 2026, 7:30
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-2 font-mono">
                <span className="text-2xl font-bold text-[#D48D98]">{dateCount.days}</span>
                <span className="text-xs text-inherit font-sans">Days</span>
                <span className="text-xs text-[#A3ADA5]">
                  {String(dateCount.hours).padStart(2, '0')}h {String(dateCount.minutes).padStart(2, '0')}m{' '}
                  {String(dateCount.seconds).padStart(2, '0')}s
                </span>
              </div>
              <p className="text-[10px] text-[#707A72] mt-1.5">
                Click to open romantic ticker breakdown and celebratory share card
              </p>
            </div>
          </div>

          {/* Security & Verification Details */}
          <div className="p-4 space-y-3 border-b border-inherit text-xs">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-black/10 dark:bg-white/5 border border-inherit">
              <ShieldCheck className="w-5 h-5 text-[#7E9F89] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Transport Security &amp; Isolation</p>
                <p className="text-[#707A72] text-[11px] mt-0.5 leading-relaxed">
                  Encrypted in transit via TLS 1.3 cryptographic ciphers. Database storage is protected by PostgreSQL Row-Level Security (RLS) guaranteeing access strictly between Surya and Sadhana.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4 space-y-2 text-xs">
            <button
              onClick={() => onOpenRecycleBinFull()}
              className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                isDark ? 'bg-[#181c1b] border-[#262c28] hover:border-[#4E6B58]' : 'bg-[#fafafa] border-[#e5e5e5]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Universal Recycle Bin</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#707A72]" />
            </button>
          </div>
        </div>
      )}

      {/* ── 4. SETTINGS & PRIVACY ── */}
      {mode === 'settings' && (
        <div className="flex flex-col h-full overflow-y-auto">
          {renderHeader('Settings & Privacy', <Palette className="w-4 h-4 text-[#7E9F89]" />)}

          <div className="p-4 space-y-5">
            {/* Theme Selector */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#707A72] flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#7E9F89]" />
                <span>Appearance &amp; Theme</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(Object.keys(THEMES) as ThemeId[]).slice(0, 6).map((tId) => {
                  const th = THEMES[tId];
                  const isSelected = activeTheme.id === tId;
                  return (
                    <button
                      key={tId}
                      onClick={() => onSelectTheme(tId)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#7E9F89] bg-[#7E9F89]/15 text-[#ECEEEB] shadow-xs'
                          : isDark
                          ? 'border-[#262c28] bg-[#181c1b] text-[#A3ADA5] hover:border-[#38423b]'
                          : 'border-[#e5e5e5] bg-[#fafafa] text-[#555E58] hover:border-[#7E9F89]'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: th.bubbleOutgoing }}
                      />
                      <span className="truncate font-medium">{th.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#7E9F89] ml-auto shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="space-y-2.5 pt-3 border-t border-inherit">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#707A72] flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-[#7E9F89]" />
                <span>Notifications</span>
              </div>

              {/* Sound Chime Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-inherit text-xs">
                <div className="flex items-center gap-2.5">
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-[#7E9F89]" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-[#707A72]" />
                  )}
                  <div>
                    <p className="font-semibold">Synthesized Web Audio Chime</p>
                    <p className="text-[10px] text-[#707A72]">Plays audio chime on incoming messages</p>
                  </div>
                </div>
                <button
                  onClick={onToggleSound}
                  className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                    soundEnabled ? 'bg-[#4E6B58]' : 'bg-[#333a36]'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      soundEnabled ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Conversation Mute Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-inherit text-xs">
                <div className="flex items-center gap-2.5">
                  {isMuted ? (
                    <BellOff className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Bell className="w-4 h-4 text-[#7E9F89]" />
                  )}
                  <div>
                    <p className="font-semibold">Mute Conversation</p>
                    <p className="text-[10px] text-[#707A72]">Silences sounds and notifications</p>
                  </div>
                </div>
                <button
                  onClick={onToggleMute}
                  className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                    isMuted ? 'bg-amber-600' : 'bg-[#333a36]'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      isMuted ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Browser Push Notifications */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-inherit text-xs">
                <div>
                  <p className="font-semibold">Browser Push Notifications</p>
                  <p className="text-[10px] text-[#707A72]">
                    {browserNotificationsEnabled ? 'Permission granted' : 'Click to enable desktop alerts'}
                  </p>
                </div>
                <button
                  onClick={onRequestBrowserNotifications}
                  className="px-3 py-1.5 rounded-lg bg-[#4E6B58] text-white font-medium text-xs hover:bg-[#3D5545] transition-colors cursor-pointer"
                >
                  {browserNotificationsEnabled ? 'Enabled' : 'Enable'}
                </button>
              </div>
            </div>

            {/* Privacy Controls */}
            <div className="space-y-2.5 pt-3 border-t border-inherit">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#707A72] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#7E9F89]" />
                <span>Privacy &amp; Receipts</span>
              </div>

              {/* Read Receipts Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-inherit text-xs">
                <div>
                  <p className="font-semibold">Read Receipts (Blue Ticks)</p>
                  <p className="text-[10px] text-[#707A72]">Acknowledge when messages have been viewed</p>
                </div>
                <button
                  onClick={onToggleReadReceipts}
                  className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                    readReceiptsEnabled ? 'bg-[#4E6B58]' : 'bg-[#333a36]'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      readReceiptsEnabled ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Last Seen Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-inherit text-xs">
                <div>
                  <p className="font-semibold">Share Last Seen &amp; Presence</p>
                  <p className="text-[10px] text-[#707A72]">Broadcast online status and inactivity timer</p>
                </div>
                <button
                  onClick={onToggleShareLastSeen}
                  className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                    shareLastSeen ? 'bg-[#4E6B58]' : 'bg-[#333a36]'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      shareLastSeen ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Session & Sign Out */}
            <div className="pt-3 border-t border-inherit space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#707A72]">
                Active Session
              </div>
              <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-inherit text-xs space-y-1">
                <p className="font-medium">Signed in as <span className="capitalize font-bold text-[#7E9F89]">{currentUser}</span></p>
                <p className="text-[11px] text-[#707A72] font-mono">Platform: Web / Single-Page Application</p>
              </div>
              <button
                onClick={onLogout}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Dharya</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. STARRED MESSAGES ── */}
      {mode === 'starred' && (
        <div className="flex flex-col h-full">
          {renderHeader('Starred Messages', <Star className="w-4 h-4 text-amber-400 fill-amber-400" />)}

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {starredMessages.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-[#707A72]">
                <Star className="w-10 h-10 mb-2 opacity-30 text-amber-400" />
                <p className="text-sm font-medium">No starred messages</p>
                <p className="text-xs mt-1">Tap the star icon on any message to pin it here for quick reference</p>
              </div>
            ) : (
              starredMessages.map((msg) => {
                const isMe = msg.sender === currentUser;
                return (
                  <div
                    key={msg.id}
                    onClick={() => onJumpToMessage(msg.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer group hover:scale-[1.01] active:scale-[0.99] relative ${
                      isDark
                        ? 'bg-[#181c1b] border-[#262c28] hover:border-amber-400/40 text-[#ECEEEB]'
                        : 'bg-[#fafafa] border-[#e5e5e5] hover:border-amber-500 text-[#111b21]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={`font-semibold ${isMe ? 'text-[#7E9F89]' : 'text-[#D48D98]'}`}>
                        {isMe ? 'You' : partnerName}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#707A72] font-mono">{msg.time}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleStar(msg.id);
                          }}
                          className="p-1 rounded-full text-amber-400 hover:bg-black/10 dark:hover:bg-white/10"
                          title="Unstar message"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-[#A3ADA5] line-clamp-3 leading-relaxed">
                      {msg.text || (msg.type === 'document' ? `📄 ${msg.documentName}` : msg.type || 'Attachment')}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
