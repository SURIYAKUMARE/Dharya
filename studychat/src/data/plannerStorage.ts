export type PlanStatus = 'Completed' | 'Pending' | 'Missed';
export type PlanPriority = 'High' | 'Medium' | 'Low';

export interface StudyPlanTask {
  id: string;
  subject: string;
  topic: string;
  date: string; // 'YYYY-MM-DD' or formatted date string
  startTime: string; // e.g. '06:30 AM'
  endTime: string;   // e.g. '07:30 AM'
  description: string;
  priority: PlanPriority;
  status: PlanStatus;
  createdAt: number;
}

const PLANNER_STORAGE_KEY = 'student_planner_tasks_v2';

// Seeded tasks for Yesterday (September 8, 2026)
const INITIAL_TASKS: StudyPlanTask[] = [
  {
    id: 'seed-1',
    subject: 'Java',
    topic: 'Java Arrays & Multi-dimensional Iterations',
    date: '2026-09-08',
    startTime: '06:30 AM',
    endTime: '07:30 AM',
    description: 'Practiced 2D array matrix manipulations and memory references in Java.',
    priority: 'High',
    status: 'Completed',
    createdAt: Date.now() - 86400000 * 1.5,
  },
  {
    id: 'seed-2',
    subject: 'Mathematics',
    topic: 'Mathematics – Integration & Multiple Integrals',
    date: '2026-09-08',
    startTime: '07:30 AM',
    endTime: '09:00 AM',
    description: 'Solved definite integration problem bank and double integral coordinate conversions.',
    priority: 'High',
    status: 'Completed',
    createdAt: Date.now() - 86400000 * 1.4,
  },
  {
    id: 'seed-3',
    subject: 'Python',
    topic: 'Python Practice – List Comprehensions & Lambdas',
    date: '2026-09-08',
    startTime: '05:30 PM',
    endTime: '07:00 PM',
    description: 'Practice problem set on higher-order functions and generator expressions.',
    priority: 'Medium',
    status: 'Pending',
    createdAt: Date.now() - 86400000 * 1.1,
  },
];

export function getStoredTasks(): StudyPlanTask[] {
  try {
    const raw = localStorage.getItem(PLANNER_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TASKS;
  }
}

export function saveStoredTasks(tasks: StudyPlanTask[]): void {
  try {
    localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to localStorage', err);
  }
}

export function addStudyPlanTask(task: Omit<StudyPlanTask, 'id' | 'createdAt'>): StudyPlanTask {
  const current = getStoredTasks();
  const newTask: StudyPlanTask = {
    ...task,
    id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    createdAt: Date.now(),
  };
  const updated = [newTask, ...current];
  saveStoredTasks(updated);
  return newTask;
}

export function updateTaskStatus(taskId: string, newStatus: PlanStatus): StudyPlanTask[] {
  const current = getStoredTasks();
  const updated = current.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t));
  saveStoredTasks(updated);
  return updated;
}

export function deleteTask(taskId: string): StudyPlanTask[] {
  const current = getStoredTasks();
  const updated = current.filter((t) => t.id !== taskId);
  saveStoredTasks(updated);
  return updated;
}
