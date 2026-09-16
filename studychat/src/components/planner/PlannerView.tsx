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

    setFormTopic('');
    setFormDescription('');
    setIsAddModalOpen(false);
  };

  const renderStatusBadge = (status: PlanStatus, taskId: string) => {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setTaskStatus(taskId, 'Completed')}
          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold font-mono transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
            status === 'Completed'
              ? 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] shadow-2xs'
              : 'bg-[#FAF8F5] text-[#64748B] hover:text-[#0F172A] border border-[#DDD5C7]'
          }`}
          title="Mark as Completed"
        >
          <CheckCircle2 className="w-3 h-3 text-[#059669]" />
          <span>Completed</span>
        </button>

        <button
          onClick={() => setTaskStatus(taskId, 'Pending')}
          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold font-mono transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
            status === 'Pending'
              ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] shadow-2xs'
              : 'bg-[#FAF8F5] text-[#64748B] hover:text-[#0F172A] border border-[#DDD5C7]'
          }`}
          title="Mark as Pending"
        >
          <Hourglass className="w-3 h-3 text-[#D97706]" />
          <span>Pending</span>
        </button>

        <button
          onClick={() => setTaskStatus(taskId, 'Missed')}
          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold font-mono transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
            status === 'Missed'
              ? 'bg-[#FFE4E6] text-[#BE123C] border border-[#FECDD3] shadow-2xs'
              : 'bg-[#FAF8F5] text-[#64748B] hover:text-[#0F172A] border border-[#DDD5C7]'
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
    <div className="space-y-7 pb-24 max-w-4xl mx-auto w-full -mt-1">
      {/* Planner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E2D9CC] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#059669] font-bold uppercase mb-1">
            <Calendar className="w-4 h-4" />
            <span>Academic Study Planner</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight font-serif">
            Schedule &amp; Task Tracker
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Plan and organize your daily learning goals. All session history is preserved.
          </p>
        </div>

        {/* Add Plan Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-[#1273C4] hover:bg-[#0D62A5] text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Study Plan</span>
        </button>
      </div>

      {/* SECTION 1: YESTERDAY */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8]" />
            <h2 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight font-serif">
              Yesterday – September 8
            </h2>
          </div>
          <span className="text-xs font-mono text-[#64748B] bg-white px-2.5 py-1 rounded-xl border border-[#E5DFD5]">
            {yesterdayTasks.length} Logged Tasks
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
                className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E5DFD5] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#EBF3FB] text-[#1D4ED8] font-mono text-[10px] font-bold border border-[#BFDBFE]">
                      {task.subject}
                    </span>
                    <span className="text-xs font-mono text-[#64748B] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span>{task.startTime} – {task.endTime}</span>
                    </span>
                    <span
                      className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-md font-bold border ${
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

                  <h3 className="text-base font-bold text-[#0F172A] font-serif">{task.topic}</h3>
                  <p className="text-xs text-[#475569] leading-relaxed">{task.description}</p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {renderStatusBadge(task.status, task.id)}
                  <button
                    onClick={() => removeTask(task.id)}
                    className="p-2 rounded-xl text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SECTION 2: TODAY */}
      <div className="space-y-3.5 pt-4 border-t border-[#E2D9CC]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <h2 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight font-serif">
              Today – September 9
            </h2>
          </div>
          <span className="text-xs font-mono text-[#059669] font-bold bg-[#ECFDF5] px-2.5 py-1 rounded-xl border border-[#A7F3D0]">
            {todayTasks.length} Active Tasks
          </span>
        </div>

        {todayTasks.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-dashed border-[#DDD5C7] text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] text-[#64748B] mx-auto flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[#1273C4]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#0F172A] font-serif">No plans created for today yet</h3>
              <p className="text-xs text-[#64748B]">Click "Add Study Plan" above to create your syllabus goals for today.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className={`p-5 sm:p-6 rounded-2xl border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                  task.status === 'Completed'
                    ? 'bg-[#FAF8F5] border-[#D1E7DD] opacity-85'
                    : 'bg-white border-[#E5DFD5]'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#EBF3FB] text-[#1D4ED8] font-mono text-[10px] font-bold border border-[#BFDBFE]">
                      {task.subject}
                    </span>
                    <span className="text-xs font-mono text-[#64748B] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span>{task.startTime} – {task.endTime}</span>
                    </span>
                    <span
                      className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-md font-bold border ${
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

                  <h3 className={`text-base font-bold font-serif ${
                    task.status === 'Completed' ? 'line-through text-[#64748B]' : 'text-[#0F172A]'
                  }`}>
                    {task.topic}
                  </h3>
                  <p className="text-xs text-[#475569] leading-relaxed">{task.description}</p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {renderStatusBadge(task.status, task.id)}
                  <button
                    onClick={() => removeTask(task.id)}
                    className="p-2 rounded-xl text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD PLAN MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#E5DFD5] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2D9CC] pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#1273C4]" />
                <h3 className="font-serif font-bold text-lg text-[#0F172A]">Create New Study Plan</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">Course Subject</label>
                <select
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#CBD5E1] text-xs sm:text-sm text-[#0F172A] focus:outline-none focus:border-[#1273C4]"
                >
                  {SUBJECTS_DATA.map((s) => (
                    <option key={s.id} value={s.title}>
                      {s.title} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">Topic / Chapter Title</label>
                <input
                  type="text"
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  placeholder="e.g. Ogata Chapter 4 PID Controllers"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#CBD5E1] text-xs sm:text-sm text-[#0F172A] focus:outline-none focus:border-[#1273C4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">Start Time</label>
                  <input
                    type="text"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    placeholder="06:30 AM"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#CBD5E1] text-xs sm:text-sm text-[#0F172A] font-mono focus:outline-none focus:border-[#1273C4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">End Time</label>
                  <input
                    type="text"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    placeholder="07:30 AM"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#CBD5E1] text-xs sm:text-sm text-[#0F172A] font-mono focus:outline-none focus:border-[#1273C4]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as PlanPriority)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#CBD5E1] text-xs sm:text-sm text-[#0F172A] focus:outline-none focus:border-[#1273C4]"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#334155] mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#CBD5E1] text-xs sm:text-sm text-[#0F172A] font-mono focus:outline-none focus:border-[#1273C4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] mb-1">Description / Goal Notes</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  placeholder="Notes for revision, formulas to practice..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#CBD5E1] text-xs sm:text-sm text-[#0F172A] focus:outline-none focus:border-[#1273C4]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl bg-[#FAF8F5] hover:bg-[#EDE8E1] text-[#475569] font-bold text-xs border border-[#DDD5C7] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-[#1273C4] hover:bg-[#0D62A5] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
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
