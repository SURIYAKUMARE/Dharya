import React, { useState } from 'react';
import { FileEdit, Download, Printer, Sparkles, CheckCircle2 } from 'lucide-react';

export const ResumeBuilderView: React.FC = () => {
  const [name, setName] = useState('Surya');
  const [title, setTitle] = useState('Full Stack Software Engineer');
  const [email, setEmail] = useState('surya@algotutor.io');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [summary, setSummary] = useState(
    'Passionate Full-Stack Developer with strong foundations in Data Structures, Algorithms, Distributed Systems, and MERN stack. Solved 380+ coding problems and developed multi-tier microservices.'
  );
  const [skills, setSkills] = useState('Python, C++, TypeScript, React, Node.js, Express, PostgreSQL, Redis, Docker, Git');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0875E1] to-[#07549A] text-white p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">Career Accelerator</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif mt-1">Interactive Resume Builder</h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            Generate ATS-compliant engineering resumes with one-click export for product company applications.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl bg-white text-[#0875E1] font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md self-start sm:self-auto hover:bg-blue-50"
        >
          <Printer className="w-4 h-4" />
          <span>Export / Print PDF</span>
        </button>
      </div>

      {/* 2-Column: Form & Live Resume Sheet Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Editor */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#172B4D] border-b pb-2">Resume Details</h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-600 block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-600 block mb-1">Professional Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-600 block mb-1">Professional Summary</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-600 block mb-1">Technical Skills (Comma separated)</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Right: Live A4 Printable Preview Sheet */}
        <div className="bg-slate-200 p-4 sm:p-6 rounded-3xl flex items-center justify-center">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-4 text-xs font-sans text-slate-800 border border-slate-300 print:shadow-none print:border-none">
            {/* Header */}
            <div className="border-b-2 border-slate-800 pb-3 text-center space-y-1">
              <h2 className="text-xl font-black uppercase tracking-wider text-slate-900">{name}</h2>
              <p className="text-xs font-semibold text-blue-700">{title}</p>
              <p className="text-[10px] text-slate-500 font-mono">
                {email} • {phone} • Bengaluru, India
              </p>
            </div>

            {/* Summary */}
            <div className="space-y-1">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                Summary
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">{summary}</p>
            </div>

            {/* Technical Skills */}
            <div className="space-y-1">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                Technical Skills
              </h4>
              <p className="text-[11px] text-slate-700 font-mono leading-relaxed">{skills}</p>
            </div>

            {/* Projects & Experience */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                Key Engineering Projects
              </h4>
              <div className="space-y-1">
                <div className="font-bold text-slate-900 text-xs flex justify-between">
                  <span>Distributed Multi-Threaded Kernel Scheduler</span>
                  <span className="text-[10px] text-slate-500 font-normal">2026</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-normal">
                  Implemented Banker's deadlock avoidance and CPU scheduling simulation in Python with re-entrant locks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
