import React, { useState } from 'react';
import { JOB_OPPORTUNITIES, JobOpportunityItem } from '../../services/dashboardApiService';
import { Briefcase, Building2, MapPin, DollarSign, CheckCircle2, ArrowRight } from 'lucide-react';

export const JobsView: React.FC = () => {
  const [jobs, setJobs] = useState<JobOpportunityItem[]>(JOB_OPPORTUNITIES);

  const handleApply = (id: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, applied: true } : j))
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0875E1] to-[#07549A] text-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-2">
        <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">Career Portal</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif">Jobs &amp; Internship Opportunities</h1>
        <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
          Curated tech openings from partner startups and tier-1 product companies for AlgoTutor graduates.
        </p>
      </div>

      {/* Job Cards */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-2xl flex items-center justify-center shrink-0">
                  {job.logo}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#172B4D] leading-snug">
                    {job.role}
                  </h3>
                  <div className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                    <span>{job.company}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-normal text-slate-500">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="px-2.5 py-0.5 rounded-full font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {job.salary}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                  {job.type}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                  Exp: {job.experience}
                </span>
                {job.tags.map((tag, i) => (
                  <span key={i} className="text-[11px] text-slate-400 font-mono">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {job.applied ? (
                <span className="px-5 py-2.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Applied</span>
                </span>
              ) : (
                <button
                  onClick={() => handleApply(job.id)}
                  className="px-6 py-2.5 rounded-xl bg-[#0875E1] hover:bg-[#07549A] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <span>Easy Apply</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
