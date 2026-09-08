import React, { useState } from 'react';
import { Book as BookType, Topic } from '../data/books';
import { X, Copy, Check, BookOpen, Layers, Sparkles, MessageSquare, ArrowRight, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TopicReaderModalProps {
  book: BookType | null;
  onClose: () => void;
  onContinueToChat: () => void;
}

export const TopicReaderModal: React.FC<TopicReaderModalProps> = ({
  book,
  onClose,
  onContinueToChat,
}) => {
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  if (!book) return null;

  const currentTopic = selectedTopic || book.topics[0] || null;

  const handleCopy = (formula: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedFormula(formula);
    setTimeout(() => setCopiedFormula(null), 2200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#101018] border border-white/15 rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar with Book Details & Close */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold border"
                style={{
                  backgroundColor: `${book.accent}25`,
                  borderColor: `${book.accent}50`,
                  color: book.accent,
                }}
              >
                {book.icon}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  {book.title}
                  <span
                    className="text-[10px] font-black uppercase px-2 py-0.5 rounded border"
                    style={{
                      backgroundColor: `${book.accent}15`,
                      borderColor: `${book.accent}40`,
                      color: book.accent,
                    }}
                  >
                    {book.badge}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">By {book.author} • {book.edition}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Two-Column Layout (Units List on Left, Unit Details/Formulas on Right) */}
          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 min-h-0">
            {/* Left Column: Units List (5 cols) */}
            <div className="md:col-span-5 p-4 sm:p-5 border-b md:border-b-0 md:border-r border-white/10 bg-white/[0.01] overflow-y-auto max-h-[300px] md:max-h-none">
              <div className="flex items-center justify-between mb-3 px-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Syllabus Units ({book.topics.length})
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Select to view</span>
              </div>

              <div className="space-y-2">
                {book.topics.map((topic) => {
                  const isSelected = currentTopic?.number === topic.number;
                  return (
                    <button
                      key={topic.number}
                      onClick={() => setSelectedTopic(topic)}
                      className={`w-full text-left p-3 rounded-xl transition-all duration-150 border cursor-pointer ${
                        isSelected
                          ? 'bg-white/[0.08] border-white/30 shadow-md'
                          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black"
                            style={{
                              backgroundColor: `${book.accent}25`,
                              color: book.accent,
                            }}
                          >
                            {topic.number}
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-white line-clamp-1">
                            {topic.name}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            topic.difficulty === 'Beginner'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : topic.difficulty === 'Intermediate'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {topic.difficulty}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 pl-7">
                        {topic.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Selected Unit Blueprint, Formula & Notes (7 cols) */}
            <div className="md:col-span-7 p-6 overflow-y-auto flex flex-col justify-between gap-6">
              {currentTopic ? (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      <span>UNIT {currentTopic.number}</span>
                      <span>•</span>
                      <span
                        className={
                          currentTopic.difficulty === 'Beginner'
                            ? 'text-emerald-400'
                            : currentTopic.difficulty === 'Intermediate'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }
                      >
                        {currentTopic.difficulty} Level
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                      {currentTopic.name}
                    </h2>
                    <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                      {currentTopic.description}
                    </p>
                  </div>

                  {/* Core Formula Slate */}
                  {currentTopic.formula && (
                    <div className="p-4 rounded-2xl bg-black/50 border border-white/15 relative overflow-hidden shadow-inner">
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-[11px] font-extrabold uppercase tracking-wider"
                          style={{ color: book.accent }}
                        >
                          Governing Formula / Equation
                        </span>
                        <button
                          onClick={() => handleCopy(currentTopic.formula!)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold text-slate-300 bg-white/10 hover:bg-white/20 hover:text-white transition-all cursor-pointer"
                        >
                          {copiedFormula === currentTopic.formula ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="font-mono text-sm sm:text-base font-bold text-white bg-white/[0.04] p-3 rounded-xl border border-white/10 overflow-x-auto">
                        {currentTopic.formula}
                      </div>
                    </div>
                  )}

                  {/* Question Bank Stats */}
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          {currentTopic.questionsCount ?? 40} Solved Practice Problems
                        </p>
                        <p className="text-xs text-slate-400">
                          GATE, ESE & University Semester PYQs included
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Study Objectives
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1.5 pl-4 list-disc marker:text-violet-400">
                      <li>Understand key derivations and theorem limitations.</li>
                      <li>Master algebraic transformations and standard boundary conditions.</li>
                      <li>Review solved numerical problems before entering doubt sessions.</li>
                    </ul>
                  </div>
                </div>
              ) : null}

              {/* Action Bar */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  ISBN {book.isbn} • {book.publisher}
                </span>

                <button
                  onClick={onContinueToChat}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Continue to Chat Doubts</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
