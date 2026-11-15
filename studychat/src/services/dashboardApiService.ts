// =======================================================================
// ALGOTUTOR STUDENT LEARNING MANAGEMENT DASHBOARD DATA SERVICE (2026-2027)
// Manages real-time metrics, analytics, courses, problem solving & leaderboard
// =======================================================================

export interface DashboardWelcomeStats {
  totalCourses: number;
  attendancePercentage: number;
  studentRank: number;
  pointsEarned: number;
}

export interface CodingAnalyticsData {
  totalSolved: number;
  totalPlatformProblems: number;
  easy: { solved: number; total: number; color: string };
  medium: { solved: number; total: number; color: string };
  hard: { solved: number; total: number; color: string };
}

export interface McqAnalyticsData {
  totalMcqInBank: number;
  solvedQuestions: number;
  correctAnswers: number;
  accuracyPercentage: number;
  totalScore: string;
}

export interface WeeklyProblemData {
  day: string;
  solved: number;
  submissions: number;
}

export interface LeaderboardStudent {
  rank: number;
  name: string;
  points: number;
  solved: number;
  accuracy: number;
  avatar: string;
  badge: 'Gold' | 'Silver' | 'Bronze' | 'Member';
  batch: string;
}

export interface ProblemOfTheDay {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  acceptanceRate: string;
  tags: string[];
  description: string;
  starterCode: {
    python: string;
    cpp: string;
    java: string;
  };
}

export interface AcademicCourseItem {
  id: string;
  code: string;
  title: string;
  instructor: string;
  category: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  hours: number;
  enrolledDate: string;
  nextLessonTitle: string;
}

export interface AttendanceRecordItem {
  date: string;
  sessionTitle: string;
  instructor: string;
  status: 'Present' | 'Absent' | 'Late';
  duration: string;
}

export interface JobOpportunityItem {
  id: string;
  role: string;
  company: string;
  logo: string;
  location: string;
  type: string;
  salary: string;
  experience: string;
  tags: string[];
  applied: boolean;
}

// 1. Initial AlgoTutor Core Metrics
export const INITIAL_WELCOME_STATS: DashboardWelcomeStats = {
  totalCourses: 38,
  attendancePercentage: 0,
  studentRank: 54,
  pointsEarned: 8019
};

export const INITIAL_CODING_ANALYTICS: CodingAnalyticsData = {
  totalSolved: 380,
  totalPlatformProblems: 7184,
  easy: { solved: 209, total: 3287, color: '#39BF82' },
  medium: { solved: 104, total: 2333, color: '#FF9F1C' },
  hard: { solved: 67, total: 1564, color: '#E11D48' }
};

export const INITIAL_MCQ_ANALYTICS: McqAnalyticsData = {
  totalMcqInBank: 39538,
  solvedQuestions: 55,
  correctAnswers: 43,
  accuracyPercentage: 78.18,
  totalScore: '43/55'
};

// Saturday to Friday Timeline
export const INITIAL_WEEKLY_ACTIVITY: WeeklyProblemData[] = [
  { day: 'Sat', solved: 4, submissions: 9 },
  { day: 'Sun', solved: 8, submissions: 15 },
  { day: 'Mon', solved: 14, submissions: 24 },
  { day: 'Tue', solved: 11, submissions: 19 },
  { day: 'Wed', solved: 19, submissions: 32 },
  { day: 'Thu', solved: 12, submissions: 22 },
  { day: 'Fri', solved: 16, submissions: 28 }
];

export const INITIAL_LEADERBOARD: LeaderboardStudent[] = [
  {
    rank: 1,
    name: 'Aarav Patel',
    points: 12450,
    solved: 512,
    accuracy: 94.2,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120',
    badge: 'Gold',
    batch: 'Elite Batch 2026'
  },
  {
    rank: 2,
    name: 'Sadhana',
    points: 11890,
    solved: 489,
    accuracy: 92.8,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120',
    badge: 'Silver',
    batch: 'Elite Batch 2026'
  },
  {
    rank: 3,
    name: 'Rohan Sharma',
    points: 10240,
    solved: 421,
    accuracy: 89.4,
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120',
    badge: 'Bronze',
    batch: 'Elite Batch 2026'
  },
  {
    rank: 4,
    name: 'Neha Verma',
    points: 9840,
    solved: 405,
    accuracy: 88.1,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120',
    badge: 'Member',
    batch: 'Full Stack Batch'
  },
  {
    rank: 5,
    name: 'SADHANA N (You)',
    points: 8019,
    solved: 380,
    accuracy: 85.6,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
    badge: 'Member',
    batch: 'Elite Batch 2026'
  }
];

