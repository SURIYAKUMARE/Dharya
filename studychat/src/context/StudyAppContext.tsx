import React, { createContext, useContext, useState, useEffect } from 'react';
import { SUBJECTS_DATA, Subject, TopicExplanation } from '../data/curriculumData';
import { StudyPlanTask, getStoredTasks, addStudyPlanTask, updateTaskStatus, deleteTask, PlanStatus } from '../data/plannerStorage';

export type AppNavTab = 'home' | 'subjects' | 'topic-explanation' | 'assessment' | 'chat-login' | 'chat' | 'gallery' | 'timeline' | 'planner' | 'profile';

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
  const [isChatAuthenticated, setIsChatAuthenticated] = useState<boolean>(() => {
    try {
      const sessionAuth = sessionStorage.getItem('study_chat_auth') === 'true';
      const localAuth = localStorage.getItem('study_chat_auth') === 'true';
      return sessionAuth || localAuth;
    } catch {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState<AppNavTab>(() => {
    try {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const isAuth = sessionStorage.getItem('study_chat_auth') === 'true' ||
                     localStorage.getItem('study_chat_auth') === 'true';

      if (path.includes('academic') || hash === '#academic' || path.includes('curriculum')) {
        return 'home';
      }
      if (path.includes('gallery') || hash === '#gallery') {
        return isAuth ? 'gallery' : 'chat-login';
      }
      if (path.includes('timeline') || hash === '#timeline') {
        return isAuth ? 'timeline' : 'chat-login';
      }
      if (path.includes('planner') || hash === '#planner') {
        return 'planner';
      }
      if (path.includes('login') || hash === '#login') {
        return 'chat-login';
      }

      // Default to Dharya messaging: Chat if logged in, otherwise Dharya Login
      return isAuth ? 'chat' : 'chat-login';
    } catch {}
    return 'chat-login';
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
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      username: 'surya',
      name: 'Surya',
      studentId: 'ENG-2024-0910',
      department: 'Computer Science & Engineering',
      semester: 'Semester 4',
    };
  });

  const updateStudentProfile = (updated: Partial<StudentProfile>) => {
    setStudent((prev) => {
      const next: StudentProfile = {
        username: prev?.username || 'surya',
        name: updated.name !== undefined ? updated.name : prev?.name || 'Surya',
        studentId: updated.studentId !== undefined ? updated.studentId : prev?.studentId || 'ENG-2024-0910',
        department: updated.department !== undefined ? updated.department : prev?.department || 'Computer Science & Engineering',
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
    const record: AssessmentRecord = {
      topicId: selectedTopic.id,
      topicTitle: selectedTopic.title,
      subjectTitle: selectedSubject.title,
      score,
      total,
      percentage: Math.round((score / total) * 100),
      completedAt: Date.now(),
    };
    setAssessmentRecord(record);
    sessionStorage.setItem('study_assessment_record', JSON.stringify(record));
  };

  const openChatLogin = () => {
    openDharyaLogin();
  };

  const quickLogin = (user: 'surya' | 'sadhana'): boolean => {
    if (user === 'surya') {
      const prof: StudentProfile = {
        username: 'surya',
        name: 'Surya',
        studentId: 'ENG-2024-0910',
        department: 'Computer Science & Engineering',
        semester: '4th Semester',
      };
      setStudent(prof);
      setIsChatAuthenticated(true);
      sessionStorage.setItem('study_chat_auth', 'true');
      localStorage.setItem('study_chat_auth', 'true');
      sessionStorage.setItem('study_student_profile', JSON.stringify(prof));
      localStorage.setItem('study_student_profile', JSON.stringify(prof));
      localStorage.setItem('studyportal_current_user', 'surya');
      setAssessmentNotice(null);
      setActiveTab('chat');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return true;
    }

    if (user === 'sadhana') {
      const prof: StudentProfile = {
        username: 'sadhana',
        name: 'Sadhana',
        studentId: 'ENG-2024-2902',
        department: 'Information Technology',
        semester: '4th Semester',
      };
      setStudent(prof);
      setIsChatAuthenticated(true);
      sessionStorage.setItem('study_chat_auth', 'true');
      localStorage.setItem('study_chat_auth', 'true');
      sessionStorage.setItem('study_student_profile', JSON.stringify(prof));
      localStorage.setItem('study_student_profile', JSON.stringify(prof));
      localStorage.setItem('studyportal_current_user', 'sadhana');
      setAssessmentNotice(null);
      setActiveTab('chat');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return true;
    }

    return false;
  };

  const loginToChat = (usernameInput: string, passwordInput: string): boolean => {
    const u = usernameInput.trim().toLowerCase();
    const p = passwordInput.trim();

    // Dual-login: Username sec2511xx / DHARYA / surya / sadhana
    // Password 09/10/2007 -> Surya
    // Password 29/02/2008 -> Sadhana
    if (
      (u === 'dharya' || u === 'surya' || u === '' || u.startsWith('sec') || u.includes('sec') || u === 'sec2511xx') &&
      (p === '09/10/2007' || p === '09102007' || p === 'surya' || p === 'password')
    ) {
      return quickLogin('surya');
    }

    if (
      (u === 'dharya' || u === 'sadhana' || u === '' || u.startsWith('sec') || u.includes('sec') || u === 'sec2511xx') &&
      (p === '29/02/2008' || p === '29022008' || p === 'sadhana' || p === 'password')
    ) {
      return quickLogin('sadhana');
    }

    // Direct password fallback
    if (p === '09/10/2007' || p === '09102007') {
      return quickLogin('surya');
    }
    if (p === '29/02/2008' || p === '29022008') {
      return quickLogin('sadhana');
    }

    // Access strictly restricted to Surya and Sadhana
    setAssessmentNotice('Invalid credentials. Access is restricted to authorized personal accounts.');
    return false;
  };

  const logoutChat = () => {
    setIsChatAuthenticated(false);
    sessionStorage.removeItem('study_chat_auth');
    localStorage.removeItem('study_chat_auth');
    localStorage.removeItem('studyportal_current_user');
    setActiveTab('chat-login');
  };

  const switchTab = (tab: AppNavTab) => {
    if (tab === 'chat' || tab === 'gallery' || tab === 'timeline') {
      if (!isChatAuthenticated) {
        openDharyaLogin();
        return;
      }
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
