import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { getSupabase, ChatMessage, ExtendedChatMessage, LOCAL_MESSAGES_KEY } from '../../services/supabaseClient';
import {
  fetchRemoteMessages,
  fetchAllRemoteMessages,
  saveRemoteMessage,
  editRemoteMessage,
  deleteRemoteMessageForMe,
  deleteRemoteMessageForEveryone,
  STUDY_GROUP_CHAT_ID,
  PERMITTED_CONVERSATIONS,
  ConversationInfo,
  updateRemoteStatus,
  markAllIncomingAsRead,
  updateRemoteReactions,
  updateRemotePin,
  updateRemoteStar,
  updateRemotePoll,
  deleteRemoteMessage,
  clearRemoteChat,
  mergeMessages,
  rowToMessage,
  CHAT_ID,
} from '../../services/chatSyncService';
import { crossDeviceSync } from '../../services/crossDeviceSyncService';
import { performFullCleanSlateReset } from '../../services/cleanSlateService';
import {
  MessageSquare,
  Images,
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
  Heart,
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
  ChevronLeft,
  ChevronRight,
  Camera,
  Copy,
  BookOpen,
  GraduationCap,
  Key,
  Keyboard,
  Plus,
  Star,
  CornerUpLeft,
  BarChart2,
  CheckSquare,
  Download,
  Palette,
  Sun,
  Moon,
  Maximize2,
  Bookmark,
  CheckCircle,
  Wifi,
  WifiOff,
  Users,
  User,
  AlertCircle,
  Edit2,
  RotateCw,
  Ban,
  Circle,
  GitBranch,
  Menu,
  Bell,
  BellRing
} from 'lucide-react';
import { EmojiSvg, EMOJI_REGEX } from './EmojiSvg';
import { WhatsAppEmojiPicker } from './WhatsAppEmojiPicker';
import { ChatSidePanel, SidePanelMode } from './ChatSidePanel';
import { WhatsAppCallModal } from './WhatsAppCallModal';
import { WhatsAppLeftNav, MainNavView } from './WhatsAppLeftNav';
import { WhatsAppStatusView } from './WhatsAppStatusView';
import { NotificationCenterModal } from '../notifications/NotificationCenterModal';
import { smartNotificationService, SmartNotification } from '../../services/smartNotificationService';
import { GalleryView } from '../gallery/GalleryView';
import { LifeTimelineView } from '../timeline/LifeTimelineView';
import { RecycleBinView } from '../recycle/RecycleBinView';
import { compressImageClientSide } from '../../services/galleryService';
import { moveToRecycleBin } from '../../services/recycleBinService';
import { THEMES, ThemeId, CHAT_WALLPAPERS, getStoredTheme, saveStoredTheme } from '../../config/themes';
import { useToast } from '../common/Toast';
import { DateCounterModal, useDateCount } from '../common/DateCounterModal';
import { DHARYA_LOGO_DATA_URI } from '../../assets/dharyaLogoDataUri';

export interface PendingMediaItem {
  id: string;
  file?: File;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl: string;
  fileName: string;
  fileSizeKb: number;
  duration?: string;
  isHd?: boolean;
}

interface WhatsAppChatViewProps {
  initialTab?: 'chat' | 'status' | 'gallery' | 'timeline';
}

