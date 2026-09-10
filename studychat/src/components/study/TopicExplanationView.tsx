import React, { useState } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { SUBJECTS_DATA } from '../../data/curriculumData';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileCode,
  ListOrdered,
  Sparkles,
  ClipboardCheck,
  Zap,
  Clock,
  Award,
  Copy,
  Check,
  BookMarked
} from 'lucide-react';

export const TopicExplanationView: React.FC = () => {
  const { selectedTopic, selectedSubject, openAssessment, openAssessmentQuiz, switchTab } = useStudyApp();
  const [copiedCode, setCopiedCode] = useState(false);

  const currentTopic = selectedTopic || SUBJECTS_DATA[0].topics[0];
  const currentSubject = selectedSubject || SUBJECTS_DATA[0];

  const handleCopyCode = () => {
    if (!currentTopic.formulasOrCode?.content) return;
    navigator.clipboard.writeText(currentTopic.formulasOrCode.content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-8 pb-36 md:pb-24 max-w-4xl mx-auto w-full">
      {/* 1. Academic Breadcrumbs & Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DFD5] pb-4">
        <button
          onClick={() => switchTab('subjects')}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F6F3EE] border border-[#DDD5C7] text-xs font-semibold text-[#334155] hover:text-[#0F172A] shadow-sm transition-all flex items-center gap-2 self-start"
        >
          <ArrowLeft className="w-4 h-4 text-[#64748B]" />
          <span>Back to {currentSubject.title} Syllabus</span>
        </button>

        <div className="flex items-center gap-2 font-mono text-[11px] text-[#64748B]">
          <span className="text-[#1273C4] font-bold">{currentSubject.code}</span>
          <span className="text-[#CBD5E1]">/</span>
          <span>Unit {currentTopic.unitNumber || 1}</span>
          <span className="text-[#CBD5E1]">/</span>
          <span className="text-[#1E293B] font-medium truncate max-w-[180px] sm:max-w-xs">
            {currentTopic.title}
          </span>
        </div>
      </div>

      {/* 2. Topic Title & Hero Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-3 py-1 rounded-md bg-[#EBF3FB] text-[#1D4ED8] font-mono text-xs font-bold border border-[#BFDBFE]">
            Unit {currentTopic.unitNumber || 1}: {currentTopic.unitTitle}
          </span>
          <span
            className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider font-mono border ${
              currentTopic.difficulty === 'Beginner'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : currentTopic.difficulty === 'Intermediate'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {currentTopic.difficulty} Level
          </span>
          <span className="text-xs text-[#64748B] flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>{currentTopic.estimatedMinutes} Mins Reading Time</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1E293B] tracking-tight leading-tight font-serif">
          {currentTopic.title}
        </h1>

        <p className="text-xs font-mono text-[#64748B]">
          {currentSubject.department} • Core Undergraduate Curriculum • 4 Credits
        </p>

        {currentTopic.referenceCitation && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E5DFD5] text-xs font-mono text-[#475569] shadow-sm">
            <BookMarked className="w-4 h-4 text-[#1273C4] shrink-0" />
            <span>{currentTopic.referenceCitation}</span>
          </div>
        )}
      </div>

      {/* 3. Simple Explanation (Intuitive Concept Overview) */}
      <section className="p-6 sm:p-7 rounded-2xl bg-white border border-[#E5DFD5] shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1273C4] font-mono">
          <Lightbulb className="w-4 h-4 text-[#1273C4]" />
          <span>Intuitive Conceptual Overview</span>
        </div>
        <div className="p-4 sm:p-5 rounded-xl bg-[#FAF8F5] border border-[#EDE8E1]">
          <p className="text-sm sm:text-base text-[#1E293B] leading-relaxed font-normal">
            {currentTopic.simpleExplanation}
          </p>
        </div>
      </section>

      {/* 4. Detailed Academic Explanation */}
      <section className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5DFD5] shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#475569] font-mono">
          <BookOpen className="w-4 h-4 text-[#1273C4]" />
          <span>Formal Academic Formulation &amp; Theory</span>
        </div>
        <div className="text-sm sm:text-base text-[#334155] leading-relaxed space-y-3 font-normal">
          <p>{currentTopic.detailedExplanation}</p>
        </div>
      </section>

      {/* 5. Core Concepts & Theorems */}
      <section className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5DFD5] shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0284C7] font-mono">
          <Sparkles className="w-4 h-4 text-[#0284C7]" />
          <span>Fundamental Theorems &amp; Invariants</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {currentTopic.importantConcepts.map((concept, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] text-xs sm:text-sm text-[#1E293B] flex items-start gap-3 shadow-2xs"
            >
              <span className="w-6 h-6 rounded-lg bg-[#EBF3FB] text-[#1273C4] font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-[#BFDBFE]">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{concept}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Formulas or Code Implementation */}
      <section className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5DFD5] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#059669] font-mono">
            <FileCode className="w-4 h-4 text-[#059669]" />
            <span>
              {currentTopic.formulasOrCode.type === 'formula' ? 'Mathematical Equation' : 'Code Architecture'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {currentTopic.formulasOrCode.language && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F1EBE3] text-[#475569] border border-[#DDD5C7] uppercase font-bold">
                {currentTopic.formulasOrCode.language}
              </span>
            )}
            <button
              onClick={handleCopyCode}
              className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#EDE8E1] text-[#334155] border border-[#DDD5C7] transition-colors flex items-center gap-1.5 text-xs font-mono shadow-2xs"
              title="Copy snippet"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#64748B]" />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-[#0F172A] border border-[#334155] overflow-x-auto shadow-inner">
          <pre className="font-mono text-xs sm:text-sm text-emerald-300 leading-relaxed">
            <code>{currentTopic.formulasOrCode.content}</code>
          </pre>
        </div>
        <p className="text-xs text-[#64748B] font-mono">
          {currentTopic.formulasOrCode.caption}
        </p>
      </section>

      {/* 7. Step-by-Step Problem Solving Sequence */}
      <section className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5DFD5] shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0284C7] font-mono">
          <ListOrdered className="w-4 h-4 text-[#0284C7]" />
          <span>Step-by-Step Analytical Walkthrough</span>
        </div>
        <div className="space-y-3">
          {currentTopic.stepByStep.map((step) => (
            <div key={step.step} className="p-4 sm:p-5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#1E293B]">
                <span className="text-[#1273C4] font-mono">Step {step.step}:</span>
                <span>{step.title}</span>
              </div>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed pl-6">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Worked Practical Problems */}
      <section className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5DFD5] shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7C3AED] font-mono">
          <ClipboardCheck className="w-4 h-4 text-[#7C3AED]" />
          <span>Worked Engineering Examples &amp; Problem Sets</span>
        </div>
        {currentTopic.examples.map((ex, idx) => (
          <div key={idx} className="p-5 sm:p-6 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] space-y-3 shadow-2xs">
            <h4 className="text-sm sm:text-base font-bold text-[#1E293B] font-serif">{ex.title}</h4>
            <div className="p-4 rounded-lg bg-white border border-[#DDD5C7] text-xs sm:text-sm text-[#1E293B] font-mono shadow-2xs">
              <strong className="text-[#1273C4]">Problem: </strong>
              {ex.problem}
            </div>
            <div className="p-4 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-xs sm:text-sm text-[#166534] whitespace-pre-wrap font-mono shadow-2xs">
              <strong className="text-[#15803D]">Step-by-Step Solution: </strong>
              {ex.solution}
            </div>
          </div>
        ))}
      </section>

      {/* 9. Key Points & Common Pitfalls (Two Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Key Points */}
        <section className="p-6 sm:p-7 rounded-2xl bg-white border border-[#E5DFD5] shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#059669] font-mono">
            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
            <span>Key Takeaways for Exams</span>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-[#334155] leading-relaxed">
            {currentTopic.keyPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-[#059669] font-bold mt-0.5">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Common Mistakes */}
        <section className="p-6 sm:p-7 rounded-2xl bg-white border border-[#E5DFD5] shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D97706] font-mono">
            <AlertTriangle className="w-4 h-4 text-[#D97706]" />
            <span>Common Engineering Pitfalls</span>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-[#334155] leading-relaxed">
            {currentTopic.commonMistakes.map((mistake, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-[#D97706] font-bold mt-0.5">✕</span>
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* 10. Quick Revision Sheet */}
      <section className="p-6 sm:p-7 rounded-2xl bg-white border border-[#E5DFD5] shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1273C4] font-mono">
          <Zap className="w-4 h-4 text-[#1273C4]" />
          <span>Quick Revision Summary</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {currentTopic.quickRevision.map((item, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-lg bg-[#EBF3FB] border border-[#BFDBFE] text-[#1D4ED8] text-xs font-mono font-medium shadow-2xs"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* MANDATORY ASSESSMENT CALL TO ACTION (Preserving 100% of Working Gateway Model) */}
      <div className="sticky bottom-[72px] md:bottom-4 z-30 p-4 sm:p-6 rounded-2xl bg-white/95 backdrop-blur-xl border border-[#E5DFD5] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3.5 sm:gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-[#1273C4] font-mono">
            <Award className="w-4 h-4 text-[#F59E0B]" />
            <span>MODULE ASSESSMENT &amp; VERIFICATION</span>
          </div>
          <p className="text-xs sm:text-sm text-[#475569]">
            Verify your comprehension of {currentTopic.title} to complete this engineering unit.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={openAssessmentQuiz}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-[#F8F6F1] border border-[#DDD5C7] text-[#334155] font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>Practice MCQs</span>
          </button>

          <button
            onClick={openAssessment}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#1273C4] hover:bg-[#0D62A5] text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>TAKE ASSESSMENT</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
