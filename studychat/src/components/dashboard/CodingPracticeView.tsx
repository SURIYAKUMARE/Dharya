import React, { useState } from 'react';
import { PROBLEM_OF_THE_DAY } from '../../services/dashboardApiService';
import { Code2, Play, CheckCircle2, RotateCcw, Sparkles, Terminal, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export const CodingPracticeView: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<'python' | 'cpp' | 'java'>('python');
  const [code, setCode] = useState<string>(PROBLEM_OF_THE_DAY.starterCode.python);
  const [outputConsole, setOutputConsole] = useState<string>('Press "Run Code" to compile and execute against public test cases.');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleLangChange = (lang: 'python' | 'cpp' | 'java') => {
    setSelectedLang(lang);
    setCode(PROBLEM_OF_THE_DAY.starterCode[lang]);
    setOutputConsole(`Switched language environment to ${lang.toUpperCase()}.`);
    setIsSuccess(false);
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setOutputConsole('Compiling solution and executing against Test Case 1: [3,4,5,1,2]...');

    setTimeout(() => {
      setIsRunning(false);
      setOutputConsole(`Execution Result:
✔ Test Case 1 Passed: Input nums = [3,4,5,1,2] -> Output: 1 (Expected: 1)
✔ Test Case 2 Passed: Input nums = [4,5,6,7,0,1,2] -> Output: 0 (Expected: 0)
✔ Test Case 3 Passed: Input nums = [11,13,15,17] -> Output: 11 (Expected: 11)

Status: ALL TEST CASES PASSED
Runtime: 38 ms (Beats 89.2% of submissions)
Memory: 14.1 MB (O(1) auxiliary space verified)`);
    }, 700);
  };

  const handleSubmit = () => {
    setIsRunning(true);
    setOutputConsole('Submitting solution to Judge Engine across 45 hidden test vectors...');

    setTimeout(() => {
      setIsRunning(false);
      setIsSuccess(true);
      setOutputConsole(`SUCCESS: Solution Accepted!
45/45 Test Cases Passed
Points Awarded: +40 Karma Points
Rank Progress: Moved up 2 ranks!`);

      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 }
      });
    }, 1200);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Problem Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
              {PROBLEM_OF_THE_DAY.difficulty}
            </span>
            <span className="text-xs text-[#64748B] font-mono">Acceptance: {PROBLEM_OF_THE_DAY.acceptanceRate}</span>
            <span className="text-xs text-amber-600 font-bold font-mono">+{PROBLEM_OF_THE_DAY.points} Points</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172B4D] mt-1 font-serif">
            {PROBLEM_OF_THE_DAY.title}
          </h1>
        </div>

        {/* Language Tabs */}
        <div className="inline-flex p-1 bg-[#F4F9FC] rounded-2xl border border-[#E2E8F0] self-start md:self-auto">
          {(['python', 'cpp', 'java'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => handleLangChange(lang)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold uppercase transition-all cursor-pointer ${
                selectedLang === lang ? 'bg-[#0875E1] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Code Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Problem Description & Constraints */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs space-y-4 max-h-[600px] overflow-y-auto">
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h3>
            <p className="text-xs sm:text-sm text-[#172B4D] leading-relaxed">
              {PROBLEM_OF_THE_DAY.description}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Examples</h3>
            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] font-mono text-xs space-y-1">
              <div><strong>Input:</strong> nums = [3,4,5,1,2]</div>
              <div><strong>Output:</strong> 1</div>
              <div className="text-slate-500 text-[11px]">Explanation: The original array was [1,2,3,4,5] rotated 3 times.</div>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] font-mono text-xs space-y-1">
              <div><strong>Input:</strong> nums = [4,5,6,7,0,1,2]</div>
              <div><strong>Output:</strong> 0</div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Constraints</h3>
            <ul className="text-xs text-slate-600 font-mono space-y-1 pl-4 list-disc">
              <li>n == nums.length</li>
              <li>1 &lt;= n &lt;= 5000</li>
              <li>-5000 &lt;= nums[i] &lt;= 5000</li>
              <li>All elements in nums are unique</li>
              <li>Time complexity requirement: O(log n)</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Code Editor & Execution Console */}
        <div className="flex flex-col space-y-4">
          {/* Editor Box */}
          <div className="rounded-3xl border border-[#CBD5E1] bg-[#0F172A] overflow-hidden shadow-md flex-1 flex flex-col min-h-[360px]">
            <div className="px-4 py-2.5 bg-[#1E293B] border-b border-slate-700 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-400" />
                solution.{selectedLang === 'python' ? 'py' : selectedLang === 'cpp' ? 'cpp' : 'java'}
              </span>
              <span>Monaco Simulation • UTF-8</span>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              rows={14}
              className="w-full flex-1 p-4 bg-[#0F172A] text-slate-100 font-mono text-xs leading-relaxed focus:outline-none resize-none selection:bg-blue-600"
            />

            {/* Run / Submit Action Bar */}
            <div className="p-3 bg-[#1E293B] border-t border-slate-700 flex items-center justify-between gap-3">
              <button
                onClick={() => setCode(PROBLEM_OF_THE_DAY.starterCode[selectedLang])}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Run Code</span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isRunning}
                  className="px-5 py-2 rounded-xl bg-[#0875E1] hover:bg-[#07549A] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Submit Solution</span>
                </button>
              </div>
            </div>
          </div>

          {/* Execution Output Console */}
          <div className="rounded-2xl border border-slate-300 bg-white p-4 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-[#172B4D] border-b pb-1.5">
              <span className="flex items-center gap-1.5 font-mono">
                <Terminal className="w-3.5 h-3.5 text-blue-600" />
                Console Output
              </span>
              {isSuccess && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Accepted ✔
                </span>
              )}
            </div>
            <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
              {outputConsole}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
