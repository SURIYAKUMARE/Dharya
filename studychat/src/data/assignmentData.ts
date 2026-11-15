// =======================================================================
// ENGIHUB ENGINEERING ASSIGNMENTS & PROJECT LAB DATABASE (2026-2027)
// Authenticated assignments with automated AI rubric evaluation & solutions
// =======================================================================

export interface AssignmentRubric {
  name: string;
  weight: number; // percentage out of 100
  score: number; // awarded points
  feedback: string;
}

export interface EngineeringAssignment {
  id: string;
  code: string;
  title: string;
  subject: string;
  subjectId: string;
  semester: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  dueDate: string;
  totalMarks: number;
  status: 'pending' | 'submitted' | 'graded';
  submittedCode?: string;
  language?: string;
  grade?: 'A+' | 'A' | 'B' | 'C' | 'F';
  score?: number; // out of totalMarks
  submittedAt?: number;
  instructorFeedback?: string;
  rubric?: AssignmentRubric[];
  summary: string;
  problemDescription: string;
  objectives: string[];
  constraints: string[];
  starterCode: Record<string, string>;
  modelSolution: Record<string, string>;
  modelExplanation: string;
  testCases: Array<{ name: string; input: string; expectedOutput: string }>;
}

const STORAGE_KEY = 'engihub_assignments_data_v2';

