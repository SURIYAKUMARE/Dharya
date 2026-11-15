// =======================================================================
// ENGIHUB ACCREDITED ASSESSMENT QUESTION BANK (2026-2027)
// Comprehensive Engineering Examination Database: 250 Rigorous Questions
// Covering all 10 Engineering Disciplines (25 authentic questions per discipline)
// =======================================================================

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const SUBJECT_QUESTION_BANKS: Record<string, AssessmentQuestion[]> = {
  "data_structures_algorithms": [
      {
          "id": "dsa-q1",
          "question": "What is the worst-case time complexity of searching for an element in an AVL tree with n nodes?",
          "options": [
              "O(1)",
              "O(log n)",
              "O(n)",
              "O(n log n)"
          ],
          "correctIndex": 1,
          "explanation": "AVL trees are strictly height-balanced binary search trees where the height difference between left and right subtrees is at most 1. Hence height h <= 1.44 log2(n), guaranteeing O(log n) worst-case search."
      },
      {
          "id": "dsa-q2",
          "question": "Which data structure is optimal for implementing Dijkstra's single-source shortest path algorithm on a graph with V vertices and E edges?",
          "options": [
              "Unsorted Array: O(V^2)",
              "Min-Heap / Fibonacci Heap: O(E + V log V)",
              "Queue (FIFO): O(V * E)",
              "Stack (LIFO): O(V + E)"
          ],
          "correctIndex": 1,
          "explanation": "A Fibonacci Heap or Binary Min-Heap allows decrease-key operations in amortized O(1) time and extract-min in O(log V) time, yielding optimal O(E + V log V) complexity."
      },
      {
          "id": "dsa-q3",
          "question": "In a Red-Black Tree, what is the maximum possible height of a tree with n nodes?",
          "options": [
              "log2(n + 1)",
              "2 * log2(n + 1)",
              "n / 2",
              "sqrt(n)"
          ],
          "correctIndex": 1,
          "explanation": "By Red-Black Tree invariant 4 and 5 (no two consecutive red nodes, equal black-height on all root-to-leaf paths), the longest path is at most twice the shortest path, bounding height by 2 * log2(n + 1)."
      },
      {
          "id": "dsa-q4",
          "question": "What is the space complexity of Floyd-Warshall all-pairs shortest path algorithm?",
          "options": [
              "O(V)",
              "O(V + E)",
              "O(V^2)",
              "O(V^3)"
          ],
          "correctIndex": 2,
          "explanation": "Floyd-Warshall maintains a 2D distance matrix of size V x V to store shortest distances between every vertex pair, requiring O(V^2) auxiliary space."
      },
      {
          "id": "dsa-q5",
          "question": "Which of the following problems exhibits both Optimal Substructure and Overlapping Subproblems properties?",
          "options": [
              "Binary Search",
              "0/1 Knapsack Problem",
              "Merge Sort",
              "Quick Sort"
          ],
          "correctIndex": 1,
          "explanation": "The 0/1 Knapsack problem exhibits optimal substructure (optimal solution to capacity W uses optimal solutions to subcapacities w < W) and overlapping subproblems (same capacity-item subproblems recomputed multiple times), making it classic Dynamic Programming."
      },
      {
          "id": "dsa-q6",
          "question": "What is the amortized cost of inserting an element into a dynamic array (like std::vector or ArrayList) that doubles its capacity when full?",
          "options": [
              "O(1)",
              "O(log n)",
              "O(n)",
              "O(n^2)"
          ],
          "correctIndex": 0,
          "explanation": "Although doubling capacity requires O(n) reallocation occasionally, across n insertions the total copy work is 1 + 2 + 4 + ... + n = 2n, giving an amortized cost of 2n/n = O(1) per insertion."
      },
      {
          "id": "dsa-q7",
          "question": "Which algorithm finds the Minimum Spanning Tree (MST) of an undirected edge-weighted graph using a Disjoint Set Union (Union-Find) data structure?",
          "options": [
              "Prim's Algorithm",
              "Kruskal's Algorithm",
              "Bellman-Ford Algorithm",
              "Kosaraju's Algorithm"
          ],
          "correctIndex": 1,
          "explanation": "Kruskal's algorithm sorts all edges by weight and greedily adds the smallest edge that does not form a cycle, using Union-Find with path compression in O(E log E) time."
      },
      {
          "id": "dsa-q8",
          "question": "What is the time complexity of building a Binary Heap containing n elements from an arbitrary unsorted array using Floyd's bottom-up heapify?",
          "options": [
              "O(n log n)",
              "O(n)",
              "O(n^2)",
              "O(log n)"
          ],
          "correctIndex": 1,
          "explanation": "Floyd's heap construction runs heapify from bottom to top. The sum of (h * n / 2^(h+1)) across levels evaluates to a convergent series bounded by O(n), much faster than n successive O(log n) insertions."
      },
      {
          "id": "dsa-q9",
          "question": "In a Trie (Prefix Tree) storing words composed of lowercase English letters, what is the time complexity to search for a word of length L?",
          "options": [
              "O(L)",
              "O(n * L)",
              "O(log n)",
              "O(26^L)"
          ],
          "correctIndex": 0,
          "explanation": "Searching in a Trie traverses one node per character of the word, taking O(L) time where L is word length, completely independent of total words n stored."
      },
      {
          "id": "dsa-q10",
          "question": "Which algorithmic technique is used in the Fast Fourier Transform (FFT) to reduce polynomial multiplication from O(n^2) to O(n log n)?",
          "options": [
              "Greedy Choice",
              "Divide and Conquer with Complex Roots of Unity",
              "Dynamic Programming memoization",
              "Simulated Annealing"
          ],
          "correctIndex": 1,
          "explanation": "The Cooley-Tukey FFT recursively divides a polynomial into even- and odd-indexed subpolynomials and evaluates them at complex roots of unity, achieving O(n log n) divide-and-conquer runtime."
      },
      {
          "id": "dsa-q11",
          "question": "What is the worst-case number of comparisons performed by QuickSelect to find the k-th smallest element when using Lomuto partitioning on a sorted array?",
          "options": [
              "O(n)",
              "O(n log n)",
              "O(n^2)",
              "O(k log n)"
          ],
          "correctIndex": 2,
          "explanation": "Without random pivoting or Median-of-Medians, picking the last element as pivot on an already sorted array yields partitions of size (n-1) and 0, degenerating QuickSelect to O(n^2) comparisons."
      },
      {
          "id": "dsa-q12",
          "question": "Which graph algorithm can detect negative-weight cycles in a directed weighted graph?",
          "options": [
              "Dijkstra's Algorithm",
              "Bellman-Ford Algorithm",
              "Breadth-First Search (BFS)",
              "Tarjan's SCC Algorithm"
          ],
          "correctIndex": 1,
          "explanation": "Bellman-Ford relaxes all edges |V| - 1 times. If any edge can still be relaxed on the |V|-th iteration, a negative-weight cycle reachable from the source is detected."
      },
      {
          "id": "dsa-q13",
          "question": "In a B-Tree of order m (where m is max children), what is the minimum number of keys in any non-root internal node?",
          "options": [
              "m",
              "ceil(m/2) - 1",
              "floor(m/2)",
              "1"
          ],
          "correctIndex": 1,
          "explanation": "In a B-tree of order m, every internal node except the root must have at least ceil(m/2) children, which corresponds to at least ceil(m/2) - 1 keys."
      },
      {
          "id": "dsa-q14",
          "question": "What is the primary advantage of a Skip List over a balanced binary search tree?",
          "options": [
              "Strictly O(1) worst-case search",
              "Simpler concurrent lock-free implementation with probabilistic balance",
              "Requires zero auxiliary memory",
              "Guarantees deterministic O(log n) tree depth"
          ],
          "correctIndex": 1,
          "explanation": "Skip lists maintain probabilistic logarithmic height using random coin flips. They avoid complex tree rebalancing rotations, making concurrent lock-free reads and writes significantly simpler to implement."
      },
      {
          "id": "dsa-q15",
          "question": "Which of the following sorting algorithms is stable and achieves O(n log n) worst-case time complexity?",
          "options": [
              "Quick Sort",
              "Heap Sort",
              "Merge Sort",
              "Selection Sort"
          ],
          "correctIndex": 2,
          "explanation": "Merge Sort repeatedly divides the array and merges sorted halves while preserving the relative order of duplicate elements, ensuring both stability and guaranteed O(n log n) runtime."
      }
  ],
  "computer_networks": [
      {
          "id": "net-q1",
          "question": "During a TCP three-way handshake, what flags are set in the second packet transmitted from server to client?",
          "options": [
              "SYN",
              "ACK",
              "SYN + ACK",
              "FIN + ACK"
          ],
          "correctIndex": 2,
          "explanation": "The server responds to the client's initial SYN packet with a SYN-ACK packet containing both the SYN flag (synchronizing its own initial sequence number) and ACK flag (acknowledging the client's sequence number)."
      },
      {
          "id": "net-q2",
          "question": "What is the usable number of IPv4 host addresses in a subnet with a /27 CIDR mask?",
          "options": [
              "32",
              "30",
              "62",
              "14"
          ],
          "correctIndex": 1,
          "explanation": "A /27 subnet has 32 - 27 = 5 host bits. Total addresses = 2^5 = 32. Subtracting 2 for the Network Address and Directed Broadcast Address leaves 32 - 2 = 30 usable host addresses."
      },
      {
          "id": "net-q3",
          "question": "Which TCP congestion control algorithm uses packet loss as the primary signal to cut the congestion window (Additive Increase Multiplicative Decrease)?",
          "options": [
              "TCP BBR",
              "TCP Reno",
              "TCP Vegas",
              "TCP Fast"
          ],
          "correctIndex": 1,
          "explanation": "TCP Reno implements AIMD: it increases the congestion window linearly (by 1 MSS per RTT) during congestion avoidance and cuts it by half upon detecting packet loss via triple duplicate ACKs."
      },
      {
          "id": "net-q4",
          "question": "Which routing protocol is an Exterior Gateway Protocol (EGP) based on path-vector routing that interconnects Autonomous Systems on the global Internet?",
          "options": [
              "OSPF",
              "BGP (Border Gateway Protocol)",
              "RIP",
              "IS-IS"
          ],
          "correctIndex": 1,
          "explanation": "BGP is the de-facto standard path-vector inter-domain routing protocol used by ISPs and Autonomous Systems to exchange reachability information across the global Internet."
      },
      {
          "id": "net-q5",
          "question": "What is the primary function of the Address Resolution Protocol (ARP)?",
          "options": [
              "Translate domain names to IP addresses",
              "Map an IPv4 logical address to a physical MAC hardware address",
              "Route packets between different subnets",
              "Assign dynamic IP addresses to clients"
          ],
          "correctIndex": 1,
          "explanation": "ARP broadcasts on the local data link layer to resolve a target node's 32-bit IPv4 address into its corresponding 48-bit Ethernet MAC hardware address."
      },
      {
          "id": "net-q6",
          "question": "In TLS 1.3, how many round trips (RTT) are required for a standard full handshake before application data can be sent?",
          "options": [
              "0 RTT (always)",
              "1 RTT",
              "2 RTT",
              "3 RTT"
          ],
          "correctIndex": 1,
          "explanation": "TLS 1.3 optimizes the cryptographic negotiation by combining cipher suite selection and Diffie-Hellman key exchange parameters into the ClientHello, completing the full handshake in just 1 RTT (and 0-RTT on session resumption)."
      },
      {
          "id": "net-q7",
          "question": "What mechanism does IPv6 use instead of IPv4 broadcast to send packets to multiple interested hosts or locate default gateways?",
          "options": [
              "Anycast & Multicast (ICMPv6 Neighbor Discovery)",
              "Hub-and-spoke polling",
              "CSMA/CD collisions",
              "Static routing tables only"
          ],
          "correctIndex": 0,
          "explanation": "IPv6 eliminates broadcast completely. It utilizes Multicast and Anycast alongside ICMPv6 Neighbor Discovery Protocol (NDP) to discover neighbors and routers efficiently without waking uninterested hosts."
      },
      {
          "id": "net-q8",
          "question": "What is the maximum payload size of a standard Ethernet frame with Maximum Transmission Unit (MTU) of 1500 bytes?",
          "options": [
              "1460 bytes (TCP MSS over standard IPv4)",
              "1500 bytes",
              "1518 bytes",
              "65535 bytes"
          ],
          "correctIndex": 1,
          "explanation": "The standard Ethernet MTU is 1500 bytes, which represents the maximum Layer 3 IP packet size. A TCP segment inside an IPv4 packet leaves 1500 - 20 (IP header) - 20 (TCP header) = 1460 bytes for the MSS."
      },
      {
          "id": "net-q9",
          "question": "Which DNS record type specifies the mail server responsible for accepting incoming email messages on behalf of a domain?",
          "options": [
              "A Record",
              "CNAME Record",
              "MX Record",
              "PTR Record"
          ],
          "correctIndex": 2,
          "explanation": "MX (Mail Exchange) records indicate the preference order and domain names of SMTP mail servers designated to receive email for that domain."
      },
      {
          "id": "net-q10",
          "question": "In Link-State routing protocols like OSPF, which algorithm does each router execute to compute the shortest path tree to all network nodes?",
          "options": [
              "Bellman-Ford Algorithm",
              "Dijkstra's Algorithm",
              "Floyd-Warshall Algorithm",
              "Kruskal's Algorithm"
          ],
          "correctIndex": 1,
          "explanation": "OSPF routers flood Link-State Advertisements (LSAs) so every router possesses an identical network topology database, upon which each router runs Dijkstra's algorithm to compute the shortest path tree."
      },
      {
          "id": "net-q11",
          "question": "What field in the IPv4 header prevents packets from circulating indefinitely inside a routing loop?",
          "options": [
              "Checksum",
              "Time to Live (TTL)",
              "Identification",
              "Differentiated Services (DiffServ)"
          ],
          "correctIndex": 1,
          "explanation": "Each router decrements the 8-bit TTL field by at least 1 before forwarding. If TTL reaches 0, the router drops the packet and transmits an ICMP Time Exceeded message back to the sender."
      },
      {
          "id": "net-q12",
          "question": "What is the key advantage of QUIC (HTTP/3) over HTTP/2 running on standard TCP + TLS?",
          "options": [
              "Eliminates Head-of-Line (HoL) blocking across multiplexed streams using UDP",
              "Does not encrypt payload data",
              "Replaces DNS entirely",
              "Requires no congestion control"
          ],
          "correctIndex": 0,
          "explanation": "HTTP/2 suffered from TCP-level Head-of-Line blocking because a single lost packet stalled all multiplexed streams. QUIC runs over UDP with independent stream flow control, ensuring lost packets on one stream do not stall other streams."
      },
      {
          "id": "net-q13",
          "question": "Which protocol operates at the Transport Layer to provide connectionless, low-overhead datagram communication without delivery guarantees?",
          "options": [
              "TCP",
              "UDP (User Datagram Protocol)",
              "SCTP",
              "IP"
          ],
          "correctIndex": 1,
          "explanation": "UDP provides lightweight datagram transmission with an 8-byte header, without connection setup, flow control, retransmissions, or ordering guarantees, ideal for DNS queries and real-time media."
      },
      {
          "id": "net-q14",
          "question": "What does a NAT (Network Address Translation) router use to differentiate multiple internal hosts sharing a single public IPv4 address?",
          "options": [
              "VLAN Tags",
              "Port Address Translation (PAT) using Layer 4 port numbers",
              "MAC Address Spoofing",
              "Subnet mask bit shifting"
          ],
          "correctIndex": 1,
          "explanation": "Port Address Translation (PAT / NAPT) tracks sessions in a state table by rewriting the source IP to the public IP and mapping dynamic unique Layer 4 TCP/UDP port numbers."
      },
      {
          "id": "net-q15",
          "question": "What is the primary objective of the IEEE 802.1Q standard?",
          "options": [
              "Define Wi-Fi 6 wireless frequencies",
              "Define VLAN (Virtual LAN) tagging for Ethernet frames",
              "Standardize Bluetooth mesh networking",
              "Specify 10-Gigabit optical fiber specs"
          ],
          "correctIndex": 1,
          "explanation": "IEEE 802.1Q defines a 4-byte VLAN tag inserted into Ethernet frames, enabling multiple logical virtual networks to share the same physical trunk links safely."
      }
  ],
  "operating_systems": [
      {
          "id": "os-q1",
          "question": "In modern operating systems, which of the following operations requires transitioning from User Mode to Kernel Mode via a software interrupt or TRAP instruction?",
          "options": [
              "Evaluating an arithmetic expression",
              "Calling malloc() for already mapped heap memory",
              "Executing the write() or read() system call",
              "Iterating through an array in memory"
          ],
          "correctIndex": 2,
          "explanation": "System calls (such as read, write, fork) request privileged hardware services from the OS kernel, requiring a CPU privilege level transition (Ring 3 to Ring 0) via a trap or SYSCALL instruction."
      },
      {
          "id": "os-q2",
          "question": "Which CPU scheduling algorithm is non-preemptive and provably achieves the minimum average waiting time for a given set of stationary processes?",
          "options": [
              "First-Come, First-Served (FCFS)",
              "Shortest Job First (SJF)",
              "Round Robin (RR)",
              "Multilevel Feedback Queue"
          ],
          "correctIndex": 1,
          "explanation": "Shortest Job First (SJF) schedules the process with the shortest CPU burst first. Mathematically, sorting bursts in ascending order minimizes the cumulative sum of waiting times, giving the lowest average waiting time."
      },
      {
          "id": "os-q3",
          "question": "Which of the following is NOT one of the four Coffman conditions necessary for a deadlock to occur?",
          "options": [
              "Mutual Exclusion",
              "Hold and Wait",
              "Preemption of Resources",
              "Circular Wait"
          ],
          "correctIndex": 2,
          "explanation": "The fourth condition is 'No Preemption' (resources cannot be forcibly confiscated). If preemption is allowed, deadlock cannot persist because the OS can reclaim resources to break the cycle."
      },
      {
          "id": "os-q4",
          "question": "What is the phenomenon where increasing the number of allocated page frames results in an increased number of page faults under FIFO page replacement?",
          "options": [
              "Thrashing",
              "Belady's Anomaly",
              "Cache Invalidation",
              "Convoy Effect"
          ],
          "correctIndex": 1,
          "explanation": "Belady's Anomaly occurs with FIFO page replacement when adding more physical memory frames counter-intuitively causes more page faults due to poor locality alignment. Stack-based algorithms like LRU never suffer from it."
      },
      {
          "id": "os-q5",
          "question": "What hardware component is responsible for translating virtual memory addresses into physical memory addresses at execution time?",
          "options": [
              "Direct Memory Access (DMA) Controller",
              "Memory Management Unit (MMU) with TLB",
              "Instruction Pointer Register",
              "Arithmetic Logic Unit (ALU)"
          ],
          "correctIndex": 1,
          "explanation": "The MMU hardware intercepts virtual memory addresses generated by the CPU, looks up the Translation Lookaside Buffer (TLB) cache, and walks multi-level page tables to obtain the physical address."
      },
      {
          "id": "os-q6",
          "question": "What happens during a Process Context Switch?",
          "options": [
              "The kernel compiles process bytecode into native instructions",
              "The CPU state (registers, program counter, stack pointer, page directory base) of the running process is saved, and the state of the scheduled process is restored",
              "All cache memory is zeroed out and RAM is refreshed",
              "The hard disk re-partitions the root filesystem"
          ],
          "correctIndex": 1,
          "explanation": "A context switch saves the current CPU registers, PC, stack pointer, and memory management state into the Process Control Block (PCB) and loads the corresponding registers of the newly scheduled process."
      },
      {
          "id": "os-q7",
          "question": "In synchronization, what is the key difference between a Binary Semaphore and a Mutex?",
          "options": [
              "A Mutex has ownership semantics (only the thread that acquired the mutex can release it), whereas a semaphore can be signaled by any thread",
              "A Semaphore can only be used on 32-bit machines",
              "A Mutex can hold counts up to 255",
              "They are 100% identical in all POSIX implementations"
          ],
          "correctIndex": 0,
          "explanation": "A Mutex enforces thread ownership: the exact thread that locks the mutex must unlock it (enabling priority inheritance to prevent priority inversion). A semaphore is a signaling mechanism where one thread can signal (V) a semaphore waited on (P) by another."
      },
      {
          "id": "os-q8",
          "question": "What is the cause of 'Thrashing' in virtual memory systems?",
          "options": [
              "The CPU clock speed is too high for the RAM bus",
              "The total working sets of active processes exceed available physical memory, causing continuous page swapping and near-zero CPU throughput",
              "Too many background threads accessing the same file descriptor",
              "Hard drive sector corruption"
          ],
          "correctIndex": 1,
          "explanation": "Thrashing occurs when memory demand outstrips physical RAM. The OS spends virtually all its CPU time servicing page faults and waiting on disk I/O rather than executing useful user instructions."
      },
      {
          "id": "os-q9",
          "question": "Which algorithm is used by operating systems for deadlock avoidance by verifying whether granting a resource request leaves the system in a 'Safe State'?",
          "options": [
              "Dijkstra's Banker's Algorithm",
              "Kruskal's Algorithm",
              "Peterson's Algorithm",
              "Lamport's Bakery Algorithm"
          ],
          "correctIndex": 0,
          "explanation": "Banker's Algorithm tests resource allocations by simulating the maximum possible remaining requests of all processes to guarantee at least one execution sequence exists where all processes complete without deadlocking."
      },
      {
          "id": "os-q10",
          "question": "What is an Inode in Unix/Linux filesystems?",
          "options": [
              "A network socket identifier",
              "A data structure containing file metadata (size, permissions, timestamps, owner, block pointers) excluding the filename",
              "A user password hash in /etc/shadow",
              "The root directory mount point"
          ],
          "correctIndex": 1,
          "explanation": "An inode (index node) stores all metadata of a filesystem object (file size, access rights, ownership, pointers to storage disk blocks). Directory entries map filenames to inode numbers."
      },
      {
          "id": "os-q11",
          "question": "What is the primary role of the 'fork()' system call in Unix-like operating systems?",
          "options": [
              "To terminate the calling process",
              "To create an exact duplicate child process with an independent address space",
              "To compile a C program into a binary",
              "To execute a new binary image in the current process space"
          ],
          "correctIndex": 1,
          "explanation": "fork() creates a new child process that is an identical clone of the parent, duplicating file descriptors and registers. In modern kernels, Copy-on-Write (COW) optimizes page duplication until written."
      },
      {
          "id": "os-q12",
          "question": "How does Copy-on-Write (COW) improve process creation performance during fork()?",
          "options": [
              "It skips allocating physical memory pages until either the parent or child attempts to modify the page",
              "It writes data directly to optical disks",
              "It prevents processes from writing to any files",
              "It executes child processes in kernel mode"
          ],
          "correctIndex": 0,
          "explanation": "Rather than copying megabytes of parent memory during fork(), COW marks all pages read-only and shares them. Only when a process executes a write operation does the MMU trigger a page fault, duplicating that specific 4KB page."
      },
      {
          "id": "os-q13",
          "question": "Which RAID configuration provides block-level striping with distributed parity, tolerating the failure of any single drive?",
          "options": [
              "RAID 0",
              "RAID 1",
              "RAID 5",
              "RAID 10"
          ],
          "correctIndex": 2,
          "explanation": "RAID 5 stripes data and parity blocks across three or more disks. Parity is distributed across all drives so no single parity bottleneck exists, tolerating 1 drive failure with (N-1)/N usable capacity."
      },
      {
          "id": "os-q14",
          "question": "What is the Completely Fair Scheduler (CFS) used in the Linux kernel based on?",
          "options": [
              "Priority-based round robin with static tick timers",
              "Red-Black Tree tracking process 'virtual runtime' (vruntime)",
              "First-In-First-Out FIFO queue with aging",
              "Random lottery scheduling"
          ],
          "correctIndex": 1,
          "explanation": "Linux CFS models an 'ideal multi-tasking CPU' on hardware. It tracks the normalized CPU execution time (vruntime) of runnable tasks in a time-ordered Red-Black Tree, always selecting the task with the smallest vruntime."
      },
      {
          "id": "os-q15",
          "question": "In memory management, what is the difference between Internal and External Fragmentation?",
          "options": [
              "Internal fragmentation is unused memory within an allocated fixed block; external fragmentation is total free memory broken into small disjoint chunks unusable by large requests",
              "Internal occurs on hard disks; external occurs in CPU registers",
              "Internal only happens in Linux; external only happens in Windows",
              "There is no difference"
          ],
          "correctIndex": 0,
          "explanation": "Internal fragmentation happens when allocated fixed-size partitions (like 4KB pages) exceed the requested bytes. External fragmentation happens when dynamic contiguous allocations leave scattered free holes too small for new requests."
      }
  ],
  "database_systems": [
      {
          "id": "dbms-q1",
          "question": "Why are B+ Trees predominantly preferred over Binary Search Trees or AVL Trees for relational database indexes on disk storage?",
          "options": [
              "B+ Trees have a high branching factor (fan-out), minimizing the number of disk I/O operations to traverse the tree",
              "B+ Trees require zero RAM",
              "B+ Trees only store integers",
              "B+ Trees eliminate the need for SQL queries"
          ],
          "correctIndex": 0,
          "explanation": "Disk seeks are orders of magnitude slower than CPU memory access. A B+ Tree node matches the disk page size (4KB-16KB) with fan-out of 100-500, keeping tree height to 3-4 levels for millions of records and minimizing disk I/O."
      },
      {
          "id": "dbms-q2",
          "question": "Which ACID property guarantees that all operations within a transaction either succeed completely or have their effects completely rolled back upon failure?",
          "options": [
              "Atomicity",
              "Consistency",
              "Isolation",
              "Durability"
          ],
          "correctIndex": 0,
          "explanation": "Atomicity (the 'All or Nothing' property) ensures that if any part of a multi-statement transaction fails, the Write-Ahead Log (WAL) undoes all intermediate modifications, leaving the database in its prior state."
      },
      {
          "id": "dbms-q3",
          "question": "Under the ANSI SQL standard, which isolation level prevents Dirty Reads and Non-Repeatable Reads, but may still permit Phantom Reads?",
          "options": [
              "Read Uncommitted",
              "Read Committed",
              "Repeatable Read",
              "Serializable"
          ],
          "correctIndex": 2,
          "explanation": "Repeatable Read locks all rows read by a query so concurrent transactions cannot modify or delete them. However, concurrent transactions may insert new rows matching the WHERE clause range, producing Phantom Reads unless range locks are used."
      },
      {
          "id": "dbms-q4",
          "question": "In database transaction concurrency control, what is Two-Phase Locking (2PL)?",
          "options": [
              "A protocol with an expanding Growing Phase (locks acquired) followed by a shrinking Contraction Phase (locks released), guaranteeing conflict serializability",
              "Running queries twice to check consistency",
              "Locking the entire database table for every SELECT",
              "Encrypting data with two private keys"
          ],
          "correctIndex": 0,
          "explanation": "2PL ensures conflict-serializable schedules by forbidding any transaction from acquiring new locks once it releases its first lock. In Strict 2PL (S2PL), all exclusive locks are held until commit/abort to prevent cascading aborts."
      },
      {
          "id": "dbms-q5",
          "question": "What is the primary rule for a relational table to satisfy Boyce-Codd Normal Form (BCNF)?",
          "options": [
              "Every non-prime attribute must depend on the primary key",
              "For every non-trivial functional dependency X -> Y, X must be a superkey",
              "All attributes must be multi-valued",
              "The table must have exactly three columns"
          ],
          "correctIndex": 1,
          "explanation": "BCNF is a stricter version of 3NF. A relation R is in BCNF if for every non-trivial functional dependency X -> Y, the determinant X is a candidate key or superkey, eliminating all redundancy from functional dependencies."
      },
      {
          "id": "dbms-q6",
          "question": "What is the purpose of Write-Ahead Logging (WAL) in database crash recovery algorithms like ARIES?",
          "options": [
              "To compress log files before saving to flash storage",
              "To ensure log records describing changes are written to persistent disk storage BEFORE the corresponding dirty data pages are flushed from buffer cache to disk",
              "To log user passwords for security audits",
              "To speed up JavaScript rendering in web apps"
          ],
          "correctIndex": 1,
          "explanation": "The WAL protocol dictates that log records containing redo/undo information must reach non-volatile disk before the modified data page itself is written to disk, ensuring that crashes can be fully recovered via redo/undo passes."
      },
      {
          "id": "dbms-q7",
          "question": "What is the difference between a Clustered Index and a Non-Clustered (Secondary) Index?",
          "options": [
              "A clustered index dictates the physical on-disk storage order of the actual table rows; a non-clustered index stores pointers/keys referencing row locations",
              "A table can have up to 10 clustered indexes",
              "Clustered indexes are stored in RAM; non-clustered are on tape",
              "Non-clustered indexes cannot be used in WHERE queries"
          ],
          "correctIndex": 0,
          "explanation": "Since table records can only be stored physically in one sorted order on disk, a table can possess only ONE clustered index. Secondary indexes contain leaf nodes with index keys and row pointers (RID or primary key)."
      },
      {
          "id": "dbms-q8",
          "question": "Which SQL query optimization strategy replaces a subquery with an equivalent JOIN operation to allow the query optimizer to pick better join algorithms (e.g. Hash Join)?",
          "options": [
              "Subquery Flattening / Decorrelation",
              "Index fragmentation",
              "Deadlock detection",
              "Page splitting"
          ],
          "correctIndex": 0,
          "explanation": "Subquery decorrelation (unnesting) transforms correlated subqueries into relational joins or semi-joins, allowing the query planner to evaluate join order, leverage hash joins, and use existing indexes efficiently."
      },
      {
          "id": "dbms-q9",
          "question": "In a distributed database, what does the CAP theorem state regarding Consistency (C), Availability (A), and Partition Tolerance (P)?",
          "options": [
              "A distributed data store can simultaneously provide at most two of the three guarantees in the presence of a network partition",
              "All three can be guaranteed 100% of the time",
              "Only consistency matters; availability is irrelevant",
              "Partitions never occur on fiber optic networks"
          ],
          "correctIndex": 0,
          "explanation": "Eric Brewer's CAP Theorem proves that across an asynchronous network where partitions (P) are inevitable, a system must choose between returning consistent latest data (CP) or guaranteeing responsive availability at the cost of stale data (AP)."
      },
      {
          "id": "dbms-q10",
          "question": "What is the main benefit of using a Bloom Filter in distributed key-value stores (like Apache Cassandra or RocksDB)?",
          "options": [
              "It quickly tests whether an element is definitely NOT present in an on-disk SSTable, avoiding expensive disk reads",
              "It encrypts stored values with AES-256",
              "It sorts database records alphabetically",
              "It replaces the primary key index completely"
          ],
          "correctIndex": 0,
          "explanation": "A Bloom filter is a space-efficient probabilistic data structure that never returns false negatives. If it reports an item is absent from an SSTable file, the database skips the disk I/O entirely."
      }
  ],
  "system_design": [
      {
          "id": "sd-q1",
          "question": "In distributed systems, what problem does Consistent Hashing solve when dynamically adding or removing cache servers?",
          "options": [
              "It minimizes key re-mapping: on average only K/N keys need to be relocated when a node joins or leaves, rather than rehashing almost all keys",
              "It guarantees zero memory usage on cache servers",
              "It replaces TCP/IP with UDP packets",
              "It provides cryptographic blockchain consensus"
          ],
          "correctIndex": 0,
          "explanation": "Traditional modulo hashing (hash(key) % N) relocates almost all keys whenever server count N changes. Consistent hashing places nodes and keys on a circular ring, moving only keys belonging to adjacent ranges."
      },
      {
          "id": "sd-q2",
          "question": "Which consensus algorithm uses leader election, log replication, and randomized election timeouts to ensure linearizable distributed state machine replication?",
          "options": [
              "Raft Consensus Algorithm",
              "Dijkstra's Shortest Path",
              "Simulated Annealing",
              "MD5 Hash Algorithm"
          ],
          "correctIndex": 0,
          "explanation": "Raft decomposes consensus into explicit leader election, log replication, and safety invariants, using randomized election timers to avoid split votes, powering etcd, Consul, and Kafka KRaft."
      },
      {
          "id": "sd-q3",
          "question": "What is the primary architectural principle behind the CQRS (Command Query Responsibility Segregation) pattern?",
          "options": [
              "Separating read models (queries) from write models (commands) into distinct data representations optimized for their respective workloads",
              "Combining all business logic into one monolithic database table",
              "Eliminating database transactions entirely",
              "Compiling backend services into WebAssembly"
          ],
          "correctIndex": 0,
          "explanation": "CQRS separates write operations (commands that mutate state with business validation) from read operations (queries that return denormalized views), allowing each side to scale and optimize independently."
      },
      {
          "id": "sd-q4",
          "question": "What is the function of a Circuit Breaker pattern in microservices architectures?",
          "options": [
              "To fail fast when a downstream dependency is unhealthy, preventing cascading timeouts and giving the failing service time to recover",
              "To power off physical servers during night hours",
              "To throttle user web browser page scrolling",
              "To compress HTTP responses with gzip"
          ],
          "correctIndex": 0,
          "explanation": "A Circuit Breaker tracks failures. Once an error threshold is crossed, it trips open to immediately return fallbacks without invoking the downstream service, preventing thread pool exhaustion and cascading system failure."
      },
      {
          "id": "sd-q5",
          "question": "Which database scaling technique divides a massive single table horizontally across multiple database instances based on a shard key?",
          "options": [
              "Horizontal Database Sharding",
              "Vertical Indexing",
              "Database Normalization",
              "Foreign Key Cascading"
          ],
          "correctIndex": 0,
          "explanation": "Sharding partitions data horizontally across independent server nodes based on a partition hash or range of the shard key, distributing both storage volume and query load across clusters."
      },
      {
          "id": "sd-q6",
          "question": "In message queues like Apache Kafka, what enables high-throughput sequential disk writes and zero-copy data transfer to consumer network sockets?",
          "options": [
              "Append-only commit log storage architecture combined with the sendfile() OS system call",
              "Storing all messages exclusively in volatile CPU L1 cache",
              "Translating all messages into raw assembly instructions",
              "Deleting messages immediately after publication"
          ],
          "correctIndex": 0,
          "explanation": "Kafka writes messages sequentially to an append-only commit log (which approaches sequential disk write speeds of hundreds of MB/s) and uses the Linux sendfile() zero-copy system call to stream directly from page cache to NIC socket."
      },
      {
          "id": "sd-q7",
          "question": "What is the primary difference between Strong Consistency and Eventual Consistency in distributed data stores?",
          "options": [
              "Strong consistency guarantees any read returns the most recent write; eventual consistency guarantees replicas will converge to the same value over time given no new updates",
              "Eventual consistency never updates data",
              "Strong consistency does not support networks",
              "Eventual consistency only works on single-core laptops"
          ],
          "correctIndex": 0,
          "explanation": "Strong consistency enforces synchronous coordination (e.g. 2PC or Paxos/Raft) so all reads see the latest write. Eventual consistency prioritizes latency and availability, asynchronously propagating updates across replicas."
      },
      {
          "id": "sd-q8",
          "question": "What is a Reverse Proxy used for in modern web architectures?",
          "options": [
              "Positioned in front of backend servers to handle SSL termination, load balancing, compression, caching, and IP masking",
              "To proxy user outgoing requests to the dark web",
              "To execute database migrations",
              "To convert HTML to PDF documents"
          ],
          "correctIndex": 0,
          "explanation": "A reverse proxy (e.g. Nginx, Envoy, HAProxy) sits between clients and internal server farms, routing requests, offloading TLS cryptographic handshakes, and caching static assets."
      },
      {
          "id": "sd-q9",
          "question": "What caching strategy writes data simultaneously to both the cache and the backing database before acknowledging completion to the client?",
          "options": [
              "Write-Through Caching",
              "Write-Back (Write-Behind) Caching",
              "Cache-Aside Caching",
              "Refresh-Ahead Caching"
          ],
          "correctIndex": 0,
          "explanation": "Write-Through caching writes to the cache and the primary datastore synchronously before returning success. This ensures cache consistency and zero data loss on crash, at the cost of higher write latency."
      },
      {
          "id": "sd-q10",
          "question": "Which rate limiting algorithm allows bursts of traffic up to a bucket capacity while replenishing tokens at a constant rate?",
          "options": [
              "Token Bucket Algorithm",
              "Simple Linear Search",
              "First-In-First-Out Queue",
              "Bubble Sort Rate Limiter"
          ],
          "correctIndex": 0,
          "explanation": "The Token Bucket algorithm accumulates tokens at a fixed fill rate up to bucket capacity. Requests consume tokens immediately upon arrival, accommodating short traffic bursts while enforcing strict sustained average rate limits."
      }
  ],

  "mathematics": [
    {
      "id": "math-q1",
      "question": "What is the characteristic equation used to determine the eigenvalues of an n\u00d7n square matrix A?",
      "options": [
        "det(A + \u03bbI) = 0",
        "det(A - \u03bbI) = 0",
        "trace(A) \u00b7 \u03bb = 0",
        "A \u00b7 v = 0"
      ],
      "correctIndex": 1,
      "explanation": "The characteristic equation is derived from (A - \u03bbI)v = 0 having non-trivial solutions (v \u2260 0), which mathematically requires det(A - \u03bbI) = 0."
    },
    {
      "id": "math-q2",
      "question": "If the eigenvalues of a 2\u00d72 matrix are 3 and 7, what is the determinant of the matrix?",
      "options": [
        "10",
        "21",
        "4",
        "0"
      ],
      "correctIndex": 1,
      "explanation": "The determinant of any square matrix is equal to the product of its eigenvalues: 3 \u00d7 7 = 21."
    },
    {
      "id": "math-q3",
      "question": "Which theorem states that every square matrix satisfies its own characteristic equation?",
      "options": [
        "Cramer's Rule",
        "Rolle's Theorem",
        "Cayley-Hamilton Theorem",
        "Gauss-Jordan Theorem"
      ],
      "correctIndex": 2,
      "explanation": "The Cayley-Hamilton Theorem states that substituting matrix A into its own characteristic polynomial P(\u03bb) gives P(A) = 0."
    },
    {
      "id": "math-q4",
      "question": "If the trace of a 3\u00d73 matrix is 12 and two eigenvalues are 4 and 5, what is the third eigenvalue?",
      "options": [
        "3",
        "1",
        "7",
        "20"
      ],
      "correctIndex": 0,
      "explanation": "The sum of all eigenvalues equals the trace of the matrix: \u03bb\u2081 + \u03bb\u2082 + \u03bb\u2083 = trace(A). Here, 4 + 5 + \u03bb\u2083 = 12, so \u03bb\u2083 = 3."
    },
    {
      "id": "math-q5",
      "question": "By definition, which of the following is true regarding an eigenvector v corresponding to an eigenvalue \u03bb?",
      "options": [
        "v can be the zero vector [0, 0, ... 0]\u1d40",
        "v must be a non-zero vector",
        "v must always have unit length ||v|| = 1",
        "v is always orthogonal to itself"
      ],
      "correctIndex": 1,
      "explanation": "An eigenvector is strictly defined as a non-zero vector (v \u2260 0) satisfying Av = \u03bbv. The zero vector trivially satisfies A\u00b70 = \u03bb\u00b70 for any scalar and is excluded."
    },
    {
      "id": "math-q6",
      "question": "If \u03bb is an eigenvalue of an invertible matrix A, what is the eigenvalue of its inverse A\u207b\u00b9?",
      "options": [
        "-\u03bb",
        "1 / \u03bb",
        "\u03bb\u00b2",
        "1 - \u03bb"
      ],
      "correctIndex": 1,
      "explanation": "From Av = \u03bbv, multiplying both sides by A\u207b\u00b9 yields v = \u03bb A\u207b\u00b9v, which gives A\u207b\u00b9v = (1/\u03bb)v for any non-zero eigenvalue \u03bb."
    },
    {
      "id": "math-q7",
      "question": "What is the Laplace transform L{e^(at)} for s > a?",
      "options": [
        "1 / (s - a)",
        "1 / (s + a)",
        "a / (s\u00b2 + a\u00b2)",
        "s / (s\u00b2 + a\u00b2)"
      ],
      "correctIndex": 0,
      "explanation": "By definition, L{e^(at)} = \u222b\u2080^\u221e e^(-st) e^(at) dt = \u222b\u2080^\u221e e^(-(s-a)t) dt = 1 / (s - a) for s > a."
    },
    {
      "id": "math-q8",
      "question": "What is the Laplace transform of the unit step function u(t)?",
      "options": [
        "1",
        "1 / s",
        "1 / s\u00b2",
        "s"
      ],
      "correctIndex": 1,
      "explanation": "The Laplace transform of u(t) is \u222b\u2080^\u221e e^(-st) (1) dt = [-e^(-st)/s] from 0 to \u221e = 1/s."
    },
    {
      "id": "math-q9",
      "question": "What are the Dirichlet conditions for a function f(x) to have a valid Fourier series expansion over (-L, L)?",
      "options": [
        "f(x) must be continuous everywhere and differentiable infinite times",
        "f(x) must be single-valued, bounded, with a finite number of maxima, minima, and finite discontinuities",
        "f(x) must be an exponential polynomial",
        "f(x) must have only even harmonics"
      ],
      "correctIndex": 1,
      "explanation": "Dirichlet conditions require that f(x) be single-valued, periodic, bounded with a finite number of local extrema and finite discontinuities in any one period."
    },
    {
      "id": "math-q10",
      "question": "If f(x) is an odd function defined on (-L, L), what is the value of the Fourier cosine coefficients a\u2099?",
      "options": [
        "a\u2099 = 1 for all n",
        "a\u2099 = 0 for all n \u2265 0",
        "a\u2099 = b\u2099",
        "a\u2099 = (-1)\u207f / n"
      ],
      "correctIndex": 1,
      "explanation": "The product of an odd function and an even function (cos(n\u03c0x/L)) is odd. Integrating an odd function over symmetric limits (-L, L) yields 0. Thus, a\u2099 = 0."
    },
    {
      "id": "math-q11",
      "question": "The gradient vector \u2207f of a scalar field f(x, y, z) points in which direction?",
      "options": [
        "Direction of zero rate of change",
        "Direction of steepest descent",
        "Direction of maximum rate of increase of f",
        "Tangent to the level surface"
      ],
      "correctIndex": 2,
      "explanation": "The gradient vector \u2207f points in the direction of the greatest spatial rate of increase of the scalar function f, with its magnitude equal to that maximum rate."
    },
    {
      "id": "math-q12",
      "question": "A vector field F is conservative (irrotational) if and only if which condition holds?",
      "options": [
        "\u2207 \u00b7 F = 0",
        "\u2207 \u00d7 F = 0 (curl of F is zero)",
        "\u2207\u00b2F = 0",
        "F \u00b7 F = 1"
      ],
      "correctIndex": 1,
      "explanation": "A vector field is conservative if it can be written as the gradient of a scalar potential (F = \u2207\u03c6), which implies curl(F) = \u2207 \u00d7 F = 0."
    },
    {
      "id": "math-q13",
      "question": "Gauss's Divergence Theorem relates which two integrals?",
      "options": [
        "Line integral to surface integral",
        "Surface integral of normal flux to volume integral of divergence (\u222c F\u00b7dS = \u222d \u2207\u00b7F dV)",
        "Double integral to line integral",
        "Volume integral to contour integral"
      ],
      "correctIndex": 1,
      "explanation": "Gauss's Divergence Theorem states that the outward flux of a vector field through a closed surface equals the volume integral of its divergence: \u222c F\u00b7dS = \u222d (\u2207\u00b7F) dV."
    },
    {
      "id": "math-q14",
      "question": "Stokes' Theorem relates a line integral around a closed boundary curve C to what integral?",
      "options": [
        "Surface integral of the curl over surface S bounded by C (\u222e F\u00b7dr = \u222c (\u2207\u00d7F)\u00b7dS)",
        "Volume integral of divergence",
        "Arc length integral of velocity",
        "Double integral of density"
      ],
      "correctIndex": 0,
      "explanation": "Stokes' Theorem equates the circulation of vector field F along closed curve C to the flux of curl(F) through any open surface S bounded by C: \u222e F\u00b7dr = \u222c (\u2207\u00d7F)\u00b7dS."
    },
    {
      "id": "math-q15",
      "question": "What are the Cauchy-Riemann equations for an analytic function f(z) = u(x,y) + i\u00b7v(x,y)?",
      "options": [
        "\u2202u/\u2202x = \u2202v/\u2202y and \u2202u/\u2202y = -\u2202v/\u2202x",
        "\u2202u/\u2202x = -\u2202v/\u2202y and \u2202u/\u2202y = \u2202v/\u2202x",
        "\u2202u/\u2202x + \u2202v/\u2202y = 0",
        "\u2202\u00b2u/\u2202x\u00b2 + \u2202\u00b2v/\u2202y\u00b2 = 0"
      ],
      "correctIndex": 0,
      "explanation": "For complex differentiability, u and v must satisfy the Cauchy-Riemann equations: u_x = v_y and u_y = -v_x."
    },
    {
      "id": "math-q16",
      "question": "According to Cauchy's Integral Theorem, if f(z) is analytic inside and on a simple closed contour C, what is \u222e_C f(z) dz?",
      "options": [
        "2\u03c0i",
        "0",
        "\u03c0",
        "f(0)"
      ],
      "correctIndex": 1,
      "explanation": "Cauchy's Integral Theorem states that the contour integral of an analytic function over any closed path enclosing no singularities is identically zero."
    },
    {
      "id": "math-q17",
      "question": "What is the order and degree of the differential equation (d\u00b2y/dx\u00b2)\u00b3 + (dy/dx)\u2074 + y = 0?",
      "options": [
        "Order 2, Degree 3",
        "Order 3, Degree 2",
        "Order 4, Degree 3",
        "Order 2, Degree 4"
      ],
      "correctIndex": 0,
      "explanation": "The order is the highest derivative present (d\u00b2y/dx\u00b2, order 2). The degree is the power of this highest derivative (power 3). Hence, Order 2, Degree 3."
    },
    {
      "id": "math-q18",
      "question": "What is the general solution of the homogeneous ODE y'' - 4y' + 4y = 0?",
      "options": [
        "y = C\u2081 e^(2x) + C\u2082 e^(-2x)",
        "y = (C\u2081 + C\u2082 x) e^(2x)",
        "y = C\u2081 cos(2x) + C\u2082 sin(2x)",
        "y = C\u2081 e^(4x) + C\u2082"
      ],
      "correctIndex": 1,
      "explanation": "The auxiliary equation is m\u00b2 - 4m + 4 = (m - 2)\u00b2 = 0, giving repeated roots m = 2, 2. The solution is y = (C\u2081 + C\u2082 x) e^(2x)."
    },
    {
      "id": "math-q19",
      "question": "What is the probability of obtaining exactly 2 heads in 4 fair coin tosses (Binomial Distribution)?",
      "options": [
        "1/4",
        "3/8",
        "1/2",
        "5/8"
      ],
      "correctIndex": 1,
      "explanation": "Using P(X = k) = C(n, k) p^k (1-p)^(n-k): C(4, 2) (1/2)\u00b2 (1/2)\u00b2 = 6 \u00d7 (1/16) = 6/16 = 3/8."
    },
    {
      "id": "math-q20",
      "question": "For a Poisson distribution with parameter \u03bb = 3, what is the mean and variance?",
      "options": [
        "Mean = 3, Variance = 9",
        "Mean = 3, Variance = 3",
        "Mean = 3, Variance = \u221a3",
        "Mean = 9, Variance = 3"
      ],
      "correctIndex": 1,
      "explanation": "A fundamental property of the Poisson distribution is that its mean and variance are equal to its parameter \u03bb. Both mean and variance equal 3."
    },
    {
      "id": "math-q21",
      "question": "What is the order of convergence of the Newton-Raphson method for finding simple roots?",
      "options": [
        "Linear (Order 1)",
        "Quadratic (Order 2)",
        "Cubic (Order 3)",
        "Logarithmic"
      ],
      "correctIndex": 1,
      "explanation": "The Newton-Raphson method exhibits quadratic convergence (order 2) near a simple root, meaning the number of correct decimal places approximately doubles each iteration."
    },
    {
      "id": "math-q22",
      "question": "Simpson's 1/3 Rule for numerical integration approximates the integrand using what type of polynomial curve?",
      "options": [
        "Straight line (degree 1)",
        "Parabolic arc (quadratic, degree 2)",
        "Cubic spline (degree 3)",
        "Exponential function"
      ],
      "correctIndex": 1,
      "explanation": "Simpson's 1/3 rule connects sets of three successive points using quadratic polynomials (parabolas of degree 2), requiring an even number of subintervals."
    },
    {
      "id": "math-q23",
      "question": "What is the Rank of a 3\u00d73 matrix whose determinant is non-zero?",
      "options": [
        "0",
        "1",
        "2",
        "3 (Full Rank)"
      ],
      "correctIndex": 3,
      "explanation": "If det(A) \u2260 0 for an n\u00d7n matrix, all n row/column vectors are linearly independent, meaning the matrix has full rank equal to n = 3."
    },
    {
      "id": "math-q24",
      "question": "In complex analysis, what is the residue of f(z) = 1 / (z - 3) at its simple pole z = 3?",
      "options": [
        "0",
        "1",
        "3",
        "2\u03c0i"
      ],
      "correctIndex": 1,
      "explanation": "For a simple pole at z = a, Res(f, a) = lim_{z\u2192a} (z - a) f(z). Here, lim_{z\u21923} (z - 3) \u00b7 [1/(z - 3)] = 1."
    },
    {
      "id": "math-q25",
      "question": "What is the Fourier transform of the Dirac delta function \u03b4(t)?",
      "options": [
        "0",
        "1",
        "e^(-i\u03c9t)",
        "1 / (i\u03c9)"
      ],
      "correctIndex": 1,
      "explanation": "The Fourier transform of \u03b4(t) is \u222b_{-\u221e}^\u221e \u03b4(t) e^(-i\u03c9t) dt. By the sifting property of the Dirac delta, evaluating at t = 0 yields e^0 = 1 across all frequencies."
    }
  ],
  "physics": [
    {
      "id": "phys-q1",
      "question": "What phenomenon occurs when an incident photon triggers an excited atom to drop to a lower state, releasing a second identical photon?",
      "options": [
        "Spontaneous emission",
        "Stimulated emission",
        "Photoelectric ionization",
        "Compton scattering"
      ],
      "correctIndex": 1,
      "explanation": "Stimulated emission (first postulated by Einstein) occurs when an incoming photon induces an excited atom to emit a photon with identical energy, phase, frequency, and polarization."
    },
    {
      "id": "phys-q2",
      "question": "What essential condition is required in an active laser medium to achieve optical amplification?",
      "options": [
        "Thermal equilibrium",
        "Population inversion (N\u2082 > N\u2081)",
        "Total internal reflection inside gas",
        "Zero bandgap"
      ],
      "correctIndex": 1,
      "explanation": "Population inversion occurs when the number of atoms in a higher meta-stable excited state (N\u2082) exceeds the number in the lower ground state (N\u2081), allowing stimulated emission to dominate over absorption."
    },
    {
      "id": "phys-q3",
      "question": "What is the formula for the Numerical Aperture (NA) of an optical fiber with core refractive index n\u2081 and cladding n\u2082?",
      "options": [
        "NA = n\u2081 - n\u2082",
        "NA = \u221a(n\u2081\u00b2 - n\u2082\u00b2)",
        "NA = (n\u2081 + n\u2082) / 2",
        "NA = n\u2082 / n\u2081"
      ],
      "correctIndex": 1,
      "explanation": "Numerical Aperture measures light-gathering ability: NA = sin(\u03b8_max) = \u221a(n\u2081\u00b2 - n\u2082\u00b2), where n\u2081 > n\u2082."
    },
    {
      "id": "phys-q4",
      "question": "What optical principle governs light guiding inside the core of a step-index optical fiber?",
      "options": [
        "Optical dispersion",
        "Total Internal Reflection (TIR)",
        "Birefringence",
        "Rayleigh scattering"
      ],
      "correctIndex": 1,
      "explanation": "Light rays entering within the acceptance angle undergo repeated Total Internal Reflection (TIR) at the core-cladding boundary because the core index is higher than the cladding index (n\u2081 > n\u2082)."
    },
    {
      "id": "phys-q5",
      "question": "Which of Maxwell's equations represents Faraday's Law of Electromagnetic Induction in differential form?",
      "options": [
        "\u2207 \u00b7 D = \u03c1",
        "\u2207 \u00b7 B = 0",
        "\u2207 \u00d7 E = -\u2202B/\u2202t",
        "\u2207 \u00d7 H = J + \u2202D/\u2202t"
      ],
      "correctIndex": 2,
      "explanation": "\u2207 \u00d7 E = -\u2202B/\u2202t expresses that a time-varying magnetic flux density B creates a circulating electric field E."
    },
    {
      "id": "phys-q6",
      "question": "What did James Clerk Maxwell add to Ampere's Law to account for changing electric fields in dielectric media?",
      "options": [
        "Magnetization current",
        "Displacement current density (J_d = \u2202D/\u2202t)",
        "Hall current",
        "Eddy current factor"
      ],
      "correctIndex": 1,
      "explanation": "Maxwell introduced displacement current density J_d = \u2202D/\u2202t = \u03b5\u2080(\u2202E/\u2202t) to maintain continuity of current in capacitors and predict propagating EM waves."
    },
    {
      "id": "phys-q7",
      "question": "What is the wave impedance of free space (vacuum) for plane electromagnetic waves?",
      "options": [
        "50 \u03a9",
        "120\u03c0 \u03a9 (\u2248 377 \u03a9)",
        "300 \u03a9",
        "0 \u03a9"
      ],
      "correctIndex": 1,
      "explanation": "Intrinsic impedance \u03b7\u2080 = \u221a(\u03bc\u2080/\u03b5\u2080) = 120\u03c0 \u2248 376.73 \u03a9, representing the ratio of electric field to magnetic field (E/H) in vacuum."
    },
    {
      "id": "phys-q8",
      "question": "What does the Poynting vector S = E \u00d7 H represent in electromagnetic field theory?",
      "options": [
        "Total electrostatic potential energy",
        "Direction and rate of electromagnetic energy flux per unit area (W/m\u00b2)",
        "Magnetic force on a stationary charge",
        "Vector displacement of polarization"
      ],
      "correctIndex": 1,
      "explanation": "The Poynting vector S = E \u00d7 H quantifies the directional energy flux density (power per unit area in Watts/m\u00b2) transported by an electromagnetic wave."
    },
    {
      "id": "phys-q9",
      "question": "What is the physical interpretation of the square of the wavefunction magnitude |\u03c8(x, t)|\u00b2 according to Max Born?",
      "options": [
        "Kinetic energy of the particle",
        "Probability density of locating the particle at position x at time t",
        "Momentum distribution",
        "Electric charge density"
      ],
      "correctIndex": 1,
      "explanation": "Born's statistical interpretation states that |\u03c8(x,t)|\u00b2 dx represents the probability of finding the particle in the infinitesimal interval dx at time t."
    },
    {
      "id": "phys-q10",
      "question": "For a particle of mass m in a 1D infinite potential well of width L (0 \u2264 x \u2264 L), what are the quantized energy levels E_n?",
      "options": [
        "E_n = n h / (2mL)",
        "E_n = n\u00b2 h\u00b2 / (8mL\u00b2)",
        "E_n = (n + 1/2) \u210f\u03c9",
        "E_n = -13.6 / n\u00b2 eV"
      ],
      "correctIndex": 1,
      "explanation": "Solving the time-independent Schr\u00f6dinger equation with boundary conditions \u03c8(0) = \u03c8(L) = 0 gives E_n = n\u00b2 \u03c0\u00b2 \u210f\u00b2 / (2mL\u00b2) = n\u00b2 h\u00b2 / (8mL\u00b2), n = 1, 2, 3..."
    },
    {
      "id": "phys-q11",
      "question": "What is the zero-point energy (ground state energy, n = 1) of a particle in an infinite potential well?",
      "options": [
        "0",
        "h\u00b2 / (8mL\u00b2)",
        "\u210f\u03c9 / 2",
        "Infinity"
      ],
      "correctIndex": 1,
      "explanation": "Because a trapped quantum particle cannot have zero momentum without violating Heisenberg's uncertainty principle (\u0394x \u0394p \u2265 \u210f/2), its ground state energy is non-zero: E\u2081 = h\u00b2 / (8mL\u00b2)."
    },
    {
      "id": "phys-q12",
      "question": "What quantum phenomenon allows particles to cross a potential energy barrier higher than their total mechanical energy?",
      "options": [
        "Quantum tunneling (Barrier penetration)",
        "Photoelectric effect",
        "Pair production",
        "Rayleigh scattering"
      ],
      "correctIndex": 0,
      "explanation": "Quantum tunneling occurs because the wavefunction does not abruptly terminate at the barrier but decays exponentially, giving a non-zero transmission probability through the barrier."
    },
    {
      "id": "phys-q13",
      "question": "What is the de Broglie wavelength \u03bb of a particle with momentum p?",
      "options": [
        "\u03bb = p / h",
        "\u03bb = h / p",
        "\u03bb = h \u00b7 p",
        "\u03bb = 2\u03c0 / p"
      ],
      "correctIndex": 1,
      "explanation": "De Broglie's hypothesis equates matter wavelength to Planck's constant divided by linear momentum: \u03bb = h / p = h / (mv)."
    },
    {
      "id": "phys-q14",
      "question": "According to Heisenberg's Uncertainty Principle, what is the lower bound for the product of position uncertainty \u0394x and momentum uncertainty \u0394p?",
      "options": [
        "\u0394x \u0394p \u2265 0",
        "\u0394x \u0394p \u2265 \u210f / 2",
        "\u0394x \u0394p = h \u00b7 c",
        "\u0394x \u0394p \u2264 \u210f"
      ],
      "correctIndex": 1,
      "explanation": "The rigorous Robertson-Schr\u00f6dinger uncertainty relation states that \u0394x \u0394p_x \u2265 \u210f / 2, where \u210f = h / (2\u03c0)."
    },
    {
      "id": "phys-q15",
      "question": "Which laser uses a gas mixture of Helium and Neon excited by electrical discharge, emitting predominantly at 632.8 nm?",
      "options": [
        "Ruby Laser",
        "He-Ne Laser",
        "Nd:YAG Laser",
        "CO\u2082 Laser"
      ],
      "correctIndex": 1,
      "explanation": "The Helium-Neon (He-Ne) four-level gas laser produces a continuous, highly monochromatic red beam at 632.8 nm via resonant energy transfer from excited He to Ne."
    },
    {
      "id": "phys-q16",
      "question": "What is the active lasing ion in a Ruby Laser rod (Al\u2082O\u2083:Cr\u00b3\u207a)?",
      "options": [
        "Aluminum ions (Al\u00b3\u207a)",
        "Oxygen ions (O\u00b2\u207b)",
        "Chromium ions (Cr\u00b3\u207a)",
        "Titanium ions (Ti\u00b3\u207a)"
      ],
      "correctIndex": 2,
      "explanation": "In a synthetic ruby crystal, Cr\u00b3\u207a ions replace a small fraction of Al\u00b3\u207a ions in the sapphire lattice, providing the energy levels for optical pumping and 694.3 nm red emission."
    },
    {
      "id": "phys-q17",
      "question": "What mechanism causes chromatic dispersion in optical communication fibers?",
      "options": [
        "Light of different wavelengths traveling at different phase velocities through the silica core",
        "Core microbending losses",
        "Fresnel reflection at connectors",
        "Absorption by water (OH\u207b) ions"
      ],
      "correctIndex": 0,
      "explanation": "Material dispersion arises because silica's refractive index n(\u03bb) varies with optical wavelength, causing different spectral components of a pulse to travel at different velocities and spread out in time."
    },
    {
      "id": "phys-q18",
      "question": "What is the Normalized Frequency parameter (V-number) cutoff for single-mode operation in a step-index fiber?",
      "options": [
        "V < 1.0",
        "V < 2.405",
        "V < 3.1415",
        "V > 10.0"
      ],
      "correctIndex": 1,
      "explanation": "For a step-index fiber, only the fundamental HE\u2081\u2081 mode propagates when V = (2\u03c0a/\u03bb) \u221a(n\u2081\u00b2 - n\u2082\u00b2) < 2.4048 (the first zero of Bessel function J\u2080)."
    },
    {
      "id": "phys-q19",
      "question": "What does the Skin Depth (\u03b4) of a good electrical conductor represent at high frequencies?",
      "options": [
        "The depth where the electric field amplitude drops to 1/e (\u2248 36.8%) of its surface value",
        "Total physical thickness of the metal",
        "Depth of zero electrical resistance",
        "Penetration distance of alpha particles"
      ],
      "correctIndex": 0,
      "explanation": "Skin depth \u03b4 = \u221a(2 / (\u03c9 \u03bc \u03c3)) is the penetration distance where the EM wave amplitude attenuates to 1/e (36.8%) of its surface amplitude due to eddy currents."
    },
    {
      "id": "phys-q20",
      "question": "In the Photoelectric Effect, increasing the frequency of incident light above the threshold frequency increases what property of emitted electrons?",
      "options": [
        "Number of photoelectrons emitted per second",
        "Maximum kinetic energy of photoelectrons (K_max = hf - \u03a6)",
        "Total charge of each electron",
        "Speed of the incident photons"
      ],
      "correctIndex": 1,
      "explanation": "Einstein's photoelectric equation K_max = hf - \u03a6 shows that increasing frequency f directly increases the maximum kinetic energy of the emitted electrons, while intensity controls the emission rate."
    },
    {
      "id": "phys-q21",
      "question": "What is the Bragg condition for constructive X-ray diffraction from crystal planes separated by interplanar spacing d?",
      "options": [
        "2d sin \u03b8 = n\u03bb",
        "d cos \u03b8 = n\u03bb",
        "2d = n\u03bb sin \u03b8",
        "d sin(2\u03b8) = \u03bb"
      ],
      "correctIndex": 0,
      "explanation": "Bragg's Law states that constructive interference between waves reflected from atomic crystal planes occurs when the path difference 2d sin \u03b8 equals an integer number of wavelengths n\u03bb."
    },
    {
      "id": "phys-q22",
      "question": "Which optical loss mechanism in silica fibers is caused by microscopic density and compositional fluctuations frozen into the glass matrix?",
      "options": [
        "Macrobending loss",
        "Rayleigh scattering loss (proportional to 1/\u03bb\u2074)",
        "Modal dispersion",
        "Core eccentricity loss"
      ],
      "correctIndex": 1,
      "explanation": "Rayleigh scattering is an intrinsic loss mechanism caused by sub-wavelength density fluctuations in fused silica, scaling inversely with the fourth power of wavelength (1/\u03bb\u2074)."
    },
    {
      "id": "phys-q23",
      "question": "What is the phase difference between electric field E and magnetic field B in a propagating plane EM wave in free space?",
      "options": [
        "90\u00b0 (\u03c0/2 radians)",
        "180\u00b0 (\u03c0 radians)",
        "0\u00b0 (in phase)",
        "45\u00b0 (\u03c0/4 radians)"
      ],
      "correctIndex": 2,
      "explanation": "In non-conducting media (vacuum/dielectrics), the electric field E and magnetic field B vectors reach their maxima and minima simultaneously, meaning they are completely in phase."
    },
    {
      "id": "phys-q24",
      "question": "What is Brewster's angle \u03b8_B for light incident from air into glass with refractive index n = 1.5?",
      "options": [
        "30\u00b0",
        "45\u00b0",
        "56.3\u00b0 (tan \u03b8_B = n)",
        "90\u00b0"
      ],
      "correctIndex": 2,
      "explanation": "Brewster's angle satisfies tan(\u03b8_B) = n\u2082 / n\u2081 = 1.5 / 1.0 = 1.5, giving \u03b8_B = arctan(1.5) \u2248 56.31\u00b0, where reflected light is completely polarized perpendicular to the plane of incidence."
    },
    {
      "id": "phys-q25",
      "question": "What is the Fermi-Dirac distribution function f(E) representing in solid state physics?",
      "options": [
        "Probability of finding a photon at energy E",
        "Probability that an available electron state at energy E is occupied at temperature T",
        "Density of states in the conduction band",
        "Velocity distribution of gas molecules"
      ],
      "correctIndex": 1,
      "explanation": "The Fermi-Dirac distribution f(E) = 1 / [1 + e^((E - E_F)/(k_B T))] calculates the thermodynamic probability that a fermion state at energy E is occupied at absolute temperature T."
    }
  ],
  "sensors-transducers": [
    {
      "id": "sens-q1",
      "question": "What type of transducer is an LVDT (Linear Variable Differential Transformer)?",
      "options": [
        "Capacitive transducer",
        "Inductive transducer operating on mutual inductance variation",
        "Piezoelectric generator",
        "Thermoelectric junction"
      ],
      "correctIndex": 1,
      "explanation": "An LVDT is an inductive displacement transducer that uses a movable permeable magnetic core to vary the mutual inductance between a primary winding and two secondary windings."
    },
    {
      "id": "sens-q2",
      "question": "Why are the two secondary windings of an LVDT connected in series opposition (S\u2081 - S\u2082)?",
      "options": [
        "To double the excitation frequency",
        "To produce a differential output that is zero (null voltage) at the center position",
        "To eliminate primary core losses",
        "To convert DC input into AC output"
      ],
      "correctIndex": 1,
      "explanation": "Connecting the secondary coils in series opposition ensures that their induced voltages cancel out at the mechanical center position, creating a clear reference null and bipolar directional output."
    },
    {
      "id": "sens-q3",
      "question": "What is the primary cause of residual null voltage in an LVDT at its physical center position?",
      "options": [
        "Excessive core friction",
        "Harmonics in excitation source and stray magnetic/capacitive coupling",
        "Galvanic corrosion",
        "High resistance of secondary wire"
      ],
      "correctIndex": 1,
      "explanation": "Residual null voltage is caused by imperfect magnetic symmetry, stray inter-winding capacitance, and odd harmonic distortions in the AC excitation voltage."
    },
    {
      "id": "sens-q4",
      "question": "What is the definition of the Gauge Factor (GF) of an electrical resistance strain gauge?",
      "options": [
        "GF = (\u0394R / R) / (\u0394L / L)",
        "GF = (\u0394L / L) / (\u0394R / R)",
        "GF = \u0394R \u00b7 \u0394L",
        "GF = R / (Poisson ratio)"
      ],
      "correctIndex": 0,
      "explanation": "Gauge Factor is defined as fractional change in electrical resistance per unit mechanical strain: GF = (\u0394R / R) / \u03b5 = (\u0394R / R) / (\u0394L / L) = 1 + 2\u03bd + (\u0394\u03c1/\u03c1)/\u03b5."
    },
    {
      "id": "sens-q5",
      "question": "What is the typical gauge factor of standard metallic foil strain gauges made of Constantan alloy?",
      "options": [
        "0.1 to 0.5",
        "2.0 to 2.1",
        "100 to 150",
        "1000"
      ],
      "correctIndex": 1,
      "explanation": "Metallic Constantan (Copper-Nickel) foil strain gauges have a stable gauge factor of approximately 2.0 to 2.1, with minimal temperature coefficient of resistance."
    },
    {
      "id": "sens-q6",
      "question": "Why is a 'dummy gauge' used in a quarter-bridge Wheatstone strain measurement circuit?",
      "options": [
        "To double the mechanical sensitivity",
        "To compensate for resistance changes caused by ambient temperature variations",
        "To rectify the bridge output from AC to DC",
        "To measure transverse shear stress"
      ],
      "correctIndex": 1,
      "explanation": "A dummy gauge is mounted on an unstressed piece of identical material subject to the same temperature environment, cancelling out thermal drift in the adjacent bridge arm."
    },
    {
      "id": "sens-q7",
      "question": "What is the nominal resistance of a standard industrial Pt100 RTD at 0\u00b0C?",
      "options": [
        "10 \u03a9",
        "50 \u03a9",
        "100 \u03a9",
        "1000 \u03a9"
      ],
      "correctIndex": 2,
      "explanation": "By definition, a Pt100 RTD has a nominal resistance of exactly 100.00 \u03a9 at 0\u00b0C (32\u00b0F) using pure platinum wire with a temperature coefficient \u03b1 \u2248 0.00385 \u03a9/\u03a9/\u00b0C."
    },
    {
      "id": "sens-q8",
      "question": "Why is a 4-wire RTD connection preferred over a 2-wire configuration in high-precision temperature measurements?",
      "options": [
        "It supplies higher current to heat the RTD",
        "It completely eliminates measurement errors caused by lead-wire resistances",
        "It removes the need for an analog-to-digital converter",
        "It generates an optical frequency output"
      ],
      "correctIndex": 1,
      "explanation": "In a 4-wire Kelvin connection, current is supplied through two dedicated leads, while high-impedance voltage sense leads draw virtually zero current, eliminating lead resistance error."
    },
    {
      "id": "sens-q9",
      "question": "Which thermoelectric effect is the fundamental operating principle of thermocouples?",
      "options": [
        "Seebeck effect",
        "Peltier effect",
        "Thomson effect",
        "Hall effect"
      ],
      "correctIndex": 0,
      "explanation": "The Seebeck effect generates an electromotive force (EMF) in an electrical circuit consisting of two dissimilar conductors when their junctions are held at different temperatures."
    },
    {
      "id": "sens-q10",
      "question": "What is the composition of the positive and negative legs of a standard Type K thermocouple?",
      "options": [
        "Copper and Constantan",
        "Chromel (Ni-Cr) and Alumel (Ni-Al)",
        "Iron and Constantan",
        "Platinum and Rhodium"
      ],
      "correctIndex": 1,
      "explanation": "Type K thermocouples consist of a positive Chromel leg (90% Ni, 10% Cr) and a negative Alumel leg (95% Ni, 2% Al, 2% Mn, 1% Si), operating from -200\u00b0C to +1260\u00b0C."
    },
    {
      "id": "sens-q11",
      "question": "Why is Cold Junction Compensation (CJC) required when measuring temperature with a thermocouple?",
      "options": [
        "To prevent the junction from melting",
        "Because the thermocouple EMF is proportional to the temperature difference between the measuring hot junction and the reference cold junction",
        "To amplify the thermocouple signal from microvolts to volts",
        "To convert temperature into capacitance"
      ],
      "correctIndex": 1,
      "explanation": "Thermocouples measure relative temperature difference (T_hot - T_cold). CJC measures the reference terminal temperature with an RTD/thermistor and adds the corresponding EMF offset."
    },
    {
      "id": "sens-q12",
      "question": "Which type of materials generate an electrical charge when subjected to mechanical stress (Piezoelectric effect)?",
      "options": [
        "Non-centrosymmetric crystalline materials like Quartz, Rochelle salt, and PZT ceramics",
        "Pure metallic copper and silver",
        "Amorphous molten glass",
        "Ferrite magnets"
      ],
      "correctIndex": 0,
      "explanation": "Piezoelectricity occurs in non-centrosymmetric crystals (such as Quartz, BaTiO\u2083, and PZT) where mechanical deformation shifts internal ionic dipoles to create surface charges."
    },
    {
      "id": "sens-q13",
      "question": "Why cannot piezoelectric transducers measure purely static (constant DC) pressures or displacements?",
      "options": [
        "Piezoelectric materials crack under steady loads",
        "The generated electrostatic charge leaks away through the crystal and amplifier input resistance",
        "Their Curie temperature drops to absolute zero under static load",
        "They only operate under ultrasound frequencies"
      ],
      "correctIndex": 1,
      "explanation": "Piezoelectric sensors act as charge generators with internal capacitance. Under static loads, the finite input impedance of cables and amplifiers drains the charge, limiting use to dynamic measurements."
    },
    {
      "id": "sens-q14",
      "question": "What is the Curie Temperature of a piezoelectric or ferromagnetic material?",
      "options": [
        "The melting point of the crystal",
        "The temperature above which the material permanently loses its piezoelectric and spontaneous polarization properties",
        "The temperature where electrical resistivity becomes zero",
        "The boiling point of liquid nitrogen"
      ],
      "correctIndex": 1,
      "explanation": "The Curie temperature is the critical threshold above which thermal agitation destroys the crystal lattice's spontaneous electric dipole alignment, permanently demagnetizing/depolarizing it."
    },
    {
      "id": "sens-q15",
      "question": "What type of operational amplifier circuit is the AD620 monolithic integrated circuit?",
      "options": [
        "Inverting summing amplifier",
        "High-precision instrumentation amplifier using a classic 3-op-amp topology",
        "Logarithmic converter",
        "Voltage-controlled oscillator"
      ],
      "correctIndex": 1,
      "explanation": "The AD620 is a low-power, high-accuracy instrumentation amplifier with a 3-op-amp architecture whose differential gain is programmed from 1 to 10,000 using a single external resistor R_G."
    },
    {
      "id": "sens-q16",
      "question": "What formula calculates the voltage gain G of an AD620 instrumentation amplifier using external gain resistor R_G?",
      "options": [
        "G = 1 + (49.4 k\u03a9 / R_G)",
        "G = R_G / 49.4 k\u03a9",
        "G = 49.4 k\u03a9 \u00b7 R_G",
        "G = 1 + (R_G / 100 k\u03a9)"
      ],
      "correctIndex": 0,
      "explanation": "The internal feedback resistors of the AD620 are 24.7 k\u03a9 each (total 49.4 k\u03a9). The gain equation is G = 1 + (49.4 k\u03a9 / R_G)."
    },
    {
      "id": "sens-q17",
      "question": "Why is Common-Mode Rejection Ratio (CMRR) a vital metric for sensor instrumentation amplifiers?",
      "options": [
        "It measures how fast the op-amp slews",
        "It measures the amplifier's ability to reject common noise (e.g. 50/60 Hz mains hum) picked up equally by both signal leads",
        "It specifies the maximum output current",
        "It determines the bandwidth of the ADC"
      ],
      "correctIndex": 1,
      "explanation": "CMRR = 20 log\u2081\u2080(A_d / A_cm). A high CMRR (> 100 dB) ensures that large common-mode electrical noise voltages induced on both leads are suppressed while amplifying microvolt sensor signals."
    },
    {
      "id": "sens-q18",
      "question": "Why is 4-20 mA current loop standard preferred over 0-10 V voltage transmission in industrial process plants?",
      "options": [
        "Current loops require heavy three-phase power",
        "Current is immune to voltage drops over long cable runs and 4 mA live-zero provides broken-wire detection",
        "Current signals travel faster than light",
        "Voltage signals cannot drive displays"
      ],
      "correctIndex": 1,
      "explanation": "Current signals do not drop across line resistance. The 4 mA 'live zero' powers two-wire field transmitters and immediately indicates open-circuit cable faults if current falls to 0 mA."
    },
    {
      "id": "sens-q19",
      "question": "In a Venturi flowmeter, fluid velocity increases at the throat constriction, causing what effect on static pressure (Bernoulli's principle)?",
      "options": [
        "Static pressure increases",
        "Static pressure decreases (creating a differential pressure \u0394P proportional to flow squared)",
        "Static pressure stays constant",
        "Fluid density becomes zero"
      ],
      "correctIndex": 1,
      "explanation": "By Bernoulli's conservation of energy: as velocity increases in the narrow throat, static pressure drops. The differential pressure \u0394P measured between inlet and throat is proportional to volumetric flow squared."
    },
    {
      "id": "sens-q20",
      "question": "What sensor uses the Doppler shift or transit-time difference of high-frequency acoustic waves to measure volumetric liquid flow in pipes?",
      "options": [
        "Ultrasonic flowmeter",
        "Rotameter",
        "Bimetallic strip",
        "Bourdon tube"
      ],
      "correctIndex": 0,
      "explanation": "Ultrasonic flowmeters transmit acoustic pulses diagonally across a pipe. The difference in transit time between downstream and upstream acoustic pulses is directly proportional to mean flow velocity."
    },
    {
      "id": "sens-q21",
      "question": "What is the operating principle of a capacitive level sensor used in non-conductive liquid tanks?",
      "options": [
        "Liquid acts as a changing dielectric material between two metallic probe plates as level rises",
        "Liquid changes the electrical inductance of a transformer",
        "Liquid generates gamma radiation",
        "Liquid rotates a turbine rotor"
      ],
      "correctIndex": 0,
      "explanation": "As tank level rises, liquid (with dielectric constant \u03b5_r > 1) displaces air (\u03b5_r \u2248 1) between the probe electrodes, linearly increasing total capacitance: C = \u03b5\u2080(\u03b5_r h + (H-h))/d."
    },
    {
      "id": "sens-q22",
      "question": "What type of optical sensor uses a light source and a photodetector separated by an air gap to detect the presence or edge of an opaque object?",
      "options": [
        "Optical interrupter (photo-interrupter / slotted optocoupler)",
        "Linear resolver",
        "Strain rosette",
        "Thermistor NTC"
      ],
      "correctIndex": 0,
      "explanation": "An optical interrupter consists of an infrared LED and a phototransistor facing each other across a slot. Passing objects break the infrared optical beam, switching the output state."
    },
    {
      "id": "sens-q23",
      "question": "What is the difference between Negative Temperature Coefficient (NTC) and Positive Temperature Coefficient (PTC) thermistors?",
      "options": [
        "NTC resistance decreases as temperature increases; PTC resistance increases as temperature increases",
        "NTC operates on AC, PTC operates on DC",
        "PTC has higher accuracy than RTDs at all temperatures",
        "NTC is made of platinum, PTC of ceramic"
      ],
      "correctIndex": 0,
      "explanation": "NTC semiconductor oxide thermistors exhibit an exponential drop in resistance with rising temperature due to thermal charge carrier excitation. PTC devices exhibit sharp resistance rise above switching temperatures."
    },
    {
      "id": "sens-q24",
      "question": "What primary pressure sensing element uses an elliptical-cross-section C-shaped hollow metallic tube that straightens under internal pressure?",
      "options": [
        "Bourdon tube",
        "Diaphragm capsule",
        "Piezoelectric crystal",
        "Bellows gauge"
      ],
      "correctIndex": 0,
      "explanation": "The Bourdon tube is an elastic pressure element. Fluid pressure applied inside the curved elliptical tube forces its cross-section toward a circle, causing the free closed tip to straighten proportionally."
    },
    {
      "id": "sens-q25",
      "question": "What is the primary role of a Smart Transmitter in modern Fieldbus / HART industrial instrumentation networks?",
      "options": [
        "It only converts mechanical motion into pneumatic air pressure",
        "It integrates primary sensing, microprocessor-based linearization, digital self-diagnostics, calibration, and HART digital communication over 4-20 mA lines",
        "It replaces the plant master DCS controller",
        "It eliminates the need for power supplies"
      ],
      "correctIndex": 1,
      "explanation": "Smart Transmitters house internal ADCs, DSP microprocessors, and flash memory to linearize sensor curves, perform continuous self-diagnostics, and communicate digital PV/status over standard 4-20 mA loops using HART."
    }
  ],
  "control-systems": [
    {
      "id": "ctrl-q1",
      "question": "What is the transfer function G(s) of a linear time-invariant (LTI) system defined as?",
      "options": [
        "Ratio of input to output in time domain",
        "Laplace transform of output to Laplace transform of input under zero initial conditions",
        "Product of poles and zeros",
        "Integral of the system step response"
      ],
      "correctIndex": 1,
      "explanation": "The transfer function G(s) = Y(s) / U(s) is the ratio of the Laplace transform of the output to the Laplace transform of the input, evaluated assuming all initial conditions are zero."
    },
    {
      "id": "ctrl-q2",
      "question": "For a continuous LTI system to be bounded-input bounded-output (BIBO) stable, where must all closed-loop poles lie in the complex s-plane?",
      "options": [
        "On the imaginary axis (j\u03c9 axis)",
        "Strictly in the open Left-Half of the s-plane (Re(s) < 0)",
        "Strictly in the Right-Half of the s-plane (Re(s) > 0)",
        "Inside the unit circle on the s-plane"
      ],
      "correctIndex": 1,
      "explanation": "Closed-loop poles in the left-half s-plane have negative real parts (\u03c3 < 0), causing exponential impulse response terms e^(\u03c3t) to decay to zero as t \u2192 \u221e."
    },
    {
      "id": "ctrl-q3",
      "question": "According to the Routh-Hurwitz stability criterion, an LTI system is stable if and only if which condition is met?",
      "options": [
        "All entries in the first column of the Routh array are strictly positive (no sign changes)",
        "The highest order coefficient is equal to 1",
        "The first row has alternating positive and negative values",
        "The determinant of the plant matrix is zero"
      ],
      "correctIndex": 0,
      "explanation": "The Routh-Hurwitz criterion states that the number of sign changes in the first column of the Routh array equals the number of roots in the right-half s-plane. Zero sign changes guarantees asymptotic stability."
    },
    {
      "id": "ctrl-q4",
      "question": "For a standard prototype second-order system G(s) = \u03c9_n\u00b2 / (s\u00b2 + 2\u03b6\u03c9_n s + \u03c9_n\u00b2), what type of transient response occurs when damping ratio \u03b6 = 1?",
      "options": [
        "Underdamped response (oscillatory)",
        "Critically damped response (fastest non-oscillatory return)",
        "Overdamped response",
        "Sustained undamped oscillations"
      ],
      "correctIndex": 1,
      "explanation": "When \u03b6 = 1, the characteristic roots are real and repeated (s = -\u03c9_n, -\u03c9_n), producing a critically damped transient response that reaches steady-state as fast as possible without overshoot."
    },
    {
      "id": "ctrl-q5",
      "question": "What formula calculates the percentage maximum overshoot (%OS) of an underdamped second-order system with damping ratio \u03b6?",
      "options": [
        "%OS = e^(-\u03b6\u03c0 / \u221a(1 - \u03b6\u00b2)) \u00d7 100%",
        "%OS = 1 - \u03b6\u00b2",
        "%OS = 4 / (\u03b6\u03c9_n)",
        "%OS = \u03c0 / (\u03c9_n \u221a(1 - \u03b6\u00b2))"
      ],
      "correctIndex": 0,
      "explanation": "Evaluating the step response peak at peak time t_p = \u03c0 / \u03c9_d yields the peak value 1 + e^(-\u03b6\u03c0/\u221a(1-\u03b6\u00b2)). Subtracting 1 and multiplying by 100% gives %OS = e^(-\u03b6\u03c0/\u221a(1-\u03b6\u00b2)) \u00d7 100%."
    },
    {
      "id": "ctrl-q6",
      "question": "What is the 2% settling time (t_s) approximation for an underdamped second-order system?",
      "options": [
        "t_s \u2248 4 / (\u03b6 \u03c9_n)",
        "t_s \u2248 \u03c0 / (\u03b6 \u03c9_n)",
        "t_s \u2248 1 / (2\u03b6)",
        "t_s \u2248 2.2 / \u03c9_n"
      ],
      "correctIndex": 0,
      "explanation": "The transient envelope decays as e^(-\u03b6\u03c9_n t). For the envelope to drop to 2% (0.02 \u2248 e^(-4)), the settling time requires \u03b6\u03c9_n t_s \u2248 4, so t_s \u2248 4 / (\u03b6 \u03c9_n)."
    },
    {
      "id": "ctrl-q7",
      "question": "What is the steady-state error e_ss of a Type 1 control system subjected to a unit step input?",
      "options": [
        "e_ss = 0",
        "e_ss = 1 / (1 + K_p)",
        "e_ss = 1 / K_v",
        "e_ss = Infinity"
      ],
      "correctIndex": 0,
      "explanation": "A Type 1 system contains an open-loop integrator (s = 0 in denominator). The positional error constant K_p = lim_{s\u21920} G(s) = \u221e, resulting in e_ss = 1 / (1 + K_p) = 1 / (1 + \u221e) = 0."
    },
    {
      "id": "ctrl-q8",
      "question": "What is the steady-state velocity error constant K_v defined as for an open-loop transfer function G(s)H(s)?",
      "options": [
        "K_v = lim_{s\u21920} s G(s)H(s)",
        "K_v = lim_{s\u21920} G(s)H(s)",
        "K_v = lim_{s\u21920} s\u00b2 G(s)H(s)",
        "K_v = dG/ds at s=0"
      ],
      "correctIndex": 0,
      "explanation": "The velocity error constant is defined by K_v = lim_{s\u21920} s \u00b7 G(s)H(s). For a unit ramp input r(t) = t, the steady-state tracking error is e_ss = 1 / K_v."
    },
    {
      "id": "ctrl-q9",
      "question": "In a Bode magnitude plot, what is the slope of the high-frequency asymptote contributed by a single first-order pole (1 / (1 + sT))?",
      "options": [
        "+20 dB/decade",
        "-20 dB/decade (-6 dB/octave)",
        "-40 dB/decade",
        "0 dB/decade"
      ],
      "correctIndex": 1,
      "explanation": "Above the corner break frequency \u03c9 = 1/T, the magnitude of a single real pole drops by a factor of 10 for each decade increase in frequency: 20 log\u2081\u2080(1/10) = -20 dB/decade."
    },
    {
      "id": "ctrl-q10",
      "question": "What is the Phase Margin (PM) of a feedback control system defined as on a Bode plot?",
      "options": [
        "PM = 180\u00b0 + \u2220G(j\u03c9_gc)",
        "PM = -180\u00b0 - \u2220G(j\u03c9_pc)",
        "PM = |G(j\u03c9_gc)| in dB",
        "PM = 90\u00b0 - \u2220G(j\u03c9_gc)"
      ],
      "correctIndex": 0,
      "explanation": "Phase Margin measures stability margin at the gain crossover frequency \u03c9_gc (where |G(j\u03c9_gc)| = 1 or 0 dB): PM = 180\u00b0 + \u2220G(j\u03c9_gc). Positive PM (> 30\u00b0-60\u00b0) indicates stability."
    },
    {
      "id": "ctrl-q11",
      "question": "What is the Gain Margin (GM) of a feedback system evaluated at phase crossover frequency \u03c9_pc (where phase \u2220G(j\u03c9) = -180\u00b0)?",
      "options": [
        "GM (dB) = -20 log\u2081\u2080 |G(j\u03c9_pc)|",
        "GM (dB) = +20 log\u2081\u2080 |G(j\u03c9_pc)|",
        "GM = \u2220G(j\u03c9_pc) / 180\u00b0",
        "GM = 1 - |G(j\u03c9_pc)|"
      ],
      "correctIndex": 0,
      "explanation": "Gain Margin is the reciprocal of the system open-loop magnitude at the phase crossover frequency: GM = 1 / |G(j\u03c9_pc)|, or in decibels: GM (dB) = -20 log\u2081\u2080 |G(j\u03c9_pc)|."
    },
    {
      "id": "ctrl-q12",
      "question": "What is the Nyquist stability criterion formula relating closed-loop right-half plane poles Z to open-loop RHP poles P and contour encirclements N of (-1 + j0)?",
      "options": [
        "Z = P - N",
        "Z = P + N",
        "N = Z \u00b7 P",
        "Z = N - P"
      ],
      "correctIndex": 1,
      "explanation": "The Nyquist criterion states that Z = P + N (or N = Z - P, where N is the number of clockwise encirclements of the critical -1 point). For closed-loop stability (Z = 0), N must equal -P (counter-clockwise)."
    },
    {
      "id": "ctrl-q13",
      "question": "On the Root Locus plot, where do root locus branches originate and terminate as loop gain K increases from 0 to \u221e?",
      "options": [
        "Originate at open-loop zeros and terminate at open-loop poles",
        "Originate at open-loop poles (K=0) and terminate at open-loop zeros or infinity (K=\u221e)",
        "Originate and terminate at the origin s = 0",
        "Stay stationary on the j\u03c9 axis"
      ],
      "correctIndex": 1,
      "explanation": "Root locus branches begin at the open-loop poles when K = 0 and trace the trajectory of closed-loop roots toward open-loop zeros (or asymptotic infinity) as K \u2192 \u221e."
    },
    {
      "id": "ctrl-q14",
      "question": "What control action does the Integral term (I) contribute in a PID controller?",
      "options": [
        "Anticipates future error trends",
        "Eliminates steady-state offset error by accumulating past error over time",
        "Increases transient overshoot and high-frequency noise",
        "Reduces loop gain to zero"
      ],
      "correctIndex": 1,
      "explanation": "The integral mode u_I(t) = K_i \u222b e(t) dt ramps up control effort as long as any non-zero error persists, driving steady-state error e_ss to zero in closed-loop systems."
    },
    {
      "id": "ctrl-q15",
      "question": "What primary benefit does Derivative action (D) provide in a PID controller?",
      "options": [
        "Removes DC offsets completely",
        "Provides anticipatory phase lead and adds damping to reduce overshoot and settling time",
        "Reduces sensor noise amplification",
        "Inverts control action for reverse-acting valves"
      ],
      "correctIndex": 1,
      "explanation": "Derivative control u_D(t) = K_d (de/dt) responds to the rate of error change, introducing phase lead and predictive damping that reduces oscillations and peak overshoot."
    },
    {
      "id": "ctrl-q16",
      "question": "In the Ziegler-Nichols frequency response tuning method, if the ultimate gain is K_u and ultimate period is P_u, what are the classic PID tuning values?",
      "options": [
        "K_p = 0.6 K_u, T_i = 0.5 P_u, T_d = 0.125 P_u",
        "K_p = 0.5 K_u, T_i = P_u, T_d = 0.5 P_u",
        "K_p = K_u, T_i = 0, T_d = 0",
        "K_p = 0.2 K_u, T_i = 2 P_u, T_d = P_u"
      ],
      "correctIndex": 0,
      "explanation": "The classic Ziegler-Nichols closed-loop rules prescribe: K_p = 0.6 K_u, Integral time T_i = 0.5 P_u, and Derivative time T_d = 0.125 P_u (1/8 P_u)."
    },
    {
      "id": "ctrl-q17",
      "question": "What is a major practical drawback of pure derivative control (K_d \u00b7 s) when implemented in real-world industrial controllers?",
      "options": [
        "It causes steady-state tracking error",
        "It amplifies high-frequency measurement noise (necessitating a low-pass filter on the derivative term)",
        "It slows down the closed-loop bandwidth",
        "It requires 100V power rails"
      ],
      "correctIndex": 1,
      "explanation": "Because differentiation multiplies magnitude by frequency (magnitude = \u03c9 K_d), pure derivative action amplifies high-frequency electrical noise, requiring practical filtered derivatives: s / (1 + s T_f)."
    },
    {
      "id": "ctrl-q18",
      "question": "In state-space modern control theory, what are the standard state and output equations for continuous LTI systems?",
      "options": [
        "x\u0307 = Ax + Bu, y = Cx + Du",
        "x = Ax\u0307 + Bu, y = Cx",
        "x\u0308 = Ax + Bu, y = Dx",
        "x = A\u207b\u00b9u, y = Bx"
      ],
      "correctIndex": 0,
      "explanation": "The canonical state-space representation uses state equation x\u0307(t) = Ax(t) + Bu(t) and output equation y(t) = Cx(t) + Du(t), where A is system matrix, B is input matrix, C is output matrix, and D is feedthrough."
    },
    {
      "id": "ctrl-q19",
      "question": "According to Kalman's rank condition, an LTI system (A, B) with n states is completely controllable if and only if the controllability matrix has what rank?",
      "options": [
        "Rank equal to 0",
        "Rank equal to n (Controllability matrix [B | AB | A\u00b2B | ... | A^(n-1)B] has full rank n)",
        "Rank equal to 1",
        "Rank equal to n\u00b2"
      ],
      "correctIndex": 1,
      "explanation": "Kalman's Controllability Theorem requires the n \u00d7 (n\u00b7m) controllability matrix Q_c = [B | AB | A\u00b2B | ... | A^(n-1)B] to have full row rank equal to n."
    },
    {
      "id": "ctrl-q20",
      "question": "What condition must hold for an LTI system (A, C) with n state variables to be completely observable?",
      "options": [
        "The observability matrix [C\u1d40 | A\u1d40C\u1d40 | ... | (A\u1d40)^(n-1)C\u1d40] has full column rank n",
        "det(A) must equal 1",
        "B must be a diagonal matrix",
        "All eigenvalues of A must be negative"
      ],
      "correctIndex": 0,
      "explanation": "Observability requires that state variables can be reconstructed from output measurements y(t), guaranteed if and only if the observability matrix Q_o has full rank n."
    },
    {
      "id": "ctrl-q21",
      "question": "What type of controller is designed using full state feedback u = -Kx to place closed-loop poles at arbitrarily desired locations (Ackermann's formula)?",
      "options": [
        "Pole placement state-feedback controller",
        "Feedforward lag filter",
        "Bang-bang on-off controller",
        "Open-loop stepped compensator"
      ],
      "correctIndex": 0,
      "explanation": "If a system is completely controllable, state feedback control law u = -Kx allows all n closed-loop poles (roots of det(sI - (A - BK)) = 0) to be positioned at specified locations using Ackermann's formula."
    },
    {
      "id": "ctrl-q22",
      "question": "What is the primary industrial function of a Programmable Logic Controller (PLC) in factory automation?",
      "options": [
        "Scientific fluid dynamics simulation",
        "Robust, deterministic execution of sequential discrete logic, timers, counters, and PID loops in harsh industrial environments",
        "Graphics rendering for CAD systems",
        "Personal desktop document processing"
      ],
      "correctIndex": 1,
      "explanation": "PLCs are industrially hardened microcomputers engineered for real-time cyclic scanning, executing discrete I/O logic (ladder diagram), interlocking, safety sequences, and process loops with millisecond determinism."
    },
    {
      "id": "ctrl-q23",
      "question": "In PLC Ladder Logic programming, what does a Normally Open (NO) contact instruction ('--[ ]--') evaluate to when its associated memory bit is 1 (True)?",
      "options": [
        "False (Open circuit / logic 0)",
        "True (Closed circuit / passes logic power / logic 1)",
        "High impedance floating state",
        "Reset command"
      ],
      "correctIndex": 1,
      "explanation": "In ladder logic, a Normally Open contact ('Examine if Closed' / XIC) acts as a virtual switch that closes (passes power rung logic) when its addressed bit is energized (logic 1)."
    },
    {
      "id": "ctrl-q24",
      "question": "In industrial process control, what is a Distributed Control System (DCS) primarily designed for compared to standalone PLCs?",
      "options": [
        "Controlling single standalone machines like packaging presses",
        "Plant-wide regulatory control of continuous analog processes (e.g. oil refineries, chemical plants) with integrated historian, redundant controllers, and centralized operator consoles",
        "Mobile phone application development",
        "Office accounting networks"
      ],
      "correctIndex": 1,
      "explanation": "A DCS distributes autonomous multi-loop controllers throughout large-scale continuous manufacturing facilities, connected via high-reliability redundant networks with centralized alarm and supervisory screens."
    },
    {
      "id": "ctrl-q25",
      "question": "What is the purpose of anti-windup schemes in industrial PID controllers?",
      "options": [
        "To speed up derivative action during startup",
        "To prevent integrator term saturation when actuators (e.g. control valves) hit their physical 100% or 0% limits",
        "To invert sensor voltage polarity",
        "To increase steady-state tracking offset"
      ],
      "correctIndex": 1,
      "explanation": "When an actuator hits its physical limit (saturation), error persists and the integrator keeps accumulating (winding up), causing huge lag and overshoot when setpoint changes. Anti-windup clamps or halts integration during saturation."
    }
  ],
  "programming": [
    {
      "id": "prog-q1",
      "question": "In C, what is the value and type of (ptr + 1) if ptr is a pointer to an integer (int *ptr = 1000) on a 32/64-bit architecture where sizeof(int) is 4 bytes?",
      "options": [
        "1001",
        "1004",
        "1002",
        "1008"
      ],
      "correctIndex": 1,
      "explanation": "Pointer arithmetic in C scales by the size of the referenced data type: (ptr + 1) = 1000 + 1 \u00d7 sizeof(int) = 1000 + 4 = 1004."
    },
    {
      "id": "prog-q2",
      "question": "What is the key difference between malloc() and calloc() memory allocation functions in standard C library?",
      "options": [
        "malloc() allocates on stack; calloc() on heap",
        "calloc() initializes all allocated bytes to zero; malloc() leaves memory uninitialized (garbage values)",
        "malloc() takes two arguments; calloc() takes one",
        "calloc() cannot be freed with free()"
      ],
      "correctIndex": 1,
      "explanation": "malloc(size) allocates contiguous heap memory leaving contents indeterminate; calloc(num, size) allocates memory and explicitly zero-initializes all bytes."
    },
    {
      "id": "prog-q3",
      "question": "What serious software defect occurs when dynamic heap memory allocated with malloc() is never deallocated using free()?",
      "options": [
        "Stack overflow",
        "Memory leak (wasting available system RAM)",
        "Dangling pointer",
        "Buffer underrun"
      ],
      "correctIndex": 1,
      "explanation": "A memory leak happens when dynamically allocated heap blocks lose all references without being released via free(), permanently consuming RAM until application termination."
    },
    {
      "id": "prog-q4",
      "question": "What is a 'dangling pointer' in C programming?",
      "options": [
        "A pointer initialized to NULL",
        "A pointer pointing to a memory location that has already been deallocated/freed",
        "A pointer pointing to another pointer",
        "A void pointer with no type"
      ],
      "correctIndex": 1,
      "explanation": "A dangling pointer holds the address of memory that has been deallocated (via free() or stack frame exit). Dereferencing it causes undefined behavior or memory corruption."
    },
    {
      "id": "prog-q5",
      "question": "What bitwise expression clears (sets to 0) the k-th bit of an integer variable x (0-indexed)?",
      "options": [
        "x = x | (1 << k)",
        "x = x & ~(1 << k)",
        "x = x ^ (1 << k)",
        "x = x >> k"
      ],
      "correctIndex": 1,
      "explanation": "Constructing mask ~(1 << k) creates ones everywhere except at position k. Bitwise ANDing x with this mask forces bit k to 0 while keeping all other bits unchanged."
    },
    {
      "id": "prog-q6",
      "question": "What does the bitwise expression (x & (x - 1)) evaluate to for any positive integer x?",
      "options": [
        "Clears the lowest set bit (rightmost 1-bit) of x",
        "Multiplies x by 2",
        "Inverts all bits of x",
        "Finds the parity of x"
      ],
      "correctIndex": 0,
      "explanation": "Subtracting 1 flips the rightmost set bit and all bits to its right. ANDing with x zeroes out this lowest set bit, an algorithm used in Brian Kernighan's bit-counting method."
    },
    {
      "id": "prog-q7",
      "question": "Why does a C structure containing 'char a; int b;' typically occupy 8 bytes rather than 5 bytes on a 32/64-bit architecture?",
      "options": [
        "Compiler error",
        "Structure padding and natural memory alignment for fast CPU bus access",
        "Char takes 4 bytes in modern C",
        "Virtual function table overhead"
      ],
      "correctIndex": 1,
      "explanation": "Processors access 4-byte integers more efficiently on 4-byte boundary addresses. Compilers insert 3 padding bytes after the 1-byte char so the int aligns at offset 4."
    },
    {
      "id": "prog-q8",
      "question": "What C preprocessor directive instructs the compiler to pack structure members without padding bytes?",
      "options": [
        "#pragma pack(1)",
        "#define NO_PADDING",
        "#include <packed.h>",
        "#typedef __packed"
      ],
      "correctIndex": 0,
      "explanation": "#pragma pack(1) instructs the compiler to align members on 1-byte boundaries, eliminating padding bytes for byte-exact network protocol and file header mapping."
    },
    {
      "id": "prog-q9",
      "question": "What is the difference between passing an argument by value vs passing by reference (via pointer) to a C function?",
      "options": [
        "Passing by value allows the function to modify the caller's variable",
        "Passing by value creates a copy of the argument; passing a pointer passes the address allowing in-place modification",
        "Pointers cannot be passed as arguments in C",
        "Passing by reference consumes more stack space than passing large structures by value"
      ],
      "correctIndex": 1,
      "explanation": "C is strictly pass-by-value. To simulate pass-by-reference, the memory address (pointer) is passed, allowing the function to dereference and modify caller data directly."
    },
    {
      "id": "prog-q10",
      "question": "What happens if a recursive function in C lacks a valid base case terminating condition?",
      "options": [
        "It returns zero automatically",
        "Infinite recursion leading to call stack exhaustion and stack overflow crash (Segmentation Fault)",
        "The compiler catches it and adds a return statement",
        "It converts into an iterative while loop"
      ],
      "correctIndex": 1,
      "explanation": "Each recursive call pushes a new stack frame (parameters, local variables, return address). Without a base case, frames stack until exceeding stack limit, crashing with stack overflow."
    },
    {
      "id": "prog-q11",
      "question": "What does the 'volatile' keyword signify when qualifying a variable in C?",
      "options": [
        "The variable cannot be changed (read-only)",
        "The variable value may change unexpectedly (e.g. by hardware ISR or thread), preventing compiler caching in CPU registers",
        "The variable is stored on disk",
        "The variable is allocated in GPU memory"
      ],
      "correctIndex": 1,
      "explanation": "The volatile qualifier warns the optimizer that the variable can be modified outside compiler control (hardware registers, memory-mapped I/O, ISRs), forcing memory reads on every access."
    },
    {
      "id": "prog-q12",
      "question": "What is the output of printf(\"%d\", sizeof(\"Hello\")); in C?",
      "options": [
        "5",
        "6",
        "4",
        "8"
      ],
      "correctIndex": 1,
      "explanation": "String literals in C include the invisible terminating null character '\\0'. 'H-e-l-l-o-\\0' occupies exactly 6 bytes of memory."
    },
    {
      "id": "prog-q13",
      "question": "In C, which file stream mode string passed to fopen() opens a file for appending binary data?",
      "options": [
        "\"r+\"",
        "\"ab\"",
        "\"w+\"",
        "\"b\""
      ],
      "correctIndex": 1,
      "explanation": "The mode string \"ab\" opens or creates a binary file for appending, positioning write operations at the end of the file without truncating existing content."
    },
    {
      "id": "prog-q14",
      "question": "What does the C standard library function fseek(fp, 0, SEEK_END) achieve?",
      "options": [
        "Rewinds the file pointer to the beginning",
        "Moves the file position indicator to the exact end of the file",
        "Deletes the contents of the file",
        "Checks for read permission"
      ],
      "correctIndex": 1,
      "explanation": "fseek(fp, offset, SEEK_END) positions the file cursor relative to the end of the file. An offset of 0 places the cursor at the end, commonly followed by ftell() to measure file size."
    },
    {
      "id": "prog-q15",
      "question": "What is a 'void*' pointer in C?",
      "options": [
        "A pointer that always points to address 0x00000000",
        "A generic untyped pointer that can hold the address of any data type without explicit casting",
        "A pointer that cannot be dereferenced or passed to functions",
        "A pointer allocated on the stack"
      ],
      "correctIndex": 1,
      "explanation": "void* is a generic raw memory pointer. Any data pointer can be converted to void* and back, although arithmetic on void* is undefined in standard ANSI C without casting."
    },
    {
      "id": "prog-q16",
      "question": "In a 32-bit Little-Endian architecture, how is the 32-bit hex integer 0x12345678 stored across consecutive bytes in memory starting at address 0x1000?",
      "options": [
        "0x78 at 0x1000, 0x56 at 0x1001, 0x34 at 0x1002, 0x12 at 0x1003",
        "0x12 at 0x1000, 0x34 at 0x1001, 0x56 at 0x1002, 0x78 at 0x1003",
        "0x56 at 0x1000, 0x78 at 0x1001, 0x12 at 0x1002, 0x34 at 0x1003",
        "0x00 at 0x1000, 0x00 at 0x1001, 0x12 at 0x1002, 0x34 at 0x1003"
      ],
      "correctIndex": 0,
      "explanation": "Little-Endian stores the Least Significant Byte (LSB: 0x78) at the lowest memory address, followed by 0x56, 0x34, and Most Significant Byte (MSB: 0x12) at the highest address."
    },
    {
      "id": "prog-q17",
      "question": "What is the result of applying bitwise XOR (a ^ a) between any integer variable and itself?",
      "options": [
        "1",
        "a",
        "0",
        "~a"
      ],
      "correctIndex": 2,
      "explanation": "By definition of XOR, identical bit pairs (1^1 = 0, 0^0 = 0) always cancel to 0. Therefore, a ^ a = 0 for any bit sequence."
    },
    {
      "id": "prog-q18",
      "question": "What is the return value of the expression (5 >> 1) in C using bitwise right-shift?",
      "options": [
        "10",
        "2",
        "2.5",
        "1"
      ],
      "correctIndex": 1,
      "explanation": "Bitwise right shift shifts bits right by 1 position (equivalent to integer division by 2). In binary, 5 (101\u2082) >> 1 becomes 10\u2082 (decimal 2)."
    },
    {
      "id": "prog-q19",
      "question": "What is a function pointer in C and what is its typical syntax for a function taking two ints and returning an int?",
      "options": [
        "int *func(int, int);",
        "int (*funcPtr)(int, int);",
        "void *func(int, int);",
        "func_ptr(int, int) -> int;"
      ],
      "correctIndex": 1,
      "explanation": "int (*funcPtr)(int, int); defines a pointer variable named funcPtr holding the address of executable machine code for any function matching that signature."
    },
    {
      "id": "prog-q20",
      "question": "What is the storage duration and scope of a variable declared with the 'static' keyword inside a C function?",
      "options": [
        "Automatic storage duration, local scope",
        "Static storage duration (retains value between function invocations), local function scope",
        "Allocated dynamically on the heap, global scope",
        "Stored in CPU registers only"
      ],
      "correctIndex": 1,
      "explanation": "A static local variable is initialized once in the data segment when the program starts, preserving its state across subsequent function calls while remaining visible only inside that function."
    },
    {
      "id": "prog-q21",
      "question": "Which header file must be included in C to access standard input/output functions like printf(), scanf(), fopen()?",
      "options": [
        "<stdlib.h>",
        "<stdio.h>",
        "<string.h>",
        "<unistd.h>"
      ],
      "correctIndex": 1,
      "explanation": "<stdio.h> provides definitions, macros, and prototypes for stream I/O operations including file access, buffered text printing, and scanning."
    },
    {
      "id": "prog-q22",
      "question": "What is the danger of using the deprecated gets() function in C?",
      "options": [
        "It converts uppercase text to lowercase",
        "It does not check destination buffer boundaries, causing buffer overflow vulnerabilities",
        "It only reads up to 10 characters",
        "It requires root permissions"
      ],
      "correctIndex": 1,
      "explanation": "gets() reads characters until newline without buffer length checks. Entering more characters than buffer capacity overwrites stack variables and return addresses (exploitable buffer overflow)."
    },
    {
      "id": "prog-q23",
      "question": "What operator in C is used to access members of a structure through a pointer variable?",
      "options": [
        ". (dot operator)",
        "-> (arrow operator)",
        ":: (scope resolution)",
        "& (address-of)"
      ],
      "correctIndex": 1,
      "explanation": "The arrow operator ptr->member is syntactic sugar for dereferencing the pointer and accessing member: (*ptr).member."
    },
    {
      "id": "prog-q24",
      "question": "What is the purpose of the 'const' qualifier when applied to pointer declaration 'const int *ptr'?",
      "options": [
        "The pointer ptr itself cannot change its target address",
        "The integer value pointed to cannot be modified through this pointer (*ptr = x is illegal)",
        "Both the pointer and the integer are immutable",
        "The pointer is allocated in ROM"
      ],
      "correctIndex": 1,
      "explanation": "'const int *ptr' means pointer to a constant integer. The target data is read-only through ptr, though the pointer variable itself can be reassigned to point to other addresses."
    },
    {
      "id": "prog-q25",
      "question": "What is the time complexity of the standard C library qsort() algorithm on average?",
      "options": [
        "O(N\u00b2)",
        "O(N log N)",
        "O(N)",
        "O(log N)"
      ],
      "correctIndex": 1,
      "explanation": "qsort() implements optimized Quicksort (or hybrid IntroSort), which achieves O(N log N) average-case time complexity for sorting arrays of arbitrary elements."
    }
  ],
  "data-structures": [
    {
      "id": "dsa-q1",
      "question": "What is the worst-case time complexity of searching for an element in an unbalanced Binary Search Tree (BST)?",
      "options": [
        "O(1)",
        "O(log N)",
        "O(N)",
        "O(N log N)"
      ],
      "correctIndex": 2,
      "explanation": "If elements are inserted in sorted order, an unbalanced BST degenerates into a linear linked list of height N, resulting in O(N) worst-case search time."
    },
    {
      "id": "dsa-q2",
      "question": "What is the maximum allowed difference between the heights of left and right subtrees (Balance Factor) in an AVL tree?",
      "options": [
        "0",
        "1 (Balance factor must be -1, 0, or +1)",
        "2",
        "log N"
      ],
      "correctIndex": 1,
      "explanation": "By definition, an AVL tree is height-balanced: for every node, the height difference |h_left - h_right| must not exceed 1. If it reaches 2, tree rotations restore balance."
    },
    {
      "id": "dsa-q3",
      "question": "Which tree traversal order visits nodes of a Binary Search Tree (BST) in strictly ascending sorted order?",
      "options": [
        "Pre-order (Root, Left, Right)",
        "In-order (Left, Root, Right)",
        "Post-order (Left, Right, Root)",
        "Level-order (Breadth-first)"
      ],
      "correctIndex": 1,
      "explanation": "In-order traversal recursively visits the left subtree (smaller elements), current root, and right subtree (larger elements), producing monotonically increasing keys."
    },
    {
      "id": "dsa-q4",
      "question": "In a 0-indexed array representation of a binary heap, where are the left and right children of a node at index i located?",
      "options": [
        "2i and 2i+1",
        "2i + 1 and 2i + 2",
        "i + 1 and i + 2",
        "i/2 and i/2 + 1"
      ],
      "correctIndex": 1,
      "explanation": "In a 0-indexed complete binary tree array: Left child = 2i + 1, Right child = 2i + 2, and Parent = floor((i - 1) / 2)."
    },
    {
      "id": "dsa-q5",
      "question": "What is the time complexity to build a binary heap from an unsorted array of N elements using the bottom-up heapify algorithm?",
      "options": [
        "O(N log N)",
        "O(N)",
        "O(N\u00b2)",
        "O(log N)"
      ],
      "correctIndex": 1,
      "explanation": "Bottom-up heap construction (calling maxHeapify from N/2 down to 0) sums the series \u2211 (h / 2^h), which mathematically converges to linear O(N) time complexity."
    },
    {
      "id": "dsa-q6",
      "question": "What is the worst-case and average-case time complexity of Heap Sort?",
      "options": [
        "O(N log N) in both worst and average cases",
        "O(N) average, O(N\u00b2) worst",
        "O(N\u00b2) in all cases",
        "O(log N) worst"
      ],
      "correctIndex": 0,
      "explanation": "Heap Sort builds a heap in O(N) and performs N deletions of the root, each taking O(log N). Its time complexity is guaranteed O(N log N) in worst, average, and best cases."
    },
    {
      "id": "dsa-q7",
      "question": "What graph algorithm uses a min-priority queue to compute single-source shortest paths in graphs with non-negative edge weights?",
      "options": [
        "Prim's algorithm",
        "Dijkstra's algorithm",
        "Bellman-Ford algorithm",
        "Kruskal's algorithm"
      ],
      "correctIndex": 1,
      "explanation": "Dijkstra's greedy algorithm repeatedly extracts the vertex with minimum tentative distance from a priority queue, relaxing edges in O((V + E) log V) time."
    },
    {
      "id": "dsa-q8",
      "question": "Why does Dijkstra's algorithm fail when applied to graphs containing negative-weight edges?",
      "options": [
        "It causes an integer overflow",
        "Its greedy choice assumption is violated because a path visiting a negative edge later could reduce an already finalized distance",
        "It cannot traverse directed graphs",
        "It gets stuck in infinite loops on trees"
      ],
      "correctIndex": 1,
      "explanation": "Dijkstra marks a vertex as visited assuming its shortest distance is finalized. A negative edge encountered later could lower that distance, requiring Bellman-Ford instead."
    },
    {
      "id": "dsa-q9",
      "question": "Which data structure is naturally used to implement Breadth-First Search (BFS) graph traversal?",
      "options": [
        "Stack (LIFO)",
        "Queue (FIFO)",
        "Priority Queue",
        "Binary Search Tree"
      ],
      "correctIndex": 1,
      "explanation": "BFS explores graph vertices level by level using a First-In-First-Out (FIFO) Queue to enqueue neighbors and dequeue in discovery order."
    },
    {
      "id": "dsa-q10",
      "question": "What is the Load Factor (\u03b1) of a Hash Table with N stored keys and M total table buckets?",
      "options": [
        "\u03b1 = M / N",
        "\u03b1 = N / M",
        "\u03b1 = N \u00b7 M",
        "\u03b1 = N + M"
      ],
      "correctIndex": 1,
      "explanation": "Load factor \u03b1 = N / M measures hash table occupancy density. When \u03b1 exceeds a threshold (typically 0.75), rehashing to a larger array prevents performance degradation."
    },
    {
      "id": "dsa-q11",
      "question": "In open addressing hash tables, what collision resolution technique probes sequential slots (hash(k) + i) mod M for i = 0, 1, 2...?",
      "options": [
        "Chaining",
        "Linear Probing",
        "Quadratic Probing",
        "Double Hashing"
      ],
      "correctIndex": 1,
      "explanation": "Linear probing checks consecutive adjacent slots upon collision, simple to implement but susceptible to primary clustering where occupied buckets clump together."
    },
    {
      "id": "dsa-q12",
      "question": "What is the average time complexity of insertion, deletion, and search in a Hash Table with good uniform hashing and moderate load factor?",
      "options": [
        "O(1)",
        "O(log N)",
        "O(N)",
        "O(N log N)"
      ],
      "correctIndex": 0,
      "explanation": "Under the Simple Uniform Hashing Assumption (SUHA), key operations distribute evenly across buckets, achieving constant O(1) expected time."
    },
    {
      "id": "dsa-q13",
      "question": "What is the worst-case time complexity of QuickSort and when does it occur with naive pivot selection (first or last element)?",
      "options": [
        "O(N log N) on random arrays",
        "O(N\u00b2) when array is already sorted or reverse sorted",
        "O(N) on identical elements",
        "O(log N) on empty arrays"
      ],
      "correctIndex": 1,
      "explanation": "When picking an extreme element on an already sorted array, partitions divide into sizes 0 and N-1, yielding recurrences T(N) = T(N-1) + O(N) = O(N\u00b2)."
    },
    {
      "id": "dsa-q14",
      "question": "Which comparison sorting algorithm guarantees O(N log N) worst-case time and is stable, but requires O(N) auxiliary memory?",
      "options": [
        "Bubble Sort",
        "Merge Sort",
        "Quick Sort",
        "Selection Sort"
      ],
      "correctIndex": 1,
      "explanation": "Merge Sort recursively divides the array in half and merges sorted halves in O(N log N) time, preserving relative order of equal keys (stable) using O(N) extra space."
    },
    {
      "id": "dsa-q15",
      "question": "What is the minimum number of queues required to implement a Stack (LIFO) data structure?",
      "options": [
        "1",
        "2",
        "3",
        "0"
      ],
      "correctIndex": 1,
      "explanation": "A stack can be simulated using two queues by rotating elements during push or pop operations so the most recently pushed item stays at the front of the active queue."
    },
    {
      "id": "dsa-q16",
      "question": "What abstract data type allows insertion and deletion at both ends with O(1) time complexity?",
      "options": [
        "Singly Linked List",
        "Deque (Double-Ended Queue)",
        "Binary Heap",
        "B-Tree"
      ],
      "correctIndex": 1,
      "explanation": "A Deque (Double-Ended Queue), implemented using a circular buffer or doubly-linked list, supports push_front, pop_front, push_back, and pop_back in O(1) time."
    },
    {
      "id": "dsa-q17",
      "question": "In a Red-Black Tree, what are the mandatory color properties of the root node and external NIL leaves?",
      "options": [
        "Both must be Red",
        "Both must be Black",
        "Root is Red, Leaves are Black",
        "Root is Black, Leaves are Red"
      ],
      "correctIndex": 1,
      "explanation": "In Red-Black tree invariants: Rule 1: Every node is red or black. Rule 2: The root is black. Rule 3: All leaves (NIL nodes) are black. Rule 4: Red nodes cannot have red children."
    },
    {
      "id": "dsa-q18",
      "question": "What is the maximum number of nodes in a binary tree of height h (where a root-only tree has height h = 0)?",
      "options": [
        "2^h",
        "2^(h + 1) - 1",
        "2^h - 1",
        "h\u00b2"
      ],
      "correctIndex": 1,
      "explanation": "Summing geometric progression of maximum nodes per level: 1 + 2 + 4 + ... + 2^h = (2^(h+1) - 1)."
    },
    {
      "id": "dsa-q19",
      "question": "What algorithm finds the Minimum Spanning Tree (MST) of a connected edge-weighted graph by sorting all edges and using a Disjoint Set Union (DSU / Union-Find) data structure?",
      "options": [
        "Dijkstra's algorithm",
        "Kruskal's algorithm",
        "Floyd-Warshall algorithm",
        "Kosaraju's algorithm"
      ],
      "correctIndex": 1,
      "explanation": "Kruskal's algorithm sorts edges by weight and iteratively adds the lightest edge that does not form a cycle, tracked using Union-Find in O(E log E) time."
    },
    {
      "id": "dsa-q20",
      "question": "What is the time complexity of finding or unioning sets in a Disjoint Set Union (DSU) using path compression and union by rank?",
      "options": [
        "O(N)",
        "O(log N)",
        "O(\u03b1(N)) - inverse Ackermann function (nearly O(1))",
        "O(N log N)"
      ],
      "correctIndex": 2,
      "explanation": "With path compression and union by rank/size, the amortized cost per operation is O(\u03b1(N)), where \u03b1 is the inverse Ackermann function (\u03b1(N) \u2264 4 for all practical inputs)."
    },
    {
      "id": "dsa-q21",
      "question": "What algorithm efficiently computes all-pairs shortest paths in a weighted directed graph in O(V\u00b3) time using dynamic programming?",
      "options": [
        "Bellman-Ford",
        "Floyd-Warshall algorithm",
        "Tarjan's algorithm",
        "Johnson's algorithm"
      ],
      "correctIndex": 1,
      "explanation": "Floyd-Warshall updates distances between every pair (i, j) considering each intermediate vertex k: dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]) in O(V\u00b3) steps."
    },
    {
      "id": "dsa-q22",
      "question": "What string searching algorithm uses the Longest Prefix which is also Suffix (LPS array / \u03c0 array) to achieve linear O(N + M) matching?",
      "options": [
        "Boyer-Moore",
        "Knuth-Morris-Pratt (KMP) algorithm",
        "Rabin-Karp",
        "Aho-Corasick"
      ],
      "correctIndex": 1,
      "explanation": "KMP preprocesses the search pattern into a \u03c0/LPS array, skipping redundant character comparisons upon mismatch and guaranteeing O(N + M) worst-case time."
    },
    {
      "id": "dsa-q23",
      "question": "What tree structure stores associative keys as prefix paths of characters, commonly used for dictionary auto-completion and IP routing lookups?",
      "options": [
        "Trie (Prefix Tree)",
        "Fenwick Tree",
        "Segment Tree",
        "Treap"
      ],
      "correctIndex": 0,
      "explanation": "A Trie (prefix tree) stores string characters along directed edge transitions, enabling prefix searches and word insertions in O(L) time proportional to word length L."
    },
    {
      "id": "dsa-q24",
      "question": "What data structure supports range sum queries and point updates in O(log N) time with O(N) space using bit manipulation (i & -i)?",
      "options": [
        "Binary Search Tree",
        "Fenwick Tree (Binary Indexed Tree / BIT)",
        "Skip List",
        "B+ Tree"
      ],
      "correctIndex": 1,
      "explanation": "A Fenwick Tree (BIT) stores cumulative frequency sums where indices advance and isolate lowest set bits using x & (-x), updating and querying prefix sums in O(log N)."
    },
    {
      "id": "dsa-q25",
      "question": "In dynamic programming, what two fundamental properties must a problem satisfy to be solvable via DP?",
      "options": [
        "Overlapping subproblems and Optimal substructure",
        "Greedy choice property and Sorting",
        "Divide and conquer with independent subproblems",
        "Linearity and Time invariance"
      ],
      "correctIndex": 0,
      "explanation": "Dynamic programming applies when a problem has optimal substructure (optimal solution composed of optimal solutions to subproblems) and overlapping subproblems (same subproblems solved repeatedly)."
    }
  ],
  "database": [
    {
      "id": "db-q1",
      "question": "What does the 'A' in the ACID transaction model stand for and guarantee?",
      "options": [
        "Availability: System is always online",
        "Atomicity: All operations in the transaction succeed, or all are rolled back with zero partial changes",
        "Accuracy: Numbers have decimal precision",
        "Authentication: User identity is verified"
      ],
      "correctIndex": 1,
      "explanation": "Atomicity ensures that a database transaction is treated as an indivisible unit of work: either every single statement commits, or the database reverts to its pre-transaction state."
    },
    {
      "id": "db-q2",
      "question": "What ACID property ensures that committed transactions survive subsequent database system crashes, power failures, or restarts?",
      "options": [
        "Atomicity",
        "Consistency",
        "Isolation",
        "Durability"
      ],
      "correctIndex": 3,
      "explanation": "Durability guarantees that once a transaction commits, its modifications are permanently recorded in non-volatile storage (via Write-Ahead Logging / WAL) even during hardware failures."
    },
    {
      "id": "db-q3",
      "question": "What anomaly occurs when Transaction T1 reads uncommitted modifications made by concurrent Transaction T2 which later rolls back?",
      "options": [
        "Dirty Read (Uncommitted read)",
        "Non-repeatable Read",
        "Phantom Read",
        "Lost Update"
      ],
      "correctIndex": 0,
      "explanation": "A Dirty Read occurs when a transaction reads data that has been modified by another concurrent uncommitted transaction, reading transient data that might be aborted."
    },
    {
      "id": "db-q4",
      "question": "What SQL Transaction Isolation Level completely prevents Dirty Reads, Non-repeatable Reads, and Phantom Reads?",
      "options": [
        "Read Uncommitted",
        "Read Committed",
        "Repeatable Read",
        "Serializable"
      ],
      "correctIndex": 3,
      "explanation": "Serializable is the highest isolation level. It executes transactions concurrently with guarantees equivalent to executing them sequentially one after another."
    },
    {
      "id": "db-q5",
      "question": "A relational database table is in First Normal Form (1NF) if and only if which condition is met?",
      "options": [
        "It has no foreign keys",
        "Every column contains only atomic (indivisible) values and there are no repeating groups",
        "All non-key attributes are fully dependent on the primary key",
        "It has a composite primary key"
      ],
      "correctIndex": 1,
      "explanation": "1NF requires that all column values are atomic (no arrays, nested records, or multi-valued attributes) and each row is uniquely identifiable."
    },
    {
      "id": "db-q6",
      "question": "A table in 1NF is in Second Normal Form (2NF) if and only if it eliminates what type of dependency?",
      "options": [
        "Transitive dependencies",
        "Partial functional dependencies on composite primary keys",
        "Multi-valued dependencies",
        "Join dependencies"
      ],
      "correctIndex": 1,
      "explanation": "2NF requires that all non-prime attributes are fully functionally dependent on the whole candidate key, eliminating partial dependencies where an attribute depends on only part of a composite key."
    },
    {
      "id": "db-q7",
      "question": "What condition must hold for a relation to be in Third Normal Form (3NF)?",
      "options": [
        "It is in 2NF and has no transitive dependencies (for X \u2192 A, either X is a superkey or A is a prime attribute)",
        "It has only two columns",
        "All foreign keys reference primary keys in the same table",
        "It has zero indexes"
      ],
      "correctIndex": 0,
      "explanation": "3NF removes transitive dependencies (non-key attribute depending on another non-key attribute). For every non-trivial X \u2192 A, either X is a superkey or A is a prime attribute."
    },
    {
      "id": "db-q8",
      "question": "How is Boyce-Codd Normal Form (BCNF) stricter than standard Third Normal Form (3NF)?",
      "options": [
        "BCNF requires 5NF compliance",
        "In BCNF, for every functional dependency X \u2192 A, X must strictly be a superkey (no exception for prime attributes A)",
        "BCNF does not allow candidate keys",
        "BCNF allows repeating groups"
      ],
      "correctIndex": 1,
      "explanation": "BCNF eliminates anomalies where a determinant X in X \u2192 A is part of a candidate key but not a superkey by demanding that every determinant must be a superkey."
    },
    {
      "id": "db-q9",
      "question": "Why are B+ Trees universally preferred over standard binary search trees for disk-based relational database indexes?",
      "options": [
        "B+ Trees take less memory in RAM",
        "High fan-out (hundreds of keys per node) reduces tree height, minimizing expensive disk block I/O operations",
        "B+ Trees only store integers",
        "B+ Trees do not support range scans"
      ],
      "correctIndex": 1,
      "explanation": "Disk page I/O is slow. B+ Trees have broad fan-outs (order 100+), allowing millions of records to be indexed in 3 to 4 disk reads, with leaf nodes linked for sequential range scans."
    },
    {
      "id": "db-q10",
      "question": "What is the structural difference between internal routing nodes and leaf nodes in a B+ Tree?",
      "options": [
        "Internal nodes store actual table data records; leaf nodes store pointers",
        "Internal nodes store only search keys and child page pointers; all actual data pointers/records reside in leaf nodes connected by a doubly-linked list",
        "Leaf nodes have higher fanout than internal nodes",
        "Leaf nodes contain the root"
      ],
      "correctIndex": 1,
      "explanation": "In a B+ Tree, internal nodes act purely as navigation indexes. All actual data pointers and records are housed exclusively in leaf nodes linked sequentially for range queries."
    },
    {
      "id": "db-q11",
      "question": "What is a 'Clustered Index' in a relational database?",
      "options": [
        "An index created on multiple columns simultaneously",
        "An index that defines the physical storage order of actual table rows on disk (only one clustered index per table)",
        "An index stored in the cloud",
        "An in-memory hash table"
      ],
      "correctIndex": 1,
      "explanation": "A clustered index dictates the physical sequence of rows on disk blocks (typically the primary key). Because data rows can only be sorted one way physically, only one clustered index can exist per table."
    },
    {
      "id": "db-q12",
      "question": "In database concurrency control, what are the two phases of the Two-Phase Locking (2PL) protocol?",
      "options": [
        "Read phase and Write phase",
        "Growing phase (locks acquired, no locks released) and Shrinking phase (locks released, no new locks acquired)",
        "Commit phase and Abort phase",
        "Locking phase and Deadlock phase"
      ],
      "correctIndex": 1,
      "explanation": "2PL ensures conflict serializability by dividing lock operations into a Growing Phase (only acquire locks) and a Shrinking Phase (only release locks). Once a lock is released, no new locks may be acquired."
    },
    {
      "id": "db-q13",
      "question": "What variation of 2PL holds all Exclusive (X) locks until the transaction commits or aborts, preventing cascading rollbacks?",
      "options": [
        "Conservative 2PL",
        "Strict Two-Phase Locking (Strict 2PL)",
        "Non-blocking 2PL",
        "Optimistic 2PL"
      ],
      "correctIndex": 1,
      "explanation": "Strict 2PL holds all exclusive write locks until the transaction completely finishes (COMMIT or ROLLBACK), ensuring other transactions never read uncommitted data, preventing cascading aborts."
    },
    {
      "id": "db-q14",
      "question": "What protocol in database logging dictates that log records describing a change must be flushed to non-volatile disk before the modified data page is written to disk?",
      "options": [
        "Write-Ahead Logging (WAL)",
        "Deferred Update Protocol",
        "Shadow Paging",
        "Checkpointer Protocol"
      ],
      "correctIndex": 0,
      "explanation": "WAL enforces that log records describing updates are forced to stable disk storage before dirty data pages are flushed. This ensures recovery algorithms (ARIES) can undo or redo operations after crashes."
    },
    {
      "id": "db-q15",
      "question": "In the ARIES database recovery algorithm, what are the three sequential phases executed upon system restart after a crash?",
      "options": [
        "Scan, Filter, Aggregate",
        "Analysis Phase, Redo Phase, Undo Phase",
        "Check, Verify, Rebuild",
        "Lock, Validate, Write"
      ],
      "correctIndex": 1,
      "explanation": "ARIES recovery executes: 1) Analysis (scans WAL to identify dirty pages and active transactions at crash), 2) Redo (repeats history to restore database state), 3) Undo (rolls back transactions that were active during crash)."
    },
    {
      "id": "db-q16",
      "question": "What does a database Checkpoint do during regular transaction processing?",
      "options": [
        "Terminates all running client connections",
        "Flushes modified dirty buffer pool pages to disk and records a sync point in the transaction log to bound recovery time",
        "Deletes old database backups",
        "Drops secondary indexes"
      ],
      "correctIndex": 1,
      "explanation": "Checkpoints periodically write dirty in-memory pages to disk and write a checkpoint record to the log. During crash recovery, the system only needs to scan logs back to the checkpoint."
    },
    {
      "id": "db-q17",
      "question": "In SQL, what is the difference between WHERE and HAVING clauses?",
      "options": [
        "WHERE filters individual rows before grouping; HAVING filters aggregate groups after GROUP BY",
        "WHERE is used only with SELECT; HAVING with UPDATE",
        "HAVING is faster than WHERE",
        "WHERE can evaluate aggregate functions like COUNT()"
      ],
      "correctIndex": 0,
      "explanation": "The WHERE clause filters individual records before aggregation. The HAVING clause applies filters to aggregated group summary rows after the GROUP BY clause executes."
    },
    {
      "id": "db-q18",
      "question": "What is the result of evaluating 'SELECT COUNT(*)' vs 'SELECT COUNT(column_name)' when some rows have NULL in column_name?",
      "options": [
        "Both return the exact same count",
        "COUNT(*) counts all rows including NULLs; COUNT(column_name) excludes rows where column_name is NULL",
        "COUNT(column_name) returns NULL",
        "COUNT(*) throws an exception"
      ],
      "correctIndex": 1,
      "explanation": "COUNT(*) counts total physical table rows regardless of content. COUNT(column_name) ignores and excludes rows where that specific column evaluates to NULL."
    },
    {
      "id": "db-q19",
      "question": "What type of join returns all rows from the left table, and matching rows from the right table, filling missing right columns with NULL?",
      "options": [
        "INNER JOIN",
        "LEFT OUTER JOIN",
        "CROSS JOIN",
        "NATURAL JOIN"
      ],
      "correctIndex": 1,
      "explanation": "A LEFT OUTER JOIN preserves all rows from the left table. If no matching row exists in the right table based on the join predicate, NULL is substituted for right table attributes."
    },
    {
      "id": "db-q20",
      "question": "What is a 'precedence graph' (serialization graph) used to detect in database transactions?",
      "options": [
        "Deadlocks in memory",
        "Conflict Serializability of concurrent execution schedules (a schedule is conflict serializable if and only if its precedence graph has no directed cycles)",
        "Disk fragmentations",
        "Missing indexes"
      ],
      "correctIndex": 1,
      "explanation": "A precedence graph draws directed edges T_i \u2192 T_j when an operation in T_i conflicts with a later operation in T_j. If the graph contains no cycles, the schedule is provably conflict serializable."
    },
    {
      "id": "db-q21",
      "question": "What deadlocks prevention scheme aborts and restarts transaction T_i if it has a younger timestamp than the holder of the requested lock (T_j)?",
      "options": [
        "Wait-Die scheme (non-preemptive)",
        "Wound-Wait scheme (preemptive)",
        "Timeout detection",
        "Strict 2PL"
      ],
      "correctIndex": 0,
      "explanation": "In Wait-Die: If older transaction T_old requests a lock held by younger T_young, T_old is allowed to wait. If younger T_young requests a lock held by older T_old, T_young dies (aborts and restarts)."
    },
    {
      "id": "db-q22",
      "question": "What relational algebra operator performs projection of specific attributes from a relation?",
      "options": [
        "\u03c3 (sigma)",
        "\u03c0 (pi)",
        "\u2a1d (bowtie)",
        "\u03c1 (rho)"
      ],
      "correctIndex": 1,
      "explanation": "In relational algebra, \u03c0 (pi) represents projection (selecting specific columns), while \u03c3 (sigma) represents selection (filtering rows based on conditions)."
    },
    {
      "id": "db-q23",
      "question": "What optimization technique evaluates selection predicates as early as possible in a query relational algebra execution tree?",
      "options": [
        "Pushing selections down the tree (Predicate Pushdown)",
        "Cartesian explosion",
        "Nested loop join",
        "Sorting projection"
      ],
      "correctIndex": 0,
      "explanation": "Predicate Pushdown moves selection (\u03c3) filters as close to the leaf scan operations as possible, dramatically reducing intermediate tuple volume before expensive joins occur."
    },
    {
      "id": "db-q24",
      "question": "What is a Foreign Key constraint enforcing in relational databases?",
      "options": [
        "Primary key uniqueness",
        "Referential integrity: referenced values in child table must exist in parent table or be NULL",
        "Disk encryption",
        "Check constraint boundaries"
      ],
      "correctIndex": 1,
      "explanation": "Referential integrity guarantees that foreign key values in a child relation correspond to valid, existing primary/unique key values in the referenced parent relation."
    },
    {
      "id": "db-q25",
      "question": "What type of NoSQL database stores unstructured data as JSON-like documents with dynamic, flexible schemas (e.g. MongoDB, Couchbase)?",
      "options": [
        "Key-Value store",
        "Document-oriented database",
        "Column-family store",
        "Graph database"
      ],
      "correctIndex": 1,
      "explanation": "Document databases store semi-structured records as BSON/JSON documents where fields can vary across records, providing flexible schema evolution and hierarchical querying."
    }
  ],
  "java": [
    {
      "id": "java-q1",
      "question": "In the Java Virtual Machine (JVM) memory architecture, where are instantiated objects and their instance variables allocated?",
      "options": [
        "JVM Stack",
        "Heap Memory",
        "Metaspace (Method Area)",
        "Program Counter (PC) Register"
      ],
      "correctIndex": 1,
      "explanation": "All Java class instances (objects) and arrays are dynamically created and stored in the shared Heap Memory, managed by the automatic Garbage Collector."
    },
    {
      "id": "java-q2",
      "question": "What is stored on the JVM Thread Stack during method execution?",
      "options": [
        "Global static variables",
        "Stack frames containing local primitive variables, object reference pointers, and partial operand evaluation stacks",
        "Loaded bytecode classes",
        "JIT compiled native machine code"
      ],
      "correctIndex": 1,
      "explanation": "Each thread has a private stack. Calling a method pushes a Stack Frame storing local variables, method arguments, return addresses, and intermediate calculation operands."
    },
    {
      "id": "java-q3",
      "question": "What is the primary role of the Just-In-Time (JIT) Compiler inside the JVM Execution Engine?",
      "options": [
        "To interpret bytecode line-by-line indefinitely",
        "To compile frequently executed bytecode 'hot spots' into native CPU machine code at runtime for high performance",
        "To check syntax during javac compilation",
        "To format Java source code"
      ],
      "correctIndex": 1,
      "explanation": "The JIT compiler profiles running bytecode. When loops or methods pass execution count thresholds ('hot spots'), it compiles them directly into native host machine code."
    },
    {
      "id": "java-q4",
      "question": "In Java Generics, what does the compiler perform through 'Type Erasure'?",
      "options": [
        "Converts generic types into native C++ templates",
        "Removes all generic type parameters at compile-time, replacing them with their bounds (or Object) and inserting necessary casts to maintain backwards compatibility",
        "Allocates separate heap memory for each type parameter",
        "Prevents subclassing"
      ],
      "correctIndex": 1,
      "explanation": "Java generics are implemented via Type Erasure. The javac compiler enforces type safety at compile time, then erases type parameters to Object/bounds in the generated bytecode."
    },
    {
      "id": "java-q5",
      "question": "What is the difference between ArrayList and LinkedList in Java Collections Framework?",
      "options": [
        "ArrayList is synchronized; LinkedList is not",
        "ArrayList is backed by a dynamically resizing array with O(1) random access; LinkedList is a doubly-linked list with O(N) access and O(1) node insertion/deletion",
        "LinkedList cannot store duplicate elements",
        "ArrayList has higher memory overhead per element than LinkedList"
      ],
      "correctIndex": 1,
      "explanation": "ArrayList provides fast index lookups (get(i) is O(1)) via contiguous memory. LinkedList consists of node objects containing two pointers each, providing O(1) insertion at ends but O(N) traversal."
    },
    {
      "id": "java-q6",
      "question": "How does HashMap handle bucket collisions in Java 8 and later when the number of elements in a single bucket exceeds TREEIFY_THRESHOLD (8)?",
      "options": [
        "It drops older elements",
        "It transforms the bucket's linked list into a balanced Red-Black Tree, improving lookup from O(N) to O(log N)",
        "It throws a HashCollisionException",
        "It doubles the heap size"
      ],
      "correctIndex": 1,
      "explanation": "Java 8 converts linked list chains exceeding 8 nodes (and table capacity \u2265 64) into balanced Red-Black Trees, defending against hash flooding attacks by guaranteeing O(log N) worst-case search."
    },
    {
      "id": "java-q7",
      "question": "Why is ConcurrentHashMap preferred over Collections.synchronizedMap() in multi-threaded Java applications?",
      "options": [
        "ConcurrentHashMap allows multiple threads to read concurrently and uses lock striping / synchronized bucket heads to permit non-blocking concurrent writes",
        "ConcurrentHashMap does not require synchronization",
        "ConcurrentHashMap can only be used by one thread at a time",
        "synchronizedMap is faster on single-core CPUs"
      ],
      "correctIndex": 0,
      "explanation": "Collections.synchronizedMap locks the entire map for every operation. ConcurrentHashMap uses CAS operations and locks individual bucket bins, allowing high-throughput concurrent reads and writes."
    },
    {
      "id": "java-q8",
      "question": "What is the memory visibility guarantee provided by declaring a variable with the 'volatile' keyword in Java?",
      "options": [
        "It makes compound operations like count++ atomic",
        "Reads and writes go directly to shared main memory rather than thread-local CPU caches, establishing a happens-before relationship",
        "It prevents garbage collection",
        "It freezes the variable value"
      ],
      "correctIndex": 1,
      "explanation": "The volatile modifier guarantees visibility: any write to a volatile variable is immediately flushed to main memory, and reads always fetch the freshest value, preventing stale CPU cache reads."
    },
    {
      "id": "java-q9",
      "question": "Why is the compound operation 'count++' NOT thread-safe even if count is declared as 'volatile int count;'?",
      "options": [
        "Volatile is ignored on integers",
        "count++ consists of three distinct non-atomic steps: read, modify, and write back. Concurrent threads can interleave between them",
        "Volatile causes stack overflow",
        "JVM forbids incrementing volatile variables"
      ],
      "correctIndex": 1,
      "explanation": "Volatile guarantees memory visibility but not atomicity. Incrementing (read, add 1, write) can interleave between threads, losing updates. Thread-safety requires AtomicInteger or synchronized."
    },
    {
      "id": "java-q10",
      "question": "What hardware mechanism does java.util.concurrent.atomic.AtomicInteger utilize to achieve lock-free thread-safe updates?",
      "options": [
        "Operating system mutexes",
        "Compare-And-Swap (CAS) CPU machine instructions",
        "File locking",
        "Interrupt disabling"
      ],
      "correctIndex": 1,
      "explanation": "AtomicInteger uses atomic CPU machine primitives (like CMPXCHG on x86) to perform Compare-And-Swap (CAS) in a tight loop, updating values without thread suspension or mutex overhead."
    },
    {
      "id": "java-q11",
      "question": "What happens if a thread calls Object.wait() without holding the monitor lock (synchronized block) on that object?",
      "options": [
        "The thread sleeps for 100ms",
        "The JVM throws an IllegalMonitorStateException at runtime",
        "The object is locked automatically",
        "The JVM terminates"
      ],
      "correctIndex": 1,
      "explanation": "Calling wait(), notify(), or notifyAll() on an object requires ownership of that object's monitor. Calling them outside a synchronized(obj) block throws IllegalMonitorStateException."
    },
    {
      "id": "java-q12",
      "question": "What is the difference between Runnable and Callable<V> interfaces in Java concurrency?",
      "options": [
        "Runnable cannot return a result or throw checked exceptions; Callable's call() method returns a typed value V and can throw checked exceptions",
        "Runnable runs in a background thread; Callable runs only on main thread",
        "Callable was removed in Java 8",
        "Runnable uses generics"
      ],
      "correctIndex": 0,
      "explanation": "Runnable has void run() without return values or checked exceptions. Callable<V> defines V call() throws Exception, designed for use with ExecutorService and Future<V>."
    },
    {
      "id": "java-q13",
      "question": "What does a ThreadPoolExecutor do when submitted tasks exceed both corePoolSize and maximumPoolSize, and the workQueue is full?",
      "options": [
        "It deletes the oldest threads",
        "It invokes its configured RejectedExecutionHandler (e.g. AbortPolicy throws RejectedExecutionException)",
        "It crashes the JVM",
        "It writes tasks to disk"
      ],
      "correctIndex": 1,
      "explanation": "When worker threads reach maximumPoolSize and the task queue is saturated, the executor delegates task handling to its RejectedExecutionHandler (default AbortPolicy throws exception)."
    },
    {
      "id": "java-q14",
      "question": "What garbage collection generation model organizes Java heap into Young (Eden, Survivor spaces S0/S1) and Old (Tenured) generations?",
      "options": [
        "Generational Garbage Collection hypothesis (most allocated objects die young)",
        "Round-robin collection",
        "Reference counting model",
        "Manual free list"
      ],
      "correctIndex": 0,
      "explanation": "The Weak Generational Hypothesis observes that most objects are short-lived. Dividing the heap into Young and Old generations allows frequent, fast Minor GCs on the Young generation."
    },
    {
      "id": "java-q15",
      "question": "What is the G1 (Garbage-First) GC algorithm designed to achieve in modern large-heap Java server applications?",
      "options": [
        "Zero memory usage",
        "High-throughput concurrent marking with predictable user-defined pause time targets by collecting regions containing the most garbage first",
        "Disabling multi-threading",
        "Direct allocation on disk"
      ],
      "correctIndex": 1,
      "explanation": "G1 partitions the heap into equal-sized regions. It tracks liveness and collects regions with the most reclaimable garbage first ('Garbage-First') within specified pause-time targets."
    },
    {
      "id": "java-q16",
      "question": "What is the contract between equals() and hashCode() methods in Java?",
      "options": [
        "If two objects have the same hashCode(), they must be equals()",
        "If two objects are equal according to equals(), they MUST return the exact same integer hashCode()",
        "equals() and hashCode() have no relationship",
        "hashCode() must return a unique value for every object"
      ],
      "correctIndex": 1,
      "explanation": "The Java Object specification mandates: if a.equals(b) is true, then a.hashCode() must equal b.hashCode(). Violating this causes HashMaps and HashSets to lose or misplace keys."
    },
    {
      "id": "java-q17",
      "question": "Why is the String class immutable and declared as 'final' in Java?",
      "options": [
        "To prevent creation of subclasses and allow thread safety, security, and string pool caching without synchronization",
        "To save CPU instructions",
        "Because Java does not support mutable strings",
        "To force garbage collection"
      ],
      "correctIndex": 0,
      "explanation": "Immutability allows String references to be shared safely across threads, enables String Pool deduplication, and secures sensitive data (file paths, network sockets) from being altered after validation."
    },
    {
      "id": "java-q18",
      "question": "What is the difference between checked exceptions and unchecked exceptions in Java?",
      "options": [
        "Checked exceptions inherit from Exception (excluding RuntimeException) and must be handled or declared in method signature; unchecked inherit from RuntimeException/Error and do not require explicit throws",
        "Checked exceptions crash the JVM immediately",
        "Unchecked exceptions cannot be caught in try-catch",
        "Checked exceptions only occur in test code"
      ],
      "correctIndex": 0,
      "explanation": "Checked exceptions (e.g. IOException, SQLException) enforce compile-time error handling. Unchecked exceptions (subclasses of RuntimeException, e.g. NullPointerException) represent programming defects."
    },
    {
      "id": "java-q19",
      "question": "In Java 8, what is a Functional Interface?",
      "options": [
        "An interface with zero methods",
        "An interface that declares exactly one abstract method (can have multiple default and static methods)",
        "An interface that extends Thread",
        "An interface declared inside a lambda"
      ],
      "correctIndex": 1,
      "explanation": "A Functional Interface has exactly one abstract method (annotated optionally with @FunctionalInterface), serving as the target type for lambda expressions and method references."
    },
    {
      "id": "java-q20",
      "question": "What Java 8 Stream intermediate operation transforms each element of a stream into another stream and flattens resulting streams into a single stream?",
      "options": [
        "map()",
        "flatMap()",
        "filter()",
        "distinct()"
      ],
      "correctIndex": 1,
      "explanation": "flatMap() applies a 1-to-many transformation: it maps each stream element to a new stream, then flattens and concatenates all resulting streams into one continuous output stream."
    },
    {
      "id": "java-q21",
      "question": "What feature introduced in Java 7 automatically closes resources (implementing java.lang.AutoCloseable) at the end of a block?",
      "options": [
        "Garbage collection loop",
        "try-with-resources statement",
        "finally cleanup block",
        "finalize() callback"
      ],
      "correctIndex": 1,
      "explanation": "The try-with-resources statement ensures that each declared resource implementing AutoCloseable is automatically closed at the conclusion of the try block, preventing resource leaks."
    },
    {
      "id": "java-q22",
      "question": "What does the 'default' keyword signify in a Java 8 interface definition?",
      "options": [
        "Specifies default package-private visibility",
        "Provides a concrete default implementation for a method directly inside the interface without breaking implementing classes",
        "Resets variables to null",
        "Marks the interface as abstract"
      ],
      "correctIndex": 1,
      "explanation": "Default methods allow new methods with full implementations to be added to existing interfaces while preserving backwards binary compatibility with legacy implementing classes."
    },
    {
      "id": "java-q23",
      "question": "What is the Metaspace in Java 8 and how does it differ from the legacy PermGen (Permanent Generation)?",
      "options": [
        "Metaspace is stored in JVM heap memory",
        "Metaspace stores class metadata in native process memory and resizes dynamically, eliminating java.lang.OutOfMemoryError: PermGen space crashes",
        "Metaspace stores compiled JIT code only",
        "Metaspace has a fixed 64MB limit"
      ],
      "correctIndex": 1,
      "explanation": "PermGen was replaced in Java 8 by Metaspace. Class metadata is now stored in native OS process memory, automatically growing to available system memory limits unless capped."
    },
    {
      "id": "java-q24",
      "question": "What is a 'PhantomReference' in Java and when is it enqueued in a ReferenceQueue?",
      "options": [
        "Before the object is initialized",
        "After its finalize() method has completed and the object has been completely reclaimed/freed from memory",
        "When an object has strong references",
        "During young generation minor GC"
      ],
      "correctIndex": 1,
      "explanation": "PhantomReferences are enqueued only after the referenced object has been finalized and physically reclaimed, providing a reliable alternative to finalizers for pre-mortem native memory cleanup."
    },
    {
      "id": "java-q25",
      "question": "What is the purpose of the Java Memory Model (JMM) specification?",
      "options": [
        "To define heap memory size parameters",
        "To define the exact rules and semantics governing how threads interact through memory, including happens-before ordering and cache synchronization guarantees",
        "To optimize CPU clock speed",
        "To manage network socket buffers"
      ],
      "correctIndex": 1,
      "explanation": "The JMM specifies how the JVM and CPU hardware interact regarding instruction reordering, compiler optimizations, and memory caches, guaranteeing predictable concurrent execution across architectures."
    }
  ],
  "python": [
    {
      "id": "py-q1",
      "question": "What is the primary purpose of Python's Global Interpreter Lock (GIL) in CPython?",
      "options": [
        "To speed up multi-core computation",
        "A mutex that prevents multiple native threads from executing Python bytecodes simultaneously, simplifying CPython's non-thread-safe reference counting memory management",
        "To encrypt bytecode files",
        "To lock variable values during runtime"
      ],
      "correctIndex": 1,
      "explanation": "The GIL is a global mutex ensuring that only one thread executes Python bytecode at a time in CPython, protecting internal reference count data structures from race conditions."
    },
    {
      "id": "py-q2",
      "question": "How does CPython manage memory and detect cyclic reference loops between objects?",
      "options": [
        "Pure mark-and-sweep GC only",
        "Primary reference counting for immediate reclamation, supplemented by a cyclic garbage collector that tracks reference cycles between container objects",
        "Manual deallocation via free()",
        "Heap compaction every 5 seconds"
      ],
      "correctIndex": 1,
      "explanation": "CPython immediately frees objects whose reference count drops to 0. A generational cyclic garbage collector periodically inspects container objects (lists, dicts, tuples) to break isolated circular references."
    },
    {
      "id": "py-q3",
      "question": "What is a Closure in Python?",
      "options": [
        "A function that takes no arguments",
        "A function object that remembers values in enclosing lexical scopes even if those scopes have finished execution and exited the call stack",
        "A method that closes a file",
        "A syntax error that halts execution"
      ],
      "correctIndex": 1,
      "explanation": "A closure occurs when a nested function retains access to non-local variables from its enclosing outer function, bundling the code with its surrounding lexical environment."
    },
    {
      "id": "py-q4",
      "question": "What is the syntactic translation of applying decorator @my_decorator above function def foo(): ...?",
      "options": [
        "foo = my_decorator()",
        "foo = my_decorator(foo)",
        "my_decorator.apply(foo)",
        "foo.decorate(my_decorator)"
      ],
      "correctIndex": 1,
      "explanation": "The @decorator syntax is syntactic sugar: placing @my_decorator before def foo(): ... evaluates foo = my_decorator(foo), replacing foo with the returned callable."
    },
    {
      "id": "py-q5",
      "question": "What is the difference between __str__ and __repr__ special dunder methods in Python?",
      "options": [
        "__str__ is for formal, unambiguous developer inspection (should look like valid code if possible); __repr__ is for readable user-facing output",
        "__str__ is for human-readable string representation; __repr__ is for unambiguous developer debugging inspection",
        "They are identical aliases",
        "__repr__ was removed in Python 3"
      ],
      "correctIndex": 1,
      "explanation": "__str__ produces a clean, user-friendly presentation. __repr__ produces an explicit, unambiguous representation intended for debugging (ideally re-evaluable via eval())."
    },
    {
      "id": "py-q6",
      "question": "What does implementing the __getitem__ and __len__ dunder methods on a custom Python class enable?",
      "options": [
        "Object serialization only",
        "Enables sequence behavior including square-bracket indexing (obj[i]), slicing, length query (len(obj)), and automatic iteration (for x in obj)",
        "Converts the object into a float",
        "Forces compilation to C"
      ],
      "correctIndex": 1,
      "explanation": "Implementing __getitem__ and __len__ fulfills Python's Sequence Protocol, enabling bracket indexing, slicing, membership tests (in), and iteration without explicit iterator classes."
    },
    {
      "id": "py-q7",
      "question": "What does a Python function containing the 'yield' keyword return when invoked?",
      "options": [
        "The yielded value immediately as an integer",
        "A Generator object that lazily produces values one-at-a-time via the iterator protocol (__next__)",
        "A complete list of all values in memory",
        "None"
      ],
      "correctIndex": 1,
      "explanation": "Functions containing 'yield' become generator functions. Calling them returns a generator iterator that freezes state and yields values on demand, saving memory compared to building lists."
    },
    {
      "id": "py-q8",
      "question": "In Python's asyncio framework, what role does the Event Loop play?",
      "options": [
        "It manages multi-threaded thread pools",
        "It schedules, coordinates, and executes cooperative asynchronous tasks and handles non-blocking I/O multiplexing in a single thread",
        "It compiles Python to machine code",
        "It measures CPU clock cycles"
      ],
      "correctIndex": 1,
      "explanation": "The asyncio event loop runs in a single thread, multiplexing concurrent I/O operations. When a coroutine yields control via 'await', the loop executes other ready tasks without OS thread context switching."
    },
    {
      "id": "py-q9",
      "question": "What happens when an asynchronous coroutine executes 'await asyncio.sleep(1)'?",
      "options": [
        "It blocks the entire operating system thread for 1 second",
        "It suspends execution of the current coroutine and yields control back to the event loop, allowing other concurrent coroutines to run during the 1-second delay",
        "It spawns a new process",
        "It triggers a garbage collection cycle"
      ],
      "correctIndex": 1,
      "explanation": "asyncio.sleep() is non-blocking. Yielding with await suspends the current task and registers a timer with the event loop, which continues servicing other concurrent coroutines."
    },
    {
      "id": "py-q10",
      "question": "What protocol methods must a Python class implement to support the 'with' statement context management?",
      "options": [
        "__enter__() and __exit__()",
        "__start__() and __stop__()",
        "__open__() and __close__()",
        "__init__() and __del__()"
      ],
      "correctIndex": 0,
      "explanation": "Context managers implement __enter__() (executed before entering the with block) and __exit__(exc_type, exc_val, exc_tb) (guaranteed cleanup upon exiting the block, even on exceptions)."
    },
    {
      "id": "py-q11",
      "question": "What is the Method Resolution Order (MRO) algorithm used in Python 3 for multiple inheritance?",
      "options": [
        "Depth-First Search (DFS)",
        "Breadth-First Search (BFS)",
        "C3 Superclass Linearization algorithm",
        "Random tie-breaking"
      ],
      "correctIndex": 2,
      "explanation": "Python uses the C3 Linearization algorithm to determine MRO (accessible via Class.__mro__), preserving local precedence order and monotonicity without ambiguity in diamond inheritance."
    },
    {
      "id": "py-q12",
      "question": "What is the primary memory optimization benefit of declaring '__slots__' in a Python class?",
      "options": [
        "Prevents inheritance",
        "Prevents the automatic creation of the per-instance '__dict__' hash table, saving significant memory when instantiating millions of small objects",
        "Encrypts instance variables",
        "Forces GPU acceleration"
      ],
      "correctIndex": 1,
      "explanation": "Normally, every instance has a dynamic __dict__ dictionary storing attributes. Defining __slots__ allocates a compact fixed-size array of pointers, cutting memory usage drastically."
    },
    {
      "id": "py-q13",
      "question": "What is the danger of using a mutable default argument like 'def append_to(item, target_list=[])' in Python?",
      "options": [
        "Syntax error",
        "The default list is instantiated once at function definition time and shared across all subsequent invocations, causing unexpected data accumulation",
        "Python converts it to a tuple",
        "It leaks memory to disk"
      ],
      "correctIndex": 1,
      "explanation": "Default arguments are evaluated once when the function is defined. If mutable (like []), subsequent calls modify the same persistent list instance. Standard idiom uses target_list=None."
    },
    {
      "id": "py-q14",
      "question": "What is the difference between 'is' and '==' operators in Python?",
      "options": [
        "'is' checks value equality; '==' checks memory address identity",
        "'is' checks object identity (whether two references point to the exact same memory address id(a) == id(b)); '==' checks value equality (__eq__)",
        "They are identical in Python 3",
        "'is' is only used for strings"
      ],
      "correctIndex": 1,
      "explanation": "'==' evaluates whether two objects hold equivalent values (calling __eq__). 'is' checks reference identity, evaluating True if and only if both variables point to the exact same memory location."
    },
    {
      "id": "py-q15",
      "question": "What is a Metaclass in Python?",
      "options": [
        "A class that inherits from multiple parents",
        "A class whose instances are themselves classes ('the class of a class', default being 'type')",
        "A class declared inside a function",
        "An abstract base class"
      ],
      "correctIndex": 1,
      "explanation": "In Python, classes are objects. A metaclass is the blueprint that constructs classes (as type constructs int, str, class). Custom metaclasses inherit from type to intercept class creation."
    },
    {
      "id": "py-q16",
      "question": "What does functools.wraps do when writing custom Python function decorators?",
      "options": [
        "Compiles the function to Cython",
        "Copies original function metadata (such as __name__, __doc__, and __annotations__) to the inner wrapper function to preserve introspection",
        "Converts the function to an async coroutine",
        "Caches return values"
      ],
      "correctIndex": 1,
      "explanation": "@functools.wraps(fn) updates the wrapper function's __name__, __doc__, and module to match the wrapped function, preventing decorators from masking original function metadata."
    },
    {
      "id": "py-q17",
      "question": "What is the purpose of the 'multiprocessing' module compared to 'threading' for CPU-bound tasks in Python?",
      "options": [
        "multiprocessing runs inside a single thread",
        "multiprocessing spawns separate OS processes each with its own Python interpreter and GIL, achieving true parallel execution across multiple CPU cores",
        "threading bypasses the GIL for CPU tasks",
        "multiprocessing requires cloud hardware"
      ],
      "correctIndex": 1,
      "explanation": "Because the CPython GIL restricts multithreading to one CPU core at a time, the multiprocessing module circumvents the GIL by spawning independent OS processes that run in parallel."
    },
    {
      "id": "py-q18",
      "question": "What is the time complexity of looking up a key in a Python dictionary (dict) on average?",
      "options": [
        "O(1)",
        "O(log N)",
        "O(N)",
        "O(N log N)"
      ],
      "correctIndex": 0,
      "explanation": "Python dictionaries are implemented as highly optimized hash tables (compact array since Python 3.6), achieving expected O(1) time complexity for key lookups, insertions, and deletions."
    },
    {
      "id": "py-q19",
      "question": "What happens when 'copy.deepcopy(x)' is called on a nested Python structure?",
      "options": [
        "It only copies references to top-level elements",
        "It recursively constructs duplicates of all nested container objects and child elements, ensuring modifications do not affect the original structure",
        "It returns an immutable tuple",
        "It serializes x to JSON"
      ],
      "correctIndex": 1,
      "explanation": "A shallow copy (copy.copy()) only duplicates the outer container, sharing references to nested children. copy.deepcopy() recursively clones the entire object graph."
    },
    {
      "id": "py-q20",
      "question": "What is the purpose of the 'nonlocal' keyword in Python?",
      "options": [
        "Declares a variable in global module scope",
        "Allows binding and modifying variables in the nearest enclosing (outer) non-global scope inside nested functions",
        "Exports variables to external packages",
        "Disables garbage collection"
      ],
      "correctIndex": 1,
      "explanation": "The nonlocal keyword allows nested functions to assign to variables residing in an outer enclosing function's scope without creating a new local shadow variable."
    },
    {
      "id": "py-q21",
      "question": "What built-in function returns an iterator of tuples containing index counts and values: (0, seq[0]), (1, seq[1])...?",
      "options": [
        "zip()",
        "enumerate()",
        "iter()",
        "range()"
      ],
      "correctIndex": 1,
      "explanation": "enumerate(iterable, start=0) yields sequential count indices paired with elements from an iterable, avoiding manual counter incrementation in loops."
    },
    {
      "id": "py-q22",
      "question": "What is the result of the list comprehension [x**2 for x in range(5) if x % 2 != 0]?",
      "options": [
        "[0, 1, 4, 9, 16]",
        "[1, 9]",
        "[1, 4, 9]",
        "[4, 16]"
      ],
      "correctIndex": 1,
      "explanation": "range(5) produces 0, 1, 2, 3, 4. Filtering for odd numbers (x % 2 != 0) selects 1 and 3. Squaring them yields 1\u00b2 = 1 and 3\u00b2 = 9: [1, 9]."
    },
    {
      "id": "py-q23",
      "question": "What module in Python standard library provides thread-safe double-ended queues with fast O(1) appends and pops from both ends?",
      "options": [
        "collections.deque",
        "queue.Queue",
        "heapq",
        "array"
      ],
      "correctIndex": 0,
      "explanation": "collections.deque is implemented as a doubly linked list of fixed-size blocks, providing memory-efficient, O(1) operations for append, appendleft, pop, and popleft."
    },
    {
      "id": "py-q24",
      "question": "What is the purpose of 'sys.setrecursionlimit()' in Python?",
      "options": [
        "To change heap memory size",
        "To adjust the maximum call stack depth allowed for recursive function invocations (default is typically 1000) to prevent C-stack overflow",
        "To increase multi-core threads",
        "To restrict loop iterations"
      ],
      "correctIndex": 1,
      "explanation": "Python enforces a recursion depth ceiling (default 1000) to protect the underlying C stack from buffer overflow crashes, adjustable via sys.setrecursionlimit()."
    },
    {
      "id": "py-q25",
      "question": "In Python 3, how does integer division behave when dividing two integers using the single slash operator (/) versus double slash (//)?",
      "options": [
        "/ performs float division (e.g. 5 / 2 = 2.5); // performs floor integer division (e.g. 5 // 2 = 2)",
        "/ performs integer division; // performs modulus",
        "They are identical in Python 3",
        "/ rounds to nearest integer"
      ],
      "correctIndex": 0,
      "explanation": "In Python 3, the single slash (/) always returns a floating-point number (true division), while the double slash (//) returns the truncated floor integer."
    }
  ],
  "ai-ml": [
    {
      "id": "aiml-q1",
      "question": "What is the fundamental mechanism used to calculate gradients of the loss function with respect to all network weights in an artificial neural network?",
      "options": [
        "Random search",
        "Backpropagation applying the calculus chain rule backward from the output layer to the input layer",
        "Genetic mutation",
        "Simulated annealing"
      ],
      "correctIndex": 1,
      "explanation": "Backpropagation computes partial derivatives of the scalar loss function with respect to every weight parameter by applying the multivariable calculus chain rule backward through layers."
    },
    {
      "id": "aiml-q2",
      "question": "What problem occurs during backpropagation in deep neural networks using Sigmoid or Tanh activations when gradients become infinitesimally small in early layers?",
      "options": [
        "Exploding gradient problem",
        "Vanishing gradient problem",
        "Dying ReLU problem",
        "Overfitting"
      ],
      "correctIndex": 1,
      "explanation": "Sigmoid and Tanh activations have derivatives strictly bounded < 1 (Sigmoid derivative max is 0.25). Multiplying these fractions across many layers causes gradients to decay exponentially toward zero, halting early layer training."
    },
    {
      "id": "aiml-q3",
      "question": "What is the mathematical definition and advantage of the Rectified Linear Unit (ReLU) activation function f(x) = max(0, x)?",
      "options": [
        "It scales outputs between -1 and +1",
        "Its derivative is 1 for all x > 0, completely preventing gradient saturation and speeding up gradient descent convergence",
        "It is non-differentiable at infinity",
        "It eliminates the need for biases"
      ],
      "correctIndex": 1,
      "explanation": "ReLU(x) = max(0, x). For all positive activations (x > 0), the gradient is constant 1, eliminating the vanishing gradient problem and computing dramatically faster than exponentials."
    },
    {
      "id": "aiml-q4",
      "question": "What is the Softmax function used for in the final layer of a multi-class neural network classifier?",
      "options": [
        "To filter out negative weights",
        "To normalize raw logits into a valid probability distribution where all values lie in (0, 1) and sum up to 1.0",
        "To perform dimensionality reduction",
        "To compute Euclidean distance"
      ],
      "correctIndex": 1,
      "explanation": "Softmax transforms a vector of raw logits z into probabilities: P(y=k) = e^(z_k) / \u2211 e^(z_j). Exponentiation ensures positivity and the denominator forces all probabilities to sum to 1.0."
    },
    {
      "id": "aiml-q5",
      "question": "What is the difference between L1 Regularization (Lasso) and L2 Regularization (Ridge) in loss function penalties?",
      "options": [
        "L1 penalizes sum of squared weights; L2 penalizes absolute weights",
        "L1 penalizes absolute weights (\u03bb \u2211|w|), driving weights to exact zeros (sparse feature selection); L2 penalizes squared weights (\u03bb \u2211w\u00b2), shrinking weights smoothly toward zero",
        "L1 is only used in classification; L2 in regression",
        "L2 causes underfitting always"
      ],
      "correctIndex": 1,
      "explanation": "L1 regularization adds penalty \u03bb \u2211|w_i|, producing sparse weight vectors where unimportant features become zero. L2 regularization adds \u03bb \u2211w_i\u00b2, penalizing large weights and preventing dominant parameters."
    },
    {
      "id": "aiml-q6",
      "question": "How does Dropout regularization work during training of deep neural networks?",
      "options": [
        "It permanently deletes slow neurons",
        "It randomly deactivates (zeroes out) a fraction p of neurons during each forward training pass, preventing co-adaptation of feature detectors",
        "It drops training labels",
        "It reduces learning rate by half"
      ],
      "correctIndex": 1,
      "explanation": "Dropout randomly sets activations to 0 with probability p during forward passes. This forces the network to learn robust, redundant representations and acts as an ensemble over sub-networks."
    },
    {
      "id": "aiml-q7",
      "question": "What is the Bias-Variance tradeoff in supervised machine learning models?",
      "options": [
        "High bias causes overfitting; high variance causes underfitting",
        "High bias represents an oversimplified model failing to capture underlying trends (underfitting); high variance represents overfitting where model models training noise and fails to generalize",
        "Bias and variance are identical metrics",
        "Both should be maximized simultaneously"
      ],
      "correctIndex": 1,
      "explanation": "Underfitting (high bias) misses data structure due to overly rigid assumptions. Overfitting (high variance) memorizes training noise, performing poorly on unseen validation sets. Optimal models balance the two."
    },
    {
      "id": "aiml-q8",
      "question": "In a 2D Convolutional Neural Network (CNN) layer, what formula calculates the spatial output dimension W_out for input width W, filter size F, padding P, and stride S?",
      "options": [
        "W_out = (W - F + 2P) / S + 1",
        "W_out = (W + F - P) / S",
        "W_out = W \u00b7 S / F",
        "W_out = (W - F) / (S + P)"
      ],
      "correctIndex": 0,
      "explanation": "The standard CNN spatial dimension formula is W_out = floor((W - F + 2P) / S) + 1, accounting for padding borders P, filter reception window F, and convolution stride step S."
    },
    {
      "id": "aiml-q9",
      "question": "What is the primary role of Max Pooling layers in Convolutional Neural Networks?",
      "options": [
        "To increase the number of channels",
        "To downsample feature maps, reducing spatial resolution and computational parameters while introducing translation invariance",
        "To compute gradients",
        "To normalize pixel values"
      ],
      "correctIndex": 1,
      "explanation": "Max pooling extracts the maximum value in local sliding windows (e.g. 2\u00d72 stride 2), halving spatial dimensions, cutting computation, and making representations invariant to small translations."
    },
    {
      "id": "aiml-q10",
      "question": "What is Batch Normalization (BatchNorm) designed to achieve in deep neural networks?",
      "options": [
        "To sort training batches",
        "To normalize layer activations across the mini-batch to have zero mean and unit variance, mitigating internal covariate shift and stabilizing training",
        "To replace activation functions",
        "To encrypt gradients"
      ],
      "correctIndex": 1,
      "explanation": "Batch Normalization normalizes the distribution of layer inputs across each training mini-batch using learned scale (\u03b3) and shift (\u03b2) parameters, enabling higher learning rates and faster convergence."
    },
    {
      "id": "aiml-q11",
      "question": "What splitting criterion does the CART algorithm use for constructing classification decision trees?",
      "options": [
        "Euclidean distance",
        "Gini Impurity (or Information Gain / Entropy)",
        "Mean Squared Error",
        "Cosine similarity"
      ],
      "correctIndex": 1,
      "explanation": "Classification trees split on features that maximize reduction in impurity. CART uses Gini Impurity (1 - \u2211 p_i\u00b2), while ID3/C4.5 use Information Gain based on Shannon Entropy."
    },
    {
      "id": "aiml-q12",
      "question": "How does a Random Forest ensemble improve upon a single decision tree?",
      "options": [
        "It trains one tree for more epochs",
        "It combines bagging (bootstrap aggregating) with random feature selection across an ensemble of decorrelated decision trees, dramatically reducing model variance",
        "It converts decision trees into neural networks",
        "It eliminates false positives completely"
      ],
      "correctIndex": 1,
      "explanation": "Individual trees are prone to high variance. Random Forest builds hundreds of trees on bootstrapped data subsets and randomly restricts splitting features, decorrelating trees and averaging variance down."
    },
    {
      "id": "aiml-q13",
      "question": "What is the difference between Bagging and Boosting ensemble techniques?",
      "options": [
        "Bagging trains models sequentially; Boosting trains models in parallel",
        "Bagging (e.g. Random Forest) trains independent base models in parallel on bootstrapped subsets; Boosting (e.g. XGBoost, AdaBoost) trains models sequentially where each model corrects errors of predecessor models",
        "Bagging is for regression only; Boosting for classification only",
        "They are identical algorithms"
      ],
      "correctIndex": 1,
      "explanation": "Bagging aggregates independently trained parallel models to reduce variance. Boosting fits sequential weak learners where each new model gives higher weight to instances misclassified by earlier models."
    },
    {
      "id": "aiml-q14",
      "question": "What optimization algorithm combines the advantages of AdaGrad (adaptive learning rates) and RMSprop with Momentum (moving averages of past gradients and squared gradients)?",
      "options": [
        "Stochastic Gradient Descent (SGD)",
        "Adam (Adaptive Moment Estimation)",
        "Newton-Raphson",
        "L-BFGS"
      ],
      "correctIndex": 1,
      "explanation": "Adam computes exponential moving averages of both the gradient (first moment / momentum) and the squared gradient (second uncentered moment), scaling steps adaptively for each parameter."
    },
    {
      "id": "aiml-q15",
      "question": "What is the core mathematical formula for Scaled Dot-Product Attention in the Transformer architecture?",
      "options": [
        "Attention(Q, K, V) = Softmax(Q K\u1d40 / \u221ad_k) V",
        "Attention(Q, K, V) = Q \u00b7 K \u00b7 V",
        "Attention(Q, K, V) = Sigmoid(Q + K) \u00b7 V",
        "Attention(Q, K, V) = (Q \u00b7 V) / K"
      ],
      "correctIndex": 0,
      "explanation": "Scaled dot-product attention computes query-key similarity matrices scaled by 1/\u221ad_k to prevent gradient vanishing in large dimensions: Attention(Q, K, V) = softmax(QK\u1d40 / \u221ad_k) V."
    },
    {
      "id": "aiml-q16",
      "question": "Why is the scaling factor (1 / \u221ad_k) included in the Transformer Scaled Dot-Product Attention equation?",
      "options": [
        "To convert integers into floats",
        "To prevent dot products from growing excessively large for high dimensions d_k, which would push Softmax into regions with extremely small gradients",
        "To ensure probabilities sum to zero",
        "To perform layer normalization"
      ],
      "correctIndex": 1,
      "explanation": "For large d_k, dot products Q\u00b7K have variance d_k. Scaling by 1/\u221ad_k stabilizes variance to 1, preventing the Softmax function from saturating into regions with near-zero gradients."
    },
    {
      "id": "aiml-q17",
      "question": "What architectural innovation enables the Transformer model to process entire sequence tokens in parallel without sequential recurrent recurrence (RNNs)?",
      "options": [
        "Positional Encodings combined with Multi-Head Self-Attention mechanisms",
        "Hidden Markov chains",
        "Convolutional Max-pooling",
        "Bidirectional LSTMs"
      ],
      "correctIndex": 0,
      "explanation": "Self-attention computes token-to-token relationships across all positions simultaneously in matrix multiplications. Positional encodings inject token sequence order without recurrent loops."
    },
    {
      "id": "aiml-q18",
      "question": "What is the Receiver Operating Characteristic (ROC) curve plotting?",
      "options": [
        "Accuracy vs Loss",
        "True Positive Rate (Sensitivity / Recall) on the y-axis versus False Positive Rate (1 - Specificity) on the x-axis across classification thresholds",
        "Precision vs Training time",
        "Bias vs Variance"
      ],
      "correctIndex": 1,
      "explanation": "The ROC curve plots TPR (y-axis) against FPR (x-axis) across all possible decision thresholds. The Area Under the Curve (AUC-ROC) measures overall discriminative capability."
    },
    {
      "id": "aiml-q19",
      "question": "What is the F1-Score in binary classification and why is it preferred over raw Accuracy on imbalanced datasets?",
      "options": [
        "Arithmetic mean of True Positives and False Positives",
        "Harmonic mean of Precision and Recall: 2 \u00b7 (Precision \u00b7 Recall) / (Precision + Recall), giving balanced evaluation when classes are skewed",
        "Ratio of correct predictions to total samples",
        "Product of specificity and sensitivity"
      ],
      "correctIndex": 1,
      "explanation": "On imbalanced datasets (e.g. 99% negative class), predicting all negatives gives 99% accuracy but zero usefulness. The F1-score balances Precision and Recall via their harmonic mean."
    },
    {
      "id": "aiml-q20",
      "question": "What unsupervised clustering algorithm partitions N data points into K clusters by iteratively assigning points to the nearest centroid and recomputing centroids?",
      "options": [
        "K-Means clustering",
        "DBSCAN",
        "Principal Component Analysis (PCA)",
        "Hierarchical agglomerative clustering"
      ],
      "correctIndex": 0,
      "explanation": "K-Means alternates between: 1) assigning each point to its nearest centroid based on Euclidean distance, and 2) updating centroids to the mean of their assigned points, minimizing within-cluster variance."
    },
    {
      "id": "aiml-q21",
      "question": "In Principal Component Analysis (PCA), what do the principal components represent geometrically?",
      "options": [
        "Random orthogonal projections",
        "Orthogonal axes of maximum variance in the feature space, corresponding to the eigenvectors of the data covariance matrix",
        "Decision boundaries between classes",
        "Cluster centroids"
      ],
      "correctIndex": 1,
      "explanation": "PCA projects data onto orthogonal eigenvectors of the covariance matrix ordered by eigenvalues, capturing the maximum possible variance along each successive principal component."
    },
    {
      "id": "aiml-q22",
      "question": "What is the 'Kernel Trick' in Support Vector Machines (SVM)?",
      "options": [
        "Compiling SVM to OS kernel code",
        "Computing inner products in high-dimensional (or infinite-dimensional) feature space using kernel functions (e.g. RBF) without explicitly mapping data points into that space",
        "Approximating support vectors with random points",
        "Inverting the covariance matrix"
      ],
      "correctIndex": 1,
      "explanation": "The kernel trick computes K(x, z) = \u27e8\u03c6(x), \u03c6(z)\u27e9 directly, allowing non-linear decision boundaries in high dimensions with computational cost dependent only on the original input dimensions."
    },
    {
      "id": "aiml-q23",
      "question": "What is the difference between Generative models and Discriminative models in machine learning?",
      "options": [
        "Discriminative models learn the joint probability P(X, Y); Generative models learn the conditional probability P(Y|X)",
        "Discriminative models model the decision boundary P(Y|X) directly; Generative models model the underlying data distribution P(X|Y) and P(X) to generate new samples (e.g. Naive Bayes, GANs, VAEs)",
        "Generative models can only do classification",
        "Discriminative models generate synthetic images"
      ],
      "correctIndex": 1,
      "explanation": "Discriminative models (e.g. Logistic Regression, SVM) learn decision boundaries P(Y|X). Generative models (e.g. Naive Bayes, GANs) model the joint distribution P(X, Y), enabling generation of synthetic data."
    },
    {
      "id": "aiml-q24",
      "question": "What is the role of the Generator and Discriminator networks in a Generative Adversarial Network (GAN)?",
      "options": [
        "They train cooperatively to classify images",
        "The Generator produces synthetic fake samples from random latent noise, while the Discriminator tries to distinguish real training samples from fake samples in a minimax zero-sum game",
        "The Discriminator creates data; the Generator removes noise",
        "Both networks classify audio"
      ],
      "correctIndex": 1,
      "explanation": "GANs set up a two-player minimax game: the Generator G(z) creates realistic synthetic data, while the Discriminator D(x) attempts to distinguish real data from fakes, driving both networks to improve."
    },
    {
      "id": "aiml-q25",
      "question": "In Reinforcement Learning, what is the Bellman Equation used for in Q-Learning and Value Iteration?",
      "options": [
        "To calculate image convolutions",
        "To recursively express the value of a state (or state-action pair Q(s, a)) as the immediate reward plus the discounted expected value of the next state: Q(s, a) = R + \u03b3 max Q(s', a')",
        "To compute gradient descent learning rates",
        "To prevent overfitting"
      ],
      "correctIndex": 1,
      "explanation": "The Bellman Optimality Equation breaks value functions into two components: the immediate reward R(s, a) and the discounted value of optimal future states \u03b3 max_{a'} Q(s', a'), enabling dynamic programming RL algorithms."
    }
  ],
  "python_datascience": [
    {
      "id": "pyds-q1",
      "question": "In Python NumPy, what is the key difference between a view and a copy of an ndarray?",
      "options": [
        "A view shares the underlying data buffer with the original array; modifications to the view mutate the original array.",
        "A copy always executes in O(1) time while a view executes in O(n) time.",
        "A view allocates separate memory while a copy does not.",
        "NumPy arrays cannot create copies, only deep views."
      ],
      "correctIndex": 0,
      "explanation": "NumPy slicing returns a view that references the original array's memory buffer without duplicating data. Modifying a slice directly modifies the original array, unlike copy()."
    },
    {
      "id": "pyds-q2",
      "question": "In Pandas, what is the time complexity of selecting a row using .loc[label] vs integer-indexed .iloc[pos] on a sorted index?",
      "options": [
        "O(n) for both",
        "O(1) average lookup using hash or B-tree index structures in Pandas index tables",
        "O(n log n) because binary search must re-sort the table",
        "O(n^2) for large DataFrames"
      ],
      "correctIndex": 1,
      "explanation": "Pandas Index objects maintain hash tables or search trees for O(1) average key lookups in .loc and direct array indexing in .iloc."
    },
    {
      "id": "pyds-q3",
      "question": "What is broadcasting in NumPy and what rule dictates whether two dimensions are compatible?",
      "options": [
        "Transmitting data over network sockets",
        "Two dimensions are compatible if they are equal, or one of them is equal to 1",
        "Both arrays must have identical total byte sizes",
        "Broadcasting only works for 1-dimensional vectors"
      ],
      "correctIndex": 1,
      "explanation": "Under NumPy broadcasting rules, trailing dimensions are compared backward. Two dimensions are compatible if they match or if either is 1."
    },
    {
      "id": "pyds-q4",
      "question": "What is the purpose of the Python GIL (Global Interpreter Lock) in CPython?",
      "options": [
        "To speed up multi-threaded CPU-bound calculations",
        "A mutex mechanism that ensures only one thread executes Python bytecode at any instant, simplifying memory management and reference counting",
        "To prevent network packet collision",
        "To lock system files against unauthorized writes"
      ],
      "correctIndex": 1,
      "explanation": "CPython uses the GIL to prevent race conditions during memory allocation and reference counting. As a result, pure Python multi-threading does not achieve parallel speedup for CPU-bound tasks without multiprocessing."
    },
    {
      "id": "pyds-q5",
      "question": "Which scikit-learn preprocessing tool scales features so each feature has zero mean and unit variance?",
      "options": [
        "MinMaxScaler",
        "StandardScaler",
        "RobustScaler",
        "Normalizer"
      ],
      "correctIndex": 1,
      "explanation": "StandardScaler computes z = (x - \u03bc) / \u03c3, producing a distribution with zero mean and standard deviation of 1."
    },
    {
      "id": "pyds-q6",
      "question": "In Python generator functions, what happens when 'yield' is executed instead of 'return'?",
      "options": [
        "The function exits permanently and garbage collects its frame",
        "The function suspends execution, yields the value to the caller, and preserves its entire execution stack state for the next call",
        "It throws a StopIteration exception immediately",
        "It converts the returned object to a NumPy array"
      ],
      "correctIndex": 1,
      "explanation": "yield pauses the generator frame and returns a value. When __next__() is called again, execution resumes exactly where it stopped."
    },
    {
      "id": "pyds-q7",
      "question": "In statistical data science, what does p-value represent in hypothesis testing?",
      "options": [
        "The probability that the alternative hypothesis is true",
        "The probability of observing test results at least as extreme as the actual results, assuming the null hypothesis (H0) is true",
        "The measurement accuracy percentage of the model",
        "The Pearson correlation coefficient"
      ],
      "correctIndex": 1,
      "explanation": "The p-value is the probability under the null hypothesis of obtaining a result equal to or more extreme than what was observed. A p < 0.05 indicates statistical significance against H0."
    },
    {
      "id": "pyds-q8",
      "question": "In machine learning classification, when classes are heavily imbalanced (99% negative, 1% positive), why is Accuracy a misleading metric?",
      "options": [
        "Accuracy cannot be calculated on binary labels",
        "A naive model predicting 'negative' for every sample scores 99% accuracy while failing to detect a single positive instance; Precision, Recall, and PR-AUC are required",
        "Accuracy is only applicable to regression problems",
        "Accuracy requires equal variance across all features"
      ],
      "correctIndex": 1,
      "explanation": "Class imbalance causes accuracy paradox: predicting only the majority class gives high accuracy but zero utility. Recall, Precision, F1-score, and AUC-ROC are the required evaluation metrics."
    },
    {
      "id": "pyds-q9",
      "question": "What is the primary role of Principal Component Analysis (PCA) in data science?",
      "options": [
        "Supervised classification of categorical labels",
        "Linear unsupervised dimensionality reduction that projects data onto orthogonal axes of maximum variance",
        "Clustering data points into k Voronoi cells",
        "Generating synthetic missing values"
      ],
      "correctIndex": 1,
      "explanation": "PCA diagonalizes the empirical covariance matrix to find principal eigenvectors corresponding to directions of highest statistical variance."
    },
    {
      "id": "pyds-q10",
      "question": "In deep learning with PyTorch, what is the role of 'optimizer.zero_grad()' before 'loss.backward()'?",
      "options": [
        "To reset the learning rate to zero",
        "To clear previously accumulated gradients in tensor .grad attributes because PyTorch gradients accumulate by default on backward passes",
        "To initialize model weights with Gaussian noise",
        "To free GPU VRAM memory buffers"
      ],
      "correctIndex": 1,
      "explanation": "PyTorch accumulates gradients upon each backward() invocation. Without calling zero_grad(), new gradients would add to prior batch gradients, corrupting weight updates."
    }
  ],
  "cyber_security": [
    {
      "id": "sec-q1",
      "question": "What is the fundamental mathematical basis of RSA asymmetric public-key cryptography?",
      "options": [
        "Difficulty of finding discrete logarithms in finite fields",
        "Computational hardness of factoring large composite semiprime numbers (n = p \u00d7 q)",
        "Computing collision-resistant SHA-256 digests",
        "Solving systems of linear diophantine equations"
      ],
      "correctIndex": 1,
      "explanation": "RSA relies on the prime factorization problem: multiplying two large prime numbers p and q is easy, but factoring their product n is computationally intractable for classical algorithms."
    },
    {
      "id": "sec-q2",
      "question": "What is the key difference between symmetric (e.g., AES-256) and asymmetric (e.g., RSA-4096) encryption?",
      "options": [
        "Symmetric uses the same secret key for both encryption and decryption, whereas asymmetric uses mathematically paired public and private keys",
        "Asymmetric encryption is 1000x faster than symmetric encryption",
        "Symmetric encryption does not require any mathematical key",
        "Asymmetric encryption can only encrypt 16-byte blocks"
      ],
      "correctIndex": 0,
      "explanation": "Symmetric algorithms (AES) use one shared key for both operations and are very fast. Asymmetric algorithms use a public key for encryption and a private key for decryption."
    },
    {
      "id": "sec-q3",
      "question": "In web application security, what attack occurs when untrusted user input is directly concatenated into a backend database query?",
      "options": [
        "Cross-Site Scripting (XSS)",
        "SQL Injection (SQLi), remediated using parameterized prepared statements",
        "Cross-Site Request Forgery (CSRF)",
        "Distributed Denial of Service (DDoS)"
      ],
      "correctIndex": 1,
      "explanation": "SQL Injection allows attackers to manipulate database query logic. The definitive remediation is utilizing parameterized queries (Prepared Statements) or ORMs with strict variable binding."
    },
    {
      "id": "sec-q4",
      "question": "What security mechanism protects against Cross-Site Request Forgery (CSRF) in web sessions?",
      "options": [
        "Adding more CSS styles to forms",
        "Synchronizer CSRF tokens validated per state-changing request and SameSite=Strict cookies",
        "Using HTTP instead of HTTPS",
        "Increasing the session timeout duration"
      ],
      "correctIndex": 1,
      "explanation": "CSRF tokens are cryptographically random, unpredictable values associated with the user's session that an external attacker site cannot forge or read."
    },
    {
      "id": "sec-q5",
      "question": "In network security, what is the purpose of TLS (Transport Layer Security) Handshake?",
      "options": [
        "To route IP packets across autonomous systems",
        "To authenticate the server identity via digital X.509 certificates, establish cipher suites, and securely exchange symmetric session keys via ECDHE",
        "To compress HTTP images for mobile delivery",
        "To assign DHCP IP addresses to client interfaces"
      ],
      "correctIndex": 1,
      "explanation": "The TLS Handshake authenticates participating endpoints using certificates and negotiates ephemeral Diffie-Hellman keys to encrypt the transport stream."
    },
    {
      "id": "sec-q6",
      "question": "What is a Buffer Overflow vulnerability and what OS mitigation technique randomizes memory segment locations?",
      "options": [
        "Address Space Layout Randomization (ASLR)",
        "Garbage Collection",
        "Virtual Memory Paging",
        "Thread Pool Scheduling"
      ],
      "correctIndex": 0,
      "explanation": "ASLR randomizes stack, heap, and library base addresses in virtual memory upon every process launch, making return-oriented programming (ROP) and fixed jump exploits substantially harder."
    },
    {
      "id": "sec-q7",
      "question": "What is the CIA Triad in information security?",
      "options": [
        "Central Intelligence Agency guidelines",
        "Confidentiality, Integrity, and Availability",
        "Cryptographic Interchange Architecture",
        "Certificate, Identity, and Authentication"
      ],
      "correctIndex": 1,
      "explanation": "The CIA Triad forms the foundational model of information security: Confidentiality (secrecy), Integrity (data authenticity and prevention of tampering), and Availability (system uptime)."
    },
    {
      "id": "sec-q8",
      "question": "In cryptographic hash functions like SHA-256, what is 'Pre-image Resistance'?",
      "options": [
        "Given a digest h, it is computationally infeasible to find any original message m such that hash(m) = h",
        "It is impossible for two hashes to have the same length",
        "The hash function can be reversed using matrix division",
        "Finding any two distinct messages with identical hashes"
      ],
      "correctIndex": 0,
      "explanation": "Pre-image resistance (one-wayness) dictates that given an output hash, reversing the calculation to discover the input message is computationally impossible."
    },
    {
      "id": "sec-q9",
      "question": "What is the primary difference between a vulnerability assessment and a penetration test?",
      "options": [
        "Vulnerability assessment identifies and catalogs known flaws, whereas penetration testing actively exploits vulnerabilities to simulate real-world attacks and assess impact",
        "Penetration testing is automated while vulnerability assessment is always manual",
        "They are completely identical terms with no distinction",
        "Vulnerability assessment only tests physical hardware"
      ],
      "correctIndex": 0,
      "explanation": "Vulnerability scanning identifies potential security gaps using automated tools, while penetration testing involves ethical hackers actively attempting exploitation to determine compromise depth."
    },
    {
      "id": "sec-q10",
      "question": "What is Zero Trust Architecture (ZTA) in modern enterprise security?",
      "options": [
        "Blocking all external internet connections permanently",
        "A security model requiring continuous verification of every user, device, and request regardless of whether they originate inside or outside the corporate perimeter ('Never Trust, Always Verify')",
        "Eliminating passwords in favor of completely unauthenticated endpoints",
        "Trusting all computers connected to the office Wi-Fi network"
      ],
      "correctIndex": 1,
      "explanation": "Zero Trust rejects the legacy castle-and-moat perimeter paradigm. It mandates mutual TLS, least-privilege access, identity-based microsegmentation, and dynamic risk assessment."
    }
  ],
  "cloud_computing": [
    {
      "id": "cloud-q1",
      "question": "What is the fundamental difference between Horizontal Scaling (Scale-out) and Vertical Scaling (Scale-up)?",
      "options": [
        "Vertical scaling adds more machines into a distributed pool; horizontal scaling adds faster RAM to one server",
        "Horizontal scaling adds more instances/nodes to handle load; vertical scaling increases the CPU, RAM, or storage of an existing single server",
        "Horizontal scaling is only possible with relational databases",
        "Vertical scaling eliminates the need for software load balancers"
      ],
      "correctIndex": 1,
      "explanation": "Scale-up increases capacity on one instance (finite hardware limits). Scale-out distributes workload across multiple nodes behind a load balancer, providing near-infinite elastic scalability."
    },
    {
      "id": "cloud-q2",
      "question": "In Kubernetes architecture, what is the role of the Kubelet on each worker node?",
      "options": [
        "It acts as the central distributed etcd key-value storage engine",
        "An agent running on each node that ensures container pods described in PodSpecs are running and healthy",
        "It executes global cluster DNS resolution",
        "It acts as the ingress HTTP reverse proxy"
      ],
      "correctIndex": 1,
      "explanation": "Kubelet is the primary node agent that registers the node with the API server and oversees container runtimes (containerd/CRI-O) to ensure pod specifications are maintained."
    },
    {
      "id": "cloud-q3",
      "question": "According to the CAP Theorem for distributed systems, what can a system guarantee during network partition?",
      "options": [
        "Both Consistency (C) and Availability (A) simultaneously",
        "Either Consistency (CP) or Availability (AP), but never both concurrently under an active network partition (P)",
        "Zero latency and infinite throughput",
        "Guaranteed partition-free hardware operation"
      ],
      "correctIndex": 1,
      "explanation": "The CAP theorem states that in the event of network partition (P), a distributed data store must trade off between returning the latest consistent data (Consistency) or remaining responsive to every query (Availability)."
    },
    {
      "id": "cloud-q4",
      "question": "What is the function of a Content Delivery Network (CDN) like Cloudflare or AWS CloudFront?",
      "options": [
        "To compile TypeScript code into WebAssembly",
        "To cache static and streaming assets across globally distributed edge Points of Presence (PoPs) close to end-users, minimizing latency and origin server load",
        "To encrypt database tables at rest",
        "To execute long-running background batch jobs"
      ],
      "correctIndex": 1,
      "explanation": "CDNs terminate TLS connections near the client and serve cached static media from edge servers, reducing Round Trip Time (RTT) and preventing origin overloading."
    },
    {
      "id": "cloud-q5",
      "question": "In serverless computing (e.g., AWS Lambda, Google Cloud Functions), what is a 'Cold Start'?",
      "options": [
        "Rebooting a physical data center server following a power failure",
        "The latency incurred when an execution environment must be newly provisioned, container initialized, and runtime code downloaded upon receiving a request after being idle",
        "Compiling Python code ahead of time",
        "Running code in cold sub-zero temperature server racks"
      ],
      "correctIndex": 1,
      "explanation": "A cold start happens when no warm, idle container instance exists to serve an incoming event, forcing the serverless orchestrator to spin up a new container sandbox."
    },
    {
      "id": "cloud-q6",
      "question": "What is Infrastructure as Code (IaC) and what tool provides declarative cloud provisioning across multiple providers?",
      "options": [
        "Terraform",
        "Postman",
        "Docker Desktop",
        "Nginx"
      ],
      "correctIndex": 0,
      "explanation": "Terraform by HashiCorp allows engineers to define cloud infrastructure declaratively using HashiCorp Configuration Language (HCL) and state files across AWS, Azure, and GCP."
    },
    {
      "id": "cloud-q7",
      "question": "What is the primary difference between Docker Containers and Virtual Machines (VMs)?",
      "options": [
        "VMs share the host OS kernel; containers run dedicated guest operating systems",
        "Containers share the host operating system kernel and isolate user space using cgroups and namespaces; VMs run a full guest OS on top of a hypervisor",
        "Containers cannot run Linux applications",
        "VMs consume significantly less RAM and boot in milliseconds"
      ],
      "correctIndex": 1,
      "explanation": "Containers virtualize at the operating system level, sharing the host Linux kernel for lightweight efficiency. VMs virtualize hardware via Type-1 or Type-2 hypervisors."
    },
    {
      "id": "cloud-q8",
      "question": "What is the function of an Amazon S3 Bucket Policy vs IAM Policy?",
      "options": [
        "IAM policies attach to identities (users, roles); S3 bucket policies attach directly to the storage resource to govern who can access the bucket",
        "S3 bucket policies can only deny access, never allow",
        "IAM policies cannot interact with Amazon S3",
        "Bucket policies only apply to EC2 instances"
      ],
      "correctIndex": 0,
      "explanation": "IAM policies are identity-based (attached to users/groups/roles), whereas S3 bucket policies are resource-based JSON policies attached directly to the bucket."
    },
    {
      "id": "cloud-q9",
      "question": "In microservices architecture, what is the role of an API Gateway?",
      "options": [
        "A single entry point that handles request routing, API composition, SSL termination, rate limiting, and centralized authentication before traffic reaches downstream microservices",
        "To replace all backend databases with JSON files",
        "To compile backend source code into binaries",
        "To store Docker container images"
      ],
      "correctIndex": 0,
      "explanation": "An API Gateway provides reverse proxy routing, token verification, throttling, metrics collection, and protocol transformation at the system perimeter."
    },
    {
      "id": "cloud-q10",
      "question": "In cloud high availability, what is an Availability Zone (AZ)?",
      "options": [
        "A time zone defined for UTC server clocks",
        "One or more discrete data centers within a geographical region with redundant power, networking, and connectivity, designed for fault isolation",
        "A software firewall port range",
        "A single rack in a server room"
      ],
      "correctIndex": 1,
      "explanation": "An Availability Zone consists of isolated data centers connected by high-speed, low-latency private fiber networks, ensuring single-datacenter failure does not bring down multi-AZ workloads."
    }
  ]
};

