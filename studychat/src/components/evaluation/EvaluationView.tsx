import React, { useState, useMemo } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import {
  getEvaluationHistory,
  getEvaluationStats,
  clearEvaluationHistory,
  EvaluationRecord,
  QuestionEvaluationItem
} from '../../data/evaluationStorage';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  Layers,
  GraduationCap,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileText,
  Printer,
  ChevronRight,
  Search,
  Filter,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  X,
  ExternalLink,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const EvaluationView: React.FC = () => {
  const { student, switchTab, openAssessmentQuiz, openDharyaLogin } = useStudyApp();
  const [history, setHistory] = useState<EvaluationRecord[]>(() => getEvaluationHistory());
  const [activeFilter, setActiveFilter] = useState<'all' | 'timed' | 'practice' | 'high_score'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<EvaluationRecord | null>(null);
  const [printableRecord, setPrintableRecord] = useState<EvaluationRecord | null>(null);

  const stats = useMemo(() => getEvaluationStats(), [history]);

  const filteredHistory = useMemo(() => {
    let list = history;
    if (activeFilter === 'timed') {
      list = list.filter((r) => r.mode === 'timed');
    } else if (activeFilter === 'practice') {
      list = list.filter((r) => r.mode === 'practice' || r.mode === 'topic-quiz');
    } else if (activeFilter === 'high_score') {
      list = list.filter((r) => r.percentage >= 90);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.subjectTitle.toLowerCase().includes(q) ||
          (r.domain && r.domain.toLowerCase().includes(q))
      );
    }

    return list;
  }, [history, activeFilter, searchQuery]);

  const handleClearHistory = () => {
    if (window.confirm('Reset evaluation history to initial benchmark diagnostics?')) {
      clearEvaluationHistory();
      setHistory(getEvaluationHistory());
    }
  };

  const handlePrintScorecard = (record: EvaluationRecord) => {
    setPrintableRecord(record);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    if (mins === 0) return `${remainder}s`;
    return `${mins}m ${remainder}s`;
  };

  return (
    <div className="space-y-8 pb-20">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#FAF8F5] to-[#F1ECE4] rounded-3xl p-6 sm:p-8 border border-[#E5DFD5] shadow-sm">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Official Academic Evaluation Record</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight font-serif">
              Assessment Results &amp; Evaluation
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl leading-relaxed">
              Continuous examination transcripts, GATE mock scores, and domain competency analytics for candidate{' '}
              <strong className="text-[#0F172A] font-semibold">{student?.name || 'Surya'}</strong> (
              <span className="font-mono">{student?.studentId || 'ENG-2024-0910'}</span>).
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => openAssessmentQuiz()}
              className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-95"
            >
              <Award className="w-4 h-4" />
              <span>Take New Assessment</span>
            </button>
            <button
              onClick={() => openDharyaLogin()}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-[#E2E8F0] text-[#1E293B] text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-95"
              title="Student Assessment Verification Login"
            >
              <ShieldCheck className="w-4 h-4 text-[#1273C4]" />
              <span>Assessment Login</span>
            </button>
            <button
              onClick={handleClearHistory}
              className="p-2.5 rounded-xl bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 text-xs transition-colors cursor-pointer"
              title="Reset Assessment History"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Performance Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Overall Average */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5DFD5] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-medium uppercase tracking-wider">Average Score</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#0F172A] font-mono">
              {stats.averageScorePercentage}%
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Grade A+
            </span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">Across all completed test modules</p>
        </div>

        {/* Metric 2: Total Assessments */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5DFD5] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-medium uppercase tracking-wider">Completed Tests</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#0F172A] font-mono">
              {stats.totalAssessments}
            </span>
            <span className="text-xs text-[#64748B] font-mono">Evaluations</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">{stats.totalQuestionsAnswered} questions evaluated</p>
        </div>

        {/* Metric 3: Pass Rate */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5DFD5] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-medium uppercase tracking-wider">Pass Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
              {stats.passRatePercentage}%
            </span>
            <span className="text-xs text-[#64748B]">({stats.totalPassed}/{stats.totalAssessments})</span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">Passing threshold: 50%</p>
        </div>

        {/* Metric 4: Average Speed */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5DFD5] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-medium uppercase tracking-wider">Average Duration</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#0F172A] font-mono">
              {formatDuration(stats.averageDurationSeconds)}
            </span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">Pacing within standard GATE time limits</p>
        </div>
      </div>

      {/* 3. Domain Competency Breakdown */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5DFD5] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1ECE4] pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#0F172A] flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span>Subject &amp; Domain Competency Matrix</span>
            </h2>
            <p className="text-xs text-[#64748B]">
              Aggregate proficiency calculated from proctored exams and self-paced assessments
            </p>
          </div>
          <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            6 Core Domains Tracked
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {stats.domainProficiency.map((domain, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE5DB] space-y-2.5 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F172A] truncate max-w-[180px]">
                  {domain.name}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    domain.status === 'Mastered'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : domain.status === 'Proficient'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {domain.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#E2D9CC]/60 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    domain.percentage >= 90
                      ? 'bg-emerald-500'
                      : domain.percentage >= 75
                      ? 'bg-blue-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${domain.percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                <span>{domain.completed} Assessments Taken</span>
                <span className="font-mono font-bold text-[#0F172A]">{domain.percentage}% Score</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#E5DFD5] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'bg-[#F1ECE4] text-[#475569] hover:bg-[#E5DFD5]'
            }`}
          >
            All Results ({history.length})
          </button>
          <button
            onClick={() => setActiveFilter('timed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'timed'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-[#F1ECE4] text-[#475569] hover:bg-[#E5DFD5]'
            }`}
          >
            Timed Exams
          </button>
          <button
            onClick={() => setActiveFilter('practice')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'practice'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-[#F1ECE4] text-[#475569] hover:bg-[#E5DFD5]'
            }`}
          >
            Practice &amp; Topic Quizzes
          </button>
          <button
            onClick={() => setActiveFilter('high_score')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'high_score'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-[#F1ECE4] text-[#475569] hover:bg-[#E5DFD5]'
            }`}
          >
            Grade A+ (90%+)
          </button>
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search test by title or topic..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* 5. Assessment Results Table & Cards */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E5DFD5] space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A]">No Assessment Records Found</h3>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">
              No matching records for your current search or filter. Take an assessment to see your live score breakdown.
            </p>
            <button
              onClick={() => openAssessmentQuiz()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
            >
              Start New Test
            </button>
          </div>
        ) : (
          filteredHistory.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5DFD5] shadow-xs hover:border-blue-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
            >
              {/* Left Column: Title & Metadata */}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                      record.mode === 'timed'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {record.mode === 'timed' ? '⏱️ Timed Proctored' : '⚡ Rapid Practice'}
                  </span>
                  <span className="text-[11px] text-[#64748B] font-mono">
                    {new Date(record.completedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}{' '}
                    •{' '}
                    {new Date(record.completedAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(record.durationSeconds)}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#0F172A] leading-snug">
                  {record.title}
                </h3>
                <p className="text-xs text-[#64748B] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <span>Subject: {record.subjectTitle}</span>
                </p>
              </div>

              {/* Middle Column: Score Pill & Percentage */}
              <div className="flex items-center gap-4 bg-[#FAF8F5] p-3 rounded-2xl border border-[#EBE5DB]">
                <div className="text-center px-2">
                  <div className="text-xl sm:text-2xl font-black text-[#0F172A] font-mono">
                    {record.score}/{record.total}
                  </div>
                  <div className="text-[10px] font-semibold text-[#64748B] uppercase">Raw Score</div>
                </div>

                <div className="h-8 w-px bg-[#E2E8F0]" />

                <div className="text-center px-2">
                  <div
                    className={`text-xl sm:text-2xl font-black font-mono ${
                      record.percentage >= 90
                        ? 'text-emerald-600'
                        : record.percentage >= 70
                        ? 'text-blue-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {record.percentage}%
                  </div>
                  <div className="text-[10px] font-semibold text-[#64748B] uppercase">Percentage</div>
                </div>

                <div className="h-8 w-px bg-[#E2E8F0]" />

                <div className="text-center px-2">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-xl text-xs font-black font-mono border ${
                      record.grade === 'A+'
                        ? 'bg-purple-100 text-purple-800 border-purple-200'
                        : record.grade === 'A'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-blue-100 text-blue-800 border-blue-200'
                    }`}
                  >
                    {record.grade}
                  </span>
                  <div className="text-[9px] font-bold text-emerald-700 uppercase mt-0.5">PASSED</div>
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex sm:flex-col lg:flex-row items-center gap-2">
                <button
                  onClick={() => setSelectedRecordForDetail(record)}
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white border border-[#CBD5E1] hover:border-blue-500 hover:text-blue-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Review Solutions</span>
                </button>
                <button
                  onClick={() => handlePrintScorecard(record)}
                  className="px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E2E8F0] hover:bg-slate-100 text-[#475569] hover:text-[#0F172A] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Print Official Transcript"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Scorecard</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 6. Detailed Question-by-Question Solution Modal */}
      {selectedRecordForDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-3xl border border-[#E5DFD5] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-[#FAF8F5] border-b border-[#E5DFD5] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
                    {selectedRecordForDetail.subjectTitle}
                  </span>
                  <span className="text-xs text-[#64748B]">
                    Score: {selectedRecordForDetail.score}/{selectedRecordForDetail.total} ({selectedRecordForDetail.percentage}%)
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#0F172A] mt-1 font-serif">
                  {selectedRecordForDetail.title} — Solution Review
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecordForDetail(null)}
                className="w-8 h-8 rounded-full bg-white border border-[#CBD5E1] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Questions Scroll Area */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
              {selectedRecordForDetail.questions && selectedRecordForDetail.questions.length > 0 ? (
                selectedRecordForDetail.questions.map((q, idx) => {
                  const isCorrect = q.isCorrect;
                  return (
                    <div
                      key={q.id || idx}
                      className={`p-5 rounded-2xl border transition-all ${
                        isCorrect
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-rose-50/40 border-rose-200'
                      }`}
                    >
                      {/* Question Index & Status Badge */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-mono font-bold text-[#64748B]">
                          Question {idx + 1} of {selectedRecordForDetail.questions.length}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            isCorrect
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isCorrect ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {isCorrect ? 'Correct (+1.0)' : 'Incorrect (0.0)'}
                        </span>
                      </div>

                      {/* Question Text */}
                      <p className="text-sm font-bold text-[#0F172A] mb-3 leading-relaxed">
                        {q.question}
                      </p>

                      {/* Options List */}
                      <div className="space-y-2 mb-3">
                        {q.options.map((opt, optIdx) => {
                          const isUserSelected = q.userAnswerIndex === optIdx;
                          const isActualCorrect = q.correctAnswerIndex === optIdx;

                          let optClass = 'bg-white border-[#E2E8F0] text-[#334155]';
                          if (isActualCorrect) {
                            optClass = 'bg-emerald-100/80 border-emerald-400 text-emerald-950 font-semibold';
                          } else if (isUserSelected && !isActualCorrect) {
                            optClass = 'bg-rose-100/80 border-rose-400 text-rose-950 line-through';
                          }

                          return (
                            <div
                              key={optIdx}
                              className={`p-2.5 rounded-xl text-xs border flex items-center justify-between gap-2 ${optClass}`}
                            >
                              <span>
                                <strong className="font-mono mr-1.5">
                                  {String.fromCharCode(65 + optIdx)}.
                                </strong>
                                {opt}
                              </span>
                              {isActualCorrect && (
                                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-white/80 px-1.5 py-0.5 rounded">
                                  Correct Answer
                                </span>
                              )}
                              {isUserSelected && !isActualCorrect && (
                                <span className="text-[10px] uppercase font-bold text-rose-700 bg-white/80 px-1.5 py-0.5 rounded">
                                  Your Choice
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation Callout */}
                      <div className="p-3 bg-white/80 rounded-xl border border-slate-200 text-xs text-[#334155] space-y-1">
                        <div className="flex items-center gap-1 font-bold text-blue-700">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Detailed Explanation:</span>
                        </div>
                        <p className="leading-relaxed pl-4 text-[#475569]">{q.explanation}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-[#64748B] text-xs">
                  Detailed question logs for this legacy attempt were aggregated into the raw score.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#FAF8F5] border-t border-[#E5DFD5] flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedRecordForDetail(null)}
                className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-semibold cursor-pointer"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Printable Institutional Scorecard View (hidden until print) */}
      {printableRecord && (
        <div className="hidden print:block fixed inset-0 z-50 bg-white p-8 text-black">
          <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black font-serif tracking-tight">ENGIHUB ACADEMIC PORTAL</h1>
              <p className="text-xs uppercase tracking-wider text-gray-600">
                Official Examination Transcript &amp; Competency Certificate
              </p>
            </div>
            <div className="text-right font-mono text-xs">
              <div>Date: {new Date(printableRecord.completedAt).toLocaleDateString()}</div>
              <div>Cert ID: {printableRecord.id}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div><strong>Candidate Name:</strong> {student?.name || 'Surya'}</div>
            <div><strong>Student ID:</strong> {student?.studentId || 'ENG-2024-0910'}</div>
            <div><strong>Department:</strong> {student?.department || 'Computer Science & Engineering'}</div>
            <div><strong>Semester:</strong> {student?.semester || 'Semester 4'}</div>
          </div>

          <div className="border border-gray-300 rounded p-4 mb-6">
            <h2 className="text-base font-bold mb-2">{printableRecord.title}</h2>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>Score: <strong>{printableRecord.score} / {printableRecord.total}</strong></div>
              <div>Percentage: <strong>{printableRecord.percentage}%</strong></div>
              <div>Grade: <strong>{printableRecord.grade} (PASSED)</strong></div>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-12 border-t pt-4">
            This transcript is digitally generated by EngiHub Academic Assessment Engine in compliance with AICTE model curricula.
          </p>
        </div>
      )}
    </div>
  );
};