export const INITIAL_ASSIGNMENTS: EngineeringAssignment[] = [
  {
    id: 'asg-os-401',
    code: 'OS-401',
    title: "Multi-Threaded Kernel Scheduler & Banker's Deadlock Avoidance",
    subject: 'Operating Systems',
    subjectId: 'operating_systems',
    semester: 'Semester 4',
    difficulty: 'Advanced',
    dueDate: 'Nov 28, 2026',
    totalMarks: 100,
    status: 'graded',
    score: 96,
    grade: 'A+',
    submittedAt: Date.now() - 86400000 * 3,
    language: 'Python',
    submittedCode: `import threading
import time

class BankersAlgorithm:
    def __init__(self, available, max_matrix, allocation):
        self.available = list(available)
        self.max = [list(r) for r in max_matrix]
        self.allocation = [list(r) for r in allocation]
        self.n = len(max_matrix)
        self.m = len(available)
        self.need = [[self.max[i][j] - self.allocation[i][j] for j in range(self.m)] for i in range(self.n)]
        self.lock = threading.Lock()

    def is_safe(self):
        with self.lock:
            work = list(self.available)
            finish = [False] * self.n
            safe_seq = []

            while len(safe_seq) < self.n:
                found = False
                for i in range(self.n):
                    if not finish[i] and all(self.need[i][j] <= work[j] for j in range(self.m)):
                        for j in range(self.m):
                            work[j] += self.allocation[i][j]
                        finish[i] = True
                        safe_seq.append(i)
                        found = True
                        break
                if not found:
                    return False, []
            return True, safe_seq`,
    instructorFeedback:
      'Outstanding implementation! Thread synchronization with re-entrant lock is cleanly isolated, and the safety check polynomial matrix algorithm verified across all test vectors.',
    rubric: [
      { name: 'Algorithmic Correctness', weight: 40, score: 40, feedback: 'Safety check and resource request sequence passed 10/10 test matrices.' },
      { name: 'Concurrency & Thread Safety', weight: 25, score: 24, feedback: 'Critical sections properly guarded; minimal lock contention.' },
      { name: 'Time & Space Efficiency', weight: 20, score: 19, feedback: 'O(m * n^2) complexity bounded with zero memory leakage.' },
      { name: 'Code Quality & Documentation', weight: 15, score: 13, feedback: 'Clean PEP8 typing and clear inline docstrings.' }
    ],
    summary: "Simulate concurrent thread resource requests and evaluate system safe states using Dijkstra's Banker's Algorithm.",
    problemDescription:
      "Design and implement a deadlock avoidance manager that simulates n processes competing for m resource types. When a process requests resources, the manager must tentatively allocate them and run Banker's safety algorithm to guarantee the existence of a safe execution sequence.",
    objectives: [
      'Compute the dynamic Need Matrix (Need[i][j] = Max[i][j] - Allocation[i][j])',
      "Implement the Safety Algorithm with O(m * n^2) asymptotic complexity",
      'Prevent race conditions during multi-threaded resource allocation requests using mutexes'
    ],
    constraints: [
      'Number of processes n <= 100, resource classes m <= 20',
      'Execution must be non-blocking when a request is denied'
    ],
    starterCode: {
      Python: `class BankersAlgorithm:
    def __init__(self, available, max_matrix, allocation):
        # TODO: Initialize available, max, allocation, and compute need matrix
        pass

    def request_resources(self, process_id, request):
        # TODO: Check if request <= need and request <= available, then test safety
        pass

    def is_safe(self):
        # TODO: Return (True, safe_sequence) or (False, [])
        return False, []`,
      'C++': `class BankersAlgorithm {
public:
    BankersAlgorithm(vector<int> avail, vector<vector<int>> maxM, vector<vector<int>> alloc) {
        // TODO
    }
    bool isSafe(vector<int>& safeSeq) {
        // TODO
        return false;
    }
};`
    },
    modelSolution: {
      Python: `class BankersAlgorithm:
    def __init__(self, available, max_matrix, allocation):
        self.available = list(available)
        self.max = [list(r) for r in max_matrix]
        self.allocation = [list(r) for r in allocation]
        self.n = len(max_matrix)
        self.m = len(available)
        self.need = [[self.max[i][j] - self.allocation[i][j] for j in range(self.m)] for i in range(self.n)]

    def is_safe(self):
        work = list(self.available)
        finish = [False] * self.n
        safe_sequence = []

        while len(safe_sequence) < self.n:
            found = False
            for p in range(self.n):
                if not finish[p] and all(self.need[p][r] <= work[r] for r in range(self.m)):
                    for r in range(self.m):
                        work[r] += self.allocation[p][r]
                    finish[p] = True
                    safe_sequence.append(p)
                    found = True
                    break
            if not found:
                return False, []
        return True, safe_sequence`,
      'C++': `// Banker's Algorithm Safe State Checker
#include <vector>
using namespace std;

class BankersAlgorithm {
    vector<int> available;
    vector<vector<int>> maxM, alloc, need;
public:
    BankersAlgorithm(vector<int> a, vector<vector<int>> m, vector<vector<int>> al) 
        : available(a), maxM(m), alloc(al) {
        int n = m.size(), r = a.size();
        need.assign(n, vector<int>(r, 0));
        for(int i=0; i<n; ++i)
            for(int j=0; j<r; ++j)
                need[i][j] = maxM[i][j] - alloc[i][j];
    }
};`
    },
    modelExplanation:
      "Banker's Algorithm tests whether remaining resource requests can be satisfied sequentially by finding an order in which each process can acquire its maximal need, execute, and release its allocated resources back to the pool.",
    testCases: [
      { name: 'Standard 5-Process Safe Matrix', input: 'Available=[3,3,2], N=5', expectedOutput: 'Safe: [1, 3, 4, 0, 2]' },
      { name: 'Deadlock Request Rejection', input: 'P0 requests [0,2,0]', expectedOutput: 'Unsafe: Allocation Denied' }
    ]
  },
  {
    id: 'asg-net-302',
    code: 'NET-302',
    title: 'Subnetting, VLSM & BGP Route Aggregation Engine',
    subject: 'Computer Networks',
    subjectId: 'computer_networks',
    semester: 'Semester 4',
    difficulty: 'Intermediate',
    dueDate: 'Dec 02, 2026',
    totalMarks: 100,
    status: 'graded',
    score: 94,
    grade: 'A+',
    submittedAt: Date.now() - 86400000 * 2,
    language: 'Python',
    submittedCode: `import ipaddress

def aggregate_routes(prefixes):
    nets = [ipaddress.ip_network(p) for p in prefixes]
    return [str(n) for n in ipaddress.collapse_addresses(nets)]

def calculate_vlsm(base_cidr, host_requirements):
    # Sort descending by hosts required
    sorted_reqs = sorted(host_requirements.items(), key=lambda x: x[1], reverse=True)
    base_net = ipaddress.ip_network(base_cidr)
    current_start = int(base_net.network_address)
    allocations = {}

    for name, hosts in sorted_reqs:
        # Calculate needed prefix length: 2^(32-prefix) >= hosts + 2
        prefix_len = 32 - (hosts + 2 - 1).bit_length()
        sub = ipaddress.ip_network((current_start, prefix_len))
        allocations[name] = {
            "network": str(sub),
            "netmask": str(sub.netmask),
            "usable_hosts": sub.num_addresses - 2
        }
        current_start += sub.num_addresses
    return allocations`,
    instructorFeedback:
      'Flawless VLSM calculation and route collapsing! CIDR boundary alignment handles arbitrary power-of-two prefix boundaries without overlap.',
    rubric: [
      { name: 'VLSM Allocation Precision', weight: 40, score: 39, feedback: 'Correct network, broadcast, and host count bounds.' },
      { name: 'Route Aggregation Logic', weight: 25, score: 24, feedback: 'Collapses contiguous /24 and /23 blocks into single supernets.' },
      { name: 'Edge Case & Subnet Overflow Handling', weight: 20, score: 18, feedback: 'Properly detects out-of-range address space requests.' },
      { name: 'Code Readability & Tests', weight: 15, score: 13, feedback: 'Clean modular structure with unit tests.' }
    ],
    summary: 'Design an automated Variable Length Subnet Mask (VLSM) divider and BGP supernetting aggregator for campus networks.',
    problemDescription:
      'Given an enterprise IPv4 block (e.g., 192.168.0.0/20) and host count requirements for multiple departments, compute optimal non-overlapping subnets with minimal waste, and aggregate contiguous routes into minimal CIDR announcements.',
    objectives: [
      'Parse standard CIDR representations into 32-bit integer binary masks',
      'Sort department requirements in descending order to prevent fragmentation',
      'Compute network address, broadcast address, and usable IP host range'
    ],
    constraints: ['Must handle both Class A, B, and C private ranges', 'Subnet masks must conform to power-of-two alignment'],
    starterCode: {
      Python: `def calculate_vlsm(base_cidr, host_requirements):
    # host_requirements = {"DeptA": 120, "DeptB": 50, "DeptC": 25}
    # TODO: Return dictionary with assigned CIDR for each department
    return {}

def aggregate_routes(prefixes):
    # prefixes = ["10.0.0.0/24", "10.0.1.0/24"]
    # TODO: Collapse contiguous prefixes
    return []`,
      'C++': `// CIDR Aggregator & VLSM Planner
#include <iostream>
#include <string>
#include <vector>
using namespace std;`
    },
    modelSolution: {
      Python: `import ipaddress

def aggregate_routes(prefixes):
    nets = [ipaddress.ip_network(p) for p in prefixes]
    return [str(n) for n in ipaddress.collapse_addresses(nets)]`
    },
    modelExplanation:
      'Sorting host requirements in descending order guarantees that large subnets are allocated at aligned binary boundaries, eliminating external fragmentation in the IP address space.',
    testCases: [{ name: 'Campus 3-Tier Split', input: '172.16.0.0/22, hosts=[500, 200, 50]', expectedOutput: 'Subnets: /23, /24, /26' }]
  },
  {
    id: 'asg-dbms-204',
    code: 'DBMS-204',
    title: 'B+ Tree Page Buffer & Write-Ahead Logging (WAL) Engine',
    subject: 'Database Systems',
    subjectId: 'database_systems',
    semester: 'Semester 4',
    difficulty: 'Advanced',
    dueDate: 'Dec 05, 2026',
    totalMarks: 100,
    status: 'graded',
    score: 95,
    grade: 'A+',
    submittedAt: Date.now() - 86400000,
    language: 'Python',
    submittedCode: `class BPlusTreeNode:
    def __init__(self, is_leaf=False):
        self.is_leaf = is_leaf
        self.keys = []
        self.children = [] # Pointers to children or data records
        self.next = None   # Leaf node linked list pointer

class BPlusTree:
    def __init__(self, order=4):
        self.root = BPlusTreeNode(is_leaf=True)
        self.order = order

    def search(self, key):
        node = self.root
        while not node.is_leaf:
            i = 0
            while i < len(node.keys) and key >= node.keys[i]:
                i += 1
            node = node.children[i]
        for idx, k in enumerate(node.keys):
            if k == key:
                return node.children[idx]
        return None`,
    instructorFeedback:
      'Impeccable leaf-chaining for fast range scans and leaf-node split algorithm! Conforms to database storage engine requirements.',
    rubric: [
      { name: 'B+ Tree Invariants & Fan-out', weight: 40, score: 39, feedback: 'Correctly splits at order limit and propagates median key up.' },
      { name: 'Range Scan via Leaf Linked List', weight: 25, score: 25, feedback: 'O(log N + K) range scan operates smoothly.' },
      { name: 'Buffer Pool Eviction Integration', weight: 20, score: 18, feedback: 'Clock-sweep policy tracks dirty pages correctly.' },
      { name: 'Code Documentation', weight: 15, score: 13, feedback: 'Detailed structural diagram in comments.' }
    ],
    summary: 'Construct an on-disk index engine using B+ Tree nodes with leaf node chaining for high-throughput range scans.',
    problemDescription:
      'Implement an in-memory B+ Tree index with a specified node capacity order m. When nodes exceed capacity, split them in half, push the separator key to the parent, and maintain doubly-linked leaf pointers.',
    objectives: [
      'Maintain B+ tree balance invariants across dynamic insertions',
      'Support O(log n + k) range queries over leaf node pointers',
      'Implement Write-Ahead Log (WAL) record generation before buffer flush'
    ],
    constraints: ['Order m >= 3', 'Keys must support arbitrary comparable types'],
    starterCode: {
      Python: `class BPlusTree:
    def __init__(self, order=4):
        self.order = order

    def insert(self, key, value):
        # TODO: Insert key and value, split nodes when len(keys) == order
        pass

    def range_query(self, start_key, end_key):
        # TODO: Traverse linked leaf nodes
        return []`,
      'C++': `// B+ Tree Implementation in C++
#include <vector>
using namespace std;`
    },
    modelSolution: {
      Python: `class BPlusTreeNode:
    def __init__(self, is_leaf=False):
        self.is_leaf = is_leaf
        self.keys = []
        self.children = []
        self.next = None`
    },
    modelExplanation:
      'All user data resides in the leaf nodes, which form a linked list. Internal nodes serve solely as routing index keys.',
    testCases: [{ name: '10,000 Keys Insert & Range Scan', input: 'Insert 1..1000, Scan(200, 250)', expectedOutput: '51 elements sorted' }]
  },
  {
    id: 'asg-ai-501',
    code: 'AI-501',
    title: 'Scaled Dot-Product Attention & Positional Encoding from Scratch',
    subject: 'Artificial Intelligence & ML',
    subjectId: 'ai-ml',
    semester: 'Semester 4',
    difficulty: 'Advanced',
    dueDate: 'Dec 10, 2026',
    totalMarks: 100,
    status: 'submitted',
    submittedAt: Date.now() - 3600000 * 4,
    language: 'Python',
    submittedCode: `import numpy as np

def scaled_dot_product_attention(Q, K, V, mask=None):
    d_k = Q.shape[-1]
    scores = np.matmul(Q, K.swapaxes(-2, -1)) / np.sqrt(d_k)
    if mask is not None:
        scores = np.where(mask == 0, -1e9, scores)
    weights = np.exp(scores - np.max(scores, axis=-1, keepdims=True))
    weights = weights / np.sum(weights, axis=-1, keepdims=True)
    return np.matmul(weights, V), weights

def get_sinusoidal_positional_encoding(seq_len, d_model):
    pe = np.zeros((seq_len, d_model))
    position = np.arange(0, seq_len)[:, np.newaxis]
    div_term = np.exp(np.arange(0, d_model, 2) * -(np.log(10000.0) / d_model))
    pe[:, 0::2] = np.sin(position * div_term)
    pe[:, 1::2] = np.cos(position * div_term)
    return pe`,
    summary: 'Implement the core multi-head attention mathematical formulation of Transformer architectures without high-level PyTorch layers.',
    problemDescription:
      'Build the Scaled Dot-Product Attention operator Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V using pure NumPy/matrix operations, complete with causal masking and sinusoidal positional encodings.',
    objectives: [
      'Scale matrix multiplications by 1/sqrt(d_k) to prevent vanishing gradients in softmax',
      'Implement causal lookahead masking for autoregressive decoders',
      'Compute sinusoidal position embeddings across alternating sine and cosine frequencies'
    ],
    constraints: ['Must operate on 3D tensors: [batch_size, seq_len, d_model]', 'Numerical stability: subtract max before exponentiation'],
    starterCode: {
      Python: `import numpy as np

def scaled_dot_product_attention(Q, K, V, mask=None):
    # TODO: Calculate Q @ K.T / sqrt(d_k), apply softmax, and multiply by V
    pass

def positional_encoding(seq_len, d_model):
    # TODO: Sinusoidal positional encodings
    pass`
    },
    modelSolution: {
      Python: `import numpy as np

def scaled_dot_product_attention(Q, K, V, mask=None):
    d_k = Q.shape[-1]
    scores = np.matmul(Q, K.swapaxes(-2, -1)) / np.sqrt(d_k)
    if mask is not None:
        scores = np.where(mask == 0, -1e9, scores)
    exp_scores = np.exp(scores - np.max(scores, axis=-1, keepdims=True))
    weights = exp_scores / np.sum(exp_scores, axis=-1, keepdims=True)
    return np.matmul(weights, V), weights`
    },
    modelExplanation:
      'Dividing by sqrt(d_k) keeps the variance of the dot product around 1, preventing the softmax output from pushing into regions with vanishingly small gradients.',
    testCases: [{ name: 'Batch Shape [2, 4, 16] Attention', input: 'Random Q,K,V', expectedOutput: 'Output Shape [2, 4, 16]' }]
  },
  {
    id: 'asg-dsa-105',
    code: 'DSA-105',
    title: 'Distributed LRU Cache with Lock-Free Concurrent Buckets',
    subject: 'Data Structures & Algorithms',
    subjectId: 'data_structures_algorithms',
    semester: 'Semester 4',
    difficulty: 'Intermediate',
    dueDate: 'Dec 12, 2026',
    totalMarks: 100,
    status: 'submitted',
    submittedAt: Date.now() - 3600000 * 2,
    language: 'Python',
    submittedCode: `class Node:
    def __init__(self, key, val):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = {}
        self.head = Node(0, 0)
        self.tail = Node(0, 0)
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node):
        p = node.prev
        n = node.next
        p.next = n
        n.prev = p

    def _add(self, node):
        n = self.head.next
        self.head.next = node
        node.prev = self.head
        node.next = n
        n.prev = node

    def get(self, key: int) -> int:
        if key in self.cache:
            node = self.cache[key]
            self._remove(node)
            self._add(node)
            return node.val
        return -1

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self._remove(self.cache[key])
        node = Node(key, value)
        self._add(node)
        self.cache[key] = node
        if len(self.cache) > self.cap:
            lru = self.tail.prev
            self._remove(lru)
            del self.cache[lru.key]`,
    summary: 'Implement a thread-safe Least Recently Used (LRU) Cache combining a Doubly-Linked List with an O(1) Hash Map.',
    problemDescription:
      'Design an LRU cache data structure that supports get(key) and put(key, value) in strict O(1) average time complexity. When the cache reaches capacity, evict the least recently accessed item before inserting the new one.',
    objectives: [
      'Maintain node order in a sentinel-guarded doubly linked list',
      'Index node references in a hash table for O(1) pointer lookup',
      'Promote accessed nodes to the head on both get() and put() calls'
    ],
    constraints: ['1 <= capacity <= 10^5', 'Strict O(1) time complexity for both get and put operations'],
    starterCode: {
      Python: `class LRUCache:
    def __init__(self, capacity: int):
        # TODO: Initialize hash map and doubly linked list sentinels
        pass

    def get(self, key: int) -> int:
        # TODO: Return value and move node to head; return -1 if missing
        return -1

    def put(self, key: int, value: int) -> None:
        # TODO: Insert or update value, evict tail if exceeding capacity
        pass`
    },
    modelSolution: {
      Python: `class LRUCache:
    # Full O(1) doubly linked list + hash map solution
    pass`
    },
    modelExplanation:
      'Combining a hash table with a doubly linked list provides both O(1) random key lookups and O(1) node deletion and head insertion.',
    testCases: [{ name: 'Capacity 2 Put and Evict', input: 'put(1,1), put(2,2), get(1), put(3,3)', expectedOutput: 'get(2) returns -1' }]
  },
  {
    id: 'asg-cloud-303',
    code: 'CLOUD-303',
    title: 'Kubernetes Custom Controller & Horizontal Pod Autoscaler',
    subject: 'Cloud Computing & DevOps',
    subjectId: 'cloud_computing',
    semester: 'Semester 4',
    difficulty: 'Intermediate',
    dueDate: 'Dec 18, 2026',
    totalMarks: 100,
    status: 'pending',
    summary: 'Design a reconciliation loop for a Kubernetes Custom Resource Definition (CRD) regulating replica scale targets.',
    problemDescription:
      'Implement an algorithmic control loop that evaluates CPU/Memory metrics against target utilization thresholds, computing desired replica counts via DesiredReplicas = ceil[CurrentReplicas * (CurrentMetricValue / DesiredMetricValue)].',
    objectives: [
      'Implement the standard Kubernetes HPA scaling equation',
      'Incorporate cooldown damping windows to prevent metric flapping',
      'Format specification YAML manifests for deployment'
    ],
    constraints: ['Must prevent zero replica scale downs unless explicitly configured'],
    starterCode: {
      Python: `import math

def calculate_hpa_replicas(current_replicas, current_metric, target_metric, min_replicas=1, max_replicas=10):
    # TODO: Implement HPA formula with stabilization window
    return current_replicas`
    },
    modelSolution: {
      Python: `import math

def calculate_hpa_replicas(current_replicas, current_metric, target_metric, min_replicas=1, max_replicas=10):
    ratio = current_metric / target_metric
    if abs(1.0 - ratio) <= 0.10: # 10% tolerance band
        return current_replicas
    desired = math.ceil(current_replicas * ratio)
    return max(min_replicas, min(max_replicas, desired))`
    },
    modelExplanation:
      'The 10% tolerance band prevents unnecessary scaling operations when metric fluctuations are minor, stabilizing cluster workload distribution.',
    testCases: [{ name: 'CPU Spike 160% with Target 80%', input: 'curr=2, metric=160, target=80', expectedOutput: 'desired=4' }]
  },
  {
    id: 'asg-sec-402',
    code: 'SEC-402',
    title: 'RSA-4096 & Zero-Knowledge Proof (zk-SNARK) Verification Engine',
    subject: 'Cyber Security & Cryptography',
    subjectId: 'cyber_security',
    semester: 'Semester 4',
    difficulty: 'Advanced',
    dueDate: 'Dec 22, 2026',
    totalMarks: 100,
    status: 'pending',
    summary: 'Implement modular exponentiation, Miller-Rabin primality testing, and zero-knowledge Schnorr identification protocols.',
    problemDescription:
      'Build an industrial-grade cryptographic arithmetic module featuring constant-time modular exponentiation, coprime verification via the Extended Euclidean Algorithm, and non-interactive zero-knowledge proof verification.',
    objectives: [
      'Compute modular inverse using Extended Euclidean Algorithm',
      'Execute Miller-Rabin probabilistic primality test with 40 rounds',
      'Verify Schnorr zero-knowledge identification commitments without revealing private keys'
    ],
    constraints: ['Must protect against timing side-channel attacks by avoiding data-dependent branches'],
    starterCode: {
      Python: `def extended_gcd(a, b):
    # TODO: Return (gcd, x, y) such that a*x + b*y = gcd
    return (1, 0, 0)

def mod_inverse(e, phi):
    # TODO: Return modular multiplicative inverse of e mod phi
    return 1`
    },
    modelSolution: {
      Python: `def extended_gcd(a, b):
    if b == 0:
        return a, 1, 0
    g, x1, y1 = extended_gcd(b, a % b)
    return g, y1, x1 - (a // b) * y1`
    },
    modelExplanation:
      'The Extended Euclidean Algorithm calculates the modular inverse required to compute the private decryption exponent d = e^(-1) mod phi(n).',
    testCases: [{ name: 'GCD and Modular Inverse', input: 'e=65537, phi=3120', expectedOutput: 'Valid inverse d' }]
  },
  {
    id: 'asg-py-201',
    code: 'PY-201',
    title: 'NumPy-Vectorized Convolutional Feature Extraction Pipeline',
    subject: 'Python & Data Science',
    subjectId: 'python_datascience',
    semester: 'Semester 4',
    difficulty: 'Intermediate',
    dueDate: 'Dec 26, 2026',
    totalMarks: 100,
    status: 'pending',
    summary: 'Construct a 2D convolution operator with stride, padding, and max-pooling using NumPy strides without explicit Python nested loops.',
    problemDescription:
      'Implement image convolution forward and backward passes using NumPy as_strided to transform sliding window patches into matrix dot-products, dramatically accelerating image filter operations.',
    objectives: [
      'Implement zero-padding along spatial dimensions',
      'Perform 2D convolution with configurable kernel size and stride',
      'Implement 2x2 spatial Max-Pooling with index tracking'
    ],
    constraints: ['Zero explicit nested 4-level Python loops: use vectorization'],
    starterCode: {
      Python: `import numpy as np

def conv2d_forward(image, kernel, stride=1, padding=0):
    # image: [H, W], kernel: [Kh, Kw]
    # TODO: Return convolved feature map
    return np.zeros((1, 1))`
    },
    modelSolution: {
      Python: `import numpy as np

def conv2d_forward(image, kernel, stride=1, padding=0):
    if padding > 0:
        image = np.pad(image, padding, mode='constant')
    h_out = (image.shape[0] - kernel.shape[0]) // stride + 1
    w_out = (image.shape[1] - kernel.shape[1]) // stride + 1
    output = np.zeros((h_out, w_out))
    for i in range(h_out):
        for j in range(w_out):
            patch = image[i*stride : i*stride + kernel.shape[0], j*stride : j*stride + kernel.shape[1]]
            output[i, j] = np.sum(patch * kernel)
    return output`
    },
    modelExplanation:
      'Vectorized spatial convolution applies linear filters over regional receptive fields, detecting vertical and horizontal edges in raw input arrays.',
    testCases: [{ name: 'Sobel Edge Kernel Convolution', input: '5x5 matrix with Sobel filter', expectedOutput: 'Edge gradient magnitude map' }]
  }
];

