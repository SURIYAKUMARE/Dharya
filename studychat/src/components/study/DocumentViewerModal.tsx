import React, { useState } from 'react';
import { DocumentResource } from '../../data/bookMediaResources';
import {
  X,
  Download,
  FileText,
  BookOpen,
  ZoomIn,
  ZoomOut,
  Moon,
  Sun,
  Check,
  ChevronRight,
  Printer,
  Share2,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DocumentViewerModalProps {
  document: DocumentResource | null;
  bookTitle?: string;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document,
  bookTitle,
  onClose,
}) => {
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  if (!document) return null;

  const handleDownload = () => {
    // Generate text/markdown document and trigger real browser download
    let textContent = `# ${document.title}\n`;
    textContent += `Source: ${document.authorOrSource}\n`;
    textContent += `Type: ${document.type} • Pages: ${document.pages} • Size: ${document.fileSize}\n\n`;
    textContent += `Description: ${document.description}\n\n`;
    textContent += `--------------------------------------------------\n\n`;

    document.sections.forEach((sec, idx) => {
      textContent += `## Section ${idx + 1}: ${sec.title}\n\n`;
      textContent += `${sec.content}\n\n`;
      if (sec.formulaOrCode) {
        textContent += `\`\`\`\n${sec.formulaOrCode}\n\`\`\`\n\n`;
      }
      textContent += `\n`;
    });

    const blob = new Blob([textContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = document.downloadFilename.replace(/\.pdf$/, '.md');
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 3000);
  };

  const currentSection = document.sections[activeSectionIdx] || document.sections[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`relative w-full max-w-5xl h-[92vh] flex flex-col rounded-3xl shadow-2xl border overflow-hidden ${
            isDarkMode
              ? 'bg-[#0F172A] border-slate-700 text-slate-100'
              : 'bg-[#FAF8F5] border-[#E2D9CC] text-[#1E293B]'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Toolbar */}
          <div
            className={`px-4 sm:px-6 py-3.5 border-b flex items-center justify-between gap-3 shrink-0 select-none ${
              isDarkMode
                ? 'bg-[#1E293B]/80 border-slate-700/80'
                : 'bg-white/90 border-[#E8E2D8]'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold font-serif truncate leading-snug">
                  {document.title}
                </h3>
                <p className="text-[11px] text-slate-500 truncate font-mono">
                  {document.authorOrSource} • {document.pages} Pages • {document.fileSize}
                </p>
              </div>
            </div>

            {/* Actions: Zoom, Mode, Download & Close */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Zoom Buttons */}
              <div className="hidden sm:flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-xl p-1 border border-black/5 dark:border-white/10">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(80, z - 15))}
                  className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono px-1 font-semibold text-slate-600 dark:text-slate-300">
                  {zoomLevel}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
                  className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors shadow-2xs cursor-pointer"
                title={isDarkMode ? 'Switch to Light Paper Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="Download Document"
              >
                {isDownloaded ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline sm:inline">Download</span>
                  </>
                )}
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                title="Close Document"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Document Body Layout (Sidebar Table of Contents + Document Page) */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Table of Contents */}
            <div
              className={`w-64 sm:w-72 border-r shrink-0 hidden md:flex flex-col p-4 overflow-y-auto select-none ${
                isDarkMode ? 'bg-[#131D31] border-slate-700/80' : 'bg-[#F4EFE8] border-[#E5DFD5]'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-3 px-2">
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                <span>Table of Contents</span>
              </div>

              <div className="space-y-1.5">
                {document.sections.map((sec, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSectionIdx(idx)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      activeSectionIdx === idx
                        ? isDarkMode
                          ? 'bg-blue-600 text-white font-semibold shadow-sm'
                          : 'bg-white text-blue-700 font-bold shadow-xs border border-blue-200'
                        : isDarkMode
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <span className="truncate">
                      {idx + 1}. {sec.title}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60" />
                  </button>
                ))}
              </div>

              <div className="mt-auto pt-4 border-t border-black/5 dark:border-white/10 text-[11px] font-mono text-slate-400 space-y-1">
                <div>Document Type: {document.type}</div>
                <div>Author: {document.authorOrSource}</div>
              </div>
            </div>

            {/* Right Document Reading Slate */}
            <div
              className={`flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center ${
                isDarkMode ? 'bg-[#0B1120]' : 'bg-[#F2ECE3]'
              }`}
            >
              <div
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                className={`w-full max-w-3xl transition-transform duration-200 rounded-2xl shadow-xl border p-6 sm:p-12 space-y-7 self-start ${
                  isDarkMode
                    ? 'bg-[#1E293B] border-slate-700 text-slate-100 shadow-black/40'
                    : 'bg-white border-[#E0D8CC] text-[#0F172A] shadow-black/5'
                }`}
              >
                {/* Academic Letterhead Watermark Header */}
                <div className="border-b-2 border-blue-600/30 pb-5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-600">
                      Dhanya Central Engineering Repository
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Doc Ref: {document.id.toUpperCase()}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold font-serif tracking-tight text-blue-900 dark:text-blue-300">
                    {document.title}
                  </h1>
                  <p className="text-xs font-mono text-slate-500">
                    Published &amp; Certified by {document.authorOrSource} • Fall Academic Semester
                  </p>
                </div>

                {/* Section Content */}
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    <span>Section {activeSectionIdx + 1} of {document.sections.length}</span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold font-serif text-[#0F172A] dark:text-white">
                    {currentSection.title}
                  </h2>

                  <div className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line space-y-3 font-normal">
                    <p>{currentSection.content}</p>
                  </div>

                  {/* Formula / Code Callout Box */}
                  {currentSection.formulaOrCode && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#0F172A] border border-slate-700 text-emerald-300 font-mono text-xs sm:text-sm overflow-x-auto shadow-inner space-y-2">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800 pb-1.5 flex items-center justify-between">
                        <span>Governing Formula / Mathematical Invariant</span>
                        <span className="text-slate-500">IEEE Standard</span>
                      </div>
                      <pre className="whitespace-pre-wrap leading-relaxed">
                        <code>{currentSection.formulaOrCode}</code>
                      </pre>
                    </div>
                  )}
                </div>

                {/* Footer of the Page */}
                <div className="pt-8 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <button
                      disabled={activeSectionIdx === 0}
                      onClick={() => setActiveSectionIdx((i) => Math.max(0, i - 1))}
                      className="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40 transition-all cursor-pointer font-bold"
                    >
                      ← Previous Section
                    </button>
                    <button
                      disabled={activeSectionIdx === document.sections.length - 1}
                      onClick={() => setActiveSectionIdx((i) => Math.min(document.sections.length - 1, i + 1))}
                      className="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40 transition-all cursor-pointer font-bold"
                    >
                      Next Section →
                    </button>
                  </div>
                  <span>Page {activeSectionIdx + 1} / {document.sections.length}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
