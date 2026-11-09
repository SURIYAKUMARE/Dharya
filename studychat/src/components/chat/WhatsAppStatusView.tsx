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
  Music,
  Disc,
  FileAudio,
} from 'lucide-react';
import {
  statusService,
  StatusItem,
  StatusViewRecord,
  StatusReaction,
  StatusHighlight,
  StatusSongInfo,
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
  onSwitchUser?: () => void;
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

export interface PresetSong {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  notes: number[];
}

const PRESET_SONGS: PresetSong[] = [
  {
    id: 's1',
    title: 'Munbe Vaa (Love Melody)',
    artist: 'A.R. Rahman • Sillunu Oru Kaadhal',
    coverUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=400&q=80',
    notes: [261.63, 329.63, 392.0, 523.25, 440.0, 392.0, 349.23, 329.63],
  },
  {
    id: 's2',
    title: 'Enna Sona (Romantic Acoustic)',
    artist: 'Arijit Singh • OK Jaanu',
    coverUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=400&q=80',
    notes: [329.63, 392.0, 440.0, 523.25, 587.33, 523.25, 440.0, 392.0],
  },
  {
    id: 's3',
    title: 'Vaseegara (Soulful Chimes)',
    artist: 'Harris Jayaraj • Minnale',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
    notes: [293.66, 349.23, 440.0, 523.25, 440.0, 392.0, 329.63, 293.66],
  },
  {
    id: 's4',
    title: 'Kanmani Anbodu (Heartfelt)',
    artist: 'Ilaiyaraaja • Gunaa',
    coverUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80',
    notes: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 440.0, 329.63],
  },
  {
    id: 's5',
    title: 'Sunset Acoustic Guitar',
    artist: 'Dhanya Chill Melody',
    coverUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=400&q=80',
    notes: [392.0, 440.0, 523.25, 587.33, 659.25, 587.33, 523.25, 440.0],
  },
];

function createMelodyWavDataUri(notes: number[], durationSec = 15): string {
  if (typeof window === 'undefined') return '';
  const sampleRate = 22050;
  const numSamples = sampleRate * durationSec;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  const noteDuration = durationSec / notes.length;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const noteIdx = Math.floor(t / noteDuration) % notes.length;
    const freq = notes[noteIdx];
    const noteTime = t % noteDuration;
    const envelope = Math.exp(-noteTime * 2.2);
    const sampleVal = (Math.sin(2 * Math.PI * freq * noteTime) * 0.7 +
                       Math.sin(2 * Math.PI * freq * 2 * noteTime) * 0.3) * envelope;
    const clamped = Math.max(-1, Math.min(1, sampleVal)) * 0.6;
    view.setInt16(44 + i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  }

  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return 'data:audio/wav;base64,' + btoa(binary);
}

