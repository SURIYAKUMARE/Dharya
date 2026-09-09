export interface MaskedFeature {
  id: string;
  route: string;
  publicLabel: string;
  publicShortLabel: string;
  publicIcon: string;
  publicCategory: string;
  publicDescription: string;
  publicCourseCode: string;
  publicMockPreview: string;
  privateLabel: string;
  privateShortLabel: string;
  privateDescription: string;
}

export const MASKED_FEATURES: Record<string, MaskedFeature> = {
  discuss: {
    id: 'discuss',
    route: '/discuss',
    publicLabel: 'Course Discussion',
    publicShortLabel: 'Discuss',
    publicIcon: 'MessageSquare',
    publicCategory: 'ACADEMIC COLLABORATION',
    publicDescription: 'Real-time course thread with department faculty and research assistants.',
    publicCourseCode: 'ENGR-301 • Dr. Ramesh',
    publicMockPreview: 'Prof. Ramesh: "Eigenvalue solutions for Question 4 have been posted in the portal repository."',
    privateLabel: 'Our Private Chat',
    privateShortLabel: 'Chat',
    privateDescription: 'Encrypted 1-on-1 space just for Surya & Sadhana ❤️🌿'
  },
  streak: {
    id: 'streak',
    route: '/streak',
    publicLabel: 'Study Streak Garden',
    publicShortLabel: 'Streak Garden',
    publicIcon: 'Sprout',
    publicCategory: 'LEARNING CONTINUITY',
    publicDescription: 'Visual plant growth tracking consecutive days of logged academic study sessions.',
    publicCourseCode: 'GATE-2027 • Focus Index',
    publicMockPreview: 'Continuous study logged for 42 days. Daily plant vitality index at 98.4%.',
    privateLabel: 'Our Love Garden Streak',
    privateShortLabel: 'Our Garden',
    privateDescription: 'Every day together blooms another flower in our shared universe 🌿'
  },
  modules: {
    id: 'modules',
    route: '/modules',
    publicLabel: 'Course Timeline',
    publicShortLabel: 'Timeline',
    publicIcon: 'GitBranch',
    publicCategory: 'SYLLABUS PROGRESSION',
    publicDescription: 'Chronological progression of semester modules and syllabus milestones.',
    publicCourseCode: 'CURRICULUM • SEMESTER 4',
    publicMockPreview: 'Module 3: Advanced Linear Transformations and Orthogonal Projections completed.',
    privateLabel: 'Our Story Timeline',
    privateShortLabel: 'Our Milestones',
    privateDescription: 'Every precious moment, memory, and milestone from day one ✨'
  },
  notes: {
    id: 'notes',
    route: '/notes',
    publicLabel: 'Resource Gallery',
    publicShortLabel: 'Notes Gallery',
    publicIcon: 'FileText',
    publicCategory: 'DIGITAL REPOSITORY',
    publicDescription: 'Scanned lecture notes, equation sheets, and handwritten derivation slides.',
    publicCourseCode: 'ARCHIVE • PDF & SCHEMATICS',
    publicMockPreview: '48 handwritten lecture slides and matrix decomposition sheets indexed.',
    privateLabel: 'Our Secret Photo Gallery',
    privateShortLabel: 'Memories',
    privateDescription: 'Our private photos, captured moments, and warm memories 📸'
  },
  schedule: {
    id: 'schedule',
    route: '/schedule',
    publicLabel: 'Exam & Schedule Tracker',
    publicShortLabel: 'Exam Tracker',
    publicIcon: 'Calendar',
    publicCategory: 'EXAMINATION CALENDAR',
    publicDescription: 'Upcoming midterm assessments, lab practicums, and university submission deadlines.',
    publicCourseCode: 'ACADEMIC REGISTRAR • 2026',
    publicMockPreview: 'Midterm Practicum IV begins in 3 days 14 hours. Hall ticket verified.',
    privateLabel: 'Our Date & Plan Tracker',
    privateShortLabel: 'Our Dates',
    privateDescription: 'Upcoming date nights, special anniversaries, and planned getaways 🗓️'
  },
  bonus: {
    id: 'bonus',
    route: '/bonus',
    publicLabel: 'Bonus Study Material',
    publicShortLabel: 'Bonus Box',
    publicIcon: 'Gift',
    publicCategory: 'FACULTY RELEASE',
    publicDescription: 'Conditional bonus problem sets and research archives released on academic milestones.',
    publicCourseCode: 'SUPPLEMENTARY • RESTRICTED',
    publicMockPreview: 'Special derivation packet locked until Friday 20:00. Requires faculty authorization key.',
    privateLabel: 'Surprise Gift Box',
    privateShortLabel: 'Surprise Box',
    privateDescription: 'Locked secret letters, voice notes, and surprises waiting for you 🎁'
  },
  practice: {
    id: 'practice',
    route: '/practice',
    publicLabel: 'Concept Puzzle',
    publicShortLabel: 'Puzzle Drill',
    publicIcon: 'Grid3X3',
    publicCategory: 'PRACTICE PROBLEMS',
    publicDescription: 'Diagram reconstruction exercise testing spatial comprehension and schematic logic.',
    publicCourseCode: 'LOGIC & PROBLEM SOLVING',
    publicMockPreview: 'Reconstruct the 9-piece orthogonal transform matrix diagram to verify solution.',
    privateLabel: 'Our Photo Puzzle',
    privateShortLabel: 'Photo Puzzle',
    privateDescription: 'Solve the sliding puzzle to reconstruct our favorite photo together 🧩'
  },
  location: {
    id: 'location',
    route: '/location',
    publicLabel: 'Campus Distance Tracker',
    publicShortLabel: 'Campus Link',
    publicIcon: 'Compass',
    publicCategory: 'TELEMETRY & NETWORK',
    publicDescription: 'Live node telemetry measuring inter-campus latency and satellite signal distance.',
    publicCourseCode: 'NET-TELEMETRY • NODE-09',
    publicMockPreview: 'Inter-campus telemetry active. Distance to central campus server: 14.2 km.',
    privateLabel: 'Distance Between Us',
    privateShortLabel: 'Our Distance',
    privateDescription: 'No matter the kilometers between us, our hearts are in perfect sync 💖'
  },
  archive: {
    id: 'archive',
    route: '/archive',
    publicLabel: 'Department Archive (PIN)',
    publicShortLabel: 'Archive',
    publicIcon: 'Lock',
    publicCategory: 'DEPT. ARCHIVES',
    publicDescription: 'Inconspicuous locked institutional records requiring security clearance PIN.',
    publicCourseCode: 'SECURITY CLEARANCE LEVEL 2',
    publicMockPreview: 'Department research vault is locked. Enter 4-digit institutional clearance key.',
    privateLabel: 'Secret Room Gateway',
    privateShortLabel: 'Secret Room',
    privateDescription: 'Private sanctum accessible only via our secret shared PIN 🔒'
  }
};