export const PROBLEM_OF_THE_DAY: ProblemOfTheDay = {
  id: 'potd-402',
  title: 'Find Minimum in Rotated Sorted Array',
  difficulty: 'Medium',
  points: 40,
  acceptanceRate: '68.4%',
  tags: ['Binary Search', 'Arrays', 'Divide & Conquer'],
  description:
    'Suppose an array of length n sorted in ascending order is rotated between 1 and n times. Notice that rotating an array [a[0], a[1], ..., a[n-1]] 1 time results in [a[n-1], a[0], ..., a[n-2]]. Given the sorted rotated array nums of unique elements, return the minimum element of this array in O(log n) time.',
  starterCode: {
    python: `def findMin(nums: list[int]) -> int:
    left, right = 0, len(nums) - 1
    while left < right:
        mid = (left + right) // 2
        if nums[mid] > nums[right]:
            left = mid + 1
        else:
            right = mid
    return nums[left]`,
    cpp: `class Solution {
public:
    int findMin(vector<int>& nums) {
        int left = 0, right = nums.size() - 1;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] > nums[right]) left = mid + 1;
            else right = mid;
        }
        return nums[left];
    }
};`,
    java: `class Solution {
    public int findMin(int[] nums) {
        int left = 0, right = nums.length - 1;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] > nums[right]) left = mid + 1;
            else right = mid;
        }
        return nums[left];
    }
}`
  }
};

export const ACADEMIC_COURSES: AcademicCourseItem[] = [
  {
    id: 'crs-dsa',
    code: 'DSA-301',
    title: 'Mastering Data Structures & Algorithms with System Design',
    instructor: 'Arjit Sharma (Ex-Google, Microsoft)',
    category: 'Computer Science',
    progress: 68,
    totalLessons: 120,
    completedLessons: 82,
    hours: 48.5,
    enrolledDate: 'Aug 15, 2026',
    nextLessonTitle: 'Lesson 83: Dynamic Programming on Trees & Rerooting'
  },
  {
    id: 'crs-sys',
    code: 'SYS-402',
    title: 'High-Level & Low-Level System Design (HLD + LLD)',
    instructor: 'Vikram Joshi (Staff Engineer)',
    category: 'System Design',
    progress: 42,
    totalLessons: 80,
    completedLessons: 34,
    hours: 36.0,
    enrolledDate: 'Sep 01, 2026',
    nextLessonTitle: 'Lesson 35: Designing a Distributed Rate Limiter & Token Bucket'
  },
  {
    id: 'crs-full',
    code: 'MERN-201',
    title: 'Production Full-Stack Architecture & Microservices with Docker',
    instructor: 'Sneha Roy',
    category: 'Full Stack',
    progress: 90,
    totalLessons: 95,
    completedLessons: 86,
    hours: 52.0,
    enrolledDate: 'Jul 20, 2026',
    nextLessonTitle: 'Lesson 87: Kubernetes Deployment Manifests & Helm Charts'
  },
  {
    id: 'crs-cloud',
    code: 'CLOUD-303',
    title: 'AWS Certified Solutions Architect & Cloud Engineering',
    instructor: 'David Miller',
    category: 'Cloud & DevOps',
    progress: 25,
    totalLessons: 60,
    completedLessons: 15,
    hours: 28.0,
    enrolledDate: 'Oct 10, 2026',
    nextLessonTitle: 'Lesson 16: Amazon VPC Peering & Transit Gateway Routing'
  }
];

export const ATTENDANCE_RECORDS: AttendanceRecordItem[] = [
  { date: 'Nov 14, 2026', sessionTitle: 'Advanced Graph Theory & Network Flows', instructor: 'Arjit Sharma', status: 'Present', duration: '2h 15m' },
  { date: 'Nov 12, 2026', sessionTitle: 'System Design: Distributed Caching (Redis/Memcached)', instructor: 'Vikram Joshi', status: 'Present', duration: '1h 50m' },
  { date: 'Nov 10, 2026', sessionTitle: 'SQL Query Optimization & Database Sharding', instructor: 'Sneha Roy', status: 'Present', duration: '2h 00m' },
  { date: 'Nov 07, 2026', sessionTitle: 'Concurrency, Mutexes & Lock-Free Data Structures', instructor: 'Arjit Sharma', status: 'Present', duration: '2h 10m' }
];

export const JOB_OPPORTUNITIES: JobOpportunityItem[] = [
  {
    id: 'job-1',
    role: 'Software Development Engineer I (Backend)',
    company: 'Atlassian',
    logo: '⚡',
    location: 'Bengaluru, India (Hybrid)',
    type: 'Full-time',
    salary: '₹22 - 28 LPA',
    experience: '0 - 2 Years',
    tags: ['Java', 'Distributed Systems', 'AWS', 'Spring Boot'],
    applied: false
  },
  {
    id: 'job-2',
    role: 'Frontend Engineer (React / TypeScript)',
    company: 'Razorpay',
    logo: '💳',
    location: 'Bengaluru / Remote',
    type: 'Full-time',
    salary: '₹18 - 24 LPA',
    experience: '1 - 3 Years',
    tags: ['React', 'TypeScript', 'Next.js', 'Tailwind'],
    applied: true
  },
  {
    id: 'job-3',
    role: 'AI / Machine Learning Engineer',
    company: 'Microsoft',
    logo: '🤖',
    location: 'Hyderabad, India',
    type: 'Full-time',
    salary: '₹26 - 34 LPA',
    experience: '0 - 3 Years',
    tags: ['Python', 'PyTorch', 'Transformers', 'MLOps'],
    applied: false
  }
];
