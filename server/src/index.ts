import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// =======================================================================
// ALGOTUTOR LMS PRODUCTION REST API
// =======================================================================

// 1. Healthcheck
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    system: 'AlgoTutor LMS Production API',
    timestamp: new Date().toISOString()
  });
});

// 2. Authentication Mock & JWT Controller
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  // Demo auto-accept for Surya / student
  res.json({
    token: 'jwt-token-algotutor-student-2026',
    user: {
      id: 'usr-surya-01',
      name: 'Surya',
      email: email || 'surya@algotutor.io',
      role: 'STUDENT',
      studentId: 'ENG-2024-0910',
      batch: 'Full Stack Elite Batch 2026',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      totalPoints: 8019,
      rank: 54
    }
  });
});

// 3. Main Dashboard Overview API
app.get('/api/dashboard/overview', (req: Request, res: Response) => {
  res.json({
    student: {
      name: 'Surya',
      role: 'Student',
      studentId: 'ENG-2024-0910',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    },
    welcomeStats: {
      totalCourses: 38,
      attendancePercentage: 0,
      studentRank: 54,
      pointsEarned: 8019
    },
    codingAnalytics: {
      totalSolved: 380,
      totalQuestionsInPlatform: 7184,
      easy: { solved: 209, total: 3287, color: '#39BF82' },
      medium: { solved: 104, total: 2333, color: '#FF9F1C' },
      hard: { solved: 67, total: 1564, color: '#E11D48' }
    },
    mcqAnalytics: {
      totalMcqInBank: 39538,
      solvedQuestions: 55,
      correctAnswers: 43,
      accuracyPercentage: 78.18,
      totalScore: '43/55'
    },
    weeklyActivity: [
      { day: 'Sat', solved: 4 },
      { day: 'Sun', solved: 8 },
      { day: 'Mon', solved: 14 },
      { day: 'Tue', solved: 11 },
      { day: 'Wed', solved: 19 },
      { day: 'Thu', solved: 12 },
      { day: 'Fri', solved: 16 }
    ],
    leaderboardPodium: [
      {
        rank: 1,
        name: 'Aarav Patel',
        points: 12450,
        solved: 512,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120',
        badge: 'Gold'
      },
      {
        rank: 2,
        name: 'Sadhana',
        points: 11890,
        solved: 489,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120',
        badge: 'Silver'
      },
      {
        rank: 3,
        name: 'Rohan Sharma',
        points: 10240,
        solved: 421,
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120',
        badge: 'Bronze'
      }
    ],
    problemOfTheDay: {
      id: 'potd-402',
      title: 'Find the Minimum in Rotated Sorted Array',
      difficulty: 'Medium',
      points: 40,
      accuracy: '68.4%',
      tags: ['Binary Search', 'Arrays'],
      description: 'Suppose an array of length n sorted in ascending order is rotated between 1 and n times. Find the minimum element in O(log n) time.'
    }
  });
});

// 4. Academic Courses API
app.get('/api/courses', (req: Request, res: Response) => {
  res.json([
    {
      id: 'crs-1',
      code: 'DSA-301',
      title: 'Mastering Data Structures & Algorithms with System Design',
      instructor: 'Arjit Sharma (Ex-Google, Microsoft)',
      progress: 68,
      totalLessons: 120,
      completedLessons: 82,
      category: 'Data Structures'
    },
    {
      id: 'crs-2',
      code: 'SYS-402',
      title: 'High-Level & Low-Level System Design (HLD + LLD)',
      instructor: 'Vikram Joshi (Staff Engineer)',
      progress: 42,
      totalLessons: 80,
      completedLessons: 34,
      category: 'System Design'
    },
    {
      id: 'crs-3',
      code: 'FULL-201',
      title: 'Production MERN Stack & Microservices with Docker',
      instructor: 'Sneha Roy',
      progress: 90,
      totalLessons: 95,
      completedLessons: 86,
      category: 'Full Stack'
    }
  ]);
});

// 5. Code Execution Simulation Endpoint
app.post('/api/problems/:id/submit', (req: Request, res: Response) => {
  const { code, language } = req.body;
  res.json({
    status: 'ACCEPTED',
    runtime: '42ms',
    memory: '14.2MB',
    testsPassed: 45,
    totalTests: 45,
    pointsAwarded: 40,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`AlgoTutor LMS Production Backend running on port ${PORT}`);
});
