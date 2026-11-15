import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { SUBJECTS_DATA } from '../../data/curriculumData';
import {
  getQuestionsForSubject,
  getComprehensiveExamQuestions,
  SUBJECT_QUESTION_BANKS,
  AssessmentQuestion
} from '../../data/assessmentQuestionBank';
import {
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  HelpCircle,
  RefreshCw,
  X,
  Clock,
  AlertTriangle,
  BookOpen,
  Layers,
  GraduationCap,
  Zap,
  Target,
  Bookmark,
  Check,
  RotateCcw,
  Sparkles,
  Filter,
  CheckSquare,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  saveEvaluationRecord,
  calculateGrade,
  EvaluationRecord
} from '../../data/evaluationStorage';

type ExamMode = 'timed' | 'practice';
type ReviewFilter = 'all' | 'wrong' | 'correct';

export const AssessmentModal: React.FC = () => {
  const { selectedTopic, selectedSubject, completeAssessment, openChatLogin, switchTab, assessmentNotice } = useStudyApp();

  const currentTopic = selectedTopic || SUBJECTS_DATA[0].topics[0];
  const currentSubject = selectedSubject || SUBJECTS_DATA[0];

  // Configurable Exam Mode: Timed Mock GATE Exam vs Rapid Practice Mode
  const [examMode, setExamMode] = useState<ExamMode>('timed');
  const [questionCount, setQuestionCount] = useState<number>(25);
  const [enableNegativeMarking, setEnableNegativeMarking] = useState<boolean>(true);

  // Subject selector state: default to current subject, or allow switching to comprehensive / other subjects
  const [activeSubjectFilter, setActiveSubjectFilter] = useState<string>(() => {
    return currentSubject?.id || 'all';
  });

  // Track marked for review questions
  const [flaggedForReview, setFlaggedForReview] = useState<Record<string, boolean>>({});

  // Post-submission filter (all, wrong, correct)
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all');

  // Question bank sampling based on chosen subject and count
  const questions: AssessmentQuestion[] = useMemo(() => {
    if (activeSubjectFilter === 'all') {
      return getComprehensiveExamQuestions(questionCount);
    }
    return getQuestionsForSubject(activeSubjectFilter, questionCount);
  }, [activeSubjectFilter, questionCount]);

  // Scaled time based on question count: 10 Qs = 8 mins, 15 Qs = 12 mins, 25 Qs = 20 mins
  const totalExamTime = useMemo(() => {
    if (questionCount === 10) return 8 * 60;
    if (questionCount === 15) return 12 * 60;
    return 20 * 60;
  }, [questionCount]);

  // Track selected options: { questionId: selectedOptionIndex }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(totalExamTime);

  // Reset timer whenever question count or mode changes
  useEffect(() => {
    setTimeLeft(totalExamTime);
  }, [totalExamTime, examMode]);

  const selectedAnswersRef = useRef(selectedAnswers);
  selectedAnswersRef.current = selectedAnswers;

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted && examMode === 'timed') return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const toggleFlagForReview = (questionId: string) => {
    setFlaggedForReview((prev) => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleSubjectChange = (newSubjectId: string) => {
    setActiveSubjectFilter(newSubjectId);
    setSelectedAnswers({});
    setFlaggedForReview({});
    setIsSubmitted(false);
    setScore(0);
    setTimeLeft(totalExamTime);
    setReviewFilter('all');
  };

  const handleCountChange = (count: number) => {
    setQuestionCount(count);
    setSelectedAnswers({});
    setFlaggedForReview({});
    setIsSubmitted(false);
    setScore(0);
    setReviewFilter('all');
  };

  const handleSubmitAssessment = useCallback(() => {
    let correctCount = 0;
    const answers = selectedAnswersRef.current;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    setScore(correctCount);
    setIsSubmitted(true);
    completeAssessment(correctCount, questions.length);

    // Save comprehensive evaluation record with question breakdown
    const pct = Math.round((correctCount / Math.max(1, questions.length)) * 100);
    const evalRecord: EvaluationRecord = {
      id: `eval-${Date.now()}`,
      title: activeSubjectFilter === 'all' ? `GATE Comprehensive Engineering Mock (${questions.length}Q)` : `${currentSubject.title} Proctored Evaluation`,
      subjectTitle: currentSubject.title,
      subjectId: activeSubjectFilter,
      mode: examMode,
      score: correctCount,
      total: questions.length,
      percentage: pct,
      grade: calculateGrade(pct),
      passed: pct >= 50,
      durationSeconds: Math.max(30, totalExamTime - timeLeft),
      completedAt: Date.now(),
      domain: currentSubject.title,
      questions: questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        userAnswerIndex: answers[q.id],
        correctAnswerIndex: q.correctIndex,
        isCorrect: answers[q.id] === q.correctIndex,
        explanation: q.explanation
      }))
    };
    saveEvaluationRecord(evalRecord);

    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#10b981', '#f59e0b', '#ec4899'],
    });
  }, [questions, completeAssessment]);

  // Live Countdown Timer (Active only in Timed mode and before submission)
  useEffect(() => {
    if (isSubmitted || examMode !== 'timed') return;

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
  }, [isSubmitted, examMode, handleSubmitAssessment]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPct = Math.round((answeredCount / questions.length) * 100);
  const allAnswered = questions.every((q) => selectedAnswers[q.id] !== undefined);

  // GATE Net Score Calculation with Negative Marking
  const netGateScore = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    questions.forEach((q) => {
      const ans = selectedAnswers[q.id];
      if (ans !== undefined) {
        if (ans === q.correctIndex) {
          correct += 1;
        } else {
          wrong += 1;
        }
      }
    });
    if (!enableNegativeMarking) return correct;
    const net = correct - (wrong * 0.33);
    return Math.max(0, parseFloat(net.toFixed(2)));
  }, [questions, selectedAnswers, enableNegativeMarking]);

  // Filtered questions for post-submission review
  const displayedQuestions = useMemo(() => {
    if (!isSubmitted || reviewFilter === 'all') return questions;
    return questions.filter((q) => {
      const userAns = selectedAnswers[q.id];
      const isCorrect = userAns === q.correctIndex;
      if (reviewFilter === 'wrong') return !isCorrect;
      if (reviewFilter === 'correct') return isCorrect;
      return true;
    });
  }, [questions, isSubmitted, reviewFilter, selectedAnswers]);

  // Handler to retry only incorrect questions
  const handleRetryIncorrect = () => {
    const updatedAnswers = { ...selectedAnswers };
    questions.forEach((q) => {
      if (updatedAnswers[q.id] !== q.correctIndex) {
        delete updatedAnswers[q.id];
      }
    });
    setSelectedAnswers(updatedAnswers);
    setIsSubmitted(false);
    setReviewFilter('all');
    setTimeLeft(totalExamTime);
  };

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

      {/* Assessment Header with Mode Selector & Timer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2D9CC] pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-mono text-[#1273C4] font-bold uppercase">
              {activeSubjectFilter === 'all'
                ? 'Engineering Gate Portal'
                : `${SUBJECTS_DATA.find((s) => s.id === activeSubjectFilter)?.title || currentSubject.title}`}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border shadow-2xs ${
                examMode === 'timed'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-emerald-100 text-emerald-900 border-emerald-300'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  examMode === 'timed' ? 'bg-amber-600 animate-ping' : 'bg-emerald-600'
                }`}
              />
              {examMode === 'timed' ? `TIMED EXAM • ${questionCount} QUESTIONS` : `RAPID PRACTICE MODE`}
            </span>
            {enableNegativeMarking && examMode === 'timed' && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                -0.33 NEGATIVE
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight font-serif">
            {activeSubjectFilter === 'all'
              ? 'Accredited Model Engineering Examination'
              : SUBJECTS_DATA.find((s) => s.id === activeSubjectFilter)?.title || currentSubject.title}
          </h1>
        </div>

        {/* Live Proctor Timer / Mode Badge & Exit */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {!isSubmitted ? (
            examMode === 'timed' ? (
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
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl font-mono text-xs font-bold bg-emerald-50 border border-emerald-300 text-emerald-800 shadow-2xs">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>Self-Paced Practice</span>
              </div>
            )
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl font-mono text-xs font-bold bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
              <span>Completed in {formatTime(totalExamTime - timeLeft)}</span>
            </div>
          )}

          <button
            onClick={() => switchTab('home')}
            className="p-2.5 rounded-2xl bg-white hover:bg-[#F6F3EE] border border-[#DDD5C7] text-[#64748B] hover:text-[#0F172A] shadow-2xs transition-colors cursor-pointer"
            title="Return to Library Hub"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Assessment Controls: Mode Switcher + Question Count + Negative Marking */}
      {!isSubmitted && (
        <div className="bg-white p-4 rounded-3xl border border-[#E5DFD5] shadow-xs space-y-3.5">
          {/* Mode Switcher Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-[#F1EBE1]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5 font-mono uppercase tracking-wider">
                <Target className="w-3.5 h-3.5 text-[#1273C4]" />
                <span>Exam Mode:</span>
              </span>
              <div className="inline-flex p-1 bg-[#F1EBE1] rounded-xl border border-[#E2D9CC]">
                <button
                  type="button"
                  onClick={() => setExamMode('timed')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    examMode === 'timed'
                      ? 'bg-white text-[#1273C4] shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Timed Exam</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExamMode('practice')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    examMode === 'practice'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Instant Practice</span>
                </button>
              </div>
            </div>

            {/* Question Count Selector & Negative Marking Toggle */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono text-[#64748B]">Questions:</span>
                {[10, 15, 25].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => handleCountChange(cnt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer border ${
                      questionCount === cnt
                        ? 'bg-[#1273C4] text-white border-[#1273C4] shadow-2xs'
                        : 'bg-[#FAF8F5] text-[#64748B] border-[#DDD5C7] hover:bg-white'
                    }`}
                  >
                    {cnt}Q
                  </button>
                ))}
              </div>

              {examMode === 'timed' && (
                <button
                  type="button"
                  onClick={() => setEnableNegativeMarking(!enableNegativeMarking)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer border flex items-center gap-1 ${
                    enableNegativeMarking
                      ? 'bg-rose-50 border-rose-300 text-rose-700'
                      : 'bg-[#FAF8F5] border-[#DDD5C7] text-[#64748B]'
                  }`}
                  title="Toggle GATE Negative Marking (-0.33 per wrong answer)"
                >
                  <ShieldAlert className="w-3 h-3" />
                  <span>{enableNegativeMarking ? 'GATE Negative ON' : 'Negative OFF'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Subject / Discipline Selector for Targeted Assessment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#0F172A] flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5 text-[#1273C4]" />
                <span>Question Bank Discipline</span>
              </span>
              <span className="text-[10px] text-[#1273C4] font-mono font-bold bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                {questions.length} Questions Loaded
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
              <button
                type="button"
                onClick={() => handleSubjectChange('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeSubjectFilter === 'all'
                    ? 'bg-[#1273C4] text-white shadow-xs font-bold'
                    : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9] border border-[#E2E8F0]'
                }`}
              >
                ★ Mock GATE (All Disciplines)
              </button>
              {SUBJECTS_DATA.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => handleSubjectChange(sub.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeSubjectFilter === sub.id
                      ? 'bg-[#1273C4] text-white shadow-xs font-bold'
                      : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9] border border-[#E2E8F0]'
                  }`}
                >
                  <span>{sub.icon}</span>
                  <span>{sub.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Assessment Status & Progress Bar */}
      {!isSubmitted ? (
        <div className="space-y-3">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5DFD5] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#334155] flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#1273C4]" />
                <span>Overall Assessment Progress</span>
              </span>
              <span className="font-mono font-bold text-[#1273C4]">
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

          {examMode === 'timed' && timeLeft <= 180 && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2.5 font-semibold animate-pulse">
              <AlertTriangle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
              <span>Warning: Less than 3 minutes remaining! Questions will automatically submit when the timer expires.</span>
            </div>
          )}
        </div>
      ) : (
        /* Assessment Completed Performance Analytics Banner */
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5DFD5] shadow-xl space-y-5 text-center">
          <div className="w-16 h-16 rounded-3xl bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] mx-auto flex items-center justify-center shadow-sm">
            <Award className="w-9 h-9 text-[#059669]" />
          </div>

          <div className="space-y-1">
            <div className="text-xs font-mono font-bold text-[#059669] uppercase tracking-wider">
              Verification & Assessment Evaluation
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-serif">Assessment Complete</h2>
          </div>

          {/* Performance Grid Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto text-left">
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
              <div className="text-[10px] font-mono uppercase text-emerald-800 font-bold">Raw Score</div>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-700">
                {score} / {questions.length}
              </div>
              <div className="text-[10px] text-emerald-600 font-medium">
                {Math.round((score / questions.length) * 100)}% Accuracy
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200">
              <div className="text-[10px] font-mono uppercase text-blue-800 font-bold">GATE Net Marks</div>
              <div className="text-xl sm:text-2xl font-extrabold text-[#1273C4]">
                {netGateScore}
              </div>
              <div className="text-[10px] text-blue-600 font-medium">
                {enableNegativeMarking ? '(-0.33 per error)' : 'Without Penalty'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200">
              <div className="text-[10px] font-mono uppercase text-amber-800 font-bold">Time Taken</div>
              <div className="text-xl sm:text-2xl font-extrabold text-amber-700">
                {formatTime(totalExamTime - timeLeft)}
              </div>
              <div className="text-[10px] text-amber-600 font-medium">Paced Speed</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200">
              <div className="text-[10px] font-mono uppercase text-purple-800 font-bold">Incorrect</div>
              <div className="text-xl sm:text-2xl font-extrabold text-purple-700">
                {questions.length - score}
              </div>
              <div className="text-[10px] text-purple-600 font-medium">Review Needed</div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => switchTab('evaluation')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>View In Evaluation Transcript</span>
            </button>

            <button
              onClick={openChatLogin}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#1273C4] hover:bg-[#0D62A5] text-white font-bold text-sm shadow-md transition-all hover:scale-105 active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>PROCEED TO STUDENT PORTAL</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {questions.length - score > 0 && (
              <button
                onClick={handleRetryIncorrect}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Incorrect ({questions.length - score})</span>
              </button>
            )}

            <button
              onClick={() => {
                setSelectedAnswers({});
                setFlaggedForReview({});
                setIsSubmitted(false);
                setTimeLeft(totalExamTime);
                setScore(0);
                setReviewFilter('all');
              }}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white hover:bg-[#F6F3EE] border border-[#DDD5C7] text-[#475569] font-bold text-xs transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Full Retake</span>
            </button>
          </div>
        </div>
      )}

      {/* Question Navigation Palette & Filter Strip */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E5DFD5] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#475569]">
          <span className="font-mono font-bold uppercase tracking-wider text-[#1273C4] flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            <span>Question Jump Palette</span>
          </span>

          {/* Post-submission Review Filter Tabs */}
          {isSubmitted && (
            <div className="inline-flex p-1 bg-[#F1EBE1] rounded-xl border border-[#E2D9CC]">
              <button
                type="button"
                onClick={() => setReviewFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  reviewFilter === 'all' ? 'bg-white text-[#1273C4] shadow-xs' : 'text-[#64748B]'
                }`}
              >
                All ({questions.length})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('wrong')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  reviewFilter === 'wrong' ? 'bg-rose-500 text-white shadow-xs' : 'text-[#64748B]'
                }`}
              >
                Mistakes ({questions.length - score})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('correct')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  reviewFilter === 'correct' ? 'bg-emerald-600 text-white shadow-xs' : 'text-[#64748B]'
                }`}
              >
                Correct ({score})
              </button>
            </div>
          )}

          {!isSubmitted && (
            <div className="flex items-center gap-3 text-[11px] text-[#64748B]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Answered
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Flagged
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E2E8F0]" /> Unanswered
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {questions.map((q, idx) => {
            const isAnswered = selectedAnswers[q.id] !== undefined;
            const isFlagged = flaggedForReview[q.id];
            const isCorrect = isSubmitted && selectedAnswers[q.id] === q.correctIndex;
            const isWrong = isSubmitted && selectedAnswers[q.id] !== undefined && !isCorrect;

            let badgeStyle = 'bg-[#FAF8F5] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F3EFE9] border-[#DDD5C7]';
            if (isSubmitted) {
              if (isCorrect) badgeStyle = 'bg-[#10B981] text-white border-[#059669]';
              else if (isWrong) badgeStyle = 'bg-[#F43F5E] text-white border-[#E11D48]';
              else badgeStyle = 'bg-[#F1F5F9] text-[#94A3B8] border-[#CBD5E1]';
            } else {
              if (isFlagged) badgeStyle = 'bg-amber-400 text-amber-950 border-amber-500 font-extrabold ring-1 ring-amber-300';
              else if (isAnswered) badgeStyle = 'bg-[#10B981] text-white border-[#059669]';
            }

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  const el = document.getElementById(`question-card-${q.id}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center border shadow-2xs cursor-pointer active:scale-90 ${badgeStyle}`}
                title={`Question ${idx + 1}: ${
                  isSubmitted ? (isCorrect ? 'Correct' : 'Incorrect') : isAnswered ? 'Answered' : 'Unanswered'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {displayedQuestions.map((q, qIndex) => {
          const selectedOption = selectedAnswers[q.id];
          const hasAnsweredThis = selectedOption !== undefined;
          const isFlagged = flaggedForReview[q.id];

          // In practice mode, feedback is instant immediately after answering this question
          const showFeedback = isSubmitted || (examMode === 'practice' && hasAnsweredThis);
          const isCorrect = showFeedback && selectedOption === q.correctIndex;
          const isWrong = showFeedback && hasAnsweredThis && selectedOption !== q.correctIndex;

          return (
            <div
              key={q.id}
              id={`question-card-${q.id}`}
              className={`p-6 sm:p-7 rounded-3xl border transition-all shadow-xs ${
                showFeedback
                  ? isCorrect
                    ? 'bg-[#F0FDF4] border-[#BBF7D0]'
                    : 'bg-[#FFF1F2] border-[#FECDD3]'
                  : 'bg-white border-[#E5DFD5]'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#EBF3FB] text-[#1D4ED8] font-mono text-xs font-bold flex items-center justify-center border border-[#BFDBFE] shrink-0">
                    Q{questions.findIndex((item) => item.id === q.id) + 1}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-[#0F172A] font-serif leading-snug">
                    {q.question}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Flag for Review Toggle */}
                  {!isSubmitted && (
                    <button
                      type="button"
                      onClick={() => toggleFlagForReview(q.id)}
                      className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                        isFlagged
                          ? 'bg-amber-100 border-amber-300 text-amber-800'
                          : 'bg-[#FAF8F5] border-[#DDD5C7] text-[#94A3B8] hover:text-[#0F172A]'
                      }`}
                      title={isFlagged ? 'Flagged for Review' : 'Mark for Review'}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  )}

                  {showFeedback && (
                    <div>
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#059669] font-mono">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Correct (+1)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#E11D48] font-mono">
                          <XCircle className="w-4 h-4" />
                          <span>{enableNegativeMarking && examMode === 'timed' ? 'Incorrect (-0.33)' : 'Incorrect'}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Options Grid */}
              <div className="space-y-2.5">
                {q.options.map((option, optIdx) => {
                  const isSelected = selectedOption === optIdx;
                  const isTheCorrectOption = showFeedback && optIdx === q.correctIndex;
                  const isTheWrongSelection = showFeedback && isSelected && !isCorrect;

                  let optClass = 'bg-[#FAF8F5] hover:bg-[#F3EFE9] border-[#DDD5C7] text-[#334155]';
                  if (isSelected && !showFeedback) {
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

              {/* Feedback Explanation (revealed upon submit or instant practice click) */}
              {showFeedback && (
                <div className="mt-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] text-xs text-[#334155] leading-relaxed font-sans">
                  <div className="flex items-center gap-1.5 font-bold text-[#1273C4] mb-1 font-mono uppercase text-[11px]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Solution & Engineering Rationale</span>
                  </div>
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
            {allAnswered
              ? 'All questions answered. Ready to submit.'
              : `${questions.length - answeredCount} question(s) remaining.`}
          </div>

          <button
            onClick={handleSubmitAssessment}
            disabled={!allAnswered && examMode === 'timed'}
            className={`px-7 py-3.5 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-md ${
              allAnswered || examMode === 'practice'
                ? 'bg-[#1273C4] hover:bg-[#0D62A5] text-white cursor-pointer active:scale-95'
                : 'bg-[#FAF8F5] text-[#94A3B8] border border-[#DDD5C7] cursor-not-allowed'
            }`}
          >
            {examMode === 'practice' ? 'Finish Practice Session' : 'Submit Assessment'}
          </button>
        </div>
      )}
    </div>
  );
};