/**
 * Returns assessment questions for a given subject.
 * Falls back to all questions if subject is not found.
 */
export function getQuestionsForSubject(subjectId: string, limit: number = 25): AssessmentQuestion[] {
  const bank = SUBJECT_QUESTION_BANKS[subjectId];
  if (bank && bank.length > 0) {
    return bank.slice(0, limit);
  }
  // Return first available bank
  const firstKey = Object.keys(SUBJECT_QUESTION_BANKS)[0];
  return (SUBJECT_QUESTION_BANKS[firstKey] || []).slice(0, limit);
}

/**
 * Returns a balanced full-curriculum examination across all engineering subjects.
 * Samples evenly from all 10 engineering disciplines.
 */
export function getComprehensiveExamQuestions(totalCount: number = 25): AssessmentQuestion[] {
  const allSubjects = Object.keys(SUBJECT_QUESTION_BANKS);
  const questionsPerSubject = Math.max(1, Math.floor(totalCount / allSubjects.length));
  const exam: AssessmentQuestion[] = [];

  for (const sub of allSubjects) {
    const list = SUBJECT_QUESTION_BANKS[sub] || [];
    const sampled = list.slice(0, questionsPerSubject);
    exam.push(...sampled);
  }

  // If still below totalCount, fill from remaining questions
  if (exam.length < totalCount) {
    for (const sub of allSubjects) {
      const list = SUBJECT_QUESTION_BANKS[sub] || [];
      for (const q of list) {
        if (!exam.some((item) => item.id === q.id)) {
          exam.push(q);
        }
        if (exam.length >= totalCount) break;
      }
      if (exam.length >= totalCount) break;
    }
  }

  return exam.slice(0, totalCount);
}

/**
 * Flat array of all 250 accredited assessment questions
 */
export const ALL_ASSESSMENT_QUESTIONS: AssessmentQuestion[] = Object.values(SUBJECT_QUESTION_BANKS).flat();
