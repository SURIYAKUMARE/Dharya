import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMaskedFeature } from '../../hooks/useMaskedFeature';
import { getSupabase, ChatMessage, LOCAL_MESSAGES_KEY } from '../../services/supabaseClient';
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  Check,
  CheckCheck,
  Shield,
  GraduationCap,
  Sparkles,
  Image as ImageIcon,
  Lock,
  Volume2
} from 'lucide-react';

export const CourseDiscussion: React.FC = () => {
  const { currentUser, isAuthenticated, secretMode } = useAuth();
  const { isMasked, title, description } = useMaskedFeature('discuss');

  // Screenshot Disguise Toggle (Camouflage as professor-student discussion)
  const [professorCamouflage, setProfessorCamouflage] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_MESSAGES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Professor Camouflage Fake Messages
  const professorMessages = [
    {
      id: 'p1',
      sender: 'professor',
      text: 'Good morning. Please ensure you have verified the characteristic equation det(A - λI) = 0 for Module 2.',
      time: '09:00 AM',
      read: true,
    },
    {
      id: 'p2',
      sender: 'student',
      text: 'Yes Professor Ramesh, the eigenvalues calculate to λ₁=2 and λ₂=5 as indicated in the syllabus.',
      time: '09:05 AM',
      read: true,
    },
    {
      id: 'p3',
      sender: 'professor',
      text: 'Excellent. Submit your orthogonal projection derivations to the portal before Friday 5:00 PM.',
      time: '09:12 AM',
      read: true,
    },
  ];

  // Supabase Realtime Subscription
  useEffect(() => {
    if (!isAuthenticated) return;
    const supabase = getSupabase();
    const channel = supabase.channel('dharya-realtime-room');

    channel
      .on('broadcast', { event: 'new-message' }, ({ payload }) => {
        if (payload && payload.id) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.id)) return prev;
            const updated = [...prev, payload];
            localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(updated));
            return updated;
          });
        }
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload && payload.sender !== currentUser?.id) {
          setPartnerTyping(payload.isTyping);
          if (payload.isTyping) {
            setTimeout(() => setPartnerTyping(false), 3500);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping, professorCamouflage]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !currentUser) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: currentUser.id,
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      read: true,
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(updated));
    setInputText('');

    // Broadcast via Supabase
    try {
      const supabase = getSupabase();
      supabase.channel('dharya-realtime-room').send({
        type: 'broadcast',
        event: 'new-message',
        payload: newMsg,
      });
    } catch {
      // safe fallback
    }
  };

  const handleTyping = (text: string) => {
    setInputText(text);
    if (!isTyping && currentUser) {
      setIsTyping(true);
      try {
        getSupabase().channel('dharya-realtime-room').send({
          type: 'broadcast',
          event: 'typing',
          payload: { sender: currentUser.id, isTyping: true },
        });
      } catch {}
      setTimeout(() => setIsTyping(false), 2000);
    }
  };

  const handleAddReaction = (msgId: string, emoji: string) => {
    if (!currentUser) return;
    const updated = messages.map((m) => {
      if (m.id !== msgId) return m;
      const reactions = { ...(m.reactions || {}) };
      const currentList = reactions[emoji] || [];
      if (currentList.includes(currentUser.id)) {
        reactions[emoji] = currentList.filter((u) => u !== currentUser.id);
      } else {
        reactions[emoji] = [...currentList, currentUser.id];
      }
      return { ...m, reactions };
    });
    setMessages(updated);
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(updated));
  };

  // If unauthenticated, show the public course discussion thread
  if (isMasked && !isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto py-12 px-4 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2 shadow-lg shadow-emerald-500/10">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Course Discussion Thread</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          This thread requires institutional authorization. Log in with your verified Student ID to participate in real-time academic discussions.
        </p>
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-left font-mono text-xs text-slate-400 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span>COURSE: ENGR-301</span>
            <span>RESTRICTED</span>
          </div>
          <p>Prof. Ramesh: "Eigenvalue solutions for Question 4 have been posted in the portal repository."</p>
        </div>
      </div>
    );
  }

  // Active view (Authenticated or Camouflaged)
  const isCamouflaged = professorCamouflage || !isAuthenticated;
  const partnerName = currentUser?.partnerName || 'Partner';
  const partnerEmoji = currentUser?.partnerEmoji || '❤️';

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full bg-[#0d091a]/85 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
      {/* Discussion Header */}
      <div className="px-5 py-3.5 bg-white/5 border-b border-white/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow-md border border-white/20"
            style={{
              backgroundColor: isCamouflaged ? '#2563eb' : currentUser?.accentColor || '#10b981',
            }}
          >
            {isCamouflaged ? 'PR' : partnerEmoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">
                {isCamouflaged ? 'Prof. Ramesh (Course Instructor)' : `${partnerName} ${partnerEmoji}`}
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            </div>
            <p className="text-[11px] text-slate-400">
              {isCamouflaged
                ? 'Applied Mathematics & Engineering Computing • Active'
                : partnerTyping
                ? `${partnerName} is typing…`
                : 'Online • In private space'}
            </p>
          </div>
        </div>

        {/* Screenshot Disguise Camouflage Button */}
        <button
          onClick={() => setProfessorCamouflage(!professorCamouflage)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
            professorCamouflage
              ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
          title="Toggle Professor Disguise (Makes screen look like course homework help if screenshotted)"
        >
          <Shield className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {professorCamouflage ? 'Professor Camouflage ON' : 'Screenshot Camouflage'}
          </span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-[420px] max-h-[560px]">
        <div className="text-center">
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-400 uppercase tracking-wider font-mono">
            {isCamouflaged ? 'COURSE DISCUSSION ARCHIVE' : 'END-TO-END PRIVATE SPACE ✦ SURYA & SADHANA'}
          </span>
        </div>

        {isCamouflaged ? (
          // Render Professor Fake Thread
          professorMessages.map((msg) => {
            const isMe = msg.sender === 'student';
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-md ${
                    isMe
                      ? 'bg-blue-600/30 border border-blue-500/40 text-blue-100 rounded-tr-xs'
                      : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-xs'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400 font-mono">
                    <span>{msg.time}</span>
                    <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          // Render Real WhatsApp-Accurate Messages
          messages.map((msg) => {
            const isMe = msg.sender === currentUser?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group relative`}>
                <div
                  className={`relative max-w-[85%] sm:max-w-[72%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-lg ${
                    isMe
                      ? currentUser?.id === 'surya'
                        ? 'bg-emerald-600/35 border border-emerald-500/40 text-emerald-100 rounded-tr-xs'
                        : 'bg-rose-600/35 border border-rose-500/40 text-rose-100 rounded-tr-xs'
                      : 'bg-white/10 border border-white/15 text-slate-100 rounded-tl-xs'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  <div className="flex items-center justify-end gap-1.5 mt-1 text-[10px] text-slate-300 font-mono">
                    <span>{msg.time}</span>
                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-sky-400" />}
                  </div>

                  {/* Reaction Badges */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="absolute -bottom-2.5 right-2 flex items-center gap-1 bg-[#0A0A0F]/90 border border-white/20 rounded-full px-1.5 py-0.5 text-[10px] shadow-sm">
                      {Object.entries(msg.reactions).map(([emoji, users]) =>
                        users.length > 0 ? (
                          <span key={emoji} className="cursor-pointer">
                            {emoji} {users.length > 1 && users.length}
                          </span>
                        ) : null
                      )}
                    </div>
                  )}
                </div>

                {/* Hover Quick Reaction */}
                <div className="hidden group-hover:flex items-center gap-1 absolute top-0 -translate-y-full py-1 px-2 rounded-xl bg-black/80 border border-white/10 backdrop-blur z-20">
                  {['❤️', '🌿', '✨', '🥺', '🌸'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleAddReaction(msg.id, emoji)}
                      className="hover:scale-125 transition-transform text-xs"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            );
          })
        )}

        {partnerTyping && !isCamouflaged && (
          <div className="flex items-center gap-2 text-xs text-slate-400 pl-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{partnerName} is typing something sweet…</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-white/5 border-t border-white/10 flex items-center gap-2">
        <button
          type="button"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Attach Notes or Photo"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          placeholder={isCamouflaged ? 'Ask a question regarding the syllabus…' : `Message ${partnerName}…`}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/40"
        />

        <button
          type="button"
          onClick={handleSendMessage}
          className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
