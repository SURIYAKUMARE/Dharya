import { create } from 'zustand';
import { AppNotification, NotificationType } from '../types';

// ─── helpers ──────────────────────────────────────────────────────────────────
let _id = 100;
function genId() { return String(++_id); }

function relativeTime(minutesAgo: number): string {
  const d = new Date(Date.now() - minutesAgo * 60_000);
  return d.toISOString();
}

// ─── seed data ────────────────────────────────────────────────────────────────
const SEED: AppNotification[] = [
  {
    id: '1',
    type: 'assessment',
    title: 'New Assessment',
    message: 'You have a new assessment in Engineering Mathematics.',
    sender: 'Prof. Ramesh',
    timestamp: relativeTime(5),
    read: false,
    actionLabel: 'View Assessment',
    actionRoute: '/chat',
  },
  {
    id: '2',
    type: 'study_material',
    title: 'New Study Material',
    message: 'New study material has been uploaded for Data Structures.',
    sender: 'Prof. Priya',
    timestamp: relativeTime(20),
    read: false,
    actionLabel: 'Study Now',
    actionRoute: '/study/data-structures',
  },
  {
    id: '3',
    type: 'message',
    title: 'New Message',
    message: 'Arun sent you a new message.',
    sender: 'Arun',
    timestamp: relativeTime(60),
    read: false,
    actionLabel: 'Open Chat',
    actionRoute: '/chat',
  },
  {
    id: '4',
    type: 'assignment',
    title: 'New Assignment',
    message: 'You have a new assignment due in Python Programming.',
    sender: 'Prof. Meena',
    timestamp: relativeTime(120),
    read: true,
    actionLabel: 'View Assignment',
    actionRoute: '/chat',
  },
  {
    id: '5',
    type: 'announcement',
    title: 'Announcement',
    message: 'Classes are rescheduled to 10 AM tomorrow.',
    sender: 'Admin',
    timestamp: relativeTime(240),
    read: true,
    actionLabel: 'View',
    actionRoute: '/chat',
  },
];

// ─── store ────────────────────────────────────────────────────────────────────
interface NotificationState {
  notifications: AppNotification[];
  panelOpen: boolean;

  // counts
  unreadCount: () => number;

  // actions
  push: (
    type: NotificationType,
    title: string,
    message: string,
    opts?: Partial<Pick<AppNotification, 'sender' | 'actionLabel' | 'actionRoute'>>
  ) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;

  /** Called when a chat message is sent — auto-creates a notification for receiver (mock). */
  notifyNewMessage: (senderName: string, messagePreview?: string) => void;
  notifyTeacherMaterial: (subjectTitle?: string, subjectSlug?: string) => void;
  notifyTeacherAssessment: (subjectTitle?: string) => void;
  notifyAssignment: (subjectTitle?: string) => void;
  notifyAnnouncement: (text?: string) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: SEED,
  panelOpen: false,

  unreadCount: () => get().notifications.filter((n) => !n.read).length,

  push: (type, title, message, opts = {}) => {
    const n: AppNotification = {
      id: genId(),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      ...opts,
    };
    set({ notifications: [n, ...get().notifications] });
  },

  markRead: (id) =>
    set({
      notifications: get().notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }),

  markAllRead: () =>
    set({
      notifications: get().notifications.map((n) => ({ ...n, read: true })),
    }),

  remove: (id) =>
    set({ notifications: get().notifications.filter((n) => n.id !== id) }),

  openPanel: () => set({ panelOpen: true }),
  closePanel: () => set({ panelOpen: false }),
  togglePanel: () => set({ panelOpen: !get().panelOpen }),

  notifyNewMessage: (senderName, messagePreview) => {
    get().push(
      'message',
      'New Message',
      messagePreview ? `${senderName}: "${messagePreview}"` : `${senderName} sent you a new message.`,
      { sender: senderName, actionLabel: 'Open Chat', actionRoute: '/chat' }
    );
  },

  notifyTeacherMaterial: (subjectTitle = 'Data Structures', subjectSlug = 'data-structures') => {
    get().push(
      'study_material',
      'New Study Material',
      `New study material has been uploaded for you in ${subjectTitle}.`,
      { sender: 'Teacher (Prof. Priya)', actionLabel: 'Study Now', actionRoute: `/study/${subjectSlug}` }
    );
  },

  notifyTeacherAssessment: (subjectTitle = 'Engineering Mathematics') => {
    get().push(
      'assessment',
      'New Assessment',
      `You have a new assessment in ${subjectTitle}.`,
      { sender: 'Teacher (Prof. Ramesh)', actionLabel: 'View Assessment', actionRoute: '/chat' }
    );
  },

  notifyAssignment: (subjectTitle = 'Python Programming') => {
    get().push(
      'assignment',
      'New Assignment',
      `You have a new assignment due in ${subjectTitle}.`,
      { sender: 'Teacher (Prof. Meena)', actionLabel: 'View Assignment', actionRoute: '/chat' }
    );
  },

  notifyAnnouncement: (text = 'Guest lecture on Artificial Intelligence tomorrow at 3:00 PM.') => {
    get().push(
      'announcement',
      'New Announcement',
      text,
      { sender: 'Admin', actionLabel: 'View Details', actionRoute: '/chat' }
    );
  },
}));

