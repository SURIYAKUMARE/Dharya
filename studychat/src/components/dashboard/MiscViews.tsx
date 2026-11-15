import React, { useState } from 'react';
import {
  CalendarCheck,
  FolderGit2,
  Building2,
  Database,
  FileText,
  Clock,
  HelpCircle,
  Settings,
  CheckCircle2,
  Send,
  Lock,
  User,
  Bell,
  Play
} from 'lucide-react';

// 1. Book Slot View
export const BookSlotView: React.FC = () => {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const slots = [
    { time: 'Tomorrow • 10:00 AM - 11:00 AM', mentor: 'Arjit Sharma', role: 'System Design Mock' },
    { time: 'Tomorrow • 04:00 PM - 05:00 PM', mentor: 'Vikram Joshi', role: 'DSA Coding Interview' },
    { time: 'Wednesday • 07:00 PM - 08:00 PM', mentor: 'Sneha Roy', role: 'Full Stack Architecture Review' }
  ];

  return (
    <div className="space-y-6 pb-12 max-w-3xl">
      <div className="bg-gradient-to-r from-[#0875E1] to-[#07549A] text-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-2">
        <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">1-on-1 Mentorship</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif">Book a Mentor Slot</h1>
        <p className="text-xs sm:text-sm text-blue-100">
          Schedule dedicated mock interviews, resume critiques, and architectural guidance with FAANG engineers.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#172B4D]">Available Session Slots</h3>
        <div className="space-y-3">
          {slots.map((s, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedSlot(s.time)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedSlot === s.time
                  ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
                  : 'bg-[#F8FAFC] border-slate-200 hover:border-blue-300'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-[#172B4D]">{s.role}</div>
                <div className="text-[11px] text-slate-500">Mentor: {s.mentor} • {s.time}</div>
              </div>
              <button className="px-4 py-2 rounded-xl bg-[#0875E1] text-white text-xs font-semibold">
                {selectedSlot === s.time ? 'Selected' : 'Book'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 2. Projects View
export const ProjectsView: React.FC = () => {
  const projects = [
    { title: 'Distributed Key-Value Store with Raft Consensus', stack: ['Go', 'gRPC', 'Raft'], status: 'Graded (98/100)' },
    { title: 'High-Throughput Financial Order Matching Engine', stack: ['C++', 'Lock-Free Queues'], status: 'Under Review' },
    { title: 'AI-Powered Smart Notification System', stack: ['TypeScript', 'Python', 'WebPush'], status: 'Approved' }
  ];

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div className="bg-gradient-to-r from-[#0875E1] to-[#07549A] text-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-2">
        <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">Capstone Hub</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif">Portfolio Projects</h1>
        <p className="text-xs sm:text-sm text-blue-100">
          Build and deploy production-grade software engineering projects reviewed by senior industry mentors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((p, i) => (
          <div key={i} className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-xs space-y-3">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {p.status}
            </span>
            <h4 className="text-base font-bold text-[#172B4D]">{p.title}</h4>
            <div className="flex gap-1.5 flex-wrap">
              {p.stack.map((t, idx) => (
                <span key={idx} className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. Company Prep View
export const CompanyPrepView: React.FC = () => {
  const companies = [
    { name: 'Google', problems: '120 Curated Questions', guide: 'System Design & Distributed Systems Focus' },
    { name: 'Microsoft', problems: '95 Curated Questions', guide: 'Trees, Graphs & Dynamic Programming' },
    { name: 'Amazon', problems: '140 Curated Questions', guide: 'Leadership Principles & Low-Level Design (LLD)' },
    { name: 'Meta', problems: '85 Curated Questions', guide: 'Rapid Coding & Array Matrix Manipulation' }
  ];

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div className="bg-gradient-to-r from-[#0875E1] to-[#07549A] text-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-2">
        <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">Interview Readiness</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif">Company Preparation Tracks</h1>
        <p className="text-xs sm:text-sm text-blue-100">
          Targeted question sheets, behavioral rubrics, and previous interview experiences from top product companies.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {companies.map((c, i) => (
          <div key={i} className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-xs space-y-2 hover:border-blue-400 transition-colors">
            <h4 className="text-base font-bold text-[#172B4D]">{c.name} Interview Track</h4>
            <div className="text-xs font-semibold text-blue-600">{c.problems}</div>
            <p className="text-xs text-slate-500">{c.guide}</p>
            <button className="w-full mt-2 py-2 rounded-xl bg-[#F4F9FC] hover:bg-blue-50 text-[#0875E1] text-xs font-bold">
              Start Company Track
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. SQL Practice View
export const SqlPracticeView: React.FC = () => {
  const [query, setQuery] = useState('SELECT department, AVG(salary) AS avg_sal FROM employees GROUP BY department HAVING AVG(salary) > 80000;');
  const [result, setResult] = useState<string | null>(null);

  const handleRun = () => {
    setResult('Query Executed Successfully in 12ms.\nReturned 3 rows:\nEngineering | 115000\nProduct | 98000\nData Science | 104000');
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div className="bg-gradient-to-r from-[#0875E1] to-[#07549A] text-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-2">
        <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">Database Lab</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif">Interactive SQL Practice</h1>
        <p className="text-xs sm:text-sm text-blue-100">
          Write complex multi-table joins, subqueries, and window functions on simulated database tables.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-xs space-y-3">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={4}
          className="w-full p-3 font-mono text-xs bg-[#0F172A] text-emerald-400 rounded-2xl focus:outline-none"
        />
        <button onClick={handleRun} className="px-5 py-2 rounded-xl bg-[#0875E1] text-white text-xs font-bold flex items-center gap-2">
          <Play className="w-3.5 h-3.5" />
          <span>Execute Query</span>
        </button>
        {result && (
          <pre className="p-3 bg-slate-100 text-slate-800 font-mono text-xs rounded-xl">
            {result}
          </pre>
        )}
      </div>
    </div>
  );
};

// 5. Notes View
export const NotesView: React.FC = () => {
  const notes = [
    { title: 'System Design Cheat Sheet: CAP Theorem, Consistent Hashing & CDC', pages: '14 Pages', tag: 'System Design' },
    { title: 'Dynamic Programming Patterns: 0/1 Knapsack, LCS & Tree DP', pages: '22 Pages', tag: 'Algorithms' },
    { title: 'Operating Systems Quick Revision: Paging, Semaphores & CFS', pages: '18 Pages', tag: 'OS' },
    { title: 'Computer Networks Handbook: TCP, TLS 1.3, BGP & CIDR', pages: '16 Pages', tag: 'Networks' }
  ];

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div className="bg-gradient-to-r from-[#0875E1] to-[#07549A] text-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-2">
        <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">Study Notes</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif">Handcrafted Revision Notes</h1>
        <p className="text-xs sm:text-sm text-blue-100">
          Comprehensive summaries, formula cheat sheets, and architectural diagrams curated by lead instructors.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {notes.map((n, i) => (
          <div key={i} className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-xs space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">{n.tag}</span>
              <h4 className="text-sm font-bold text-[#172B4D] mt-1">{n.title}</h4>
              <p className="text-xs text-slate-400 font-mono">{n.pages}</p>
            </div>
            <button className="w-full mt-2 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold">
              Read / Download Notes
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// 6. Track Request View
export const TrackRequestView: React.FC = () => (
  <div className="space-y-6 pb-12 max-w-3xl">
    <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-xs space-y-3">
      <h3 className="text-lg font-bold text-[#172B4D]">Doubt &amp; Support Requests</h3>
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
        <div className="font-bold">Ticket #4912: B+ Tree Page Split Invariants</div>
        <div className="text-emerald-700">Resolved by Mentor Arjit Sharma • Solution verified</div>
      </div>
      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
        <div className="font-bold">Ticket #5004: Docker Container Port Forwarding on Windows</div>
        <div className="text-blue-700">In Progress • Assigned to Teaching Assistant</div>
      </div>
    </div>
  </div>
);

// 7. Help & Support View
export const HelpSupportView: React.FC = () => (
  <div className="space-y-6 pb-12 max-w-3xl">
    <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-xs space-y-3">
      <h3 className="text-lg font-bold text-[#172B4D]">Help Desk &amp; Knowledge Base</h3>
      <p className="text-xs text-slate-500">Need help with code submissions, course schedules, or placement assistance? Contact our 24/7 student success team.</p>
      <div className="p-4 rounded-2xl bg-slate-50 border text-xs space-y-2">
        <div className="font-semibold text-slate-800">Email: support@algotutor.io</div>
        <div className="font-semibold text-slate-800">Live Doubt Clearance Desk: 10:00 AM - 10:00 PM IST</div>
      </div>
    </div>
  </div>
);

// 8. Settings View
export const SettingsView: React.FC = () => {
  const [name, setName] = useState('Surya');
  const [email, setEmail] = useState('surya@algotutor.io');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-2xl">
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-[#172B4D]">Student Profile &amp; Settings</h3>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-600 block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Student Roll Number</label>
            <input
              type="text"
              value="ENG-2024-0910"
              disabled
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 font-mono text-slate-500"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-[#0875E1] text-white text-xs font-bold cursor-pointer"
        >
          {isSaved ? 'Saved Successfully! ✔' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};