export const WhatsAppChatView: React.FC<WhatsAppChatViewProps> = ({ initialTab = 'chat' }) => {
  const { student, logoutChat, switchTab, quickLogin } = useStudyApp();
  const { showToast } = useToast();

  // Active user and partner details
  const currentUser: 'surya' | 'sadhana' = student?.username === 'sadhana' ? 'sadhana' : 'surya';
  const partnerUser: 'surya' | 'sadhana' = currentUser === 'surya' ? 'sadhana' : 'surya';
  const partnerName = partnerUser === 'sadhana' ? 'Sadhana' : 'Surya';

  // Active Conversation Routing & Identity
  const [activeChatId, setActiveChatId] = useState<string>(() => {
    try {
      return localStorage.getItem('dharya_active_chat_id') || CHAT_ID;
    } catch {
      return CHAT_ID;
    }
  });
  const activeChatIdRef = useRef(activeChatId);
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  const activeConversation = useMemo(() => {
    return PERMITTED_CONVERSATIONS.find((c) => c.id === activeChatId) || PERMITTED_CONVERSATIONS[0];
  }, [activeChatId]);

  const isGroupChat = activeConversation.type === 'group';

  const getChatStorageKey = (chatId: string) => {
    return chatId === CHAT_ID ? LOCAL_MESSAGES_KEY : `${LOCAL_MESSAGES_KEY}_${chatId}`;
  };

  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'offline'>('connecting');
  const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState<boolean>(false);
  const [editingMessage, setEditingMessage] = useState<ExtendedChatMessage | null>(null);
  const [editText, setEditText] = useState<string>('');

  // Load stored messages permanently from localStorage for active conversation
  const [messages, setMessages] = useState<ExtendedChatMessage[]>(() => {
    try {
      const initChatId = localStorage.getItem('dharya_active_chat_id') || CHAT_ID;
      const key = initChatId === CHAT_ID ? LOCAL_MESSAGES_KEY : `${LOCAL_MESSAGES_KEY}_${initChatId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  // Persistent Input Draft across tab switches and reloads
  const [inputText, setInputText] = useState(() => {
    try {
      const u = student?.username === 'sadhana' ? 'sadhana' : 'surya';
      return localStorage.getItem(`dharya_draft_${u}`) || '';
    } catch {
      return '';
    }
  });

  // Online / Offline Network Monitoring
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Message Selection & Bulk Actions
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [selectedMsgIds, setSelectedMsgIds] = useState<Set<string>>(new Set());

  // Media filter for search: 'all' | 'image' | 'video' | 'voice' | 'document' | 'starred'
  const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video' | 'voice' | 'document' | 'starred'>('all');
  
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

  // Date badge label generator ("Today", "Yesterday", or formatted date)
  const getDateDividerLabel = (timestamp: number): string => {
    const d = new Date(timestamp);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return 'Today';
    }
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // ── SOUND & NOTIFICATION SETTINGS ──
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('dharya_sound_enabled') !== 'false';
    } catch {
      return true;
    }
  });

  const [isConversationMuted, setIsConversationMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('dharya_chat_muted') === 'true';
    } catch {
      return false;
    }
  });

  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState<boolean>(() => {
    try {
      return typeof Notification !== 'undefined' && Notification.permission === 'granted';
    } catch {
      return false;
    }
  });

  const [hideNotificationPreview, setHideNotificationPreview] = useState<boolean>(() => {
    try {
      return localStorage.getItem('dharya_hide_notification_preview') === 'true';
    } catch {
      return false;
    }
  });

  // Synthesized notification chime via Web Audio API (cross-platform, zero external asset dependency)
  const playNotificationSound = () => {
    if (isConversationMuted || !soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  };

  // ── AI SMART NOTIFICATIONS SYSTEM (Never exposes raw message text) ──
  const [showNotificationCenter, setShowNotificationCenter] = useState<boolean>(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(() =>
    smartNotificationService.getUnreadCount()
  );

  useEffect(() => {
    const unsub = smartNotificationService.subscribe(() => {
      setUnreadNotifCount(smartNotificationService.getUnreadCount());
    });
    return unsub;
  }, []);

  const triggerBrowserNotification = (msg: ExtendedChatMessage) => {
    if (isConversationMuted) return;
    const senderDisplay = msg.sender === 'sadhana' ? 'Sadhana' : 'Surya';
    smartNotificationService.processIncomingMessage(msg, senderDisplay);
  };

  // ── FOCUSED 2-USER CONVERSATION & SIDE PANEL STATES ──
  const [sidePanelMode, setSidePanelMode] = useState<SidePanelMode>('none');
  const [expandedMsgIds, setExpandedMsgIds] = useState<Record<string, boolean>>({});
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingAudioPreview, setIsPlayingAudioPreview] = useState<boolean>(false);
  const audioPreviewAudioRef = useRef<HTMLAudioElement | null>(null);

  const [activeMainView, setActiveMainView] = useState<MainNavView>(initialTab ?? 'chat');
  const [isNavSidebarOpen, setIsNavSidebarOpen] = useState<boolean>(false);
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  const [mobileView, setMobileView] = useState<'list' | 'conversation'>(() => {
    return 'conversation';
  });

  const [showMobileSearch, setShowMobileSearch] = useState<boolean>(false);
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');

  const chatBroadcastRef = useRef<BroadcastChannel | null>(null);
  const callSignalingRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const isMob = window.innerWidth < 768;
      setIsMobileScreen(isMob);
    };
    window.addEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('✓ Connected to network. Syncing messages...', 'success');
      fetchRemoteMessages(activeChatIdRef.current).then((res) => {
        if (res.messages && res.messages.length > 0) {
          setMessages((prev) => mergeMessages(prev, res.messages));
          setHasMoreMessages(res.hasMore);
        }
      });
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('⚠️ Network connection lost. Offline mode active.', 'error');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  const [showSidebarMenu, setShowSidebarMenu] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveMainView(initialTab ?? 'chat');
      if (initialTab === 'gallery' || initialTab === 'timeline') {
        setMobileView('conversation');
      }
    }
  }, [initialTab]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuLevel, setMenuLevel] = useState<'main' | 'more'>('main');
  const [showDisappearingModal, setShowDisappearingModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [disappearingTimer, setDisappearingTimer] = useState<'off' | '24h' | '7d' | '90d'>(() => {
    try {
      return (localStorage.getItem('dharya_disappearing_timer') as 'off' | '24h' | '7d' | '90d') || 'off';
    } catch {
      return 'off';
    }
  });
  const [isFavoritedChat, setIsFavoritedChat] = useState<boolean>(() => {
    try {
      return localStorage.getItem('dharya_chat_is_favorited') === 'true';
    } catch {
      return false;
    }
  });
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [showChatLists, setShowChatLists] = useState(false);
  const [chatFilter, setChatFilter] = useState<'all' | 'unread' | 'favorites' | 'groups'>('all');
  const [showCallModal, setShowCallModal] = useState<'audio' | 'video' | null>(null);
  const [incomingCall, setIncomingCall] = useState<{ caller: string; type: 'audio' | 'video'; offer?: any } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [reactionTargetMsgId, setReactionTargetMsgId] = useState<string | null>(null);

  // Switch Conversation Handler
  const handleSelectConversation = (chatId: string) => {
    if (chatId === activeChatId) {
      setActiveMainView('chat');
      setMobileView('conversation');
      return;
    }
    setActiveChatId(chatId);
    try {
      localStorage.setItem('dharya_active_chat_id', chatId);
    } catch {}

    const chatKey = getChatStorageKey(chatId);
    try {
      const cached = localStorage.getItem(chatKey);
      if (cached) {
        setMessages(JSON.parse(cached));
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    }

    setActiveMainView('chat');
    setMobileView('conversation');
    setEditingMessage(null);
    setEditText('');
    setReplyingToMessage(null);

    fetchRemoteMessages(chatId, 50).then((res) => {
      if (res.messages) {
        setMessages(res.messages);
        setHasMoreMessages(res.hasMore);
        try {
          localStorage.setItem(chatKey, JSON.stringify(res.messages));
        } catch {}
      }
    });
  };

  // Filtered list of permitted conversations (Direct & Group)
  const filteredConversations = useMemo(() => {
    return PERMITTED_CONVERSATIONS.filter((conv) => {
      if (sidebarSearchQuery.trim()) {
        const q = sidebarSearchQuery.toLowerCase();
        const matchName = conv.name.toLowerCase().includes(q) || (conv.id === CHAT_ID && partnerName.toLowerCase().includes(q));
        const matchDesc = Boolean(conv.description && conv.description.toLowerCase().includes(q));
        if (!matchName && !matchDesc) return false;
      }
      if (chatFilter === 'groups') return conv.type === 'group';
      if (chatFilter === 'favorites') return conv.id === CHAT_ID;
      if (chatFilter === 'unread') {
        const unreadCount = conv.id === activeChatId
          ? messages.filter((m) => m.sender !== currentUser && !m.read && m.status !== 'read').length
          : (() => {
              try {
                const msgs: ExtendedChatMessage[] = JSON.parse(localStorage.getItem(getChatStorageKey(conv.id)) || '[]');
                return msgs.filter((m) => m.sender !== currentUser && !m.read && m.status !== 'read').length;
              } catch {
                return 0;
              }
            })();
        return unreadCount > 0;
      }
      return true;
    });
  }, [sidebarSearchQuery, chatFilter, activeChatId, messages, currentUser, partnerName]);

  const getConversationDetails = (conv: ConversationInfo) => {
    const isSelected = activeMainView === 'chat' && activeChatId === conv.id;
    const isGroup = conv.type === 'group';
    const displayName = isGroup ? conv.name : partnerName;

    let convMessages = messages;
    if (conv.id !== activeChatId) {
      try {
        convMessages = JSON.parse(localStorage.getItem(getChatStorageKey(conv.id)) || '[]');
      } catch {
        convMessages = [];
      }
    }

    const visibleMessages = convMessages.filter((m) => !m.deletedFor?.includes(currentUser));
    const lastMsg = visibleMessages[visibleMessages.length - 1];
    const unreadCount = visibleMessages.filter((m) => m.sender !== currentUser && !m.read && m.status !== 'read').length;

    return { isSelected, isGroup, displayName, lastMsg, unreadCount };
  };

  // ── FULL WHATSAPP FEATURE SUITE STATES ──
  const [replyingToMessage, setReplyingToMessage] = useState<ExtendedChatMessage | null>(null);
  const [isPartnerTyping, setIsPartnerTyping] = useState<boolean>(false);
  const partnerTypingTimerRef = useRef<number | null>(null);
  const lastTypingBroadcastRef = useRef<number>(0);

  // Starred messages modal
  const [showStarredModal, setShowStarredModal] = useState<boolean>(false);
  const partnerOfflineTimerRef = useRef<any>(null);

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

  // ── FULL 10-THEME SYSTEM ENGINE ──
  const [themeId, setThemeId] = useState<ThemeId>(() => getStoredTheme());
  const activeTheme = useMemo(() => THEMES[themeId] || THEMES.dark, [themeId]);
  const isDark = activeTheme.isDark;
  const [showThemeModal, setShowThemeModal] = useState<boolean>(false);
  const [themeModalTab, setThemeModalTab] = useState<'themes' | 'wallpapers'>('themes');
  const customWallpaperFileRef = useRef<HTMLInputElement | null>(null);
  const [showDateCountModal, setShowDateCountModal] = useState<boolean>(false);
  const dateCount = useDateCount();

  const handleSelectTheme = (newThemeId: ThemeId) => {
    setThemeId(newThemeId);
    saveStoredTheme(newThemeId);
    showToast(`Theme switched to ${THEMES[newThemeId]?.name || newThemeId}`, 'success');
  };

  const toggleTheme = () => {
    const nextTheme: ThemeId = isDark ? 'light' : 'dark';
    handleSelectTheme(nextTheme);
  };

  // ── TYPOGRAPHY: CASUAL HANDWRITING (EXACT MATCH TO USER SCREENSHOT) VS STANDARD SANS ──
  const [chatFont, setChatFont] = useState<'handwriting' | 'sans'>(() => {
    try {
      return (localStorage.getItem('dharya_chat_font') as 'handwriting' | 'sans') || 'handwriting';
    } catch {
      return 'handwriting';
    }
  });

  const handleToggleChatFont = () => {
    const next = chatFont === 'handwriting' ? 'sans' : 'handwriting';
    setChatFont(next);
    try {
      localStorage.setItem('dharya_chat_font', next);
    } catch {}
    showToast(`Typography switched to ${next === 'handwriting' ? 'Playful Handwriting' : 'Standard WhatsApp'}`, 'info');
  };

  const fontClass = chatFont === 'handwriting'
    ? "font-['Delius',_'Comfortaa',_cursive,sans-serif]"
    : "font-sans";

  // ── DHARYA COINS & TOKENS (₹ FEATURE FROM SCREENSHOT) ──
  const [showCoinModal, setShowCoinModal] = useState<boolean>(false);
  const [coinBalance, setCoinBalance] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('dharya_coins_balance') || '350', 10);
    } catch {
      return 350;
    }
  });

  const handleCollectDailyCoins = () => {
    const newBal = coinBalance + 50;
    setCoinBalance(newBal);
    try {
      localStorage.setItem('dharya_coins_balance', String(newBal));
    } catch {}
    const coinMsg: ExtendedChatMessage = {
      id: `msg-coin-${Date.now()}`,
      sender: currentUser,
      text: `🪙 Collected daily Dharya Coins! (+50 Coins). Current Balance: ${newBal} Coins 🎉`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      status: 'sent',
      type: 'text',
      read: false,
    };
    dispatchSendMessage(coinMsg);
    setShowCoinModal(false);
    showToast('Collected 50 Coins! 🎉', 'success');
  };

  const handleSendCoinToken = (title: string, amount: number, note: string) => {
    if (coinBalance < amount) {
      showToast('Not enough coins balance!', 'error');
      return;
    }
    const newBal = coinBalance - amount;
    setCoinBalance(newBal);
    try {
      localStorage.setItem('dharya_coins_balance', String(newBal));
    } catch {}
    const tokenMsg: ExtendedChatMessage = {
      id: `msg-token-${Date.now()}`,
      sender: currentUser,
      text: `🪙 ${title} (${amount} Coins)\n"${note}"\nSent with love ❤️`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      status: 'sent',
      type: 'text',
      read: false,
    };
    dispatchSendMessage(tokenMsg);
    setShowCoinModal(false);
    showToast(`Sent ${title}! ❤️`, 'success');
  };

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

  // Last Seen Privacy State
  const [shareLastSeen, setShareLastSeen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('whatsapp_share_last_seen') !== 'false';
    } catch {
      return true;
    }
  });

  // WhatsApp Message Status Ticks Renderer (Honest States: sending -> sent -> delivered -> read / failed)
  const renderMessageTicks = (msg: ExtendedChatMessage) => {
    if (msg.sender !== currentUser) return null;

    const status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed' =
      msg.status || (msg.read ? 'read' : 'sent');

    if (status === 'failed') {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleRetrySendMessage(msg);
          }}
          className="text-rose-400 hover:text-rose-300 inline-flex items-center gap-1 ml-1 cursor-pointer transition-colors"
          title="Failed to send. Click to retry."
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span className="text-[10px] underline font-medium">Retry</span>
        </button>
      );
    }

    if (status === 'sending') {
      return (
        <span className="text-white/60 inline-flex items-center ml-1" title="Sending...">
          <Clock className="w-3 h-3" />
        </span>
      );
    }

    // Single grey tick: saved to Supabase backend
    if (status === 'sent') {
      return (
        <span
          className="text-[#8696a0] inline-flex items-center ml-1"
          title="One grey tick: Sent to server"
        >
          <Check className="w-3.5 h-3.5 stroke-[2.3]" />
        </span>
      );
    }

    // Double grey tick: recipient acknowledged delivery
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
      // User disabled read receipts in privacy settings
      return (
        <span
          className="text-[#8696a0] inline-flex items-center ml-1"
          title="Two grey ticks: Delivered"
        >
          <CheckCheck className="w-3.5 h-3.5 stroke-[2.3]" />
        </span>
      );
    }

    // Double blue tick: recipient actively opened and read the message
    return (
      <span
        className="text-[#53bdeb] inline-flex items-center ml-1"
        title="Two blue ticks: Recipient opened the chat and read your message."
      >
        <CheckCheck className="w-3.5 h-3.5 stroke-[2.3]" />
      </span>
    );
  };

  // Media Sender Preview Modal State (Multiple Photos or Videos)
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [pendingMediaList, setPendingMediaList] = useState<PendingMediaItem[]>([]);
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);
  const [isUploadingMedia, setIsUploadingMedia] = useState<boolean>(false);
  const [uploadProgressPct, setUploadProgressPct] = useState<number>(0);
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
    allUrls?: string[];
    currentIndex?: number;
  } | null>(null);

  // Audio recording simulation state
  const [isPlayingAudioId, setIsPlayingAudioId] = useState<string | null>(null);
  const [showTranscriptIds, setShowTranscriptIds] = useState<Record<string, boolean>>({});

  // Active reaction popover message id
  const [reactionBubbleId, setReactionBubbleId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const channelRef = useRef<any>(null);

  // Intelligent Scroll Retention & Floating Jump to Newest
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const isNearBottomRef = useRef<boolean>(true);
  const [showScrollBottom, setShowScrollBottom] = useState<boolean>(false);
  const [unreadCountBelow, setUnreadCountBelow] = useState<number>(0);

  // Message Delete Confirmation Dialog (Recycle Bin / Delete for Everyone / Delete for Me)
  const [deleteDialogMsg, setDeleteDialogMsg] = useState<ExtendedChatMessage | null>(null);

  const handleChatScroll = () => {
    const el = chatScrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isNear = distanceFromBottom < 120;
    isNearBottomRef.current = isNear;
    setShowScrollBottom(!isNear);
    if (isNear) {
      setUnreadCountBelow(0);
    }
  };

  // Save messages permanently to localStorage
  const persistMessages = (newMessages: ExtendedChatMessage[], targetChatId: string = activeChatIdRef.current) => {
    try {
      const key = getChatStorageKey(targetChatId);
      localStorage.setItem(key, JSON.stringify(newMessages));
      if (targetChatId === CHAT_ID) {
        localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(newMessages));
      }
    } catch {}
  };

  // Sync cross-tab messages permanently
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      const currentKey = getChatStorageKey(activeChatIdRef.current);
      if ((e.key === currentKey || (activeChatIdRef.current === CHAT_ID && e.key === LOCAL_MESSAGES_KEY)) && e.newValue) {
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
  }, [activeChatId]);

  // Continuous bi-directional synchronization with Supabase backend
  const syncWithRemote = useRef<() => Promise<void>>(async () => {});

  syncWithRemote.current = async () => {
    try {
      const currentId = activeChatIdRef.current;
      const res = await fetchRemoteMessages(currentId, 50);
      if (res.messages && res.messages.length > 0) {
        setHasMoreMessages(res.hasMore);
        setMessages((prev) => {
          const merged = mergeMessages(prev, res.messages);
          // Check if any change exists
          if (
            merged.length !== prev.length ||
            merged.some((m, idx) => {
              const p = prev[idx];
              if (!p) return true;
              return (
                m.id !== p.id ||
                m.status !== p.status ||
                m.text !== p.text ||
                m.isEdited !== p.isEdited ||
                m.deletedForAll !== p.deletedForAll ||
                m.isPinned !== p.isPinned ||
                m.isOpened !== p.isOpened ||
                JSON.stringify(m.reactions || {}) !== JSON.stringify(p.reactions || {})
              );
            })
          ) {
            try {
              localStorage.setItem(getChatStorageKey(currentId), JSON.stringify(merged));
              if (currentId === CHAT_ID) {
                localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(merged));
              }
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

  // Older messages pagination loader preserving scroll offset
  const handleLoadOlderMessages = async () => {
    if (isLoadingOlder || !hasMoreMessages || messages.length === 0) return;
    const oldest = messages[0];
    if (!oldest) return;

    const container = chatScrollRef.current;
    const prevScrollHeight = container ? container.scrollHeight : 0;
    const prevScrollTop = container ? container.scrollTop : 0;

    setIsLoadingOlder(true);
    try {
      const res = await fetchRemoteMessages(activeChatId, 50, oldest.timestamp);
      if (res.messages && res.messages.length > 0) {
        setMessages((prev) => {
          const merged = mergeMessages(res.messages, prev);
          try {
            localStorage.setItem(getChatStorageKey(activeChatId), JSON.stringify(merged));
          } catch {}
          return merged;
        });
        setHasMoreMessages(res.hasMore);
        requestAnimationFrame(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - prevScrollHeight + prevScrollTop;
          }
        });
      } else {
        setHasMoreMessages(false);
      }
    } catch (err) {
      console.warn('Failed to load older messages:', err);
    } finally {
      setIsLoadingOlder(false);
    }
  };

  // Dispatch outgoing message with honest initial 'sending' -> 'sent' state and cross-device push
  const dispatchSendMessage = async (msg: ExtendedChatMessage) => {
    const sentMsg: ExtendedChatMessage = {
      ...msg,
      chatId: activeChatId,
      status: 'sent',
    };

    setMessages((prev) => {
      const next = [...prev, sentMsg];
      persistMessages(next);
      return next;
    });

    // 1. Cross-Device Guaranteed Push (reaches the other device anywhere on the internet in <50ms)
    crossDeviceSync.publish('new_message', sentMsg).catch((e) => {
      console.warn('[CrossDeviceSync] Publish failed:', e);
    });

    // 2. Same-device multi-tab synchronization
    try {
      chatBroadcastRef.current?.postMessage({
        type: 'new_message',
        payload: sentMsg,
      });
    } catch {}

    // 3. Supabase Realtime channel broadcast (if connected)
    try {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'new_message',
        payload: sentMsg,
      });
    } catch {}

    // 4. Remote PostgreSQL DB backup (non-blocking)
    saveRemoteMessage(sentMsg, activeChatId).catch((err) => {
      console.warn('[Supabase] Background save fallback:', err);
    });
  };

  // Retry sending a previously failed message
  const handleRetrySendMessage = async (msg: ExtendedChatMessage) => {
    const sentMsg: ExtendedChatMessage = { ...msg, status: 'sent' };
    setMessages((prev) => {
      const next = prev.map((m) => (m.id === msg.id ? sentMsg : m));
      persistMessages(next);
      return next;
    });
    crossDeviceSync.publish('new_message', sentMsg).catch(() => {});
    try {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'new_message',
        payload: sentMsg,
      });
    } catch {}
    saveRemoteMessage(sentMsg, activeChatId).catch(() => {});
  };

  // Edit Message Action
  const handleConfirmEdit = async () => {
    if (!editingMessage || !editText.trim()) return;
    const newText = editText.trim();
    const msgId = editingMessage.id;
    const editedAt = new Date().toISOString();

    setMessages((prev) => {
      const updated = prev.map((m) =>
        m.id === msgId ? { ...m, text: newText, isEdited: true, editedAt } : m
      );
      persistMessages(updated);
      return updated;
    });

    setEditingMessage(null);
    setEditText('');

    await editRemoteMessage(msgId, newText, currentUser).catch(() => {});

    crossDeviceSync.publish('message_edited', { msgId, newText, editedAt, sender: currentUser });

    try {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'message_edited',
        payload: { msgId, newText, editedAt, sender: currentUser },
      });
    } catch {}
  };

  // Initial load from Supabase on mount
  useEffect(() => {
    syncWithRemote.current();
  }, [activeChatId]);

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

  // Desktop Keyboard Shortcuts: Ctrl+F for search, Escape to close panels or clear reply/edit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setSidePanelMode((prev) => (prev === 'search' ? 'none' : 'search'));
        return;
      }

      if (e.key === 'Escape') {
        if (sidePanelMode !== 'none') {
          setSidePanelMode('none');
          return;
        }
        if (replyingToMessage) {
          setReplyingToMessage(null);
          return;
        }
        if (editingMessage) {
          setEditingMessage(null);
          setEditText('');
          return;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidePanelMode, replyingToMessage, editingMessage]);

  // Subscribe to real-time broker connection status
  useEffect(() => {
    const unsub = crossDeviceSync.onConnectionStatusChange((status) => {
      setConnectionStatus(status);
    });
    return unsub;
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
      } catch {}
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [currentUser, partnerUser]);

  // Supabase Realtime channel setup with Presence Tracking & Multi-Room Support
  useEffect(() => {
    try {
      const supabase = getSupabase();
      setConnectionStatus('connecting');

      const channel = supabase.channel(`dharya-room-${activeChatId}`, {
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
            if (incoming.chatId && incoming.chatId !== activeChatId) {
              // Message is for another permitted conversation; cache it for unread badge
              const otherKey = getChatStorageKey(incoming.chatId);
              try {
                const prevOther = JSON.parse(localStorage.getItem(otherKey) || '[]');
                if (!prevOther.some((m: any) => m.id === incoming.id)) {
                  localStorage.setItem(otherKey, JSON.stringify([...prevOther, incoming]));
                }
              } catch {}
              return;
            }

            setMessages((prev) => {
              if (prev.some((m) => m.id === incoming.id)) return prev;
              const next = [...prev, incoming];
              try {
                localStorage.setItem(getChatStorageKey(activeChatId), JSON.stringify(next));
                if (activeChatId === CHAT_ID) {
                  localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(next));
                }
              } catch {}
              return next;
            });

            // If incoming is from recipient: play notification and acknowledge honest delivery receipt
            if (incoming.sender !== currentUser) {
              playNotificationSound();
              triggerBrowserNotification(incoming);

              // Send authentic delivered receipt event
              updateRemoteStatus(incoming.id, 'delivered');
              try {
                channel.send({
                  type: 'broadcast',
                  event: 'message_delivered',
                  payload: {
                    msgId: incoming.id,
                    recipient: currentUser,
                  },
                });
              } catch {}

              // If chat is open, user immediately views it -> acknowledge read receipt
              if (readReceiptsEnabledRef.current && document.visibilityState === 'visible') {
                setTimeout(() => {
                  updateRemoteStatus(incoming.id, 'read');
                  try {
                    channel.send({
                      type: 'broadcast',
                      event: 'message_read',
                      payload: {
                        msgId: incoming.id,
                        reader: currentUser,
                      },
                    });
                  } catch {}
                }, 400);
              }
            }
          }
        })
        .on('broadcast', { event: 'message_delivered' }, (payload) => {
          if (payload?.payload?.msgId) {
            const { msgId } = payload.payload;
            setMessages((prev) => {
              const updated = prev.map((m) =>
                m.id === msgId && m.status !== 'read' ? { ...m, status: 'delivered' as const } : m
              );
              try {
                localStorage.setItem(getChatStorageKey(activeChatId), JSON.stringify(updated));
                if (activeChatId === CHAT_ID) {
                  localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(updated));
                }
              } catch {}
              return updated;
            });
          }
        })
        .on('broadcast', { event: 'message_read' }, (payload) => {
          if (payload?.payload?.msgId) {
            const { msgId } = payload.payload;
            setMessages((prev) => {
              const updated = prev.map((m) =>
                m.id === msgId ? { ...m, status: 'read' as const, read: true } : m
              );
              try {
                localStorage.setItem(getChatStorageKey(activeChatId), JSON.stringify(updated));
                if (activeChatId === CHAT_ID) {
                  localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(updated));
                }
              } catch {}
              return updated;
            });
          }
        })
        .on('broadcast', { event: 'message_edited' }, (payload) => {
          if (payload?.payload?.msgId) {
            const { msgId, newText, editedAt } = payload.payload;
            setMessages((prev) => {
              const updated = prev.map((m) =>
                m.id === msgId ? { ...m, text: newText, isEdited: true, editedAt } : m
              );
              try {
                localStorage.setItem(getChatStorageKey(activeChatId), JSON.stringify(updated));
                if (activeChatId === CHAT_ID) {
                  localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(updated));
                }
              } catch {}
              return updated;
            });
          }
        })
        .on('broadcast', { event: 'message_deleted_for_all' }, (payload) => {
          if (payload?.payload?.msgId) {
            const { msgId } = payload.payload;
            setMessages((prev) => {
              const updated = prev.map((m) =>
                m.id === msgId ? { ...m, text: 'This message was deleted', deletedForAll: true } : m
              );
              try {
                localStorage.setItem(getChatStorageKey(activeChatId), JSON.stringify(updated));
                if (activeChatId === CHAT_ID) {
                  localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(updated));
                }
              } catch {}
              return updated;
            });
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
                localStorage.setItem(getChatStorageKey(activeChatId), JSON.stringify(updated));
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
                  localStorage.setItem(getChatStorageKey(activeChatId), JSON.stringify(updated));
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
                localStorage.setItem(getChatStorageKey(activeChatId), JSON.stringify(next));
              } catch {}
              return next;
            });
          }
        })
        .on('broadcast', { event: 'chat_cleared' }, () => {
          setMessages([]);
          try {
            localStorage.setItem(getChatStorageKey(activeChatId), JSON.stringify([]));
          } catch {}
        })
        .on('broadcast', { event: 'pin_update' }, (payload) => {
          if (payload?.payload) {
            const { msgId, isPinned } = payload.payload;
            setMessages((prev) => {
              const next = prev.map((m) => (m.id === msgId ? { ...m, isPinned } : m));
              try {
                localStorage.setItem(getChatStorageKey(activeChatId), JSON.stringify(next));
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
            }, 3000);
          }
        })
        .on('broadcast', { event: 'message_starred' }, (payload) => {
          if (payload?.payload) {
            const { msgId, isStarred } = payload.payload;
            setMessages((prev) => {
              const next = prev.map((m) => (m.id === msgId ? { ...m, isStarred } : m));
              try {
                localStorage.setItem(getChatStorageKey(activeChatId), JSON.stringify(next));
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
                localStorage.setItem(getChatStorageKey(activeChatId), JSON.stringify(next));
              } catch {}
              return next;
            });
          }
        })
        .on('broadcast', { event: 'call_offer' }, (payload) => {
          const data = payload?.payload;
          if (data && (data.recipient === currentUser || data.to === currentUser)) {
            setIncomingCall({
              caller: data.caller || data.from,
              type: data.callType || data.type || 'video',
              offer: data.offer,
            });
            window.dispatchEvent(new CustomEvent('whatsapp_call_signal', { detail: { event: 'call_offer', payload: data } }));
          }
        })
        .on('broadcast', { event: 'call_accepted' }, (payload) => {
          const data = payload?.payload;
          if (data) {
            window.dispatchEvent(new CustomEvent('whatsapp_call_signal', { detail: { event: 'call_accepted', payload: data } }));
          }
        })
        .on('broadcast', { event: 'webrtc_ice_candidate' }, (payload) => {
          const data = payload?.payload;
          if (data) {
            window.dispatchEvent(new CustomEvent('whatsapp_call_signal', { detail: { event: 'webrtc_ice_candidate', payload: data } }));
          }
        })
        .on('broadcast', { event: 'call_declined' }, (payload) => {
          const data = payload?.payload;
          setShowCallModal(null);
          setIncomingCall(null);
          window.dispatchEvent(new CustomEvent('whatsapp_call_signal', { detail: { event: 'call_declined', payload: data } }));
        })
        .on('broadcast', { event: 'call_ended' }, (payload) => {
          const data = payload?.payload;
          setShowCallModal(null);
          setIncomingCall(null);
          window.dispatchEvent(new CustomEvent('whatsapp_call_signal', { detail: { event: 'call_ended', payload: data } }));
        })
        .on('broadcast', { event: 'gallery_photo_added' }, (payload) => {
          const data = payload?.payload;
          if (data?.item) {
            window.dispatchEvent(new CustomEvent('gallery_item_added_remotely', { detail: { item: data.item } }));
          }
        })
        .on('broadcast', { event: 'gallery_photo_deleted' }, (payload) => {
          const data = payload?.payload;
          if (data?.itemId) {
            window.dispatchEvent(new CustomEvent('gallery_item_deleted_remotely', { detail: { itemId: data.itemId } }));
          }
        })
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `chat_id=eq.${activeChatId}`,
          },
          (payload) => {
            if (payload?.new) {
              const incoming = rowToMessage(payload.new);
              setMessages((prev) => {
                if (prev.some((m) => m.id === incoming.id)) return prev;
                const next = [...prev, incoming];
                try {
                  localStorage.setItem(getChatStorageKey(activeChatId), JSON.stringify(next));
                } catch {}
                return next;
              });
              if (incoming.sender !== currentUser) {
                playNotificationSound();
                triggerBrowserNotification(incoming);
                updateRemoteStatus(incoming.id, 'delivered');
              }
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `chat_id=eq.${activeChatId}`,
          },
          (payload) => {
            if (payload?.new) {
              const updated = rowToMessage(payload.new);
              setMessages((prev) => {
                const next = prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m));
                try {
                  localStorage.setItem(getChatStorageKey(activeChatId), JSON.stringify(next));
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
                  localStorage.setItem(getChatStorageKey(activeChatId), JSON.stringify(next));
                } catch {}
                return next;
              });
            }
          }
        )
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            setConnectionStatus('connected');
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
              markAllIncomingAsRead(currentUser, activeChatId);
              channel.send({
                type: 'broadcast',
                event: 'all_messages_read',
                payload: { reader: currentUser, readUpTo: Date.now() },
              });
            }

            // Sync with Supabase on connect
            syncWithRemote.current();
            // Start continuous background remote sync every 3s
            const bgSyncTimer = setInterval(() => {
              syncWithRemote.current();
              crossDeviceSync.pollMissedEvents();
            }, 3000);
            const onWinFocus = () => {
              syncWithRemote.current();
              crossDeviceSync.pollMissedEvents();
            };
            window.addEventListener('focus', onWinFocus);
            document.addEventListener('visibilitychange', () => {
              if (document.visibilityState === 'visible') onWinFocus();
            });
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            setConnectionStatus('offline');
          } else {
            setConnectionStatus('connecting');
          }
        });

      const onBroadcastPhotoAdded = (e: any) => {
        const item = e?.detail?.item;
        if (item) {
          crossDeviceSync.publish('gallery_photo_added', { item });
          if (channelRef.current) {
            channelRef.current.send({
              type: 'broadcast',
              event: 'gallery_photo_added',
              payload: { item },
            });
          }
        }
      };

      const onBroadcastPhotoDeleted = (e: any) => {
        const itemId = e?.detail?.itemId;
        if (itemId) {
          crossDeviceSync.publish('gallery_photo_deleted', { itemId });
          if (channelRef.current) {
            channelRef.current.send({
              type: 'broadcast',
              event: 'gallery_photo_deleted',
              payload: { itemId },
            });
          }
        }
      };

      window.addEventListener('gallery_broadcast_photo_added', onBroadcastPhotoAdded);
      window.addEventListener('gallery_broadcast_photo_deleted', onBroadcastPhotoDeleted);

      // Initialize Cross-Device Real-Time Sync across Phones, Laptops & Networks
      crossDeviceSync.init(currentUser);

      const unsubCrossDevice = crossDeviceSync.subscribe((event, payload) => {
        if (!payload) return;

        if (event === 'new_message') {
          const incoming = payload as ExtendedChatMessage;
          if (incoming && incoming.id) {
            const isFromOther = payload.deviceId
              ? payload.deviceId !== crossDeviceSync.getDeviceId()
              : incoming.sender !== currentUser;

            setMessages((prev) => {
              if (prev.some((m) => m.id === incoming.id)) return prev;
              const next = [...prev, incoming];
              persistMessages(next);
              return next;
            });

            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 60);

            if (isFromOther) {
              playNotificationSound();
              triggerBrowserNotification(incoming);

              // 1. Immediately send DELIVERED status (shows Double Grey Tick for sender)
              crossDeviceSync.publish('message_status_update', {
                msgId: incoming.id,
                status: 'delivered',
                deviceId: crossDeviceSync.getDeviceId(),
              });

              // 2. If chat is active and tab is visible, immediately send READ status (shows Double Blue Tick for sender)
              const isLookingAtChat =
                activeMainView === 'chat' &&
                typeof document !== 'undefined' &&
                !document.hidden &&
                document.visibilityState === 'visible';

              if (isLookingAtChat && readReceiptsEnabledRef.current) {
                crossDeviceSync.publish('message_status_update', {
                  msgId: incoming.id,
                  status: 'read',
                  deviceId: crossDeviceSync.getDeviceId(),
                });
                setMessages((prev) => {
                  const next = prev.map((m) =>
                    m.id === incoming.id ? { ...m, status: 'read' as const, read: true } : m
                  );
                  persistMessages(next);
                  return next;
                });
              }
            }
          }
        } else if (event === 'message_status_update') {
          const { msgId, status } = payload;
          if (msgId && status) {
            setMessages((prev) => {
              let updated = false;
              const next = prev.map((m) => {
                if (m.id === msgId) {
                  // Do not downgrade a read message back to delivered
                  if (m.status === 'read' && status === 'delivered') return m;
                  updated = true;
                  return {
                    ...m,
                    status: status as any,
                    read: status === 'read' ? true : m.read,
                  };
                }
                return m;
              });
              if (updated) persistMessages(next);
              return next;
            });
          }
        } else if (event === 'all_messages_read') {
          const isFromOther = payload?.deviceId
            ? payload.deviceId !== crossDeviceSync.getDeviceId()
            : payload?.reader !== currentUser;
          if (isFromOther) {
            setMessages((prev) => {
              const next = prev.map((m) =>
                m.sender === currentUser ? { ...m, status: 'read' as const, read: true } : m
              );
              persistMessages(next);
              return next;
            });
          }
        } else if (event === 'typing') {
          const isFromOther = payload?.deviceId
            ? payload.deviceId !== crossDeviceSync.getDeviceId()
            : payload?.user === partnerUser;
          if (isFromOther) {
            setIsPartnerTyping(true);
            if (partnerTypingTimerRef.current) clearTimeout(partnerTypingTimerRef.current);
            partnerTypingTimerRef.current = window.setTimeout(() => setIsPartnerTyping(false), 3000);
          }
        } else if (event === 'presence') {
          const isFromOther = payload?.deviceId
            ? payload.deviceId !== crossDeviceSync.getDeviceId()
            : payload?.user === partnerUser;

          if (isFromOther) {
            if (payload.online !== false) {
              setIsPartnerOnline(true);
              const ts = payload.timestamp || Date.now();
              setPartnerLastSeen(ts);
              try {
                localStorage.setItem(`whatsapp_last_seen_${partnerUser}`, String(ts));
              } catch {}

              // Watchdog timer: if partner heartbeats cease, set offline after 10s
              if (partnerOfflineTimerRef.current) clearTimeout(partnerOfflineTimerRef.current);
              partnerOfflineTimerRef.current = setTimeout(() => {
                setIsPartnerOnline(false);
              }, 10000);
            } else {
              setIsPartnerOnline(false);
              if (partnerOfflineTimerRef.current) clearTimeout(partnerOfflineTimerRef.current);
              const ts = payload.timestamp || Date.now();
              setPartnerLastSeen(ts);
              try {
                localStorage.setItem(`whatsapp_last_seen_${partnerUser}`, String(ts));
              } catch {}
            }
          }
        } else if (event === 'reaction') {
          if (payload?.msgId && payload?.emoji) {
            handleApplyReaction(payload.msgId, payload.emoji, payload.user, false);
          }
        } else if (event === 'message_edited') {
          const { msgId, newText, editedAt } = payload;
          if (msgId && newText) {
            setMessages((prev) => {
              const next = prev.map((m) => (m.id === msgId ? { ...m, text: newText, isEdited: true, editedAt } : m));
              persistMessages(next);
              return next;
            });
          }
        } else if (event === 'message_deleted' || event === 'message_deleted_for_all') {
          const { msgId } = payload;
          if (msgId) {
            setMessages((prev) => {
              const next = prev.map((m) => (m.id === msgId ? { ...m, text: 'This message was deleted', deletedForAll: true } : m));
              persistMessages(next);
              return next;
            });
          }
        } else if (event === 'chat_cleared') {
          if (payload?.clearedBy === partnerUser) {
            setMessages([]);
            persistMessages([]);
          }
        } else if (event === 'gallery_photo_added') {
          if (payload?.item) {
            window.dispatchEvent(new CustomEvent('gallery_item_added_remotely', { detail: { item: payload.item } }));
          }
        } else if (event === 'gallery_photo_deleted') {
          if (payload?.itemId) {
            window.dispatchEvent(new CustomEvent('gallery_item_deleted_remotely', { detail: { itemId: payload.itemId } }));
          }
        } else if (event === 'call_offer' || event === 'call_accepted' || event === 'webrtc_ice_candidate' || event === 'call_declined' || event === 'call_ended') {
          if (event === 'call_offer') {
            const isFromOtherDevice = payload.deviceId
              ? payload.deviceId !== crossDeviceSync.getDeviceId()
              : payload.from !== currentUser;

            if (isFromOtherDevice) {
              setIncomingCall({
                caller: payload.caller || payload.from || partnerUser,
                type: payload.callType || payload.type || 'video',
                offer: payload.offer,
              });
            }
          } else if (event === 'call_declined' || event === 'call_ended') {
            setShowCallModal(null);
            setIncomingCall(null);
          }
          window.dispatchEvent(new CustomEvent('whatsapp_call_signal', { detail: { event, payload } }));
        } else if (event === 'sync_request') {
          const isFromOther = payload?.deviceId
            ? payload.deviceId !== crossDeviceSync.getDeviceId()
            : payload?.requester !== currentUser;
          if (isFromOther) {
            try {
              const raw = localStorage.getItem(getChatStorageKey(activeChatId)) || localStorage.getItem(LOCAL_MESSAGES_KEY);
              if (raw) {
                const localMsgs = JSON.parse(raw);
                if (Array.isArray(localMsgs) && localMsgs.length > 0) {
                  crossDeviceSync.publish('sync_response', {
                    chatId: activeChatId,
                    messages: localMsgs.slice(-80),
                    deviceId: crossDeviceSync.getDeviceId(),
                  });
                }
              }
            } catch {}
          }
        } else if (event === 'sync_response') {
          if (payload?.messages && Array.isArray(payload.messages)) {
            setMessages((prev) => {
              const merged = mergeMessages(prev, payload.messages);
              persistMessages(merged);

              // Acknowledge delivery for any unacknowledged partner messages
              payload.messages.forEach((m: ExtendedChatMessage) => {
                if (m.sender !== currentUser && m.id && m.status !== 'read') {
                  crossDeviceSync.publish('message_status_update', {
                    msgId: m.id,
                    status: 'delivered',
                    deviceId: crossDeviceSync.getDeviceId(),
                  });
                }
              });

              return merged;
            });
          }
        }
      });

      // Initialize BroadcastChannels for 0ms cross-tab real-time sync
      try {
        const chatBc = new BroadcastChannel('dharya_chat_channel');
        chatBroadcastRef.current = chatBc;
        chatBc.onmessage = (e) => {
          const type = e.data?.type;
          const payload = e.data?.payload;
          if (type === 'new_message' && payload) {
            const incoming = payload as ExtendedChatMessage;
            setMessages((prev) => {
              if (prev.some((m) => m.id === incoming.id)) return prev;
              const next = [...prev, incoming];
              try {
                localStorage.setItem(getChatStorageKey(activeChatId), JSON.stringify(next));
              } catch {}
              return next;
            });
          } else if (type === 'message_deleted' && payload?.msgId) {
            const delId = payload.msgId;
            setMessages((prev) => {
              const next = prev.filter((m) => m.id !== delId);
              try {
                localStorage.setItem(getChatStorageKey(activeChatId), JSON.stringify(next));
              } catch {}
              return next;
            });
          } else if (type === 'chat_cleared') {
            setMessages([]);
            try {
              localStorage.setItem(getChatStorageKey(activeChatId), JSON.stringify([]));
            } catch {}
          }
        };
      } catch {}

      try {
        const callBc = new BroadcastChannel('dharya_call_signaling');
        callSignalingRef.current = callBc;
        callBc.onmessage = (e) => {
          const ev = e.data?.event;
          const data = e.data?.payload;
          if ((ev === 'call_offer' || ev === 'call:offer') && data) {
            if (data.recipient === currentUser || data.to === currentUser) {
              setIncomingCall({
                caller: data.caller || data.from,
                type: data.callType || data.type || 'video',
                offer: data.offer,
              });
              window.dispatchEvent(
                new CustomEvent('whatsapp_call_signal', { detail: { event: ev, payload: data } })
              );
            }
          } else if (ev === 'call_declined' || ev === 'call:rejected') {
            setShowCallModal(null);
            setIncomingCall(null);
            window.dispatchEvent(
              new CustomEvent('whatsapp_call_signal', { detail: { event: ev, payload: data } })
            );
          } else if (ev === 'call_ended' || ev === 'call:ended' || ev === 'call:cancelled') {
            setShowCallModal(null);
            setIncomingCall(null);
            window.dispatchEvent(
              new CustomEvent('whatsapp_call_signal', { detail: { event: ev, payload: data } })
            );
          }
        };
      } catch {}

      const onChatStorage = (e: StorageEvent) => {
        if (e.key === 'dharya_chat_new_msg' && e.newValue) {
          try {
            const { msg } = JSON.parse(e.newValue);
            if (msg) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === msg.id)) return prev;
                const next = [...prev, msg];
                try {
                  localStorage.setItem(getChatStorageKey(activeChatId), JSON.stringify(next));
                } catch {}
                return next;
              });
            }
          } catch {}
        } else if (e.key === 'dharya_message_deleted' && e.newValue) {
          try {
            const { msgId } = JSON.parse(e.newValue);
            if (msgId) {
              setMessages((prev) => {
                const next = prev.filter((m) => m.id !== msgId);
                try {
                  localStorage.setItem(getChatStorageKey(activeChatId), JSON.stringify(next));
                } catch {}
                return next;
              });
            }
          } catch {}
        } else if (e.key === 'dharya_chat_cleared' && e.newValue) {
          setMessages([]);
          try {
            localStorage.setItem(getChatStorageKey(activeChatId), JSON.stringify([]));
          } catch {}
        }
      };
      window.addEventListener('storage', onChatStorage);

      return () => {
        window.removeEventListener('gallery_broadcast_photo_added', onBroadcastPhotoAdded);
        window.removeEventListener('gallery_broadcast_photo_deleted', onBroadcastPhotoDeleted);
        window.removeEventListener('storage', onChatStorage);
        try {
          unsubCrossDevice();
          crossDeviceSync.destroy();
        } catch {}
        if (chatBroadcastRef.current) {
          try {
            chatBroadcastRef.current.close();
          } catch {}
          chatBroadcastRef.current = null;
        }
        if (callSignalingRef.current) {
          try {
            callSignalingRef.current.close();
          } catch {}
          callSignalingRef.current = null;
        }
        try {
          channel.untrack();
        } catch {}
        supabase.removeChannel(channel);
      };
    } catch {}
  }, [currentUser, partnerUser, activeChatId]);

  // Active WhatsApp Read Receipts synchronization on tab focus, visibility change, and view change
  useEffect(() => {
    const markAllIncomingRead = () => {
      if (activeMainView !== 'chat') return;
      if (typeof document !== 'undefined' && (document.hidden || document.visibilityState !== 'visible')) return;
      if (!readReceiptsEnabledRef.current) return;

      setMessages((prev) => {
        let hasUnread = false;
        const unreadIds: string[] = [];
        const next = prev.map((m) => {
          if (m.sender !== currentUser && (!m.read || m.status !== 'read')) {
            hasUnread = true;
            unreadIds.push(m.id);
            return { ...m, status: 'read' as const, read: true };
          }
          return m;
        });

        if (hasUnread) {
          persistMessages(next);
          crossDeviceSync.publish('all_messages_read', {
            reader: currentUser,
            readUpTo: Date.now(),
            deviceId: crossDeviceSync.getDeviceId(),
          });
          unreadIds.forEach((id) => {
            crossDeviceSync.publish('message_status_update', {
              msgId: id,
              status: 'read',
              deviceId: crossDeviceSync.getDeviceId(),
            });
          });
        }
        return next;
      });
    };

    markAllIncomingRead();
    window.addEventListener('focus', markAllIncomingRead);
    document.addEventListener('visibilitychange', markAllIncomingRead);
    return () => {
      window.removeEventListener('focus', markAllIncomingRead);
      document.removeEventListener('visibilitychange', markAllIncomingRead);
    };
  }, [activeMainView, currentUser]);

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    const isSentByMe = lastMsg && lastMsg.sender === currentUser;

    if (isNearBottomRef.current || isSentByMe) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUnreadCountBelow(0);
    } else {
      setUnreadCountBelow((prev) => prev + 1);
    }
  }, [messages, currentUser]);

  // Handle Media Selected (Photo or Video from Camera or Gallery - Supports Multiple Photos)
  const handleMediaFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    const newItems: PendingMediaItem[] = [];

    for (let idx = 0; idx < files.length; idx++) {
      const file = files[idx];
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      if (!isImage && !isVideo) {
        alert(`Skipping unsupported file "${file.name}". Please select image or video files.`);
        continue;
      }

      if (isImage && file.size > 25 * 1024 * 1024) {
        alert(`Photo "${file.name}" exceeds 25 MB limit.`);
        continue;
      }

      if (isVideo && file.size > 50 * 1024 * 1024) {
        alert(`Video "${file.name}" exceeds 50 MB limit.`);
        continue;
      }

      const sizeKb = Math.round(file.size / 1024);
      const itemId = `pending_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`;

      if (isImage) {
        try {
          const compressed = await compressImageClientSide(
            file,
            isHdSelected ? 1920 : 1280,
            isHdSelected ? 1080 : 720,
            0.85
          );
          newItems.push({
            id: itemId,
            file,
            type: 'image',
            url: compressed.dataUrl,
            thumbnailUrl: compressed.dataUrl,
            fileName: file.name,
            fileSizeKb: sizeKb,
          });
        } catch {
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => resolve('');
            reader.readAsDataURL(file);
          });
          if (dataUrl) {
            newItems.push({
              id: itemId,
              file,
              type: 'image',
              url: dataUrl,
              thumbnailUrl: dataUrl,
              fileName: file.name,
              fileSizeKb: sizeKb,
            });
          }
        }
      } else {
        // Video processing
        const objectUrl = URL.createObjectURL(file);
        const { thumb, durationStr } = await new Promise<{ thumb: string; durationStr: string }>((resolve) => {
          const tempVideo = document.createElement('video');
          tempVideo.preload = 'metadata';
          tempVideo.src = objectUrl;
          tempVideo.muted = true;
          tempVideo.playsInline = true;

          let durStr = '0:15';
          tempVideo.onloadedmetadata = () => {
            const secs = Math.round(tempVideo.duration) || 0;
            const mins = Math.floor(secs / 60);
            const remSecs = secs % 60;
            durStr = `${mins}:${remSecs < 10 ? '0' : ''}${remSecs}`;
            tempVideo.currentTime = Math.min(1, Math.max(0, tempVideo.duration / 2));
          };

          tempVideo.onseeked = () => {
            let thumbUrl = '';
            try {
              const canvas = document.createElement('canvas');
              canvas.width = Math.min(640, tempVideo.videoWidth || 640);
              canvas.height = Math.min(360, tempVideo.videoHeight || 360);
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
                thumbUrl = canvas.toDataURL('image/jpeg', 0.8);
              }
            } catch {}
            resolve({ thumb: thumbUrl, durationStr: durStr });
          };

          tempVideo.onerror = () => {
            resolve({ thumb: '', durationStr: '0:15' });
          };
        });

        // Convert video to Data URL if <= 25MB for fail-safe transmission
        let videoDataUrl = objectUrl;
        if (file.size <= 25 * 1024 * 1024) {
          try {
            videoDataUrl = await new Promise<string>((resolve) => {
              const r = new FileReader();
              r.onload = () => resolve(r.result as string);
              r.onerror = () => resolve(objectUrl);
              r.readAsDataURL(file);
            });
          } catch {}
        }

        newItems.push({
          id: itemId,
          file,
          type: 'video',
          url: videoDataUrl,
          thumbnailUrl: thumb,
          fileName: file.name,
          fileSizeKb: sizeKb,
          duration: durationStr,
        });
      }
    }

    if (newItems.length > 0) {
      setPendingMediaList((prev) => [...prev, ...newItems]);
      setActiveMediaIndex(0);
      setMediaModalOpen(true);
    }
    e.target.value = '';
  };

  // Remove individual photo or video from preview strip before sending
  const handleRemovePendingMedia = (idToRemove: string) => {
    setPendingMediaList((prev) => {
      const next = prev.filter((item) => item.id !== idToRemove);
      if (next.length === 0) {
        setMediaModalOpen(false);
        setActiveMediaIndex(0);
      } else {
        setActiveMediaIndex((curr) => Math.min(curr, next.length - 1));
      }
      return next;
    });
  };


  // Typing Debouncer
  const handleInputTextChange = (val: string) => {
    setInputText(val);
    try {
      localStorage.setItem(`dharya_draft_${currentUser}`, val);
    } catch {}
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

    const newMsg: ExtendedChatMessage = {
      id: 'msg-poll-' + Date.now(),
      sender: currentUser,
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      read: false,
      status: 'sending',
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

    setReplyingToMessage(null);
    setShowPollModal(false);
    setPollQuestion('');
    setPollOptions(['', '']);
    dispatchSendMessage(newMsg);
  };

  // ── VOICE RECORDING WITH PREVIEW BEFORE SENDING ──
  const handleStartAudioRecording = async () => {
    try {
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
        setRecordedAudioUrl(null);
        setRecordedAudioBlob(null);
      }
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
      console.warn('[Audio] Mic access denied', err);
      showToast('Microphone access denied. Please allow microphone permissions in your browser.', 'error');
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

  const handleStopAndReviewAudioRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);

    recorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const previewUrl = URL.createObjectURL(audioBlob);
      setRecordedAudioBlob(audioBlob);
      setRecordedAudioUrl(previewUrl);
      setIsRecordingAudio(false);
      recorder.stream.getTracks().forEach((t) => t.stop());
    };

    recorder.stop();
  };

  const handleDiscardAudioPreview = () => {
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
    }
    if (audioPreviewAudioRef.current) {
      audioPreviewAudioRef.current.pause();
    }
    setRecordedAudioBlob(null);
    setRecordedAudioUrl(null);
    setIsPlayingAudioPreview(false);
    setRecordingTimeSecs(0);
  };

  const handleTogglePlayAudioPreview = () => {
    if (!recordedAudioUrl) return;
    if (!audioPreviewAudioRef.current) {
      audioPreviewAudioRef.current = new Audio(recordedAudioUrl);
      audioPreviewAudioRef.current.onended = () => setIsPlayingAudioPreview(false);
    }
    if (isPlayingAudioPreview) {
      audioPreviewAudioRef.current.pause();
      setIsPlayingAudioPreview(false);
    } else {
      audioPreviewAudioRef.current.play().catch(() => {});
      setIsPlayingAudioPreview(true);
    }
  };

  const handleSendAudioPreview = () => {
    if (!recordedAudioBlob) return;
    const totalSecs = Math.max(1, recordingTimeSecs);
    const durStr = `${Math.floor(totalSecs / 60)}:${totalSecs % 60 < 10 ? '0' : ''}${totalSecs % 60}`;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Audio = reader.result as string;
      const newMsg: ExtendedChatMessage = {
        id: 'msg-voice-' + Date.now(),
        sender: currentUser,
        text: `Voice Note (${durStr})`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        read: false,
        status: 'sent',
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

      setReplyingToMessage(null);
      dispatchSendMessage(newMsg);
      handleDiscardAudioPreview();
    };
    reader.readAsDataURL(recordedAudioBlob);
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

      const newMsg: ExtendedChatMessage = {
        id: 'msg-doc-' + Date.now(),
        sender: currentUser,
        text: file.name,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        read: false,
        status: 'sent',
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

      setReplyingToMessage(null);
      dispatchSendMessage(newMsg);
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

  // WhatsApp Sub-menu Helpers (Add shortcut & Add to list)
  const handleAddShortcut = () => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
      }
    } catch {}
    showToast('Shortcut created! Link copied to clipboard.', 'success');
  };

  const handleAddToList = () => {
    setIsFavoritedChat((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('dharya_chat_is_favorited', next ? 'true' : 'false');
      } catch {}
      showToast(next ? 'Added to your Favorites list ⭐' : 'Removed from Favorites list', 'success');
      return next;
    });
  };

  const handleSetDisappearingTimer = (val: 'off' | '24h' | '7d' | '90d') => {
    setDisappearingTimer(val);
    try {
      localStorage.setItem('dharya_disappearing_timer', val);
    } catch {}
    const timerText = val === 'off'
      ? 'You turned off disappearing messages.'
      : `You updated the message timer. New messages will disappear from this chat ${val === '24h' ? '24 hours' : val === '7d' ? '7 days' : '90 days'} after they're sent.`;
    const sysMsg: ExtendedChatMessage = {
      id: `sys-${Date.now()}`,
      sender: 'system',
      text: timerText,
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true,
      status: 'read',
      type: 'system',
    };
    persistMessages([...messages, sysMsg]);
    showToast(timerText, 'info');
  };

  // Permanently Clear Chat (NO Recycle Bin - true permanent wipe for both users)
  const handleClearAllChat = async (skipConfirm: boolean = false) => {
    if (!skipConfirm && !confirm('Permanently clear all chat messages? All messages will be permanently deleted for both users. This cannot be undone.')) {
      return;
    }

    persistMessages([]);
    setShowMenu(false);

    const targetChatId = activeChatIdRef.current || CHAT_ID;

    // Permanently delete all messages from Supabase DB
    clearRemoteChat(targetChatId).catch((err) => {
      console.warn('Failed to clear remote chat:', err);
    });

    const clearPayload = { clearedBy: currentUser, chatId: targetChatId };
    crossDeviceSync.publish('chat_cleared', clearPayload);
    try {
      const activeChannel = channelRef.current || getSupabase().channel('whatsapp-one-on-one-room');
      activeChannel.send({
        type: 'broadcast',
        event: 'chat_cleared',
        payload: clearPayload,
      });
    } catch {}

    try {
      chatBroadcastRef.current?.postMessage({
        type: 'chat_cleared',
        payload: clearPayload,
      });
    } catch {}

    try {
      localStorage.setItem('dharya_chat_cleared', JSON.stringify({
        ...clearPayload,
        timestamp: Date.now() + Math.random(),
      }));
    } catch {}
  };

  // Authentic WhatsApp Repeating Vector Doodle Background
  const getDoodleSvgDataUri = (isDarkTheme: boolean) => {
    const strokeColor = isDarkTheme ? '%238696a0' : '%2354656f';
    const opacity = isDarkTheme ? '0.08' : '0.12';
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='412' height='412' viewBox='0 0 412 412' fill='none' stroke='${strokeColor}' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round' opacity='${opacity}'%3E%3Cg transform='translate(24, 20) scale(0.9)'%3E%3Cpath d='M6 10h22v12a8 8 0 0 1-8 8H14a8 8 0 0 1-8-8V10z'/%3E%3Cpath d='M28 14h4a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4h-4'/%3E%3Cpath d='M12 4c0 2-2 3-2 5M17 3c0 2-2 3-2 5M22 4c0 2-2 3-2 5'/%3E%3Cpath d='M4 32h26'/%3E%3C/g%3E%3Cg transform='translate(130, 16) scale(0.85)'%3E%3Crect x='6' y='8' width='36' height='22' rx='10'/%3E%3Cpath d='M14 15v8M10 19h8'/%3E%3Ccircle cx='30' cy='16' r='1.5' fill='${strokeColor}'/%3E%3Ccircle cx='34' cy='21' r='1.5' fill='${strokeColor}'/%3E%3C/g%3E%3Cg transform='translate(230, 14) scale(0.9)'%3E%3Ccircle cx='18' cy='18' r='14'/%3E%3Cellipse cx='18' cy='17' rx='8' ry='6'/%3E%3Ccircle cx='15' cy='17' r='1.5' fill='${strokeColor}'/%3E%3Ccircle cx='21' cy='17' r='1.5' fill='${strokeColor}'/%3E%3Cpath d='M18 4V1M14 1h8M10 30c2 2 5 3 8 3s6-1 8-3'/%3E%3C/g%3E%3Cg transform='translate(340, 22) scale(0.85)'%3E%3Cpath d='M6 6h24a6 6 0 0 1 6 6v12a6 6 0 0 1-6 6H16l-7 6v-6H6a6 6 0 0 1-6-6V12a6 6 0 0 1 6-6z'/%3E%3Cpath d='M14 16c1-2 3-3 4-1 1-2 3-1 4 1-1 3-4 6-4 6s-3-3-4-6z' fill='${strokeColor}'/%3E%3C/g%3E%3Cg transform='translate(26, 100) scale(0.85)'%3E%3Cpath d='M6 10h6l3-4h10l3 4h6a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4z'/%3E%3Ccircle cx='20' cy='20' r='6'/%3E%3Ccircle cx='30' cy='13' r='1' fill='${strokeColor}'/%3E%3C/g%3E%3Cg transform='translate(136, 96) scale(0.85)'%3E%3Cpath d='M6 22V16a14 14 0 0 1 28 0v6'/%3E%3Crect x='4' y='20' width='6' height='12' rx='3' fill='${strokeColor}' fill-opacity='0.2'/%3E%3Crect x='30' y='20' width='6' height='12' rx='3' fill='${strokeColor}' fill-opacity='0.2'/%3E%3C/g%3E%3Cg transform='translate(242, 94) scale(0.85)'%3E%3Ccircle cx='18' cy='18' r='14'/%3E%3Cpolyline points='18,10 18,18 24,18'/%3E%3C/g%3E%3Cg transform='translate(346, 102) scale(0.85)'%3E%3Cpath d='M8 8c8-4 18-4 26 0L21 34z'/%3E%3Ccircle cx='18' cy='16' r='1.5' fill='${strokeColor}'/%3E%3Ccircle cx='23' cy='22' r='1.5' fill='${strokeColor}'/%3E%3Ccircle cx='25' cy='14' r='1.5' fill='${strokeColor}'/%3E%3C/g%3E%3Cg transform='translate(28, 180) scale(0.85)'%3E%3Ccircle cx='20' cy='20' r='10'/%3E%3Cellipse cx='20' cy='20' rx='18' ry='6' transform='rotate(-25 20 20)'/%3E%3C/g%3E%3Cg transform='translate(138, 182) scale(0.8)'%3E%3Cpath d='M16 2l4 8 9 1-7 6 2 9-8-4-8 4 2-9-7-6 9-1z' fill='${strokeColor}' fill-opacity='0.15'/%3E%3Ccircle cx='34' cy='6' r='1.5' fill='${strokeColor}'/%3E%3Ccircle cx='2' cy='24' r='1' fill='${strokeColor}'/%3E%3C/g%3E%3Cg transform='translate(238, 180) scale(0.85)'%3E%3Cpath d='M6 14L8 6l8 4 8-4 2 8c2 4 2 9-2 13-3 3-9 3-12 0-4-4-4-9-2-13z'/%3E%3Ccircle cx='12' cy='16' r='1.5' fill='${strokeColor}'/%3E%3Ccircle cx='20' cy='16' r='1.5' fill='${strokeColor}'/%3E%3Cpath d='M14 20l2 2 2-2'/%3E%3Cline x1='6' y1='18' x2='2' y2='17'/%3E%3Cline x1='6' y1='20' x2='2' y2='21'/%3E%3Cline x1='26' y1='18' x2='30' y2='17'/%3E%3Cline x1='26' y1='20' x2='30' y2='21'/%3E%3C/g%3E%3Cg transform='translate(346, 178) scale(0.85)'%3E%3Cpath d='M12 22c-4-3-6-7-6-11a11 11 0 1 1 22 0c0 4-2 8-6 11v4H12v-4z'/%3E%3Cpath d='M13 30h6M14 34h4'/%3E%3Cpath d='M16 11v5M13 13h6'/%3E%3C/g%3E%3Cg transform='translate(22, 260) scale(0.85)'%3E%3Ccircle cx='8' cy='24' r='7'/%3E%3Ccircle cx='32' cy='24' r='7'/%3E%3Cpath d='M8 24l10-10h6l8 10M18 14l4 10H14M22 10h4'/%3E%3C/g%3E%3Cg transform='translate(134, 264) scale(0.85)'%3E%3Cpath d='M18 7c2-4 6-5 9-2 4 4 4 9 0 14L18 28 9 19C5 14 5 9 9 5c3-3 7-2 9 2z' fill='${strokeColor}' fill-opacity='0.15'/%3E%3C/g%3E%3Cg transform='translate(236, 260) scale(0.85)'%3E%3Cpath d='M4 18L32 4 20 32l-5-10L4 18z'/%3E%3Cpath d='M15 22L32 4'/%3E%3C/g%3E%3Cg transform='translate(344, 262) scale(0.85)'%3E%3Ccircle cx='8' cy='24' r='5' fill='${strokeColor}'/%3E%3Ccircle cx='26' cy='20' r='5' fill='${strokeColor}'/%3E%3Cpath d='M13 24V8l18-4v16M13 14l18-4'/%3E%3C/g%3E%3Cg transform='translate(26, 342) scale(0.85)'%3E%3Ccircle cx='10' cy='16' r='8'/%3E%3Ccircle cx='28' cy='16' r='8'/%3E%3Cpath d='M18 16h2M2 14l-2-4M36 14l2-4'/%3E%3C/g%3E%3Cg transform='translate(132, 338) scale(0.85)'%3E%3Cpath d='M4 20c0-10 8-16 16-16s16 6 16 16c-3-2-7-2-10 0-3-2-8-2-11 0-3-2-8-2-11 0z'/%3E%3Cpath d='M20 4v22a4 4 0 0 1-8 0'/%3E%3C/g%3E%3Cg transform='translate(238, 340) scale(0.85)'%3E%3Cpath d='M6 30l4-1 18-18-3-3L7 26l-1 4z'/%3E%3Cpath d='M22 11l3 3'/%3E%3C/g%3E%3Cg transform='translate(342, 338) scale(0.85)'%3E%3Ccircle cx='18' cy='18' r='14'/%3E%3Ccircle cx='13' cy='15' r='1.5' fill='${strokeColor}'/%3E%3Ccircle cx='23' cy='15' r='1.5' fill='${strokeColor}'/%3E%3Cpath d='M12 21c2 3 5 4 6 4s4-1 6-4'/%3E%3C/g%3E%3C/svg%3E`;
  };

  // Wallpaper Style Provider with Full 10-Theme Integration
  const getWallpaperStyle = () => {
    if (activeWallpaper === 'obsidian') {
      return { backgroundColor: isDark ? '#0a0f12' : '#e4e7ea', backgroundImage: 'none' };
    }
    if (activeWallpaper === 'emerald') {
      return { backgroundColor: isDark ? '#071a14' : '#e2f4eb', backgroundImage: 'none' };
    }
    if (activeWallpaper === 'teal') {
      return { backgroundColor: isDark ? '#0b191e' : '#e3eff2', backgroundImage: 'none' };
    }
    if (activeWallpaper === 'coffee') {
      return { backgroundColor: isDark ? '#181512' : '#f2ede6', backgroundImage: 'none' };
    }
    if (activeWallpaper === 'stars') {
      return {
        backgroundColor: '#05070e',
        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.08) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(244, 63, 94, 0.08) 0%, transparent 40%)`
      };
    }
    if (activeWallpaper === 'gradient') {
      return {
        backgroundColor: activeTheme.bgMain,
        backgroundImage: isDark
          ? `radial-gradient(ellipse at top right, ${activeTheme.accent}15, transparent 70%), radial-gradient(ellipse at bottom left, #0f172a, transparent 70%)`
          : `radial-gradient(ellipse at top right, ${activeTheme.accent}20, transparent 70%), radial-gradient(ellipse at bottom left, #e2e8f0, transparent 70%)`
      };
    }
    if (activeWallpaper.startsWith('data:') || activeWallpaper.startsWith('http')) {
      return {
        backgroundImage: `url(${activeWallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    return {
      backgroundColor: activeTheme.bgMain,
      backgroundImage: `url("${getDoodleSvgDataUri(isDark)}")`,
      backgroundRepeat: 'repeat',
      backgroundSize: '412px 412px',
    };
  };

  // Jump to Replied Message with Smooth Scroll & Highlight Pulse
  const jumpToMessage = (targetMsgId: string) => {
    const el = document.getElementById(`msg-${targetMsgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-emerald-400', 'animate-pulse');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-emerald-400', 'animate-pulse');
      }, 2200);
    } else {
      showToast('Quoted message not found in visible conversation', 'info');
    }
  };

  // Copy Single Message Text to Clipboard
  const handleCopyMessage = (msg: ExtendedChatMessage) => {
    const textToCopy = msg.text || msg.mediaUrl || msg.documentName || '';
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      showToast('Message copied to clipboard!', 'success');
    }
  };

  // Message Selection & Bulk Actions
  const handleToggleSelectMsg = (id: string) => {
    setSelectedMsgIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkCopy = () => {
    const selectedMsgs = messages.filter((m) => selectedMsgIds.has(m.id));
    const combined = selectedMsgs.map((m) => m.text || m.documentName || m.mediaUrl || '').filter(Boolean).join('\n');
    if (combined) {
      navigator.clipboard.writeText(combined);
      showToast(`Copied ${selectedMsgs.length} messages to clipboard`, 'success');
    }
    setIsSelectionMode(false);
    setSelectedMsgIds(new Set());
  };

  const handleBulkStar = () => {
    const idsToStar = Array.from(selectedMsgIds);
    setMessages((prev) => {
      const next = prev.map((m) => (idsToStar.includes(m.id) ? { ...m, isStarred: true } : m));
      persistMessages(next);
      return next;
    });
    idsToStar.forEach((id) => updateRemoteStar(id, true));
    showToast(`Starred ${idsToStar.length} messages`, 'success');
    setIsSelectionMode(false);
    setSelectedMsgIds(new Set());
  };

  const handleBulkDelete = () => {
    const idsToDelete = Array.from(selectedMsgIds);
    const authorized = messages.filter((m) => idsToDelete.includes(m.id) && m.sender === currentUser);
    if (authorized.length === 0) {
      showToast('You can only delete messages sent by you', 'error');
      return;
    }
    if (confirm(`Permanently delete ${authorized.length} selected message(s)? This action is permanent and cannot be undone.`)) {
      const authIds = authorized.map((m) => m.id);
      setMessages((prev) => {
        const next = prev.filter((m) => !authIds.includes(m.id));
        persistMessages(next);
        return next;
      });
      authIds.forEach((id) => {
        deleteRemoteMessage(id, currentUser).catch(() => {});
        const deletePayload = { msgId: id, deletedBy: currentUser };
        try {
          const activeChannel = channelRef.current || getSupabase().channel('whatsapp-one-on-one-room');
          activeChannel.send({
            type: 'broadcast',
            event: 'message_deleted',
            payload: deletePayload,
          });
        } catch {}
        try {
          chatBroadcastRef.current?.postMessage({
            type: 'message_deleted',
            payload: deletePayload,
          });
        } catch {}
        try {
          localStorage.setItem('dharya_message_deleted', JSON.stringify({
            ...deletePayload,
            timestamp: Date.now() + Math.random(),
          }));
        } catch {}
      });
      showToast(`Permanently deleted ${authIds.length} message(s)`, 'success');
      setIsSelectionMode(false);
      setSelectedMsgIds(new Set());
    }
  };

  // Send a Text Message with honest initial 'sending' state
  const handleSendText = () => {
    const text = inputText.trim();
    if (!text) return;

    const newMsg: ExtendedChatMessage = {
      id: 'msg-' + Date.now(),
      sender: currentUser,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      read: false,
      status: 'sent',
      type: 'text',
      fileSizeKb: Math.max(1, Math.round(text.length * 0.05)),
      replyTo: replyingToMessage ? { id: replyingToMessage.id, sender: replyingToMessage.sender, text: replyingToMessage.text || replyingToMessage.type || 'Message' } : undefined,
    };
    setReplyingToMessage(null);
    setInputText('');
    try {
      localStorage.removeItem(`dharya_draft_${currentUser}`);
    } catch {}

    dispatchSendMessage(newMsg);
  };

  // Send Photos or Videos (Supports multiple photos / videos with progress & permanent delivery)
  const handleSendMedia = async () => {
    if (pendingMediaList.length === 0) return;

    setIsUploadingMedia(true);
    setUploadProgressPct(15);

    const total = pendingMediaList.length;

    // If multiple photos are selected, bundle them into a single authentic WhatsApp album collage
    if (total > 1 && pendingMediaList.every((it) => it.type === 'image')) {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < total; i++) {
        const item = pendingMediaList[i];
        let finalMediaUrl = item.url;
        const cleanName = `${Date.now()}_${(item.fileName || 'photo.jpg').replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        if (item.file) {
          try {
            const uploadRes = await crossDeviceSync.uploadMediaAndBroadcast(item.file, cleanName, {
              id: `msg-album-${Date.now()}-${i}`,
              sender: currentUser,
              timestamp: Date.now() + i,
            });
            if (uploadRes.cdnUrl) finalMediaUrl = uploadRes.cdnUrl;
          } catch (e) {
            console.warn('[handleSendMedia] Album upload fallback:', e);
          }
        }
        uploadedUrls.push(finalMediaUrl);
        setUploadProgressPct(Math.round(((i + 1) / total) * 90));
      }

      const albumMsg: ExtendedChatMessage = {
        id: `msg-img-album-${Date.now()}`,
        sender: currentUser,
        text: mediaCaption.trim() || 'Photo',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        read: false,
        status: 'sent',
        type: 'image',
        mediaUrl: uploadedUrls[0],
        thumbnailUrl: uploadedUrls[0],
        mediaUrls: uploadedUrls,
        isHd: isHdSelected,
        isViewOnce: isViewOnceSelected,
        isOpened: false,
        replyTo: replyingToMessage
          ? {
              id: replyingToMessage.id,
              sender: replyingToMessage.sender,
              text: replyingToMessage.text || replyingToMessage.type || 'Media',
            }
          : undefined,
      };

      await dispatchSendMessage(albumMsg);
    } else {
      for (let i = 0; i < total; i++) {
      const item = pendingMediaList[i];
      let finalMediaUrl = item.url;
      const isVideo = item.type === 'video';
      const cleanName = `${Date.now()}_${(item.fileName || (isVideo ? 'video.mp4' : 'photo.jpg')).replace(/[^a-zA-Z0-9.-]/g, '_')}`;

      // Upload photo/video to CDN so it is instantly viewable on the other device
      if (item.file) {
        try {
          const uploadRes = await crossDeviceSync.uploadMediaAndBroadcast(
            item.file,
            cleanName,
            {
              id: `msg-${isVideo ? 'vid' : 'img'}-${Date.now()}-${i}`,
              sender: currentUser,
              text: i === 0 && mediaCaption.trim() ? mediaCaption.trim() : isVideo ? 'Video' : 'Photo',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              timestamp: Date.now() + i,
              type: item.type,
              duration: item.duration,
              isHd: isHdSelected,
              fileSizeKb: item.fileSizeKb,
              documentName: item.fileName,
            }
          );
          if (uploadRes.cdnUrl) {
            finalMediaUrl = uploadRes.cdnUrl;
          }
        } catch (e) {
          console.warn('[handleSendMedia] Cross-device CDN upload fallback:', e);
        }
      }

      setUploadProgressPct(Math.round(((i + 1) / total) * 90));

      const newMsg: ExtendedChatMessage = {
        id: `msg-${isVideo ? 'vid' : 'img'}-${Date.now()}-${i}`,
        sender: currentUser,
        text: i === 0 && mediaCaption.trim()
          ? mediaCaption.trim()
          : isVideo
          ? 'Video'
          : isHdSelected
          ? 'High Definition Photo'
          : 'Photo',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now() + i,
        read: false,
        status: 'sent',
        type: item.type,
        mediaUrl: finalMediaUrl,
        thumbnailUrl: item.thumbnailUrl || finalMediaUrl,
        duration: item.duration,
        isHd: isHdSelected,
        isViewOnce: isViewOnceSelected,
        isOpened: false,
        fileSizeKb: item.fileSizeKb,
        documentName: item.fileName,
        replyTo: replyingToMessage
          ? {
              id: replyingToMessage.id,
              sender: replyingToMessage.sender,
              text: replyingToMessage.text || replyingToMessage.type || 'Media',
            }
          : undefined,
      };

      await dispatchSendMessage(newMsg);
      }
    }

    setUploadProgressPct(100);
    setIsUploadingMedia(false);
    setMediaModalOpen(false);
    setPendingMediaList([]);
    setActiveMediaIndex(0);
    setMediaCaption('');
    setIsHdSelected(false);
    setIsViewOnceSelected(false);
    setReplyingToMessage(null);
  };

  // Open media in Fullscreen Lightbox / Media Viewer
  const openLightbox = (msg: ExtendedChatMessage, targetUrl?: string) => {
    const urls = msg.mediaUrls && msg.mediaUrls.length > 0 ? msg.mediaUrls : [msg.mediaUrl || msg.thumbnailUrl || ''];
    const activeUrl = targetUrl || urls[0] || '';
    const curIdx = urls.indexOf(activeUrl);
    setLightboxMedia({
      url: activeUrl,
      type: msg.type === 'video' ? 'video' : 'image',
      caption: msg.text,
      sender: msg.sender,
      time: msg.time,
      isViewOnce: msg.isViewOnce,
      msgId: msg.id,
      allUrls: urls,
      currentIndex: curIdx >= 0 ? curIdx : 0,
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

    const initialStatus: 'sent' | 'delivered' = 'sent';

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

    crossDeviceSync.publish('new_message', newMsg);
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
      crossDeviceSync.publish('reaction', { msgId, emoji, user });
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

    crossDeviceSync.publish('pin_update', { msgId, isPinned: nextPinnedState });
    try {
      const activeChannel = channelRef.current || getSupabase().channel('whatsapp-one-on-one-room');
      activeChannel.send({
        type: 'broadcast',
        event: 'pin_update',
        payload: { msgId, isPinned: nextPinnedState },
      });
    } catch {}
  };

  // Delete message: supports "Delete for me" (hides locally & marks deleted_for) and "Delete for everyone" (replaces with "This message was deleted")
  const handleDeleteMessage = async (msgId: string, mode: 'for-everyone' | 'for-me' = 'for-everyone') => {
    const targetMsg = messages.find((m) => m.id === msgId);
    if (!targetMsg) return;

    // 1. Move to Universal Recycle Bin so item can be reviewed/restored or emptied
    try {
      await moveToRecycleBin({
        originalId: targetMsg.id,
        source: 'chat',
        title: `Message from ${targetMsg.sender === currentUser ? 'You' : partnerName}`,
        previewText: targetMsg.text || targetMsg.type || 'Attachment',
        mediaUrl: targetMsg.mediaUrl,
        mediaType: targetMsg.type === 'video' ? 'video' : targetMsg.type === 'image' ? 'photo' : undefined,
        owner: currentUser,
        originalData: targetMsg,
      });
    } catch (err) {
      console.warn('Failed to move message to recycle bin:', err);
    }

    if (mode === 'for-me') {
      // Hide locally and record in Supabase deleted_for array
      const updatedDeletedFor = [...(targetMsg.deletedFor || []), currentUser];
      const next = messages.map((m) => (m.id === msgId ? { ...m, deletedFor: updatedDeletedFor } : m));
      persistMessages(next);
      deleteRemoteMessageForMe(msgId, targetMsg.deletedFor || [], currentUser).catch(() => {});
      showToast('Message deleted for you (saved in Recycle Bin)', 'info');
    } else if (mode === 'for-everyone' && targetMsg.sender === currentUser) {
      // Delete for everyone: replaces message text with "This message was deleted"
      const next = messages.map((m) =>
        m.id === msgId
          ? {
              ...m,
              text: 'This message was deleted',
              deletedForAll: true,
              mediaUrl: undefined,
              documentUrl: undefined,
              audioUrl: undefined,
            }
          : m
      );
      persistMessages(next);
      deleteRemoteMessageForEveryone(msgId, currentUser).catch((err) => {
        console.warn('Failed to delete remote message for everyone:', err);
      });

      // Storage cleanup if applicable
      if (targetMsg.mediaUrl && targetMsg.mediaUrl.includes('chat_media')) {
        try {
          const parts = targetMsg.mediaUrl.split('chat_media/');
          if (parts[1]) {
            getSupabase().storage.from('chat_media').remove([parts[1]]).catch(() => {});
          }
        } catch {}
      }

      // Real-time broadcast deletion to all participants across devices
      crossDeviceSync.publish('message_deleted_for_all', { msgId });
      try {
        channelRef.current?.send({
          type: 'broadcast',
          event: 'message_deleted_for_all',
          payload: { msgId },
        });
      } catch {}
      try {
        chatBroadcastRef.current?.postMessage({
          type: 'message_deleted_for_all',
          payload: { msgId },
        });
      } catch {}

      showToast('Message deleted for everyone', 'info');
    }

    setDeleteDialogMsg(null);
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
        status: 'sending',
        type: 'text',
      };
      dispatchSendMessage(newMsg);
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

  // Filtered messages: respects "Delete for me", search query, and media filter
  const displayedMessages = useMemo(() => {
    let list = messages.filter((m) => !m.deletedFor?.includes(currentUser));
    if (mediaFilter !== 'all') {
      if (mediaFilter === 'starred') {
        list = list.filter((m) => m.isStarred);
      } else {
        list = list.filter((m) => m.type === mediaFilter);
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.text.toLowerCase().includes(q) ||
          m.transcript?.toLowerCase().includes(q) ||
          m.documentName?.toLowerCase().includes(q)
      );
    }
    if (disappearingTimer !== 'off') {
      const durationMs = disappearingTimer === '24h'
        ? 24 * 60 * 60 * 1000
        : disappearingTimer === '7d'
        ? 7 * 24 * 60 * 60 * 1000
        : 90 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      list = list.filter((m) => m.type === 'system' || m.sender === 'system' || (now - m.timestamp < durationMs));
    }
    return list;
  }, [messages, currentUser, searchQuery, mediaFilter, disappearingTimer]);

  // First unread incoming message ID for rendering the divider
  const firstUnreadMsgId = useMemo(() => {
    const unread = displayedMessages.find((m) => m.sender !== currentUser && m.status !== 'read');
    return unread?.id || null;
  }, [displayedMessages, currentUser]);

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
    <div className={`fixed inset-0 z-50 w-screen h-[100dvh] md:h-screen flex flex-row overflow-hidden select-none font-sans transition-colors duration-150 ${isDark ? "bg-[#0c1317] text-[#e9edef]" : "bg-[#f0f2f5] text-[#111b21]"}`}>
      {/* Authentic WhatsApp Web desktop decorative top strip */}
      <div className={`hidden md:block fixed top-0 left-0 right-0 h-[127px] pointer-events-none -z-10 ${isDark ? "bg-[#00a884]/20" : "bg-[#00a884]"}`} />
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
        multiple
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

      








      <WhatsAppLeftNav
        activeView={activeMainView}
        onSelectView={(v: MainNavView) => {
          setActiveMainView(v);
          setMobileView('conversation');
        }}
        isOpenMobile={isNavSidebarOpen}
        onCloseMobile={() => setIsNavSidebarOpen(false)}
        isDark={isDark}
        studentName={student?.name || 'Surya'}
        isPartnerOnline={isPartnerOnline}
        unreadCount={messages.filter((m) => !m.read && m.sender !== currentUser).length}
        onOpenProfile={() => setSidePanelMode((prev) => (prev === 'info' ? 'none' : 'info'))}
        onOpenAcademicMode={() => setDisguisePanic(true)}
        onLogout={handleLogout}
      />

      {/* ══════ FOCUSED TWO-USER CONVERSATION (SPACIOUS & CENTERED ON LAPTOP) ══════ */}
      <main
        className={`flex-1 flex flex-col h-full relative overflow-hidden transition-colors ${
          isDark ? 'bg-[#0b141a]' : 'bg-[#efeae2]'
        }`}
      >
        <div className="w-full flex-1 flex flex-col h-full relative overflow-hidden">
        {activeMainView === 'gallery' ? (
          /* Gallery View */
          <div className="w-full h-full flex flex-col bg-[#0c1317]">
            <GalleryView
              isDark={isDark}
              onBackToChat={() => {
                setActiveMainView('chat');
                setMobileView('conversation');
              }}
              onOpenTimeline={() => {
                setActiveMainView('timeline');
                setMobileView('conversation');
              }}
              onOpenRecycleBin={() => {
                setActiveMainView('recycle');
                setMobileView('conversation');
              }}
            />
          </div>
        ) : activeMainView === 'status' ? (
          /* Status & Live Presence View */
          <WhatsAppStatusView
            isDark={isDark}
            studentName={student?.name || 'Surya'}
            partnerName={partnerName}
            partnerUser={partnerUser}
            isPartnerOnline={isPartnerOnline}
            partnerLastSeen={partnerLastSeen}
            dateCount={dateCount}
            onSwitchUser={() => {
              const nextUser = currentUser === 'surya' ? 'sadhana' : 'surya';
              quickLogin(nextUser);
              showToast(`Switched account to ${nextUser === 'surya' ? 'Surya' : 'Sadhana'}`, 'info');
            }}
            onBackToChat={() => {
              setActiveMainView('chat');
              setMobileView('conversation');
            }}
            onOpenGallery={() => {
              setActiveMainView('gallery');
              setMobileView('conversation');
            }}
            onOpenTimeline={() => {
              setActiveMainView('timeline');
              setMobileView('conversation');
            }}
            showToast={showToast}
            doodleSvgUri={getDoodleSvgDataUri(isDark)}
          />
        ) : activeMainView === 'timeline' ? (
          /* Life Timeline View */
          <div className="w-full h-full flex flex-col bg-[#0c1317]">
            <LifeTimelineView
              isDark={isDark}
              onBackToChat={() => {
                setActiveMainView('chat');
                setMobileView('conversation');
              }}
              onOpenGallery={() => {
                setActiveMainView('gallery');
                setMobileView('conversation');
              }}
              onOpenRecycleBin={() => {
                setActiveMainView('recycle');
                setMobileView('conversation');
              }}
            />
          </div>
        ) : activeMainView === 'recycle' ? (
          /* Universal Recycle Bin View */
          <div className="w-full h-full flex flex-col bg-[#0c1317]">
            <RecycleBinView
              onBackToChat={() => {
                setActiveMainView('chat');
                setMobileView('conversation');
              }}
              onOpenGallery={() => {
                setActiveMainView('gallery');
                setMobileView('conversation');
              }}
              onOpenTimeline={() => {
                setActiveMainView('timeline');
                setMobileView('conversation');
              }}
            />
          </div>
        ) : (
          /* Active Chat Conversation */
          <>
{/* ── 1. WHATSAPP HEADER ── */}
      <div className={`px-2 sm:px-4 py-2 flex items-center justify-between border-b z-30 flex-shrink-0 shadow-sm h-[56px] md:h-[60px] transition-colors ${
        isDark ? 'bg-[#1f2c34] md:bg-[#202c33] border-[#2a3942]' : 'bg-[#f0f2f5] border-[#d1d7db]'
      }`}>
        <div className="flex items-center gap-3">
          {/* Mobile Open Navigation Menu Button with Dharya Heart Logo */}
          <button
            onClick={() => setIsNavSidebarOpen(true)}
            className="p-1 -ml-1 rounded-xl hover:bg-white/10 text-[#aebac1] hover:text-white transition-colors flex items-center gap-1.5 md:hidden cursor-pointer"
            title="Open Navigation Menu"
          >
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-white/20 bg-white flex items-center justify-center p-0.5 shadow-xs shrink-0">
              <img
                src={DHARYA_LOGO_DATA_URI}
                alt="Dharya Logo"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          </button>
          <button
            onClick={() => setMobileView('list')}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#aebac1] hover:text-white transition-colors flex items-center gap-1 md:hidden"
            title="Back to Chats List"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Contact or Group Avatar */}
          <div
            onClick={() => !isGroupChat && setSidePanelMode((prev) => (prev === 'info' ? 'none' : 'info'))}
            className={`relative cursor-pointer flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-base shadow-sm ring-1 ring-white/10 ${
              isGroupChat
                ? 'bg-gradient-to-tr from-sky-600 to-indigo-600'
                : 'bg-gradient-to-tr from-[#00a884] to-[#128c7e]'
            }`}
          >
            {isGroupChat ? <Users className="w-5 h-5" /> : <span>{partnerName[0]}</span>}
            {!isGroupChat && isPartnerOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00a884] border-2 border-[#202c33] shadow-[0_0_8px_#00a884]" />
            )}
          </div>

          {/* Conversation Title & Live Status */}
          <div onClick={() => !isGroupChat && setSidePanelMode((prev) => (prev === 'info' ? 'none' : 'info'))} className="cursor-pointer">
            <div className="flex items-center gap-2">
              <h2 className={`text-[16px] font-semibold tracking-tight ${fontClass} ${isDark ? "text-[#e9edef]" : "text-[#111b21]"}`}>
                {isGroupChat ? activeConversation.name : partnerName}
              </h2>
              {disappearingTimer !== 'off' && (
                <span title={`Disappearing messages: ${disappearingTimer}`}>
                  <Clock className="w-3 h-3 text-[#00a884]" />
                </span>
              )}
              {advancedPrivacy && (
                <span title="Advanced Chat Privacy Enabled">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00a884]" />
                </span>
              )}
              {/* Connection status indicator (only shown if disconnected or reconnecting) */}
              {connectionStatus !== 'connected' && (
                <div
                  className="flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20"
                  title={`Broker Connection: ${connectionStatus}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      connectionStatus === 'connecting' ? 'bg-amber-400 animate-pulse' : 'bg-rose-500'
                    }`}
                  />
                  <span className="text-[9px] text-amber-500 font-medium capitalize">
                    {connectionStatus}
                  </span>
                </div>
              )}
            </div>

            {isGroupChat ? (
              <p className={`text-[12px] text-[#8696a0] font-normal leading-tight truncate max-w-[200px] sm:max-w-xs ${fontClass}`}>
                {activeConversation.participants.map((p) => (p === currentUser ? 'You' : p === 'sadhana' ? 'Sadhana' : 'Surya')).join(', ')}
              </p>
            ) : isPartnerTyping ? (
              <p className={`text-[12px] text-[#00a884] font-semibold flex items-center gap-1 leading-tight animate-pulse ${fontClass}`}>
                <span>typing...</span>
              </p>
            ) : isPartnerOnline ? (
              <p className={`text-[12px] text-[#00a884] font-medium flex items-center gap-1.5 leading-tight ${fontClass}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-pulse" />
                <span>online</span>
              </p>
            ) : (
              <p className={`text-[12px] text-[#8696a0] font-normal leading-tight ${fontClass}`}>
                {formatLastSeen(partnerLastSeen)}
              </p>
            )}
          </div>
        </div>

        {/* ── Romantic Milestone Date Counter Pill (Shown ONLY for private 1-to-1 conversation) ── */}
        {!isGroupChat && (
          <button
            onClick={() => setShowDateCountModal(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono transition-all shadow-xs cursor-pointer select-none ${
              isDark
                ? 'bg-[#2a1d20]/70 hover:bg-[#2a1d20] border-[#48282e] text-[#D48D98]'
                : 'bg-[#FDF4F5] hover:bg-[#FBE8EA] border-[#F0D5D8] text-[#A85A66]'
            }`}
            title="Date Counter: 20 May 2026, 7:30 — Click for countdown"
          >
            <Heart className="w-3.5 h-3.5 fill-current shrink-0 animate-pulse" />
            <span className="hidden lg:inline">20 May 2026, 7:30 •</span>
            <span>{dateCount.days}d {dateCount.hours}h</span>
            <span className="hidden sm:inline">{dateCount.minutes}m {dateCount.seconds}s</span>
          </button>
        )}

        {/* ── Active Account & 1-Click User Switcher ── */}
        <button
          onClick={() => {
            const nextUser = currentUser === 'surya' ? 'sadhana' : 'surya';
            quickLogin(nextUser);
            showToast(`Switched account to ${nextUser === 'surya' ? 'Surya' : 'Sadhana'}`, 'info');
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-all shadow-xs cursor-pointer select-none ${
            isDark
              ? 'bg-[#182229] hover:bg-[#202c33] border-emerald-500/40 text-emerald-400'
              : 'bg-[#e7fce3] hover:bg-[#dcf8c6] border-[#00a884]/40 text-[#008069]'
          }`}
          title={`Logged in as ${currentUser === 'surya' ? 'Surya' : 'Sadhana'}. Tap to switch to ${currentUser === 'surya' ? 'Sadhana' : 'Surya'}`}
        >
          <User className="w-3.5 h-3.5" />
          <span className="capitalize">{currentUser}</span>
          <span className="text-[10px] opacity-70 hidden md:inline">• Switch</span>
        </button>

        {/* ── Quick Switch to Academic Mode (ENGIHUB) ── */}
        <button
          onClick={() => switchTab('home')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all shadow-xs cursor-pointer select-none ${
            isDark
              ? 'bg-[#152433] hover:bg-[#1d3246] border-[#224466] text-[#78B2E8]'
              : 'bg-[#EFF6FF] hover:bg-[#DBEAFE] border-[#BFDBFE] text-[#1D4ED8]'
          }`}
          title="Return to ENGIHUB Academic Mode (Ctrl+Shift+D)"
        >
          <GraduationCap className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="hidden sm:inline font-semibold">Academic Mode</span>
        </button>

        {/* Action Icons */}
        <div className={`flex items-center gap-0.5 sm:gap-1.5 ${isDark ? "text-[#959E98]" : "text-[#555E58]"}`}>
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
            onClick={() => setSidePanelMode((prev) => (prev === 'search' ? 'none' : 'search'))}
            className={`p-2 rounded-full transition-colors ${
              sidePanelMode === 'search'
                ? 'bg-[#00a884]/20 text-[#00a884]'
                : 'hover:bg-white/10 hover:text-white'
            }`}
            title="Search messages (Ctrl+F)"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Shared Media & Docs */}
          <button
            onClick={() => setSidePanelMode((prev) => (prev === 'media' ? 'none' : 'media'))}
            className={`p-2 rounded-full transition-colors ${
              sidePanelMode === 'media'
                ? 'bg-[#00a884]/20 text-[#00a884]'
                : 'hover:bg-white/10 hover:text-white'
            }`}
            title="Shared media, files & voice notes"
          >
            <Images className="w-4 h-4" />
          </button>

          {/* AI Smart Notifications Center */}
          <button
            onClick={() => setShowNotificationCenter(true)}
            className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors relative"
            title="Smart Notifications"
          >
            {unreadNotifCount > 0 ? (
              <BellRing className="w-4 h-4 text-emerald-500" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
            {unreadNotifCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#F22679] ring-2 ring-emerald-400 animate-pulse" />
            )}
          </button>

          {/* 3-Dots Menu (Exact WhatsApp Picture 2 & Picture 3 Feature) */}
          <div className="relative">
            <button
              onClick={() => {
                if (showMenu) {
                  setShowMenu(false);
                } else {
                  setMenuLevel('main');
                  setShowMenu(true);
                }
              }}
              className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                {/* Backdrop to close menu when clicking outside */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => {
                    setShowMenu(false);
                    setMenuLevel('main');
                  }}
                />

                {/* WhatsApp Menu Popover (Picture 2 & Picture 3) */}
                <div
                  className={`absolute right-0 top-11 min-w-[210px] w-56 sm:w-60 rounded-2xl shadow-2xl py-2 z-50 text-[16px] border select-none transition-all duration-150 animate-in fade-in zoom-in-95 ${
                    isDark
                      ? 'bg-[#233138] border-white/10 text-[#e9edef] shadow-black/70'
                      : 'bg-white border-black/5 text-[#111b21] shadow-black/20'
                  } ${fontClass}`}
                >
                  {menuLevel === 'main' ? (
                    /* MAIN MENU (Picture 2) */
                    <div className="py-0.5">
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowSearch(true);
                        }}
                        className="w-full text-left px-5 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer block tracking-wide"
                      >
                        Search
                      </button>

                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setSidePanelMode('media');
                        }}
                        className="w-full text-left px-5 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer block tracking-wide"
                      >
                        Media, links, and docs
                      </button>

                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowDisappearingModal(true);
                        }}
                        className="w-full text-left px-5 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer block tracking-wide"
                      >
                        Disappearing messages
                      </button>

                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowThemeModal(true);
                        }}
                        className="w-full text-left px-5 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer block tracking-wide"
                      >
                        Chat theme
                      </button>

                      <button
                        onClick={() => {
                          setMenuLevel('more');
                        }}
                        className="w-full text-left px-5 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-between tracking-wide"
                      >
                        <span>More</span>
                        <span className="text-[12px] opacity-70">▸</span>
                      </button>
                    </div>
                  ) : (
                    /* SUB-MENU "MORE" (Picture 3) */
                    <div className="py-0.5">
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowClearConfirm(true);
                        }}
                        className="w-full text-left px-5 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer block tracking-wide text-rose-500 dark:text-rose-400"
                      >
                        Clear chat
                      </button>

                      <button
                        onClick={async () => {
                          setShowMenu(false);
                          if (window.confirm('Delete all messages, photos, videos, and statuses to make the app completely fresh like a brand new user?')) {
                            await performFullCleanSlateReset();
                            window.location.reload();
                          }
                        }}
                        className="w-full text-left px-5 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer block tracking-wide text-rose-600 dark:text-rose-400 font-semibold border-b border-black/5 dark:border-white/5"
                      >
                        Reset All (Fresh New User)
                      </button>

                      <button
                        onClick={() => {
                          setShowMenu(false);
                          handleExportChat();
                        }}
                        className="w-full text-left px-5 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer block tracking-wide"
                      >
                        Export chat
                      </button>

                      <button
                        onClick={() => {
                          setShowMenu(false);
                          handleAddShortcut();
                        }}
                        className="w-full text-left px-5 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer block tracking-wide"
                      >
                        Add shortcut
                      </button>

                      <a
                        href="https://github.com/SURIYAKUMARE/Dharya/releases"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setShowMenu(false)}
                        className="w-full text-left px-5 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer block tracking-wide text-emerald-600 dark:text-emerald-400 font-semibold"
                      >
                        📱 Download Android APK
                      </a>

                      <button
                        onClick={() => {
                          setShowMenu(false);
                          handleAddToList();
                        }}
                        className="w-full text-left px-5 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer block tracking-wide"
                      >
                        Add to list
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── OFFLINE STATUS BANNER ── */}
      {!isOnline && (
        <div className="bg-amber-950/80 border-b border-amber-500/30 text-amber-200 px-4 py-1.5 text-xs flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            <span>Offline mode — messages will sync automatically when reconnected</span>
          </div>
        </div>
      )}

      {/* ── MESSAGE SELECTION ACTION BAR ── */}
      {isSelectionMode && (
        <div className={`px-4 py-2.5 border-b flex items-center justify-between gap-3 text-xs z-30 transition-all ${
          isDark ? 'bg-[#202c33] border-[#2a3942] text-white' : 'bg-slate-100 border-[#d1d7db] text-[#111b21]'
        }`}>
          <div className="flex items-center gap-2 font-bold text-sm">
            <button
              onClick={() => {
                setIsSelectionMode(false);
                setSelectedMsgIds(new Set());
              }}
              className="p-1 rounded-full hover:bg-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <span>{selectedMsgIds.size} Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkCopy}
              disabled={selectedMsgIds.size === 0}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 font-semibold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
              title="Copy selected messages"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
            <button
              onClick={handleBulkStar}
              disabled={selectedMsgIds.size === 0}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 font-semibold flex items-center gap-1.5 disabled:opacity-40 text-amber-400 cursor-pointer"
              title="Star selected messages"
            >
              <Star className="w-3.5 h-3.5" />
              <span>Star</span>
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={selectedMsgIds.size === 0}
              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
              title="Delete selected messages"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* ── IN-CHAT SEARCH BAR WITH MEDIA FILTERS ── */}
      {showSearch && (
        <div className={`px-4 py-2 border-b flex flex-col gap-2 z-20 transition-colors ${
          isDark ? 'bg-[#182229] border-[#2a3942]' : 'bg-[#ffffff] border-[#d1d7db] shadow-sm'
        }`}>
          <div className="flex items-center gap-2">
            <Search className={`w-4 h-4 ${isDark ? 'text-[#8696a0]' : 'text-[#54656f]'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in chat..."
              className={`flex-1 bg-transparent text-sm focus:outline-none ${
                isDark ? 'text-white placeholder-[#8696a0]' : 'text-[#111b21] placeholder-[#54656f]'
              }`}
              autoFocus
            />
            <span className={`text-[11px] font-mono ${isDark ? 'text-[#8696a0]' : 'text-[#54656f]'}`}>
              {displayedMessages.length} {displayedMessages.length === 1 ? 'match' : 'matches'}
            </span>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className={`text-xs ${isDark ? 'text-[#8696a0] hover:text-white' : 'text-[#54656f] hover:text-[#111b21]'}`}>
                ✕
              </button>
            )}
            <button onClick={() => { setShowSearch(false); setMediaFilter('all'); setSearchQuery(''); }} className={`text-xs font-semibold ml-2 ${isDark ? 'text-[#00a884]' : 'text-[#008069]'}`}>
              Done
            </button>
          </div>

          {/* Quick Media Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            {[
              { id: 'all', label: 'All' },
              { id: 'image', label: 'Photos 📸' },
              { id: 'video', label: 'Videos 🎬' },
              { id: 'voice', label: 'Voice 🎙️' },
              { id: 'document', label: 'Docs 📄' },
              { id: 'starred', label: 'Starred ⭐' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setMediaFilter(f.id as any)}
                className={`px-2.5 py-0.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                  mediaFilter === f.id
                    ? 'bg-emerald-500 text-white font-bold shadow-xs'
                    : isDark
                    ? 'bg-white/5 text-[#8696a0] hover:text-white hover:bg-white/10'
                    : 'bg-black/5 text-[#54656f] hover:text-[#111b21] hover:bg-black/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 2. PINNED MESSAGES BANNER (Up to 3 pinned messages) ── */}
      {pinnedMessages.length > 0 && (
        <div className={`px-4 py-2 border-b flex items-center justify-between gap-3 text-xs z-20 transition-colors ${
          isDark ? 'bg-[#182229] border-[#2a3942] text-[#8696a0]' : 'bg-[#ffffff] border-[#d1d7db] text-[#54656f] shadow-sm'
        }`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Pin className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <div className="truncate">
              <span className={`font-bold mr-1 ${isDark ? 'text-[#00a884]' : 'text-[#008069]'}`}>
                {pinnedMessages[0].sender === currentUser ? 'You' : partnerName}:
              </span>
              <span className={`truncate ${isDark ? 'text-white' : 'text-[#111b21]'}`}>{pinnedMessages[0].text}</span>
            </div>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full flex-shrink-0 ${
            isDark ? 'text-[#00a884] bg-[#00a884]/15' : 'text-[#008069] bg-[#e7fce3]'
          }`}>
            {pinnedMessages.length}/3 Pinned
          </span>
        </div>
      )}

      {/* ── 3. CHAT MESSAGES CANVAS ── */}
      <div
        ref={chatScrollRef}
        onScroll={handleChatScroll}
        className={`flex-1 overflow-y-auto px-2 sm:px-4 py-2 relative scroll-smooth ${fontClass}`}
        style={getWallpaperStyle()}
      >
        {/* Centered Conversation Column for Authentic WhatsApp Layout */}
        <div className="max-w-[960px] w-full mx-auto px-1 sm:px-3">
        {/* Load earlier messages button */}
        {hasMoreMessages && (
          <div className="flex justify-center my-2">
            <button
              type="button"
              onClick={handleLoadOlderMessages}
              disabled={isLoadingOlder}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark
                  ? 'bg-[#182229] border-[#2a3942] text-[#00a884] hover:bg-[#202c33]'
                  : 'bg-white border-[#d1d7db] text-[#008069] hover:bg-[#f0f2f5]'
              }`}
            >
              {isLoadingOlder ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading earlier messages...</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Load earlier messages</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Security Banner: TLS Transport & Row-Level Security */}
        <div
          onClick={() => setShowSecurityModal(true)}
          className={`mx-auto max-w-sm p-3 rounded-xl text-center shadow my-2 cursor-pointer transition-colors ${
            isDark
              ? 'bg-[#182229] border border-emerald-500/20 hover:border-emerald-500/40'
              : 'bg-[#e7fce3] border border-[#00a884]/30 hover:bg-[#dcf8c6]'
          }`}
        >
          <div className={`flex items-center justify-center gap-1.5 text-xs font-semibold mb-0.5 ${
            isDark ? 'text-emerald-400' : 'text-[#008069]'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>TLS Transport &amp; Row-Level Security</span>
          </div>
          <p className={`text-[11px] leading-tight ${isDark ? 'text-[#8696a0]' : 'text-[#54656f]'}`}>
            All messages are encrypted in transit via TLS 1.3 and isolated with PostgreSQL Row-Level Security. Tap to view details.
          </p>
        </div>

{/* Dynamic date dividers are computed per-day in displayedMessages */}

        {/* Clean Empty State when no messages exist yet */}
        {displayedMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 space-y-4 max-w-sm mx-auto">
            <div className={`w-16 h-16 rounded-full border flex items-center justify-center shadow-lg ${
              isDark ? 'bg-[#182229] border-[#2a3942]' : 'bg-white border-emerald-200 shadow-md'
            }`}>
              <ShieldCheck className="w-7 h-7 text-emerald-500" />
            </div>
            <div className="space-y-1">
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>No messages yet</h3>
              <p className={`text-xs ${isDark ? 'text-[#8696a0]' : 'text-slate-500'}`}>
                All messages and gallery photos sent between you and <span className="text-emerald-500 font-semibold">{isGroupChat ? activeConversation.name : partnerName}</span> are stored safely and protected with TLS transport encryption and PostgreSQL Row-Level Security.
              </p>
            </div>
            <button
              onClick={() => setShowSecurityModal(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-medium transition-colors ${
                isDark
                  ? 'bg-[#182229] border-emerald-500/30 text-emerald-400 hover:bg-[#202c33]'
                  : 'bg-white border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 shadow-xs'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify Security Status</span>
            </button>
          </div>
        )}

        {/* Messages List */}
        {displayedMessages.map((msg, index) => {
          const prevMsg = index > 0 ? displayedMessages[index - 1] : null;
          const isNewDay = !prevMsg || new Date(prevMsg.timestamp).toDateString() !== new Date(msg.timestamp).toDateString();

          const dateDividerPill = isNewDay ? (
            <div key={`date-${msg.id}`} className="flex justify-center my-3 select-none">
              <span className={`px-3 py-1 rounded-[7.5px] text-[12px] font-medium shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] uppercase tracking-wider ${
                isDark
                  ? 'bg-[#182229]/95 text-[#8696a0] border border-[#2a3942]/60'
                  : 'bg-[#ffffff]/95 text-[#54656f] border border-[#d1d7db]/60'
              }`}>
                {getDateDividerLabel(msg.timestamp)}
              </span>
            </div>
          ) : null;

          if (msg.sender === 'system' || msg.type === 'system') {
            return (
              <React.Fragment key={msg.id}>
                {dateDividerPill}
                <div key={msg.id} className="flex justify-center my-2.5 select-none px-4">
                  <div className={`text-[12px] px-3.5 py-1.5 rounded-xl max-w-sm text-center shadow-xs flex items-center justify-center gap-1.5 ${
                    isDark ? 'bg-[#182229]/90 text-[#8696a0] border border-white/5' : 'bg-[#f0f2f5] text-[#54656f] border border-black/5'
                  } ${fontClass}`}>
                    <Clock className="w-3.5 h-3.5 text-[#00a884] shrink-0" />
                    <span>{msg.text}</span>
                  </div>
                </div>
              </React.Fragment>
            );
          }

          const isMe = msg.sender === currentUser;
          const isConsecutive = !!(prevMsg && prevMsg.sender === msg.sender);
          const reactions = msg.reactions || {};
          const totalReactions = Object.values(reactions).flat().length;
          const isFirstUnread = msg.id === firstUnreadMsgId;

          return (
            <React.Fragment key={msg.id}>
              {dateDividerPill}
              {/* Unread Messages Separator */}
              {isFirstUnread && (
                <div className="flex items-center justify-center my-3 select-none">
                  <div className="h-px bg-emerald-500/30 flex-1 max-w-xs" />
                  <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold font-mono tracking-wider mx-2 uppercase border border-emerald-500/30 shadow-xs">
                    Unread Messages
                  </span>
                  <div className="h-px bg-emerald-500/30 flex-1 max-w-xs" />
                </div>
              )}

              <div
                className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-1.5 group relative ${
                  isConsecutive ? 'mt-[2.5px]' : 'mt-2.5 sm:mt-3'
                }`}
              >
                {/* Selection Checkbox */}
                {isSelectionMode && (
                  <div
                    onClick={() => handleToggleSelectMsg(msg.id)}
                    className="self-center p-1 cursor-pointer select-none"
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      selectedMsgIds.has(msg.id)
                        ? 'bg-[#00a884] border-[#00a884] text-white'
                        : isDark ? 'border-white/30 hover:border-white/60' : 'border-black/30 hover:border-black/60'
                    }`}>
                      {selectedMsgIds.has(msg.id) && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                )}

                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[78%] md:max-w-[72%] relative`}>
                  {/* Message Bubble with Authentic Speech Tail */}
                  <div
                    id={`msg-${msg.id}`}
                    className={`relative w-full px-3 py-1.5 shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] transition-all select-none ${
                      isConsecutive
                        ? 'rounded-[8px]'
                        : isMe ? 'rounded-[8px] rounded-tr-[2px]' : 'rounded-[8px] rounded-tl-[2px]'
                    }`}
                    style={{
                      backgroundColor: isMe ? activeTheme.bubbleOutgoing : activeTheme.bubbleIncoming,
                      color: isMe ? activeTheme.bubbleOutgoingText : activeTheme.bubbleIncomingText,
                      border: (isMe ? activeTheme.bubbleOutgoingBorder : activeTheme.bubbleIncomingBorder)
                        ? `1px solid ${isMe ? activeTheme.bubbleOutgoingBorder : activeTheme.bubbleIncomingBorder}`
                        : undefined,
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setReactionBubbleId(msg.id);
                    }}
                  >
                    {/* Authentic Speech Bubble Tail SVG (only for cluster leader) */}
                    {!isConsecutive && (
                      isMe ? (
                        <svg className="absolute -top-[0px] -right-[7px] w-[8px] h-[13px] overflow-hidden pointer-events-none" viewBox="0 0 8 13">
                          <path d="M0 0 C3 2, 7 4, 8 13 L0 13 Z" fill={activeTheme.bubbleOutgoing} />
                        </svg>
                      ) : (
                        <svg className="absolute -top-[0px] -left-[7px] w-[8px] h-[13px] overflow-hidden pointer-events-none" viewBox="0 0 8 13">
                          <path d="M8 0 C5 2, 1 4, 0 13 L8 13 Z" fill={activeTheme.bubbleIncoming} />
                        </svg>
                      )
                    )}
                    {/* Pinned Indicator on Bubble */}
                    {msg.isPinned && (
                      <div className="flex items-center gap-1 text-[10px] text-[#ffd279] font-semibold mb-1">
                        <Pin className="w-2.5 h-2.5" />
                        <span>Pinned Message</span>
                      </div>
                    )}

                    {/* Quoted Reply Preview on Bubble - Click to jump */}
                    {msg.replyTo && (
                      <div
                        onClick={() => msg.replyTo?.id && jumpToMessage(msg.replyTo.id)}
                        className={`mb-2 p-2 rounded-lg border-l-4 border-emerald-500 text-xs select-none cursor-pointer hover:opacity-80 transition-opacity ${
                          isDark ? 'bg-black/25' : 'bg-black/5'
                        }`}
                        title="Click to jump to quoted message"
                      >
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

                {/* ── REGULAR IMAGE MESSAGE & WHATSAPP PHOTO COLLAGE GRID ── */}
                {msg.type === 'image' && !msg.isViewOnce && (
                  <div className="space-y-1.5 mb-1 select-none">
                    {/* Multi-Photo WhatsApp Collage (2x2 Grid with +N Overlay) */}
                    {msg.mediaUrls && msg.mediaUrls.length > 1 ? (
                      <div>
                        {msg.mediaUrls.length === 2 && (
                          <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden max-w-[340px] sm:max-w-[420px]">
                            {msg.mediaUrls.slice(0, 2).map((url, i) => (
                              <img
                                key={i}
                                src={url}
                                alt="Photo"
                                onClick={() => openLightbox(msg, url)}
                                className="w-full h-44 object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                              />
                            ))}
                          </div>
                        )}
                        {msg.mediaUrls.length === 3 && (
                          <div className="space-y-1 rounded-xl overflow-hidden max-w-[340px] sm:max-w-[420px]">
                            <img
                              src={msg.mediaUrls[0]}
                              alt="Photo"
                              onClick={() => openLightbox(msg, msg.mediaUrls![0])}
                              className="w-full h-48 object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                            />
                            <div className="grid grid-cols-2 gap-1">
                              {msg.mediaUrls.slice(1, 3).map((url, i) => (
                                <img
                                  key={i}
                                  src={url}
                                  alt="Photo"
                                  onClick={() => openLightbox(msg, url)}
                                  className="w-full h-36 object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {msg.mediaUrls.length >= 4 && (
                          <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden max-w-[340px] sm:max-w-[420px]">
                            {msg.mediaUrls.slice(0, 4).map((url, i) => {
                              const isLast = i === 3;
                              const extraCount = msg.mediaUrls!.length - 4;
                              return (
                                <div
                                  key={i}
                                  className="relative aspect-square overflow-hidden bg-black/40 cursor-pointer group"
                                  onClick={() => openLightbox(msg, url)}
                                >
                                  <img
                                    src={url}
                                    alt="Photo"
                                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                                  />
                                  {isLast && extraCount > 0 && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center text-white font-bold text-2xl tracking-wide select-none">
                                      +{extraCount}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Single Photo Bubble */
                      <div className="relative rounded-xl overflow-hidden bg-black/40 max-h-80 group cursor-pointer" onClick={() => openLightbox(msg)}>
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
                    )}
                    {msg.text && msg.text !== 'Photo' && msg.text !== 'High Definition Photo' && (
                      <p
                        className="text-sm leading-relaxed pt-1"
                        style={{ color: isMe ? activeTheme.bubbleOutgoingText : activeTheme.bubbleIncomingText }}
                      >
                        {renderFormattedText(msg.text)}
                      </p>
                    )}
                  </div>
                )}

                {/* ── CONTACT CARD MESSAGE ── */}
                {msg.type === 'contact' && (
                  <div className="w-[260px] sm:w-[285px] py-1 select-none">
                    <div className="flex items-center gap-3 p-2">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-300/40 dark:bg-white/10 flex items-center justify-center text-[#00a884] font-bold text-lg shrink-0 border border-black/10 dark:border-white/10">
                        {msg.thumbnailUrl || msg.mediaUrl ? (
                          <img src={msg.thumbnailUrl || msg.mediaUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-[#00a884]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: isMe ? activeTheme.bubbleOutgoingText : activeTheme.bubbleIncomingText }}>
                          {msg.documentName || msg.text || 'Contact'}
                        </p>
                        <span className="text-[11px] opacity-75">Contact</span>
                      </div>
                    </div>
                    <div className={`h-px w-full my-1 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                    <button
                      type="button"
                      onClick={() => showToast(`Contact verified: ${msg.documentName || msg.text}`, 'success')}
                      className="w-full py-1 text-center text-xs font-semibold text-[#00a884] hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      Message
                    </button>
                  </div>
                )}

                {/* ── REGULAR VIDEO MESSAGE (Playable Directly Inside Chat + Fullscreen & Download) ── */}
                {msg.type === 'video' && !msg.isViewOnce && (
                  <div className="space-y-1.5 mb-1 max-w-[340px] sm:max-w-[400px]">
                    <div className="relative rounded-xl overflow-hidden bg-black/80 max-h-80 flex items-center justify-center border border-white/10 shadow-lg">
                      <video
                        src={msg.mediaUrl}
                        poster={msg.thumbnailUrl}
                        controls
                        playsInline
                        preload="metadata"
                        className="w-full max-h-80 object-contain rounded-xl"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#8696a0] px-1 pt-0.5">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Video className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{msg.duration || 'Video'}</span>
                        {msg.fileSizeKb && (
                          <span>
                            • {msg.fileSizeKb > 1024 ? `${(msg.fileSizeKb / 1024).toFixed(1)} MB` : `${msg.fileSizeKb} KB`}
                          </span>
                        )}
                        {msg.isHd && (
                          <span className="px-1 py-0.2 rounded bg-white/10 text-[9px] font-bold text-emerald-400">
                            HD
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => openLightbox(msg)}
                        className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
                        title="View fullscreen & download"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Expand</span>
                      </button>
                    </div>
                    {msg.text && msg.text !== 'Video' && (
                      <p
                        className="text-sm leading-relaxed pt-1"
                        style={{ color: isMe ? activeTheme.bubbleOutgoingText : activeTheme.bubbleIncomingText }}
                      >
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

                {/* ── REGULAR TEXT OR DELETED MESSAGE ── */}
                {msg.deletedForAll ? (
                  <div className="flex items-center gap-1.5 text-[#667781] italic text-[13.5px] py-1 select-none">
                    <Ban className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
                    <span>This message was deleted</span>
                  </div>
                ) : msg.type === 'text' ? (
                  <div className="inline">
                    <p
                      className={`text-[15px] sm:text-[15.5px] leading-[21px] break-words pr-1 pt-0.5 inline ${
                        chatFont === 'handwriting' ? "font-['Delius',_'Comfortaa',_cursive,sans-serif]" : "font-sans"
                      }`}
                      style={{ color: isMe ? activeTheme.bubbleOutgoingText : activeTheme.bubbleIncomingText }}
                    >
                      {renderFormattedText(
                        msg.text && msg.text.length > 360 && !expandedMsgIds[msg.id]
                          ? msg.text.slice(0, 360) + '...'
                          : msg.text
                      )}
                    </p>
                    {msg.text && msg.text.length > 360 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedMsgIds((prev) => ({ ...prev, [msg.id]: !prev[msg.id] }));
                        }}
                        className="text-xs font-semibold text-[#00a884] hover:underline mt-1 cursor-pointer select-none inline-block ml-1"
                      >
                        {expandedMsgIds[msg.id] ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </div>
                ) : null}

                {/* Bubble Footer: Timestamp & Checkmarks */}
                <div
                  className="inline-flex items-center justify-end gap-1 float-right mt-1 ml-2 text-[11px] select-none font-sans"
                  style={{
                    color: isMe
                      ? (isDark ? 'rgba(235, 245, 237, 0.65)' : '#667781')
                      : (isDark ? 'rgba(236, 238, 235, 0.65)' : '#667781')
                  }}
                >
                  {msg.isStarred && (
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                  )}
                  {msg.isEdited && (
                    <span
                      className="text-[10px] text-white/50 italic mr-0.5 select-none"
                      title={msg.editedAt ? `Edited at ${new Date(msg.editedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Edited'}
                    >
                      (edited)
                    </span>
                  )}
                  <span>{msg.time}</span>
                  {renderMessageTicks(msg)}
                </div>

                {/* Reaction Counter Pill (Aligned to left for incoming, right for outgoing) */}
                {totalReactions > 0 && (
                  <div className={`absolute -bottom-2.5 ${isMe ? 'right-2' : 'left-2'} ${
                    isDark ? 'bg-[#202c33] text-white border-white/10' : 'bg-white text-[#111b21] border-black/10 shadow-sm'
                  } border rounded-full px-1.5 py-0.5 shadow-md flex items-center gap-1 text-xs select-none`}>
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

              {/* Message Context Controls (Reply, Star, Edit, React, Pin, Delete) */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 px-1 text-xs text-[#8696a0]">
                <button
                  onClick={() => handleStartReply(msg)}
                  className="p-1 hover:text-white hover:bg-white/10 rounded"
                  title="Reply"
                >
                  <CornerUpLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleCopyMessage(msg)}
                  className="p-1 hover:text-white hover:bg-white/10 rounded cursor-pointer"
                  title="Copy text"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {msg.sender === currentUser && msg.type === 'text' && !msg.deletedForAll && (
                  <button
                    onClick={() => {
                      setEditingMessage(msg);
                      setEditText(msg.text);
                    }}
                    className="p-1 hover:text-white hover:bg-white/10 rounded cursor-pointer"
                    title="Edit message"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
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
                  onClick={() => setDeleteDialogMsg(msg)}
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
              </div>
            </React.Fragment>
          );
        })}

        <div ref={messagesEndRef} />
        </div>{/* End centered conversation container */}
      </div>

      {/* Floating Scroll to Bottom / New Message Pill */}
      {showScrollBottom && (
        <button
          onClick={() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            setShowScrollBottom(false);
            setUnreadCountBelow(0);
          }}
          className={`absolute bottom-20 right-5 z-20 px-3 py-1.5 rounded-full border shadow-lg flex items-center gap-1.5 text-xs font-medium transition-all hover:scale-105 active:scale-95 ${
            isDark
              ? 'bg-[#181c1b]/95 border-[#2b332e] text-[#ECEEEB] hover:bg-[#232926]'
              : 'bg-white/95 border-[#E5DFD5] text-[#1F2421] hover:bg-[#F7F5F2]'
          }`}
          title="Jump to newest message"
        >
          <ChevronDown className="w-4 h-4 text-[#7E9F89]" />
          <span>Newest</span>
          {unreadCountBelow > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#7E9F89] text-white text-[10px] font-bold">
              {unreadCountBelow}
            </span>
          )}
        </button>
      )}

      {/* ── QUOTED REPLY PREVIEW BANNER ── */}
      {replyingToMessage && (
        <div className={`border-t px-4 py-2 flex items-center justify-between z-30 animate-in fade-in slide-in-from-bottom-2 duration-150 transition-colors ${
          isDark ? 'bg-[#182229] border-[#2a3942]' : 'bg-[#f0f2f5] border-[#d1d7db]'
        }`}>
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

      {/* ── EDIT MESSAGE BANNER ── */}
      {editingMessage && (
        <div className={`border-t px-4 py-2 flex items-center justify-between z-30 animate-in fade-in slide-in-from-bottom-2 duration-150 transition-colors ${
          isDark ? 'bg-[#182229] border-[#2a3942]' : 'bg-[#f0f2f5] border-[#d1d7db]'
        }`}>
          <div className="border-l-4 border-[#00a884] pl-2.5 overflow-hidden">
            <span className="text-xs font-semibold text-[#00a884] flex items-center gap-1.5">
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editing message</span>
            </span>
            <span className="text-xs text-[#8696a0] line-clamp-1 italic">
              &ldquo;{editingMessage.text}&rdquo;
            </span>
          </div>
          <button
            onClick={() => {
              setEditingMessage(null);
              setEditText('');
            }}
            className="p-1 rounded-full text-[#8696a0] hover:text-white transition-colors"
            title="Cancel editing"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── 4. CHAT INPUT BAR (WhatsApp Android Floating Pill + Action Button, Exact Replica of Screenshot) ── */}
      <div
        className="px-2 py-2 pb-[calc(env(safe-area-inset-bottom,0px)+6px)] z-30 flex-shrink-0 relative select-none"
        style={{
          backgroundColor: activeTheme.bgMain,
          backgroundImage: `url("${getDoodleSvgDataUri(isDark)}")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '412px 412px',
          backgroundPosition: 'bottom center',
        }}
      >
        {/* Input Row */}
        <div className="flex items-end gap-1.5 sm:gap-2 w-full px-2 sm:px-4">
          {isRecordingAudio ? (
            <div className="flex-1 bg-[#1f2c34] text-white rounded-[24px] px-4 py-2.5 flex items-center justify-between gap-3 shadow-md animate-in fade-in duration-150">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="text-sm font-semibold font-mono">
                  {Math.floor(recordingTimeSecs / 60)}:
                  {recordingTimeSecs % 60 < 10 ? '0' : ''}
                  {recordingTimeSecs % 60}
                </span>
                <span className="text-xs text-[#8696a0] italic">Recording voice note...</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelAudioRecording}
                  className="p-1.5 rounded-full text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                  title="Discard voice note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleStopAndReviewAudioRecording}
                  className="w-8 h-8 rounded-full bg-[#00a884] hover:bg-[#029071] text-white flex items-center justify-center shadow transition-transform hover:scale-105 cursor-pointer"
                  title="Stop and preview voice note"
                >
                  <span className="w-3 h-3 rounded-xs bg-white" />
                </button>
              </div>
            </div>
          ) : recordedAudioUrl ? (
            <div className="flex-1 bg-[#1f2c34] text-white rounded-[24px] px-4 py-2 flex items-center justify-between gap-3 shadow-md animate-in fade-in duration-150">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={handleTogglePlayAudioPreview}
                  className="w-8 h-8 rounded-full bg-[#00a884] hover:bg-[#029071] text-white flex items-center justify-center shadow transition-colors cursor-pointer shrink-0"
                  title={isPlayingAudioPreview ? 'Pause preview' : 'Play preview'}
                >
                  {isPlayingAudioPreview ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div className="min-w-0">
                  <span className="text-xs font-semibold block">Voice Note Preview</span>
                  <span className="text-[10px] text-[#8696a0] font-mono">
                    {Math.floor(recordingTimeSecs / 60)}:{recordingTimeSecs % 60 < 10 ? '0' : ''}{recordingTimeSecs % 60}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDiscardAudioPreview}
                  className="p-1.5 rounded-full text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                  title="Delete recording"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleSendAudioPreview}
                  className="w-8 h-8 rounded-full bg-[#00a884] hover:bg-[#029071] text-white flex items-center justify-center shadow transition-transform hover:scale-105 cursor-pointer"
                  title="Send voice note"
                >
                  <Send className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Standard WhatsApp Input Pill (White Pill with Smile, Message, Paperclip, ₹, Camera) */
            <div className={`flex-1 rounded-[24px] shadow-[0_1px_2px_rgba(11,20,26,0.18)] flex items-end px-2.5 py-1 min-h-[46px] transition-colors relative ${
              isDark
                ? 'bg-[#1f2c34] text-[#e9edef]'
                : 'bg-white text-[#111b21]'
            }`}>
              {/* Emoji Icon Button on Left */}
              <button
                type="button"
                onClick={() => {
                  setShowEmojiPicker((prev) => !prev);
                  setReactionTargetMsgId(null);
                }}
                className={`p-1.5 rounded-full transition-colors shrink-0 mb-0.5 ${
                  showEmojiPicker
                    ? 'text-[#00a884]'
                    : isDark
                    ? 'text-[#8696a0] hover:text-[#d1d7db]'
                    : 'text-[#54656f] hover:text-[#111b21]'
                }`}
                title={showEmojiPicker ? 'Close Emojis' : 'Emojis'}
              >
                {showEmojiPicker ? <Keyboard className="w-6 h-6 stroke-[1.8]" /> : <Smile className="w-6 h-6 stroke-[1.8]" />}
              </button>

              {/* Message Textarea */}
              <textarea
                value={editingMessage ? editText : inputText}
                rows={1}
                onChange={(e) => {
                  if (editingMessage) {
                    setEditText(e.target.value);
                  } else {
                    handleInputTextChange(e.target.value);
                  }
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (editingMessage) {
                      handleConfirmEdit();
                    } else {
                      handleSendText();
                    }
                  } else if (e.key === 'Escape' && editingMessage) {
                    setEditingMessage(null);
                    setEditText('');
                  }
                }}
                placeholder={editingMessage ? "Edit message..." : "Message"}
                className={`flex-1 bg-transparent text-[16px] leading-[22px] px-2 py-1.5 outline-none resize-none max-h-[120px] font-normal ${
                  isDark ? 'text-[#e9edef] placeholder-[#8696a0]' : 'text-[#111b21] placeholder-[#667781]'
                } ${fontClass}`}
              />

              {/* Right Icons inside Pill: Paperclip, Rupee (₹), and Camera */}
              <div className="flex items-center gap-0.5 shrink-0 mb-0.5">
                {/* Paperclip Attach Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowAttachMenu((prev) => !prev)}
                    className={`p-1.5 rounded-full transition-colors ${
                      isDark ? 'text-[#8696a0] hover:text-[#d1d7db]' : 'text-[#54656f] hover:text-[#111b21]'
                    }`}
                    title="Attach"
                  >
                    <Paperclip className="w-5 h-5 -rotate-45 stroke-[1.8]" />
                  </button>

                  {/* Attachment Sheet Menu */}
                  {showAttachMenu && (
                    <div className={`absolute bottom-12 right-0 w-72 sm:w-80 rounded-2xl shadow-2xl p-3 z-50 grid grid-cols-3 gap-2.5 text-center border animate-in fade-in zoom-in-95 duration-150 ${
                      isDark ? 'bg-[#1f2c34] border-[#2a3942] text-[#e9edef]' : 'bg-white border-[#e9edef] text-[#111b21]'
                    }`}>
                      {/* Document */}
                      <button
                        onClick={() => {
                          docInputRef.current?.click();
                          setShowAttachMenu(false);
                        }}
                        className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <div className="w-11 h-11 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center shadow-xs">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-medium">Document</span>
                      </button>

                      {/* Photos & Videos Gallery */}
                      <button
                        onClick={() => {
                          fileInputRef.current?.click();
                          setShowAttachMenu(false);
                        }}
                        className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <div className="w-11 h-11 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center shadow-xs">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-medium">Gallery</span>
                      </button>

                      {/* Camera */}
                      <button
                        onClick={() => {
                          cameraInputRef.current?.click();
                          setShowAttachMenu(false);
                        }}
                        className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <div className="w-11 h-11 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center shadow-xs">
                          <Camera className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-medium">Camera</span>
                      </button>

                      {/* Audio Note */}
                      <button
                        onClick={() => {
                          handleStartAudioRecording();
                          setShowAttachMenu(false);
                        }}
                        className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <div className="w-11 h-11 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shadow-xs">
                          <FileAudio className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-medium">Audio</span>
                      </button>

                      {/* Interactive Poll */}
                      <button
                        onClick={() => {
                          setShowPollModal(true);
                          setShowAttachMenu(false);
                        }}
                        className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <div className="w-11 h-11 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-xs">
                          <BarChart2 className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-medium">Poll</span>
                      </button>

                      {/* Location */}
                      <button
                        onClick={() => {
                          setInputText('📍 Shared Location Coordinates: 13.0827° N, 80.2707° E');
                          setShowAttachMenu(false);
                        }}
                        className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <div className="w-11 h-11 rounded-full bg-teal-500/20 text-teal-500 flex items-center justify-center shadow-xs">
                          <span className="text-base">📍</span>
                        </div>
                        <span className="text-[11px] font-medium">Location</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Rupee Currency Icon Button (Shown when not typing) */}
                {!(editingMessage ? editText.trim() : inputText.trim()) && (
                  <button
                    type="button"
                    onClick={() => setShowCoinModal(true)}
                    className={`p-1.5 rounded-full transition-colors ${
                      isDark ? 'text-[#8696a0] hover:text-[#d1d7db]' : 'text-[#54656f] hover:text-[#111b21]'
                    }`}
                    title="Dharya Coins & Tokens (₹)"
                  >
                    <span className="w-5 h-5 rounded-full border-[1.8px] border-current flex items-center justify-center text-[11px] font-bold leading-none">
                      ₹
                    </span>
                  </button>
                )}

                {/* Camera Button (Shown when not typing) */}
                {!(editingMessage ? editText.trim() : inputText.trim()) && (
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className={`p-1.5 rounded-full transition-colors ${
                      isDark ? 'text-[#8696a0] hover:text-[#d1d7db]' : 'text-[#54656f] hover:text-[#111b21]'
                    }`}
                    title="Camera"
                  >
                    <Camera className="w-5 h-5 stroke-[1.8]" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Standalone Circular Green Action Button (Mic / Send) */}
          <button
            type="button"
            onClick={
              editingMessage
                ? handleConfirmEdit
                : inputText.trim()
                ? handleSendText
                : handleStartAudioRecording
            }
            className="w-12 h-12 rounded-full bg-[#00a884] hover:bg-[#029071] text-white flex items-center justify-center shadow-[0_1px_2px_rgba(11,20,26,0.25)] active:scale-95 transition-all shrink-0 cursor-pointer mb-0.5"
            title={editingMessage ? "Save edit" : inputText.trim() ? "Send" : "Hold or tap to Record Voice Note"}
          >
            {editingMessage ? (
              <Check className="w-5 h-5 stroke-[2.5]" />
            ) : inputText.trim() ? (
              <Send className="w-5 h-5 ml-0.5 stroke-[2.2]" />
            ) : (
              <Mic className="w-5 h-5 stroke-[2.2]" />
            )}
          </button>
        </div>

        {/* Android Bottom Navigation Pill */}
        <div className="w-28 h-1 bg-[#cfd8dc] dark:bg-white/20 rounded-full mx-auto mt-2 mb-0.5 select-none pointer-events-none md:hidden" />
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
        </div>
      </main>

      {/* ── MEDIA PREVIEW & SENDER MODAL (Photos & Videos - Supports Multiple Selection & Removals) ── */}
      {mediaModalOpen && pendingMediaList.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
          <div className="relative bg-[#182229] border border-[#2a3942] rounded-3xl p-5 max-w-lg w-full shadow-2xl space-y-4">
            {/* Top Bar with HD, View Once, and Close */}
            {(() => {
              const activeItem = pendingMediaList[activeMediaIndex] || pendingMediaList[0];
              return (
                <>
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

                      {activeItem.type === 'video' && activeItem.duration && (
                        <span className="text-xs text-[#8696a0] px-2 py-0.5 rounded-full bg-white/5 flex items-center gap-1">
                          <Video className="w-3 h-3 text-emerald-400" />
                          <span>{activeItem.duration}</span>
                        </span>
                      )}

                      <span className="text-xs text-[#8696a0] px-2 py-0.5 rounded-full bg-white/5">
                        {activeMediaIndex + 1} of {pendingMediaList.length}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setMediaModalOpen(false);
                        setPendingMediaList([]);
                        setActiveMediaIndex(0);
                      }}
                      className="p-1 rounded-full text-[#8696a0] hover:text-white"
                      title="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Active Media Preview (Video Player or Photo Viewer) */}
                  <div className="rounded-2xl overflow-hidden bg-black/60 max-h-80 flex items-center justify-center relative min-h-[220px]">
                    {activeItem.type === 'video' ? (
                      <video
                        key={activeItem.id}
                        src={activeItem.url}
                        controls
                        autoPlay
                        playsInline
                        className="max-h-80 w-auto rounded-2xl mx-auto"
                      />
                    ) : (
                      <img
                        key={activeItem.id}
                        src={activeItem.url}
                        alt="Media Preview"
                        className="max-h-80 w-auto object-contain rounded-2xl"
                      />
                    )}
                  </div>

                  {/* Multi-Photo Carousel / Thumbnail Strip */}
                  <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 scrollbar-none">
                    {pendingMediaList.map((item, idx) => (
                      <div
                        key={item.id}
                        onClick={() => setActiveMediaIndex(idx)}
                        className={`relative w-14 h-14 rounded-xl overflow-hidden cursor-pointer shrink-0 border-2 transition-all ${
                          idx === activeMediaIndex
                            ? 'border-[#00a884] scale-105 shadow-md ring-2 ring-[#00a884]/40'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        {item.type === 'video' ? (
                          <div className="w-full h-full bg-[#111b21] flex items-center justify-center relative">
                            {item.thumbnailUrl ? (
                              <img src={item.thumbnailUrl} alt="thumb" className="w-full h-full object-cover" />
                            ) : (
                              <Video className="w-5 h-5 text-emerald-400" />
                            )}
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <Play className="w-3.5 h-3.5 text-white fill-current" />
                            </div>
                          </div>
                        ) : (
                          <img src={item.thumbnailUrl || item.url} alt="thumb" className="w-full h-full object-cover" />
                        )}

                        {/* Remove Selected Photo Button before sending */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePendingMedia(item.id);
                          }}
                          className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/80 hover:bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold shadow"
                          title="Remove this photo before sending"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {/* Add More Photos Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-14 h-14 rounded-xl border-2 border-dashed border-[#2a3942] hover:border-[#00a884] text-[#8696a0] hover:text-[#00a884] flex flex-col items-center justify-center shrink-0 transition-colors"
                      title="Select more photos"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="text-[9px] font-bold">Add</span>
                    </button>
                  </div>

                  {/* Upload Progress Bar */}
                  {isUploadingMedia && (
                    <div className="space-y-1">
                      <div className="w-full bg-[#2a3942] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#00a884] h-full transition-all duration-300"
                          style={{ width: `${uploadProgressPct}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-[#8696a0] text-center font-medium">
                        Uploading {uploadProgressPct}%...
                      </p>
                    </div>
                  )}

                  {/* Caption & Send */}
                  <div className="space-y-3 pt-1">
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
                          type="button"
                          onClick={() => {
                            setMediaModalOpen(false);
                            setPendingMediaList([]);
                            setActiveMediaIndex(0);
                          }}
                          className="px-4 py-2 rounded-xl bg-white/5 text-xs text-[#8696a0] hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSendMedia}
                          disabled={isUploadingMedia}
                          className="px-6 py-2 rounded-xl bg-[#00a884] hover:bg-[#029071] disabled:opacity-60 text-white text-xs font-bold shadow flex items-center gap-1.5"
                        >
                          <span>
                            {isUploadingMedia
                              ? `Sending (${uploadProgressPct}%)`
                              : `Send ${pendingMediaList.length > 1 ? `(${pendingMediaList.length})` : ''}`}
                          </span>
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
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

          {/* Center Content with Previous/Next Album Navigation */}
          <div className="flex-1 flex items-center justify-between p-4 overflow-hidden relative">
            {lightboxMedia.allUrls && lightboxMedia.allUrls.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  const urls = lightboxMedia.allUrls!;
                  const cur = lightboxMedia.currentIndex || 0;
                  const prevIdx = (cur - 1 + urls.length) % urls.length;
                  setLightboxMedia({
                    ...lightboxMedia,
                    url: urls[prevIdx],
                    currentIndex: prevIdx,
                  });
                }}
                className="z-20 p-2.5 rounded-full bg-black/60 hover:bg-white/20 text-white backdrop-blur border border-white/10 transition-colors shadow-lg cursor-pointer"
                title="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <div className="flex-1 flex items-center justify-center h-full px-2">
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
                  className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl transition-all duration-200"
                />
              )}
            </div>

            {lightboxMedia.allUrls && lightboxMedia.allUrls.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  const urls = lightboxMedia.allUrls!;
                  const cur = lightboxMedia.currentIndex || 0;
                  const nextIdx = (cur + 1) % urls.length;
                  setLightboxMedia({
                    ...lightboxMedia,
                    url: urls[nextIdx],
                    currentIndex: nextIdx,
                  });
                }}
                className="z-20 p-2.5 rounded-full bg-black/60 hover:bg-white/20 text-white backdrop-blur border border-white/10 transition-colors shadow-lg cursor-pointer"
                title="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
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
              <p className="text-xs text-[#8696a0]">TLS 1.3 Transport Encrypted</p>
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
                  <p className="text-[11px] text-[#8696a0]">TLS 1.3 Transport Encryption &amp; PostgreSQL RLS</p>
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
              {/* Transport & Database Security Verification */}
              <div className="p-4 rounded-2xl bg-[#182229] border border-[#2a3942] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-sm text-white">Transport &amp; Access Architecture</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono text-[10px] font-bold">
                    TLS 1.3 + RLS Active
                  </span>
                </div>

                <p className="text-[11px] text-[#8696a0] leading-relaxed">
                  Real-time communication is protected with TLS 1.3 transport encryption. At rest, PostgreSQL Row-Level Security (RLS) ensures only verified accounts have read and write privileges for active conversations.
                </p>

                {/* Authenticated Participant Fingerprint */}
                <div className="p-3.5 rounded-xl bg-[#0b141a] border border-white/5 font-mono text-center text-xs tracking-wider text-emerald-300 leading-relaxed select-all">
                  CONVERSATION ID: {activeChatId}<br />
                  AUTH SENDER: {currentUser.toUpperCase()} • PEER: {partnerUser.toUpperCase()}<br />
                  SECURITY POLICY: SUPABASE_RLS_V2_ENFORCED
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={handleCopySafetyCode}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{copiedSafetyCode ? 'Copied to Clipboard!' : 'Copy Room Session Fingerprint'}</span>
                  </button>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>RLS Verified</span>
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

            {/* Special Milestone / Date Counter Card */}
            <div
              onClick={() => {
                setShowContactInfo(false);
                setShowDateCountModal(true);
              }}
              className="p-3.5 rounded-2xl bg-rose-950/30 hover:bg-rose-950/50 border border-rose-500/30 text-left cursor-pointer transition-all shadow-inner"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
                  <span>Date Counter • 20 May 2026</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full">
                  7:30
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-rose-500">{dateCount.days}</span>
                <span className="text-xs font-bold text-white">Days</span>
                <span className="text-xs font-mono text-rose-300">
                  {String(dateCount.hours).padStart(2, '0')}h {String(dateCount.minutes).padStart(2, '0')}m {String(dateCount.seconds).padStart(2, '0')}s
                </span>
              </div>
              <p className="text-[10px] text-[#8696a0] mt-1">
                Click to open live ticking counter &amp; milestone statistics
              </p>
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

      {/* ── UNIFIED 10-THEME & WALLPAPER SELECTOR MODAL ── */}
      {(showThemeModal || showWallpaperModal) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className={`border rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col transition-colors ${
            isDark ? 'bg-[#111b21] border-[#2a3942] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between border-b pb-3 shrink-0 ${
              isDark ? 'border-[#2a3942]' : 'border-slate-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">Themes &amp; Wallpapers</h3>
                  <p className={`text-xs ${isDark ? 'text-[#8696a0]' : 'text-slate-500'}`}>
                    Personalize your private 1-on-1 Dharya chat experience
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowThemeModal(false);
                  setShowWallpaperModal(false);
                }}
                className={`p-1.5 rounded-full hover:bg-white/10 transition-colors ${
                  isDark ? 'text-[#8696a0] hover:text-white' : 'text-slate-400 hover:text-slate-800'
                }`}
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className={`flex items-center gap-2 p-1 rounded-xl shrink-0 ${
              isDark ? 'bg-[#202c33]' : 'bg-slate-100'
            }`}>
              <button
                onClick={() => setThemeModalTab('themes')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  themeModalTab === 'themes'
                    ? 'bg-teal-500 text-white shadow-sm'
                    : isDark ? 'text-[#8696a0] hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                10 Color Themes
              </button>
              <button
                onClick={() => setThemeModalTab('wallpapers')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  themeModalTab === 'wallpapers'
                    ? 'bg-teal-500 text-white shadow-sm'
                    : isDark ? 'text-[#8696a0] hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Chat Wallpapers
              </button>
            </div>

            {/* Modal Body / Scrollable Content */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[60vh]">
              {themeModalTab === 'themes' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.values(THEMES).map((th) => {
                    const isCurrent = themeId === th.id;
                    return (
                      <button
                        key={th.id}
                        onClick={() => handleSelectTheme(th.id)}
                        className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                          isCurrent
                            ? 'ring-2 ring-teal-400 border-teal-500 shadow-md scale-[1.01]'
                            : isDark
                            ? 'bg-[#182229] border-[#2a3942] hover:border-slate-500'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-inherit">{th.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-400 font-bold flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Active
                                </span>
                              )}
                            </div>
                            <p className={`text-[11px] line-clamp-1 mt-0.5 ${
                              isDark ? 'text-[#8696a0]' : 'text-slate-500'
                            }`}>
                              {th.description}
                            </p>
                          </div>
                        </div>

                        {/* Theme Miniature Bubble Preview */}
                        <div
                          className="p-2 rounded-xl text-[10px] space-y-1.5 border"
                          style={{
                            backgroundColor: th.bgMain,
                            borderColor: th.border,
                          }}
                        >
                          <div className="flex justify-end">
                            <span
                              className="px-2 py-0.5 rounded-lg max-w-[85%] font-medium"
                              style={{
                                backgroundColor: th.bubbleOutgoing,
                                color: th.bubbleOutgoingText,
                              }}
                            >
                              Hey Surya! 💕
                            </span>
                          </div>
                          <div className="flex justify-start">
                            <span
                              className="px-2 py-0.5 rounded-lg max-w-[85%] font-medium"
                              style={{
                                backgroundColor: th.bubbleIncoming,
                                color: th.bubbleIncomingText,
                              }}
                            >
                              Hello Sadhana! ✨
                            </span>
                          </div>
                        </div>

                        {/* Palette Swatches */}
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20"
                            style={{ backgroundColor: th.accent }}
                            title="Accent Color"
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20"
                            style={{ backgroundColor: th.bubbleOutgoing }}
                            title="Outgoing Bubble"
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20"
                            style={{ backgroundColor: th.bubbleIncoming }}
                            title="Incoming Bubble"
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20"
                            style={{ backgroundColor: th.bgMain }}
                            title="Main Background"
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className={`text-xs ${isDark ? 'text-[#8696a0]' : 'text-slate-600'}`}>
                    Select a background pattern or color tone for the conversation canvas:
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'doodle', label: 'Doodle (Classic)', bg: 'bg-[#0c1317] border-[#00a884]' },
                      { id: 'obsidian', label: 'Obsidian Dark', bg: 'bg-[#0a0f12] border-slate-700' },
                      { id: 'emerald', label: 'Emerald Green', bg: 'bg-[#071a14] border-emerald-800' },
                      { id: 'teal', label: 'Deep Teal', bg: 'bg-[#0b191e] border-teal-800' },
                      { id: 'coffee', label: 'Warm Coffee', bg: 'bg-[#181512] border-amber-900' },
                      { id: 'stars', label: 'Starry Sky', bg: 'bg-[#05070e] border-sky-800' },
                      { id: 'gradient', label: 'Theme Gradient', bg: 'bg-gradient-to-br from-slate-900 to-indigo-950 border-indigo-700' },
                    ].map((wp) => {
                      const isCurrent = activeWallpaper === wp.id;
                      return (
                        <button
                          key={wp.id}
                          onClick={() => {
                            setActiveWallpaper(wp.id);
                            try {
                              localStorage.setItem('whatsapp_custom_wallpaper', wp.id);
                            } catch {}
                            showToast(`Wallpaper set to ${wp.label}`, 'success');
                          }}
                          className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-20 transition-all cursor-pointer ${wp.bg} ${
                            isCurrent
                              ? 'ring-2 ring-emerald-400 scale-[1.02]'
                              : 'hover:border-white/40'
                          }`}
                        >
                          <span className="text-xs font-semibold text-white">{wp.label}</span>
                          {isCurrent && (
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Active
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Wallpaper Upload Button */}
                  <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                    isDark ? 'bg-[#182229] border-[#2a3942]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <h4 className="text-xs font-bold text-inherit">Custom Wallpaper Photo</h4>
                      <p className={`text-[11px] ${isDark ? 'text-[#8696a0]' : 'text-slate-500'}`}>
                        Upload a personal picture or memory as your chat background
                      </p>
                    </div>
                    <input
                      type="file"
                      ref={customWallpaperFileRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          const result = reader.result as string;
                          if (result) {
                            setActiveWallpaper(result);
                            try {
                              localStorage.setItem('whatsapp_custom_wallpaper', result);
                            } catch {}
                            showToast('Custom wallpaper applied!', 'success');
                          }
                        };
                        reader.readAsDataURL(file);
                        e.target.value = '';
                      }}
                    />
                    <button
                      onClick={() => customWallpaperFileRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Images className="w-3.5 h-3.5" />
                      <span>Upload</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`border-t pt-3 flex items-center justify-end shrink-0 ${
              isDark ? 'border-[#2a3942]' : 'border-slate-200'
            }`}>
              <button
                onClick={() => {
                  setShowThemeModal(false);
                  setShowWallpaperModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold transition-all shadow-sm"
              >
                Done
              </button>
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

      {/* ── DHARYA COINS & TOKENS MODAL (₹ FEATURE FROM USER SCREENSHOT) ── */}
      {showCoinModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div
            className={`w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto ${
              isDark ? 'bg-[#1f2c34] text-[#e9edef] border border-[#2a3942]' : 'bg-white text-[#111b21] border border-[#e9edef]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 border-current/10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-lg">
                  🪙
                </div>
                <div>
                  <h3 className="text-base font-bold leading-tight">Dharya Coins & Tokens</h3>
                  <p className="text-xs text-[#8696a0]">Daily couple rewards, tokens & romantic passes</p>
                </div>
              </div>
              <button
                onClick={() => setShowCoinModal(false)}
                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-[#8696a0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Balance & Daily Claim Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                  Your Balance
                </span>
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                  {coinBalance} 🪙
                </span>
              </div>
              <button
                type="button"
                onClick={handleCollectDailyCoins}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <span>Collect +50 🪙</span>
              </button>
            </div>

            {/* Send Romantic Tokens / Passes */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#8696a0] uppercase tracking-wider">
                Send to {partnerName}
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { title: 'Send 50 Coins', cost: 50, icon: '🪙', note: 'Here are 50 coins for you!' },
                  { title: 'Send 100 Coins', cost: 100, icon: '💰', note: 'Super love coin bonus!' },
                  { title: 'Unlimited Hugs Pass', cost: 20, icon: '🤗', note: 'Redeemable anytime, non-expiring!' },
                  { title: 'Coffee / Chai Date', cost: 30, icon: '☕', note: 'I owe you a coffee date!' },
                  { title: 'Movie Night Pass', cost: 40, icon: '🎬', note: 'You pick the movie tonight!' },
                  { title: 'Late Night Pizza', cost: 60, icon: '🍕', note: 'Pizza treat on me!' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendCoinToken(item.title, item.cost, item.note)}
                    className="p-3 rounded-xl border border-current/10 hover:border-[#00a884] hover:bg-[#00a884]/5 transition-all text-left flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono">
                        {item.cost} 🪙
                      </span>
                    </div>
                    <span className="text-xs font-semibold group-hover:text-[#00a884] transition-colors leading-tight">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-[#8696a0] line-clamp-1 mt-0.5">
                      {item.note}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SPECIAL MILESTONE DATE COUNTER MODAL (20 MAY 2026, 7:30) ── */}
      <DateCounterModal
        isOpen={showDateCountModal}
        onClose={() => setShowDateCountModal(false)}
        partnerName={partnerName}
        isDark={isDark}
        onShareToChat={(text) => {
          setInputText(text);
        }}
      />

      {/* ── WHATSAPP DISAPPEARING MESSAGES MODAL (Picture 2) ── */}
      {showDisappearingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-5 border transition-all ${
              isDark ? 'bg-[#1f2c34] text-[#e9edef] border-[#2a3942]' : 'bg-white text-[#111b21] border-[#e9edef]'
            } ${fontClass}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 border-current/10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[#00a884]/20 text-[#00a884] flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#00a884]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold leading-tight">Disappearing messages</h3>
                  <p className="text-xs text-[#8696a0]">Message timer</p>
                </div>
              </div>
              <button
                onClick={() => setShowDisappearingModal(false)}
                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-[#8696a0] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#8696a0] leading-relaxed">
              For more privacy and storage, all new messages will disappear from this chat for everyone after the selected duration.
            </p>

            {/* Radio Options */}
            <div className="space-y-1.5">
              {[
                { label: '24 hours', value: '24h' },
                { label: '7 days', value: '7d' },
                { label: '90 days', value: '90d' },
                { label: 'Off', value: 'off' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  onClick={() => handleSetDisappearingTimer(opt.value as any)}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-colors ${
                    disappearingTimer === opt.value
                      ? 'bg-[#00a884]/15 text-[#00a884] font-semibold'
                      : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80'
                  }`}
                >
                  <span className="text-[15px]">{opt.label}</span>
                  <input
                    type="radio"
                    name="disappearingTimer"
                    value={opt.value}
                    checked={disappearingTimer === opt.value}
                    onChange={() => handleSetDisappearingTimer(opt.value as any)}
                    className="accent-[#00a884] w-4 h-4 cursor-pointer"
                  />
                </label>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowDisappearingModal(false)}
                className="px-5 py-2 rounded-xl bg-[#00a884] hover:bg-[#008f6f] text-white text-sm font-semibold transition-colors cursor-pointer shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── WHATSAPP CLEAR CHAT CONFIRMATION MODAL (Sub-menu Picture 3) ── */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 border transition-all ${
              isDark ? 'bg-[#1f2c34] text-[#e9edef] border-[#2a3942]' : 'bg-white text-[#111b21] border-[#e9edef]'
            } ${fontClass}`}
          >
            <h3 className="text-lg font-semibold leading-tight">Clear this chat?</h3>
            <p className="text-sm text-[#8696a0] leading-relaxed">
              Messages will be permanently cleared from this chat for everyone. This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowClearConfirm(false);
                  handleClearAllChat(true);
                }}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-colors cursor-pointer shadow-sm"
              >
                Clear chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MESSAGE DELETE CONFIRMATION DIALOG ── */}
      {deleteDialogMsg && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-2xl border p-5 sm:p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150 ${
            isDark ? 'bg-[#181c1b] border-[#2b332e] text-[#ECEEEB]' : 'bg-white border-[#E5DFD5] text-[#1F2421]'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Delete Message?</h3>
                <p className="text-xs text-[#808B84]">
                  Deleted messages are moved to your Recycle Bin so they can be restored later or permanently removed.
                </p>
              </div>
            </div>

            {deleteDialogMsg.text && (
              <div className={`p-3 rounded-xl text-xs line-clamp-2 italic border ${
                isDark ? 'bg-[#131615] border-[#232926] text-[#959E98]' : 'bg-[#F7F5F2] border-[#E5DFD5] text-[#555E58]'
              }`}>
                &ldquo;{deleteDialogMsg.text}&rdquo;
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteDialogMsg(null)}
                className={`px-4 py-2 rounded-xl text-xs font-medium border transition-colors ${
                  isDark ? 'border-[#2b332e] text-[#959E98] hover:bg-white/5' : 'border-[#E5DFD5] text-[#555E58] hover:bg-black/5'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteMessage(deleteDialogMsg.id, 'for-me')}
                className={`px-4 py-2 rounded-xl text-xs font-medium border transition-colors ${
                  isDark ? 'border-[#2b332e] hover:bg-white/5 text-[#ECEEEB]' : 'border-[#E5DFD5] hover:bg-black/5 text-[#1F2421]'
                }`}
              >
                Delete for Me
              </button>
              {deleteDialogMsg.sender === currentUser && (
                <button
                  type="button"
                  onClick={() => handleDeleteMessage(deleteDialogMsg.id, 'for-everyone')}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors"
                >
                  Delete for Everyone
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── COLLAPSIBLE RIGHT SIDE PANEL ── */}
      {sidePanelMode !== 'none' && (
        <ChatSidePanel
          mode={sidePanelMode}
          onClose={() => setSidePanelMode('none')}
          isDark={isDark}
          activeTheme={activeTheme}
          partnerName={partnerName}
          partnerUser={partnerUser}
          currentUser={currentUser}
          isPartnerOnline={isPartnerOnline}
          partnerLastSeen={partnerLastSeen}
          messages={messages}
          onJumpToMessage={(id) => {
            jumpToMessage(id);
            if (isMobileScreen) setSidePanelMode('none');
          }}
          onOpenLightbox={(url, type) => {
            setLightboxMedia({
              url,
              type,
              sender: partnerUser,
              time: 'Now',
            });
          }}
          onToggleStar={handleToggleStarMessage}
          onOpenDateCount={() => setShowDateCountModal(true)}
          dateCount={dateCount}
          onSelectTheme={handleSelectTheme}
          soundEnabled={soundEnabled}
          onToggleSound={() => {
            setSoundEnabled((prev) => {
              const next = !prev;
              localStorage.setItem('dharya_sound_enabled', String(next));
              return next;
            });
          }}
          browserNotificationsEnabled={browserNotificationsEnabled}
          onRequestBrowserNotifications={() => {
            if (typeof Notification !== 'undefined') {
              Notification.requestPermission().then((perm) => {
                const granted = perm === 'granted';
                setBrowserNotificationsEnabled(granted);
                showToast(granted ? 'Browser notifications enabled!' : 'Permission denied.', granted ? 'success' : 'info');
              });
            }
          }}
          hideNotificationPreview={hideNotificationPreview}
          onToggleHidePreview={() => {
            setHideNotificationPreview((prev) => {
              const next = !prev;
              localStorage.setItem('dharya_hide_notification_preview', String(next));
              return next;
            });
          }}
          isMuted={isConversationMuted}
          onToggleMute={() => {
            setIsConversationMuted((prev) => {
              const next = !prev;
              localStorage.setItem('dharya_chat_muted', String(next));
              showToast(next ? 'Conversation muted.' : 'Conversation unmuted.', 'info');
              return next;
            });
          }}
          readReceiptsEnabled={readReceiptsEnabled}
          onToggleReadReceipts={handleToggleReadReceipts}
          shareLastSeen={shareLastSeen}
          onToggleShareLastSeen={() => {
            setShareLastSeen((prev) => {
              const next = !prev;
              localStorage.setItem('whatsapp_share_last_seen', String(next));
              return next;
            });
          }}
          onLogout={logoutChat}
          onOpenRecycleBinFull={() => {
            setActiveMainView('recycle');
            setSidePanelMode('none');
          }}
        />
      )}

      {/* ── AI SMART NOTIFICATION CENTER MODAL ── */}
      <NotificationCenterModal
        isOpen={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
        onSelectNotification={(notif) => {
          if (notif.chatId && notif.chatId !== activeChatId) {
            handleSelectConversation(notif.chatId);
          }
        }}
        isDark={isDark}
      />
    </div>
  );
};
