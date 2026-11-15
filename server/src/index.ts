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

// =======================================================================
// 6. WHATSAPP-STYLE 24-HOUR STATUS SYSTEM REST APIS
// =======================================================================

interface InMemStatus {
  id: string;
  userId: string;
  authorName: string;
  authorAvatar: string;
  type: 'photo' | 'video' | 'text' | 'audio';
  mediaUrl: string;
  audioUrl?: string;
  songTitle?: string;
  songArtist?: string;
  caption?: string;
  textContent?: string;
  backgroundColor?: string;
  fontFamily?: string;
  filter?: string;
  drawingDataUrl?: string;
  privacy: 'contacts' | 'except' | 'only' | 'private';
  excludedContacts: string[];
  includedContacts: string[];
  createdAt: number;
  expiresAt: number;
  deletedAt?: number | null;
  isArchived?: boolean;
}

interface InMemStatusView {
  id: string;
  statusId: string;
  viewerId: string;
  viewerName: string;
  viewerAvatar: string;
  reaction?: string;
  viewedAt: number;
}

interface InMemStatusReply {
  id: string;
  statusId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  text: string;
  previewText?: string;
  createdAt: number;
}

// In-Memory store initialized with production defaults
const activeStatusesStore: InMemStatus[] = [];
const statusViewsStore: InMemStatusView[] = [];
const statusRepliesStore: InMemStatusReply[] = [];
let userPrivacySettings: Record<string, { mode: 'contacts' | 'except' | 'only' | 'private'; excludedContacts: string[]; includedContacts: string[] }> = {
  surya: { mode: 'contacts', excludedContacts: [], includedContacts: [] },
  sadhana: { mode: 'contacts', excludedContacts: [], includedContacts: [] }
};

// 6.1 Status Feed Endpoint (with Server-side 24-hour expiration & Privacy Enforcement)
app.get('/api/status/feed', (req: Request, res: Response) => {
  const userId = ((req.query.userId as string) || 'surya').toLowerCase();
  const now = Date.now();

  // Purge/filter expired statuses (> 24 hours) and deleted statuses
  const nonExpired = activeStatusesStore.filter(s => s.expiresAt > now && !s.deletedAt);

  // Group statuses by author, enforcing server-side privacy rules
  const userMap = new Map<string, InMemStatus[]>();

  nonExpired.forEach(status => {
    const owner = status.userId.toLowerCase();
    if (owner === userId) return; // Don't include self in contact feed

    // Privacy logic
    if (status.privacy === 'private') return;
    if (status.privacy === 'except' && status.excludedContacts.map(c => c.toLowerCase()).includes(userId)) return;
    if (status.privacy === 'only' && !status.includedContacts.map(c => c.toLowerCase()).includes(userId)) return;

    if (!userMap.has(owner)) userMap.set(owner, []);
    userMap.get(owner)!.push(status);
  });

  const viewedStatusIds = new Set(
    statusViewsStore
      .filter(v => v.viewerId.toLowerCase() === userId)
      .map(v => v.statusId)
  );

  const recentUpdates: any[] = [];
  const viewedUpdates: any[] = [];

  userMap.forEach((statuses, contactId) => {
    statuses.sort((a, b) => a.createdAt - b.createdAt);
    const hasUnseen = statuses.some(s => !viewedStatusIds.has(s.id));
    const latestStatus = statuses[statuses.length - 1];

    const groupPayload = {
      contactId,
      authorName: latestStatus.authorName,
      authorAvatar: latestStatus.authorAvatar,
      lastUpdated: latestStatus.createdAt,
      statuses,
      hasUnseen,
      totalCount: statuses.length
    };

    if (hasUnseen) {
      recentUpdates.push(groupPayload);
    } else {
      viewedUpdates.push(groupPayload);
    }
  });

  res.json({
    recentUpdates,
    viewedUpdates,
    serverTime: now
  });
});

