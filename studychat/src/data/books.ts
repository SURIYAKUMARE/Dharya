export interface Topic {
  number: number;
  name: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  formula?: string;
  questionsCount?: number;
}

export interface Book {
  id: string;
  title: string;
  shortTitle: string;
  category: 'core' | 'cs' | 'ai' | 'exam';
  categoryLabel: string; // Used for vertical rotated spine text: e.g. "MATHEMATICS", "PROGRAMMING"
  author: string;
  description: string;
  unitsCount: number;
  pages: number;
  rating: number;
  edition: string;
  badge: string;
  isbn: string;
  publisher: string;
  accent: string; // Main hex: e.g. #8B5CF6, #0EA5E9, #EF4444, #10B981, #F59E0B
  accentGradient: string; // CSS gradient for button: e.g. "from-violet-600 to-purple-700"
  accentLight: string;
  icon: string; // Emoji / Symbol
  topics: Topic[];
}

export const BOOKS: Book[] = [
  // 1. Engineering Mathematics (Violet)
  {
    id: 'mathematics',
    title: 'Engineering Mathematics',
    shortTitle: 'Mathematics',
    category: 'core',
    categoryLabel: 'MATHEMATICS',
    author: 'Dr. B.S. Grewal & Dr. H.K. Dass',
    description: 'Higher calculus, linear algebra, vector calculus, complex analysis, and numerical transforms for university and GATE prep.',
    unitsCount: 11,
    pages: 1240,
    rating: 4.9,
    edition: 'GATE & ESE Comprehensive 44th Edition',
    badge: 'GATE • ESE 2027',
    isbn: '978-81-7409-195-5',
    publisher: 'Khanna Publishers • New Delhi',
    accent: '#8B5CF6',
    accentGradient: 'from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600',
    accentLight: 'rgba(139, 92, 246, 0.15)',
    icon: '∑',
    topics: [
      { number: 1, name: 'Matrices & Linear Algebra', description: 'Matrix rank, eigenvalues, eigenvectors, Cayley-Hamilton theorem, and diagonalisation.', difficulty: 'Beginner', formula: 'det(A - λI) = 0', questionsCount: 45 },
      { number: 2, name: 'Differential Calculus & Mean Value', description: 'Rolle’s theorem, Cauchy’s mean value theorem, Taylor series expansion, and indeterminate forms.', difficulty: 'Intermediate', formula: 'f(x) = ∑ fⁿ(a)(x-a)ⁿ / n!', questionsCount: 38 },
      { number: 3, name: 'Integral & Multiple Integrals', description: 'Double and triple integrals, change of order, polar coordinates, volume and surface areas.', difficulty: 'Intermediate', formula: '∬ f(x,y) dx dy = ∬ f(r,θ) r dr dθ', questionsCount: 42 },
      { number: 4, name: 'Ordinary Differential Equations', description: 'First order ODEs, linear differential equations with constant coefficients, method of variation of parameters.', difficulty: 'Advanced', formula: 'y" + P(x)y\' + Q(x)y = R(x)', questionsCount: 50 },
      { number: 5, name: 'Partial Differential Equations', description: 'Wave, heat, and Laplace equations, separation of variables, and boundary value problems.', difficulty: 'Advanced', formula: '∂²u/∂t² = c² (∂²u/∂x²)', questionsCount: 35 },
      { number: 6, name: 'Vector Calculus & Field Theorems', description: 'Gradient, divergence, curl, line integrals, Gauss divergence, Green’s and Stokes’ theorems.', difficulty: 'Advanced', formula: '∮ F·dr = ∬ (∇×F)·dS', questionsCount: 48 },
      { number: 7, name: 'Complex Variables & Cauchy Residue', description: 'Analytic functions, Cauchy-Riemann equations, Cauchy’s integral formula, contour integration and residues.', difficulty: 'Advanced', formula: '∮ f(z) dz = 2πi ∑ Res', questionsCount: 34 },
      { number: 8, name: 'Laplace & Inverse Transforms', description: 'Definition, shifting theorems, convolution theorem, and solution to initial value problems.', difficulty: 'Intermediate', formula: 'L{f(t)} = ∫₀^∞ e^(-st) f(t) dt', questionsCount: 40 },
      { number: 9, name: 'Fourier Series & Transforms', description: 'Dirichlet conditions, half-range expansions, Fourier integral representation, and discrete Fourier basics.', difficulty: 'Advanced', formula: 'f(x) = a₀/2 + ∑(aₙ cos nx + bₙ sin nx)', questionsCount: 36 },
      { number: 10, name: 'Probability & Distributions', description: 'Axioms, conditional probability, Bayes’ theorem, Binomial, Poisson, and Gaussian normal distributions.', difficulty: 'Intermediate', formula: 'P(A|B) = [P(B|A)·P(A)] / P(B)', questionsCount: 52 },
      { number: 11, name: 'Numerical Methods & Root Finding', description: 'Newton-Raphson method, Simpson’s 1/3 rule, and Runge-Kutta 4th order numerical integration.', difficulty: 'Intermediate', formula: 'xₙ₊₁ = xₙ - f(xₙ)/f\'(xₙ)', questionsCount: 30 },
    ],
  },

  // 2. Programming in C (Blue)
  {
    id: 'c-programming',
    title: 'Programming in C',
    shortTitle: 'C Programming',
    category: 'cs',
    categoryLabel: 'PROGRAMMING',
    author: 'Dr. E. Balagurusamy & Dennis Ritchie',
    description: 'Structured programming, pointers, low-level memory control, bit manipulation, and POSIX file streams.',
    unitsCount: 10,
    pages: 620,
    rating: 4.9,
    edition: 'ANSI C Standard 8th Edition',
    badge: 'AICTE STANDARD',
    isbn: '978-93-5260-732-7',
    publisher: 'McGraw Hill Higher Education',
    accent: '#0EA5E9',
    accentGradient: 'from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600',
    accentLight: 'rgba(14, 165, 233, 0.15)',
    icon: '💻',
    topics: [
      { number: 1, name: 'Tokens, Types & Memory Layout', description: 'Data types, format specifiers, signed/unsigned ranges, and memory addresses.', difficulty: 'Beginner', formula: 'sizeof(int) == 4 bytes', questionsCount: 30 },
      { number: 2, name: 'Branching, Loops & Control Flow', description: 'if-else conditions, switch-case jump tables, while, for, and do-while loops.', difficulty: 'Beginner', formula: 'switch(expr) { case 1: ... }', questionsCount: 35 },
      { number: 3, name: 'Functions, Call Stack & Recursion', description: 'Stack frames, pass by value vs reference, tail recursion, and function prototypes.', difficulty: 'Intermediate', formula: 'int factorial(int n) { ... }', questionsCount: 40 },
      { number: 4, name: 'Arrays, Strings & Buffer Safety', description: 'Contiguous memory, row-major matrices, null-terminated strings, and buffer overflow prevention.', difficulty: 'Intermediate', formula: 'char str[] = "Hello\\0";', questionsCount: 38 },
      { number: 5, name: 'Pointers & Pointer Arithmetic', description: 'Dereferencing, double pointers (**p), void pointers, function pointers, and const qualifiers.', difficulty: 'Advanced', formula: 'int *ptr = &val; *(ptr + i)', questionsCount: 52 },
      { number: 6, name: 'Dynamic Memory Allocation', description: 'Heap memory, malloc, calloc, realloc, memory leaks, and free.', difficulty: 'Advanced', formula: 'void* p = malloc(n * sizeof(int));', questionsCount: 45 },
      { number: 7, name: 'Structures, Unions & Bitfields', description: 'User-defined structures, structure padding, memory alignment, and union memory reuse.', difficulty: 'Intermediate', formula: 'struct Node { int val; struct Node* next; };', questionsCount: 42 },
      { number: 8, name: 'File Streams & POSIX I/O', description: 'File descriptors, fopen, fread, fwrite, fscanf, fseek, and error handling with errno.', difficulty: 'Intermediate', formula: 'FILE *f = fopen("data.bin", "rb");', questionsCount: 36 },
      { number: 9, name: 'Preprocessor Directives & Macros', description: '#define macro functions, conditional compilation (#ifdef), and include guards.', difficulty: 'Intermediate', formula: '#ifndef HEADER_H #define HEADER_H', questionsCount: 28 },
      { number: 10, name: 'Bitwise Logic & System Calls', description: 'Bit shifting (<<, >>), masks, bitwise AND/OR/XOR, and hardware register manipulation.', difficulty: 'Advanced', formula: 'x = (val & (1 << bit))', questionsCount: 34 },
    ],
  },

  // 3. Mechanical Engineering (Red)
  {
    id: 'mechanical-engineering',
    title: 'Mechanical Engineering',
    shortTitle: 'Mechanical Engg.',
    category: 'core',
    categoryLabel: 'MECHANICAL',
    author: 'R.S. Khurmi & J.K. Gupta',
    description: 'Applied mechanics, strength of materials, thermodynamics, fluid machinery, and machine component design.',
    unitsCount: 10,
    pages: 1450,
    rating: 4.8,
    edition: 'Standard Handbook & 6000+ Questions',
    badge: 'GATE • ESE • PSUs',
    isbn: '978-81-219-0176-5',
    publisher: 'S. Chand & Co. Ltd.',
    accent: '#EF4444',
    accentGradient: 'from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600',
    accentLight: 'rgba(239, 68, 68, 0.15)',
    icon: '⚙️',
    topics: [
      { number: 1, name: 'Engineering Mechanics & Statics', description: 'Free body diagrams, equilibrium of forces, centroids, moments of inertia, and friction analysis.', difficulty: 'Beginner', formula: '∑ Fx = 0, ∑ Fy = 0, ∑ M = 0', questionsCount: 55 },
      { number: 2, name: 'Strength of Materials & Stresses', description: 'Stress-strain curves, Mohr’s circle, shear force and bending moment diagrams, torsion in shafts.', difficulty: 'Intermediate', formula: 'σ = E·ε, τ/r = T/J = Gθ/L', questionsCount: 60 },
      { number: 3, name: 'Theory of Machines & Mechanisms', description: 'Kinematic pairs, inversions of 4-bar chain, velocity and acceleration diagrams, gear trains, governors.', difficulty: 'Intermediate', formula: 'DOF = 3(n-1) - 2j - h', questionsCount: 44 },
      { number: 4, name: 'Machine Design & Failure Theories', description: 'Design of shafts, keys, couplings, riveted and welded joints, fatigue failure and S-N curves.', difficulty: 'Advanced', formula: 'σ_eq ≤ S_yt / FOS', questionsCount: 42 },
      { number: 5, name: 'Thermodynamics & Power Cycles', description: 'First & Second laws, Carnot, Otto, Diesel, and Rankine cycles, entropy generation and exergy.', difficulty: 'Intermediate', formula: 'dQ = dU + dW, η = 1 - (T_L/T_H)', questionsCount: 65 },
      { number: 6, name: 'Fluid Mechanics & Turbomachinery', description: 'Bernoulli’s theorem, laminar vs turbulent flow, boundary layer, Pelton, Francis, and Kaplan turbines.', difficulty: 'Advanced', formula: 'P/ρg + v²/2g + z = const', questionsCount: 50 },
      { number: 7, name: 'Heat & Mass Transfer', description: 'Conduction (Fourier’s Law), Convection (Newton’s Law, Nusselt number), Radiation (Stefan-Boltzmann).', difficulty: 'Advanced', formula: 'q = -k A (dT/dx), q = εσA(T₁⁴ - T₂⁴)', questionsCount: 46 },
      { number: 8, name: 'Manufacturing & Casting Tech', description: 'Pattern making, gating design, arc and resistance welding, sheet metal forming, CNC machining.', difficulty: 'Intermediate', formula: 'Chvorinov: t = B (V/A)²', questionsCount: 38 },
      { number: 9, name: 'Metrology, Limits, Fits & Tolerance', description: 'Interchangeability, hole basis and shaft basis systems, comparators, and surface roughness measurement.', difficulty: 'Beginner', formula: 'Tolerance = Upper - Lower Limit', questionsCount: 32 },
      { number: 10, name: 'Industrial Engg & Operations Research', description: 'Linear programming, simplex method, queuing models, PERT/CPM critical path, inventory control (EOQ).', difficulty: 'Intermediate', formula: 'EOQ = √(2DS / H)', questionsCount: 40 },
    ],
  },

  // 4. Data Structures & Algorithms (Green)
  {
    id: 'data-structures',
    title: 'Data Structures & Algorithms',
    shortTitle: 'Data Structures',
    category: 'cs',
    categoryLabel: 'DATA STRUCTURES',
    author: 'Seymour Lipschutz & Sartaj Sahni',
    description: 'Algorithm complexity, linked structures, balanced trees, graph traversal, and dynamic programming.',
    unitsCount: 10,
    pages: 890,
    rating: 4.9,
    edition: 'Algorithms & Examination Guide',
    badge: 'GATE & FAANG READY',
    isbn: '978-0-07-060168-0',
    publisher: 'Schaum’s / McGraw Hill',
    accent: '#10B981',
    accentGradient: 'from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600',
    accentLight: 'rgba(16, 185, 129, 0.15)',
    icon: '🌲',
    topics: [
      { number: 1, name: 'Asymptotic Analysis & Big-O', description: 'Time and space complexity, Best/Worst/Average cases, Big-O, Big-Omega, Big-Theta notation.', difficulty: 'Beginner', formula: 'T(n) = a T(n/b) + O(n^d)', questionsCount: 45 },
      { number: 2, name: 'Arrays & Dynamic Vectors', description: 'Contiguous storage, amortised insertion, 2D matrix mapping, sliding window pattern.', difficulty: 'Beginner', formula: 'Addr(A[i][j]) = Base + (i·N + j)·w', questionsCount: 40 },
      { number: 3, name: 'Linked Lists (Singly, Doubly, Loop)', description: 'Pointer traversal, reversal, fast & slow pointer cycle detection (Floyd’s algorithm).', difficulty: 'Beginner', formula: 'slow = slow->next; fast = fast->next->next;', questionsCount: 50 },
      { number: 4, name: 'Stacks, Infix-to-Postfix & Monotonic', description: 'LIFO evaluation, parentheses balancing, postfix conversion, and monotonic stack problems.', difficulty: 'Intermediate', formula: 'Stack.push(), Stack.pop() -> O(1)', questionsCount: 48 },
      { number: 5, name: 'Queues, Deques & Circular Buffers', description: 'FIFO queues, circular buffer modulo arithmetic, priority queue heaps, and BFS queues.', difficulty: 'Intermediate', formula: 'rear = (rear + 1) % CAPACITY', questionsCount: 38 },
      { number: 6, name: 'Binary Trees & BST Search', description: 'Tree traversals (Inorder, Preorder, Postorder), height, diameter, and LCA in binary search trees.', difficulty: 'Intermediate', formula: 'Height = 1 + max(left, right)', questionsCount: 55 },
      { number: 7, name: 'Balanced Trees: AVL & Red-Black', description: 'Rotations (LL, RR, LR, RL), balance factor (-1, 0, 1), and logarithmic height guarantees.', difficulty: 'Advanced', formula: 'BF = Height(Left) - Height(Right)', questionsCount: 36 },
      { number: 8, name: 'Graphs: BFS, DFS & Shortest Path', description: 'Adjacency list/matrix, Dijkstra’s algorithm, Bellman-Ford, Prim’s, and Kruskal’s MST.', difficulty: 'Advanced', formula: 'dist[v] = min(dist[v], dist[u] + w(u,v))', questionsCount: 60 },
      { number: 9, name: 'Sorting & Searching Algorithms', description: 'Merge sort, Quick sort with Lomuto partitioning, Binary search, and Radix sort.', difficulty: 'Intermediate', formula: 'QuickSort Avg: O(n log n)', questionsCount: 52 },
      { number: 10, name: 'Dynamic Programming Foundations', description: 'Optimal substructure, overlapping subproblems, memoization vs tabulation, knapsack problem.', difficulty: 'Advanced', formula: 'DP[i][w] = max(DP[i-1][w], val[i] + DP[i-1][w-wt[i]])', questionsCount: 65 },
    ],
  },

  // 5. Python Programming (Amber)
  {
    id: 'python',
    title: 'Python Programming',
    shortTitle: 'Python',
    category: 'cs',
    categoryLabel: 'PYTHON',
    author: 'Mark Lutz & Guido van Rossum',
    description: 'Modern Python 3, object-oriented design, vectorized computing with NumPy, Pandas, and concurrency.',
    unitsCount: 10,
    pages: 740,
    rating: 4.9,
    edition: 'Python 3.12 & Data Science Edition',
    badge: 'INDUSTRY READY',
    isbn: '978-0-19-948017-6',
    publisher: 'Oxford University Press',
    accent: '#F59E0B',
    accentGradient: 'from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600',
    accentLight: 'rgba(245, 158, 11, 0.15)',
    icon: '🐍',
    topics: [
      { number: 1, name: 'Core Syntax, Types & Memory Model', description: 'Dynamic typing, mutable vs immutable, references, garbage collection, and slices.', difficulty: 'Beginner', formula: 'id(x), type(x), list[start:end:step]', questionsCount: 35 },
      { number: 2, name: 'Data Structures & Comprehensions', description: 'Lists, tuples, dict hash-tables, sets, list/dict comprehensions, and generators.', difficulty: 'Beginner', formula: '[x**2 for x in nums if x % 2 == 0]', questionsCount: 40 },
      { number: 3, name: 'OOP, Dunder Methods & Inheritance', description: 'Classes, __init__, __repr__, inheritance, polymorphism, abstract base classes, and dataclasses.', difficulty: 'Intermediate', formula: 'class Dog(Animal): super().__init__()', questionsCount: 45 },
      { number: 4, name: 'Decorators, Closures & Context Mgrs', description: 'First-class functions, @wraps decorator pattern, closures, and `with` context protocol.', difficulty: 'Advanced', formula: 'def dec(fn): def wrap(*a, **kw): ...', questionsCount: 42 },
      { number: 5, name: 'Exception Handling & Clean Code', description: 'try-except-finally, custom exception hierarchies, assertions, and logging best practices.', difficulty: 'Intermediate', formula: 'try: ... except ValueError as err: ...', questionsCount: 30 },
      { number: 6, name: 'NumPy: N-D Arrays & Vectorization', description: 'ndarray, vectorised broadcasting, linear algebra (np.linalg), indexing, and performance.', difficulty: 'Intermediate', formula: 'arr = np.dot(matrix_a, matrix_b)', questionsCount: 48 },
      { number: 7, name: 'Pandas: DataFrames & Analytics', description: 'DataFrames, series, CSV/Parquet import, grouping, merging, pivot tables, and null handling.', difficulty: 'Intermediate', formula: 'df.groupby("dept")["salary"].mean()', questionsCount: 50 },
      { number: 8, name: 'File I/O, Serialization & JSON', description: 'pathlib file operations, json encoding/decoding, pickle, and binary streaming.', difficulty: 'Beginner', formula: 'with open("cfg.json") as f: data = json.load(f)', questionsCount: 25 },
      { number: 9, name: 'AsyncIO, Concurrency & Multithreading', description: 'async/await event loops, GIL implications, ThreadPoolExecutor, and multiprocessing.', difficulty: 'Advanced', formula: 'async def fetch(): await asyncio.sleep(1)', questionsCount: 38 },
      { number: 10, name: 'REST APIs with FastAPI & Requests', description: 'Building microservices, Pydantic data schemas, dependency injection, and HTTP requests.', difficulty: 'Advanced', formula: '@app.get("/items/{id}") async def read(): ...', questionsCount: 36 },
    ],
  },

  // 6. Engineering Physics (Indigo)
  {
    id: 'physics',
    title: 'Engineering Physics',
    shortTitle: 'Physics',
    category: 'core',
    categoryLabel: 'PHYSICS',
    author: 'Dr. M.N. Avadhanulu & Dr. P.G. Kshirsagar',
    description: 'Wave optics, lasers, fiber optics, quantum wave mechanics, Maxwell equations, and superconductivity.',
    unitsCount: 10,
    pages: 940,
    rating: 4.7,
    edition: 'Standard University Textbook',
    badge: 'UNIVERSITY STANDARD',
    isbn: '978-81-89928-85-8',
    publisher: 'Dhanpat Rai Publications',
    accent: '#6366F1',
    accentGradient: 'from-indigo-600 to-blue-700 hover:from-indigo-500 hover:to-blue-600',
    accentLight: 'rgba(99, 102, 241, 0.15)',
    icon: '⚛️',
    topics: [
      { number: 1, name: 'Wave Optics & Interference', description: 'Interference in thin films, Newton’s rings, air wedge, refractive index determination.', difficulty: 'Intermediate', formula: '2μt cos r = nλ (Bright fringe)', questionsCount: 35 },
      { number: 2, name: 'Diffraction & Polarization', description: 'Fraunhofer diffraction at single slit, diffraction grating resolving power, Brewster’s law.', difficulty: 'Intermediate', formula: '(a+b) sin θ = nλ, tan θ_p = μ', questionsCount: 32 },
      { number: 3, name: 'Lasers: He-Ne, Nd:YAG & CO2', description: 'Spontaneous & stimulated emission, population inversion, Einstein coefficients, optical resonator.', difficulty: 'Intermediate', formula: 'N₂/N₁ = exp(-ΔE / kT)', questionsCount: 38 },
      { number: 4, name: 'Fiber Optics & Signal Propagation', description: 'Total internal reflection, acceptance angle, numerical aperture, step-index vs graded-index.', difficulty: 'Intermediate', formula: 'NA = √(n₁² - n₂²)', questionsCount: 40 },
      { number: 5, name: 'Quantum Mechanics & Wave Equation', description: 'De Broglie wavelength, Heisenberg uncertainty, 1D Schrödinger wave equation in a potential box.', difficulty: 'Advanced', formula: '-ħ²/2m (d²ψ/dx²) + Vψ = Eψ', questionsCount: 46 },
      { number: 6, name: 'Electromagnetics & Maxwell Equations', description: 'Displacement current, Maxwell’s 4 differential equations, Poynting vector, and EM wave propagation.', difficulty: 'Advanced', formula: '∇·B = 0, ∇×E = -∂B/∂t', questionsCount: 44 },
      { number: 7, name: 'Solid State Physics & Band Theory', description: 'Crystal lattices, Miller indices, Kronig-Penney model, Fermi-Dirac distribution in semiconductors.', difficulty: 'Advanced', formula: 'f(E) = 1 / [1 + exp((E-Ef)/kT)]', questionsCount: 42 },
      { number: 8, name: 'Superconductivity & Meissner Effect', description: 'Critical temperature, Type-I & Type-II superconductors, BCS theory basics, and SQUID devices.', difficulty: 'Advanced', formula: 'B = μ₀(H + M) = 0 (Meissner)', questionsCount: 30 },
      { number: 9, name: 'Acoustics & Ultrasonic Transducers', description: 'Reverberation time, Sabine’s formula, piezoelectric and magnetostriction ultrasonic generation.', difficulty: 'Beginner', formula: 'T = 0.161 V / ∑(αS)', questionsCount: 28 },
      { number: 10, name: 'Nanotechnology & Quantum Dots', description: 'Quantum confinement, carbon nanotubes (CNT), graphene, synthesis and medical imaging applications.', difficulty: 'Intermediate', formula: 'E_n = n²h² / (8mL²)', questionsCount: 32 },
    ],
  },

  // 7. Digital Electronics (Orange)
  {
    id: 'digital-electronics',
    title: 'Digital Electronics & Logic Design',
    shortTitle: 'Digital Electronics',
    category: 'cs',
    categoryLabel: 'ELECTRONICS',
    author: 'M. Morris Mano & Michael D. Ciletti',
    description: 'Boolean theorems, combinational arithmetic, flip-flops, sequential finite state machines, and FPGA design.',
    unitsCount: 10,
    pages: 710,
    rating: 4.8,
    edition: 'Digital Design 6th Edition',
    badge: 'HARDWARE & GATE',
    isbn: '978-0-13-198924-5',
    publisher: 'Pearson Education Worldwide',
    accent: '#F97316',
    accentGradient: 'from-orange-600 to-amber-700 hover:from-orange-500 hover:to-amber-600',
    accentLight: 'rgba(249, 115, 22, 0.15)',
    icon: '⚡',
    topics: [
      { number: 1, name: 'Number Systems, Complements & Codes', description: 'Binary, octal, hex arithmetic, 1’s & 2’s complements, BCD, Excess-3, and Gray code conversions.', difficulty: 'Beginner', formula: '2\'s comp = 1\'s comp + 1', questionsCount: 38 },
      { number: 2, name: 'Boolean Algebra & De Morgan Laws', description: 'Boolean postulates, duality theorem, canonical SOP & POS expressions, and standard logic gates.', difficulty: 'Beginner', formula: '(A + B)\' = A\' · B\'', questionsCount: 42 },
      { number: 3, name: 'Karnaugh Maps & Minimisation', description: '2, 3, and 4-variable K-maps, prime implicants, don’t-care conditions, Quine-McCluskey tabular method.', difficulty: 'Intermediate', formula: 'Group sizes: 1, 2, 4, 8, 16', questionsCount: 46 },
      { number: 4, name: 'Combinational Arithmetic Circuits', description: 'Half and Full adders, ripple carry adders, carry lookahead generator, and full subtractors.', difficulty: 'Intermediate', formula: 'Sum = A ⊕ B ⊕ Cin, Cout = AB + Cin(A⊕B)', questionsCount: 44 },
      { number: 5, name: 'Multiplexers, Decoders & Encoders', description: '2:1, 4:1, 8:1 MUX implementation, decoders with active-low enables, priority encoders, and parity bits.', difficulty: 'Intermediate', formula: 'MUX Output = ∑ (m_i · s_i)', questionsCount: 40 },
      { number: 6, name: 'Latches & Flip-Flops (SR, JK, D, T)', description: 'Clocking, setup & hold times, race-around condition in JK, Master-Slave JK flip-flop, excitation tables.', difficulty: 'Intermediate', formula: 'Q(t+1) = J Q\' + K\' Q', questionsCount: 50 },
      { number: 7, name: 'Synchronous & Asynchronous Counters', description: 'Ripple counters, up/down counters, Mod-N synchronous counter design using state diagrams.', difficulty: 'Advanced', formula: 'Modulus = 2ⁿ states', questionsCount: 48 },
      { number: 8, name: 'Shift Registers & Ring Counters', description: 'SISO, SIPO, PISO, PIPO shift registers, Johnson ring counters, and linear feedback shift registers.', difficulty: 'Intermediate', formula: 'Johnson mod = 2n states', questionsCount: 34 },
      { number: 9, name: 'Memory Arrays: ROM, RAM & EPROM', description: 'Static RAM 6T cell vs Dynamic RAM 1T cell, refresh circuitry, ROM diode matrix, flash memory.', difficulty: 'Advanced', formula: 'Memory capacity = 2^k words × m bits', questionsCount: 36 },
      { number: 10, name: 'Programmable Logic Devices & FPGAs', description: 'PLA, PAL, CPLD, and FPGA logic blocks, Look-Up Tables (LUTs), and hardware description basics.', difficulty: 'Advanced', formula: 'PLA: Prog AND + Prog OR', questionsCount: 30 },
    ],
  },

  // 8. Artificial Intelligence (Purple)
  {
    id: 'artificial-intelligence',
    title: 'Artificial Intelligence',
    shortTitle: 'AI Foundations',
    category: 'ai',
    categoryLabel: 'ARTIFICIAL INTELLIGENCE',
    author: 'Stuart Russell & Peter Norvig',
    description: 'Heuristic search algorithms, knowledge engineering, propositional logic, game trees, and NLP systems.',
    unitsCount: 10,
    pages: 1150,
    rating: 4.9,
    edition: 'A Modern Approach 4th Global Edition',
    badge: 'CUTTING EDGE',
    isbn: '978-0-13-461099-3',
    publisher: 'Pearson Global Editions',
    accent: '#A855F7',
    accentGradient: 'from-purple-600 to-fuchsia-700 hover:from-purple-500 hover:to-fuchsia-600',
    accentLight: 'rgba(168, 85, 247, 0.15)',
    icon: '🤖',
    topics: [
      { number: 1, name: 'Intelligent Agents & Environments', description: 'PEAS descriptions, reflex vs goal-based agents, discrete vs continuous, deterministic vs stochastic domains.', difficulty: 'Beginner', formula: 'Agent = Architecture + Program', questionsCount: 30 },
      { number: 2, name: 'Uninformed Search: BFS, DFS & UCS', description: 'State space representations, Breadth-First, Depth-First, Depth-Limited, and Uniform Cost Search.', difficulty: 'Beginner', formula: 'BFS: O(b^d), DFS: O(b^m)', questionsCount: 40 },
      { number: 3, name: 'Informed A* Search & Heuristics', description: 'Heuristic design, admissibility (h(n) ≤ h*(n)), consistency, greedy best-first search, and memory-bounded A*.', difficulty: 'Intermediate', formula: 'f(n) = g(n) + h(n)', questionsCount: 48 },
      { number: 4, name: 'Adversarial Games & Alpha-Beta Cut', description: 'Game theory, Minimax algorithm in chess/tic-tac-toe, alpha-beta pruning optimization and cutoff depths.', difficulty: 'Intermediate', formula: 'α = max(α, val), β = min(β, val)', questionsCount: 42 },
      { number: 5, name: 'Constraint Satisfaction Problems', description: 'CSP variables, domains, arc consistency (AC-3), backtracking search with MRV heuristic, forward checking.', difficulty: 'Intermediate', formula: 'AC-3: D_i ← D_i - {x | no match in D_j}', questionsCount: 36 },
      { number: 6, name: 'First-Order Logic & Inference', description: 'Syntax, quantifiers (∀, ∃), unification, forward and backward chaining, resolution refutation proofs.', difficulty: 'Advanced', formula: 'UNIFY(Knows(John, x), Knows(John, Jane))', questionsCount: 45 },
      { number: 7, name: 'Classical Planning & GraphPlan', description: 'STRIPS and PDDL domain definition, state-space planning, forward state progression, and plan spaces.', difficulty: 'Advanced', formula: 'Action(Fly(p, from, to), PRECOND, EFFECT)', questionsCount: 34 },
      { number: 8, name: 'Probabilistic Reasoning & Bayes Nets', description: 'Joint probability tables, conditional independence, Bayesian network DAGs, exact variable elimination.', difficulty: 'Advanced', formula: 'P(X₁...Xₙ) = ∏ P(X_i | Parents(X_i))', questionsCount: 48 },
      { number: 9, name: 'Markov Decision Processes (MDPs)', description: 'Bellman equation, value iteration, policy iteration, discount factors, and reinforcement states.', difficulty: 'Advanced', formula: 'V*(s) = max_a ∑ T(s,a,s\')[R(s,a,s\') + γV*(s\')]', questionsCount: 40 },
      { number: 10, name: 'Natural Language Processing & LLMs', description: 'Tokenization, word embeddings (Word2Vec), transformer attention mechanism, and prompt engineering.', difficulty: 'Intermediate', formula: 'Attention(Q,K,V) = softmax(QKᵀ / √d_k)V', questionsCount: 50 },
    ],
  },

  // 9. Machine Learning (Teal)
  {
    id: 'machine-learning',
    title: 'Machine Learning',
    shortTitle: 'Machine Learning',
    category: 'ai',
    categoryLabel: 'MACHINE LEARNING',
    author: 'Tom Mitchell & Aurélien Géron',
    description: 'Supervised regression & classification, SVMs, random forests, deep neural networks, and model tuning.',
    unitsCount: 11,
    pages: 980,
    rating: 4.9,
    edition: 'Hands-On Scikit-Learn & PyTorch',
    badge: 'CUTTING EDGE',
    isbn: '978-1-492-03264-9',
    publisher: 'O’Reilly Media / Academic Press',
    accent: '#14B8A6',
    accentGradient: 'from-teal-600 to-emerald-700 hover:from-teal-500 hover:to-emerald-600',
    accentLight: 'rgba(20, 184, 166, 0.15)',
    icon: '🧠',
    topics: [
      { number: 1, name: 'ML Taxonomy & Problem Formulation', description: 'Supervised vs Unsupervised vs Reinforcement learning, feature scaling, train-validation-test split.', difficulty: 'Beginner', formula: 'Loss = (1/n) ∑ L(y_pred, y_true)', questionsCount: 35 },
      { number: 2, name: 'Linear & Ridge/Lasso Regression', description: 'Gradient descent, ordinary least squares, L1 (Lasso) feature sparsity, and L2 (Ridge) weight decay.', difficulty: 'Beginner', formula: 'J(θ) = MSE(θ) + α ∑ |θ_i| (Lasso)', questionsCount: 44 },
      { number: 3, name: 'Logistic Regression & ROC Curves', description: 'Sigmoid activation, binary cross-entropy log loss, confusion matrix, precision, recall, and AUC-ROC.', difficulty: 'Intermediate', formula: 'σ(z) = 1 / (1 + e^(-z))', questionsCount: 48 },
      { number: 4, name: 'Decision Trees, Bagging & XGBoost', description: 'Gini impurity vs entropy gain, CART tree splitting, Random Forest bagging, and gradient boosted trees.', difficulty: 'Intermediate', formula: 'Gini = 1 - ∑ p_i²', questionsCount: 52 },
      { number: 5, name: 'Support Vector Machines (SVMs)', description: 'Maximum margin hyperplanes, soft margin slack variables, and Gaussian RBF kernel tricks.', difficulty: 'Advanced', formula: 'K(x, x\') = exp(-γ ||x - x\'||²)', questionsCount: 40 },
      { number: 6, name: 'Unsupervised: K-Means & PCA', description: 'Centroid convergence, elbow method silhouette scores, Principal Component Analysis eigenvalues.', difficulty: 'Intermediate', formula: 'arg min ∑ ∑ ||x - μ_i||²', questionsCount: 38 },
      { number: 7, name: 'Neural Networks: MLP & Backprop', description: 'Multilayer perceptron forward pass, backpropagation chain rule, activation functions (ReLU, GELU).', difficulty: 'Advanced', formula: '∂L/∂w = (∂L/∂y) · (∂y/∂z) · (∂z/∂w)', questionsCount: 55 },
      { number: 8, name: 'Convolutional Networks (CNNs)', description: 'Convolution kernels, padding, stride, pooling layers, ResNet skip connections, and image classification.', difficulty: 'Advanced', formula: '(W - F + 2P)/S + 1', questionsCount: 46 },
      { number: 9, name: 'Sequence Models: RNN, LSTM & GRU', description: 'Vanishing gradients in vanilla RNN, LSTM forget and input gates, and sequential time-series forecasting.', difficulty: 'Advanced', formula: 'f_t = σ(W_f · [h_{t-1}, x_t] + b_f)', questionsCount: 42 },
      { number: 10, name: 'Attention Mechanism & Transformers', description: 'Self-attention query-key-value vectors, multi-head attention, positional encoding, encoder-decoder architectures.', difficulty: 'Advanced', formula: 'MultiHead(Q,K,V) = Concat(head₁...head_h)W^O', questionsCount: 50 },
      { number: 11, name: 'Model Evaluation, Bias-Variance & MLOps', description: 'K-fold cross-validation, hyperparameter tuning (GridSearchCV/Optuna), data drift, and deployment.', difficulty: 'Intermediate', formula: 'Total Error = Bias² + Variance + Irreducible Noise', questionsCount: 36 },
    ],
  },
];
