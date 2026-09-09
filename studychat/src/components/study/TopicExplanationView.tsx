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
  HelpCircle,
  Clock,
  Award
} from 'lucide-react';

export const TopicExplanationView: React.FC = () => {
  const { selectedTopic, selectedSubject, openAssessment, openAssessmentQuiz, switchTab } = useStudyApp();

  const currentTopic = selectedTopic || SUBJECTS_DATA[0].topics[0];
  const currentSubject = selectedSubject || SUBJECTS_DATA[0];

  return (
    <div className="space-y-8 pb-24 max-w-4xl mx-auto w-full">
      {/* Top Header & Breadcrumbs */}
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <button
          onClick={() => switchTab('subjects')}
          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {currentSubject.title}</span>
        </button>

        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <span className="text-indigo-400 font-bold">{currentSubject.code}</span>
          <span>/</span>
          <span className="text-slate-300">{currentTopic.title}</span>
        </div>
      </div>

      {/* 1. Topic Title & Hero Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border ${
              currentTopic.difficulty === 'Beginner'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : currentTopic.difficulty === 'Intermediate'
                ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
            }`}
          >
            {currentTopic.difficulty} Level
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{currentTopic.estimatedMinutes} Mins Comprehensive Read</span>
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          {currentTopic.title}
        </h1>
        <p className="text-sm font-mono text-indigo-300">
          Department of {currentSubject.department} • Core Engineering Curriculum
        </p>
      </div>

      {/* 2. Simple Explanation (Intuitive Concept) */}
      <section className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/30 to-slate-900 border border-indigo-500/20 shadow-xl space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
          <Lightbulb className="w-4 h-4" />
          <span>Simple Explanation (Intuitive Overview)</span>
        </div>
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
          {currentTopic.simpleExplanation}
        </p>
      </section>

      {/* 3. Detailed Explanation */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#0d0a18]/90 border border-white/10 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span>Detailed Academic Explanation</span>
        </div>
        <div className="text-sm text-slate-300 leading-relaxed space-y-3 font-sans">
          <p>{currentTopic.detailedExplanation}</p>
        </div>
      </section>

      {/* 4. Important Concepts */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#0d0a18]/90 border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span>Core Concepts &amp; Principles</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentTopic.importantConcepts.map((concept, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-200 flex items-start gap-2.5"
            >
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{concept}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Formulas or Code Snippets */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#06040c] border border-white/10 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span>
              {currentTopic.formulasOrCode.type === 'formula' ? 'Key Equation / Formula' : 'Code Implementation'}
            </span>
          </div>
          {currentTopic.formulasOrCode.language && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300 uppercase">
              {currentTopic.formulasOrCode.language}
            </span>
          )}
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-black/70 border border-white/15 overflow-x-auto">
          <pre className="font-mono text-xs sm:text-sm text-emerald-300 leading-relaxed">
            <code>{currentTopic.formulasOrCode.content}</code>
          </pre>
        </div>
        <p className="text-[11px] text-slate-400 font-mono">
          {currentTopic.formulasOrCode.caption}
        </p>
      </section>

      {/* 6. Step-by-Step Problem Solving */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#0d0a18]/90 border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
          <ListOrdered className="w-4 h-4 text-cyan-400" />
          <span>Step-by-Step Walkthrough</span>
        </div>
        <div className="space-y-3">
          {currentTopic.stepByStep.map((step) => (
            <div key={step.step} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <span className="text-cyan-400 font-mono">Step {step.step}:</span>
                <span>{step.title}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pl-6">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Worked Examples */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#0d0a18]/90 border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
          <ClipboardCheck className="w-4 h-4 text-pink-400" />
          <span>Worked Example &amp; Practical Problem</span>
        </div>
        {currentTopic.examples.map((ex, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <h4 className="text-sm font-bold text-white">{ex.title}</h4>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 font-mono">
              <strong className="text-indigo-400">Problem: </strong>
              {ex.problem}
            </div>
            <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-slate-200 whitespace-pre-wrap font-mono">
              <strong className="text-emerald-400">Solution: </strong>
              {ex.solution}
            </div>
          </div>
        ))}
      </section>

      {/* 8. Key Points & 9. Common Mistakes (Two Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Key Points */}
        <section className="p-6 rounded-3xl bg-[#0d0a18]/90 border border-white/10 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
            <CheckCircle2 className="w-4 h-4" />
            <span>Key Points to Remember</span>
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
        <section className="p-6 rounded-3xl bg-[#0d0a18]/90 border border-white/10 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
            <AlertTriangle className="w-4 h-4" />
            <span>Common Pitfalls &amp; Mistakes</span>
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

      {/* 10. Quick Revision Section */}
      <section className="p-6 rounded-3xl bg-indigo-950/20 border border-indigo-500/30 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
          <Zap className="w-4 h-4" />
          <span>Quick Revision Summary</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {currentTopic.quickRevision.map((item, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-xs font-medium"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* MANDATORY ASSESSMENT CALL TO ACTION AT BOTTOM */}
      <div className="sticky bottom-4 z-30 p-5 rounded-3xl bg-[#0A0A0F]/95 backdrop-blur-2xl border border-indigo-500/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-indigo-300 font-mono">
            <Award className="w-4 h-4 text-amber-400" />
            <span>TOPIC ASSESSMENT REQUIRED</span>
          </div>
          <p className="text-xs text-slate-300">
            Verify your comprehension of {currentTopic.title} to unlock Chat with the AI Study Assistant.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={openAssessmentQuiz}
            className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
          >
            <span>Practice MCQs</span>
          </button>

          <button
            onClick={openAssessment}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
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
