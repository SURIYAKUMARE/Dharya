import React, { useState } from 'react';
import { INITIAL_CODING_ANALYTICS } from '../../services/dashboardApiService';
import { Code2, CheckCircle2, Search, Filter, ArrowUpRight, Zap } from 'lucide-react';

export const ProblemSolvingView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [search, setSearch] = useState('');

  // Sample catalog of solved problems
  const sampleProblems = [
    { id: 1, title: 'Two Sum', difficulty: 'Easy', category: 'Arrays', solvedAt: 'Nov 14, 2026', time: '32ms', points: 20 },
    { id: 2, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', category: 'Sliding Window', solvedAt: 'Nov 14, 2026', time: '48ms', points: 40 },
    { id: 3, title: 'Median of Two Sorted Arrays', difficulty: 'Hard', category: 'Binary Search', solvedAt: 'Nov 13, 2026', time: '64ms', points: 60 },
    { id: 4, title: 'Valid Parentheses', difficulty: 'Easy', category: 'Stack', solvedAt: 'Nov 12, 2026', time: '28ms', points: 20 },
    { id: 5, title: 'Merge k Sorted Lists', difficulty: 'Hard', category: 'Heap / Priority Queue', solvedAt: 'Nov 11, 2026', time: '55ms', points: 60 },
    { id: 6, title: 'Coin Change', difficulty: 'Medium', category: 'Dynamic Programming', solvedAt: 'Nov 10, 2026', time: '72ms', points: 40 },
    { id: 7, title: 'Trapping Rain Water', difficulty: 'Hard', category: 'Two Pointers', solvedAt: 'Nov 09, 2026', time: '41ms', points: 60 },
    { id: 8, title: 'LRU Cache Implementation', difficulty: 'Medium', category: 'Design', solvedAt: 'Nov 08, 2026', time: '88ms', points: 40 }
  ];

  const filtered = sampleProblems.filter((p) => {
    const matchTab = activeTab === 'All' || p.difficulty === activeTab;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Stats */}
      <div className="bg-gradient-to-r from-[#0875E1] to-[#07549A] text-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-2">
        <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">
          Activity Tracker
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif">Problem Solving Log</h1>
        <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
          Review your 380 solved coding problems across Easy (209), Medium (104), and Hard (67) difficulty tiers.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
          {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setActiveTab(diff)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === diff
                  ? 'bg-[#0875E1] text-white shadow-xs'
                  : 'bg-[#F4F9FC] text-slate-600 hover:bg-slate-200'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problem or tag..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#F4F9FC] border border-[#CBD5E1] text-xs text-[#172B4D] focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Problems Table */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-bold text-slate-500 grid grid-cols-12 gap-3 uppercase">
          <div className="col-span-1">Status</div>
          <div className="col-span-5">Problem Title</div>
          <div className="col-span-2">Difficulty</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2 text-right">Points / Time</div>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.map((prob) => (
            <div
              key={prob.id}
              className="p-4 grid grid-cols-12 gap-3 items-center text-xs hover:bg-blue-50/40 transition-colors"
            >
              <div className="col-span-1 flex items-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="col-span-5 font-bold text-[#172B4D] flex items-center gap-2">
                <span>{prob.title}</span>
              </div>
              <div className="col-span-2">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                    prob.difficulty === 'Easy'
                      ? 'bg-emerald-100 text-emerald-800'
                      : prob.difficulty === 'Medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {prob.difficulty}
                </span>
              </div>
              <div className="col-span-2 text-slate-600 font-medium">{prob.category}</div>
              <div className="col-span-2 text-right font-mono text-slate-600">
                <span className="font-bold text-emerald-600">+{prob.points} pts</span> • {prob.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
