import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { getSupabase, ChatMessage, ExtendedChatMessage, LOCAL_MESSAGES_KEY } from '../../services/supabaseClient';
import {
  fetchRemoteMessages,
  saveRemoteMessage,
  updateRemoteStatus,
  markAllIncomingAsRead,
  updateRemoteReactions,
  updateRemotePin,
  updateRemoteStar,
  updateRemotePoll,
  deleteRemoteMessage,
  mergeMessages,
  rowToMessage,
  CHAT_ID,
} from '../../services/chatSyncService';
import {
  MessageSquare,
  Sprout,
  ArrowLeft,
  Phone,
  Video,
  Search,
  MoreVertical,
  Smile,
  Paperclip,
  Mic,
  Send,
  Check,
  CheckCheck,
  Pin,
  Sparkles,
  Lock,
  Unlock,
  Shield,
  ShieldCheck,
  Image as ImageIcon,
  FileText,
  Trash2,
  X,
  Play,
  Pause,
  Eye,
  EyeOff,
  FileAudio,
  HardDrive,
  Filter,
  Volume2,
  Clock,
  ChevronDown,
  Camera,
  Copy,
  BookOpen,
  Key,
  Keyboard,
  Plus,
  Star,
  CornerUpLeft,
  BarChart2,
  CheckSquare,
  Download,
  Palette
} from 'lucide-react';
import { EmojiSvg, EMOJI_REGEX } from './EmojiSvg';
import { WhatsAppEmojiPicker } from './WhatsAppEmojiPicker';
import { WhatsAppCallModal } from './WhatsAppCallModal';
import { InteractivePlantGarden } from '../garden/InteractivePlantGarden';

interface WhatsAppChatViewProps {
  initialTab?: 'chat' | 'garden';
}

