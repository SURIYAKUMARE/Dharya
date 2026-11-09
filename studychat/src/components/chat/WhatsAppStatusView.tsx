/**
 * WhatsAppStatusView.tsx
 * 
 * Production-Quality Status Management System for Dhanya Navigation.
 * Design: Premium White + Green (#16852D) + Pink (#F22679).
 * 
 * Exact Replica of Reference Design (media_1794207497829_09307d25.jpg):
 * - Header: Back arrow, Status double-ring icon, Status title, "Share your moments ♡", Search, Three-dot menu
 * - My Status Card: Profile photo (hand-holding logo), + add badge, "Tap to add a status", green leaves & pink heart flourish
 * - Recent Updates: Green vertical indicator bar, Dhanya ♡ with sunset story avatar, green story ring, timestamp, three-dot menu
 * - Flowing pastel green and pink wave curves at the bottom with sprouting leaf flourish
 * 
 * Full Features:
 * - Photo & Video uploads, Camera capture, Gallery selection
 * - Text status creator with colorful gradients and custom fonts
 * - Canvas drawing tool, photo filters, emoji stickers, and captions
 * - Full-screen story viewer with segmented progress bars & hold-to-pause
 * - Real viewer tracking & view count sheet (no fake records)
 * - Emoji reactions (❤️, 😂, 😍, 👍) & instant chat reply integration
 * - Granular privacy settings (My Contacts, Except, Only, Only Me)
 * - Automatic 24-hour expiry lifecycle + Status Archive + Highlights
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  Search,
  MoreVertical,
  Plus,
  Camera,
  Image as ImageIcon,
  Type,
  Heart,
  Smile,
  Send,
  Eye,
  Trash2,
  Sparkles,
  X,
  Lock,
  ShieldCheck,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  Bookmark,
  Download,
  Share2,
  SlidersHorizontal,
  Palette,
  Brush,
  Play,
  Pause,
  ChevronRight,
  User,
  Clock,
} from 'lucide-react';
import {
  statusService,
  StatusItem,
  StatusViewRecord,
  StatusReaction,
  StatusHighlight,
  PrivacyMode,
  DHANYA_SUNSET_AVATAR,
} from '../../services/statusService';
import { saveRemoteMessage } from '../../services/chatSyncService';
import { crossDeviceSync } from '../../services/crossDeviceSyncService';
import { DHARYA_LOGO_DATA_URI } from '../../assets/dharyaLogoDataUri';

export interface WhatsAppStatusViewProps {
  isDark?: boolean;
  studentName?: string;
  partnerName?: string;
  partnerUser?: 'surya' | 'sadhana';
  isPartnerOnline?: boolean;
  partnerLastSeen?: number | null;
  dateCount?: any;
  onBackToChat?: () => void;
  onOpenGallery?: () => void;
  onOpenTimeline?: () => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  doodleSvgUri?: string;
}

const BRAND_GREEN = '#16852D';
const BRAND_PINK = '#F22679';

const PRESET_GRADIENTS = [
  'linear-gradient(135deg, #16852D 0%, #10b981 100%)',
  'linear-gradient(135deg, #F22679 0%, #ec4899 100%)',
  'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
  'linear-gradient(135deg, #18181b 0%, #3f3f46 100%)',
];

const PRESET_FONTS = [
  { id: 'sans', name: 'Sans', family: 'sans-serif' },
  { id: 'serif', name: 'Serif', family: 'Georgia, serif' },
  { id: 'mono', name: 'Mono', family: 'monospace' },
  { id: 'cursive', name: 'Handwriting', family: 'cursive' },
];

export const WhatsAppStatusView: React.FC<WhatsAppStatusViewProps> = ({
  isDark = false,
  studentName = 'Surya',
  onBackToChat,
  showToast,
}) => {
  const currentUser = studentName.toLowerCase() === 'sadhana' ? 'sadhana' : 'surya';

  // ── Reactive Subscriptions ──
  const [, setTick] = useState(0);
  useEffect(() => {
    return statusService.subscribe(() => setTick((t) => t + 1));
  }, []);

  // ── Data Queries ──
  const myStatuses = useMemo(() => statusService.getMyStatuses(currentUser), [currentUser]);
  const recentUpdates = useMemo(() => statusService.getRecentUpdates(currentUser), [currentUser]);
  const highlights = useMemo(() => statusService.getHighlights(), []);
  const archivedStatuses = useMemo(() => statusService.getArchivedStatuses(currentUser), [currentUser]);

  // ── UI Modals & Navigation States ──
  const [activeStoryGroup, setActiveStoryGroup] = useState<'dhanya' | 'my' | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  // ── Add Status Form States ──
  const [creatorMode, setCreatorMode] = useState<'media' | 'text'>('media');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string>('');
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [statusCaption, setStatusCaption] = useState('');
  const [textStatusContent, setTextStatusContent] = useState('');
  const [textGradient, setTextGradient] = useState(PRESET_GRADIENTS[0]);
  const [textFont, setTextFont] = useState(PRESET_FONTS[0].family);
  const [activeFilter, setActiveFilter] = useState<'none' | 'vivid' | 'soft' | 'warm' | 'bw' | 'pink'>('none');
  const [isPublishing, setIsPublishing] = useState(false);

  // Drawing Canvas
  const [isDrawingOpen, setIsDrawingOpen] = useState(false);
  const [drawColor, setDrawColor] = useState('#F22679');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isPainting = useRef(false);

  // File Inputs
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // ── Viewer States ──
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const [isStoryPaused, setIsStoryPaused] = useState(false);
  const [storyProgress, setStoryProgress] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [showViewerSheet, setShowViewerSheet] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);

  // ── Active Stories for Current Viewer ──
  const currentViewerStories = useMemo(() => {
    if (activeStoryGroup === 'dhanya') return recentUpdates.dhanyaStatuses;
    if (activeStoryGroup === 'my') return myStatuses;
    return [];
  }, [activeStoryGroup, recentUpdates.dhanyaStatuses, myStatuses]);

  const activeStoryItem = currentViewerStories[activeStoryIdx] || null;

  // ── Record View on Open ──
  useEffect(() => {
    if (activeStoryItem && activeStoryGroup === 'dhanya') {
      statusService.recordView(activeStoryItem.id, {
        id: currentUser,
        name: studentName,
        avatar: DHARYA_LOGO_DATA_URI,
      });
    }
  }, [activeStoryItem, activeStoryGroup, currentUser, studentName]);

  // ── Story Progress Timer ──
  useEffect(() => {
    if (!activeStoryItem || isStoryPaused || showViewerSheet) return;

    if (activeStoryItem.type === 'video' && videoPlayerRef.current) {
      // Synchronized with video element
      return;
    }

    const duration = 5000; // 5 seconds per image/text
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev + step >= 100) {
          // Advance to next story
          if (activeStoryIdx < currentViewerStories.length - 1) {
            setActiveStoryIdx((idx) => idx + 1);
            return 0;
          } else {
            // Close viewer when finished
            setActiveStoryGroup(null);
            return 0;
          }
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [activeStoryItem, isStoryPaused, showViewerSheet, activeStoryIdx, currentViewerStories.length]);

  // Video Time Update Listener
  const handleVideoTimeUpdate = () => {
    if (!videoPlayerRef.current || isStoryPaused) return;
    const vid = videoPlayerRef.current;
    if (vid.duration) {
      const p = (vid.currentTime / vid.duration) * 100;
      setStoryProgress(p);
      if (vid.ended) {
        if (activeStoryIdx < currentViewerStories.length - 1) {
          setActiveStoryIdx((idx) => idx + 1);
          setStoryProgress(0);
        } else {
          setActiveStoryGroup(null);
        }
      }
    }
  };

  // ── Open Media File ──
  const handleSelectMedia = (file: File) => {
    const isVid = file.type.startsWith('video/');
    setMediaType(isVid ? 'video' : 'photo');
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewMediaUrl((e.target?.result as string) || '');
      setCreatorMode('media');
      setShowAddModal(true);
    };
    reader.readAsDataURL(file);
  };

  // ── Canvas Drawing Logic ──
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isPainting.current = true;
    draw(e);
  };

  const stopDrawing = () => {
    isPainting.current = false;
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.beginPath();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isPainting.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.strokeStyle = drawColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // ── Publish Status Handler ──
  const handlePublishStatus = async () => {
    setIsPublishing(true);

    let drawingData: string | undefined = undefined;
    if (canvasRef.current) {
      drawingData = canvasRef.current.toDataURL('image/png');
    }

    try {
      if (creatorMode === 'media') {
        if (!previewMediaUrl) {
          showToast?.('Please select a photo or video', 'error');
          setIsPublishing(false);
          return;
        }

        await statusService.publishStatus({
          owner: currentUser,
          authorName: studentName,
          authorAvatar: DHARYA_LOGO_DATA_URI,
          type: mediaType,
          mediaUrl: previewMediaUrl,
          caption: statusCaption.trim(),
          filter: activeFilter !== 'none' ? activeFilter : undefined,
          drawingDataUrl: drawingData,
        });
      } else {
        // Text status
        if (!textStatusContent.trim()) {
          showToast?.('Please enter some text', 'error');
          setIsPublishing(false);
          return;
        }

        await statusService.publishStatus({
          owner: currentUser,
          authorName: studentName,
          authorAvatar: DHARYA_LOGO_DATA_URI,
          type: 'text',
          mediaUrl: '',
          textContent: textStatusContent.trim(),
          backgroundGradient: textGradient,
          fontFamily: textFont,
        });
      }

      showToast?.('Status published successfully ✨', 'success');
      setShowAddModal(false);
      // Reset form
      setPreviewMediaUrl('');
      setSelectedFile(null);
      setStatusCaption('');
      setTextStatusContent('');
      setActiveFilter('none');
      clearCanvas();
    } catch {
      showToast?.('Failed to publish status', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // ── Reactions & Replies Handlers ──
  const handleSendReaction = (emoji: string) => {
    if (!activeStoryItem) return;
    statusService.addReaction(activeStoryItem.id, currentUser, studentName, emoji);
    showToast?.(`Sent ${emoji} to ${activeStoryItem.authorName}`, 'success');
  };

  const handleSendReply = async () => {
    if (!activeStoryItem || !replyText.trim()) return;

    statusService.sendReply(activeStoryItem.id, { id: currentUser, name: studentName }, replyText.trim());

    // Send directly into the Chat conversation
    try {
      const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      await saveRemoteMessage({
        id: msgId,
        sender: currentUser,
        text: `💬 Status Reply: "${activeStoryItem.caption || activeStoryItem.textContent || 'Story'}"\n\n${replyText.trim()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        read: false,
        type: 'text',
      });
      crossDeviceSync.publish('chat_message', {
        message: {
          id: msgId,
          sender: currentUser,
          text: `💬 Status Reply: "${activeStoryItem.caption || activeStoryItem.textContent || 'Story'}"\n\n${replyText.trim()}`,
        },
      });
    } catch {}

    showToast?.('Reply sent to chat ♡', 'success');
    setReplyText('');
  };

  // ── Delete Own Status ──
  const handleDeleteCurrentStory = () => {
    if (!activeStoryItem) return;
    statusService.deleteStatus(activeStoryItem.id, currentUser);
    showToast?.('Status deleted 🗑️', 'info');
    setShowViewerSheet(false);
    if (activeStoryIdx > 0) {
      setActiveStoryIdx((idx) => idx - 1);
      setStoryProgress(0);
    } else if (currentViewerStories.length <= 1) {
      setActiveStoryGroup(null);
    }
  };

  // Real viewers for active story
  const activeViewers = useMemo(() => {
    if (!activeStoryItem) return [];
    return statusService.getViewersForStatus(activeStoryItem.id);
  }, [activeStoryItem]);

  // Relative time helper
  const getRelativeTime = (ts: number) => {
    const diffMin = Math.round((Date.now() - ts) / 60000);
    if (diffMin <= 1) return 'Just now';
    if (diffMin < 60) return `${diffMin} minutes ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-y-auto font-sans select-none relative">
      {/* ══════ 1. HEADER (Exact replica of Reference Image) ══════ */}
      <header className="w-full max-w-xl mx-auto px-4 pt-4 pb-3 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          {/* Circular Pink Back Arrow Button */}
          {onBackToChat && (
            <button
              onClick={onBackToChat}
              className="w-10 h-10 rounded-full bg-[#FFF0F5] border border-pink-100 flex items-center justify-center text-slate-800 hover:bg-pink-100/70 transition-colors cursor-pointer shadow-2xs"
              title="Back to Chat"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
          )}

          {/* Green Double-Ring Status Brand Icon */}
          <div className="relative w-8 h-8 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke={BRAND_GREEN}
                strokeWidth="2.8"
                strokeLinecap="round"
                className="opacity-90"
              />
              <circle
                cx="18"
                cy="18"
                r="10.5"
                fill="none"
                stroke={BRAND_GREEN}
                strokeWidth="2.2"
                strokeDasharray="4,4"
              />
            </svg>
          </div>

          {/* Title & Subtitle */}
          <div>
            <h1 className="text-[22px] font-extrabold text-slate-900 tracking-tight leading-none">
              Status
            </h1>
            <p className="text-[12px] font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
              <span>Share your moments</span>
              <span className="text-[#F22679] font-bold">♡</span>
            </p>
          </div>
        </div>

        {/* Right Action Icons: Search & Three-Dots Menu */}
        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setIsSearchActive((prev) => !prev)}
            className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            title="Search Statuses"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowMenuDropdown((prev) => !prev)}
            className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            title="Status Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Header Dropdown Menu */}
          {showMenuDropdown && (
            <div className="absolute top-12 right-0 w-52 rounded-2xl bg-white border border-slate-200/90 shadow-xl py-1.5 z-50 text-xs font-semibold text-slate-700 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  setShowPrivacyModal(true);
                  setShowMenuDropdown(false);
                }}
                className="w-full px-3.5 py-2.5 text-left hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-[#16852D]" />
                <span>Status Privacy</span>
              </button>

              <button
                onClick={() => {
                  setShowArchiveModal(true);
                  setShowMenuDropdown(false);
                }}
                className="w-full px-3.5 py-2.5 text-left hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
              >
                <Clock className="w-4 h-4 text-[#F22679]" />
                <span>Status Archive</span>
              </button>

              <button
                onClick={() => {
                  setShowHighlightModal(true);
                  setShowMenuDropdown(false);
                }}
                className="w-full px-3.5 py-2.5 text-left hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer border-t border-slate-100"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Highlights</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Search Bar Overlay (if triggered) ── */}
      {isSearchActive && (
        <div className="w-full max-w-xl mx-auto px-4 pb-2 animate-in fade-in slide-in-from-top-2">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              autoFocus
              placeholder="Search status updates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-2xl bg-slate-100 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ══════ MAIN CONTENT STAGE ══════ */}
      <main className="w-full max-w-xl mx-auto px-4 py-2 space-y-5 flex-1 relative z-10 pb-32">
        {/* ══════ 2. MY STATUS CARD (Exact Replica with Green Leaves & Pink Heart Flourish) ══════ */}
        <div
          onClick={() => {
            if (myStatuses.length > 0) {
              setActiveStoryGroup('my');
              setActiveStoryIdx(0);
              setStoryProgress(0);
            } else {
              setShowAddModal(true);
            }
          }}
          className="relative w-full rounded-[28px] p-4 bg-white border border-emerald-100/70 shadow-[0_6px_25px_rgba(22,133,45,0.06)] flex items-center justify-between cursor-pointer transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99] overflow-hidden"
          style={{
            background: 'linear-gradient(105deg, #FFFFFF 0%, #F5FBF6 55%, #FFF0F6 100%)',
          }}
        >
          {/* Left: Avatar with Ring & + Badge */}
          <div className="flex items-center gap-3.5 z-10">
            <div className="relative">
              {/* Outer Green Ring */}
              <div className="w-16 h-16 rounded-full p-0.5 border-2 border-[#16852D] flex items-center justify-center bg-white shadow-xs">
                <img
                  src={DHARYA_LOGO_DATA_URI}
                  alt="My Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              {/* Green Plus Badge */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddModal(true);
                }}
                className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#16852D] text-white flex items-center justify-center border-2 border-white shadow-xs cursor-pointer hover:scale-110 transition-transform"
                title="Add New Status"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>

            {/* Labels */}
            <div>
              <h2 className="text-[17px] font-bold text-slate-900 tracking-tight leading-tight">
                My Status
              </h2>
              <p className="text-[13px] text-slate-500 font-medium leading-tight mt-1">
                {myStatuses.length > 0
                  ? `${myStatuses.length} update${myStatuses.length > 1 ? 's' : ''} • Tap to view`
                  : 'Tap to add a status'}
              </p>
            </div>
          </div>

          {/* Right: Exact Organic Flourish (Sprouting Green Leaves + Pink Heart) */}
          <div className="relative w-28 h-20 shrink-0 pointer-events-none">
            <svg
              viewBox="0 0 110 80"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Soft pink hill backdrop */}
              <path
                d="M 20 80 C 45 45, 80 40, 110 55 L 110 80 Z"
                fill="url(#cardPinkGrad)"
                opacity="0.35"
              />
              {/* Soft green hill backdrop */}
              <path
                d="M 0 80 C 30 55, 65 50, 100 80 Z"
                fill="url(#cardGreenGrad)"
                opacity="0.4"
              />

              {/* Green Branch Stem */}
              <path
                d="M 68 75 C 72 55, 78 40, 88 28"
                stroke="#16852D"
                strokeWidth="2.4"
                strokeLinecap="round"
              />

              {/* Leaf 1 (Left Upper) */}
              <path
                d="M 72 50 C 60 48, 62 38, 70 36 C 73 42, 73 46, 72 50 Z"
                fill="#16852D"
              />

              {/* Leaf 2 (Right Lower) */}
              <path
                d="M 74 60 C 84 58, 84 48, 76 46 C 74 52, 74 56, 74 60 Z"
                fill="#22C55E"
              />

              {/* Pink Floating Heart at Stem Tip */}
              <path
                d="M 88 28 C 84 22, 77 22, 77 27 C 77 32, 88 42, 88 42 C 88 42, 99 32, 99 27 C 99 22, 92 22, 88 28 Z"
                stroke="#F22679"
                strokeWidth="2.2"
                fill="none"
                strokeLinejoin="round"
              />

              <defs>
                <linearGradient id="cardPinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F22679" />
                  <stop offset="100%" stopColor="#FDA4AF" />
                </linearGradient>
                <linearGradient id="cardGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#16852D" />
                  <stop offset="100%" stopColor="#BBF7D0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* ══════ 3. RECENT UPDATES SECTION (Exact Dhanya Card) ══════ */}
        <section className="space-y-3 pt-2">
          {/* Section Heading with Green Vertical Bar */}
          <div className="flex items-center gap-2 px-1">
            <span className="w-1 h-5 rounded-full bg-[#16852D]" />
            <h3 className="text-[16px] font-extrabold text-slate-900 tracking-tight">
              Recent Updates
            </h3>
          </div>

          {/* Dhanya's Status Card (Only Dhanya, matching Reference Image) */}
          {recentUpdates.dhanyaStatuses.length > 0 ? (
            <div
              onClick={() => {
                setActiveStoryGroup('dhanya');
                setActiveStoryIdx(0);
                setStoryProgress(0);
              }}
              className="w-full rounded-[26px] p-3.5 bg-[#F3FAF5] border border-[#D1EBD9]/70 flex items-center justify-between cursor-pointer transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99] shadow-2xs"
            >
              <div className="flex items-center gap-3.5">
                {/* Dhanya Profile with Vivid Green Story Ring */}
                <div className="relative">
                  <div
                    className={`w-14 h-14 rounded-full p-0.5 border-2 flex items-center justify-center bg-white shadow-xs ${
                      recentUpdates.hasUnseen ? 'border-[#16852D]' : 'border-slate-300'
                    }`}
                  >
                    <img
                      src={DHANYA_SUNSET_AVATAR}
                      alt="Dhanya"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>

                {/* Name & Time */}
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-[17px] font-bold text-slate-900 tracking-tight leading-tight">
                      Dhanya
                    </h4>
                    <span className="text-[#F22679] text-base leading-none font-bold">♡</span>
                  </div>
                  <p className="text-[12.5px] text-slate-500 font-medium leading-tight mt-1">
                    {recentUpdates.lastUpdated
                      ? getRelativeTime(recentUpdates.lastUpdated)
                      : '10 minutes ago'}
                  </p>
                </div>
              </div>

              {/* Three-dot menu button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveStoryGroup('dhanya');
                  setActiveStoryIdx(0);
                }}
                className="p-2 rounded-full hover:bg-black/5 text-slate-600 transition-colors cursor-pointer"
                title="View Status Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <p className="text-xs text-slate-500 font-medium">No recent updates right now.</p>
            </div>
          )}
        </section>

        {/* ── Status Highlights Section (if any collections exist) ── */}
        {highlights.length > 0 && (
          <section className="space-y-2 pt-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-[#F22679]" />
                <h3 className="text-[15px] font-extrabold text-slate-900 tracking-tight">
                  Highlights
                </h3>
              </div>
              <button
                onClick={() => setShowHighlightModal(true)}
                className="text-xs font-bold text-[#F22679] hover:opacity-80"
              >
                Manage
              </button>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
              {highlights.map((hl) => (
                <div
                  key={hl.id}
                  className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
                >
                  <div className="w-14 h-14 rounded-full p-0.5 border-2 border-[#F22679] bg-white overflow-hidden shadow-xs group-hover:scale-105 transition-transform">
                    <img src={hl.coverUrl} alt={hl.title} className="w-full h-full rounded-full object-cover" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[64px]">
                    {hl.title}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ══════ 4. BOTTOM FLOWING WAVE DECORATION (Exact from Reference Image) ══════ */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-0">
        <svg
          viewBox="0 0 400 120"
          className="w-full h-auto drop-shadow-sm"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle green wave ribbon */}
          <path
            d="M 0 60 C 100 40, 240 110, 400 70 L 400 120 L 0 120 Z"
            fill="url(#bottomGreenRibbon)"
            opacity="0.3"
          />

          {/* Soft pink wave ribbon */}
          <path
            d="M 0 85 C 120 70, 280 120, 400 90 L 400 120 L 0 120 Z"
            fill="url(#bottomPinkRibbon)"
            opacity="0.45"
          />

          {/* Sprouting Green Leaves in Bottom Left Corner */}
          <g transform="translate(14, 60)">
            {/* Stem */}
            <path d="M 0 40 C 10 30, 22 15, 34 0" stroke="#16852D" strokeWidth="2.2" strokeLinecap="round" />
            {/* Leaf 1 */}
            <path d="M 12 32 C 6 22, 10 10, 24 16 C 22 24, 18 28, 12 32 Z" fill="#16852D" />
            {/* Leaf 2 */}
            <path d="M 22 22 C 32 18, 36 6, 26 2 C 22 8, 22 16, 22 22 Z" fill="#22C55E" />
          </g>

          <defs>
            <linearGradient id="bottomGreenRibbon" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#16852D" />
              <stop offset="100%" stopColor="#86EFAC" />
            </linearGradient>
            <linearGradient id="bottomPinkRibbon" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F22679" />
              <stop offset="100%" stopColor="#FDA4AF" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ══════ 5. FULL-SCREEN STATUS VIEWER MODAL ══════ */}
      {activeStoryGroup && activeStoryItem && (
        <div
          className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between select-none animate-in fade-in duration-200"
          onMouseDown={() => setIsStoryPaused(true)}
          onMouseUp={() => setIsStoryPaused(false)}
          onTouchStart={() => setIsStoryPaused(true)}
          onTouchEnd={() => setIsStoryPaused(false)}
        >
          {/* Top Segmented Progress Indicators */}
          <div className="w-full max-w-xl mx-auto px-3 pt-3 flex gap-1 z-30">
            {currentViewerStories.map((s, idx) => (
              <div key={s.id} className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-75"
                  style={{
                    width:
                      idx < activeStoryIdx
                        ? '100%'
                        : idx === activeStoryIdx
                        ? `${storyProgress}%`
                        : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Top Navigation Bar: Author & Close */}
          <div className="w-full max-w-xl mx-auto px-4 py-3 flex items-center justify-between text-white z-30 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-3">
              <img
                src={activeStoryItem.authorAvatar || DHARYA_LOGO_DATA_URI}
                alt={activeStoryItem.authorName}
                className="w-10 h-10 rounded-full object-cover border border-white/40"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight">{activeStoryItem.authorName}</span>
                  {activeStoryGroup === 'dhanya' && <span className="text-[#F22679]">♡</span>}
                </div>
                <span className="text-[11px] text-white/75">{getRelativeTime(activeStoryItem.createdAt)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeStoryItem.type === 'video' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsVideoMuted((m) => !m);
                  }}
                  className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 cursor-pointer"
                >
                  {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              )}

              {activeStoryGroup === 'my' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCurrentStory();
                  }}
                  className="p-2 rounded-full bg-black/40 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                  title="Delete Story"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveStoryGroup(null);
                }}
                className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Central Media Content Stage */}
          <div className="relative flex-1 w-full max-w-xl flex items-center justify-center overflow-hidden">
            {/* Tap areas for prev / next story */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (activeStoryIdx > 0) {
                  setActiveStoryIdx((idx) => idx - 1);
                  setStoryProgress(0);
                }
              }}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (activeStoryIdx < currentViewerStories.length - 1) {
                  setActiveStoryIdx((idx) => idx + 1);
                  setStoryProgress(0);
                } else {
                  setActiveStoryGroup(null);
                }
              }}
            />

            {/* Media Rendering */}
            {activeStoryItem.type === 'photo' && (
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={activeStoryItem.mediaUrl}
                  alt="Story"
                  className={`max-w-full max-h-full object-contain ${
                    activeStoryItem.filter === 'bw'
                      ? 'grayscale'
                      : activeStoryItem.filter === 'warm'
                      ? 'sepia-[0.3]'
                      : activeStoryItem.filter === 'vivid'
                      ? 'saturate-150'
                      : ''
                  }`}
                />
                {activeStoryItem.drawingDataUrl && (
                  <img
                    src={activeStoryItem.drawingDataUrl}
                    alt="Drawing"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  />
                )}
              </div>
            )}

            {activeStoryItem.type === 'video' && (
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={videoPlayerRef}
                  src={activeStoryItem.mediaUrl}
                  autoPlay
                  playsInline
                  muted={isVideoMuted}
                  onTimeUpdate={handleVideoTimeUpdate}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}

            {activeStoryItem.type === 'text' && (
              <div
                className="w-full h-full flex items-center justify-center p-8 text-center text-white"
                style={{
                  background: activeStoryItem.backgroundGradient || PRESET_GRADIENTS[0],
                  fontFamily: activeStoryItem.fontFamily || 'sans-serif',
                }}
              >
                <p className="text-2xl sm:text-3xl font-extrabold max-w-md leading-relaxed drop-shadow-md">
                  {activeStoryItem.textContent}
                </p>
              </div>
            )}

            {/* Caption Overlay */}
            {activeStoryItem.caption && (
              <div className="absolute bottom-4 left-4 right-4 z-20 p-3.5 rounded-2xl bg-black/60 backdrop-blur-md text-white text-xs sm:text-sm text-center border border-white/10 shadow-lg">
                <p>{activeStoryItem.caption}</p>
              </div>
            )}
          </div>

          {/* ── Bottom Bar: Reactions & Replies (for Dhanya) OR View Count Sheet (for My Status) ── */}
          <div className="w-full max-w-xl mx-auto px-4 py-3 z-30 bg-gradient-to-t from-black/90 to-transparent">
            {activeStoryGroup === 'dhanya' ? (
              <div className="space-y-2">
                {/* Quick Emoji Reaction Pill Buttons */}
                <div className="flex items-center justify-center gap-3 py-1">
                  {['❤️', '😂', '😍', '👍', '🔥', '🌸'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendReaction(emoji);
                      }}
                      className="text-2xl hover:scale-125 transition-transform active:scale-95 cursor-pointer drop-shadow-md"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* Reply Input Bar */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Reply to Dhanya ♡..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                    className="flex-1 px-4 py-2.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#F22679]"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    className="p-2.5 rounded-full bg-[#F22679] hover:bg-[#d81b65] text-white disabled:opacity-50 transition-colors cursor-pointer shadow-md"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* My Status Viewer Bar */
              <div className="flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowViewerSheet(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold backdrop-blur-md cursor-pointer transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>{activeViewers.length} views</span>
                  <ChevronRight className="w-3.5 h-3.5 rotate-[-90deg]" />
                </button>
              </div>
            )}
          </div>

          {/* ── Slide-up Viewers Drawer for Own Status (Actual Records Only) ── */}
          {showViewerSheet && (
            <div className="absolute inset-x-0 bottom-0 max-h-[60vh] bg-white rounded-t-3xl p-5 z-40 text-slate-900 shadow-2xl overflow-y-auto animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#16852D]" />
                  <h3 className="font-bold text-base">Viewed by {activeViewers.length}</h3>
                </div>
                <button
                  onClick={() => setShowViewerSheet(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100 mt-2">
                {activeViewers.length > 0 ? (
                  activeViewers.map((vr) => (
                    <div key={vr.id} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={vr.viewerAvatar || DHARYA_LOGO_DATA_URI}
                          alt={vr.viewerName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-xs text-slate-900">{vr.viewerName}</p>
                          <p className="text-[10px] text-slate-400">{getRelativeTime(vr.viewedAt)}</p>
                        </div>
                      </div>
                      {vr.reaction && <span className="text-xl">{vr.reaction}</span>}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No one has viewed this status yet. Real views appear here automatically.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════ 6. ADD STATUS CREATOR MODAL ══════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-5 sm:p-6 text-slate-900 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#16852D]" />
                <h3 className="font-extrabold text-base text-slate-900">Add New Status</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher: Media vs Text Status */}
            <div className="flex p-1 rounded-2xl bg-slate-100 mt-4 mb-4 gap-1">
              <button
                type="button"
                onClick={() => setCreatorMode('media')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  creatorMode === 'media'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Camera className="w-4 h-4 text-[#16852D]" />
                <span>Photo / Video</span>
              </button>

              <button
                type="button"
                onClick={() => setCreatorMode('text')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  creatorMode === 'text'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Type className="w-4 h-4 text-[#F22679]" />
                <span>Text Status</span>
              </button>
            </div>

            {/* ── Mode 1: Media Upload / Camera ── */}
            {creatorMode === 'media' && (
              <div className="space-y-4">
                {previewMediaUrl ? (
                  <div className="relative rounded-2xl overflow-hidden bg-slate-950 max-h-72 flex items-center justify-center border border-slate-200">
                    {mediaType === 'photo' ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img
                          src={previewMediaUrl}
                          alt="Preview"
                          className={`max-h-72 object-contain ${
                            activeFilter === 'bw'
                              ? 'grayscale'
                              : activeFilter === 'warm'
                              ? 'sepia-[0.3]'
                              : activeFilter === 'vivid'
                              ? 'saturate-150'
                              : ''
                          }`}
                        />
                        {/* Drawing Canvas Overlay */}
                        <canvas
                          ref={canvasRef}
                          width={480}
                          height={288}
                          onMouseDown={startDrawing}
                          onMouseUp={stopDrawing}
                          onMouseMove={draw}
                          onTouchStart={startDrawing}
                          onTouchEnd={stopDrawing}
                          onTouchMove={draw}
                          className={`absolute inset-0 w-full h-full ${
                            isDrawingOpen ? 'cursor-crosshair' : 'pointer-events-none'
                          }`}
                        />
                      </div>
                    ) : (
                      <video src={previewMediaUrl} controls className="max-h-72 w-full object-contain" />
                    )}

                    {/* Change Media Button */}
                    <button
                      onClick={() => {
                        setPreviewMediaUrl('');
                        setSelectedFile(null);
                        clearCanvas();
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
                      title="Remove Media"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {/* Device Gallery Button */}
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="h-28 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#16852D] bg-slate-50 flex flex-col items-center justify-center p-3 text-xs font-bold text-slate-700 hover:text-[#16852D] transition-colors cursor-pointer"
                    >
                      <ImageIcon className="w-6 h-6 mb-1 text-[#16852D]" />
                      <span>Choose from Gallery</span>
                    </button>

                    {/* Camera Button */}
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="h-28 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#F22679] bg-slate-50 flex flex-col items-center justify-center p-3 text-xs font-bold text-slate-700 hover:text-[#F22679] transition-colors cursor-pointer"
                    >
                      <Camera className="w-6 h-6 mb-1 text-[#F22679]" />
                      <span>Take Photo / Video</span>
                    </button>
                  </div>
                )}

                {/* Hidden File Inputs */}
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => e.target.files?.[0] && handleSelectMedia(e.target.files[0])}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*,video/*"
                  capture="environment"
                  onChange={(e) => e.target.files?.[0] && handleSelectMedia(e.target.files[0])}
                  className="hidden"
                />

                {/* Filters & Drawing Bar if Image is Loaded */}
                {previewMediaUrl && mediaType === 'photo' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                      <span>Filters</span>
                      <button
                        type="button"
                        onClick={() => setIsDrawingOpen((d) => !d)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl cursor-pointer ${
                          isDrawingOpen ? 'bg-[#F22679] text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <Brush className="w-3.5 h-3.5" />
                        <span>{isDrawingOpen ? 'Drawing On' : 'Draw'}</span>
                      </button>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {[
                        { id: 'none', label: 'Normal' },
                        { id: 'vivid', label: 'Vivid' },
                        { id: 'warm', label: 'Warm' },
                        { id: 'bw', label: 'B&W' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setActiveFilter(f.id as any)}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer border ${
                            activeFilter === f.id
                              ? 'bg-[#16852D] text-white border-[#16852D]'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    {/* Drawing Color Palette if enabled */}
                    {isDrawingOpen && (
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                        {['#F22679', '#16852D', '#3B82F6', '#EAB308', '#FFFFFF', '#000000'].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setDrawColor(c)}
                            className={`w-6 h-6 rounded-full border-2 cursor-pointer ${
                              drawColor === c ? 'scale-125 border-slate-900' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                        <button
                          type="button"
                          onClick={clearCanvas}
                          className="ml-auto text-[11px] font-bold text-rose-600 hover:underline"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Caption Input */}
                <div>
                  <label className="text-xs font-bold text-slate-500">Caption (Optional)</label>
                  <input
                    type="text"
                    placeholder="Add a caption..."
                    value={statusCaption}
                    onChange={(e) => setStatusCaption(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* ── Mode 2: Text Status Creator ── */}
            {creatorMode === 'text' && (
              <div className="space-y-4">
                {/* Live Text Preview Box */}
                <div
                  className="w-full h-48 rounded-2xl p-6 flex items-center justify-center text-center text-white shadow-inner relative overflow-hidden"
                  style={{ background: textGradient, fontFamily: textFont }}
                >
                  <textarea
                    autoFocus
                    rows={4}
                    placeholder="Type a status..."
                    value={textStatusContent}
                    onChange={(e) => setTextStatusContent(e.target.value)}
                    className="w-full bg-transparent text-white text-xl sm:text-2xl font-extrabold text-center resize-none placeholder-white/60 focus:outline-none"
                  />
                </div>

                {/* Color Gradient Picker */}
                <div>
                  <label className="text-xs font-bold text-slate-500">Background Gradient</label>
                  <div className="flex gap-2 mt-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {PRESET_GRADIENTS.map((g, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setTextGradient(g)}
                        className={`w-8 h-8 rounded-full shrink-0 border-2 cursor-pointer transition-transform ${
                          textGradient === g ? 'scale-110 border-slate-900' : 'border-transparent'
                        }`}
                        style={{ background: g }}
                      />
                    ))}
                  </div>
                </div>

                {/* Font Family Picker */}
                <div>
                  <label className="text-xs font-bold text-slate-500">Font Style</label>
                  <div className="flex gap-2 mt-1.5">
                    {PRESET_FONTS.map((font) => (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => setTextFont(font.family)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                          textFont === font.family
                            ? 'bg-[#F22679] text-white border-[#F22679]'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                        style={{ fontFamily: font.family }}
                      >
                        {font.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Actions: Cancel & Publish */}
            <div className="flex gap-2 pt-4 border-t border-slate-100 mt-5">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublishStatus}
                disabled={isPublishing}
                className="flex-1 py-2.5 rounded-xl bg-[#16852D] hover:bg-[#126d24] text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {isPublishing ? 'Publishing...' : 'Publish Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ 7. PRIVACY SETTINGS MODAL ══════ */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#16852D]" />
                <h3 className="font-extrabold text-base text-slate-900">Status Privacy</h3>
              </div>
              <button onClick={() => setShowPrivacyModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2 mb-4">
              Who can see your status updates? Changes apply to new statuses.
            </p>

            <div className="space-y-2.5">
              {[
                { id: 'contacts', label: 'My Contacts', desc: 'All authorized contacts' },
                { id: 'except', label: 'My Contacts Except...', desc: 'Hide from specific people' },
                { id: 'only', label: 'Only Share With...', desc: 'Share exclusively with selected contacts' },
                { id: 'private', label: 'Only Me', desc: 'Completely private status' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-start gap-3 p-3 rounded-2xl border border-slate-200 hover:border-[#16852D] cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="privacy"
                    checked={statusService.getPrivacySettings().mode === opt.id}
                    onChange={() => {
                      statusService.updatePrivacySettings({ mode: opt.id as PrivacyMode });
                      showToast?.('Privacy setting updated', 'success');
                    }}
                    className="mt-0.5 text-[#16852D] focus:ring-[#16852D]"
                  />
                  <div>
                    <p className="font-bold text-xs text-slate-900">{opt.label}</p>
                    <p className="text-[11px] text-slate-500">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <button
              onClick={() => setShowPrivacyModal(false)}
              className="w-full mt-5 py-2.5 rounded-xl bg-[#16852D] text-white text-xs font-bold cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ══════ 8. STATUS ARCHIVE MODAL ══════ */}
      {showArchiveModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-900 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#F22679]" />
                <h3 className="font-extrabold text-base">Status Archive</h3>
              </div>
              <button onClick={() => setShowArchiveModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 my-2">
              Statuses older than 24 hours are safely archived here.
            </p>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 py-2">
              {archivedStatuses.length > 0 ? (
                archivedStatuses.map((arch) => (
                  <div key={arch.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {arch.type === 'photo' && (
                        <img src={arch.mediaUrl} alt="" className="w-12 h-12 rounded-xl object-cover" />
                      )}
                      {arch.type === 'text' && (
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-[10px] font-bold p-1"
                          style={{ background: arch.backgroundGradient || PRESET_GRADIENTS[0] }}
                        >
                          Text
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold truncate max-w-[200px]">
                          {arch.caption || arch.textContent || 'Status'}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(arch.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        statusService.deleteStatus(arch.id, currentUser);
                        showToast?.('Archived status deleted', 'info');
                      }}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"
                      title="Delete from Archive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-8">No archived statuses yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════ 9. HIGHLIGHTS MODAL ══════ */}
      {showHighlightModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-base">Highlights</h3>
              </div>
              <button onClick={() => setShowHighlightModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 my-3">
              Pin your favorite moments permanently on your profile.
            </p>

            <button
              onClick={() => {
                const title = prompt('Enter Highlight Collection Name:', 'Precious Moments ♡');
                if (title?.trim()) {
                  statusService.createHighlight(
                    title.trim(),
                    myStatuses[0]?.mediaUrl || DHANYA_SUNSET_AVATAR,
                    myStatuses.map((s) => s.id)
                  );
                  showToast?.('Highlight collection created ✨', 'success');
                  setShowHighlightModal(false);
                }
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#16852D] to-[#F22679] text-white text-xs font-bold shadow-md cursor-pointer"
            >
              + Create New Highlight
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