export const WhatsAppStatusView: React.FC<WhatsAppStatusViewProps> = ({
  isDark = false,
  studentName = 'Surya',
  partnerName = 'Dhanya',
  partnerUser,
  onBackToChat,
  onSwitchUser,
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
  const [activeStoryGroup, setActiveStoryGroup] = useState<'partner' | 'my' | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [partnerMenuOpen, setPartnerMenuOpen] = useState(false);

  // ── Add Status Form States ──
  const [creatorMode, setCreatorMode] = useState<'media' | 'text' | 'song'>('media');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string>('');
  const [mediaType, setMediaType] = useState<'photo' | 'video' | 'audio'>('photo');
  const [statusCaption, setStatusCaption] = useState('');
  const [textStatusContent, setTextStatusContent] = useState('');
  const [textGradient, setTextGradient] = useState(PRESET_GRADIENTS[0]);
  const [textFont, setTextFont] = useState(PRESET_FONTS[0].family);
  const [activeFilter, setActiveFilter] = useState<'none' | 'vivid' | 'soft' | 'warm' | 'bw' | 'pink'>('none');
  const [isPublishing, setIsPublishing] = useState(false);

  // Attached Song / Music State
  const [attachedSong, setAttachedSong] = useState<StatusSongInfo | null>(null);
  const [customSongTitle, setCustomSongTitle] = useState('');
  const [customSongArtist, setCustomSongArtist] = useState('');

  // Drawing Canvas
  const [isDrawingOpen, setIsDrawingOpen] = useState(false);
  const [drawColor, setDrawColor] = useState('#F22679');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isPainting = useRef(false);

  // File Inputs
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  // ── Viewer States ──
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const [isStoryPaused, setIsStoryPaused] = useState(false);
  const [storyProgress, setStoryProgress] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [showViewerSheet, setShowViewerSheet] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // ── Active Stories for Current Viewer ──
  const currentViewerStories = useMemo(() => {
    if (activeStoryGroup === 'partner') return recentUpdates.statuses;
    if (activeStoryGroup === 'my') return myStatuses;
    return [];
  }, [activeStoryGroup, recentUpdates.statuses, myStatuses]);

  const activeStoryItem = currentViewerStories[activeStoryIdx] || null;

  // ── Record View on Open ──
  useEffect(() => {
    if (activeStoryItem && activeStoryGroup === 'partner') {
      const viewerName = currentUser === 'surya' ? 'Surya' : 'Dhanya';
      const viewerAvatar = currentUser === 'surya' ? DHARYA_LOGO_DATA_URI : DHANYA_SUNSET_AVATAR;
      statusService.recordView(activeStoryItem.id, {
        id: currentUser,
        name: viewerName,
        avatar: viewerAvatar,
      });
    }
  }, [activeStoryItem, activeStoryGroup, currentUser]);

  // ── Story Progress Timer ──
  useEffect(() => {
    if (!activeStoryItem || isStoryPaused || showViewerSheet) return;

    if (
      (activeStoryItem.type === 'video' && videoPlayerRef.current) ||
      (activeStoryItem.type === 'audio' && audioPlayerRef.current)
    ) {
      // Synchronized with video or audio element
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

  // Audio / Song Time Update Listener
  const handleAudioTimeUpdate = () => {
    if (!audioPlayerRef.current || isStoryPaused) return;
    const aud = audioPlayerRef.current;
    if (activeStoryItem?.type === 'audio' && aud.duration) {
      const p = (aud.currentTime / aud.duration) * 100;
      setStoryProgress(p);
      if (aud.ended) {
        if (activeStoryIdx < currentViewerStories.length - 1) {
          setActiveStoryIdx((idx) => idx + 1);
          setStoryProgress(0);
        } else {
          setActiveStoryGroup(null);
        }
      }
    }
  };

  // Sync Pause/Resume for Video & Audio
  useEffect(() => {
    if (videoPlayerRef.current) {
      if (isStoryPaused) {
        videoPlayerRef.current.pause();
      } else {
        videoPlayerRef.current.play().catch(() => {});
      }
    }
    if (audioPlayerRef.current) {
      if (isStoryPaused) {
        audioPlayerRef.current.pause();
      } else {
        audioPlayerRef.current.play().catch(() => {});
      }
    }
  }, [isStoryPaused]);

  // Reset progress when switching stories
  useEffect(() => {
    setStoryProgress(0);
    if (videoPlayerRef.current) {
      videoPlayerRef.current.currentTime = 0;
      videoPlayerRef.current.play().catch(() => {});
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current.play().catch(() => {});
    }
  }, [activeStoryIdx]);

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

  // ── Select Custom Audio File ──
  const handleSelectAudio = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = (e.target?.result as string) || '';
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      const newSong: StatusSongInfo = {
        title: cleanName,
        artist: currentUser === 'surya' ? 'Surya' : 'Dhanya',
        audioUrl: dataUri,
        coverUrl: currentUser === 'surya' ? DHARYA_LOGO_DATA_URI : DHANYA_SUNSET_AVATAR,
      };
      setAttachedSong(newSong);
      setCustomSongTitle(cleanName);
      setCustomSongArtist(currentUser === 'surya' ? 'Surya' : 'Dhanya');
      showToast?.(`Loaded audio: ${cleanName} 🎵`, 'success');
    };
    reader.readAsDataURL(file);
  };

  // ── Select Preset Melody Song ──
  const handleSelectPresetSong = (preset: PresetSong) => {
    const dataUri = createMelodyWavDataUri(preset.notes);
    const newSong: StatusSongInfo = {
      title: preset.title,
      artist: preset.artist,
      audioUrl: dataUri,
      coverUrl: preset.coverUrl,
    };
    setAttachedSong(newSong);
    setCustomSongTitle(preset.title);
    setCustomSongArtist(preset.artist);
    showToast?.(`Selected ${preset.title} 🎶`, 'info');
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

    const authorName = currentUser === 'surya' ? 'Surya' : 'Dhanya';
    const authorAvatar = currentUser === 'surya' ? DHARYA_LOGO_DATA_URI : DHANYA_SUNSET_AVATAR;

    try {
      if (creatorMode === 'song') {
        if (!attachedSong?.audioUrl) {
          showToast?.('Please choose or upload a song / audio track', 'error');
          setIsPublishing(false);
          return;
        }

        const songToSave: StatusSongInfo = {
          title: customSongTitle.trim() || attachedSong.title,
          artist: customSongArtist.trim() || attachedSong.artist || authorName,
          audioUrl: attachedSong.audioUrl,
          coverUrl: attachedSong.coverUrl || authorAvatar,
        };

        await statusService.publishStatus({
          owner: currentUser,
          authorName,
          authorAvatar,
          type: 'audio',
          mediaUrl: songToSave.coverUrl || authorAvatar,
          audioUrl: songToSave.audioUrl,
          songInfo: songToSave,
          caption: statusCaption.trim(),
          backgroundGradient: textGradient,
        });
      } else if (creatorMode === 'media') {
        if (!previewMediaUrl) {
          showToast?.('Please select a photo or video', 'error');
          setIsPublishing(false);
          return;
        }

        await statusService.publishStatus({
          owner: currentUser,
          authorName,
          authorAvatar,
          type: mediaType,
          mediaUrl: previewMediaUrl,
          audioUrl: attachedSong?.audioUrl,
          songInfo: attachedSong
            ? {
                ...attachedSong,
                title: customSongTitle.trim() || attachedSong.title,
                artist: customSongArtist.trim() || attachedSong.artist,
              }
            : undefined,
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
          authorName,
          authorAvatar,
          type: 'text',
          mediaUrl: '',
          audioUrl: attachedSong?.audioUrl,
          songInfo: attachedSong
            ? {
                ...attachedSong,
                title: customSongTitle.trim() || attachedSong.title,
                artist: customSongArtist.trim() || attachedSong.artist,
              }
            : undefined,
          textContent: textStatusContent.trim(),
          backgroundGradient: textGradient,
          fontFamily: textFont,
          caption: statusCaption.trim(),
        });
      }

      showToast?.('Status published successfully 🎉', 'success');
      setShowAddModal(false);
      // Reset form
      setPreviewMediaUrl('');
      setSelectedFile(null);
      setStatusCaption('');
      setTextStatusContent('');
      setAttachedSong(null);
      setCustomSongTitle('');
      setCustomSongArtist('');
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

        {/* Right Action Icons: Switch Account, Search & Three-Dots Menu */}
        <div className="flex items-center gap-2 relative">
          {onSwitchUser && (
            <button
              onClick={onSwitchUser}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all shadow-2xs cursor-pointer select-none ${
                currentUser === 'surya'
                  ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                  : 'bg-pink-50 hover:bg-pink-100 border-pink-300 text-pink-700'
              }`}
              title={`Logged in as ${currentUser === 'surya' ? 'Surya' : 'Sadhana (Dhanya)'}. Tap to switch account.`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{currentUser === 'surya' ? 'Surya' : 'Sadhana'}</span>
              <span className="text-[10px] opacity-70 hidden sm:inline">⇄ Switch</span>
            </button>
          )}

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
                  src={currentUser === 'surya' ? DHARYA_LOGO_DATA_URI : DHANYA_SUNSET_AVATAR}
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

          {/* Partner's Status Card (Dynamic: Dhanya for Surya, Surya for Sadhana) */}
          {recentUpdates.statuses.length > 0 ? (
            <div
              onClick={() => {
                setActiveStoryGroup('partner');
                setActiveStoryIdx(0);
                setStoryProgress(0);
              }}
              className="w-full rounded-[26px] p-3.5 bg-[#F3FAF5] border border-[#D1EBD9]/70 flex items-center justify-between cursor-pointer transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99] shadow-2xs"
            >
              <div className="flex items-center gap-3.5">
                {/* Partner Profile with Green Story Ring */}
                <div className="relative">
                  <div
                    className={`w-14 h-14 rounded-full p-0.5 border-2 flex items-center justify-center bg-white shadow-xs ${
                      recentUpdates.hasUnseen ? 'border-[#16852D]' : 'border-slate-300'
                    }`}
                  >
                    <img
                      src={recentUpdates.partnerAvatar}
                      alt={recentUpdates.partnerName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>

                {/* Name & Time */}
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-[17px] font-bold text-slate-900 tracking-tight leading-tight">
                      {recentUpdates.partnerName}
                    </h4>
                    {recentUpdates.partnerName === 'Dhanya' && (
                      <span className="text-[#F22679] text-base leading-none font-bold">♡</span>
                    )}
                  </div>
                  <p className="text-[12.5px] text-slate-500 font-medium leading-tight mt-1">
                    {recentUpdates.lastUpdated
                      ? getRelativeTime(recentUpdates.lastUpdated)
                      : 'Just now'}
                    {recentUpdates.statuses.length > 1 && ` • ${recentUpdates.statuses.length} updates`}
                  </p>
                </div>
              </div>

              {/* Three-dot menu button with View & Delete options */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPartnerMenuOpen((prev) => !prev);
                  }}
                  className="p-2 rounded-full hover:bg-black/5 text-slate-600 transition-colors cursor-pointer"
                  title="Status Options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {partnerMenuOpen && (
                  <div className="absolute right-0 top-10 w-44 rounded-2xl bg-white border border-slate-200 shadow-xl py-1 z-50 text-xs font-semibold text-slate-700 animate-in fade-in zoom-in-95">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPartnerMenuOpen(false);
                        setActiveStoryGroup('partner');
                        setActiveStoryIdx(0);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#16852D]" />
                      <span>View Status</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPartnerMenuOpen(false);
                        if (recentUpdates.statuses[0]) {
                          statusService.deleteStatus(recentUpdates.statuses[0].id, currentUser);
                          showToast?.('Status cleared 🗑️', 'info');
                        }
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer border-t border-slate-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Status</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <p className="text-xs text-slate-500 font-medium">
                No recent updates from {recentUpdates.partnerName} right now.
              </p>
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
                  {activeStoryItem.authorName === 'Dhanya' && <span className="text-[#F22679]">♡</span>}
                </div>
                <span className="text-[11px] text-white/75">{getRelativeTime(activeStoryItem.createdAt)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(activeStoryItem.type === 'video' ||
                activeStoryItem.type === 'audio' ||
                activeStoryItem.audioUrl ||
                activeStoryItem.songInfo?.audioUrl) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsVideoMuted((m) => !m);
                  }}
                  className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 cursor-pointer"
                  title={isVideoMuted ? 'Unmute' : 'Mute'}
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
            {/* Audio Element for pure audio or background music */}
            {(activeStoryItem.audioUrl || activeStoryItem.songInfo?.audioUrl) && (
              <audio
                ref={audioPlayerRef}
                src={activeStoryItem.audioUrl || activeStoryItem.songInfo?.audioUrl}
                autoPlay
                playsInline
                muted={isVideoMuted}
                onTimeUpdate={handleAudioTimeUpdate}
                onEnded={() => {
                  if (activeStoryItem.type === 'audio') {
                    if (activeStoryIdx < currentViewerStories.length - 1) {
                      setActiveStoryIdx((idx) => idx + 1);
                      setStoryProgress(0);
                    } else {
                      setActiveStoryGroup(null);
                    }
                  }
                }}
              />
            )}

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

            {/* Floating Music Pill for Photo/Text status with Background Music */}
            {activeStoryItem.type !== 'audio' && (activeStoryItem.songInfo || activeStoryItem.audioUrl) && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-lg flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  <span className={`w-0.5 h-3 bg-[#F22679] ${isStoryPaused ? '' : 'animate-pulse'}`} />
                  <span className={`w-0.5 h-4 bg-[#16852D] ${isStoryPaused ? '' : 'animate-pulse delay-75'}`} />
                  <span className={`w-0.5 h-2 bg-pink-300 ${isStoryPaused ? '' : 'animate-pulse delay-150'}`} />
                </div>
                <Music className="w-3.5 h-3.5 text-pink-400" />
                <span className="truncate max-w-[180px]">
                  {activeStoryItem.songInfo?.title || 'Background Song'}
                </span>
              </div>
            )}

            {/* Media Rendering: Photo */}
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

            {/* Media Rendering: Video */}
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

            {/* Media Rendering: Pure Song / Audio Status */}
            {activeStoryItem.type === 'audio' && (
              <div
                className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden"
                style={{
                  background:
                    activeStoryItem.backgroundGradient ||
                    'radial-gradient(circle at center, #2e1065 0%, #0f172a 100%)',
                }}
              >
                {/* Ambient Glow */}
                <div className="absolute w-72 h-72 rounded-full bg-[#F22679]/20 blur-3xl animate-pulse pointer-events-none" />

                {/* Spinning Vinyl Record Disc */}
                <div className="relative mb-6">
                  <div
                    className={`w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-slate-950 border-4 border-slate-700/80 shadow-2xl flex items-center justify-center p-2 relative ${
                      isStoryPaused ? '' : 'animate-spin'
                    }`}
                    style={{ animationDuration: '6s', animationTimingFunction: 'linear' }}
                  >
                    <div className="absolute inset-3 rounded-full border border-slate-800/80 pointer-events-none" />
                    <div className="absolute inset-7 rounded-full border border-slate-800/80 pointer-events-none" />
                    <div className="absolute inset-12 rounded-full border border-slate-800/80 pointer-events-none" />

                    {/* Center Album Art */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-white/40 shadow-inner flex items-center justify-center bg-black relative">
                      <img
                        src={activeStoryItem.songInfo?.coverUrl || activeStoryItem.mediaUrl || DHARYA_LOGO_DATA_URI}
                        alt="Song Art"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute w-4 h-4 rounded-full bg-slate-900 border-2 border-white shadow-xs" />
                    </div>
                  </div>

                  {/* Music Badge */}
                  <div className="absolute -bottom-2 right-4 px-3 py-1 rounded-full bg-[#16852D] text-white text-[10px] font-bold shadow-lg flex items-center gap-1.5 border border-white/20">
                    <Music className="w-3 h-3 animate-bounce" />
                    <span>MUSIC</span>
                  </div>
                </div>

                {/* Track Title & Artist */}
                <div className="z-10 space-y-1 max-w-sm px-4">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight drop-shadow-md">
                    {activeStoryItem.songInfo?.title || 'Romantic Melody'}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-pink-300 drop-shadow-xs">
                    {activeStoryItem.songInfo?.artist || 'Dhanya & Surya'}
                  </p>
                </div>

                {/* Live Soundwave Equalizer Bars */}
                <div className="flex items-center gap-1.5 my-4 z-10">
                  {[12, 24, 18, 32, 22, 14, 28, 16, 26, 20].map((h, i) => (
                    <span
                      key={i}
                      className={`w-1 rounded-full bg-gradient-to-t from-[#16852D] to-[#F22679] ${
                        isStoryPaused ? 'opacity-40' : 'animate-pulse'
                      }`}
                      style={{
                        height: isStoryPaused ? '8px' : `${h}px`,
                        animationDelay: `${i * 90}ms`,
                        animationDuration: '600ms',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Media Rendering: Text Status */}
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
            {activeStoryGroup !== 'my' ? (
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
                    placeholder={`Reply to ${activeStoryItem.authorName}...`}
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

            {/* Mode Switcher: Media vs Text vs Song */}
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

              <button
                type="button"
                onClick={() => setCreatorMode('song')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  creatorMode === 'song'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Music className="w-4 h-4 text-violet-600" />
                <span>Song / Audio</span>
              </button>
            </div>

            {/* Hidden Audio File Input */}
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              onChange={(e) => e.target.files?.[0] && handleSelectAudio(e.target.files[0])}
              className="hidden"
            />

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
                      <video src={previewMediaUrl} controls playsInline className="max-h-72 w-full object-contain" />
                    )}

                    {/* Change Media Button */}
                    <button
                      onClick={() => {
                        setPreviewMediaUrl('');
                        setSelectedFile(null);
                        clearCanvas();
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 cursor-pointer"
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
                      <span>Choose Photo / Video</span>
                    </button>

                    {/* Camera Button */}
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="h-28 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#F22679] bg-slate-50 flex flex-col items-center justify-center p-3 text-xs font-bold text-slate-700 hover:text-[#F22679] transition-colors cursor-pointer"
                    >
                      <Camera className="w-6 h-6 mb-1 text-[#F22679]" />
                      <span>Capture Camera</span>
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

                {/* Attach Background Music (Optional) */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5 text-pink-600" />
                      <span>Background Music (Optional)</span>
                    </span>
                    {attachedSong && (
                      <button
                        type="button"
                        onClick={() => setAttachedSong(null)}
                        className="text-[11px] font-bold text-rose-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {attachedSong ? (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-pink-200">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 shrink-0">
                          <Music className="w-3.5 h-3.5 animate-bounce" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 truncate">{attachedSong.title}</p>
                          <p className="text-[10px] text-slate-500 truncate">{attachedSong.artist}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Attached
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {PRESET_SONGS.map((ps) => (
                          <button
                            key={ps.id}
                            type="button"
                            onClick={() => handleSelectPresetSong(ps)}
                            className="px-2.5 py-1 rounded-xl text-[11px] font-semibold border border-slate-200 bg-white hover:border-pink-300 hover:bg-pink-50 text-slate-700 shrink-0 transition-colors cursor-pointer"
                          >
                            🎵 {ps.title}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => audioInputRef.current?.click()}
                        className="w-full py-1.5 rounded-xl border border-dashed border-slate-300 hover:border-pink-500 bg-white text-xs font-semibold text-slate-600 hover:text-pink-600 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FileAudio className="w-3.5 h-3.5" />
                        <span>Upload Any Song (MP3 / WAV / M4A)</span>
                      </button>
                    </div>
                  )}
                </div>

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

                {/* Attach Background Music (Optional for Text Status) */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5 text-pink-600" />
                      <span>Background Music (Optional)</span>
                    </span>
                    {attachedSong && (
                      <button
                        type="button"
                        onClick={() => setAttachedSong(null)}
                        className="text-[11px] font-bold text-rose-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {attachedSong ? (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-pink-200">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 shrink-0">
                          <Music className="w-3.5 h-3.5 animate-bounce" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 truncate">{attachedSong.title}</p>
                          <p className="text-[10px] text-slate-500 truncate">{attachedSong.artist}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Attached
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {PRESET_SONGS.map((ps) => (
                          <button
                            key={ps.id}
                            type="button"
                            onClick={() => handleSelectPresetSong(ps)}
                            className="px-2.5 py-1 rounded-xl text-[11px] font-semibold border border-slate-200 bg-white hover:border-pink-300 hover:bg-pink-50 text-slate-700 shrink-0 transition-colors cursor-pointer"
                          >
                            🎵 {ps.title}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => audioInputRef.current?.click()}
                        className="w-full py-1.5 rounded-xl border border-dashed border-slate-300 hover:border-pink-500 bg-white text-xs font-semibold text-slate-600 hover:text-pink-600 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FileAudio className="w-3.5 h-3.5" />
                        <span>Upload Any Song (MP3 / WAV / M4A)</span>
                      </button>
                    </div>
                  )}
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

            {/* ── Mode 3: Dedicated Song / Audio Status Creator ── */}
            {creatorMode === 'song' && (
              <div className="space-y-4">
                {/* Vinyl Preview Disc Card */}
                <div
                  className="w-full rounded-2xl p-5 flex flex-col items-center justify-center text-center text-white shadow-inner relative overflow-hidden"
                  style={{ background: textGradient }}
                >
                  <div
                    className="w-24 h-24 rounded-full bg-slate-950 border-4 border-slate-800 shadow-xl flex items-center justify-center relative mb-2.5 animate-spin"
                    style={{ animationDuration: '8s', animationTimingFunction: 'linear' }}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/40 bg-black flex items-center justify-center">
                      <img
                        src={
                          attachedSong?.coverUrl ||
                          (currentUser === 'surya' ? DHARYA_LOGO_DATA_URI : DHANYA_SUNSET_AVATAR)
                        }
                        alt="Album Art"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute w-2 h-2 rounded-full bg-slate-900 border border-white" />
                  </div>

                  <h4 className="font-extrabold text-base text-white drop-shadow-md truncate max-w-full px-2">
                    {customSongTitle || attachedSong?.title || 'Choose a Song Below'}
                  </h4>
                  <p className="text-xs text-pink-200 font-medium">
                    {customSongArtist || attachedSong?.artist || 'Surya & Dhanya'}
                  </p>

                  {/* Audio Player preview if song is selected */}
                  {attachedSong?.audioUrl && (
                    <div className="mt-3 w-full max-w-xs">
                      <audio src={attachedSong.audioUrl} controls className="w-full h-8" />
                    </div>
                  )}
                </div>

                {/* Preset Melody Songs */}
                <div>
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                    <Music className="w-3.5 h-3.5 text-[#16852D]" />
                    <span>Preset Romantic Melodies</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PRESET_SONGS.map((ps) => (
                      <button
                        key={ps.id}
                        type="button"
                        onClick={() => handleSelectPresetSong(ps)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          attachedSong?.title === ps.title
                            ? 'bg-pink-50 border-[#F22679] ring-2 ring-[#F22679]/20'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                          <img src={ps.coverUrl} alt={ps.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="overflow-hidden flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{ps.title}</p>
                          <p className="text-[10px] text-slate-500 truncate">{ps.artist}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Audio Upload Button */}
                <div>
                  <button
                    type="button"
                    onClick={() => audioInputRef.current?.click()}
                    className="w-full py-2.5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-violet-500 bg-slate-50 hover:bg-violet-50 text-xs font-bold text-slate-700 hover:text-violet-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <FileAudio className="w-4 h-4 text-violet-600" />
                    <span>Upload Song / Audio from Phone or Laptop (MP3, WAV, M4A)</span>
                  </button>
                </div>

                {/* Song Title & Artist Customization */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-500">Song Title</label>
                    <input
                      type="text"
                      placeholder="Title"
                      value={customSongTitle}
                      onChange={(e) => setCustomSongTitle(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500">Artist / Dedication</label>
                    <input
                      type="text"
                      placeholder="Artist"
                      value={customSongArtist}
                      onChange={(e) => setCustomSongArtist(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                {/* Caption / Dedication Note */}
                <div>
                  <label className="text-xs font-bold text-slate-500">Dedication Note (Optional)</label>
                  <input
                    type="text"
                    placeholder="Dedication message..."
                    value={statusCaption}
                    onChange={(e) => setStatusCaption(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Background Gradient Picker */}
                <div>
                  <label className="text-xs font-bold text-slate-500">Visualizer Theme</label>
                  <div className="flex gap-2 mt-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {PRESET_GRADIENTS.map((g, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setTextGradient(g)}
                        className={`w-7 h-7 rounded-full shrink-0 border-2 cursor-pointer ${
                          textGradient === g ? 'scale-110 border-slate-900' : 'border-transparent'
                        }`}
                        style={{ background: g }}
                      />
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
