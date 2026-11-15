// =======================================================================
// ENGIHUB EVALUATION & ASSESSMENT TRANSCRIPT STORAGE SERVICE (2026-2027)
// Manages persistent records of student exam results, scorecards & mastery
// =======================================================================

export interface QuestionEvaluationItem {
  id: string;
  question: string;
  options: string[];
  userAnswerIndex: number | undefined;
  correctAnswerIndex: number;
  isCorrect: boolean;
  explanation: string;
}

export interface EvaluationRecord {
  id: string;
  title: string;
  subjectTitle: string;
  subjectId: string;
  mode: 'timed' | 'practice' | 'topic-quiz';
  score: number;
  total: number;
  percentage: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'F';
  passed: boolean;
  durationSeconds: number;
  completedAt: number;
  domain?: string;
  questions: QuestionEvaluationItem[];
}

export interface EvaluationStats {
  totalAssessments: number;
  averageScorePercentage: number;
  totalPassed: number;
  passRatePercentage: number;
  totalQuestionsAnswered: number;
  accuracyRatePercentage: number;
  averageDurationSeconds: number;
  domainProficiency: Array<{
    name: string;
    percentage: number;
    completed: number;
    status: 'Mastered' | 'Proficient' | 'Needs Review';
  }>;
}

const STORAGE_KEY = 'engihub_assessment_history_v2';

export function calculateGrade(percentage: number): 'A+' | 'A' | 'B' | 'C' | 'F' {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 50) return 'C';
  return 'F';
}

