import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { SUBJECTS_DATA } from '../../data/curriculumData';
import { CheckCircle2, XCircle, Award, ArrowRight, HelpCircle, RefreshCw, X, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

const TOTAL_ASSESSMENT_TIME = 20 * 60; // 20 minutes in seconds

export const AssessmentModal: React.FC = () => {
  const { selectedTopic, selectedSubject, completeAssessment, openChatLogin, switchTab } = useStudyApp();

  const currentTopic = selectedTopic || SUBJECTS_DATA[0].topics[0];
  const currentSubject = selectedSubject || SUBJECTS_DATA[0];

  // Guarantee that every assessment session has more than 20 questions (25 questions)
  const questions = useMemo(() => {
    if (currentTopic?.assessmentQuestions && currentTopic.assessmentQuestions.length >= 20) {
      return currentTopic.assessmentQuestions;
    }
    // Aggregate questions from all topics within currentSubject
    const subjectQuestions = (currentSubject?.topics || []).flatMap((t) => t.assessmentQuestions || []);
    if (subjectQuestions.length >= 20) {
      return subjectQuestions;
    }
    // Supplement from the comprehensive 25-question engineering bank
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
      colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
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

  const allAnswered = questions.every((q) => selectedAnswers[q.id] !== undefined);

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6 pb-20">
      {/* Assessment Header with Live Timer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DFD5] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-[#1273C4] font-bold uppercase">
              {currentSubject.title} Assessment Session
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
              TIMED PROCTORED
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#1E293B] tracking-tight font-serif">
            {currentTopic.title}
          </h1>
        </div>

        {/* Live Proctor Timer & Exit */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {!isSubmitted ? (
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono border transition-all shadow-xs ${
                timeLeft <= 180
                  ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse ring-2 ring-rose-200'
                  : timeLeft <= 300
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-white border-[#DDD5C7] text-[#1E293B]'
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
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl font-mono text-xs font-bold bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46]">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
              <span>Time: {formatTime(TOTAL_ASSESSMENT_TIME - timeLeft)}</span>
            </div>
          )}

          <button
            onClick={() => switchTab('topic-explanation')}
            className="p-2.5 rounded-xl bg-white hover:bg-[#F6F3EE] border border-[#DDD5C7] text-[#64748B] hover:text-[#1E293B] shadow-2xs transition-colors"
            title="Exit Assessment"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Assessment Status / Instructions / Urgency Warning */}
      {!isSubmitted ? (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-[#EBF3FB] border border-[#BFDBFE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-[#1D4ED8]">
              <HelpCircle className="w-4 h-4 text-[#2563EB] shrink-0" />
              <span>Answer all {questions.length} questions before the countdown timer reaches 00:00.</span>
            </div>
            <span className="text-xs font-mono font-bold text-[#1D4ED8] bg-white/80 px-2.5 py-1 rounded-lg border border-[#BFDBFE]">
              {Object.keys(selectedAnswers).length}/{questions.length} Answered
            </span>
          </div>

          {timeLeft <= 180 && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Warning: Less than 3 minutes remaining! Questions will automatically submit when time expires.</span>
            </div>
          )}
        </div>
      ) : (
        /* Assessment Completed Banner */
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E5DFD5] shadow-xl space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] mx-auto flex items-center justify-center shadow-sm">
            <Award className="w-8 h-8 text-[#059669]" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold text-[#059669] uppercase tracking-wider">
              Verification Completed
            </div>
            <h2 className="text-2xl font-extrabold text-[#1E293B] font-serif">Assessment Finished</h2>
            <p className="text-sm text-[#475569]">
              You scored <span className="font-bold text-[#059669]">{score}</span> out of{' '}
              <span className="font-bold text-[#1E293B]">{questions.length}</span> (
              {Math.round((score / questions.length) * 100)}%).
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={openChatLogin}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#1273C4] hover:bg-[#0D62A5] text-white font-bold text-sm shadow-md transition-all hover:scale-105 active:scale-95 inline-flex items-center justify-center gap-2"
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
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white hover:bg-[#F6F3EE] border border-[#DDD5C7] text-[#475569] font-semibold text-xs transition-colors inline-flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retake Assessment</span>
            </button>
          </div>
        </div>
      )}

      {/* Question Navigation Palette (1..N) */}
      {!isSubmitted && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5DFD5] shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-[#475569]">
            <span className="font-mono font-bold uppercase tracking-wider text-[#1273C4]">
              Question Palette ({Object.keys(selectedAnswers).length}/{questions.length} Answered)
            </span>
            <span className="text-[11px] text-[#64748B]">Click any number to jump directly to that question</span>
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
                  className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center border shadow-2xs ${
                    isAnswered
                      ? 'bg-[#10B981] text-white border-[#059669]'
                      : 'bg-[#FAF8F5] text-[#64748B] hover:text-[#1E293B] hover:bg-[#F3EFE9] border-[#DDD5C7]'
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
              className={`p-6 rounded-2xl border transition-all shadow-sm ${
                isSubmitted
                  ? isCorrect
                    ? 'bg-[#F0FDF4] border-[#BBF7D0]'
                    : 'bg-[#FFF1F2] border-[#FECDD3]'
                  : 'bg-white border-[#E5DFD5]'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-[#EBF3FB] text-[#1D4ED8] font-mono text-xs font-bold flex items-center justify-center border border-[#BFDBFE]">
                    Q{qIndex + 1}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-[#1E293B] font-serif">{q.question}</h3>
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
                    optClass = 'bg-[#EBF3FB] border-[#1273C4] text-[#1273C4] font-bold shadow-2xs';
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
                      className={`w-full p-3.5 rounded-xl border text-xs sm:text-sm text-left transition-all flex items-center justify-between ${optClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full border border-current/40 flex items-center justify-center text-[10px] font-mono shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{option}</span>
                      </div>
                      {isTheCorrectOption && <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />}
                      {isTheWrongSelection && <XCircle className="w-4 h-4 text-[#E11D48] shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Explanation (shown after submission) */}
              {isSubmitted && (
                <div className="mt-4 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] text-xs text-[#334155] leading-relaxed font-sans">
                  <strong className="text-[#1273C4]">Explanation: </strong>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Button (if not yet submitted) */}
      {!isSubmitted && (
        <div className="p-4 rounded-2xl bg-white border border-[#E5DFD5] shadow-sm flex items-center justify-between gap-4">
          <div className="text-xs text-[#64748B] font-mono">
            {allAnswered ? 'All questions answered. Ready to submit.' : 'Please answer all questions above.'}
          </div>

          <button
            onClick={handleSubmitAssessment}
            disabled={!allAnswered}
            className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md ${
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
