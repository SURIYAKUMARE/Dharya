import React, { useState } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { SUBJECTS_DATA } from '../../data/curriculumData';
import { CheckCircle2, XCircle, Award, ArrowRight, HelpCircle, RefreshCw, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const AssessmentModal: React.FC = () => {
  const { selectedTopic, selectedSubject, completeAssessment, openChatLogin, switchTab } = useStudyApp();

  const currentTopic = selectedTopic || SUBJECTS_DATA[0].topics[0];
  const currentSubject = selectedSubject || SUBJECTS_DATA[0];
  const questions = currentTopic.assessmentQuestions;

  // Track selected options: { questionId: selectedOptionIndex }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitAssessment = () => {
    let currentScore = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        currentScore += 1;
      }
    });

    setScore(currentScore);
    setIsSubmitted(true);
    completeAssessment(currentScore, questions.length);

    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
    });
  };

  const allAnswered = questions.every((q) => selectedAnswers[q.id] !== undefined);

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6 pb-20">
      {/* Assessment Header */}
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-xs font-mono text-indigo-400 font-bold uppercase">
            {currentSubject.title} Assessment
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {currentTopic.title}
          </h1>
        </div>

        <button
          onClick={() => switchTab('topic-explanation')}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Assessment Status / Instructions */}
      {!isSubmitted ? (
        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/25 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs text-indigo-200">
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span>Answer all {questions.length} multiple-choice questions to complete topic verification.</span>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-400">
            {Object.keys(selectedAnswers).length}/{questions.length} Answered
          </span>
        </div>
      ) : (
        /* Assessment Completed Banner */
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-teal-900/20 to-slate-900 border border-emerald-500/40 shadow-2xl space-y-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Award className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              Verification Verified
            </div>
            <h2 className="text-2xl font-extrabold text-white">Assessment Completed</h2>
            <p className="text-sm text-slate-300">
              You scored <span className="font-bold text-emerald-400">{score}</span> out of{' '}
              <span className="font-bold text-white">{questions.length}</span> (
              {Math.round((score / questions.length) * 100)}%).
            </p>
          </div>

          <div className="pt-3">
            <button
              onClick={openChatLogin}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95 inline-flex items-center justify-center gap-2"
            >
              <span>CONTINUE TO CHAT</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, qIndex) => {
          const selectedOption = selectedAnswers[q.id];
          const isCorrect = isSubmitted && selectedOption === q.correctIndex;
          const isWrong = isSubmitted && selectedOption !== q.correctIndex;

          return (
            <div
              key={q.id}
              className={`p-6 rounded-3xl border transition-all shadow-xl ${
                isSubmitted
                  ? isCorrect
                    ? 'bg-emerald-950/15 border-emerald-500/30'
                    : 'bg-rose-950/15 border-rose-500/30'
                  : 'bg-[#0d0a18]/90 border-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-white/10 text-indigo-300 font-mono text-xs font-bold flex items-center justify-center">
                    Q{qIndex + 1}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white">{q.question}</h3>
                </div>

                {isSubmitted && (
                  <div>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 font-mono">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Correct (+1)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 font-mono">
                        <XCircle className="w-4 h-4" />
                        <span>Incorrect</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Options Grid */}
              <div className="space-y-2.5">
                {q.options.map((option, optIdx) => {
                  const isSelected = selectedOption === optIdx;
                  const isTheCorrectOption = isSubmitted && optIdx === q.correctIndex;
                  const isTheWrongSelection = isSubmitted && isSelected && !isCorrect;

                  let optClass = 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200';
                  if (isSelected && !isSubmitted) {
                    optClass = 'bg-indigo-600/25 border-indigo-500/60 text-white font-semibold shadow-inner';
                  } else if (isTheCorrectOption) {
                    optClass = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200 font-semibold';
                  } else if (isTheWrongSelection) {
                    optClass = 'bg-rose-500/20 border-rose-500/60 text-rose-200';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`w-full p-3.5 rounded-2xl border text-xs sm:text-sm text-left transition-all flex items-center justify-between ${optClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full border border-current/40 flex items-center justify-center text-[10px] font-mono shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{option}</span>
                      </div>
                      {isTheCorrectOption && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {isTheWrongSelection && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Explanation (shown after submission) */}
              {isSubmitted && (
                <div className="mt-4 p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 leading-relaxed font-sans">
                  <strong className="text-indigo-400">Explanation: </strong>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Button (if not yet submitted) */}
      {!isSubmitted && (
        <div className="p-4 rounded-2xl bg-[#0A0A0F] border border-white/10 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400 font-mono">
            {allAnswered ? 'All questions answered. Ready to submit.' : 'Please answer all questions above.'}
          </div>

          <button
            onClick={handleSubmitAssessment}
            disabled={!allAnswered}
            className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg ${
              allAnswered
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white cursor-pointer shadow-indigo-500/25 active:scale-95'
                : 'bg-white/10 text-slate-500 border border-white/10 cursor-not-allowed'
            }`}
          >
            Submit Assessment
          </button>
        </div>
      )}
    </div>
  );
};
