import React, { useState, useMemo } from 'react';
import { AssessmentQuestion } from '../../data/assessmentQuestionBank';
import {
  CheckCircle2,
  XCircle,
  Award,
  HelpCircle,
  RefreshCw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Lightbulb,
  Check,
  RotateCcw,
  Zap,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TopicAssessmentWidgetProps {
  questions: AssessmentQuestion[];
  topicTitle: string;
  onComplete?: (score: number, total: number) => void;
}

export const TopicAssessmentWidget: React.FC<TopicAssessmentWidgetProps> = ({
  questions,
  topicTitle,
  onComplete,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [instantFeedback, setInstantFeedback] = useState<boolean>(true);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [showAllQuestions, setShowAllQuestions] = useState<boolean>(false);

  // Fallback if topic questions list is empty
  const activeQuestions = useMemo(() => {
    if (questions && questions.length > 0) return questions;
    return [
      {
        id: 'fallback-q1',
        question: `What is the primary governing principle of ${topicTitle}?`,
        options: [
          'Linear state invariance under canonical transformation',
          'Conservation of momentum in closed isolated systems',
          'Minimization of thermodynamic entropy in steady state',
          'Asymptotic boundary equilibrium under Dirichlet conditions'
        ],
        correctIndex: 0,
        explanation: `In standard engineering formulations, ${topicTitle} is analyzed via linear state transformation and invariance principles.`
      }
    ];
  }, [questions, topicTitle]);

  const currentQ = activeQuestions[currentIdx] || activeQuestions[0];

  const handleSelectOption = (qId: string, optIdx: number) => {
    if (isSubmitted && !instantFeedback) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: optIdx,
    }));
  };

  const handleFinishExam = () => {
    let score = 0;
    activeQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score += 1;
      }
    });

    setIsSubmitted(true);
    if (onComplete) {
      onComplete(score, activeQuestions.length);
    }

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'],
    });
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentIdx(0);
  };

  // Calculate score
  const score = useMemo(() => {
    let s = 0;
    activeQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        s += 1;
      }
    });
    return s;
  }, [activeQuestions, selectedAnswers]);

  const answeredCount = Object.keys(selectedAnswers).length;
  const percentage = Math.round((score / activeQuestions.length) * 100);

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5DFD5] shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E2D8] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              {activeQuestions.length} Practice MCQs &amp; Problems
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">•</span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Interactive Self-Assessment
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold font-serif text-[#0F172A] mt-1">
            Knowledge Verification &amp; Exam Drill
          </h3>
        </div>

        {/* Mode Toggle & Reset */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setInstantFeedback(!instantFeedback)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
              instantFeedback
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
            title="Toggle instant feedback on option clicks"
          >
            <Zap className={`w-3.5 h-3.5 ${instantFeedback ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>Instant Feedback: {instantFeedback ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
            title="Reset Quiz"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Score Summary Banner if Completed */}
      {isSubmitted && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border border-blue-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold font-mono text-lg shadow-md shrink-0">
              {score}/{activeQuestions.length}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base sm:text-lg font-bold text-[#0F172A] font-serif">
                  Assessment Completed • {percentage}% Score
                </h4>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {percentage >= 80 ? 'Distinction' : percentage >= 50 ? 'Pass' : 'Needs Review'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                You correctly answered {score} out of {activeQuestions.length} engineering questions for {topicTitle}.
              </p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xs shrink-0 cursor-pointer active:scale-95"
          >
            Retake Assessment
          </button>
        </div>
      )}

      {/* View Mode Toggle: Single Question Focus vs View All */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-500 border-b border-[#E8E2D8] pb-3">
        <div className="flex items-center gap-2">
          <span>Question {currentIdx + 1} of {activeQuestions.length}</span>
          <span className="text-slate-300">•</span>
          <span>{answeredCount} Answered</span>
        </div>

        <button
          onClick={() => setShowAllQuestions(!showAllQuestions)}
          className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
        >
          {showAllQuestions ? 'Switch to Card by Card View' : 'View All Questions List'}
        </button>
      </div>

      {/* Render Questions */}
      {!showAllQuestions ? (
        /* Single Question View with Prev/Next Navigation */
        <div className="space-y-5">
          <div className="space-y-3">
            <span className="text-[11px] font-mono font-bold text-blue-600 uppercase">
              Question #{currentIdx + 1}
            </span>
            <h4 className="text-base sm:text-lg font-bold text-[#0F172A] font-serif leading-snug">
              {currentQ.question}
            </h4>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, optIdx) => {
              const isSelected = selectedAnswers[currentQ.id] === optIdx;
              const isCorrect = optIdx === currentQ.correctIndex;
              const hasAnswered = selectedAnswers[currentQ.id] !== undefined;

              let optionStyle = 'bg-[#FAF8F5] hover:bg-[#F3ECE1] border-[#E5DFD5] text-slate-800';

              if (instantFeedback && hasAnswered) {
                if (isCorrect) {
                  optionStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold ring-1 ring-emerald-300';
                } else if (isSelected) {
                  optionStyle = 'bg-rose-50 border-rose-400 text-rose-950 font-semibold ring-1 ring-rose-300';
                } else {
                  optionStyle = 'bg-slate-50/60 border-slate-200 text-slate-400 opacity-60';
                }
              } else if (isSelected) {
                optionStyle = 'bg-blue-50 border-blue-400 text-blue-950 font-semibold ring-2 ring-blue-300';
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(currentQ.id, optIdx)}
                  className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer shadow-2xs ${optionStyle}`}
                >
                  <span className="w-6 h-6 rounded-lg bg-white/80 border border-black/10 flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="text-xs sm:text-sm leading-relaxed flex-1">
                    {opt}
                  </span>

                  {instantFeedback && hasAnswered && (
                    <span className="shrink-0 self-center">
                      {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                      {!isCorrect && isSelected && <XCircle className="w-5 h-5 text-rose-600" />}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Instant Explanation Box */}
          {instantFeedback && selectedAnswers[currentQ.id] !== undefined && (
            <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs sm:text-sm text-[#166534] space-y-1.5 shadow-2xs animate-in fade-in">
              <div className="font-bold font-mono uppercase text-[11px] text-[#15803D] flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Verified Solution &amp; Analytical Explanation:</span>
              </div>
              <p className="leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-3 border-t border-[#E8E2D8] flex items-center justify-between gap-3">
            <button
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Question Quick Palette Bar */}
            <div className="hidden sm:flex items-center gap-1 overflow-x-auto max-w-xs scrollbar-none">
              {activeQuestions.map((q, idx) => {
                const isAns = selectedAnswers[q.id] !== undefined;
                const isCurrent = currentIdx === idx;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-6 h-6 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-xs scale-110'
                        : isAns
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {currentIdx < activeQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx((i) => Math.min(activeQuestions.length - 1, i + 1))}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinishExam}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>Submit &amp; Score</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* All Questions List View */
        <div className="space-y-6">
          {activeQuestions.map((q, qIndex) => (
            <div
              key={q.id}
              className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-3.5 shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  {qIndex + 1}
                </span>
                <h4 className="text-sm sm:text-base font-bold text-[#0F172A] font-serif leading-snug">
                  {q.question}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[q.id] === optIdx;
                  const isCorrect = optIdx === q.correctIndex;
                  const hasAnswered = selectedAnswers[q.id] !== undefined;

                  let optStyle = 'bg-white hover:bg-[#F3ECE1] border-slate-200 text-slate-700';

                  if (instantFeedback && hasAnswered) {
                    if (isCorrect) {
                      optStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold';
                    } else if (isSelected) {
                      optStyle = 'bg-rose-50 border-rose-400 text-rose-900 font-semibold';
                    }
                  } else if (isSelected) {
                    optStyle = 'bg-blue-50 border-blue-400 text-blue-900 font-semibold';
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`text-left p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all cursor-pointer shadow-2xs ${optStyle}`}
                    >
                      <span className="font-mono font-bold text-slate-500 shrink-0">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {instantFeedback && selectedAnswers[q.id] !== undefined && (
                <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#166534]">
                  <strong>Solution: </strong> {q.explanation}
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-end pt-2">
            <button
              onClick={handleFinishExam}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>Submit Assessment &amp; Calculate Score</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
