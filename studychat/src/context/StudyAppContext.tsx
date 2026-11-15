import React, { createContext, useContext, useState, useEffect } from 'react';
import { SUBJECTS_DATA, Subject, TopicExplanation } from '../data/curriculumData';
import { StudyPlanTask, getStoredTasks, addStudyPlanTask, updateTaskStatus, deleteTask, PlanStatus } from '../data/plannerStorage';
import { saveEvaluationRecord, calculateGrade, EvaluationRecord } from '../data/evaluationStorage';

export type AppNavTab = 'home' | 'subjects' | 'topic-explanation' | 'assessment' | 'evaluation' | 'assignments' | 'algotutor' | 'chat-login' | 'chat' | 'gallery' | 'timeline' | 'planner' | 'profile';

export interface AssessmentRecord {
  topicId: string;
  topicTitle: string;
  subjectTitle: string;
  score: number;
  total: number;
  percentage: number;
  completedAt: number;
}

export interface StudentProfile {
  username: string;
  name: string;
  studentId: string;
  department: string;
  college?: string;
  semester: string;
}

interface StudyAppContextType {
  activeTab: AppNavTab;
  switchTab: (tab: AppNavTab) => void;
  selectedSubject: Subject | null;
  selectedTopic: TopicExplanation | null;
  openSubject: (subjectId: string) => void;
  openTopic: (topicId: string) => void;
  openAssessment: () => void;
  openDharyaLogin: () => void;
  openAssessmentQuiz: () => void;
  completeAssessment: (score: number, total: number) => void;
  assessmentRecord: AssessmentRecord | null;
  isAssessmentCompleted: boolean;
  isChatUnlocked: boolean;
  isChatAuthenticated: boolean;
  assessmentNotice: string | null;
  setAssessmentNotice: (notice: string | null) => void;
  openChatLogin: () => void;
  loginToChat: (usernameInput: string, passwordInput: string) => boolean;
  quickLogin: (user: 'surya' | 'sadhana') => boolean;
  logoutChat: () => void;
  student: StudentProfile | null;
  updateStudentProfile: (updated: Partial<StudentProfile>) => void;
  tasks: StudyPlanTask[];
  addTask: (task: Omit<StudyPlanTask, 'id' | 'createdAt'>) => void;
  setTaskStatus: (taskId: string, status: PlanStatus) => void;
  removeTask: (taskId: string) => void;
}

const StudyAppContext = createContext<StudyAppContextType | undefined>(undefined);