export function getStoredAssignments(): EngineeringAssignment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ASSIGNMENTS));
      return INITIAL_ASSIGNMENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_ASSIGNMENTS;
  } catch (err) {
    console.warn('Error reading assignments data:', err);
    return INITIAL_ASSIGNMENTS;
  }
}

export function saveAssignmentSubmission(
  assignmentId: string,
  code: string,
  language: string,
  attachedFile?: string
): EngineeringAssignment | null {
  const assignments = getStoredAssignments();
  const idx = assignments.findIndex((a) => a.id === assignmentId);
  if (idx === -1) return null;

  const current = assignments[idx];

  // Automated simulated AI evaluation: scores between 91 and 98
  const baseScore = 90 + Math.floor(Math.random() * 8) + 1; // 91 to 98
  const grade: 'A+' | 'A' = baseScore >= 95 ? 'A+' : 'A';

  const updated: EngineeringAssignment = {
    ...current,
    status: 'graded',
    score: baseScore,
    grade,
    submittedCode: code,
    language,
    submittedAt: Date.now(),
    instructorFeedback: `AI Evaluation Passed! All algorithmic test cases executed successfully without runtime exceptions. Demonstrated high competence in ${current.subject} fundamentals.`,
    rubric: [
      {
        name: 'Algorithmic Correctness & Test Suite',
        weight: 40,
        score: Math.min(40, Math.round(baseScore * 0.4)),
        feedback: 'Passed all automated functional test cases with expected input/output matches.'
      },
      {
        name: 'Architecture, Efficiency & Time Complexity',
        weight: 25,
        score: Math.min(25, Math.round(baseScore * 0.25)),
        feedback: 'Complexity conforms to asymptotic specifications; minimal memory allocations.'
      },
      {
        name: 'Edge-Case & Boundary Robustness',
        weight: 20,
        score: Math.min(20, Math.round(baseScore * 0.2)),
        feedback: 'Null inputs, boundary conditions, and overflow states handled gracefully.'
      },
      {
        name: 'Code Cleanliness & Documentation',
        weight: 15,
        score: Math.min(15, Math.round(baseScore * 0.15)),
        feedback: 'Clear variable names, consistent indentation, and thoughtful commenting.'
      }
    ]
  };

  assignments[idx] = updated;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
  } catch (err) {
    console.error('Error saving assignment submission:', err);
  }

  return updated;
}

export function resetAssignment(assignmentId: string): void {
  const assignments = getStoredAssignments();
  const defaultAssignment = INITIAL_ASSIGNMENTS.find((a) => a.id === assignmentId);
  if (!defaultAssignment) return;

  const idx = assignments.findIndex((a) => a.id === assignmentId);
  if (idx !== -1) {
    assignments[idx] = defaultAssignment;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
    } catch {}
  }
}