// 6.2 Get Current User's Active Statuses
app.get('/api/status/my', (req: Request, res: Response) => {
  const userId = ((req.query.userId as string) || 'surya').toLowerCase();
  const now = Date.now();

  const myStatuses = activeStatusesStore
    .filter(s => s.userId.toLowerCase() === userId && s.expiresAt > now && !s.deletedAt)
    .sort((a, b) => a.createdAt - b.createdAt);

  res.json({
    statuses: myStatuses,
    count: myStatuses.length
  });
});

// 6.3 Upload / Publish Status (Photo, Video, Text, Audio with 24-Hour Expiration)
app.post('/api/status/upload', (req: Request, res: Response) => {
  const {
    userId,
    authorName,
    authorAvatar,
    type,
    mediaUrl,
    audioUrl,
    songTitle,
    songArtist,
    caption,
    textContent,
    backgroundColor,
    fontFamily,
    filter,
    drawingDataUrl,
    privacy
  } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const now = Date.now();
  const userPrivacy = userPrivacySettings[userId.toLowerCase()] || { mode: 'contacts', excludedContacts: [], includedContacts: [] };

  const newStatus: InMemStatus = {
    id: 'status_' + now + '_' + Math.random().toString(36).substring(2, 8),
    userId: userId.toLowerCase(),
    authorName: authorName || (userId.toLowerCase() === 'surya' ? 'Surya' : 'Dhanya'),
    authorAvatar: authorAvatar || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=150',
    type: type || 'photo',
    mediaUrl: mediaUrl || '',
    audioUrl,
    songTitle,
    songArtist,
    caption,
    textContent,
    backgroundColor,
    fontFamily,
    filter,
    drawingDataUrl,
    privacy: privacy || userPrivacy.mode,
    excludedContacts: userPrivacy.excludedContacts || [],
    includedContacts: userPrivacy.includedContacts || [],
    createdAt: now,
    expiresAt: now + 24 * 60 * 60 * 1000 // Exact 24-hour expiration
  };

  activeStatusesStore.unshift(newStatus);

  res.status(201).json({
    success: true,
    status: newStatus
  });
});

// 6.4 Record Unique Status View (Duplicate Prevention & Read Receipts)
app.post('/api/status/:id/view', (req: Request, res: Response) => {
  const statusId = req.params.id;
  const { viewerId, viewerName, viewerAvatar } = req.body;

  if (!viewerId) {
    return res.status(400).json({ error: 'Viewer ID is required' });
  }

  const status = activeStatusesStore.find(s => s.id === statusId);
  if (!status) {
    return res.status(404).json({ error: 'Status not found or expired' });
  }

  // Prevent recording self-view as spectator
  if (status.userId.toLowerCase() === viewerId.toLowerCase()) {
    return res.json({ recorded: false, reason: 'self-view' });
  }

  // Deduplicate: Check existing view
  const existing = statusViewsStore.find(
    v => v.statusId === statusId && v.viewerId.toLowerCase() === viewerId.toLowerCase()
  );

  if (existing) {
    existing.viewedAt = Date.now();
    return res.json({ recorded: true, view: existing, isDuplicate: true });
  }

  const newView: InMemStatusView = {
    id: 'view_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    statusId,
    viewerId,
    viewerName: viewerName || 'Student',
    viewerAvatar: viewerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    viewedAt: Date.now()
  };

  statusViewsStore.push(newView);

  res.json({
    recorded: true,
    view: newView,
    totalViewers: statusViewsStore.filter(v => v.statusId === statusId).length
  });
});