export const WhatsAppChatView: React.FC<WhatsAppChatViewProps> = ({ initialTab = 'chat' }) => {
  const { student, logoutChat, switchTab } = useStudyApp();

  // Active user and partner details
  const currentUser: 'surya' | 'sadhana' = student?.username === 'sadhana' ? 'sadhana' : 'surya';
  const partnerUser: 'surya' | 'sadhana' = currentUser === 'surya' ? 'sadhana' : 'surya';
  const partnerName = partnerUser === 'sadhana' ? 'Sadhana' : 'Surya';

  // Load stored messages permanently from localStorage; zero mock login/seed messages injected
  const [messages, setMessages] = useState<ExtendedChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_MESSAGES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [inputText, setInputText] = useState('');
  
  // Dynamic Presence & Last Seen State
  const [isPartnerOnline, setIsPartnerOnline] = useState<boolean>(() => {
    try {
      const activeTime = localStorage.getItem(`whatsapp_active_${partnerUser}`);
      if (activeTime && Date.now() - Number(activeTime) < 9000) {
        return true;
      }
    } catch {}
    return false;
  });

  const [partnerLastSeen, setPartnerLastSeen] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem(`whatsapp_last_seen_${partnerUser}`);
      if (saved) return Number(saved);
    } catch {}
    // Realistic default if not yet recorded: today earlier
    return Date.now() - 3600 * 1000 * 2.5;
  });

  const formatLastSeen = (timestamp: number | null): string => {
    if (!timestamp) return 'last seen recently';
    const date = new Date(timestamp);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isToday) {
      return `last seen today at ${timeStr}`;
    } else if (isYesterday) {
      return `last seen yesterday at ${timeStr}`;
    } else {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `last seen ${day}/${month}/${year} at ${timeStr}`;
    }
  };

  const isPartnerOnlineRef = useRef(isPartnerOnline);
  useEffect(() => {
    isPartnerOnlineRef.current = isPartnerOnline;
  }, [isPartnerOnline]);

  const [activeMainView, setActiveMainView] = useState<'chat' | 'garden'>(initialTab);
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  const [mobileView, setMobileView] = useState<'list' | 'conversation'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return initialTab === 'garden' ? 'conversation' : 'list';
    }
    return 'conversation';
  });

  const [showMobileSearch, setShowMobileSearch] = useState<boolean>(false);
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');

  useEffect(() => {
    const handleResize = () => {
      const isMob = window.innerWidth < 768;
      setIsMobileScreen(isMob);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [showSidebarMenu, setShowSidebarMenu] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveMainView(initialTab);
      if (initialTab === 'garden') {
        setMobileView('conversation');
      }
    }
  }, [initialTab]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [showChatLists, setShowChatLists] = useState(false);
  const [chatFilter, setChatFilter] = useState<'all' | 'unread' | 'favorites' | 'groups'>('all');
  const [showCallModal, setShowCallModal] = useState<'audio' | 'video' | null>(null);
  const [incomingCall, setIncomingCall] = useState<{ caller: string; type: 'audio' | 'video'; offer?: any } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [reactionTargetMsgId, setReactionTargetMsgId] = useState<string | null>(null);

  // ── FULL WHATSAPP FEATURE SUITE STATES ──
  const [replyingToMessage, setReplyingToMessage] = useState<ExtendedChatMessage | null>(null);
  const [isPartnerTyping, setIsPartnerTyping] = useState<boolean>(false);
  const partnerTypingTimerRef = useRef<number | null>(null);
  const lastTypingBroadcastRef = useRef<number>(0);

  // Starred messages modal
  const [showStarredModal, setShowStarredModal] = useState<boolean>(false);

  // Poll creation modal & form
  const [showPollModal, setShowPollModal] = useState<boolean>(false);
  const [pollQuestion, setPollQuestion] = useState<string>('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [pollAllowMultiple, setPollAllowMultiple] = useState<boolean>(false);

  // Chat Wallpaper modal & state
  const [showWallpaperModal, setShowWallpaperModal] = useState<boolean>(false);
  const [activeWallpaper, setActiveWallpaper] = useState<string>(() => {
    try {
      return localStorage.getItem('whatsapp_custom_wallpaper') || 'doodle';
    } catch {
      return 'doodle';
    }
  });

  // Real Audio Recording with MediaRecorder
  const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(false);
  const [recordingTimeSecs, setRecordingTimeSecs] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<number | null>(null);
  const [audioPlaybackRates, setAudioPlaybackRates] = useState<Record<string, number>>({});

  // Document file input ref
  const docInputRef = useRef<HTMLInputElement | null>(null);

  // ── SECURITY SECTION STATES ──
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [disguisePanic, setDisguisePanic] = useState(false);
  const [chatPinEnabled, setChatPinEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('study_chat_pin_enabled') === 'true';
    } catch {
      return false;
    }
  });
  const [isChatLocked, setIsChatLocked] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [copiedSafetyCode, setCopiedSafetyCode] = useState(false);

  // Advanced Privacy Toggle
  const [advancedPrivacy, setAdvancedPrivacy] = useState<boolean>(() => {
    try {
      return localStorage.getItem('studyportal_privacy_toggle') === 'true';
    } catch {
      return false;
    }
  });

  // Read Receipts State (WhatsApp Standard)
  const [readReceiptsEnabled, setReadReceiptsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('whatsapp_read_receipts_enabled');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });
  const readReceiptsEnabledRef = useRef(readReceiptsEnabled);
  useEffect(() => {
    readReceiptsEnabledRef.current = readReceiptsEnabled;
  }, [readReceiptsEnabled]);

  const handleToggleReadReceipts = () => {
    const next = !readReceiptsEnabled;
    setReadReceiptsEnabled(next);
    try {
      localStorage.setItem('whatsapp_read_receipts_enabled', String(next));
    } catch {}
  };

  // WhatsApp Message Status Ticks Renderer
  const renderMessageTicks = (msg: ExtendedChatMessage) => {
    if (msg.sender !== currentUser) return null;

    let status: 'sending' | 'sent' | 'delivered' | 'read' = msg.status || 'sent';

    if (!msg.status) {
      if (msg.read) {
        status = 'read';
      } else {
        const partnerRepliedAfter = messages.some(
          (m) => m.sender !== currentUser && (m.timestamp > msg.timestamp || m.id > msg.id)
        );
        status = partnerRepliedAfter ? 'read' : isPartnerOnline ? 'delivered' : 'sent';
      }
    }

    if (status === 'sending') {
      return (
        <span className="text-white/60 inline-flex items-center ml-1" title="Sending...">
          <Clock className="w-3 h-3" />
        </span>
      );
    }

    // Single grey tick: recipient offline / reached server
    if (status === 'sent') {
      return (
        <span
          className="text-[#8696a0] inline-flex items-center ml-1"
          title="One grey tick: Sent to server (Recipient is offline)"
        >
          <Check className="w-3.5 h-3.5 stroke-[2.3]" />
        </span>
      );
    }

    // Double grey tick: recipient online / delivered to phone
    if (status === 'delivered') {
      return (
        <span
          className="text-[#8696a0] inline-flex items-center ml-1"
          title="Two grey ticks: Delivered to recipient's phone"
        >
          <CheckCheck className="w-3.5 h-3.5 stroke-[2.3]" />
        </span>
      );
    }

    // status === 'read'
    if (!readReceiptsEnabled) {
      // Turning it off: Hide read receipts (remains double grey)
      return (
        <span
          className="text-[#8696a0] inline-flex items-center ml-1"
          title="Two grey ticks: Delivered (Read receipts turned off in Settings > Privacy)"
        >
          <CheckCheck className="w-3.5 h-3.5 stroke-[2.3]" />
        </span>
      );
    }

    // Double blue tick: recipient opened and read the message
    return (
      <span
        className="text-[#53bdeb] inline-flex items-center ml-1"
        title="Two blue ticks: Recipient opened the chat and read your message."
      >
        <CheckCheck className="w-3.5 h-3.5 stroke-[2.3]" />
      </span>
    );
  };

  // Media Sender Preview Modal State (Photo or Video)
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaThumbnail, setMediaThumbnail] = useState('');
  const [mediaDuration, setMediaDuration] = useState('');
  const [mediaFileSizeKb, setMediaFileSizeKb] = useState(0);
  const [mediaCaption, setMediaCaption] = useState('');
  const [isHdSelected, setIsHdSelected] = useState(false);
  const [isViewOnceSelected, setIsViewOnceSelected] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Fullscreen WhatsApp Lightbox / Media Viewer
  const [lightboxMedia, setLightboxMedia] = useState<{
    url: string;
    type: 'image' | 'video';
    caption?: string;
    sender: string;
    time: string;
    isViewOnce?: boolean;
    msgId?: string;
  } | null>(null);

  // Audio recording simulation state
  const [isPlayingAudioId, setIsPlayingAudioId] = useState<string | null>(null);
  const [showTranscriptIds, setShowTranscriptIds] = useState<Record<string, boolean>>({});

  // Active reaction popover message id
  const [reactionBubbleId, setReactionBubbleId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const channelRef = useRef<any>(null);

  // Save messages permanently to localStorage and broadcast
  const persistMessages = (newMessages: ExtendedChatMessage[]) => {
    setMessages(newMessages);
    try {
      localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(newMessages));
    } catch {}
  };

  // Sync cross-tab messages permanently
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_MESSAGES_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setMessages(parsed);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Continuous bi-directional synchronization with Supabase backend
  const syncWithRemote = useRef<() => Promise<void>>(async () => {});

  syncWithRemote.current = async () => {
    try {
      const remote = await fetchRemoteMessages();
      if (remote && remote.length > 0) {
        setMessages((prev) => {
          const merged = mergeMessages(prev, remote);
          // Check if any change exists
          if (
            merged.length !== prev.length ||
            merged.some((m, idx) => {
              const p = prev[idx];
              if (!p) return true;
              return (
                m.id !== p.id ||
                m.status !== p.status ||
                m.isPinned !== p.isPinned ||
                m.isOpened !== p.isOpened ||
                JSON.stringify(m.reactions || {}) !== JSON.stringify(p.reactions || {})
              );
            })
          ) {
            try {
              localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(merged));
            } catch {}
            return merged;
          }
          return prev;
        });
      }
    } catch (err) {
      console.warn('Sync failed:', err);
    }
  };

  // Initial load from Supabase on mount
  useEffect(() => {
    syncWithRemote.current();
  }, []);

  // Continuous smart background sync (every 2.5s) to guarantee phone and laptop stay 100% in sync
  useEffect(() => {
    const syncInterval = setInterval(() => {
      syncWithRemote.current();
    }, 2500);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncWithRemote.current();
      }
    };

    const handleFocus = () => {
      syncWithRemote.current();
    };

    const handleOnline = () => {
      syncWithRemote.current();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(syncInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleLogout = () => {
    const now = Date.now();
    try {
      localStorage.removeItem(`whatsapp_active_${currentUser}`);
      localStorage.setItem(`whatsapp_last_seen_${currentUser}`, String(now));
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'user_offline',
          payload: { user: currentUser, lastSeen: now },
        });
        channelRef.current.untrack();
      }
    } catch {}
    logoutChat();
  };

  // Emergency Panic Camouflage hotkey: Press Escape anywhere to camouflage
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDisguisePanic((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Local heartbeat for instant same-browser & cross-tab detection
  useEffect(() => {
    const markActive = () => {
      try {
        localStorage.setItem(`whatsapp_active_${currentUser}`, String(Date.now()));
      } catch {}
    };
    markActive();
    const interval = setInterval(markActive, 2500);

    const checkPartner = () => {
      try {
        const partnerActive = localStorage.getItem(`whatsapp_active_${partnerUser}`);
        let onlineLocally = false;
        if (partnerActive) {
          const diff = Date.now() - Number(partnerActive);
          if (diff < 5000) {
            onlineLocally = true;
          }
        }

        // Check Supabase presence state as well
        const presenceState = channelRef.current?.presenceState?.() || {};
        const partnerPresences = presenceState[partnerUser];
        const onlineRemotely = Boolean(partnerPresences && partnerPresences.length > 0);

        const isNowOnline = onlineLocally || onlineRemotely;
        setIsPartnerOnline(isNowOnline);

        if (!isNowOnline) {
          const savedLastSeen = localStorage.getItem(`whatsapp_last_seen_${partnerUser}`);
          if (savedLastSeen) setPartnerLastSeen(Number(savedLastSeen));
        }
      } catch {}
    };
    const partnerCheckInterval = setInterval(checkPartner, 2000);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === `whatsapp_active_${partnerUser}`) {
        if (e.newValue) {
          const diff = Date.now() - Number(e.newValue);
          setIsPartnerOnline(diff < 5000);
        } else {
          setIsPartnerOnline(false);
        }
      }
      if (e.key === `whatsapp_last_seen_${partnerUser}` && e.newValue) {
        setPartnerLastSeen(Number(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);

    const handleBeforeUnload = () => {
      const now = Date.now();
      try {
        localStorage.removeItem(`whatsapp_active_${currentUser}`);
        localStorage.setItem(`whatsapp_last_seen_${currentUser}`, String(now));
        if (channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'user_offline',
            payload: { user: currentUser, lastSeen: now },
          });
        }
      } catch {}
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      clearInterval(partnerCheckInterval);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [currentUser, partnerUser]);

  // Supabase Realtime channel setup with Presence Tracking
  useEffect(() => {
    try {
      const supabase = getSupabase();
      const channel = supabase.channel('whatsapp-one-on-one-room', {
        config: {
          broadcast: { self: true },
          presence: {
            key: currentUser,
          },
        },
      });
      channelRef.current = channel;

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const partnerPresences = state[partnerUser];
          if (partnerPresences && partnerPresences.length > 0) {
            setIsPartnerOnline(true);
            // Upgrade any sent messages to delivered
            setMessages((prev) => {
              let updatedAny = false;
              const next = prev.map((m) => {
                if (m.sender === currentUser && m.status === 'sent') {
                  updatedAny = true;
                  return { ...m, status: 'delivered' as const };
                }
                return m;
              });
              if (updatedAny) {
                try {
                  localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(next));
                } catch {}
              }
              return next;
            });
          } else {
            const partnerActive = localStorage.getItem(`whatsapp_active_${partnerUser}`);
            if (!partnerActive || Date.now() - Number(partnerActive) >= 9000) {
              setIsPartnerOnline(false);
              const savedLastSeen = localStorage.getItem(`whatsapp_last_seen_${partnerUser}`);
              if (savedLastSeen) setPartnerLastSeen(Number(savedLastSeen));
            }
          }
        })
        .on('presence', { event: 'join' }, ({ key }) => {
          if (key === partnerUser) {
            setIsPartnerOnline(true);
            setMessages((prev) => {
              let updatedAny = false;
              const next = prev.map((m) => {
                if (m.sender === currentUser && m.status === 'sent') {
                  updatedAny = true;
                  return { ...m, status: 'delivered' as const };
                }
                return m;
              });
              if (updatedAny) {
                try {
                  localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(next));
                } catch {}
              }
              return next;
            });
          }
        })
        .on('presence', { event: 'leave' }, ({ key }) => {
          if (key === partnerUser) {
            setIsPartnerOnline(false);
            const now = Date.now();
            setPartnerLastSeen(now);
            try {
              localStorage.setItem(`whatsapp_last_seen_${partnerUser}`, String(now));
            } catch {}
          }
        })
        .on('broadcast', { event: 'user_online' }, (payload) => {
          if (payload?.payload?.user === partnerUser) {
            setIsPartnerOnline(true);
            setMessages((prev) => {
              let updatedAny = false;
              const next = prev.map((m) => {
                if (m.sender === currentUser && m.status === 'sent') {
                  updatedAny = true;
                  return { ...m, status: 'delivered' as const };
                }
                return m;
              });
              if (updatedAny) {
                try {
                  localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(next));
                } catch {}
              }
              return next;
            });
          }
        })
        .on('broadcast', { event: 'user_offline' }, (payload) => {
          if (payload?.payload?.user === partnerUser) {
            setIsPartnerOnline(false);
            const ts = payload?.payload?.lastSeen || Date.now();
            setPartnerLastSeen(ts);
            try {
              localStorage.setItem(`whatsapp_last_seen_${partnerUser}`, String(ts));
            } catch {}
          }
        })
        .on('broadcast', { event: 'new_message' }, (payload) => {
          if (payload?.payload) {
            const incoming = payload.payload as ExtendedChatMessage;
            setMessages((prev) => {
              if (prev.some((m) => m.id === incoming.id)) return prev;
              const next = [...prev, incoming];
              try {
                localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(next));
              } catch {}
              return next;
            });

            // If we are the recipient and currently in the chat view:
            if (incoming.sender !== currentUser) {
              updateRemoteStatus(incoming.id, 'delivered');
              try {
                channel.send({
                  type: 'broadcast',
                  event: 'message_status_update',
                  payload: {
                    msgId: incoming.id,
                    status: 'delivered',
                  },
                });
              } catch {}

              // If chat is open, user immediately views it -> mark as 'read' (double blue tick)
              if (readReceiptsEnabledRef.current) {
                setTimeout(() => {
                  updateRemoteStatus(incoming.id, 'read');
                  try {
                    channel.send({
                      type: 'broadcast',
                      event: 'message_status_update',
                      payload: {
                        msgId: incoming.id,
                        status: 'read',
                      },
                    });
                  } catch {}
                }, 400);
              }
            }
          }
        })
        .on('broadcast', { event: 'message_status_update' }, (payload) => {
          if (payload?.payload) {
            const { msgId, status } = payload.payload;
            setMessages((prev) => {
              const updated = prev.map((m) => {
                if (m.id !== msgId) return m;
                return {
                  ...m,
                  status: status as 'delivered' | 'read',
                  read: status === 'read' ? true : m.read,
                };
              });
              try {
                localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(updated));
              } catch {}
              return updated;
            });
          }
        })
        .on('broadcast', { event: 'all_messages_read' }, (payload) => {
          if (payload?.payload?.reader === partnerUser) {
            setMessages((prev) => {
              let changed = false;
              const updated = prev.map((m) => {
                if (m.sender === currentUser && m.status !== 'read') {
                  changed = true;
                  return { ...m, status: 'read' as const, read: true };
                }
                return m;
              });
              if (changed) {
                try {
                  localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(updated));
                } catch {}
              }
              return updated;
            });
          }
        })
        .on('broadcast', { event: 'reaction' }, (payload) => {
          if (payload?.payload) {
            const { msgId, emoji, user } = payload.payload;
            handleApplyReaction(msgId, emoji, user, false);
          }
        })
        .on('broadcast', { event: 'message_deleted' }, (payload) => {
          if (payload?.payload?.msgId) {
            const delId = payload.payload.msgId;
            setMessages((prev) => {
              const next = prev.filter((m) => m.id !== delId);
              try {
                localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(next));
              } catch {}
              return next;
            });
          }
        })
        .on('broadcast', { event: 'pin_update' }, (payload) => {
          if (payload?.payload) {
            const { msgId, isPinned } = payload.payload;
            setMessages((prev) => {
              const next = prev.map((m) => (m.id === msgId ? { ...m, isPinned } : m));
              try {
                localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(next));
              } catch {}
              return next;
            });
          }
        })
        .on('broadcast', { event: 'user_typing' }, (payload) => {
          if (payload?.payload?.user === partnerUser) {
            setIsPartnerTyping(true);
            if (partnerTypingTimerRef.current) clearTimeout(partnerTypingTimerRef.current);
            partnerTypingTimerRef.current = window.setTimeout(() => {
              setIsPartnerTyping(false);
            }, 2500);
          }
        })
        .on('broadcast', { event: 'message_starred' }, (payload) => {
          if (payload?.payload) {
            const { msgId, isStarred } = payload.payload;
            setMessages((prev) => {
              const next = prev.map((m) => (m.id === msgId ? { ...m, isStarred } : m));
              try {
                localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(next));
              } catch {}
              return next;
            });
          }
        })
        .on('broadcast', { event: 'poll_vote' }, (payload) => {
          if (payload?.payload) {
            const { msgId, poll } = payload.payload;
            setMessages((prev) => {
              const next = prev.map((m) => (m.id === msgId ? { ...m, poll } : m));
              try {
                localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(next));
              } catch {}
              return next;
            });
          }
        })
        .on('broadcast', { event: 'call_offer' }, (payload) => {
          if (payload?.payload?.recipient === currentUser) {
            setIncomingCall({
              caller: payload.payload.caller,
              type: payload.payload.callType,
              offer: payload.payload.offer,
            });
          }
        })
        .on('broadcast', { event: 'call_declined' }, () => {
          setShowCallModal(null);
          setIncomingCall(null);
        })
        .on('broadcast', { event: 'call_ended' }, () => {
          setShowCallModal(null);
          setIncomingCall(null);
        })
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `chat_id=eq.${CHAT_ID}`,
          },
          (payload) => {
            if (payload?.new) {
              const incoming = rowToMessage(payload.new);
              setMessages((prev) => {
                if (prev.some((m) => m.id === incoming.id)) return prev;
                const next = [...prev, incoming];
                try {
                  localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(next));
                } catch {}
                return next;
              });
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `chat_id=eq.${CHAT_ID}`,
          },
          (payload) => {
            if (payload?.new) {
              const updated = rowToMessage(payload.new);
              setMessages((prev) => {
                const next = prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m));
                try {
                  localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(next));
                } catch {}
                return next;
              });
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'messages',
          },
          (payload) => {
            if (payload?.old?.id) {
              const delId = payload.old.id;
              setMessages((prev) => {
                const next = prev.filter((m) => m.id !== delId);
                try {
                  localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(next));
                } catch {}
                return next;
              });
            }
          }
        )
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              user: currentUser,
              online: true,
              lastSeen: Date.now(),
            });

            // Announce presence online
            channel.send({
              type: 'broadcast',
              event: 'user_online',
              payload: { user: currentUser },
            });

            // If we have read receipts enabled, mark all incoming unread messages as read
            if (readReceiptsEnabledRef.current) {
              markAllIncomingAsRead(currentUser);
              channel.send({
                type: 'broadcast',
                event: 'all_messages_read',
                payload: { reader: currentUser, readUpTo: Date.now() },
              });
            }

            // Sync with Supabase on connect
            syncWithRemote.current();
          }
        });

      return () => {
        try {
          channel.untrack();
        } catch {}
        supabase.removeChannel(channel);
      };
    } catch {}
  }, [currentUser, partnerUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Media Selected (Photo or Video from Camera or Gallery)
  const handleMediaFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isImage && !isVideo) {
      alert('Please select an image or video file.');
      return;
    }

    setMediaType(isVideo ? 'video' : 'image');
    setMediaCaption('');
    setIsHdSelected(false);
    setIsViewOnceSelected(false);
    const sizeKb = Math.round(file.size / 1024);
    setMediaFileSizeKb(sizeKb);

    if (isVideo) {
      const objectUrl = URL.createObjectURL(file);
      setMediaUrl(objectUrl);

      // Generate video thumbnail and calculate duration
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.src = objectUrl;
      tempVideo.muted = true;
      tempVideo.playsInline = true;

      tempVideo.onloadedmetadata = () => {
        const secs = Math.round(tempVideo.duration) || 0;
        const mins = Math.floor(secs / 60);
        const remSecs = secs % 60;
        const durStr = `${mins}:${remSecs < 10 ? '0' : ''}${remSecs}`;
        setMediaDuration(durStr);
        tempVideo.currentTime = Math.min(1, Math.max(0, tempVideo.duration / 2));
      };

      tempVideo.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = Math.min(640, tempVideo.videoWidth || 640);
          canvas.height = Math.min(360, tempVideo.videoHeight || 360);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
            const thumb = canvas.toDataURL('image/jpeg', 0.8);
            setMediaThumbnail(thumb);
          }
        } catch {}
      };

      setMediaModalOpen(true);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawData = event.target?.result as string;
        if (!rawData) return;

        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const maxDim = isHdSelected ? 1920 : 1280;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const finalUrl = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.85);
            setMediaUrl(finalUrl);
            setMediaThumbnail(finalUrl);
            setMediaModalOpen(true);
          } else {
            setMediaUrl(rawData);
            setMediaThumbnail(rawData);
            setMediaModalOpen(true);
          }
        };
        img.src = rawData;
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };


  // Typing Debouncer
  const handleInputTextChange = (val: string) => {
    setInputText(val);
    const now = Date.now();
    if (now - lastTypingBroadcastRef.current > 1800) {
      lastTypingBroadcastRef.current = now;
      try {
        channelRef.current?.send({
          type: 'broadcast',
          event: 'user_typing',
          payload: { user: currentUser },
        });
      } catch {}
    }
  };

  // Reply Quoting
  const handleStartReply = (msg: ExtendedChatMessage) => {
    setReplyingToMessage(msg);
  };

  // Toggle Starred Message
  const handleToggleStarMessage = (msgId: string) => {
    let nextStarred = false;
    setMessages((prev) => {
      const target = prev.find((m) => m.id === msgId);
      if (!target) return prev;
      nextStarred = !target.isStarred;
      const next = prev.map((m) => (m.id === msgId ? { ...m, isStarred: nextStarred } : m));
      try {
        localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

    updateRemoteStar(msgId, nextStarred);

    try {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'message_starred',
        payload: { msgId, isStarred: nextStarred },
      });
    } catch {}
  };

  // Vote on Interactive Poll
  const handleVotePoll = (msgId: string, optionId: string) => {
    let updatedPoll: ExtendedChatMessage['poll'] = undefined;
    setMessages((prev) => {
      const target = prev.find((m) => m.id === msgId);
      if (!target || !target.poll) return prev;

      const currentPoll = target.poll;
      const isMulti = currentPoll.pollType === 'multi';

      const updatedOptions = currentPoll.options.map((opt) => {
        const hasVoted = opt.votes.includes(currentUser);
        if (opt.id === optionId) {
          return {
            ...opt,
            votes: hasVoted ? opt.votes.filter((u) => u !== currentUser) : [...opt.votes, currentUser],
          };
        } else if (!isMulti) {
          return {
            ...opt,
            votes: opt.votes.filter((u) => u !== currentUser),
          };
        }
        return opt;
      });

      updatedPoll = {
        ...currentPoll,
        options: updatedOptions,
      };

      const next = prev.map((m) => (m.id === msgId ? { ...m, poll: updatedPoll } : m));
      try {
        localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

    if (updatedPoll) {
      updateRemotePoll(msgId, updatedPoll);
      try {
        channelRef.current?.send({
          type: 'broadcast',
          event: 'poll_vote',
          payload: { msgId, poll: updatedPoll },
        });
      } catch {}
    }
  };

  // Create Interactive Poll
  const handleCreatePoll = () => {
    const q = pollQuestion.trim();
    const validOpts = pollOptions.map((o) => o.trim()).filter(Boolean);
    if (!q) {
      alert('Please enter a poll question.');
      return;
    }
    if (validOpts.length < 2) {
      alert('Please provide at least 2 options.');
      return;
    }

    const pollObj: ExtendedChatMessage['poll'] = {
      question: q,
      options: validOpts.map((opt, idx) => ({
        id: `opt-${idx}-${Date.now()}`,
        text: opt,
        votes: [],
      })),
      pollType: pollAllowMultiple ? 'multi' : 'single',
    };

    const initialStatus: 'sent' | 'delivered' = isPartnerOnlineRef.current ? 'delivered' : 'sent';
    const newMsg: ExtendedChatMessage = {
      id: 'msg-poll-' + Date.now(),
      sender: currentUser,
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      read: false,
      status: initialStatus,
      type: 'poll',
      poll: pollObj,
      replyTo: replyingToMessage
        ? {
            id: replyingToMessage.id,
            sender: replyingToMessage.sender,
            text: replyingToMessage.text || replyingToMessage.type || 'Message',
          }
        : undefined,
    };

    const next = [...messages, newMsg];
    persistMessages(next);
    saveRemoteMessage(newMsg);
    setReplyingToMessage(null);
    setShowPollModal(false);
    setPollQuestion('');
    setPollOptions(['', '']);

    try {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'new_message',
        payload: newMsg,
      });
    } catch {}
  };

  // Real Audio Recording with MediaRecorder
  const handleStartAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start(100);
      setIsRecordingAudio(true);
      setRecordingTimeSecs(0);

      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingTimeSecs((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('[Audio] Mic access denied; using standard voice note', err);
      handleSendVoiceNote();
    }
  };

  const handleCancelAudioRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      mediaRecorderRef.current = null;
    }
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    audioChunksRef.current = [];
    setIsRecordingAudio(false);
    setRecordingTimeSecs(0);
  };

  const handleSendRealAudioRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    const totalSecs = Math.max(1, recordingTimeSecs);

    recorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result as string;
        const initialStatus: 'sent' | 'delivered' = isPartnerOnlineRef.current ? 'delivered' : 'sent';
        const durStr = `${Math.floor(totalSecs / 60)}:${totalSecs % 60 < 10 ? '0' : ''}${totalSecs % 60}`;

        const newMsg: ExtendedChatMessage = {
          id: 'msg-voice-' + Date.now(),
          sender: currentUser,
          text: `Voice Note (${durStr})`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
          read: false,
          status: initialStatus,
          type: 'voice',
          audioUrl: base64Audio,
          mediaUrl: base64Audio,
          audioDuration: totalSecs,
          duration: durStr,
          replyTo: replyingToMessage
            ? {
                id: replyingToMessage.id,
                sender: replyingToMessage.sender,
                text: replyingToMessage.text || replyingToMessage.type || 'Message',
              }
            : undefined,
        };

        const next = [...messages, newMsg];
        persistMessages(next);
        saveRemoteMessage(newMsg);
        setReplyingToMessage(null);

        try {
          channelRef.current?.send({
            type: 'broadcast',
            event: 'new_message',
            payload: newMsg,
          });
        } catch {}
      };
      reader.readAsDataURL(audioBlob);
      recorder.stream.getTracks().forEach((t) => t.stop());
    };

    recorder.stop();
    setIsRecordingAudio(false);
    setRecordingTimeSecs(0);
  };

  // Document File Upload
  const handleDocumentFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr =
      file.size > 1048576
        ? `${(file.size / 1048576).toFixed(1)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawData = event.target?.result as string;
      if (!rawData) return;

      const initialStatus: 'sent' | 'delivered' = isPartnerOnlineRef.current ? 'delivered' : 'sent';
      const newMsg: ExtendedChatMessage = {
        id: 'msg-doc-' + Date.now(),
        sender: currentUser,
        text: file.name,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        read: false,
        status: initialStatus,
        type: 'document',
        documentName: file.name,
        documentSize: sizeStr,
        documentUrl: rawData,
        mediaUrl: rawData,
        replyTo: replyingToMessage
          ? {
              id: replyingToMessage.id,
              sender: replyingToMessage.sender,
              text: replyingToMessage.text || replyingToMessage.type || 'Message',
            }
          : undefined,
      };

      const next = [...messages, newMsg];
      persistMessages(next);
      saveRemoteMessage(newMsg);
      setReplyingToMessage(null);

      try {
        channelRef.current?.send({
          type: 'broadcast',
          event: 'new_message',
          payload: newMsg,
        });
      } catch {}
    };
    reader.readAsDataURL(file);
    e.target.value = '';
    setShowAttachMenu(false);
  };

  // Export Chat to Text File
  const handleExportChat = () => {
    const lines = messages.map((m) => {
      const senderName = m.sender === 'sadhana' ? 'Sadhana' : 'Surya';
      const timeStr = m.time || new Date(m.timestamp).toLocaleTimeString();
      let content = m.text || '';
      if (m.type === 'image') content = '[Photo] ' + content;
      else if (m.type === 'video') content = '[Video] ' + content;
      else if (m.type === 'voice') content = '[Voice Note] ' + content;
      else if (m.type === 'poll' && m.poll) content = `[Poll: ${m.poll.question}]`;
      else if (m.type === 'document') content = `[Document: ${m.documentName || m.text}]`;
      return `[${timeStr}] ${senderName}: ${content}`;
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WhatsApp_Chat_with_${partnerName}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShowMenu(false);
  };

  // Clear Chat for Everyone
  const handleClearAllChat = () => {
    if (confirm('Clear all messages in this chat? This cannot be undone.')) {
      messages.forEach((m) => deleteRemoteMessage(m.id));
      persistMessages([]);
      setShowMenu(false);
      try {
        channelRef.current?.send({
          type: 'broadcast',
          event: 'chat_cleared',
          payload: { user: currentUser },
        });
      } catch {}
    }
  };

  // Wallpaper Style Provider
  const getWallpaperStyle = () => {
    if (activeWallpaper === 'obsidian') {
      return { backgroundColor: '#0a0f12', backgroundImage: 'none' };
    }
    if (activeWallpaper === 'emerald') {
      return { backgroundColor: '#071a14', backgroundImage: 'none' };
    }
    if (activeWallpaper === 'teal') {
      return { backgroundColor: '#0b191e', backgroundImage: 'none' };
    }
    if (activeWallpaper === 'coffee') {
      return { backgroundColor: '#181512', backgroundImage: 'none' };
    }
    return {
      backgroundColor: '#0c1317',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='90' height='90' viewBox='0 0 90 90' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2353bdeb' fill-opacity='0.08' fill-rule='evenodd'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z'/%3E%3C/g%3E%3C/svg%3E")`,
    };
  };

  // Send a Text Message
  const handleSendText = () => {
    const text = inputText.trim();
    if (!text) return;

    const initialStatus: 'sent' | 'delivered' = isPartnerOnlineRef.current ? 'delivered' : 'sent';

    const newMsg: ExtendedChatMessage = {
      id: 'msg-' + Date.now(),
      sender: currentUser,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      read: false,
      status: initialStatus,
      type: 'text',
      fileSizeKb: Math.max(1, Math.round(text.length * 0.05)),
      replyTo: replyingToMessage ? { id: replyingToMessage.id, sender: replyingToMessage.sender, text: replyingToMessage.text || replyingToMessage.type || 'Message' } : undefined,
    };
    setReplyingToMessage(null);

    const next = [...messages, newMsg];
    persistMessages(next);
    setInputText('');

    // Persist to central Supabase DB for cross-device sync
    saveRemoteMessage(newMsg);

    try {
      const activeChannel = channelRef.current || getSupabase().channel('whatsapp-one-on-one-room');
      activeChannel.send({
        type: 'broadcast',
        event: 'new_message',
        payload: newMsg,
      });
    } catch {}
  };

  // Send a Photo or Video (Standard or HD, Regular or View-Once)
  const handleSendMedia = () => {
    if (!mediaUrl) return;

    const initialStatus: 'sent' | 'delivered' = isPartnerOnlineRef.current ? 'delivered' : 'sent';
    const isVideo = mediaType === 'video';

    const newMsg: ExtendedChatMessage = {
      id: `msg-${isVideo ? 'vid' : 'img'}-${Date.now()}`,
      sender: currentUser,
      text: mediaCaption.trim() || (isVideo ? 'Video' : isHdSelected ? 'High Definition Photo' : 'Photo'),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      read: false,
      status: initialStatus,
      type: isVideo ? 'video' : 'image',
      mediaUrl: mediaUrl,
      thumbnailUrl: mediaThumbnail || (isVideo ? undefined : mediaUrl),
      duration: mediaDuration,
      isHd: isHdSelected,
      isViewOnce: isViewOnceSelected,
      isOpened: false,
      fileSizeKb: mediaFileSizeKb || (isVideo ? 2450 : isHdSelected ? 1200 : 420),
      replyTo: replyingToMessage ? { id: replyingToMessage.id, sender: replyingToMessage.sender, text: replyingToMessage.text || replyingToMessage.type || 'Media' } : undefined,
    };
    setReplyingToMessage(null);

    const next = [...messages, newMsg];
    persistMessages(next);
    setMediaModalOpen(false);
    setMediaUrl('');
    setMediaThumbnail('');
    setMediaCaption('');
    setIsHdSelected(false);
    setIsViewOnceSelected(false);

    // Persist to central Supabase DB for cross-device sync
    saveRemoteMessage(newMsg);

    try {
      const activeChannel = channelRef.current || getSupabase().channel('whatsapp-one-on-one-room');
      const broadcastPayload = {
        ...newMsg,
        mediaUrl: mediaUrl.startsWith('blob:') ? (mediaThumbnail || mediaUrl) : mediaUrl,
      };
      activeChannel.send({
        type: 'broadcast',
        event: 'new_message',
        payload: broadcastPayload,
      });
    } catch {}
  };

  // Open media in Fullscreen Lightbox / Media Viewer
  const openLightbox = (msg: ExtendedChatMessage) => {
    setLightboxMedia({
      url: msg.mediaUrl || msg.thumbnailUrl || '',
      type: msg.type === 'video' ? 'video' : 'image',
      caption: msg.text,
      sender: msg.sender,
      time: msg.time,
      isViewOnce: msg.isViewOnce,
      msgId: msg.id,
    });
  };

  // Open View Once Media
  const handleOpenViewOnce = (msg: ExtendedChatMessage) => {
    openLightbox(msg);

    // Permanently mark as opened
    setMessages((prev) => {
      const updated = prev.map((m) => (m.id === msg.id ? { ...m, isOpened: true } : m));
      try {
        localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Send a Voice Note with Transcript & View-Once support
  const handleSendVoiceNote = () => {
    const transcriptsList = [
      "Hey! Let me know once you finish reviewing the calculus chapter! 🎧",
      "I just completed the practice MCQs, the concepts are crystal clear now!",
      "Are you available for a quick study session this evening? 📚",
    ];
    const randomTranscript = transcriptsList[Math.floor(Math.random() * transcriptsList.length)];

    const initialStatus: 'sent' | 'delivered' = isPartnerOnlineRef.current ? 'delivered' : 'sent';

    const newMsg: ExtendedChatMessage = {
      id: 'msg-voice-' + Date.now(),
      sender: currentUser,
      text: 'Voice Note (0:12)',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      read: false,
      status: initialStatus,
      type: 'voice',
      transcript: randomTranscript,
      isViewOnce: false,
      isOpened: false,
      fileSizeKb: 680,
    };

    const next = [...messages, newMsg];
    persistMessages(next);

    // Persist to central Supabase DB for cross-device sync
    saveRemoteMessage(newMsg);

    try {
      const activeChannel = channelRef.current || getSupabase().channel('whatsapp-one-on-one-room');
      activeChannel.send({
        type: 'broadcast',
        event: 'new_message',
        payload: newMsg,
      });
    } catch {}
  };

  // Add Emoji Reaction
  const handleApplyReaction = (
    msgId: string,
    emoji: string,
    user: 'surya' | 'sadhana' = currentUser,
    broadcast = true
  ) => {
    let updatedReactionsForMsg: Record<string, string[]> = {};
    setMessages((prev) => {
      const updated = prev.map((m) => {
        if (m.id !== msgId) return m;
        const currentReactions = m.reactions || {};
        const usersForEmoji = currentReactions[emoji] || [];
        const nextUsers = usersForEmoji.includes(user)
          ? usersForEmoji.filter((u) => u !== user)
          : [...usersForEmoji, user];

        updatedReactionsForMsg = {
          ...currentReactions,
          [emoji]: nextUsers,
        };
        return {
          ...m,
          reactions: updatedReactionsForMsg,
        };
      });
      localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(updated));
      return updated;
    });

    setReactionBubbleId(null);

    // Persist reaction update to Supabase DB
    updateRemoteReactions(msgId, updatedReactionsForMsg);

    if (broadcast) {
      try {
        const activeChannel = channelRef.current || getSupabase().channel('whatsapp-one-on-one-room');
        activeChannel.send({
          type: 'broadcast',
          event: 'reaction',
          payload: { msgId, emoji, user },
        });
      } catch {}
    }
  };

  // Pin Message (Up to 3)
  const handleTogglePin = (msgId: string) => {
    let nextPinnedState = false;
    setMessages((prev) => {
      const target = prev.find((m) => m.id === msgId);
      if (!target) return prev;

      const currentlyPinned = prev.filter((m) => m.isPinned);
      if (!target.isPinned && currentlyPinned.length >= 3) {
        alert('You can pin up to 3 messages to the top of any chat.');
        return prev;
      }

      nextPinnedState = !target.isPinned;
      const next = prev.map((m) => (m.id === msgId ? { ...m, isPinned: nextPinnedState } : m));
      localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(next));
      return next;
    });

    // Persist pin update to Supabase DB
    updateRemotePin(msgId, nextPinnedState);

    try {
      const activeChannel = channelRef.current || getSupabase().channel('whatsapp-one-on-one-room');
      activeChannel.send({
        type: 'broadcast',
        event: 'pin_update',
        payload: { msgId, isPinned: nextPinnedState },
      });
    } catch {}
  };

  // Delete message
  const handleDeleteMessage = (msgId: string) => {
    const next = messages.filter((m) => m.id !== msgId);
    persistMessages(next);

    // Delete message from Supabase DB
    deleteRemoteMessage(msgId);

    try {
      const activeChannel = channelRef.current || getSupabase().channel('whatsapp-one-on-one-room');
      activeChannel.send({
        type: 'broadcast',
        event: 'message_deleted',
        payload: { msgId },
      });
    } catch {}
  };

  // Handle call completion / close and log call summary message into chat
  const handleCallFinished = (durationSecs: number, status: 'completed' | 'missed' | 'declined') => {
    const activeType = showCallModal || incomingCall?.type || 'video';
    setShowCallModal(null);
    setIncomingCall(null);

    let callText = '';
    if (status === 'completed' && durationSecs > 0) {
      const mins = Math.floor(durationSecs / 60);
      const secs = durationSecs % 60;
      const durStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
      callText = `📞 WhatsApp ${activeType === 'video' ? 'Video' : 'Voice'} Call • ${durStr}`;
    } else if (status === 'missed') {
      callText = `📞 Missed WhatsApp ${activeType === 'video' ? 'Video' : 'Voice'} Call`;
    }

    if (callText) {
      const newMsg: ExtendedChatMessage = {
        id: 'msg-call-' + Date.now(),
        sender: currentUser,
        text: callText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        read: false,
        status: isPartnerOnlineRef.current ? 'delivered' : 'sent',
        type: 'text',
      };
      const next = [...messages, newMsg];
      persistMessages(next);

      // Persist call log to Supabase DB
      saveRemoteMessage(newMsg);

      try {
        channelRef.current?.send({
          type: 'broadcast',
          event: 'new_message',
          payload: newMsg,
        });
      } catch {}
    }
  };

  // Pinned Messages list
  const pinnedMessages = useMemo(() => messages.filter((m) => m.isPinned).slice(0, 3), [messages]);

  // Storage calculation for Targeted Manage Storage Utility
  const storageStats = useMemo(() => {
    let totalKb = 0;
    let photosCount = 0;
    let voiceCount = 0;
    let textCount = 0;

    messages.forEach((m) => {
      const kb = m.fileSizeKb || 1;
      totalKb += kb;
      if (m.type === 'image') photosCount++;
      else if (m.type === 'voice') voiceCount++;
      else textCount++;
    });

    const totalMb = (totalKb / 1024).toFixed(2);
    return { totalMb, totalKb, photosCount, voiceCount, textCount };
  }, [messages]);

  const handleClearMediaStorage = () => {
    if (confirm(`Clear all heavy media files from this chat? This will remove photos and voice notes.`)) {
      const cleared = messages.filter((m) => m.type !== 'image' && m.type !== 'voice');
      persistMessages(cleared);
      setShowStorageModal(false);
    }
  };

  const handleTogglePrivacy = () => {
    const next = !advancedPrivacy;
    setAdvancedPrivacy(next);
    localStorage.setItem('studyportal_privacy_toggle', String(next));
  };

  const handleToggleChatPin = () => {
    const next = !chatPinEnabled;
    setChatPinEnabled(next);
    localStorage.setItem('study_chat_pin_enabled', String(next));
  };

  const handleUnlockPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === '0929' || enteredPin === '0910' || enteredPin === '2902') {
      setIsChatLocked(false);
      setEnteredPin('');
      setPinError('');
    } else {
      setPinError('Incorrect 4-digit Security PIN. Please try again.');
    }
  };

  const handleCopySafetyCode = () => {
    const safetyNumber = '52910 09102 00729 02200 81928 47291 93820 18472 90184 75619 38291 04928';
    navigator.clipboard.writeText(safetyNumber);
    setCopiedSafetyCode(true);
    setTimeout(() => setCopiedSafetyCode(false), 2500);
  };

  // Text formatting parser (*bold*, _italic_, ~strike~, `code`, and Vector SVG emojis!)
  const renderFormattedText = (content: string) => {
    // Check if message contains strictly 1 to 3 emojis without other text -> render large like WhatsApp!
    const trimmed = content.trim();
    const pureEmojiMatches = trimmed.match(EMOJI_REGEX);
    if (
      pureEmojiMatches &&
      pureEmojiMatches.join('') === trimmed.replace(/\s+/g, '') &&
      pureEmojiMatches.length <= 3
    ) {
      const sizeClass =
        pureEmojiMatches.length === 1
          ? 'w-14 h-14 sm:w-16 sm:h-16'
          : pureEmojiMatches.length === 2
          ? 'w-10 h-10 sm:w-12 sm:h-12'
          : 'w-8 h-8 sm:w-10 sm:h-10';
      return (
        <div className="flex items-center gap-2 py-1 flex-wrap">
          {pureEmojiMatches.map((em, idx) => (
            <EmojiSvg
              key={`pure-em-${idx}`}
              emoji={em}
              className={`${sizeClass} object-contain transition-transform hover:scale-110 drop-shadow-md`}
            />
          ))}
        </div>
      );
    }

    const boldRegex = /\*([^*]+)\*/g;
    const italicRegex = /_([^_]+)_/g;
    const strikeRegex = /~([^~]+)~/g;
    const codeRegex = /`([^`]+)`/g;

    let parts: (string | React.ReactNode)[] = [content];

    parts = parts.flatMap((part) => {
      if (typeof part !== 'string') return part;
      const subParts = part.split(boldRegex);
      return subParts.map((sub, i) => (i % 2 === 1 ? <strong key={'b-' + i}>{sub}</strong> : sub));
    });

    parts = parts.flatMap((part) => {
      if (typeof part !== 'string') return part;
      const subParts = part.split(italicRegex);
      return subParts.map((sub, i) => (i % 2 === 1 ? <em key={'i-' + i}>{sub}</em> : sub));
    });

    parts = parts.flatMap((part) => {
      if (typeof part !== 'string') return part;
      const subParts = part.split(strikeRegex);
      return subParts.map((sub, i) => (i % 2 === 1 ? <del key={'s-' + i}>{sub}</del> : sub));
    });

    parts = parts.flatMap((part) => {
      if (typeof part !== 'string') return part;
      const subParts = part.split(codeRegex);
      return subParts.map((sub, i) =>
        i % 2 === 1 ? (
          <code key={'c-' + i} className="bg-black/30 px-1 py-0.5 rounded font-mono text-xs">
            {sub}
          </code>
        ) : (
          sub
        )
      );
    });

    // Render all emojis as crisp Twemoji vector SVGs!
    parts = parts.flatMap((part, pIdx) => {
      if (typeof part !== 'string') return part;
      const subParts = part.split(EMOJI_REGEX);
      return subParts.map((sub, i) => {
        if (sub.match(EMOJI_REGEX)) {
          return (
            <EmojiSvg
              key={`em-${pIdx}-${i}`}
              emoji={sub}
              className="w-5 h-5 inline-block align-middle mx-0.5"
            />
          );
        }
        return sub;
      });
    });

    return <>{parts}</>;
  };

  // Filtered messages if search is active
  const displayedMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase();
    return messages.filter((m) => m.text.toLowerCase().includes(q) || m.transcript?.toLowerCase().includes(q));
  }, [messages, searchQuery]);

  // ── EMERGENCY PANIC CAMOUFLAGE OVERLAY ──
  if (disguisePanic) {
    return (
      <div className="fixed inset-0 z-50 bg-[#FAF8F5] text-[#1E293B] p-4 sm:p-8 overflow-y-auto font-serif select-text">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-4">
            <div>
              <span className="text-xs font-mono text-[#1273C4] font-bold uppercase tracking-wider">
                Department of Electrical &amp; Instrumentation Engineering
              </span>
              <h1 className="text-2xl font-bold text-[#1E293B] mt-1 font-serif">
                EI-201: Multivariable Vector Calculus &amp; Sensor Calibration
              </h1>
            </div>
            <button
              onClick={() => setDisguisePanic(false)}
              className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#EDE8E1] border border-[#DDD5C7] text-xs font-mono text-[#475569] hover:text-[#1E293B] transition-colors flex items-center gap-1.5"
              title="Resume Chat"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#1273C4]" />
              <span>Resume (Esc)</span>
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E5DFD5] shadow-xs space-y-4 text-sm leading-relaxed text-[#334155]">
            <h2 className="text-lg font-bold text-[#1E293B] font-serif">Section 4.2: Divergence and Curl in Orthogonal Coordinates</h2>
            <p>
              In three-dimensional Euclidean space, let F(x, y, z) = P i + Q j + R k be a continuously differentiable vector field representing sensor flux density.
            </p>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] font-mono text-xs text-[#1E293B] overflow-x-auto">
              curl(F) = ∇ × F = | i    j    k   |<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| ∂/∂x ∂/∂y ∂/∂z|<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| P    Q    R   |
            </div>
            <p>
              A vector field is conservative if and only if curl(F) = 0, which implies the existence of a potential scalar function φ such that F = ∇φ. For industrial instrumentation, this condition guarantees path independence of work done in electromagnetic sensor coils.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-[#E5DFD5] bg-[#FAF8F5] space-y-2">
                <div className="text-xs font-bold text-[#1E293B]">Key Theorem: Green's Theorem in Plane</div>
                <p className="text-xs text-[#64748B] font-sans">
                  ∮_C (L dx + M dy) = ∬_D (∂M/∂x - ∂L/∂y) dA
                </p>
              </div>
              <div className="p-4 rounded-xl border border-[#E5DFD5] bg-[#FAF8F5] space-y-2">
                <div className="text-xs font-bold text-[#1E293B]">Applied Sensor Calibration</div>
                <p className="text-xs text-[#64748B] font-sans">
                  Sensitivity S = ΔV_out / ΔInput, Linearity error ≤ 0.05% FSO.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center text-xs font-mono text-[#94A3B8]">
            Press Escape or click Resume above to return to private session.
          </div>
        </div>
      </div>
    );
  }

  // ── CHAT PIN LOCK OVERLAY ──
  if (chatPinEnabled && isChatLocked) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0b141a] flex items-center justify-center p-4 select-none">
        <div className="bg-[#182229] border border-[#2a3942] rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight">WhatsApp Locked</h2>
            <p className="text-xs text-[#8696a0]">
              Enter 4-digit Security PIN to access confidential chat with {partnerName}.
            </p>
          </div>

          <form onSubmit={handleUnlockPin} className="space-y-4">
            <input
              type="password"
              maxLength={4}
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value)}
              placeholder=""
              autoComplete="new-password"
              autoFocus
              className="w-36 mx-auto text-center tracking-[1em] text-2xl font-mono py-2 rounded-xl bg-[#2a3942] border border-[#3b4a54] text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
            />

            {pinError && (
              <p className="text-xs text-rose-400 font-mono">{pinError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#00a884] hover:bg-[#029071] text-white font-bold text-sm shadow transition-all flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Chat</span>
            </button>
          </form>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-[#8696a0]">
            <button
              onClick={() => setDisguisePanic(true)}
              className="hover:text-white flex items-center gap-1 text-[11px]"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Camouflage</span>
            </button>
            <button
              onClick={handleLogout}
              className="hover:text-rose-400 text-[11px]"
            >
              Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 w-screen h-[100dvh] md:h-screen flex flex-row overflow-hidden bg-[#0c1317] text-[#e9edef] select-none font-sans">
      {/* Hidden File Input for Documents */}
      <input
        type="file"
        ref={docInputRef}
        onChange={handleDocumentFileSelect}
        className="hidden"
      />
      {/* Hidden File Input for Gallery Photos & Videos */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,video/*"
        onChange={handleMediaFileSelect}
        className="hidden"
      />
      {/* Hidden File Input for Device Camera Capture */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*,video/*"
        capture="environment"
        onChange={handleMediaFileSelect}
        className="hidden"
      />

      
      {/* ══════ COLUMN 1: LEFT NAVIGATION RAIL (WhatsApp Web Desktop Rail) ══════ */}
      <aside className="hidden md:flex flex-col justify-between items-center w-[64px] bg-[#202c33] border-r border-[#222e35] py-3.5 px-2 z-30 shrink-0 select-none">
        {/* Top Navigation Icons */}
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Chats Tab Button */}
          <button
            onClick={() => {
              setActiveMainView('chat');
              setMobileView('conversation');
            }}
            className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              activeMainView === 'chat'
                ? 'bg-[#374248] text-[#00a884] shadow-inner ring-1 ring-[#00a884]/30'
                : 'text-[#aebac1] hover:bg-[#2a3942] hover:text-white'
            }`}
            title="Chats"
          >
            <MessageSquare className="w-5 h-5" />
            {activeMainView === 'chat' && (
              <span className="absolute left-[-8px] top-2.5 bottom-2.5 w-1 bg-[#00a884] rounded-r-full" />
            )}
          </button>

          {/* Botanical Garden Button */}
          <button
            onClick={() => {
              setActiveMainView('garden');
              setMobileView('conversation');
            }}
            className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              activeMainView === 'garden'
                ? 'bg-[#374248] text-emerald-400 shadow-inner ring-1 ring-emerald-500/40'
                : 'text-[#aebac1] hover:bg-[#2a3942] hover:text-emerald-400'
            }`}
            title="Botanical Garden (Multi-Plant Nurturing)"
          >
            <Sprout className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-[#00a884] text-[#111b21] text-[10px] font-black rounded-full shadow font-mono">
              12
            </span>
            {activeMainView === 'garden' && (
              <span className="absolute left-[-8px] top-2.5 bottom-2.5 w-1 bg-emerald-400 rounded-r-full" />
            )}
          </button>

          {/* Voice & Video Calls Button */}
          <button
            onClick={() => setShowCallModal('video')}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[#aebac1] hover:bg-[#2a3942] hover:text-white transition-all"
            title="Voice &amp; Video Calls"
          >
            <Phone className="w-5 h-5" />
          </button>

          {/* Starred Messages Button */}
          <button
            onClick={() => setShowStarredModal(true)}
            className="relative w-10 h-10 rounded-xl flex items-center justify-center text-[#aebac1] hover:bg-[#2a3942] hover:text-amber-400 transition-all"
            title="Starred messages"
          >
            <Star className="w-5 h-5" />
            {messages.filter((m) => m.isStarred).length > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-[#202c33]" />
            )}
          </button>
        </div>

        {/* Bottom System & Profile Icons */}
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Study Curriculum Portal Button */}
          <button
            onClick={() => switchTab('home')}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[#aebac1] hover:bg-[#2a3942] hover:text-[#53bdeb] transition-all"
            title="Return to Study Portal &amp; Curriculum Library"
          >
            <BookOpen className="w-5 h-5" />
          </button>

          {/* Chat Wallpaper Switcher */}
          <button
            onClick={() => setShowWallpaperModal(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[#aebac1] hover:bg-[#2a3942] hover:text-white transition-all"
            title="Chat Wallpaper"
          >
            <Palette className="w-5 h-5" />
          </button>

          {/* Security & Privacy Settings */}
          <button
            onClick={() => setShowSecurityModal(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[#aebac1] hover:bg-[#2a3942] hover:text-emerald-400 transition-all"
            title="Security &amp; Privacy (E2EE 256-bit)"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </button>

          <div className="w-8 h-[1px] bg-[#2a3942]" />

          {/* Current User Profile Avatar */}
          <button
            onClick={() => setShowContactInfo(true)}
            className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 text-white font-bold text-sm flex items-center justify-center ring-1 ring-white/20 hover:ring-2 hover:ring-emerald-400 transition-all"
            title={`${currentUser === 'surya' ? 'Surya' : 'Sadhana'} (Online Profile)`}
          >
            <span>{currentUser[0].toUpperCase()}</span>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00a884] border-2 border-[#202c33]" />
          </button>
        </div>
      </aside>

      {/* ══════ COLUMN 2: LEFT CHATS SIDEBAR (WhatsApp Web Chats List) ══════ */}
      <section
        className={`w-full md:w-[380px] lg:w-[400px] xl:w-[420px] bg-[#111b21] flex flex-col border-r border-[#222e35] shrink-0 h-full z-20 ${
          mobileView === 'conversation' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Mobile WhatsApp App Bar (Visible on phone screens < md) */}
        <div className="md:hidden h-[56px] px-4 bg-[#1f2c34] flex items-center justify-between border-b border-[#2a3942]/60 shrink-0 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-[21px] font-bold text-[#e9edef] tracking-wide font-sans">WhatsApp</span>
          </div>

          <div className="flex items-center gap-1 text-[#aebac1]">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="p-2 rounded-full hover:bg-white/10 active:bg-white/15 text-[#aebac1] hover:text-white transition-colors"
              title="Camera"
            >
              <Camera className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="p-2 rounded-full hover:bg-white/10 active:bg-white/15 text-[#aebac1] hover:text-white transition-colors"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Mobile 3-dots Menu */}
            <div className="relative">
              <button
                onClick={() => setShowSidebarMenu(!showSidebarMenu)}
                className="p-2 rounded-full hover:bg-white/10 active:bg-white/15 text-[#aebac1] hover:text-white transition-colors"
                title="More options"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showSidebarMenu && (
                <div className="absolute right-0 top-10 w-56 bg-[#233138] border border-[#2a3942] rounded-xl shadow-2xl py-1.5 z-50 text-xs text-[#d1d7db]">
                  <button
                    onClick={() => {
                      setActiveMainView('garden');
                      setShowSidebarMenu(false);
                      setMobileView('conversation');
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#182229] transition-colors flex items-center gap-2.5 text-emerald-400 font-medium"
                  >
                    <Sprout className="w-4 h-4" />
                    <span>Botanical Garden (12 Varieties)</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowStarredModal(true);
                      setShowSidebarMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#182229] transition-colors flex items-center gap-2.5"
                  >
                    <Star className="w-4 h-4 text-amber-400" />
                    <span>Starred Messages</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowWallpaperModal(true);
                      setShowSidebarMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#182229] transition-colors flex items-center gap-2.5"
                  >
                    <Palette className="w-4 h-4 text-teal-400" />
                    <span>Chat Wallpaper</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowSecurityModal(true);
                      setShowSidebarMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#182229] transition-colors flex items-center gap-2.5 text-emerald-300"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Security &amp; Privacy</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowStorageModal(true);
                      setShowSidebarMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#182229] transition-colors flex items-center gap-2.5"
                  >
                    <HardDrive className="w-4 h-4 text-slate-300" />
                    <span>Manage Storage</span>
                  </button>
                  <div className="h-[1px] bg-[#2a3942] my-1" />
                  <button
                    onClick={() => {
                      switchTab('home');
                      setShowSidebarMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#182229] transition-colors flex items-center gap-2.5 text-sky-400"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Study Curriculum Portal</span>
                  </button>
                  <button
                    onClick={() => {
                      logoutChat();
                      setShowSidebarMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#182229] transition-colors text-red-400 flex items-center gap-2.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop WhatsApp Web Header Bar (Visible on laptop/desktop screens >= md) */}
        <div className="hidden md:flex h-[60px] px-4 bg-[#202c33] items-center justify-between border-b border-[#222e35] shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[20px] font-bold text-[#e9edef] tracking-tight">Chats</span>
          </div>

          <div className="flex items-center gap-1 text-[#aebac1]">
            <button
              onClick={() => {
                setActiveMainView('garden');
                setMobileView('conversation');
              }}
              className="p-2 rounded-full hover:bg-white/10 hover:text-emerald-400 transition-colors"
              title="Botanical Garden"
            >
              <Sprout className="w-5 h-5 text-emerald-400" />
            </button>

            <button
              onClick={() => {
                setActiveMainView('chat');
                setMobileView('conversation');
              }}
              className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors"
              title="New Chat"
            >
              <Plus className="w-5 h-5" />
            </button>

            {/* Desktop 3-dots Menu */}
            <div className="relative">
              <button
                onClick={() => setShowSidebarMenu(!showSidebarMenu)}
                className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors"
                title="Menu"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showSidebarMenu && (
                <div className="absolute right-0 top-10 w-56 bg-[#233138] border border-[#2a3942] rounded-xl shadow-2xl py-1.5 z-50 text-xs text-[#d1d7db]">
                  <button
                    onClick={() => {
                      setActiveMainView('garden');
                      setShowSidebarMenu(false);
                      setMobileView('conversation');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#182229] transition-colors flex items-center gap-2.5 text-emerald-400 font-medium"
                  >
                    <Sprout className="w-4 h-4" />
                    <span>Botanical Garden</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowStarredModal(true);
                      setShowSidebarMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#182229] transition-colors flex items-center gap-2.5"
                  >
                    <Star className="w-4 h-4 text-amber-400" />
                    <span>Starred Messages</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowWallpaperModal(true);
                      setShowSidebarMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#182229] transition-colors flex items-center gap-2.5"
                  >
                    <Palette className="w-4 h-4 text-teal-400" />
                    <span>Chat Wallpaper</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowSecurityModal(true);
                      setShowSidebarMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#182229] transition-colors flex items-center gap-2.5 text-emerald-300"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Security &amp; Privacy</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowStorageModal(true);
                      setShowSidebarMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#182229] transition-colors flex items-center gap-2.5"
                  >
                    <HardDrive className="w-4 h-4 text-slate-300" />
                    <span>Manage Storage</span>
                  </button>
                  <div className="h-[1px] bg-[#2a3942] my-1" />
                  <button
                    onClick={() => {
                      switchTab('home');
                      setShowSidebarMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#182229] transition-colors flex items-center gap-2.5 text-sky-400"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Study Curriculum Portal</span>
                  </button>
                  <button
                    onClick={() => {
                      logoutChat();
                      setShowSidebarMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#182229] transition-colors text-red-400 flex items-center gap-2.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar Row (Desktop always visible, mobile toggleable or inline) */}
        <div className={`px-3 py-2 bg-[#111b21] items-center gap-2 border-b border-[#222e35]/40 shrink-0 ${
          showMobileSearch ? 'flex' : 'hidden md:flex'
        }`}>
          <div className="flex-1 bg-[#202c33] rounded-lg px-3 py-1.5 flex items-center gap-2.5 focus-within:ring-1 focus-within:ring-[#00a884] transition-all">
            <Search className="w-4 h-4 text-[#8696a0] shrink-0" />
            <input
              type="text"
              placeholder="Search or start new chat"
              value={sidebarSearchQuery}
              onChange={(e) => setSidebarSearchQuery(e.target.value)}
              className="bg-transparent text-xs sm:text-[13px] text-[#e9edef] placeholder-[#8696a0] outline-none w-full"
            />
            {sidebarSearchQuery && (
              <button onClick={() => setSidebarSearchQuery('')} className="text-[#8696a0] hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setChatFilter(chatFilter === 'unread' ? 'all' : 'unread')}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              chatFilter === 'unread' ? 'bg-[#00a884] text-[#111b21]' : 'hover:bg-white/10 text-[#8696a0]'
            }`}
            title="Filter unread chats"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Chips Row */}
        <div className="px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-[#222e35]/30 shrink-0">
          {(['all', 'unread', 'favorites', 'groups'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setChatFilter(tab)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                chatFilter === tab
                  ? 'bg-[#00a884]/20 text-[#00a884] border border-[#00a884]/40'
                  : 'bg-[#202c33] text-[#8696a0] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Chats List Area */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#222e35]/30">
          {/* Chat 1: Sadhana / Partner (Active & Pinned) */}
          {(!sidebarSearchQuery || partnerName.toLowerCase().includes(sidebarSearchQuery.toLowerCase())) && (
          <div
            onClick={() => {
              setActiveMainView('chat');
              setMobileView('conversation');
            }}
            className={`px-3 py-3 flex items-center gap-3 cursor-pointer transition-colors ${
              activeMainView === 'chat' ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]'
            }`}
          >
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#00a884] to-[#128c7e] text-white font-bold flex items-center justify-center text-base shadow">
                {partnerName[0]}
              </div>
              {isPartnerOnline && (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#00a884] border-2 border-[#111b21] shadow-[0_0_6px_#00a884]" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-medium text-[#e9edef] truncate">{partnerName}</span>
                <span className="text-[11px] text-[#00a884] font-medium shrink-0 ml-1">
                  {messages[messages.length - 1]?.time || 'Now'}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1 text-[13px] text-[#8696a0]">
                <div className="flex items-center gap-1 truncate max-w-[220px]">
                  <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] shrink-0" />
                  <span className="truncate">
                    {messages[messages.length - 1]?.text || 'Tap to start conversation'}
                  </span>
                </div>
                <Pin className="w-3.5 h-3.5 text-[#8696a0] rotate-45 shrink-0 ml-1" />
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Mobile Floating Action Button (FAB) */}
        <button
          onClick={() => {
            setActiveMainView('chat');
            setMobileView('conversation');
          }}
          className="md:hidden fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full bg-[#00a884] active:bg-[#029071] text-[#111b21] flex items-center justify-center shadow-2xl shadow-emerald-950/80 active:scale-95 transition-transform"
          title="Open Conversation"
        >
          <MessageSquare className="w-6 h-6 fill-current text-[#111b21]" />
        </button>

        {/* Mobile Bottom Navigation Bar (WhatsApp Mobile 2024-2026 Android & iOS UI) */}
        <nav className="md:hidden h-[64px] bg-[#1f2c34] border-t border-[#2a3942]/60 flex items-center justify-around px-2 z-30 shrink-0 select-none pb-[calc(env(safe-area-inset-bottom,0px))]">
          <button
            onClick={() => {
              setActiveMainView('chat');
              setMobileView('list');
            }}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
              activeMainView === 'chat' && mobileView === 'list'
                ? 'text-[#00a884]'
                : 'text-[#8696a0] hover:text-white'
            }`}
          >
            <div className={`px-4 py-0.5 rounded-full ${activeMainView === 'chat' && mobileView === 'list' ? 'bg-[#00a884]/20' : ''}`}>
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold">Chats</span>
          </button>

          <button
            onClick={() => {
              setActiveMainView('garden');
              setMobileView('conversation');
            }}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
              activeMainView === 'garden'
                ? 'text-emerald-400'
                : 'text-[#8696a0] hover:text-emerald-400'
            }`}
          >
            <div className={`relative px-4 py-0.5 rounded-full ${activeMainView === 'garden' ? 'bg-emerald-500/20' : ''}`}>
              <Sprout className="w-5 h-5" />
              <span className="absolute -top-1 right-2 w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <span className="text-[11px] font-semibold">Garden</span>
          </button>

          <button
            onClick={() => setShowCallModal('video')}
            className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[#8696a0] hover:text-white transition-all"
          >
            <div className="px-4 py-0.5 rounded-full">
              <Phone className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold">Calls</span>
          </button>

          <button
            onClick={() => switchTab('home')}
            className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[#8696a0] hover:text-sky-400 transition-all"
          >
            <div className="px-4 py-0.5 rounded-full">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold">Portal</span>
          </button>

          <button
            onClick={() => setShowSecurityModal(true)}
            className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[#8696a0] hover:text-white transition-all"
          >
            <div className="px-4 py-0.5 rounded-full">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[11px] font-semibold">Settings</span>
          </button>
        </nav>
      </section>

      {/* ══════ COLUMN 3: RIGHT MAIN PANE (Active Conversation or Garden) ══════ */}
      <main
        className={`flex-1 flex flex-col h-full bg-[#0b141a] relative overflow-hidden ${
          mobileView === 'list' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {activeMainView === 'garden' ? (
          /* Garden View with WhatsApp Web styling */
          <div className="w-full h-full flex flex-col bg-[#0c1317]">
            {/* Top Garden Header */}
            <div className="bg-[#1f2c34] md:bg-[#202c33] px-3 sm:px-4 py-2.5 flex items-center justify-between border-b border-[#2a3942] z-30 shrink-0 shadow-sm h-[56px] md:h-[60px]">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    setActiveMainView('chat');
                    setMobileView(isMobileScreen ? 'list' : 'conversation');
                  }}
                  className="p-1.5 -ml-1 rounded-full hover:bg-white/10 text-[#aebac1] hover:text-white transition-colors flex items-center gap-1.5"
                  title="Back to Chats"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-xs font-medium text-[#00a884] hidden sm:inline">Back</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold shadow-sm">
                    🌱
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[#e9edef] flex items-center gap-2 leading-tight">
                      <span>Botanical Garden</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-medium">12 Varieties</span>
                    </h2>
                    <p className="text-[11px] text-[#00a884] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-pulse" />
                      <span>Live Synced across Phone &amp; Laptop</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveMainView('chat');
                    setMobileView('conversation');
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-[#00a884] hover:bg-[#029071] text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Open {partnerName}'s Chat</span>
                </button>
              </div>
            </div>

            {/* Garden Scroll Container */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6">
              <InteractivePlantGarden />
            </div>
          </div>
        ) : (
          /* Active Chat Conversation */
          <>
{/* ── 1. WHATSAPP HEADER ── */}
      <div className="bg-[#1f2c34] md:bg-[#202c33] px-2 sm:px-4 py-2 flex items-center justify-between border-b border-[#2a3942] z-30 flex-shrink-0 shadow-sm h-[56px] md:h-[60px]">
        <div className="flex items-center gap-3">
          {/* Mobile Back to Chats List Button */}
          <button
            onClick={() => setMobileView('list')}
            className="p-1.5 -ml-1 rounded-full hover:bg-white/10 text-[#aebac1] hover:text-white transition-colors flex items-center gap-1 md:hidden"
            title="Back to Chats List"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Contact Avatar with Live Online Badge */}
          <div
            onClick={() => setShowContactInfo(true)}
            className="relative cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-[#00a884] to-[#128c7e] text-white font-bold text-base shadow-sm ring-1 ring-white/10"
          >
            <span>{partnerName[0]}</span>
            {isPartnerOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00a884] border-2 border-[#202c33] shadow-[0_0_8px_#00a884]" />
            )}
          </div>

          {/* Contact Name & Live Status */}
          <div onClick={() => setShowContactInfo(true)} className="cursor-pointer">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-medium text-[#e9edef] tracking-tight">{partnerName}</h2>
              {advancedPrivacy && (
                <span title="Advanced Chat Privacy Enabled">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00a884]" />
                </span>
              )}
            </div>
            {isPartnerTyping ? (
              <p className="text-[12px] text-[#00a884] font-semibold flex items-center gap-1 leading-tight animate-pulse">
                <span>typing...</span>
              </p>
            ) : isPartnerOnline ? (
              <p className="text-[12px] text-[#00a884] font-medium flex items-center gap-1.5 leading-tight">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-pulse" />
                <span>online</span>
              </p>
            ) : (
              <p className="text-[11.5px] text-[#8696a0] font-normal leading-tight">
                {formatLastSeen(partnerLastSeen)}
              </p>
            )}
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2 text-[#aebac1]">
          {/* Botanical Garden Quick Button */}
          <button
            onClick={() => setActiveMainView('garden')}
            className="p-2 rounded-full hover:bg-white/10 text-emerald-400 hover:text-emerald-300 transition-colors"
            title="Botanical Garden"
          >
            <Sprout className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Security & Privacy Section Quick Button */}
          <button
            onClick={() => setShowSecurityModal(true)}
            className="p-2 rounded-full hover:bg-white/10 text-emerald-400 hover:text-emerald-300 transition-colors"
            title="Security &amp; Privacy Section"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          {/* Chat Lists & Filters Button */}
          <button
            onClick={() => setShowChatLists(true)}
            className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors"
            title="Chat Lists &amp; Filters"
          >
            <Filter className="w-4 h-4" />
          </button>

          {/* Video Call */}
          <button
            onClick={() => setShowCallModal('video')}
            className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors"
            title="Video call"
          >
            <Video className="w-4 h-4" />
          </button>

          {/* Voice Call */}
          <button
            onClick={() => setShowCallModal('audio')}
            className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors"
            title="Voice call"
          >
            <Phone className="w-4 h-4" />
          </button>

          {/* In-chat Search */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors"
            title="Search messages"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* 3-Dots Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors"
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-10 w-56 bg-[#233138] border border-[#2a3942] rounded-xl shadow-2xl py-1.5 z-50 text-xs text-[#d1d7db]">
                <button
                  onClick={() => {
                    setShowContactInfo(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#182229] transition-colors"
                >
                  Contact Info
                </button>

                {/* Security & Privacy Section Option */}
                <button
                  onClick={() => {
                    setShowSecurityModal(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#182229] transition-colors flex items-center justify-between text-emerald-300 font-medium"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Security &amp; Privacy</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">E2EE</span>
                </button>

                {/* Emergency Panic Button */}
                <button
                  onClick={() => {
                    setDisguisePanic(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#182229] transition-colors flex items-center justify-between text-amber-300"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>Panic Camouflage</span>
                  </span>
                  <span className="text-[10px] text-[#8696a0] font-mono">Esc</span>
                </button>

                <button
                  onClick={() => {
                    setShowStarredModal(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#182229] transition-colors flex items-center justify-between text-amber-300"
                >
                  <span className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>Starred Messages</span>
                  </span>
                  <span className="text-[10px] text-[#8696a0] font-mono">
                    {messages.filter((m) => m.isStarred).length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setShowWallpaperModal(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#182229] transition-colors flex items-center justify-between text-teal-300"
                >
                  <span className="flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5 text-teal-400" />
                    <span>Chat Wallpaper</span>
                  </span>
                  <span className="text-[10px] text-teal-400 font-mono capitalize">{activeWallpaper}</span>
                </button>

                <button
                  onClick={handleExportChat}
                  className="w-full text-left px-4 py-2 hover:bg-[#182229] transition-colors flex items-center justify-between text-[#d1d7db]"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-[#8696a0]" />
                    <span>Export Chat</span>
                  </span>
                  <span className="text-[10px] text-[#8696a0]">.txt</span>
                </button>

                <button
                  onClick={() => {
                    setShowStorageModal(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#182229] transition-colors flex items-center justify-between"
                >
                  <span>Manage Storage</span>
                  <span className="text-[10px] text-emerald-400 font-mono">{storageStats.totalMb} MB</span>
                </button>

                <button
                  onClick={() => {
                    handleTogglePrivacy();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#182229] transition-colors flex items-center justify-between"
                >
                  <span>Advanced Privacy</span>
                  <span className={`text-[10px] ${advancedPrivacy ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {advancedPrivacy ? 'ON' : 'OFF'}
                  </span>
                </button>

                {/* Read Receipts Toggle */}
                <button
                  onClick={() => {
                    handleToggleReadReceipts();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#182229] transition-colors flex items-center justify-between"
                  title="Toggle WhatsApp Read Receipts (Blue Ticks)"
                >
                  <span className="flex items-center gap-2">
                    <CheckCheck className={`w-3.5 h-3.5 ${readReceiptsEnabled ? 'text-[#53bdeb]' : 'text-[#8696a0]'}`} />
                    <span>Read Receipts</span>
                  </span>
                  <span className={`text-[10px] font-semibold ${readReceiptsEnabled ? 'text-[#53bdeb]' : 'text-slate-400'}`}>
                    {readReceiptsEnabled ? 'ON' : 'OFF'}
                  </span>
                </button>

                {chatPinEnabled && (
                  <button
                    onClick={() => {
                      setIsChatLocked(true);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#182229] transition-colors flex items-center justify-between text-sky-300"
                  >
                    <span>Lock Chat Now</span>
                    <Lock className="w-3 h-3 text-sky-400" />
                  </button>
                )}

                <div className="h-px bg-white/10 my-1" />
                <button
                  onClick={() => {
                    handleClearAllChat();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#182229] text-rose-400 transition-colors"
                >
                  Clear chat
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#182229] text-slate-400 transition-colors"
                >
                  Exit / Switch Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── IN-CHAT SEARCH BAR ── */}
      {showSearch && (
        <div className="bg-[#182229] px-4 py-2 border-b border-[#2a3942] flex items-center gap-2 z-20">
          <Search className="w-4 h-4 text-[#8696a0]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in chat..."
            className="flex-1 bg-transparent text-sm text-white placeholder-[#8696a0] focus:outline-none"
            autoFocus
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-xs text-[#8696a0] hover:text-white">
              ✕
            </button>
          )}
          <button onClick={() => setShowSearch(false)} className="text-xs text-[#00a884] font-medium ml-2">
            Done
          </button>
        </div>
      )}

      {/* ── 2. PINNED MESSAGES BANNER (Up to 3 pinned messages) ── */}
      {pinnedMessages.length > 0 && (
        <div className="bg-[#182229] px-4 py-2 border-b border-[#2a3942] flex items-center justify-between gap-3 text-xs text-[#8696a0] z-20">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Pin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <div className="truncate">
              <span className="text-[#00a884] font-bold mr-1">
                {pinnedMessages[0].sender === currentUser ? 'You' : partnerName}:
              </span>
              <span className="text-white truncate">{pinnedMessages[0].text}</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#00a884] bg-[#00a884]/15 px-2 py-0.5 rounded-full flex-shrink-0">
            {pinnedMessages.length}/3 Pinned
          </span>
        </div>
      )}

      {/* ── 3. CHAT MESSAGES CANVAS ── */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3 space-y-2 relative scroll-smooth"
        style={getWallpaperStyle()}
      >
        {/* End-to-End Encryption Banner - Clickable to open Security Section */}
        <div
          onClick={() => setShowSecurityModal(true)}
          className="mx-auto max-w-sm p-3 rounded-xl bg-[#182229] border border-[#ffb800]/20 text-center shadow-lg my-2 cursor-pointer hover:border-[#ffb800]/40 transition-colors"
        >
          <div className="flex items-center justify-center gap-1.5 text-[#ffd279] text-xs font-semibold mb-0.5">
            <Lock className="w-3.5 h-3.5" />
            <span>End-to-End Encrypted</span>
          </div>
          <p className="text-[11px] text-[#8696a0] leading-tight">
            Messages and calls are end-to-end encrypted. Tap to verify security &amp; safety numbers.
          </p>
        </div>

        {/* Date Divider */}
        <div className="flex justify-center my-3">
          <span className="px-3 py-1 rounded-lg bg-[#182229] border border-[#2a3942]/60 text-[11px] font-medium text-[#8696a0] shadow-sm uppercase tracking-wider">
            Today
          </span>
        </div>

        {/* Clean Empty State when no messages exist yet */}
        {displayedMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 space-y-4 max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#182229] border border-[#2a3942] flex items-center justify-center shadow-lg">
              <Lock className="w-7 h-7 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">No messages yet</h3>
              <p className="text-xs text-[#8696a0]">
                All messages and gallery photos sent between you and <span className="text-emerald-400 font-semibold">{partnerName}</span> are stored permanently on this device and secured with 256-bit encryption.
              </p>
            </div>
            <button
              onClick={() => setShowSecurityModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#182229] border border-emerald-500/30 text-[11px] text-emerald-400 font-medium hover:bg-[#202c33] transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify Security Section</span>
            </button>
          </div>
        )}

        {/* Messages List */}
        {displayedMessages.map((msg) => {
          const isMe = msg.sender === currentUser;
          const reactions = msg.reactions || {};
          const totalReactions = Object.values(reactions).flat().length;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative`}
            >
              {/* Message Bubble with Authentic WhatsApp Corner Tail */}
              <div
                className={`relative max-w-[85%] sm:max-w-[70%] rounded-2xl px-3.5 py-1.5 shadow-[0_1px_1px_rgba(0,0,0,0.2)] transition-all ${
                  isMe
                    ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-[2px] border border-[#005c4b]'
                    : 'bg-[#202c33] text-[#e9edef] rounded-tl-[2px] border border-[#2a3942]/50'
                }`}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setReactionBubbleId(msg.id);
                }}
              >
                {/* Pinned Indicator on Bubble */}
                {msg.isPinned && (
                  <div className="flex items-center gap-1 text-[10px] text-[#ffd279] font-semibold mb-1">
                    <Pin className="w-2.5 h-2.5" />
                    <span>Pinned Message</span>
                  </div>
                )}

                {/* Quoted Reply Preview on Bubble */}
                {msg.replyTo && (
                  <div className="mb-2 p-2 rounded-lg bg-black/25 border-l-4 border-emerald-400 text-xs select-none">
                    <span className="font-semibold text-emerald-400 block text-[11px] mb-0.5">
                      {msg.replyTo.sender === currentUser ? 'You' : partnerName}
                    </span>
                    <span className="text-[#8696a0] line-clamp-1 text-[11px]">{msg.replyTo.text}</span>
                  </div>
                )}

                {/* ── VIEW ONCE MEDIA (PHOTO OR VIDEO) ── */}
                {msg.isViewOnce && (
                  <div className="py-1">
                    {msg.isOpened ? (
                      <div className="flex items-center gap-2 py-2 px-3 bg-black/20 rounded-xl select-none text-[#8696a0]">
                        <div className="w-6 h-6 rounded-full border border-dashed border-[#8696a0] flex items-center justify-center text-[10px] font-bold">
                          ①
                        </div>
                        <span className="text-sm italic">Opened</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenViewOnce(msg)}
                        className="flex items-center gap-3 py-2 px-3 bg-black/25 hover:bg-black/40 rounded-xl transition-all border border-emerald-500/20 group text-left w-full"
                      >
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-sm font-bold shadow group-hover:scale-105 transition-transform flex-shrink-0">
                          ①
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                            {msg.type === 'video' ? 'Video' : 'Photo'}
                          </span>
                          <span className="text-[10px] text-[#8696a0]">Tap to view</span>
                        </div>
                      </button>
                    )}
                  </div>
                )}

                {/* ── REGULAR IMAGE MESSAGE ── */}
                {msg.type === 'image' && !msg.isViewOnce && (
                  <div className="space-y-1.5 mb-1 cursor-pointer" onClick={() => openLightbox(msg)}>
                    <div className="relative rounded-xl overflow-hidden bg-black/40 max-h-80 group">
                      <img
                        src={msg.mediaUrl || msg.thumbnailUrl}
                        alt="Photo"
                        className="w-full h-auto object-cover rounded-xl transition-transform duration-200 group-hover:scale-[1.02]"
                      />
                      {/* HD Badge Overlay */}
                      {msg.isHd && (
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur border border-white/20 text-[9px] font-black tracking-widest text-white flex items-center gap-0.5 shadow">
                          <span>HD</span>
                        </div>
                      )}
                    </div>
                    {msg.text && msg.text !== 'Photo' && msg.text !== 'High Definition Photo' && (
                      <p className="text-sm leading-relaxed text-white pt-1">
                        {renderFormattedText(msg.text)}
                      </p>
                    )}
                  </div>
                )}

                {/* ── REGULAR VIDEO MESSAGE ── */}
                {msg.type === 'video' && !msg.isViewOnce && (
                  <div className="space-y-1.5 mb-1 cursor-pointer" onClick={() => openLightbox(msg)}>
                    <div className="relative rounded-xl overflow-hidden bg-black/60 max-h-80 group flex items-center justify-center">
                      {msg.thumbnailUrl ? (
                        <img
                          src={msg.thumbnailUrl}
                          alt="Video Thumbnail"
                          className="w-full h-auto object-cover rounded-xl transition-transform duration-200 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <video
                          src={msg.mediaUrl}
                          preload="metadata"
                          className="w-full h-auto object-cover rounded-xl pointer-events-none"
                        />
                      )}

                      {/* Center WhatsApp Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur border border-white/40 text-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-black/75 transition-all">
                          <Play className="w-5 h-5 fill-current ml-0.5 text-white" />
                        </div>
                      </div>

                      {/* Video Duration Badge */}
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur text-[10px] font-semibold text-white flex items-center gap-1 shadow">
                        <Video className="w-3 h-3" />
                        <span>{msg.duration || '0:15'}</span>
                      </div>

                      {/* HD Badge Overlay */}
                      {msg.isHd && (
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur border border-white/20 text-[9px] font-black tracking-widest text-white flex items-center gap-0.5 shadow">
                          <span>HD</span>
                        </div>
                      )}
                    </div>
                    {msg.text && msg.text !== 'Video' && (
                      <p className="text-sm leading-relaxed text-white pt-1">
                        {renderFormattedText(msg.text)}
                      </p>
                    )}
                  </div>
                )}

                {/* ── INTERACTIVE POLL MESSAGE ── */}
                {msg.type === 'poll' && msg.poll && (
                  <div className="py-2 min-w-[240px] sm:min-w-[280px] space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2">
                      <h4 className="font-semibold text-[15px] text-white leading-snug">
                        {msg.poll.question}
                      </h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium flex-shrink-0">
                        {msg.poll.pollType === 'multi' ? 'Multiple' : 'Single'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {msg.poll.options.map((opt) => {
                        const totalVotes = msg.poll?.options.reduce((acc, o) => acc + o.votes.length, 0) || 0;
                        const optVotes = opt.votes.length;
                        const pct = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
                        const isVotedByMe = opt.votes.includes(currentUser);

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleVotePoll(msg.id, opt.id)}
                            className="w-full text-left relative overflow-hidden rounded-xl border border-white/10 hover:border-emerald-500/40 p-2.5 transition-all bg-black/20 group"
                          >
                            {/* Vote percentage bar fill */}
                            <div
                              className="absolute inset-y-0 left-0 bg-emerald-500/20 transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />

                            <div className="relative flex items-center justify-between z-10">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-4 h-4 rounded-${msg.poll?.pollType === 'multi' ? 'sm' : 'full'} border flex items-center justify-center transition-colors ${
                                    isVotedByMe
                                      ? 'border-emerald-400 bg-emerald-500 text-white'
                                      : 'border-[#8696a0]'
                                  }`}
                                >
                                  {isVotedByMe && (
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  )}
                                </div>
                                <span className="text-sm font-medium text-white group-hover:text-emerald-300 transition-colors">
                                  {opt.text}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 text-xs text-[#8696a0] font-mono">
                                <span>{optVotes}</span>
                                {totalVotes > 0 && <span className="text-[10px]">({pct}%)</span>}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#8696a0] pt-1">
                      <span>
                        {(msg.poll.options.reduce((acc, o) => acc + o.votes.length, 0))} vote(s)
                      </span>
                      <span className="italic text-[10px]">Tap to vote</span>
                    </div>
                  </div>
                )}

                {/* ── DOCUMENT ATTACHMENT MESSAGE ── */}
                {msg.type === 'document' && (
                  <div className="py-1 min-w-[220px]">
                    <a
                      href={msg.documentUrl || msg.mediaUrl || '#'}
                      download={msg.documentName || 'Document'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-black/25 hover:bg-black/35 border border-white/10 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-sm font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                          {msg.documentName || msg.text || 'Attached Document'}
                        </p>
                        <p className="text-[11px] text-[#8696a0] font-mono">
                          {msg.documentSize || 'Document'} • Click to download
                        </p>
                      </div>
                      <Download className="w-4 h-4 text-[#8696a0] group-hover:text-white flex-shrink-0" />
                    </a>
                  </div>
                )}

                {/* ── VOICE NOTE MESSAGE ── */}
                {msg.type === 'voice' && (
                  <div className="space-y-2 py-1 min-w-[230px] sm:min-w-[260px]">
                    {/* Audio Element for real sound playback */}
                    {(msg.audioUrl || msg.mediaUrl) && (
                      <audio
                        id={`audio-el-${msg.id}`}
                        src={msg.audioUrl || msg.mediaUrl}
                        preload="none"
                        onEnded={() => setIsPlayingAudioId(null)}
                      />
                    )}

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          const audioEl = document.getElementById(`audio-el-${msg.id}`) as HTMLAudioElement | null;
                          if (isPlayingAudioId === msg.id) {
                            audioEl?.pause();
                            setIsPlayingAudioId(null);
                          } else {
                            if (audioEl) {
                              audioEl.playbackRate = audioPlaybackRates[msg.id] || 1;
                              audioEl.play().catch(() => {});
                            }
                            setIsPlayingAudioId(msg.id);
                          }
                        }}
                        className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow flex-shrink-0 transition-transform hover:scale-105 active:scale-95"
                      >
                        {isPlayingAudioId === msg.id ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>

                      <div className="flex-1 space-y-1">
                        {/* Audio Waveform simulation */}
                        <div className="flex items-center gap-0.5 h-6">
                          {[3, 7, 12, 18, 24, 16, 8, 14, 20, 26, 19, 10, 6, 14, 22, 16, 9, 4].map(
                            (h, idx) => (
                              <div
                                key={idx}
                                className={`w-1 rounded-full transition-all ${
                                  isPlayingAudioId === msg.id ? 'bg-emerald-400' : 'bg-white/40'
                                }`}
                                style={{ height: `${h}px` }}
                              />
                            )
                          )}
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-white/70 font-mono">
                          <span>{msg.duration || (msg.audioDuration ? `${Math.floor(msg.audioDuration / 60)}:${msg.audioDuration % 60 < 10 ? '0' : ''}${msg.audioDuration % 60}` : '0:12')}</span>
                          {/* Speed Toggle Button (1x, 1.5x, 2x) */}
                          <button
                            type="button"
                            onClick={() => {
                              const currentRate = audioPlaybackRates[msg.id] || 1;
                              const nextRate = currentRate === 1 ? 1.5 : currentRate === 1.5 ? 2 : 1;
                              setAudioPlaybackRates((prev) => ({ ...prev, [msg.id]: nextRate }));
                              const audioEl = document.getElementById(`audio-el-${msg.id}`) as HTMLAudioElement | null;
                              if (audioEl) audioEl.playbackRate = nextRate;
                            }}
                            className="px-1.5 py-0.5 rounded-full bg-black/30 hover:bg-black/50 text-[9px] font-bold text-emerald-400 border border-emerald-500/30 transition-colors"
                          >
                            {(audioPlaybackRates[msg.id] || 1)}x
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Voice Message Transcript Feature */}
                    {msg.transcript && (
                      <div className="pt-1 border-t border-white/10">
                        <button
                          onClick={() =>
                            setShowTranscriptIds((prev) => ({
                              ...prev,
                              [msg.id]: !prev[msg.id],
                            }))
                          }
                          className="text-[10px] font-semibold text-emerald-300 hover:text-white flex items-center gap-1"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>
                            {showTranscriptIds[msg.id] ? 'Hide Transcript' : 'Read Transcript'}
                          </span>
                        </button>
                        {showTranscriptIds[msg.id] && (
                          <div className="mt-1 p-2 rounded-lg bg-black/25 text-xs text-white/90 font-sans italic">
                            "{msg.transcript}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ── REGULAR TEXT MESSAGE ── */}
                {msg.type === 'text' && (
                  <p className="text-[14.5px] leading-[20px] break-words text-[#e9edef] pr-1 pt-0.5">
                    {renderFormattedText(msg.text)}
                  </p>
                )}

                {/* Bubble Footer: Timestamp & Checkmarks */}
                <div className="flex items-center justify-end gap-1 mt-0.5 -mb-0.5 text-[11px] text-white/65 select-none font-sans">
                  {msg.isStarred && (
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                  )}
                  <span>{msg.time}</span>
                  {renderMessageTicks(msg)}
                </div>

                {/* Reaction Counter Pill */}
                {totalReactions > 0 && (
                  <div className="absolute -bottom-2.5 right-2 bg-[#233138] border border-white/10 rounded-full px-1.5 py-0.5 shadow-md flex items-center gap-1 text-xs">
                    {Object.entries(reactions).map(([emoji, users]) =>
                      users.length > 0 ? (
                        <span key={emoji} className="inline-flex items-center">
                          <EmojiSvg emoji={emoji} className="w-3.5 h-3.5 object-contain inline-block" />
                        </span>
                      ) : null
                    )}
                    <span className="text-[10px] text-white/80 font-bold">{totalReactions}</span>
                  </div>
                )}
              </div>

              {/* Message Context Controls (Reply, Star, React, Pin, Delete) */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 px-1 text-xs text-[#8696a0]">
                <button
                  onClick={() => handleStartReply(msg)}
                  className="p-1 hover:text-white hover:bg-white/10 rounded"
                  title="Reply"
                >
                  <CornerUpLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleToggleStarMessage(msg.id)}
                  className={`p-1 hover:text-white hover:bg-white/10 rounded ${msg.isStarred ? 'text-amber-400' : ''}`}
                  title={msg.isStarred ? 'Unstar message' : 'Star message'}
                >
                  <Star className={`w-3.5 h-3.5 ${msg.isStarred ? 'fill-amber-400' : ''}`} />
                </button>
                <button
                  onClick={() => setReactionBubbleId(reactionBubbleId === msg.id ? null : msg.id)}
                  className="p-1 hover:text-white hover:bg-white/10 rounded"
                  title="React"
                >
                  <Smile className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleTogglePin(msg.id)}
                  className={`p-1 hover:text-white hover:bg-white/10 rounded ${msg.isPinned ? 'text-amber-400' : ''}`}
                  title={msg.isPinned ? 'Unpin message' : 'Pin message (up to 3)'}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteMessage(msg.id)}
                  className="p-1 hover:text-rose-400 hover:bg-rose-500/10 rounded"
                  title="Delete message"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Expanded Emoji Reactions Popover */}
              {reactionBubbleId === msg.id && (
                <div className="absolute z-30 -top-11 bg-[#233138] border border-[#2a3942] rounded-full px-2 py-1 shadow-2xl flex items-center gap-1.5 animate-in fade-in zoom-in-90 duration-150">
                  {['❤️', '👍', '😂', '😮', '😢', '🙏', '🔥', '✨'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleApplyReaction(msg.id, emoji)}
                      className="hover:scale-130 transition-transform p-1 rounded-full hover:bg-white/10 flex items-center justify-center"
                      title={emoji}
                    >
                      <EmojiSvg emoji={emoji} className="w-6 h-6 object-contain" />
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setReactionTargetMsgId(msg.id);
                      setShowEmojiPicker(true);
                      setReactionBubbleId(null);
                    }}
                    className="p-1 rounded-full text-[#8696a0] hover:text-[#00a884] hover:bg-white/10 transition-colors flex items-center justify-center"
                    title="More emojis"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setReactionBubbleId(null)}
                    className="text-xs text-[#8696a0] hover:text-white px-1"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* ── QUOTED REPLY PREVIEW BANNER ── */}
      {replyingToMessage && (
        <div className="bg-[#182229] border-t border-[#2a3942] px-4 py-2 flex items-center justify-between z-30 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="border-l-4 border-[#00a884] pl-2.5 overflow-hidden">
            <span className="text-xs font-semibold text-[#00a884] block">
              Replying to {replyingToMessage.sender === currentUser ? 'yourself' : partnerName}
            </span>
            <span className="text-xs text-[#8696a0] line-clamp-1">
              {replyingToMessage.text || replyingToMessage.type || 'Media'}
            </span>
          </div>
          <button
            onClick={() => setReplyingToMessage(null)}
            className="p-1 rounded-full text-[#8696a0] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── 4. CHAT INPUT BAR (WhatsApp Mobile floating pill + action button, WhatsApp Web flat bar) ── */}
      <div className="bg-transparent md:bg-[#202c33] px-2 sm:px-3 py-2 pb-[calc(env(safe-area-inset-bottom,0px)+8px)] md:pb-2 flex items-center gap-1.5 sm:gap-2 border-t border-transparent md:border-[#2a3942] z-30 flex-shrink-0 relative">
        {/* Emoji Button */}
        <button
          type="button"
          onClick={() => {
            setShowEmojiPicker((prev) => !prev);
            setReactionTargetMsgId(null);
          }}
          className={`p-2 rounded-full transition-colors ${
            showEmojiPicker
              ? 'text-[#00a884] bg-white/10'
              : 'text-[#8696a0] hover:text-[#d1d7db] hover:bg-white/5'
          }`}
          title={showEmojiPicker ? 'Close Emojis (Keyboard)' : 'Open Emoji Picker'}
        >
          {showEmojiPicker ? <Keyboard className="w-5 h-5" /> : <Smile className="w-5 h-5" />}
        </button>

        {/* Quick Camera Capture (Photo or Video) */}
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="p-2 text-[#8696a0] hover:text-[#d1d7db] rounded-full hover:bg-white/5 transition-colors"
          title="Camera (Photo & Video)"
        >
          <Camera className="w-5 h-5" />
        </button>

        {/* Paperclip Attach Button */}
        <div className="relative">
          <button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="p-2 text-[#8696a0] hover:text-[#d1d7db] rounded-full hover:bg-white/5 transition-colors"
            title="Attach"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* WhatsApp Attachment Sheet */}
          {showAttachMenu && (
            <div className="absolute bottom-12 left-0 w-80 bg-[#233138] border border-[#2a3942] rounded-2xl shadow-2xl p-3 z-50 grid grid-cols-3 gap-2.5 text-center">
              {/* Document Option */}
              <button
                onClick={() => {
                  docInputRef.current?.click();
                  setShowAttachMenu(false);
                }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/5 text-[#d1d7db]"
              >
                <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center shadow">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium">Document</span>
              </button>

              {/* Gallery Photos & Videos Option */}
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowAttachMenu(false);
                }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/5 text-[#d1d7db]"
              >
                <div className="w-11 h-11 rounded-full bg-purple-600 text-white flex items-center justify-center shadow">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium">Gallery</span>
              </button>

              {/* Camera Option */}
              <button
                onClick={() => {
                  cameraInputRef.current?.click();
                  setShowAttachMenu(false);
                }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/5 text-[#d1d7db]"
              >
                <div className="w-11 h-11 rounded-full bg-rose-600 text-white flex items-center justify-center shadow">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium">Camera</span>
              </button>

              {/* Interactive Poll Option */}
              <button
                onClick={() => {
                  setShowPollModal(true);
                  setShowAttachMenu(false);
                }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/5 text-[#d1d7db]"
              >
                <div className="w-11 h-11 rounded-full bg-teal-600 text-white flex items-center justify-center shadow">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium">Poll</span>
              </button>

              {/* Audio Note Option */}
              <button
                onClick={() => {
                  handleStartAudioRecording();
                  setShowAttachMenu(false);
                }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/5 text-[#d1d7db]"
              >
                <div className="w-11 h-11 rounded-full bg-amber-600 text-white flex items-center justify-center shadow">
                  <FileAudio className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium">Audio</span>
              </button>

              {/* Location Option */}
              <button
                onClick={() => {
                  setInputText('📍 Shared Engineering Campus Library Coordinates: 13.0827° N, 80.2707° E');
                  setShowAttachMenu(false);
                }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/5 text-[#d1d7db]"
              >
                <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow">
                  <span className="text-base">📍</span>
                </div>
                <span className="text-[11px] font-medium">Location</span>
              </button>
            </div>
          )}
        </div>

        {/* Input Pill OR Live Recording Pill */}
        {isRecordingAudio ? (
          <div className="flex-1 bg-[#2a3942] rounded-xl px-4 py-2 flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-sm font-semibold text-white font-mono">
                {Math.floor(recordingTimeSecs / 60)}:
                {recordingTimeSecs % 60 < 10 ? '0' : ''}
                {recordingTimeSecs % 60}
              </span>
              <span className="text-xs text-[#8696a0] italic">Recording...</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelAudioRecording}
                className="p-1.5 rounded-full text-rose-400 hover:bg-rose-500/20 transition-colors"
                title="Discard voice note"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleSendRealAudioRecording}
                className="w-8 h-8 rounded-full bg-[#00a884] hover:bg-[#029071] text-white flex items-center justify-center shadow transition-transform hover:scale-105"
                title="Send voice note"
              >
                <Send className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 bg-[#2a3942] rounded-xl px-4 py-2.5 flex items-center gap-2 focus-within:ring-1 focus-within:ring-[#00a884]/40 transition-all">
              <input
                type="text"
                value={inputText}
                onChange={(e) => handleInputTextChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendText();
                }}
                placeholder="Type a message (*bold*, _italic_, ~strike~)"
                className="w-full bg-transparent text-[14.5px] text-[#e9edef] placeholder-[#8696a0] focus:outline-none"
              />
            </div>

            {/* Mic / Send Button */}
            {inputText.trim() ? (
              <button
                onClick={handleSendText}
                className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#029071] text-white flex items-center justify-center shadow-md transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                title="Send"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            ) : (
              <button
                onClick={handleStartAudioRecording}
                className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#029071] text-white flex items-center justify-center shadow-md transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                title="Hold or tap to Record Voice Note"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </div>

      {/* ── WHATSAPP VECTOR SVG EMOJI PICKER DRAWER ── */}
      {showEmojiPicker && (
        <WhatsAppEmojiPicker
          onSelectEmoji={(em) => {
            if (reactionTargetMsgId) {
              handleApplyReaction(reactionTargetMsgId, em);
              setReactionTargetMsgId(null);
              setShowEmojiPicker(false);
            } else {
              setInputText((prev) => prev + em);
            }
          }}
          onBackspace={() => {
            setInputText((prev) => {
              const chars = Array.from(prev);
              chars.pop();
              return chars.join('');
            });
          }}
          onClose={() => {
            setShowEmojiPicker(false);
            setReactionTargetMsgId(null);
          }}
        />
      )}
          </>
        )}
      </main>

      {/* ── MEDIA PREVIEW & SENDER MODAL (Photos & Videos from Gallery or Camera) ── */}
      {mediaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-[#182229] border border-[#2a3942] rounded-3xl p-5 max-w-lg w-full shadow-2xl space-y-4">
            {/* Top Bar with HD and View Once Toggles */}
            <div className="flex items-center justify-between border-b border-[#2a3942] pb-3">
              <div className="flex items-center gap-2">
                {/* Standard or HD Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsHdSelected(!isHdSelected)}
                  className={`px-3 py-1 rounded-full text-xs font-black tracking-wider transition-all flex items-center gap-1.5 border ${
                    isHdSelected
                      ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                      : 'bg-white/5 text-[#8696a0] border-white/10 hover:text-white'
                  }`}
                  title="Toggle High Definition"
                >
                  <span>HD</span>
                  <span className="text-[10px] font-normal">
                    {isHdSelected ? 'HD Quality' : 'Standard'}
                  </span>
                </button>

                {/* View Once Toggle */}
                <button
                  type="button"
                  onClick={() => setIsViewOnceSelected(!isViewOnceSelected)}
                  className={`w-7 h-7 rounded-full text-xs font-bold transition-all flex items-center justify-center border ${
                    isViewOnceSelected
                      ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                      : 'bg-white/5 text-[#8696a0] border-white/10 hover:text-white'
                  }`}
                  title="View Once (Photo or video can only be viewed once)"
                >
                  ①
                </button>

                {mediaType === 'video' && mediaDuration && (
                  <span className="text-xs text-[#8696a0] px-2 py-0.5 rounded-full bg-white/5 flex items-center gap-1">
                    <Video className="w-3 h-3 text-emerald-400" />
                    <span>{mediaDuration}</span>
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  setMediaModalOpen(false);
                  setMediaUrl('');
                  setMediaThumbnail('');
                }}
                className="p-1 rounded-full text-[#8696a0] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Preview (Video Player or Photo Viewer) */}
            <div className="rounded-2xl overflow-hidden bg-black/60 max-h-80 flex items-center justify-center relative">
              {mediaType === 'video' ? (
                <video
                  src={mediaUrl}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-80 w-auto rounded-2xl mx-auto"
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt="Media Preview"
                  className="max-h-80 w-auto object-contain rounded-2xl"
                />
              )}
            </div>

            {/* Caption & Send */}
            <div className="space-y-3">
              <input
                type="text"
                value={mediaCaption}
                onChange={(e) => setMediaCaption(e.target.value)}
                placeholder="Add a caption..."
                className="w-full bg-[#2a3942] text-sm text-white px-4 py-2.5 rounded-xl border border-transparent focus:outline-none focus:border-[#00a884]"
              />

              <div className="flex justify-between items-center pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Gallery</span>
                  </button>
                  <span className="text-[#8696a0] text-xs">•</span>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Camera</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setMediaModalOpen(false);
                      setMediaUrl('');
                      setMediaThumbnail('');
                    }}
                    className="px-4 py-2 rounded-xl bg-white/5 text-xs text-[#8696a0] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendMedia}
                    className="px-6 py-2 rounded-xl bg-[#00a884] hover:bg-[#029071] text-white text-xs font-bold shadow flex items-center gap-1.5"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FULLSCREEN WHATSAPP LIGHTBOX / MEDIA VIEWER ── */}
      {lightboxMedia && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex flex-col justify-between select-none">
          {/* Top Bar */}
          <div className="p-4 bg-black/60 backdrop-blur-md flex items-center justify-between border-b border-white/10 z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLightboxMedia(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
                title="Close"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {lightboxMedia.sender === currentUser ? 'You' : partnerName}
                </h3>
                <p className="text-[11px] text-[#8696a0]">
                  {lightboxMedia.time} {lightboxMedia.isViewOnce ? '• View Once' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!lightboxMedia.isViewOnce && (
                <a
                  href={lightboxMedia.url}
                  download={`dharya-whatsapp-${Date.now()}.${lightboxMedia.type === 'video' ? 'mp4' : 'jpg'}`}
                  className="p-2 rounded-full hover:bg-white/10 text-[#8696a0] hover:text-white transition-colors"
                  title="Download"
                >
                  <HardDrive className="w-5 h-5" />
                </a>
              )}
              <button
                onClick={() => setLightboxMedia(null)}
                className="p-2 rounded-full hover:bg-white/10 text-[#8696a0] hover:text-white transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Content */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
            {lightboxMedia.type === 'video' ? (
              <video
                src={lightboxMedia.url}
                controls
                autoPlay
                playsInline
                className="max-h-[75vh] max-w-full rounded-xl shadow-2xl object-contain"
              />
            ) : (
              <img
                src={lightboxMedia.url}
                alt="Fullscreen"
                className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl"
              />
            )}
          </div>

          {/* Bottom Bar / Caption */}
          <div className="p-4 bg-black/60 backdrop-blur-md text-center border-t border-white/10">
            {lightboxMedia.isViewOnce ? (
              <p className="text-xs text-amber-400 font-medium">
                ① View-once message — media disappears when you exit.
              </p>
            ) : lightboxMedia.caption && lightboxMedia.caption !== 'Photo' && lightboxMedia.caption !== 'Video' && lightboxMedia.caption !== 'High Definition Photo' ? (
              <p className="text-sm text-white max-w-xl mx-auto leading-relaxed">
                {lightboxMedia.caption}
              </p>
            ) : (
              <p className="text-xs text-[#8696a0]">End-to-end encrypted</p>
            )}
          </div>
        </div>
      )}

      {/* ── 5. COMPREHENSIVE SECURITY & PRIVACY SECTION MODAL ── */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111b21] border border-[#2a3942] rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#202c33] p-4 sm:p-5 flex items-center justify-between border-b border-[#2a3942]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Security &amp; Privacy Center</h3>
                  <p className="text-[11px] text-[#8696a0]">End-to-End Encrypted Private Channel</p>
                </div>
              </div>
              <button
                onClick={() => setShowSecurityModal(false)}
                className="p-1 rounded-full text-[#8696a0] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs text-[#d1d7db]">
              {/* E2EE Safety Number Verification */}
              <div className="p-4 rounded-2xl bg-[#182229] border border-[#2a3942] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-sm text-white">Encryption Safety Number</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono text-[10px] font-bold">
                    AES-256 Verified
                  </span>
                </div>

                <p className="text-[11px] text-[#8696a0] leading-relaxed">
                  Compare this 60-digit cryptographic number with {partnerName} to verify that messages and gallery photos cannot be read by anyone else.
                </p>

                {/* 60-Digit Safety Number in Groups of 5 */}
                <div className="p-3.5 rounded-xl bg-[#0b141a] border border-white/5 font-mono text-center text-xs tracking-wider text-emerald-300 leading-relaxed select-all">
                  52910 09102 00729 02200 81928 47291<br />
                  93820 18472 90184 75619 38291 04928
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={handleCopySafetyCode}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{copiedSafetyCode ? 'Copied to Clipboard!' : 'Copy Safety Number'}</span>
                  </button>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Keys Authenticated</span>
                  </span>
                </div>
              </div>

              {/* Screen Camouflage & Panic Switch */}
              <div className="p-4 rounded-2xl bg-[#182229] border border-[#2a3942] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      <span>Emergency Panic Camouflage</span>
                    </div>
                    <p className="text-[11px] text-[#8696a0] mt-0.5">
                      Instantly disguises screen into an Engineering Mathematics textbook page.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowSecurityModal(false);
                      setDisguisePanic(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold font-mono transition-colors"
                  >
                    Trigger (Esc)
                  </button>
                </div>
              </div>

              {/* Chat PIN Lock Protection */}
              <div className="p-4 rounded-2xl bg-[#182229] border border-[#2a3942] flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-sky-400" />
                    <span>Chat PIN Lock Protection</span>
                  </div>
                  <p className="text-[11px] text-[#8696a0] mt-0.5">
                    Requires a 4-digit PIN (default 0929) to view chat.
                  </p>
                </div>
                <button
                  onClick={handleToggleChatPin}
                  className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                    chatPinEnabled ? 'bg-sky-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      chatPinEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Advanced Chat Privacy (No Exports, Device-Only Storage) */}
              <div className="p-4 rounded-2xl bg-[#182229] border border-[#2a3942] flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Advanced Chat Privacy</span>
                  </div>
                  <p className="text-[11px] text-[#8696a0] mt-0.5">
                    Prevents message exports and keeps all media stored strictly on this device.
                  </p>
                </div>
                <button
                  onClick={handleTogglePrivacy}
                  className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                    advancedPrivacy ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      advancedPrivacy ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Read Receipts Switch (WhatsApp Standard) */}
              <div className="p-4 rounded-2xl bg-[#182229] border border-[#2a3942] flex items-center justify-between">
                <div className="pr-3">
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    <CheckCheck className={`w-4 h-4 ${readReceiptsEnabled ? 'text-[#53bdeb]' : 'text-[#8696a0]'}`} />
                    <span>Read Receipts</span>
                  </div>
                  <p className="text-[11px] text-[#8696a0] mt-0.5 leading-relaxed">
                    If turned off, you won't send or receive Read receipts (double blue ticks). Message ticks will remain double grey.
                  </p>
                </div>
                <button
                  onClick={handleToggleReadReceipts}
                  className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                    readReceiptsEnabled ? 'bg-[#00a884]' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      readReceiptsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* WhatsApp Tick Delivery & Read Receipts Guide */}
              <div className="p-4 rounded-2xl bg-[#182229] border border-[#2a3942] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    <CheckCheck className="w-4 h-4 text-[#53bdeb]" />
                    <span>WhatsApp Tick Guide</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#00a884] bg-[#00a884]/15 px-2 py-0.5 rounded">Active</span>
                </div>
                <div className="space-y-2 text-[11px] text-[#8696a0] pt-1">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-3.5 h-3.5 text-[#8696a0] stroke-[2.5] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-white font-semibold">One grey tick:</span> The message was sent to the server.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCheck className="w-3.5 h-3.5 text-[#8696a0] stroke-[2.5] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-white font-semibold">Two grey ticks:</span> The message was delivered to the recipient's phone.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] stroke-[2.5] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-white font-semibold">Two blue ticks:</span> The recipient opened the chat and read your message.
                    </div>
                  </div>
                  <div className="text-[10px] text-[#8696a0]/80 pt-1.5 border-t border-white/5 leading-relaxed">
                    <span className="text-slate-300 font-semibold">Turning it off:</span> Go to Settings &gt; Privacy and turn off Read Receipts to hide when you read messages (note that you will also stop seeing others' read receipts). Group chats: Two blue ticks only appear when every person in the group has received and read the message.
                  </div>
                </div>
              </div>

              {/* Storage & Local Persistence Status */}
              <div className="p-4 rounded-2xl bg-[#182229] border border-[#2a3942] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Stored Conversation History</span>
                  <span className="text-emerald-400 font-mono">{storageStats.totalMb} MB</span>
                </div>
                <div className="text-[11px] text-[#8696a0] leading-relaxed">
                  All your past messages, gallery photos, and voice notes remain stored permanently on this device across any number of logins.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CHAT LISTS & FILTERS MODAL ── */}
      {showChatLists && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111b21] border border-[#2a3942] rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="bg-[#202c33] p-4 flex items-center justify-between border-b border-[#2a3942]">
              <h3 className="text-base font-bold text-white">Chats</h3>
              <button
                onClick={() => setShowChatLists(false)}
                className="p-1 rounded-full text-[#8696a0] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Tabs: All, Unread, Favorites, Groups */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2a3942] overflow-x-auto">
              {(['all', 'unread', 'favorites', 'groups'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setChatFilter(tab)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                    chatFilter === tab
                      ? 'bg-[#00a884]/20 text-[#00a884] border border-[#00a884]/40'
                      : 'bg-[#202c33] text-[#8696a0] hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Chats List */}
            <div className="p-3 space-y-2 overflow-y-auto">
              <div
                onClick={() => setShowChatLists(false)}
                className="p-3 rounded-2xl bg-[#202c33] hover:bg-[#222e35] cursor-pointer transition-colors flex items-center justify-between border border-emerald-500/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-sm shadow">
                    {partnerName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-white">{partnerName}</span>
                      <span className="text-[10px] text-amber-400">★</span>
                    </div>
                    <p className="text-xs text-[#8696a0] truncate max-w-[200px]">
                      {messages[messages.length - 1]?.text || 'No messages yet'}
                    </p>
                  </div>
                </div>
                <div className="text-right text-[10px] text-[#8696a0]">
                  <span>{messages[messages.length - 1]?.time || 'Now'}</span>
                  <div className="mt-1 w-2 h-2 rounded-full bg-emerald-400 ml-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TARGETED MANAGE STORAGE UTILITY MODAL ── */}
      {showStorageModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111b21] border border-[#2a3942] rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2a3942] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <HardDrive className="w-5 h-5 text-emerald-400" />
                <span>Manage Storage</span>
              </div>
              <button
                onClick={() => setShowStorageModal(false)}
                className="p-1 rounded-full text-[#8696a0] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#8696a0]">
              Storage weight for conversation with <strong className="text-white">{partnerName}</strong>:
            </p>

            <div className="p-4 rounded-2xl bg-[#202c33] space-y-3">
              <div className="flex justify-between items-center text-sm font-bold text-white">
                <span>Total Chat Weight</span>
                <span className="text-emerald-400 font-mono text-base">{storageStats.totalMb} MB</span>
              </div>
              <div className="h-2 w-full bg-[#111b21] rounded-full overflow-hidden flex">
                <div className="h-full bg-purple-500 w-[65%]" title="Photos & HD Media" />
                <div className="h-full bg-amber-500 w-[25%]" title="Voice Notes" />
                <div className="h-full bg-emerald-500 w-[10%]" title="Text messages" />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-[#8696a0] pt-1">
                <div>
                  <div className="font-bold text-white">{storageStats.photosCount}</div>
                  <div>Photos</div>
                </div>
                <div>
                  <div className="font-bold text-white">{storageStats.voiceCount}</div>
                  <div>Voice</div>
                </div>
                <div>
                  <div className="font-bold text-white">{storageStats.textCount}</div>
                  <div>Texts</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleClearMediaStorage}
              className="w-full py-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Heavy Media Files</span>
            </button>
          </div>
        </div>
      )}

      {/* ── CONTACT INFO DRAWER ── */}
      {showContactInfo && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111b21] border border-[#2a3942] rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5 text-center">
            <button
              onClick={() => setShowContactInfo(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-[#8696a0] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-xl">
              {partnerName[0]}
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">{partnerName}</h3>
              <p className="text-xs text-emerald-400 font-medium">Verified 1-to-1 End-to-End Chat</p>
            </div>

            {/* Security Section Button */}
            <button
              onClick={() => {
                setShowContactInfo(false);
                setShowSecurityModal(true);
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-bold text-emerald-300 flex items-center justify-center gap-2 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Security &amp; Privacy Section</span>
            </button>

            {/* Advanced Chat Privacy Toggle */}
            <div className="p-3.5 rounded-2xl bg-[#202c33] border border-[#2a3942] text-left flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Advanced Chat Privacy</span>
                </div>
                <div className="text-[10px] text-[#8696a0] mt-0.5">
                  Blocks exports &amp; auto-download
                </div>
              </div>
              <button
                onClick={handleTogglePrivacy}
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  advancedPrivacy ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    advancedPrivacy ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Read Receipts Toggle */}
            <div className="p-3.5 rounded-2xl bg-[#202c33] border border-[#2a3942] text-left flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckCheck className={`w-3.5 h-3.5 ${readReceiptsEnabled ? 'text-[#53bdeb]' : 'text-[#8696a0]'}`} />
                  <span>Read Receipts</span>
                </div>
                <div className="text-[10px] text-[#8696a0] mt-0.5">
                  Blue ticks on message read
                </div>
              </div>
              <button
                onClick={handleToggleReadReceipts}
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  readReceiptsEnabled ? 'bg-[#00a884]' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    readReceiptsEnabled ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Manage Storage Button */}
            <button
              onClick={() => {
                setShowContactInfo(false);
                setShowStorageModal(true);
              }}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-2"
            >
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span>Targeted Manage Storage ({storageStats.totalMb} MB)</span>
            </button>
          </div>
        </div>
      )}

      {/* ── CREATE POLL MODAL ── */}
      {showPollModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111b21] border border-[#2a3942] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#2a3942] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <BarChart2 className="w-5 h-5 text-emerald-400" />
                <span>Create Poll</span>
              </div>
              <button
                onClick={() => setShowPollModal(false)}
                className="p-1 rounded-full text-[#8696a0] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#8696a0] font-medium block mb-1">Question</label>
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full bg-[#202c33] border border-[#2a3942] focus:border-[#00a884] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-[#8696a0] font-medium block mb-1">Options</label>
                <div className="space-y-2">
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...pollOptions];
                          updated[idx] = e.target.value;
                          setPollOptions(updated);
                        }}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 bg-[#202c33] border border-[#2a3942] focus:border-[#00a884] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none transition-colors"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                          className="p-2 text-[#8696a0] hover:text-rose-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {pollOptions.length < 6 && (
                  <button
                    type="button"
                    onClick={() => setPollOptions([...pollOptions, ''])}
                    className="mt-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Option</span>
                  </button>
                )}
              </div>

              {/* Allow Multiple Answers Toggle */}
              <div className="p-3 rounded-xl bg-[#202c33] border border-[#2a3942] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Allow multiple answers</div>
                  <div className="text-[10px] text-[#8696a0]">Voters can select more than one option</div>
                </div>
                <button
                  type="button"
                  onClick={() => setPollAllowMultiple(!pollAllowMultiple)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    pollAllowMultiple ? 'bg-[#00a884]' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      pollAllowMultiple ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPollModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#8696a0] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreatePoll}
                className="flex-1 py-2.5 rounded-xl bg-[#00a884] hover:bg-[#029071] text-xs font-bold text-white transition-all shadow-md"
              >
                Create Poll
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STARRED MESSAGES MODAL ── */}
      {showStarredModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111b21] border border-[#2a3942] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#2a3942] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>Starred Messages</span>
              </div>
              <button
                onClick={() => setShowStarredModal(false)}
                className="p-1 rounded-full text-[#8696a0] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {messages.filter((m) => m.isStarred).length === 0 ? (
                <div className="text-center py-10 space-y-2 text-[#8696a0]">
                  <Star className="w-8 h-8 stroke-1 mx-auto text-[#8696a0]/40" />
                  <p className="text-sm font-medium">No Starred Messages</p>
                  <p className="text-xs">Hover over any message and click the star icon to keep important notes handy.</p>
                </div>
              ) : (
                messages
                  .filter((m) => m.isStarred)
                  .map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-2xl bg-[#202c33] border border-[#2a3942] space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-emerald-400">
                          {m.sender === currentUser ? 'You' : partnerName}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#8696a0]">{m.time}</span>
                          <button
                            onClick={() => handleToggleStarMessage(m.id)}
                            className="text-amber-400 hover:text-white"
                            title="Unstar"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-white break-words">
                        {m.type === 'poll' && m.poll
                          ? `📊 Poll: ${m.poll.question}`
                          : m.type === 'document'
                          ? `📄 Document: ${m.documentName || m.text}`
                          : m.type === 'voice'
                          ? `🎤 Voice Note (${m.duration || '0:12'})`
                          : m.text}
                      </p>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── CHAT WALLPAPER SELECTOR MODAL ── */}
      {showWallpaperModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111b21] border border-[#2a3942] rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2a3942] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Palette className="w-5 h-5 text-teal-400" />
                <span>Chat Wallpaper</span>
              </div>
              <button
                onClick={() => setShowWallpaperModal(false)}
                className="p-1 rounded-full text-[#8696a0] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#8696a0]">
              Select a background theme for your WhatsApp chat conversation:
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {[
                { id: 'doodle', label: 'Doodle (Classic)', bg: 'bg-[#0c1317] border-[#00a884]' },
                { id: 'obsidian', label: 'Obsidian Dark', bg: 'bg-[#0a0f12] border-slate-700' },
                { id: 'emerald', label: 'Emerald Green', bg: 'bg-[#071a14] border-emerald-800' },
                { id: 'teal', label: 'Deep Teal', bg: 'bg-[#0b191e] border-teal-800' },
                { id: 'coffee', label: 'Warm Coffee', bg: 'bg-[#181512] border-amber-900' },
              ].map((wp) => (
                <button
                  key={wp.id}
                  onClick={() => {
                    setActiveWallpaper(wp.id);
                    try {
                      localStorage.setItem('whatsapp_custom_wallpaper', wp.id);
                    } catch {}
                    setShowWallpaperModal(false);
                  }}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-20 transition-all ${wp.bg} ${
                    activeWallpaper === wp.id
                      ? 'ring-2 ring-emerald-400 scale-[1.02]'
                      : 'hover:border-white/40'
                  }`}
                >
                  <span className="text-xs font-semibold text-white">{wp.label}</span>
                  {activeWallpaper === wp.id && (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── WHATSAPP AUDIO & VIDEO CALL MODAL ── */}
      {(showCallModal || incomingCall) && (
        <WhatsAppCallModal
          callType={incomingCall ? incomingCall.type : (showCallModal || 'video')}
          partnerName={partnerName}
          partnerUser={partnerUser}
          currentUser={currentUser}
          isIncoming={Boolean(incomingCall)}
          incomingOffer={incomingCall?.offer}
          onClose={handleCallFinished}
          channelRef={channelRef}
        />
      )}
    </div>
  );
};
