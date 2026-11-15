import React from 'react';
import { ATTENDANCE_RECORDS } from '../../services/dashboardApiService';
import { CalendarDays, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

export const AttendanceView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0875E1] to-[#07549A] text-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-2">
        <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">
          Classroom Logs
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif">Attendance &amp; Live Sessions</h1>
        <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
          Track session attendance, mentor hours, and verified participation logs across your course cohorts.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase">Current Attendance</div>
          <div className="text-3xl font-black text-[#172B4D] font-mono mt-1">100%</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">4 of 4 sessions attended</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase">Total Hours Logged</div>
          <div className="text-3xl font-black text-blue-600 font-mono mt-1">8h 15m</div>
          <div className="text-[11px] text-slate-500 mt-1">Lecture &amp; doubt clearing</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase">Minimum Requirement</div>
          <div className="text-3xl font-black text-slate-700 font-mono mt-1">75%</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Status: Eligible for Placements</div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0] font-bold text-xs text-slate-600">
          Recent Classroom Sessions
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {ATTENDANCE_RECORDS.map((record, idx) => (
            <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-[#172B4D]">{record.sessionTitle}</div>
                  <div className="text-[11px] text-slate-500">Instructor: {record.instructor} • {record.date}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className="font-mono text-slate-500 text-[11px]">{record.duration}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {record.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