// 6.5 Get Viewers List (Authorized to Status Owner Only)
app.get('/api/status/:id/viewers', (req: Request, res: Response) => {
  const statusId = req.params.id;
  const requesterId = ((req.query.requesterId as string) || '').toLowerCase();

  const status = activeStatusesStore.find(s => s.id === statusId);
  if (!status) {
    return res.status(404).json({ error: 'Status not found' });
  }

  // Authorization check
  if (status.userId.toLowerCase() !== requesterId) {
    return res.status(403).json({ error: 'Unauthorized: Only the status owner can view the viewer list' });
  }

  const viewers = statusViewsStore
    .filter(v => v.statusId === statusId)
    .sort((a, b) => b.viewedAt - a.viewedAt);

  res.json({
    statusId,
    totalCount: viewers.length,
    viewers
  });
});

// 6.6 Status Emoji Reaction
app.post('/api/status/:id/react', (req: Request, res: Response) => {
  const statusId = req.params.id;
  const { userId, emoji } = req.body;

  const view = statusViewsStore.find(
    v => v.statusId === statusId && v.viewerId.toLowerCase() === (userId || '').toLowerCase()
  );

  if (view) {
    view.reaction = emoji;
  }

  res.json({ success: true, statusId, emoji });
});

// 6.7 Status Reply (Dispatched directly into private chat)
app.post('/api/status/:id/reply', (req: Request, res: Response) => {
  const statusId = req.params.id;
  const { senderId, senderName, text } = req.body;

  const status = activeStatusesStore.find(s => s.id === statusId);
  if (!status) {
    return res.status(404).json({ error: 'Status not found' });
  }

  const reply: InMemStatusReply = {
    id: 'reply_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    statusId,
    senderId: senderId || 'surya',
    senderName: senderName || 'Surya',
    receiverId: status.userId,
    text: (text || '').trim(),
    previewText: status.caption || status.textContent || 'Status Story',
    createdAt: Date.now()
  };

  statusRepliesStore.push(reply);

  res.status(201).json({
    success: true,
    reply,
    chatMessage: {
      text: `💬 Status Reply: "${reply.previewText}"\n\n${reply.text}`,
      sender: reply.senderId,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  });
});

// 6.8 Delete Status (Authorized to Owner Only)
app.delete('/api/status/:id', (req: Request, res: Response) => {
  const statusId = req.params.id;
  const requesterId = ((req.query.requesterId as string) || (req.body.requesterId as string) || '').toLowerCase();

  const idx = activeStatusesStore.findIndex(s => s.id === statusId);
  if (idx === -1) {
    return res.status(404).json({ error: 'Status not found' });
  }

  const status = activeStatusesStore[idx];
  if (status.userId.toLowerCase() !== requesterId) {
    return res.status(403).json({ error: 'Unauthorized: You can only delete your own status' });
  }

  // Soft-delete or archive
  status.deletedAt = Date.now();
  status.isArchived = true;

  res.json({ success: true, message: 'Status deleted successfully' });
});

// 6.9 Status Privacy Settings
app.get('/api/status/privacy', (req: Request, res: Response) => {
  const userId = ((req.query.userId as string) || 'surya').toLowerCase();
  res.json(userPrivacySettings[userId] || { mode: 'contacts', excludedContacts: [], includedContacts: [] });
});

app.put('/api/status/privacy', (req: Request, res: Response) => {
  const { userId, mode, excludedContacts, includedContacts } = req.body;
  const uid = (userId || 'surya').toLowerCase();
  userPrivacySettings[uid] = {
    mode: mode || 'contacts',
    excludedContacts: excludedContacts || [],
    includedContacts: includedContacts || []
  };
  res.json({ success: true, settings: userPrivacySettings[uid] });
});

// 6.10 24-Hour Expiration Background Cleanup
app.post('/api/status/cleanup', (req: Request, res: Response) => {
  const now = Date.now();
  let cleanedCount = 0;
  activeStatusesStore.forEach(s => {
    if (s.expiresAt <= now && !s.isArchived) {
      s.isArchived = true;
      cleanedCount++;
    }
  });
  res.json({ success: true, archivedExpiredStatuses: cleanedCount, timestamp: now });
});

app.listen(PORT, () => {
  console.log(`AlgoTutor LMS Production Backend running on port ${PORT}`);
});
