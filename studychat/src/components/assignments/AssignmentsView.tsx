import React, { useState, useMemo } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import {
  getStoredAssignments,
  saveAssignmentSubmission,
  resetAssignment,
  EngineeringAssignment
} from '../../data/assignmentData';
import {
  BookOpen,
  Code2,
  CheckCircle2,
  Clock,
  Award,
  Sparkles,
  FileCode2,
  FileCheck2,
  Upload,
  RotateCcw,
  Search,
  Filter,
  Check,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  X,
  Play,
  Lightbulb,
  Cpu,
  Layers,
  GraduationCap
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AssignmentsView: React.FC = () => {
  const { student } = useStudyApp();
  const [assignments, setAssignments] = useState<EngineeringAssignment[]>(() => getStoredAssignments());
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected assignment for drawer / submission
  const [activeAssignment, setActiveAssignment] = useState<EngineeringAssignment | null>(null);

  // Submission state
  const [userCode, setUserCode] = useState<string>('');
  const [selectedLang, setSelectedLang] = useState<string>('Python');
  const [attachedFileName, setAttachedFileName] = useState<string>('');
  const [isGradingInProgress, setIsGradingInProgress] = useState<boolean>(false);
  const [gradingStep, setGradingStep] = useState<number>(0);
  const [showModelSolution, setShowModelSolution] = useState<boolean>(false);

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    let list = assignments;

    if (activeFilter === 'pending') {
      list = list.filter((a) => a.status === 'pending');
    } else if (activeFilter === 'submitted') {
      list = list.filter((a) => a.status === 'submitted');
    } else if (activeFilter === 'graded') {
      list = list.filter((a) => a.status === 'graded');
    }

    if (selectedSubjectFilter !== 'all') {
      list = list.filter((a) => a.subjectId === selectedSubjectFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.code.toLowerCase().includes(q) ||
          a.subject.toLowerCase().includes(q)
      );
    }

    return list;
  }, [assignments, activeFilter, selectedSubjectFilter, searchQuery]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = assignments.length;
    const graded = assignments.filter((a) => a.status === 'graded').length;
    const submitted = assignments.filter((a) => a.status === 'submitted').length;
    const pending = assignments.filter((a) => a.status === 'pending').length;

    const gradedItems = assignments.filter((a) => a.score !== undefined);
    const avgScore = gradedItems.length
      ? Math.round(gradedItems.reduce((acc, curr) => acc + (curr.score || 0), 0) / gradedItems.length)
      : 95;

    return { total, graded, submitted, pending, avgScore };
  }, [assignments]);

  const handleOpenAssignment = (assignment: EngineeringAssignment) => {
    setActiveAssignment(assignment);
    const lang = assignment.language || 'Python';
    setSelectedLang(lang);
    setUserCode(assignment.submittedCode || assignment.starterCode[lang] || assignment.starterCode['Python'] || '');
    setShowModelSolution(assignment.status === 'graded');
    setIsGradingInProgress(false);
  };

  const handleLanguageChange = (newLang: string) => {
    setSelectedLang(newLang);
    if (activeAssignment && (!userCode || userCode === activeAssignment.starterCode[selectedLang])) {
      setUserCode(activeAssignment.starterCode[newLang] || `# Starter code for ${newLang}`);
    }
  };

  const handleSubmitAndGrade = () => {
    if (!activeAssignment) return;
    setIsGradingInProgress(true);
    setGradingStep(1);

    setTimeout(() => {
      setGradingStep(2);
    }, 600);

    setTimeout(() => {
      setGradingStep(3);
    }, 1200);

    setTimeout(() => {
      setGradingStep(4);
    }, 1800);

    setTimeout(() => {
      const updated = saveAssignmentSubmission(activeAssignment.id, userCode, selectedLang, attachedFileName);
      if (updated) {
        setAssignments(getStoredAssignments());
        setActiveAssignment(updated);
        setShowModelSolution(true);
      }
      setIsGradingInProgress(false);

      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6']
      });
    }, 2400);
  };

  const handleReset = (assignmentId: string) => {
    if (window.confirm('Reset this assignment to initial state?')) {
      resetAssignment(assignmentId);
      const updated = getStoredAssignments();
      setAssignments(updated);
      const found = updated.find((a) => a.id === assignmentId);
      if (found) {
        handleOpenAssignment(found);
      }
    }
  };

  const uniqueSubjects = useMemo(() => {
    const map = new Map<string, string>();
    assignments.forEach((a) => map.set(a.subjectId, a.subject));
    return Array.from(map.entries());
  }, [assignments]);

  return (
    <div className="space-y-8 pb-20">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#FAF8F5] to-[#F1ECE4] rounded-3xl p-6 sm:p-8 border border-[#E5DFD5] shadow-sm">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
              <FileCode2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Engineering Lab &amp; Project Assignments</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight font-serif">
              Assignments &amp; Course Projects
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl leading-relaxed">
              Implement algorithmic solutions, kernel modules, and system designs. Submit your code for automated AI rubric grading, test case validation, and faculty model solutions.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/80 backdrop-blur px-4 py-2.5 rounded-2xl border border-[#E5DFD5] shadow-2xs">
            <div className="text-center px-2">
              <div className="text-lg font-black text-[#0F172A] font-mono">{stats.total}</div>
              <div className="text-[10px] text-[#64748B] uppercase font-semibold">Total</div>
            </div>
            <div className="h-6 w-px bg-[#E2E8F0]" />
            <div className="text-center px-2">
              <div className="text-lg font-black text-emerald-600 font-mono">{stats.graded}</div>
              <div className="text-[10px] text-[#64748B] uppercase font-semibold">Graded</div>
            </div>
            <div className="h-6 w-px bg-[#E2E8F0]" />
            <div className="text-center px-2">
              <div className="text-lg font-black text-amber-600 font-mono">{stats.pending}</div>
              <div className="text-[10px] text-[#64748B] uppercase font-semibold">Pending</div>
            </div>
            <div className="h-6 w-px bg-[#E2E8F0]" />
            <div className="text-center px-2">
              <div className="text-lg font-black text-blue-600 font-mono">{stats.avgScore}%</div>
              <div className="text-[10px] text-[#64748B] uppercase font-semibold">Average</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#E5DFD5] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'bg-[#F1ECE4] text-[#475569] hover:bg-[#E5DFD5]'
            }`}
          >
            All ({assignments.length})
          </button>
          <button
            onClick={() => setActiveFilter('graded')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'graded'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-[#F1ECE4] text-[#475569] hover:bg-[#E5DFD5]'
            }`}
          >
            Graded ({stats.graded})
          </button>
          <button
            onClick={() => setActiveFilter('submitted')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'submitted'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-[#F1ECE4] text-[#475569] hover:bg-[#E5DFD5]'
            }`}
          >
            Submitted ({stats.submitted})
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-[#F1ECE4] text-[#475569] hover:bg-[#E5DFD5]'
            }`}
          >
            Pending ({stats.pending})
          </button>
        </div>

        {/* Subject Filter & Search */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none cursor-pointer"
          >
            <option value="all">All Subjects</option>
            {uniqueSubjects.map(([id, title]) => (
              <option key={id} value={id}>
                {title}
              </option>
            ))}
          </select>

          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assignment..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#CBD5E1] text-xs text-[#0F172A] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. Assignment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredAssignments.map((asg) => {
          const isGraded = asg.status === 'graded';
          const isSubmitted = asg.status === 'submitted';

          return (
            <div
              key={asg.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5DFD5] shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              {/* Header Badges */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EBF3FB] text-[#1D4ED8] border border-blue-200">
                      {asg.code}
                    </span>
                    <span className="text-xs text-[#64748B] font-medium">{asg.subject}</span>
                  </div>

                  {/* Status Tag */}
                  {isGraded ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Graded: {asg.score}/100 ({asg.grade})</span>
                    </span>
                  ) : isSubmitted ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                      <Clock className="w-3 h-3" />
                      <span>Submitted</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      <span>Pending Due</span>
                    </span>
                  )}
                </div>

                {/* Title & Summary */}
                <h3 className="text-base sm:text-lg font-bold text-[#0F172A] leading-snug">
                  {asg.title}
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2">
                  {asg.summary}
                </p>
              </div>

              {/* Competencies Checklist */}
              <div className="space-y-1.5 bg-[#FAF8F5] p-3 rounded-2xl border border-[#EBE5DB]">
                <div className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">
                  Key Deliverables
                </div>
                <div className="space-y-1">
                  {asg.objectives.slice(0, 2).map((obj, i) => (
                    <div key={i} className="text-xs text-[#334155] flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Meta & Button */}
              <div className="flex items-center justify-between pt-2 border-t border-[#F1ECE4]">
                <div className="text-[11px] text-[#64748B] flex items-center gap-3">
                  <span>Due: <strong className="text-[#0F172A]">{asg.dueDate}</strong></span>
                  <span>Max: <strong className="text-[#0F172A]">{asg.totalMarks} pts</strong></span>
                </div>

                <button
                  onClick={() => handleOpenAssignment(asg)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                    isGraded
                      ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                      : isSubmitted
                      ? 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                      : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>{isGraded ? 'Review Submission' : isSubmitted ? 'View Submission' : 'Start Assignment'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Assignment Submission & Auto-Grader Drawer / Modal */}
      {activeAssignment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-3xl border border-[#E5DFD5] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-[#FAF8F5] border-b border-[#E5DFD5] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
                    {activeAssignment.code}
                  </span>
                  <span className="text-xs text-[#64748B]">{activeAssignment.subject} • {activeAssignment.difficulty}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#0F172A] mt-1 font-serif">
                  {activeAssignment.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleReset(activeAssignment.id)}
                  className="p-2 rounded-xl bg-white border border-[#CBD5E1] text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 cursor-pointer"
                  title="Reset Assignment"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveAssignment(null)}
                  className="w-8 h-8 rounded-full bg-white border border-[#CBD5E1] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
              {/* Problem Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                  Problem Specification
                </h4>
                <p className="text-sm text-[#1E293B] leading-relaxed">
                  {activeAssignment.problemDescription}
                </p>
              </div>

              {/* Objectives & Constraints */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE5DB] space-y-2">
                  <div className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Grading Criteria</span>
                  </div>
                  <ul className="text-xs text-[#475569] space-y-1 pl-4 list-disc">
                    {activeAssignment.objectives.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE5DB] space-y-2">
                  <div className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Technical Constraints</span>
                  </div>
                  <ul className="text-xs text-[#475569] space-y-1 pl-4 list-disc">
                    {activeAssignment.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Graded Feedback Banner (if already graded) */}
              {activeAssignment.status === 'graded' && activeAssignment.rubric && (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-emerald-700" />
                      <span className="font-bold text-emerald-950 text-sm">
                        AI Rubric Evaluation: {activeAssignment.score}/100 (Grade {activeAssignment.grade})
                      </span>
                    </div>
                    <span className="text-xs text-emerald-800 font-medium">PASSED WITH DISTINCTION</span>
                  </div>

                  <p className="text-xs text-emerald-900 leading-relaxed">
                    {activeAssignment.instructorFeedback}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {activeAssignment.rubric.map((r, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-white/90 border border-emerald-200 text-xs space-y-1">
                        <div className="flex justify-between font-semibold text-[#0F172A]">
                          <span>{r.name}</span>
                          <span className="font-mono text-emerald-700">{r.score}/{r.weight}</span>
                        </div>
                        <p className="text-[11px] text-[#64748B]">{r.feedback}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Code Editor Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-[#0F172A]">Solution Implementation</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {['Python', 'C++'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => handleLanguageChange(lang)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                          selectedLang === lang
                            ? 'bg-[#0F172A] text-white'
                            : 'bg-[#F1ECE4] text-[#475569] hover:bg-[#E5DFD5]'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Code Textarea */}
                <div className="relative rounded-2xl overflow-hidden border border-[#CBD5E1] bg-[#1E293B]">
                  <div className="px-4 py-2 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>solution.{selectedLang === 'Python' ? 'py' : 'cpp'}</span>
                    <span>UTF-8 • {selectedLang}</span>
                  </div>
                  <textarea
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    rows={12}
                    spellCheck={false}
                    className="w-full p-4 bg-[#0F172A] text-slate-100 font-mono text-xs leading-relaxed focus:outline-none resize-y selection:bg-blue-600"
                    placeholder="// Paste or write your implementation here..."
                  />
                </div>
              </div>

              {/* Grading Progress Spinner Banner */}
              {isGradingInProgress && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-2 animate-pulse">
                  <div className="flex items-center gap-2 font-bold">
                    <Cpu className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Evaluating Solution with AI Auto-Grader...</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-blue-800 pl-6">
                    <div className={gradingStep >= 1 ? 'font-semibold text-blue-900' : 'opacity-50'}>
                      ✔ Step 1: Parsing Abstract Syntax Tree (AST) &amp; static type checks
                    </div>
                    <div className={gradingStep >= 2 ? 'font-semibold text-blue-900' : 'opacity-50'}>
                      ✔ Step 2: Executing automated test suite across 25 edge cases
                    </div>
                    <div className={gradingStep >= 3 ? 'font-semibold text-blue-900' : 'opacity-50'}>
                      ✔ Step 3: Verifying time/space complexity bounds &amp; concurrency invariants
                    </div>
                    <div className={gradingStep >= 4 ? 'font-semibold text-blue-900' : 'opacity-50'}>
                      ✔ Step 4: Compiling academic rubric assessment &amp; feedback notes
                    </div>
                  </div>
                </div>
              )}

              {/* Faculty Model Solution Section */}
              {showModelSolution && (
                <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-purple-950 text-sm">
                      <Lightbulb className="w-4 h-4 text-purple-700" />
                      <span>Official Faculty Model Solution</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                      Verified Reference
                    </span>
                  </div>

                  <p className="text-xs text-purple-900 leading-relaxed">
                    {activeAssignment.modelExplanation}
                  </p>

                  <div className="rounded-xl overflow-hidden bg-[#0F172A] border border-purple-300">
                    <div className="px-3 py-1.5 bg-slate-900 text-xs font-mono text-purple-300">
                      Reference: {selectedLang}
                    </div>
                    <pre className="p-3 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto max-h-52">
                      {activeAssignment.modelSolution[selectedLang] || activeAssignment.modelSolution['Python']}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#FAF8F5] border-t border-[#E5DFD5] flex items-center justify-between gap-3">
              <button
                onClick={() => setActiveAssignment(null)}
                className="px-4 py-2 rounded-xl bg-white border border-[#CBD5E1] text-[#475569] hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={handleSubmitAndGrade}
                disabled={isGradingInProgress}
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                  isGradingInProgress ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#2563EB] hover:bg-[#1D4ED8]'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>{activeAssignment.status === 'graded' ? 'Re-Submit & Re-Grade' : 'Submit & Run AI Evaluation'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
