import React, { useState } from 'react';
import { Book as BookType, Topic } from '../data/books';
import { getMediaResourcesForTopic, DocumentResource } from '../data/bookMediaResources';
import { BookVideoPlayer } from './study/BookVideoPlayer';
import { DocumentViewerModal } from './study/DocumentViewerModal';
import {
  X,
  Copy,
  Check,
  BookOpen,
  Layers,
  Sparkles,
  MessageSquare,
  ArrowRight,
  HelpCircle,
  Youtube,
  FileText,
  Eye,
  Download,
  Building2,
  GraduationCap
} from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'documents' | 'concepts'>('overview');
  const [activeDocModal, setActiveDocModal] = useState<DocumentResource | null>(null);

  if (!book) return null;

  const currentTopic = selectedTopic || book.topics[0] || null;

  const mediaResources = getMediaResourcesForTopic(
    `topic-${book.id}-${currentTopic?.number || 1}`,
    currentTopic?.name || book.title,
    book.title,
    book.category.toUpperCase()
  );

  const handleCopy = (formula: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedFormula(formula);
    setTimeout(() => setCopiedFormula(null), 2200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#101018] border border-white/15 rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar with Book Details & Close */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold border shrink-0"
                style={{
                  backgroundColor: `${book.accent}25`,
                  borderColor: `${book.accent}50`,
                  color: book.accent,
                }}
              >
                {book.icon}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 truncate">
                  {book.title}
                  <span
                    className="text-[9px] font-black uppercase px-2 py-0.5 rounded border shrink-0"
                    style={{
                      backgroundColor: `${book.accent}15`,
                      borderColor: `${book.accent}40`,
                      color: book.accent,
                    }}
                  >
                    {book.badge}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 truncate">By {book.author} • {book.edition}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Two-Column Layout (Units List on Left, Unit Details/Formulas on Right) */}
          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 min-h-0">
            {/* Left Column: Units List (4 cols) */}
            <div className="md:col-span-4 p-4 border-b md:border-b-0 md:border-r border-white/10 bg-white/[0.01] overflow-y-auto max-h-[220px] md:max-h-none">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Units ({book.topics.length})
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Select chapter</span>
              </div>

              <div className="space-y-1.5">
                {book.topics.map((topic) => {
                  const isSelected = currentTopic?.number === topic.number;
                  return (
                    <button
                      key={topic.number}
                      onClick={() => setSelectedTopic(topic)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all duration-150 border cursor-pointer ${
                        isSelected
                          ? 'bg-white/[0.1] border-white/30 shadow-md'
                          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-4.5 h-4.5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0"
                            style={{
                              backgroundColor: `${book.accent}25`,
                              color: book.accent,
                            }}
                          >
                            {topic.number}
                          </span>
                          <span className="text-xs font-semibold text-white truncate">
                            {topic.name}
                          </span>
                        </div>
                        <span
                          className={`text-[8px] font-bold px-1 py-0.2 rounded shrink-0 ${
                            topic.difficulty === 'Beginner'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : topic.difficulty === 'Intermediate'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {topic.difficulty[0]}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Content with Tabs for Videos, Documents & Concepts (8 cols) */}
            <div className="md:col-span-8 p-5 sm:p-6 overflow-y-auto flex flex-col justify-between gap-5">
              {currentTopic ? (
                <div className="space-y-5">
                  {/* Topic Title & Difficulty */}
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
                    <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                      {currentTopic.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                      {currentTopic.description}
                    </p>
                  </div>

                  {/* 4 Interactive Content Tabs */}
                  <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.05] border border-white/10 overflow-x-auto scrollbar-none">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                        activeTab === 'overview'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Formula &amp; PYQs</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('videos')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                        activeTab === 'videos'
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Youtube className="w-3.5 h-3.5 text-red-400" />
                      <span>YouTube Videos ({mediaResources.videos.length})</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('documents')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                        activeTab === 'documents'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      <span>Documents ({mediaResources.documents.length})</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('concepts')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                        activeTab === 'concepts'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Deep Concepts ({mediaResources.concepts.length})</span>
                    </button>
                  </div>

                  {/* Tab 1: Overview & Formula */}
                  {activeTab === 'overview' && (
                    <div className="space-y-4">
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

                      <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                            <HelpCircle className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-white">
                              {currentTopic.questionsCount ?? 40} Solved Practice Problems
                            </p>
                            <p className="text-[11px] text-slate-400">
                              University Semester &amp; GATE PYQs Included
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Key Learning Objectives
                        </span>
                        <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc marker:text-violet-400">
                          <li>Understand fundamental derivations and theorem boundaries.</li>
                          <li>Master algebraic transformations and standard boundary conditions.</li>
                          <li>Review solved numerical problems before entering doubt sessions.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: YouTube Video Lectures */}
                  {activeTab === 'videos' && (
                    <div className="space-y-4">
                      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-lg">
                        <iframe
                          className="w-full h-full"
                          src={`https://www.youtube-nocookie.com/embed/${mediaResources.videos[0].youtubeId}?autoplay=0&rel=0`}
                          title={mediaResources.videos[0].title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>

                      <div className="space-y-2">
                        {mediaResources.videos.map((vid) => (
                          <a
                            key={vid.id}
                            href={`https://www.youtube.com/watch?v=${vid.youtubeId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 transition-all flex items-center justify-between gap-3 text-white group"
                          >
                            <div className="min-w-0">
                              <span className="text-[9px] font-mono text-red-400 font-bold uppercase">
                                {vid.channel} • {vid.duration}
                              </span>
                              <h5 className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                                {vid.title}
                              </h5>
                            </div>
                            <span className="text-xs text-red-400 font-semibold shrink-0 group-hover:underline">
                              Watch →
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Documents & PDF Handouts */}
                  {activeTab === 'documents' && (
                    <div className="space-y-3">
                      {mediaResources.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <span className="text-[9px] font-mono font-bold text-blue-400 uppercase px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                              {doc.type} • {doc.pages} Pages
                            </span>
                            <h5 className="text-xs font-bold text-white truncate mt-1">
                              {doc.title}
                            </h5>
                            <p className="text-[11px] text-slate-400 line-clamp-1">
                              {doc.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => setActiveDocModal(doc)}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 text-xs font-bold transition-all cursor-pointer"
                            >
                              Read
                            </button>
                            <button
                              onClick={() => setActiveDocModal(doc)}
                              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                              title="Download"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tab 4: Deep Concepts */}
                  {activeTab === 'concepts' && (
                    <div className="space-y-3">
                      {mediaResources.concepts.map((concept, idx) => (
                        <div
                          key={concept.id}
                          className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2 text-white"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono font-bold text-purple-400 uppercase px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                              {concept.category}
                            </span>
                            <h5 className="text-xs font-bold truncate">
                              {concept.title}
                            </h5>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {concept.inDepthAnalysis}
                          </p>
                          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
                            <strong>Application: </strong> {concept.realWorldApplication}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Action Bar */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
                <span className="text-[11px] text-slate-500 truncate max-w-xs">
                  ISBN {book.isbn} • {book.publisher}
                </span>

                <button
                  onClick={onContinueToChat}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-600/30 transition-all cursor-pointer shrink-0"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask Doubts</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <DocumentViewerModal
        document={activeDocModal}
        bookTitle={book.title}
        onClose={() => setActiveDocModal(null)}
      />
    </AnimatePresence>
  );
};
