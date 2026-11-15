# AlgoTutor Student Learning Management Platform — Backend & Full-Stack System

Production-grade, modular, scalable backend service and REST APIs powering the **Modern Student Learning Management Dashboard** inspired by AlgoTutor.

---

## 1. Technology Stack

- **Runtime & Framework**: Node.js, Express.js, TypeScript
- **Database & ORM**: PostgreSQL, Prisma ORM
- **Authentication**: JWT (JSON Web Tokens), bcryptjs password hashing
- **Validation**: Zod schema validation
- **Frontend Integration**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Framer Motion

---

## 2. Quick Start & Setup Instructions

### Prerequisites
- Node.js >= 20.x
- PostgreSQL database instance (local or hosted e.g. Supabase, Neon, Railway)

### Installation
```bash
# Navigate to the backend directory
cd server

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

### Environment Configuration (`.env`)
```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/algotutor_lms?schema=public"
JWT_SECRET="algotutor_super_secret_jwt_key_2026"
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
```

### Database Migration & Seed
```bash
# Generate Prisma Client
npm run prisma:generate

# Run Database Migrations
npm run prisma:migrate

# Seed Database with Realistic Course, Problem & Analytics Data
npm run prisma:seed
```

### Running the Server
```bash
# Start in development mode with hot-reloading
npm run dev

# Build and start in production
npm run build
npm start
```

---

## 3. Database Schema Overview (Prisma ORM)

The relational schema (`server/prisma/schema.prisma`) models the complete LMS domain:

1. `User`: Students, Faculty, and Admin accounts with roles, batches, rank, and total points.
2. `Course`: Course catalog with codes, instructors, lesson counts, and credit hours.
3. `Enrollment`: Many-to-many relationship tracking lesson progress percentage and completion.
4. `Attendance`: Session logs with statuses (`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`).
5. `CodingProblem`: Coding challenge repository with difficulty (`EASY`, `MEDIUM`, `HARD`), test cases, and tags.
6. `CodingSubmission`: Submissions with language, code, runtime ms, memory, and status (`ACCEPTED`, `WRONG_ANSWER`, etc.).
7. `McqQuestion`: Question bank with options, correct answer index, explanations, and categories.
8. `QuizAttempt` & `QuizAttemptDetail`: User quiz submissions with question-by-question choices and scores.
9. `Assessment`: Proctored examination metadata with passing thresholds.
10. `Project`: Capstone portfolio projects with GitHub/live URLs, statuses, and mentor feedback.
11. `Reward`: Karma badges and achievement unlocks.
12. `LeaderboardScore`: Aggregated ranking points, problem count, and streaks.
13. `Notification`: System announcements and evaluation alerts.

---

## 4. Key REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status check |
| `POST` | `/api/auth/login` | Student & Faculty JWT login |
| `GET` | `/api/dashboard/overview` | Returns complete dashboard analytics (Courses: 38, Attendance: 0%, Rank: 54, Points: 8019, Solved: 380, MCQ stats, Weekly curve, Leaderboard podium) |
| `GET` | `/api/courses` | Lists enrolled & available courses |
| `POST` | `/api/problems/:id/submit` | Executes and grades code against test suite |
| `GET` | `/api/mcq/questions` | Fetches randomized MCQ question sets |
| `GET` | `/api/attendance` | Returns student attendance history |
| `GET` | `/api/leaderboard` | Returns global and weekly student rankings |

---

## 5. Role-Based Access Control (RBAC)

- **Student**: Access personalized dashboard, courses, coding challenges, MCQ quizzes, portfolio projects, and resume builder.
- **Faculty**: Publish course materials, evaluate capstone projects, grade assignments, and monitor cohort attendance.
- **Admin**: Manage platform settings, user permissions, and curriculum accreditations.
