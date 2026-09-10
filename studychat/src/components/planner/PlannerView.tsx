import React, { useState, useMemo } from 'react';
import { useStudyApp } from '../../context/StudyAppContext';
import { PlanStatus, PlanPriority, StudyPlanTask } from '../../data/plannerStorage';
import { SUBJECTS_DATA } from '../../data/curriculumData';
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  Hourglass,
  XCircle,
  Trash2,
  Tag,
  AlertCircle,
  Sparkles,
  ChevronDown,
  History,
  X
} from 'lucide-react';

export const PlannerView: React.FC = () => {
  const { tasks, addTask, setTaskStatus, removeTask } = useStudyApp();

  // Dates
  const yesterdayDateStr = '2026-09-08';
  const todayDateStr = '2026-09-09';

  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formSubject, setFormSubject] = useState(SUBJECTS_DATA[0].title);
  const [formTopic, setFormTopic] = useState('');
  const [formDate, setFormDate] = useState(todayDateStr);
  const [formStartTime, setFormStartTime] = useState('06:30 AM');
  const [formEndTime, setFormEndTime] = useState('07:30 AM');
  const [formDescription, setFormDescription] = useState('');
  const [formPriority, setFormPriority] = useState<PlanPriority>('High');
  const [formStatus, setFormStatus] = useState<PlanStatus>('Pending');

  // Filter tasks
  const yesterdayTasks = useMemo(() => {
    return tasks.filter((t) => t.date === yesterdayDateStr);
  }, [tasks]);

  const todayTasks = useMemo(() => {
    return tasks.filter((t) => t.date === todayDateStr);
  }, [tasks]);

  const previousDateTasks = useMemo(() => {
    return tasks.filter((t) => t.date !== yesterdayDateStr && t.date !== todayDateStr);
  }, [tasks]);

  // Unique past dates for history selector
  const allDates = useMemo(() => {
    const set = new Set(tasks.map((t) => t.date));
    return Array.from(set).sort().reverse();
  }, [tasks]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTopic.trim()) return;

    addTask({
      subject: formSubject,
      topic: formTopic.trim(),
      date: formDate,
      startTime: formStartTime,
      endTime: formEndTime,
      description: formDescription.trim() || `Study & revision of ${formTopic.trim()}`,
      priority: formPriority,
      status: formStatus,
    });

    // Reset
    setFormTopic('');
    setFormDescription('');
    setIsAddModalOpen(false);
  };

  const renderStatusBadge = (status: PlanStatus, taskId: string) => {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => setTaskStatus(taskId, 'Completed')}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold font-mono transition-all flex items-center gap-1 ${
            status === 'Completed'
              ? 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] shadow-2xs'
              : 'bg-[#FAF8F5] text-[#64748B] hover:text-[#1E293B] border border-[#DDD5C7]'
          }`}
          title="Mark as Completed"
        >
          <CheckCircle2 className="w-3 h-3 text-[#059669]" />
          <span>Completed</span>
        </button>

        <button
          onClick={() => setTaskStatus(taskId, 'Pending')}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold font-mono transition-all flex items-center gap-1 ${
            status === 'Pending'
              ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] shadow-2xs'
              : 'bg-[#FAF8F5] text-[#64748B] hover:text-[#1E293B] border border-[#DDD5C7]'
          }`}
          title="Mark as Pending"
        >
          <Hourglass className="w-3 h-3 text-[#D97706]" />
          <span>Pending</span>
        </button>

        <button
          onClick={() => setTaskStatus(taskId, 'Missed')}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold font-mono transition-all flex items-center gap-1 ${
            status === 'Missed'
              ? 'bg-[#FFE4E6] text-[#BE123C] border border-[#FECDD3] shadow-2xs'
              : 'bg-[#FAF8F5] text-[#64748B] hover:text-[#1E293B] border border-[#DDD5C7]'
          }`}
          title="Mark as Missed"
        >
          <XCircle className="w-3 h-3 text-[#E11D48]" />
          <span>Missed</span>
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-20 max-w-4xl mx-auto w-full">
      {/* Planner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5DFD5] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#059669] font-bold uppercase mb-1">
            <Calendar className="w-4 h-4" />
            <span>Manual Student Study Planner</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight font-serif">
            Study Schedule &amp; Task History
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Decide and organize your daily learning goals. Plans are never auto-generated and preserve all history.
          </p>
        </div>

        {/* Add Plan Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[#1273C4] hover:bg-[#0D62A5] text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Study Plan</span>
        </button>
      </div>

      {/* SECTION 1: YESTERDAY – SEPTEMBER 8 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8]" />
            <h2 className="text-lg font-bold text-[#1E293B] tracking-tight font-serif">
              Yesterday – September 8
            </h2>
          </div>
          <span className="text-xs font-mono text-[#64748B]">
            {yesterdayTasks.length} Preserved Tasks
          </span>
        </div>

        <div className="space-y-3">
          {yesterdayTasks.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white border border-dashed border-[#DDD5C7] text-center text-xs text-[#64748B] font-mono">
              No tasks logged for yesterday.
            </div>
          ) : (
            yesterdayTasks.map((task) => (
              <div
                key={task.id}
                className="p-5 rounded-2xl bg-white border border-[#E5DFD5] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#EBF3FB] text-[#1D4ED8] font-mono text-[10px] font-bold border border-[#BFDBFE]">
                      {task.subject}
                    </span>
                    <span className="text-xs font-mono text-[#64748B] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#94A3B8]" />
                      <span>{task.startTime} – {task.endTime}</span>
                    </span>
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-bold border ${
                        task.priority === 'High'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : task.priority === 'Medium'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#1E293B] font-serif">{task.topic}</h3>
                  <p className="text-xs text-[#475569] leading-relaxed">{task.description}</p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {renderStatusBadge(task.status, task.id)}
                  <button
                    onClick={() => removeTask(task.id)}
                    className="p-1.5 rounded-lg text-[#94A3B8] hover:text-rose-600 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SECTION 2: TODAY – SEPTEMBER 9 */}
      <div className="space-y-4 pt-4 border-t border-[#E5DFD5]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <h2 className="text-lg font-bold text-[#1E293B] tracking-tight font-serif">
              Today – September 9
            </h2>
          </div>
          <span className="text-xs font-mono text-[#059669]">
            {todayTasks.length} Manually Created Tasks
          </span>
        </div>

        {todayTasks.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-dashed border-[#DDD5C7] text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] text-[#64748B] mx-auto flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[#1273C4]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#1E293B] font-serif">No plans created for today yet</h3>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                The planner never auto-generates plans. Click below to manually create today's study schedule.
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#1273C4] hover:bg-[#0D62A5] text-xs font-bold text-white transition-all inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Task for Today</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className="p-5 rounded-2xl bg-white border border-[#E5DFD5] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#ECFDF5] text-[#047857] font-mono text-[10px] font-bold border border-[#A7F3D0]">
                      {task.subject}
                    </span>
                    <span className="text-xs font-mono text-[#64748B] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#94A3B8]" />
                      <span>{task.startTime} – {task.endTime}</span>
                    </span>
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-bold border ${
                        task.priority === 'High'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : task.priority === 'Medium'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#1E293B] font-serif">{task.topic}</h3>
                  <p className="text-xs text-[#475569] leading-relaxed">{task.description}</p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {renderStatusBadge(task.status, task.id)}
                  <button
                    onClick={() => removeTask(task.id)}
                    className="p-1.5 rounded-lg text-[#94A3B8] hover:text-rose-600 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: PLANNER HISTORY & ARCHIVED DATES */}
      {previousDateTasks.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#E5DFD5]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#64748B]" />
              <h2 className="text-lg font-bold text-[#1E293B] tracking-tight font-serif">
                Previous Dates &amp; History
              </h2>
            </div>
            <span className="text-xs font-mono text-[#64748B]">
              {previousDateTasks.length} Archived Tasks
            </span>
          </div>

          <div className="space-y-3">
            {previousDateTasks.map((task) => (
              <div
                key={task.id}
                className="p-5 rounded-2xl bg-white border border-[#E5DFD5] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#64748B]">
                    <span className="text-[#1273C4] font-bold">{task.date}</span>
                    <span className="text-[#CBD5E1]">•</span>
                    <span>{task.subject}</span>
                    <span className="text-[#CBD5E1]">•</span>
                    <span>{task.startTime}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#1E293B] font-serif">{task.topic}</h3>
                  <p className="text-xs text-[#64748B]">{task.description}</p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {renderStatusBadge(task.status, task.id)}
                  <button
                    onClick={() => removeTask(task.id)}
                    className="p-1.5 rounded-lg text-[#94A3B8] hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* + ADD STUDY PLAN MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white border border-[#E5DFD5] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EBF3FB] text-[#1273C4] border border-[#BFDBFE] flex items-center justify-center font-bold">
                  +
                </div>
                <h3 className="text-lg font-bold text-[#1E293B] font-serif">Add Study Plan Task</h3>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-[#FAF8F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              {/* Subject Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                  Subject
                </label>
                <select
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-[#1E293B] text-xs focus:outline-none focus:border-[#1273C4]"
                >
                  {SUBJECTS_DATA.map((s) => (
                    <option key={s.id} value={s.title}>
                      {s.title} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic Name */}
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                  Topic &amp; Learning Goal
                </label>
                <input
                  type="text"
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  placeholder="e.g. Strain Gauge Bridge, Mason Gain Formula, etc."
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-[#1E293B] text-xs placeholder-[#94A3B8] focus:outline-none focus:border-[#1273C4] focus:ring-2 focus:ring-[#1273C4]/20"
                />
              </div>

              {/* Date & Times Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-[#1E293B] text-xs focus:outline-none focus:border-[#1273C4] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    placeholder="06:30 AM"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-[#1E293B] text-xs focus:outline-none focus:border-[#1273C4] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    placeholder="07:30 AM"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-[#1E293B] text-xs focus:outline-none focus:border-[#1273C4] font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                  Description &amp; Task Notes
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Outline key derivations, problem sets to solve, or textbook exercises."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-[#1E293B] text-xs placeholder-[#94A3B8] focus:outline-none focus:border-[#1273C4] resize-none"
                />
              </div>

              {/* Priority & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as PlanPriority)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-[#1E293B] text-xs focus:outline-none focus:border-[#1273C4]"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                    Initial Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as PlanStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C7] text-[#1E293B] text-xs focus:outline-none focus:border-[#1273C4]"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Missed">Missed</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#EDE8E1] border border-[#DDD5C7] text-[#475569] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#1273C4] hover:bg-[#0D62A5] text-white font-bold text-xs shadow-md"
                >
                  Save Study Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
