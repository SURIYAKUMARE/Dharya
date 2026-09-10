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
    <div className="space-y-8 pb-28 max-w-4xl mx-auto w-full">
      {/* 1. Academic Breadcrumbs & Back Navigation */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <button
          onClick={() => switchTab('subjects')}
          className="px-3 py-2 rounded-xl bg-[#0E1424] hover:bg-[#151E36] border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {currentSubject.title} Syllabus</span>
        </button>

        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <span className="text-blue-400 font-bold">{currentSubject.code}</span>
          <span>/</span>
          <span className="text-slate-500">Unit {currentTopic.unitNumber || 1}</span>
          <span>/</span>
          <span className="text-slate-300 truncate max-w-[180px] sm:max-w-xs">{currentTopic.title}</span>
        </div>
      </div>

      {/* 2. Topic Title & Hero Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-mono text-[11px] font-bold border border-blue-500/20">
            Unit {currentTopic.unitNumber || 1}: {currentTopic.unitTitle}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono border ${
              currentTopic.difficulty === 'Beginner'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                : currentTopic.difficulty === 'Intermediate'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/25'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
            }`}
          >
            {currentTopic.difficulty} Level
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{currentTopic.estimatedMinutes} Mins Reading Time</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          {currentTopic.title}
        </h1>

        <p className="text-xs font-mono text-slate-400">
          {currentSubject.department} • Core Undergraduate Curriculum • 4 Credits
        </p>

        {currentTopic.referenceCitation && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0E1424] border border-slate-800 text-[11px] font-mono text-slate-400">
            <BookMarked className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>{currentTopic.referenceCitation}</span>
          </div>
        )}
      </div>

      {/* 3. Simple Explanation (Intuitive Concept Overview) */}
      <section className="p-6 rounded-2xl bg-[#0E1424] border border-blue-500/20 shadow-lg space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 font-mono">
          <Lightbulb className="w-4 h-4 text-blue-400" />
          <span>Intuitive Conceptual Overview</span>
        </div>
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
          {currentTopic.simpleExplanation}
        </p>
      </section>

      {/* 4. Detailed Academic Explanation */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#0E1424] border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <span>Formal Academic Formulation &amp; Theory</span>
        </div>
        <div className="text-sm text-slate-300 leading-relaxed space-y-3 font-normal">
          <p>{currentTopic.detailedExplanation}</p>
        </div>
      </section>

      {/* 5. Core Concepts & Theorems */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#0E1424] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Fundamental Theorems &amp; Invariants</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentTopic.importantConcepts.map((concept, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#090D16] border border-slate-800 text-xs text-slate-200 flex items-start gap-2.5"
            >
              <span className="w-5 h-5 rounded-md bg-blue-500/10 text-blue-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-blue-500/20">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{concept}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Formulas or Code Implementation */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#090D16] border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span>
              {currentTopic.formulasOrCode.type === 'formula' ? 'Mathematical Equation' : 'Code Architecture'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {currentTopic.formulasOrCode.language && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                {currentTopic.formulasOrCode.language}
              </span>
            )}
            <button
              onClick={handleCopyCode}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-[11px] font-mono"
              title="Copy snippet"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-black/80 border border-slate-800/80 overflow-x-auto">
          <pre className="font-mono text-xs sm:text-sm text-emerald-300 leading-relaxed">
            <code>{currentTopic.formulasOrCode.content}</code>
          </pre>
        </div>
        <p className="text-[11px] text-slate-400 font-mono">
          {currentTopic.formulasOrCode.caption}
        </p>
      </section>

      {/* 7. Step-by-Step Problem Solving Sequence */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#0E1424] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
          <ListOrdered className="w-4 h-4 text-cyan-400" />
          <span>Step-by-Step Analytical Walkthrough</span>
        </div>
        <div className="space-y-3">
          {currentTopic.stepByStep.map((step) => (
            <div key={step.step} className="p-4 rounded-xl bg-[#090D16] border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <span className="text-blue-400 font-mono">Step {step.step}:</span>
                <span>{step.title}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pl-6">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Worked Practical Problems */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#0E1424] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
          <ClipboardCheck className="w-4 h-4 text-purple-400" />
          <span>Worked Engineering Examples &amp; Problem Sets</span>
        </div>
        {currentTopic.examples.map((ex, idx) => (
          <div key={idx} className="p-5 rounded-xl bg-[#090D16] border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white">{ex.title}</h4>
            <div className="p-3.5 rounded-lg bg-[#0E1424] border border-slate-800 text-xs text-slate-300 font-mono">
              <strong className="text-blue-400">Problem: </strong>
              {ex.problem}
            </div>
            <div className="p-3.5 rounded-lg bg-[#08101E] border border-blue-500/20 text-xs text-slate-200 whitespace-pre-wrap font-mono">
              <strong className="text-emerald-400">Step-by-Step Solution: </strong>
              {ex.solution}
            </div>
          </div>
        ))}
      </section>

      {/* 9. Key Points & Common Pitfalls (Two Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Key Points */}
        <section className="p-6 rounded-2xl bg-[#0E1424] border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
            <CheckCircle2 className="w-4 h-4" />
            <span>Key Takeaways for Exams</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
            {currentTopic.keyPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Common Mistakes */}
        <section className="p-6 rounded-2xl bg-[#0E1424] border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
            <AlertTriangle className="w-4 h-4" />
            <span>Common Engineering Pitfalls</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
            {currentTopic.commonMistakes.map((mistake, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">✕</span>
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* 10. Quick Revision Sheet */}
      <section className="p-6 rounded-2xl bg-[#0E1424] border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 font-mono">
          <Zap className="w-4 h-4" />
          <span>Quick Revision Summary</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {currentTopic.quickRevision.map((item, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs font-mono font-medium"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* MANDATORY ASSESSMENT CALL TO ACTION (Preserving 100% of Working Gateway Model) */}
      <div className="sticky bottom-4 z-30 p-5 rounded-2xl bg-[#0E1424]/95 backdrop-blur-xl border border-blue-500/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-blue-400 font-mono">
            <Award className="w-4 h-4 text-amber-400" />
            <span>MODULE ASSESSMENT &amp; VERIFICATION</span>
          </div>
          <p className="text-xs text-slate-300">
            Verify your comprehension of {currentTopic.title} to complete this engineering unit.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={openAssessmentQuiz}
            className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-slate-700 text-slate-300 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
          >
            <span>Practice MCQs</span>
          </button>

          <button
            onClick={openAssessment}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
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