export const StudyAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Chat security: ALWAYS false by default. Never default to true.
  // Chat must always require login to access; without login do not go to chatpage.
  const [isChatAuthenticated, setIsChatAuthenticated] = useState<boolean>(false);

  // Clear any legacy persistent authentication on startup so login is always strictly enforced
  useEffect(() => {
    try {
      localStorage.removeItem('study_chat_auth');
      sessionStorage.removeItem('study_chat_auth');
    } catch {}
  }, []);

  // Auto-lock security: when browser tab is hidden, minimized, or screen locked, immediately lock chat
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setIsChatAuthenticated(false);
        try {
          sessionStorage.removeItem('study_chat_auth');
          localStorage.removeItem('study_chat_auth');
        } catch {}
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const [activeTab, setActiveTab] = useState<AppNavTab>(() => {
    try {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#subjects') return 'subjects';
      if (hash === '#planner') return 'planner';
      if (hash === '#profile') return 'profile';
      // When searching the URL or refreshing, always show the Open Engineering Library disguise ('home')
      return 'home';
    } catch {}
    return 'home';
  });
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(SUBJECTS_DATA[0]);
  const [selectedTopic, setSelectedTopic] = useState<TopicExplanation | null>(SUBJECTS_DATA[0].topics[0]);

  // Assessment & Chat Gating State
  const [assessmentRecord, setAssessmentRecord] = useState<AssessmentRecord | null>(() => {
    try {
      const saved = sessionStorage.getItem('study_assessment_record');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [assessmentNotice, setAssessmentNotice] = useState<string | null>(null);

  const [student, setStudent] = useState<StudentProfile | null>(() => {
    try {
      const saved = sessionStorage.getItem('study_student_profile') || localStorage.getItem('study_student_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name && !parsed.name.toLowerCase().includes('surya')) {
          return parsed;
        }
      }
    } catch {}
    return {
      username: 'sadhana',
      name: 'SADHANA N',
      studentId: 'SEC25EI091',
      department: 'Electronics and Instrumentation Engineering',
      college: 'Sri Sairam Engineering College',
      semester: 'Semester 4',
    };
  });

  const updateStudentProfile = (updated: Partial<StudentProfile>) => {
    setStudent((prev) => {
      const next: StudentProfile = {
        username: prev?.username || 'sadhana',
        name: updated.name !== undefined ? updated.name : prev?.name || 'SADHANA N',
        studentId: updated.studentId !== undefined ? updated.studentId : prev?.studentId || 'SEC25EI091',
        department: updated.department !== undefined ? updated.department : prev?.department || 'Electronics and Instrumentation Engineering',
        college: updated.college !== undefined ? updated.college : prev?.college || 'Sri Sairam Engineering College',
        semester: updated.semester !== undefined ? updated.semester : prev?.semester || 'Semester 4',
      };
      sessionStorage.setItem('study_student_profile', JSON.stringify(next));
      localStorage.setItem('study_student_profile', JSON.stringify(next));
      return next;
    });
  };

  // Planner tasks
  const [tasks, setTasks] = useState<StudyPlanTask[]>(() => getStoredTasks());

  const isAssessmentCompleted = !!assessmentRecord;
  const isChatUnlocked = isAssessmentCompleted;

  const openSubject = (subjectId: string) => {
    const found = SUBJECTS_DATA.find((s) => s.id === subjectId) || SUBJECTS_DATA[0];
    setSelectedSubject(found);
    setActiveTab('subjects');
  };

  const openTopic = (topicId: string) => {
    let foundTopic: TopicExplanation | null = null;
    let foundSub: Subject | null = null;

    for (const sub of SUBJECTS_DATA) {
      const t = sub.topics.find((x) => x.id === topicId);
      if (t) {
        foundTopic = t;
        foundSub = sub;
        break;
      }
    }

    if (foundTopic && foundSub) {
      setSelectedSubject(foundSub);
      setSelectedTopic(foundTopic);
      setActiveTab('topic-explanation');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openDharyaLogin = () => {
    // Record topic verification so chat gate is satisfied
    if (selectedTopic && selectedSubject && !assessmentRecord) {
      const record: AssessmentRecord = {
        topicId: selectedTopic.id,
        topicTitle: selectedTopic.title,
        subjectTitle: selectedSubject.title,
        score: 3,
        total: 3,
        percentage: 100,
        completedAt: Date.now(),
      };
      setAssessmentRecord(record);
      sessionStorage.setItem('study_assessment_record', JSON.stringify(record));
    }
    setActiveTab('chat-login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAssessmentQuiz = () => {
    setActiveTab('assessment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAssessment = () => {
    openDharyaLogin();
  };

  const completeAssessment = (score: number, total: number) => {
    if (!selectedTopic || !selectedSubject) return;
    const pct = Math.round((score / total) * 100);
    const record: AssessmentRecord = {
      topicId: selectedTopic.id,
      topicTitle: selectedTopic.title,
      subjectTitle: selectedSubject.title,
      score,
      total,
      percentage: pct,
      completedAt: Date.now(),
    };
    setAssessmentRecord(record);
    sessionStorage.setItem('study_assessment_record', JSON.stringify(record));

    // Save into persistent evaluation history
    const evalRecord: EvaluationRecord = {
      id: `eval-topic-${Date.now()}`,
      title: `${selectedTopic.title} Topic Assessment`,
      subjectTitle: selectedSubject.title,
      subjectId: selectedSubject.id,
      mode: 'topic-quiz',
      score,
      total,
      percentage: pct,
      grade: calculateGrade(pct),
      passed: pct >= 50,
      durationSeconds: Math.max(60, total * 35),
      completedAt: Date.now(),
      domain: selectedSubject.title,
      questions: []
    };
    saveEvaluationRecord(evalRecord);
  };

  const openChatLogin = () => {
    openDharyaLogin();
  };

  const quickLogin = (user: 'surya' | 'sadhana'): boolean => {
    const prof: StudentProfile = {
      username: user,
      name: 'SADHANA N',
      studentId: 'SEC25EI091',
      department: 'Electronics and Instrumentation Engineering',
      college: 'Sri Sairam Engineering College',
      semester: '4th Semester',
    };
    setStudent(prof);
    setIsChatAuthenticated(true);
    // Session-only authentication: never store permanent login bypass in localStorage
    sessionStorage.setItem('study_student_profile', JSON.stringify(prof));
    localStorage.setItem('study_student_profile', JSON.stringify(prof));
    localStorage.setItem('studyportal_current_user', user);
    setAssessmentNotice(null);
    setActiveTab('chat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return true;
  };

  const loginToChat = (usernameInput: string, passwordInput: string): boolean => {
    const u = usernameInput.trim().toUpperCase();
    const p = passwordInput.trim();

    // 1. Institutional Student ID: SEC25EI091 & Sn@2902
    if (u === 'SEC25EI091' && (p === 'Sn@2902' || p === 'sn@2902' || p === '29/02/2008' || p === '29022008')) {
      return quickLogin('sadhana');
    }

    // 2. Secret authorized student accounts: Surya & Sadhana
    const isAuthorized = u === 'DHARYA' || u === 'SURYA' || u === 'SADHANA' || u === '';

    if (isAuthorized) {
      if (p === '09/10/2007' || p === '09102007') {
        return quickLogin('surya');
      }
      if (p === '29/02/2008' || p === '29022008' || p === 'Sn@2902' || p === 'sn@2902') {
        return quickLogin('sadhana');
      }
    }

    // Direct password fallback
    if (p === 'Sn@2902' || p === 'sn@2902') {
      return quickLogin('sadhana');
    }
    if (p === '09/10/2007' || p === '09102007') {
      return quickLogin('surya');
    }
    if (p === '29/02/2008' || p === '29022008') {
      return quickLogin('sadhana');
    }

    // Incorrect password / unauthorized access
    setAssessmentNotice('Incorrect credentials. Please verify your student status by completing the proctored assessment examination.');
    return false;
  };

  const logoutChat = () => {
    setIsChatAuthenticated(false);
    try {
      sessionStorage.removeItem('study_chat_auth');
      localStorage.removeItem('study_chat_auth');
      localStorage.removeItem('studyportal_current_user');
    } catch {}
    setActiveTab('home');
    if (window.location.hash) {
      try {
        window.history.replaceState(null, '', window.location.pathname);
      } catch {}
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const switchTab = (tab: AppNavTab) => {
    // If leaving the private portal (chat, gallery, timeline) to a public academic view, lock chat immediately!
    if (
      (activeTab === 'chat' || activeTab === 'gallery' || activeTab === 'timeline') &&
      (tab !== 'chat' && tab !== 'gallery' && tab !== 'timeline')
    ) {
      setIsChatAuthenticated(false);
      try {
        sessionStorage.removeItem('study_chat_auth');
        localStorage.removeItem('study_chat_auth');
      } catch {}
    }

    // Security check: attempting to go to private chat/gallery/timeline WITHOUT login must always redirect to chat-login
    if (tab === 'chat' || tab === 'gallery' || tab === 'timeline') {
      if (!isChatAuthenticated) {
        setActiveTab('chat-login');
        try {
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        } catch {}
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setActiveTab(tab);
    try {
      if (tab === 'home' || tab === 'chat' || tab === 'gallery' || tab === 'timeline' || tab === 'chat-login') {
        // Do not store #chat or #login in hash so refreshing automatically returns to Open Engineering Library ('home')
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      } else {
        window.location.hash = `#${tab}`;
      }
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Synchronize document title with active view
  useEffect(() => {
    try {
      if (activeTab === 'home') {
        document.title = 'Open Engineering Library — AICTE Model Syllabus & Academic Portal';
      } else if (activeTab === 'subjects') {
        document.title = 'Engineering Curriculum & Syllabus — ENGIHUB';
      } else if (activeTab === 'topic-explanation') {
        document.title = `${selectedTopic?.title || 'Course Unit'} — ENGIHUB Academic Portal`;
      } else if (activeTab === 'planner') {
        document.title = 'Study Planner & Timetable — ENGIHUB';
      } else if (activeTab === 'profile') {
        document.title = 'Student Profile — ENGIHUB Academic Portal';
      } else if (activeTab === 'assessment') {
        document.title = 'Proctored Assessment Quiz — ENGIHUB';
      } else if (activeTab === 'chat' || activeTab === 'gallery' || activeTab === 'timeline') {
        document.title = 'Dharya — Private Space';
      } else if (activeTab === 'chat-login') {
        document.title = 'Student Access Portal — ENGIHUB';
      }
    } catch {}
  }, [activeTab, selectedTopic]);

  // Handle browser back/forward and direct hash navigation
  useEffect(() => {
    const handleHashChange = () => {
      try {
        const hash = window.location.hash.toLowerCase();
        if (hash === '#academic' || hash === '#home' || hash === '#library' || hash === '') {
          setActiveTab('home');
        } else if (hash === '#subjects' || hash === '#curriculum') {
          setActiveTab('subjects');
        } else if (hash === '#planner') {
          setActiveTab('planner');
        } else if (hash === '#profile') {
          setActiveTab('profile');
        } else if (hash === '#chat' || hash === '#gallery' || hash === '#timeline') {
          // ALWAYS require login before accessing chat, gallery, or timeline
          if (isChatAuthenticated) {
            setActiveTab(hash === '#gallery' ? 'gallery' : hash === '#timeline' ? 'timeline' : 'chat');
          } else {
            setActiveTab('chat-login');
          }
          try {
            window.history.replaceState(null, '', window.location.pathname);
          } catch {}
        } else if (hash === '#login') {
          setActiveTab('home');
          try {
            window.history.replaceState(null, '', window.location.pathname);
          } catch {}
        }
      } catch {}
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isChatAuthenticated]);

  // Global toggle shortcut: Ctrl+Shift+D or Cmd+Shift+D to toggle between Academic Mode and Chat/Login
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setActiveTab((prev) => {
          if (prev === 'chat' || prev === 'chat-login' || prev === 'gallery' || prev === 'timeline') {
            if (window.location.hash) {
              window.history.pushState(null, '', window.location.pathname);
            }
            // Disguise away: lock chat immediately!
            setIsChatAuthenticated(false);
            try {
              sessionStorage.removeItem('study_chat_auth');
              localStorage.removeItem('study_chat_auth');
            } catch {}
            return 'home';
          } else {
            // ALWAYS open login screen! Without login do not go to chatpage.
            return 'chat-login';
          }
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addTask = (task: Omit<StudyPlanTask, 'id' | 'createdAt'>) => {
    addStudyPlanTask(task);
    setTasks(getStoredTasks());
  };

  const setTaskStatus = (taskId: string, status: PlanStatus) => {
    const updated = updateTaskStatus(taskId, status);
    setTasks(updated);
  };

  const removeTask = (taskId: string) => {
    const updated = deleteTask(taskId);
    setTasks(updated);
  };

  return (
    <StudyAppContext.Provider
      value={{
        activeTab,
        switchTab,
        selectedSubject,
        selectedTopic,
        openSubject,
        openTopic,
        openAssessment,
        openDharyaLogin,
        openAssessmentQuiz,
        completeAssessment,
        assessmentRecord,
        isAssessmentCompleted,
        isChatUnlocked,
        isChatAuthenticated,
        assessmentNotice,
        setAssessmentNotice,
        openChatLogin,
        loginToChat,
        quickLogin,
        logoutChat,
        student,
        updateStudentProfile,
        tasks,
        addTask,
        setTaskStatus,
        removeTask,
      }}
    >
      {children}
    </StudyAppContext.Provider>
  );
};

export function useStudyApp() {
  const context = useContext(StudyAppContext);
  if (!context) {
    throw new Error('useStudyApp must be used within a StudyAppProvider');
  }
  return context;
}
