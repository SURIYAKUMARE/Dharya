import React, { useState, useRef, useEffect } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import {
  Send,
  Bot,
  User,
  Sparkles,
  BookOpen,
  Code2,
  Lightbulb,
  LogOut,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

export const StudentChatView: React.FC = () => {
  const { student, logoutChat, assessmentRecord, selectedTopic } = useStudyApp();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-init',
        sender: 'assistant',
        text: `Welcome back, ${student?.name || 'Dharya'}! ✨\n\nI am your Educational AI Study Assistant. You can ask me to derive equations, explain code step-by-step, review common examination mistakes, or solve textbook doubts for ${
          assessmentRecord?.topicTitle || 'your engineering curriculum'
        }. What would you like to explore next?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    // Generate smart educational response based on query
    setTimeout(() => {
      let reply = '';
      const lower = text.toLowerCase();

      if (lower.includes('eigen') || lower.includes('matrix')) {
        reply = `**Eigenvalues & Matrix Analysis:**\nRecall that for any n×n matrix $A$, we solve $\\det(A - \\lambda I) = 0$.\n\n1. The roots $\\lambda_i$ are the eigenvalues.\n2. For each $\\lambda_i$, the eigenvector $v_i$ satisfies $(A - \\lambda_i I)v_i = 0$.\n3. Quick tip: If matrix $A$ is symmetric real, its eigenvalues are guaranteed to be real numbers!`;
      } else if (lower.includes('pointer') || lower.includes('memory') || lower.includes('c++')) {
        reply = `**Pointer & Memory Breakdown:**\n- The \`&\` operator gives the memory address of a variable.\n- The \`*\` operator dereferences that address to access the value.\n- Remember to pair every \`new[]\` with \`delete[]\` to eliminate memory leaks in heap storage!`;
      } else if (lower.includes('bst') || lower.includes('tree') || lower.includes('dsa')) {
        reply = `**Binary Search Tree Properties:**\n- Inorder traversal (Left → Root → Right) always outputs keys in strictly sorted ascending order.\n- Average search complexity: $\\mathcal{O}(\\log n)$.\n- Worst-case complexity for a degenerate skewed tree: $\\mathcal{O}(n)$.`;
      } else if (lower.includes('formula') || lower.includes('equation')) {
        reply = `Here is the primary governing formula for **${assessmentRecord?.topicTitle || 'your subject'}**:\n\n$$\\text{det}(A - \\lambda I) = 0 \\quad \\text{and} \\quad \\lambda = \\frac{h}{p}$$\n\nNotice how the variables correlate directly to the textbook problem bank we studied. Would you like a step-by-step example problem?`;
      } else if (lower.includes('mistake') || lower.includes('pitfall')) {
        reply = `**Common Mistakes to Watch For:**\n1. Sign errors during polynomial determinant expansion.\n2. Forgetting boundary conditions in integral transforms.\n3. Omitting the null pointer check before dereferencing in dynamic memory.`;
      } else {
        reply = `That is a great question regarding **${assessmentRecord?.topicTitle || 'Engineering Studies'}**.\n\nFrom our textbook analysis:\n1. Break the problem into fundamental components.\n2. Identify the governing constraints and boundary values.\n3. Verify your solution by substitution back into the primary equation.\n\nLet me know if you want me to write a custom code solution or show the mathematical derivation!`;
      }

      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'assistant',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
    }, 900);
  };

  const quickPrompts = [
    'Explain the core formula step-by-step',
    'What are the most common exam mistakes?',
    'Give me a challenging practice problem with solution',
    'Summarize this topic in 3 key takeaways',
  ];

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col bg-[#0d0a18]/90 border border-white/10 rounded-3xl overflow-hidden shadow-2xl min-h-[600px]">
      {/* Educational Chat Header */}
      <div className="p-4 sm:p-5 bg-white/5 border-b border-white/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">AI Study Assistant</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            </div>
            <p className="text-[11px] text-indigo-300 font-mono">
              Active Context: {assessmentRecord?.topicTitle || 'Engineering Problem Solving'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <span>{student?.name}</span>
          </div>

          <button
            onClick={logoutChat}
            className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-slate-400 hover:text-rose-300 transition-colors"
            title="Log Out of Chat"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-h-[500px] min-h-[380px]">
        {messages.map((msg) => {
          const isMe = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-2.5`}>
              {!isMe && (
                <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-1 border border-indigo-500/30">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm shadow-md whitespace-pre-wrap leading-relaxed ${
                  isMe
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-xs'
                    : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-xs font-sans'
                }`}
              >
                <p>{msg.text}</p>
                <div className="text-[10px] text-right mt-1.5 opacity-60 font-mono">
                  {msg.time}
                </div>
              </div>

              {isMe && (
                <div className="w-7 h-7 rounded-xl bg-violet-600/30 text-violet-300 flex items-center justify-center shrink-0 mt-1 border border-violet-500/40">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-indigo-300 pl-9 font-mono">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span>AI Assistant is analyzing textbook derivations…</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-4 py-2 bg-white/[0.02] border-t border-white/5 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-500/30 text-[11px] text-slate-300 hover:text-white whitespace-nowrap transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/5 border-t border-white/10 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          placeholder="Ask your AI Study Assistant about equations, code, or proofs…"
          className="flex-1 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500/50"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isLoading}
          className={`p-3 rounded-2xl font-bold transition-all ${
            inputText.trim() && !isLoading
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 active:scale-95 cursor-pointer'
              : 'bg-white/10 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
