import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { SUBJECTS_DATA } from '../../data/curriculumData';
import { CheckCircle2, XCircle, Award, ArrowRight, HelpCircle, RefreshCw, X, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

const TOTAL_ASSESSMENT_TIME = 20 * 60; // 20 minutes in seconds

export const AssessmentModal: React.FC = () => {
  const { selectedTopic, selectedSubject, completeAssessment, openChatLogin, switchTab, assessmentNotice } = useStudyApp();

  const currentTopic = selectedTopic || SUBJECTS_DATA[0].topics[0];
  const currentSubject = selectedSubject || SUBJECTS_DATA[0];

  // Guarantee that every assessment session has more than 20 questions (25 questions)
  const questions = useMemo(() => {
    if (currentTopic?.assessmentQuestions && currentTopic.assessmentQuestions.length >= 20) {
      return currentTopic.assessmentQuestions;
    }
    const subjectQuestions = (currentSubject?.topics || []).flatMap((t) => t.assessmentQuestions || []);
    if (subjectQuestions.length >= 20) {
      return subjectQuestions;
    }
    const fallbackBank = SUBJECTS_DATA[0]?.topics[0]?.assessmentQuestions || [];
    const combined = [...subjectQuestions];
    for (const q of fallbackBank) {
      if (!combined.some((item) => item.id === q.id)) {
        combined.push(q);
      }
      if (combined.length >= 25) break;
    }
    return combined;
  }, [currentTopic, currentSubject]);

  // Track selected options: { questionId: selectedOptionIndex }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_ASSESSMENT_TIME);

  const selectedAnswersRef = useRef(selectedAnswers);
  selectedAnswersRef.current = selectedAnswers;

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitAssessment = useCallback(() => {
    let currentScore = 0;
    const answers = selectedAnswersRef.current;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) {
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
      colors: ['#2563eb', '#10b981', '#f59e0b', '#ec4899'],
    });
  }, [questions, completeAssessment]);

  // Live Countdown Timer
  useEffect(() => {
    if (isSubmitted) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitAssessment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSubmitted, handleSubmitAssessment]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPct = Math.round((answeredCount / questions.length) * 100);
  const allAnswered = questions.every((q) => selectedAnswers[q.id] !== undefined);

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6 pb-24 -mt-1">
      {/* Redirection Alert Notice */}
      {assessmentNotice && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 text-amber-900 flex items-start sm:items-center gap-3.5 shadow-md animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
          <div className="flex-1 text-xs sm:text-sm font-bold leading-relaxed">
            {assessmentNotice}
          </div>
        </div>
      )}

      {/* Assessment Header with Live Timer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2D9CC] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-[#1273C4] font-bold uppercase">
              {currentSubject.title} Assessment Session
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
              TIMED PROCTORED
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight font-serif">
            {currentTopic.title}
          </h1>
        </div>

        {/* Live Proctor Timer & Exit */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {!isSubmitted ? (
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-mono border transition-all shadow-xs ${
                timeLeft <= 180
                  ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse ring-2 ring-rose-200'
                  : timeLeft <= 300
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-white border-[#DDD5C7] text-[#0F172A]'
              }`}
            >
              {timeLeft <= 180 ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-[#1273C4] shrink-0" />
              )}
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[9px] uppercase tracking-wider text-[#64748B] font-sans font-bold">
                  Time Left
                </span>
                <span className="text-sm sm:text-base font-extrabold tracking-wider">{formatTime(timeLeft)}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl font-mono text-xs font-bold bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
              <span>Completed in {formatTime(TOTAL_ASSESSMENT_TIME - timeLeft)}</span>
            </div>
          )}

          <button
            onClick={() => switchTab('topic-explanation')}
            className="p-2.5 rounded-2xl bg-white hover:bg-[#F6F3EE] border border-[#DDD5C7] text-[#64748B] hover:text-[#0F172A] shadow-2xs transition-colors cursor-pointer"
            title="Exit Assessment"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Assessment Status & Progress Bar */}
      {!isSubmitted ? (
        <div className="space-y-3">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5DFD5] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#334155] flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#2563EB]" />
                <span>Overall Progress</span>
              </span>
              <span className="font-mono font-bold text-[#2563EB]">
                {answeredCount} of {questions.length} Answered ({progressPct}%)
              </span>
            </div>
            {/* Progress Bar Track */}
            <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {timeLeft <= 180 && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2.5 font-semibold animate-pulse">
              <AlertTriangle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
              <span>Warning: Less than 3 minutes remaining! Questions will automatically submit when the timer expires.</span>
            </div>
          )}
        </div>
      ) : (
        /* Assessment Completed Banner */
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5DFD5] shadow-xl space-y-4 text-center">
          <div className="w-16 h-16 rounded-3xl bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] mx-auto flex items-center justify-center shadow-sm">
            <Award className="w-9 h-9 text-[#059669]" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold text-[#059669] uppercase tracking-wider">
              Verification Completed
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-serif">Assessment Finished</h2>
            <p className="text-sm text-[#475569]">
              You scored <span className="font-bold text-[#059669]">{score}</span> out of{' '}
              <span className="font-bold text-[#0F172A]">{questions.length}</span> (
              {Math.round((score / questions.length) * 100)}%).
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={openChatLogin}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#1273C4] hover:bg-[#0D62A5] text-white font-bold text-sm shadow-md transition-all hover:scale-105 active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>CONTINUE TO CHAT</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSelectedAnswers({});
                setIsSubmitted(false);
                setTimeLeft(TOTAL_ASSESSMENT_TIME);
                setScore(0);
              }}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white hover:bg-[#F6F3EE] border border-[#DDD5C7] text-[#475569] font-bold text-xs transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retake Assessment</span>
            </button>
          </div>
        </div>
      )}

      {/* Question Navigation Palette */}
      {!isSubmitted && (
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E5DFD5] shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-[#475569]">
            <span className="font-mono font-bold uppercase tracking-wider text-[#1273C4]">
              Question Jump Palette
            </span>
            <span className="text-[11px] text-[#64748B]">Click any number to jump directly</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => {
              const isAnswered = selectedAnswers[q.id] !== undefined;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    const el = document.getElementById(`question-card-${q.id}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center border shadow-2xs cursor-pointer active:scale-90 ${
                    isAnswered
                      ? 'bg-[#10B981] text-white border-[#059669]'
                      : 'bg-[#FAF8F5] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F3EFE9] border-[#DDD5C7]'
                  }`}
                  title={`Question ${idx + 1}: ${isAnswered ? 'Answered' : 'Not Answered'}`}
                >
                  {idx + 1}
                </button>
              );
            })}
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
              id={`question-card-${q.id}`}
              className={`p-6 sm:p-7 rounded-3xl border transition-all shadow-xs ${
                isSubmitted
                  ? isCorrect
                    ? 'bg-[#F0FDF4] border-[#BBF7D0]'
                    : 'bg-[#FFF1F2] border-[#FECDD3]'
                  : 'bg-white border-[#E5DFD5]'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#EBF3FB] text-[#1D4ED8] font-mono text-xs font-bold flex items-center justify-center border border-[#BFDBFE] shrink-0">
                    Q{qIndex + 1}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-[#0F172A] font-serif leading-snug">
                    {q.question}
                  </h3>
                </div>

                {isSubmitted && (
                  <div>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#059669] font-mono">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Correct (+1)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#E11D48] font-mono">
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

                  let optClass = 'bg-[#FAF8F5] hover:bg-[#F3EFE9] border-[#DDD5C7] text-[#334155]';
                  if (isSelected && !isSubmitted) {
                    optClass = 'bg-[#EBF3FB] border-[#1273C4] text-[#1273C4] font-bold shadow-xs ring-1 ring-[#1273C4]/30';
                  } else if (isTheCorrectOption) {
                    optClass = 'bg-[#ECFDF5] border-[#10B981] text-[#065F46] font-bold';
                  } else if (isTheWrongSelection) {
                    optClass = 'bg-[#FFE4E6] border-[#F43F5E] text-[#9F1239]';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`w-full p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm text-left transition-all flex items-center justify-between cursor-pointer ${optClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full border border-current/40 flex items-center justify-center text-[11px] font-mono font-bold shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{option}</span>
                      </div>
                      {isTheCorrectOption && <CheckCircle2 className="w-4.5 h-4.5 text-[#059669] shrink-0" />}
                      {isTheWrongSelection && <XCircle className="w-4.5 h-4.5 text-[#E11D48] shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Explanation */}
              {isSubmitted && (
                <div className="mt-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] text-xs text-[#334155] leading-relaxed font-sans">
                  <strong className="text-[#1273C4]">Explanation: </strong>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      {!isSubmitted && (
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E5DFD5] shadow-md flex items-center justify-between gap-4">
          <div className="text-xs text-[#64748B] font-mono">
            {allAnswered ? 'All questions answered. Ready to submit.' : `${questions.length - answeredCount} question(s) remaining.`}
          </div>

          <button
            onClick={handleSubmitAssessment}
            disabled={!allAnswered}
            className={`px-7 py-3.5 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-md ${
              allAnswered
                ? 'bg-[#1273C4] hover:bg-[#0D62A5] text-white cursor-pointer active:scale-95'
                : 'bg-[#FAF8F5] text-[#94A3B8] border border-[#DDD5C7] cursor-not-allowed'
            }`}
          >
            Submit Assessment
          </button>
        </div>
      )}
    </div>
  );
};