// Sample baseline diagnostic evaluations
const INITIAL_BENCHMARK_EVALUATIONS: EvaluationRecord[] = [
  {
    id: 'eval-gate-cs-01',
    title: 'GATE Computer Science & IT Full Mock Exam #1',
    subjectTitle: 'Computer Science & Engineering',
    subjectId: 'gate-cs',
    mode: 'timed',
    score: 23,
    total: 25,
    percentage: 92,
    grade: 'A+',
    passed: true,
    durationSeconds: 980,
    completedAt: Date.now() - 86400000 * 2, // 2 days ago
    domain: 'Computer Science',
    questions: [
      {
        id: 'q-dsa-1',
        question: 'What is the worst-case time complexity of searching for an element in an AVL tree with n nodes?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        userAnswerIndex: 1,
        correctAnswerIndex: 1,
        isCorrect: true,
        explanation: 'AVL trees are strictly height-balanced binary search trees. Height is strictly bounded by 1.44 log2(n), giving O(log n) worst-case search.'
      },
      {
        id: 'q-net-1',
        question: 'During a TCP three-way handshake, what flags are set in the second packet transmitted from server to client?',
        options: ['SYN', 'ACK', 'SYN + ACK', 'FIN + ACK'],
        userAnswerIndex: 2,
        correctAnswerIndex: 2,
        isCorrect: true,
        explanation: 'The server responds with SYN + ACK, simultaneously acknowledging client ISN and synchronizing its own.'
      },
      {
        id: 'q-os-1',
        question: 'Which of the following is NOT one of the four Coffman conditions necessary for a deadlock to occur?',
        options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption of Resources', 'Circular Wait'],
        userAnswerIndex: 2,
        correctAnswerIndex: 2,
        isCorrect: true,
        explanation: 'The condition is No Preemption. Preemption breaks deadlock.'
      },
      {
        id: 'q-dbms-1',
        question: 'Why are B+ Trees predominantly preferred over Binary Search Trees or AVL Trees for relational database indexes on disk storage?',
        options: [
          'B+ Trees have a high branching factor (fan-out), minimizing the number of disk I/O operations to traverse the tree',
          'B+ Trees require zero RAM',
          'B+ Trees only store integers',
          'B+ Trees eliminate the need for SQL queries'
        ],
        userAnswerIndex: 0,
        correctAnswerIndex: 0,
        isCorrect: true,
        explanation: 'A B+ tree node matches the disk page size with fan-out of hundreds, minimizing disk I/O.'
      },
      {
        id: 'q-net-2',
        question: 'What is the usable number of IPv4 host addresses in a subnet with a /27 CIDR mask?',
        options: ['32', '30', '62', '14'],
        userAnswerIndex: 0,
        correctAnswerIndex: 1,
        isCorrect: false,
        explanation: 'A /27 has 5 host bits: 2^5 = 32. Minus network and broadcast addresses leaves 30 usable host addresses.'
      }
    ]
  },
  {
    id: 'eval-os-unit3',
    title: 'Operating Systems: Virtual Memory & Concurrency Module Test',
    subjectTitle: 'Operating Systems',
    subjectId: 'operating_systems',
    mode: 'timed',
    score: 14,
    total: 15,
    percentage: 93,
    grade: 'A+',
    passed: true,
    durationSeconds: 610,
    completedAt: Date.now() - 86400000, // yesterday
    domain: 'Operating Systems',
    questions: [
      {
        id: 'q-os-sched',
        question: 'Which CPU scheduling algorithm is non-preemptive and provably achieves the minimum average waiting time for a given set of stationary processes?',
        options: ['First-Come, First-Served (FCFS)', 'Shortest Job First (SJF)', 'Round Robin (RR)', 'Multilevel Feedback Queue'],
        userAnswerIndex: 1,
        correctAnswerIndex: 1,
        isCorrect: true,
        explanation: 'SJF schedules the shortest job first, minimizing the cumulative sum of waiting times.'
      },
      {
        id: 'q-os-belady',
        question: 'What is the phenomenon where increasing the number of allocated page frames results in an increased number of page faults under FIFO page replacement?',
        options: ['Thrashing', "Belady's Anomaly", 'Cache Invalidation', 'Convoy Effect'],
        userAnswerIndex: 1,
        correctAnswerIndex: 1,
        isCorrect: true,
        explanation: "Belady's Anomaly occurs with FIFO page replacement when adding physical memory causes more page faults."
      },
      {
        id: 'q-os-cow',
        question: 'How does Copy-on-Write (COW) improve process creation performance during fork()?',
        options: [
          'It skips allocating physical memory pages until either the parent or child attempts to modify the page',
          'It writes data directly to optical disks',
          'It prevents processes from writing to any files',
          'It executes child processes in kernel mode'
        ],
        userAnswerIndex: 0,
        correctAnswerIndex: 0,
        isCorrect: true,
        explanation: 'COW shares read-only pages and only allocates a physical copy when a write occurs.'
      }
    ]
  },
  {
    id: 'eval-dsa-rapid',
    title: 'Data Structures & Algorithms Rapid Practice Quiz',
    subjectTitle: 'Data Structures & Algorithms',
    subjectId: 'data_structures_algorithms',
    mode: 'practice',
    score: 10,
    total: 10,
    percentage: 100,
    grade: 'A+',
    passed: true,
    durationSeconds: 380,
    completedAt: Date.now() - 3600000 * 6, // 6 hours ago
    domain: 'Data Structures',
    questions: [
      {
        id: 'q-dsa-dijkstra',
        question: "Which data structure is optimal for implementing Dijkstra's single-source shortest path algorithm on a graph with V vertices and E edges?",
        options: ['Unsorted Array: O(V^2)', 'Min-Heap / Fibonacci Heap: O(E + V log V)', 'Queue (FIFO): O(V * E)', 'Stack (LIFO): O(V + E)'],
        userAnswerIndex: 1,
        correctAnswerIndex: 1,
        isCorrect: true,
        explanation: 'A Min-Heap allows extract-min in O(log V) and decrease-key in O(1) amortized, yielding O(E + V log V).'
      },
      {
        id: 'q-dsa-heap',
        question: "What is the time complexity of building a Binary Heap containing n elements from an arbitrary unsorted array using Floyd's bottom-up heapify?",
        options: ['O(n log n)', 'O(n)', 'O(n^2)', 'O(log n)'],
        userAnswerIndex: 1,
        correctAnswerIndex: 1,
        isCorrect: true,
        explanation: "Floyd's bottom-up heapify runs in strictly linear O(n) time."
      }
    ]
  }
];

