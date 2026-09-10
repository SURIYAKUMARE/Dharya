import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { getSupabase, ChatMessage, LOCAL_MESSAGES_KEY } from '../../services/supabaseClient';
import {
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
  ShieldCheck,
  Image as ImageIcon,
  FileText,
  Trash2,
  X,
  Play,
  Pause,
  Eye,
  FileAudio,
  HardDrive,
  Filter,
  Volume2,
  Clock,
  ChevronDown
} from 'lucide-react';

interface ExtendedChatMessage extends ChatMessage {
  isHd?: boolean;
  isViewOnce?: boolean;
  isOpened?: boolean;
  transcript?: string;
  isPinned?: boolean;
  fileSizeKb?: number;
}

export const WhatsAppChatView: React.FC = () => {
  const { student, logoutChat, switchTab } = useStudyApp();

  // Active user and partner details
  const currentUser: 'surya' | 'sadhana' = student?.username === 'sadhana' ? 'sadhana' : 'surya';
  const partnerUser: 'surya' | 'sadhana' = currentUser === 'surya' ? 'sadhana' : 'surya';
  const partnerName = partnerUser === 'sadhana' ? 'Sadhana' : 'Surya';

  // Seed default messages if storage is empty
  const initialMessages: ExtendedChatMessage[] = [
    {
      id: 'msg-seed-1',
      sender: 'sadhana',
      text: 'Hey Surya! Are you reviewing the engineering notes?',
      time: '10:14 AM',
      timestamp: Date.now() - 1000 * 60 * 60 * 3,
      read: true,
      type: 'text',
    },
    {
      id: 'msg-seed-2',
      sender: 'surya',
      text: 'Hey Sadhana! Yes, going through integration and matrix proofs right now.',
      time: '10:15 AM',
      timestamp: Date.now() - 1000 * 60 * 60 * 2.8,
      read: true,
      type: 'text',
    },
    {
      id: 'msg-seed-3',
      sender: 'sadhana',
      text: 'Awesome! Let me know if you need any derivations explained.',
      time: '10:16 AM',
      timestamp: Date.now() - 1000 * 60 * 60 * 2.5,
      read: true,
      type: 'text',
      isPinned: true,
    },
  ];

  const [messages, setMessages] = useState<ExtendedChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_MESSAGES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialMessages;
  });

  const [inputText, setInputText] = useState('');
  const [partnerStatus, setPartnerStatus] = useState<'online' | 'typing...'>('online');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [showChatLists, setShowChatLists] = useState(false);
  const [chatFilter, setChatFilter] = useState<'all' | 'unread' | 'favorites' | 'groups'>('all');
  const [showCallModal, setShowCallModal] = useState<'audio' | 'video' | null>(null);

  // Advanced Privacy Toggle
  const [advancedPrivacy, setAdvancedPrivacy] = useState<boolean>(() => {
    try {
      return localStorage.getItem('studyportal_privacy_toggle') === 'true';
    } catch {
      return false;
    }
  });

  // HD Photo state
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [isHdSelected, setIsHdSelected] = useState(false);
  const [isViewOnceSelected, setIsViewOnceSelected] = useState(false);

  // Audio recording simulation state
  const [isPlayingAudioId, setIsPlayingAudioId] = useState<string | null>(null);
  const [showTranscriptIds, setShowTranscriptIds] = useState<Record<string, boolean>>({});

  // Active reaction popover message id
  const [reactionBubbleId, setReactionBubbleId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Save messages to localStorage and broadcast
  const persistMessages = (newMessages: ExtendedChatMessage[]) => {
    setMessages(newMessages);
    try {
      localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(newMessages));
    } catch {}
  };

  // Sync cross-tab messages
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

  // Supabase Realtime channel setup
  useEffect(() => {
    try {
      const supabase = getSupabase();
      const channel = supabase
        .channel('whatsapp-one-on-one-room')
        .on('broadcast', { event: 'new_message' }, (payload) => {
          if (payload?.payload) {
            const incoming = payload.payload as ExtendedChatMessage;
            setMessages((prev) => {
              if (prev.some((m) => m.id === incoming.id)) return prev;
              const next = [...prev, incoming];
              localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(next));
              return next;
            });
          }
        })
        .on('broadcast', { event: 'reaction' }, (payload) => {
          if (payload?.payload) {
            const { msgId, emoji, user } = payload.payload;
            handleApplyReaction(msgId, emoji, user, false);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {}
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send a Text Message
  const handleSendText = () => {
    const text = inputText.trim();
    if (!text) return;

    const newMsg: ExtendedChatMessage = {
      id: 'msg-' + Date.now(),
      sender: currentUser,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      read: true,
      type: 'text',
      fileSizeKb: Math.max(1, Math.round(text.length * 0.05)),
    };

    const next = [...messages, newMsg];
    persistMessages(next);
    setInputText('');

    // Broadcast over Supabase Realtime
    try {
      getSupabase().channel('whatsapp-one-on-one-room').send({
        type: 'broadcast',
        event: 'new_message',
        payload: newMsg,
      });
    } catch {}
  };

  // Send a Photo (Standard or HD)
  const handleSendPhoto = () => {
    if (!photoUrl) return;

    const newMsg: ExtendedChatMessage = {
      id: 'msg-img-' + Date.now(),
      sender: currentUser,
      text: photoCaption.trim() || (isHdSelected ? 'High Definition Photo' : 'Photo'),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      read: true,
      type: 'image',
      mediaUrl: photoUrl,
      isHd: isHdSelected,
      isViewOnce: isViewOnceSelected,
      isOpened: false,
      fileSizeKb: isHdSelected ? 2450 : 420,
    };

    const next = [...messages, newMsg];
    persistMessages(next);
    setPhotoModalOpen(false);
    setPhotoUrl('');
    setPhotoCaption('');
    setIsHdSelected(false);
    setIsViewOnceSelected(false);

    try {
      getSupabase().channel('whatsapp-one-on-one-room').send({
        type: 'broadcast',
        event: 'new_message',
        payload: newMsg,
      });
    } catch {}
  };

  // Send a Voice Note with Transcript & View-Once support
  const handleSendVoiceNote = () => {
    const transcriptsList = [
      "Hey! Let me know once you finish reviewing the calculus chapter! 🎧",
      "I just completed the practice MCQs, the concepts are crystal clear now!",
      "Are you available for a quick study session this evening? 📚",
    ];
    const randomTranscript = transcriptsList[Math.floor(Math.random() * transcriptsList.length)];

    const newMsg: ExtendedChatMessage = {
      id: 'msg-voice-' + Date.now(),
      sender: currentUser,
      text: 'Voice Note (0:12)',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      read: true,
      type: 'voice',
      transcript: randomTranscript,
      isViewOnce: false,
      isOpened: false,
      fileSizeKb: 680,
    };

    const next = [...messages, newMsg];
    persistMessages(next);

    try {
      getSupabase().channel('whatsapp-one-on-one-room').send({
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
    setMessages((prev) => {
      const updated = prev.map((m) => {
        if (m.id !== msgId) return m;
        const currentReactions = m.reactions || {};
        const usersForEmoji = currentReactions[emoji] || [];
        const nextUsers = usersForEmoji.includes(user)
          ? usersForEmoji.filter((u) => u !== user)
          : [...usersForEmoji, user];

        return {
          ...m,
          reactions: {
            ...currentReactions,
            [emoji]: nextUsers,
          },
        };
      });
      localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(updated));
      return updated;
    });

    setReactionBubbleId(null);

    if (broadcast) {
      try {
        getSupabase().channel('whatsapp-one-on-one-room').send({
          type: 'broadcast',
          event: 'reaction',
          payload: { msgId, emoji, user },
        });
      } catch {}
    }
  };

  // Pin Message (Up to 3)
  const handleTogglePin = (msgId: string) => {
    setMessages((prev) => {
      const target = prev.find((m) => m.id === msgId);
      if (!target) return prev;

      const currentlyPinned = prev.filter((m) => m.isPinned);
      if (!target.isPinned && currentlyPinned.length >= 3) {
        alert('You can pin up to 3 messages to the top of any chat.');
        return prev;
      }

      const next = prev.map((m) => (m.id === msgId ? { ...m, isPinned: !m.isPinned } : m));
      localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Delete message
  const handleDeleteMessage = (msgId: string) => {
    const next = messages.filter((m) => m.id !== msgId);
    persistMessages(next);
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

  // Text formatting parser (*bold*, _italic_, ~strike~, `code`)
  const renderFormattedText = (content: string) => {
    const boldRegex = /\*([^*]+)\*/g;
    const italicRegex = /_([^_]+)_/g;
    const strikeRegex = /~([^~]+)~/g;
    const codeRegex = /`([^`]+)`/g;

    let parts: (string | React.ReactNode)[] = [content];

    // Bold
    parts = parts.flatMap((part) => {
      if (typeof part !== 'string') return part;
      const subParts = part.split(boldRegex);
      return subParts.map((sub, i) => (i % 2 === 1 ? <strong key={'b-' + i}>{sub}</strong> : sub));
    });

    // Italic
    parts = parts.flatMap((part) => {
      if (typeof part !== 'string') return part;
      const subParts = part.split(italicRegex);
      return subParts.map((sub, i) => (i % 2 === 1 ? <em key={'i-' + i}>{sub}</em> : sub));
    });

    // Strikethrough
    parts = parts.flatMap((part) => {
      if (typeof part !== 'string') return part;
      const subParts = part.split(strikeRegex);
      return subParts.map((sub, i) => (i % 2 === 1 ? <del key={'s-' + i}>{sub}</del> : sub));
    });

    // Monospace code
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

    return <>{parts}</>;
  };

  // Filtered messages if search is active
  const displayedMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase();
    return messages.filter((m) => m.text.toLowerCase().includes(q) || m.transcript?.toLowerCase().includes(q));
  }, [messages, searchQuery]);

  return (
    <div className="max-w-4xl mx-auto w-full h-[88vh] flex flex-col rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0b141a] text-[#e9edef] select-none">
      {/* ── 1. WHATSAPP HEADER ── */}
      <div className="bg-[#1f2c34] px-4 py-2.5 flex items-center justify-between border-b border-[#2a3942] z-30 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Back to Study Portal Button */}
          <button
            onClick={() => switchTab('home')}
            className="p-1.5 -ml-1 rounded-full hover:bg-white/10 text-[#aebac1] hover:text-white transition-colors flex items-center gap-1"
            title="Back to Study Portal"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Contact Avatar */}
          <div
            onClick={() => setShowContactInfo(true)}
            className="relative cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold shadow"
          >
            <span>{partnerName[0]}</span>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#1f2c34]" />
          </div>

          {/* Contact Name & Status */}
          <div onClick={() => setShowContactInfo(true)} className="cursor-pointer">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white tracking-tight">{partnerName}</h2>
              {advancedPrivacy && (
                <span title="Advanced Chat Privacy Enabled">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#00a884] font-medium">{partnerStatus}</p>
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2 text-[#aebac1]">
          {/* Chat Lists & Filters Button */}
          <button
            onClick={() => setShowChatLists(true)}
            className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors"
            title="Chat Lists & Filters"
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
              <div className="absolute right-0 top-10 w-52 bg-[#233138] border border-[#2a3942] rounded-xl shadow-2xl py-1.5 z-50 text-xs text-[#d1d7db]">
                <button
                  onClick={() => {
                    setShowContactInfo(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#182229] transition-colors"
                >
                  Contact Info
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
                <div className="h-px bg-white/10 my-1" />
                <button
                  onClick={() => {
                    if (confirm('Clear chat history?')) {
                      persistMessages([]);
                    }
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[#182229] text-rose-400 transition-colors"
                >
                  Clear chat
                </button>
                <button
                  onClick={() => {
                    logoutChat();
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
        className="flex-1 overflow-y-auto p-4 space-y-3 relative"
        style={{
          backgroundColor: '#0b141a',
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* End-to-End Encryption Banner */}
        <div className="mx-auto max-w-sm p-3 rounded-xl bg-[#182229] border border-[#ffb800]/20 text-center shadow-lg my-2">
          <div className="flex items-center justify-center gap-1.5 text-[#ffd279] text-xs font-semibold mb-0.5">
            <Lock className="w-3.5 h-3.5" />
            <span>End-to-End Encrypted</span>
          </div>
          <p className="text-[11px] text-[#8696a0] leading-tight">
            Messages and calls are end-to-end encrypted. No one outside of this chat can read or listen to them.
          </p>
        </div>

        {/* Date Divider */}
        <div className="flex justify-center my-3">
          <span className="px-3 py-1 rounded-lg bg-[#182229] text-[11px] font-medium text-[#8696a0] shadow-sm uppercase tracking-wider">
            Today
          </span>
        </div>

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
              {/* Message Bubble */}
              <div
                className={`relative max-w-[85%] sm:max-w-[70%] rounded-2xl px-3.5 py-2 shadow-md transition-all ${
                  isMe
                    ? 'bg-[#005c4b] text-white rounded-tr-none'
                    : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
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

                {/* ── IMAGE MESSAGE ── */}
                {msg.type === 'image' && (
                  <div className="space-y-1.5 mb-1">
                    <div className="relative rounded-xl overflow-hidden bg-black/40 max-h-72">
                      <img
                        src={msg.mediaUrl}
                        alt="Photo"
                        className="w-full h-auto object-cover rounded-xl"
                      />
                      {/* HD Badge Overlay */}
                      {msg.isHd && (
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur border border-white/20 text-[9px] font-black tracking-widest text-white flex items-center gap-0.5">
                          <span>HD</span>
                        </div>
                      )}
                      {/* View Once indicator */}
                      {msg.isViewOnce && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-600/90 text-white flex items-center justify-center font-bold text-xs shadow">
                          ①
                        </div>
                      )}
                    </div>
                    {msg.text && (
                      <p className="text-sm leading-relaxed text-white">
                        {renderFormattedText(msg.text)}
                      </p>
                    )}
                  </div>
                )}

                {/* ── VOICE NOTE MESSAGE ── */}
                {msg.type === 'voice' && (
                  <div className="space-y-2 py-1 min-w-[220px]">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setIsPlayingAudioId(isPlayingAudioId === msg.id ? null : msg.id)
                        }
                        className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow flex-shrink-0 transition-transform hover:scale-105 active:scale-95"
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
                        <div className="flex justify-between text-[10px] text-white/70 font-mono">
                          <span>0:12</span>
                          <span>Voice Note</span>
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
                  <p className="text-sm leading-relaxed break-words">
                    {renderFormattedText(msg.text)}
                  </p>
                )}

                {/* Bubble Footer: Timestamp & Checkmarks */}
                <div className="flex items-center justify-end gap-1 mt-1 -mb-0.5 text-[10px] text-white/70 select-none">
                  <span>{msg.time}</span>
                  {isMe && (
                    <span className="text-sky-300">
                      <CheckCheck className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                {/* Reaction Counter Pill */}
                {totalReactions > 0 && (
                  <div className="absolute -bottom-2 right-2 bg-[#233138] border border-white/10 rounded-full px-1.5 py-0.5 shadow-md flex items-center gap-1 text-xs">
                    {Object.entries(reactions).map(([emoji, users]) =>
                      users.length > 0 ? <span key={emoji}>{emoji}</span> : null
                    )}
                    <span className="text-[10px] text-white/80 font-bold">{totalReactions}</span>
                  </div>
                )}
              </div>

              {/* Message Context Controls (Pin, React, Delete) */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 px-1 text-xs text-[#8696a0]">
                <button
                  onClick={() => setReactionBubbleId(reactionBubbleId === msg.id ? null : msg.id)}
                  className="p-1 hover:text-white"
                  title="React"
                >
                  <Smile className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleTogglePin(msg.id)}
                  className={`p-1 hover:text-white ${msg.isPinned ? 'text-amber-400' : ''}`}
                  title={msg.isPinned ? 'Unpin message' : 'Pin message (up to 3)'}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteMessage(msg.id)}
                  className="p-1 hover:text-rose-400"
                  title="Delete message"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Expanded Emoji Reactions Popover */}
              {reactionBubbleId === msg.id && (
                <div className="absolute z-30 -top-10 bg-[#233138] border border-[#2a3942] rounded-full p-1 shadow-2xl flex items-center gap-1 text-lg">
                  {['❤️', '👍', '😂', '😮', '😢', '🙏', '🔥', '✨'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleApplyReaction(msg.id, emoji)}
                      className="hover:scale-125 transition-transform p-1"
                    >
                      {emoji}
                    </button>
                  ))}
                  <button
                    onClick={() => setReactionBubbleId(null)}
                    className="text-xs text-[#8696a0] hover:text-white px-1.5"
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

      {/* ── 4. BOTTOM INPUT BAR (WHATSAPP STYLED) ── */}
      <div className="bg-[#1f2c34] px-3 py-2 flex items-center gap-2 border-t border-[#2a3942] z-30 flex-shrink-0 relative">
        {/* Emoji Button */}
        <button
          onClick={() => setInputText((prev) => prev + ' 😊 ')}
          className="p-2 text-[#8696a0] hover:text-white rounded-full hover:bg-white/5 transition-colors"
          title="Emojis"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Paperclip Attach Button */}
        <div className="relative">
          <button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="p-2 text-[#8696a0] hover:text-white rounded-full hover:bg-white/5 transition-colors"
            title="Attach"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* WhatsApp Attachment Sheet */}
          {showAttachMenu && (
            <div className="absolute bottom-12 left-0 w-64 bg-[#233138] border border-[#2a3942] rounded-2xl shadow-2xl p-3 z-50 grid grid-cols-3 gap-3 text-center">
              <button
                onClick={() => {
                  setPhotoUrl(
                    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'
                  );
                  setPhotoModalOpen(true);
                  setShowAttachMenu(false);
                }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/5 text-[#d1d7db]"
              >
                <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <span className="text-[10px]">Photos &amp; HD</span>
              </button>

              <button
                onClick={() => {
                  handleSendVoiceNote();
                  setShowAttachMenu(false);
                }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/5 text-[#d1d7db]"
              >
                <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center shadow">
                  <FileAudio className="w-5 h-5" />
                </div>
                <span className="text-[10px]">Audio Note</span>
              </button>

              <button
                onClick={() => {
                  setInputText('📍 Shared Engineering Library Coordinates: 13.0827° N, 80.2707° E');
                  setShowAttachMenu(false);
                }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/5 text-[#d1d7db]"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow">
                  <span className="text-sm">📍</span>
                </div>
                <span className="text-[10px]">Location</span>
              </button>
            </div>
          )}
        </div>

        {/* Input Pill */}
        <div className="flex-1 bg-[#2a3942] rounded-xl px-4 py-2 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendText();
            }}
            placeholder="Type a message (*bold*, _italic_, ~strike~)"
            className="w-full bg-transparent text-sm text-white placeholder-[#8696a0] focus:outline-none"
          />
        </div>

        {/* Mic / Send Button */}
        {inputText.trim() ? (
          <button
            onClick={handleSendText}
            className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#029071] text-white flex items-center justify-center shadow transition-transform hover:scale-105 active:scale-95 flex-shrink-0"
            title="Send"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        ) : (
          <button
            onClick={handleSendVoiceNote}
            className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#029071] text-white flex items-center justify-center shadow transition-transform hover:scale-105 active:scale-95 flex-shrink-0"
            title="Record Voice Note"
          >
            <Mic className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── HD PHOTO PREVIEW & SENDER MODAL ── */}
      {photoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-[#182229] border border-[#2a3942] rounded-3xl p-5 max-w-lg w-full shadow-2xl space-y-4">
            {/* Top Bar with HD Toggle */}
            <div className="flex items-center justify-between border-b border-[#2a3942] pb-3">
              <div className="flex items-center gap-2">
                {/* Standard or HD Photo Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsHdSelected(!isHdSelected)}
                  className={`px-3 py-1 rounded-full text-xs font-black tracking-wider transition-all flex items-center gap-1.5 border ${
                    isHdSelected
                      ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                      : 'bg-white/5 text-[#8696a0] border-white/10 hover:text-white'
                  }`}
                >
                  <span>HD</span>
                  <span className="text-[10px] font-normal">
                    {isHdSelected ? 'High Resolution' : 'Standard'}
                  </span>
                </button>

                {/* View Once Toggle */}
                <button
                  type="button"
                  onClick={() => setIsViewOnceSelected(!isViewOnceSelected)}
                  className={`w-7 h-7 rounded-full text-xs font-bold transition-all flex items-center justify-center border ${
                    isViewOnceSelected
                      ? 'bg-emerald-500 text-white border-emerald-400 shadow'
                      : 'bg-white/5 text-[#8696a0] border-white/10 hover:text-white'
                  }`}
                  title="View Once"
                >
                  ①
                </button>
              </div>

              <button
                onClick={() => setPhotoModalOpen(false)}
                className="p-1 rounded-full text-[#8696a0] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Preview */}
            <div className="rounded-2xl overflow-hidden bg-black/50 max-h-80 flex items-center justify-center">
              <img src={photoUrl} alt="Preview" className="max-h-80 w-auto object-contain" />
            </div>

            {/* Caption & Send */}
            <div className="space-y-3">
              <input
                type="text"
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
                placeholder="Add a caption..."
                className="w-full bg-[#2a3942] text-sm text-white px-4 py-2.5 rounded-xl border border-transparent focus:outline-none focus:border-[#00a884]"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setPhotoModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-xs text-[#8696a0] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendPhoto}
                  className="px-6 py-2 rounded-xl bg-[#00a884] hover:bg-[#029071] text-white text-xs font-bold shadow flex items-center gap-1.5"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
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

      {/* ── CALL SIMULATION MODAL ── */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 bg-[#0b141a]/95 flex flex-col items-center justify-between p-8 text-center">
          <div className="pt-12 space-y-2">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-4xl flex items-center justify-center mx-auto shadow-2xl animate-pulse">
              {partnerName[0]}
            </div>
            <h2 className="text-2xl font-bold text-white">{partnerName}</h2>
            <p className="text-sm text-emerald-400 font-medium capitalize">
              WhatsApp {showCallModal} Call • End-to-End Encrypted
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setShowCallModal(null)}
              className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-2xl mx-auto hover:scale-105 active:scale-95 transition-transform"
            >
              <Phone className="w-7 h-7 rotate-[135deg]" />
            </button>
            <p className="text-xs text-[#8696a0]">Tap red button to end call</p>
          </div>
        </div>
      )}
    </div>
  );
};
