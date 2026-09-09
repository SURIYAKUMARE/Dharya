import React, { createContext, useContext, useState, useEffect } from 'react';
import { SUBJECTS_DATA, Subject, TopicExplanation } from '../data/curriculumData';
import { StudyPlanTask, getStoredTasks, addStudyPlanTask, updateTaskStatus, deleteTask, PlanStatus } from '../data/plannerStorage';

export type AppNavTab = 'home' | 'subjects' | 'topic-explanation' | 'assessment' | 'chat-login' | 'chat' | 'planner' | 'profile';

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
  completeAssessment: (score: number, total: number) => void;
  assessmentRecord: AssessmentRecord | null;
  isAssessmentCompleted: boolean;
  isChatUnlocked: boolean;
  isChatAuthenticated: boolean;
  openChatLogin: () => void;
  loginToChat: (usernameInput: string, passwordInput: string) => boolean;
  logoutChat: () => void;
  student: StudentProfile | null;
  tasks: StudyPlanTask[];
  addTask: (task: Omit<StudyPlanTask, 'id' | 'createdAt'>) => void;
  setTaskStatus: (taskId: string, status: PlanStatus) => void;
  removeTask: (taskId: string) => void;
}

const StudyAppContext = createContext<StudyAppContextType | undefined>(undefined);

export const StudyAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<AppNavTab>('home');
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

  const [isChatAuthenticated, setIsChatAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('study_chat_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [student, setStudent] = useState<StudentProfile | null>(() => {
    try {
      const saved = sessionStorage.getItem('study_student_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

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

  const openAssessment = () => {
    setActiveTab('assessment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    setActiveTab('chat-login');
  };

  const loginToChat = (usernameInput: string, passwordInput: string): boolean => {
    const u = usernameInput.trim().toLowerCase();
    const p = passwordInput.trim();

    // Check credentials: surya / sadhana / student accounts
    if (
      (u === 'surya' || u === 'dharya') &&
      (p === '09/10/2007' || p === '09102007' || p === 'surya' || p === 'password')
    ) {
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
      sessionStorage.setItem('study_student_profile', JSON.stringify(prof));
      setActiveTab('chat');
      return true;
    }

    if (
      (u === 'sadhana' || u === 'dharya') &&
      (p === '29/02/2008' || p === '29022008' || p === 'sadhana' || p === 'password')
    ) {
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
      sessionStorage.setItem('study_student_profile', JSON.stringify(prof));
      setActiveTab('chat');
      return true;
    }

    // Default student demo credential
    if (u === 'student' && (p === 'study123' || p === 'password' || p === '123456')) {
      const prof: StudentProfile = {
        username: 'student',
        name: 'Alex Kumar',
        studentId: 'ENG-2026-8841',
        department: 'Computer Science',
        semester: '4th Semester',
      };
      setStudent(prof);
      setIsChatAuthenticated(true);
      sessionStorage.setItem('study_chat_auth', 'true');
      sessionStorage.setItem('study_student_profile', JSON.stringify(prof));
      setActiveTab('chat');
      return true;
    }

    return false;
  };

  const logoutChat = () => {
    setIsChatAuthenticated(false);
    sessionStorage.removeItem('study_chat_auth');
    setActiveTab('home');
  };

  const switchTab = (tab: AppNavTab) => {
    // If user attempts to click chat directly from nav when locked, guard it
    if (tab === 'chat') {
      if (!isAssessmentCompleted) {
        // Chat is locked until assessment is completed
        return;
      }
      if (!isChatAuthenticated) {
        setActiveTab('chat-login');
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
        completeAssessment,
        assessmentRecord,
        isAssessmentCompleted,
        isChatUnlocked,
        isChatAuthenticated,
        openChatLogin,
        loginToChat,
        logoutChat,
        student,
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