export function getEvaluationHistory(): EvaluationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BENCHMARK_EVALUATIONS));
      return INITIAL_BENCHMARK_EVALUATIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_BENCHMARK_EVALUATIONS;
  } catch (err) {
    console.warn('Error reading evaluation history:', err);
    return INITIAL_BENCHMARK_EVALUATIONS;
  }
}

export function saveEvaluationRecord(record: EvaluationRecord): EvaluationRecord[] {
  try {
    const current = getEvaluationHistory();
    // Prepend newest attempt
    const updated = [record, ...current.filter((item) => item.id !== record.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving evaluation record:', err);
    return getEvaluationHistory();
  }
}

export function clearEvaluationHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Error clearing evaluation history:', err);
  }
}

export function getEvaluationStats(): EvaluationStats {
  const history = getEvaluationHistory();

  if (history.length === 0) {
    return {
      totalAssessments: 0,
      averageScorePercentage: 0,
      totalPassed: 0,
      passRatePercentage: 0,
      totalQuestionsAnswered: 0,
      accuracyRatePercentage: 0,
      averageDurationSeconds: 0,
      domainProficiency: []
    };
  }

  let totalScoreSum = 0;
  let totalTotalSum = 0;
  let passedCount = 0;
  let durationSum = 0;
  const domainMap: Record<string, { correct: number; total: number; count: number }> = {};

  history.forEach((record) => {
    totalScoreSum += record.score;
    totalTotalSum += record.total;
    if (record.passed) passedCount += 1;
    durationSum += record.durationSeconds;

    const domain = record.domain || record.subjectTitle || 'General Engineering';
    if (!domainMap[domain]) {
      domainMap[domain] = { correct: 0, total: 0, count: 0 };
    }
    domainMap[domain].correct += record.score;
    domainMap[domain].total += record.total;
    domainMap[domain].count += 1;
  });

  const avgPct = Math.round((totalScoreSum / Math.max(1, totalTotalSum)) * 100);
  const passRate = Math.round((passedCount / history.length) * 100);
  const avgDuration = Math.round(durationSum / history.length);

  // Pre-seed core curriculum domains if not enough tests taken yet
  const defaultDomains = [
    { name: 'Computer Networks', basePct: 88, completed: 3 },
    { name: 'Operating Systems', basePct: 93, completed: 2 },
    { name: 'Data Structures & Algorithms', basePct: 96, completed: 4 },
    { name: 'Artificial Intelligence & ML', basePct: 90, completed: 2 },
    { name: 'Database Management Systems', basePct: 85, completed: 2 },
    { name: 'Cyber Security & Cryptography', basePct: 87, completed: 1 }
  ];

  const domainProficiency = defaultDomains.map((d) => {
    const existing = domainMap[d.name];
    const pct = existing ? Math.round((existing.correct / Math.max(1, existing.total)) * 100) : d.basePct;
    const completed = existing ? existing.count : d.completed;
    const status: 'Mastered' | 'Proficient' | 'Needs Review' = pct >= 90 ? 'Mastered' : pct >= 75 ? 'Proficient' : 'Needs Review';
    return {
      name: d.name,
      percentage: pct,
      completed,
      status
    };
  });

  return {
    totalAssessments: history.length,
    averageScorePercentage: avgPct,
    totalPassed: passedCount,
    passRatePercentage: passRate,
    totalQuestionsAnswered: totalTotalSum,
    accuracyRatePercentage: avgPct,
    averageDurationSeconds: avgDuration,
    domainProficiency
  };
}
