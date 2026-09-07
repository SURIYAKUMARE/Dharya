// ─── Study Library data ───────────────────────────────────────────────────────
// All subjects + topics live here. Pages read from this file — no hard-coded JSX.

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Topic {
  id: string;
  number: number;
  name: string;
  description: string;
  difficulty: Difficulty;
}

export interface Subject {
  id: string;           // used as the route slug  e.g. "mathematics"
  title: string;
  shortTitle: string;
  description: string;
  chapters: number;
  accent: string;       // solid hex — used for book cover gradient
  accentLight: string;  // lighter variant for card bg
  icon: string;         // emoji used on the book cover
  topics: Topic[];
}

export const SUBJECTS: Subject[] = [
  // ── 1. Engineering Mathematics ───────────────────────────────────────────
  {
    id: 'mathematics',
    title: 'Engineering Mathematics',
    shortTitle: 'Mathematics',
    description: 'Core mathematical foundations for every engineering discipline.',
    chapters: 10,
    accent: '#6366f1',
    accentLight: '#eef2ff',
    icon: '∑',
    topics: [
      { id: 'm1',  number: 1,  name: 'Matrices',                description: 'Matrix algebra, eigenvalues, and linear transformations.', difficulty: 'Beginner' },
      { id: 'm2',  number: 2,  name: 'Differential Calculus',   description: 'Derivatives, limits, continuity, and applications.', difficulty: 'Intermediate' },
      { id: 'm3',  number: 3,  name: 'Integral Calculus',       description: 'Definite & indefinite integrals and integral theorems.', difficulty: 'Intermediate' },
      { id: 'm4',  number: 4,  name: 'Differential Equations',  description: 'ODEs, PDEs, and methods of solution.', difficulty: 'Advanced' },
      { id: 'm5',  number: 5,  name: 'Vector Calculus',         description: 'Gradient, divergence, curl, and Stokes theorem.', difficulty: 'Advanced' },
      { id: 'm6',  number: 6,  name: 'Complex Numbers',         description: 'Argand plane, complex functions, and residues.', difficulty: 'Intermediate' },
      { id: 'm7',  number: 7,  name: 'Laplace Transforms',      description: 'Transform pairs, inverse transforms, and applications.', difficulty: 'Advanced' },
      { id: 'm8',  number: 8,  name: 'Fourier Series',          description: 'Periodic functions, half-range expansions.', difficulty: 'Advanced' },
      { id: 'm9',  number: 9,  name: 'Probability',             description: 'Axioms, distributions, and Bayes theorem.', difficulty: 'Intermediate' },
      { id: 'm10', number: 10, name: 'Statistics',              description: 'Mean, variance, correlation, and hypothesis testing.', difficulty: 'Intermediate' },
    ],
  },

  // ── 2. Programming in C ──────────────────────────────────────────────────
  {
    id: 'c-programming',
    title: 'Programming in C',
    shortTitle: 'C Programming',
    description: 'Structured programming, pointers, and system-level coding in C.',
    chapters: 10,
    accent: '#0ea5e9',
    accentLight: '#f0f9ff',
    icon: 'C',
    topics: [
      { id: 'c1',  number: 1,  name: 'Basics & Syntax',      description: 'Tokens, data types, operators, and first programs.', difficulty: 'Beginner' },
      { id: 'c2',  number: 2,  name: 'Control Flow',         description: 'if-else, switch, loops, and break/continue.', difficulty: 'Beginner' },
      { id: 'c3',  number: 3,  name: 'Functions',            description: 'Prototypes, recursion, and scope.', difficulty: 'Beginner' },
      { id: 'c4',  number: 4,  name: 'Arrays & Strings',     description: '1D/2D arrays, string handling functions.', difficulty: 'Intermediate' },
      { id: 'c5',  number: 5,  name: 'Pointers',             description: 'Pointer arithmetic, pointer to pointer, void pointers.', difficulty: 'Intermediate' },
      { id: 'c6',  number: 6,  name: 'Structures & Unions',  description: 'User-defined types, bit fields, and typedef.', difficulty: 'Intermediate' },
      { id: 'c7',  number: 7,  name: 'File I/O',             description: 'File operations, streams, and error handling.', difficulty: 'Intermediate' },
      { id: 'c8',  number: 8,  name: 'Dynamic Memory',       description: 'malloc, calloc, realloc, and free.', difficulty: 'Advanced' },
      { id: 'c9',  number: 9,  name: 'Preprocessor',         description: 'Macros, conditional compilation, and include guards.', difficulty: 'Intermediate' },
      { id: 'c10', number: 10, name: 'Linked Lists in C',    description: 'Singly and doubly linked list implementation.', difficulty: 'Advanced' },
    ],
  },

  // ── 3. Python Programming ────────────────────────────────────────────────
  {
    id: 'python',
    title: 'Python Programming',
    shortTitle: 'Python',
    description: 'Modern Python from basics to data science fundamentals.',
    chapters: 10,
    accent: '#f59e0b',
    accentLight: '#fffbeb',
    icon: 'Py',
    topics: [
      { id: 'py1',  number: 1,  name: 'Variables & Data Types', description: 'int, float, str, bool, and dynamic typing.', difficulty: 'Beginner' },
      { id: 'py2',  number: 2,  name: 'Conditions',             description: 'if / elif / else and ternary expressions.', difficulty: 'Beginner' },
      { id: 'py3',  number: 3,  name: 'Loops',                  description: 'for, while, list comprehensions, and generators.', difficulty: 'Beginner' },
      { id: 'py4',  number: 4,  name: 'Functions',              description: 'args, kwargs, lambda, and closures.', difficulty: 'Beginner' },
      { id: 'py5',  number: 5,  name: 'Lists & Tuples',         description: 'Sequence operations, slicing, and sorting.', difficulty: 'Beginner' },
      { id: 'py6',  number: 6,  name: 'Dictionaries & Sets',    description: 'Key-value stores, set algebra, and comprehensions.', difficulty: 'Intermediate' },
      { id: 'py7',  number: 7,  name: 'OOP',                    description: 'Classes, inheritance, dunder methods, and decorators.', difficulty: 'Intermediate' },
      { id: 'py8',  number: 8,  name: 'File Handling',          description: 'Reading, writing, and context managers.', difficulty: 'Intermediate' },
      { id: 'py9',  number: 9,  name: 'NumPy',                  description: 'Arrays, broadcasting, and linear algebra.', difficulty: 'Advanced' },
      { id: 'py10', number: 10, name: 'Pandas',                 description: 'DataFrames, groupby, merging, and CSV I/O.', difficulty: 'Advanced' },
    ],
  },

  // ── 4. Data Structures ───────────────────────────────────────────────────
  {
    id: 'data-structures',
    title: 'Data Structures',
    shortTitle: 'Data Structures',
    description: 'Fundamental data structures and algorithm analysis.',
    chapters: 9,
    accent: '#10b981',
    accentLight: '#ecfdf5',
    icon: 'DS',
    topics: [
      { id: 'ds1', number: 1, name: 'Arrays',        description: 'Static vs dynamic arrays, time complexity.', difficulty: 'Beginner' },
      { id: 'ds2', number: 2, name: 'Linked Lists',  description: 'Singly, doubly, and circular linked lists.', difficulty: 'Beginner' },
      { id: 'ds3', number: 3, name: 'Stack',         description: 'LIFO operations, expression evaluation.', difficulty: 'Beginner' },
      { id: 'ds4', number: 4, name: 'Queue',         description: 'FIFO, dequeue, priority queue.', difficulty: 'Beginner' },
      { id: 'ds5', number: 5, name: 'Trees',         description: 'BST, AVL, heaps, and traversals.', difficulty: 'Intermediate' },
      { id: 'ds6', number: 6, name: 'Graphs',        description: 'BFS, DFS, shortest path algorithms.', difficulty: 'Advanced' },
      { id: 'ds7', number: 7, name: 'Hashing',       description: 'Hash functions, collision resolution.', difficulty: 'Intermediate' },
      { id: 'ds8', number: 8, name: 'Sorting',       description: 'Merge, quick, heap, and radix sort.', difficulty: 'Intermediate' },
      { id: 'ds9', number: 9, name: 'Searching',     description: 'Linear, binary, and interpolation search.', difficulty: 'Beginner' },
    ],
  },

  // ── 5. Engineering Physics ───────────────────────────────────────────────
  {
    id: 'physics',
    title: 'Engineering Physics',
    shortTitle: 'Physics',
    description: 'Optics, quantum mechanics, and solid-state physics for engineers.',
    chapters: 9,
    accent: '#8b5cf6',
    accentLight: '#f5f3ff',
    icon: 'φ',
    topics: [
      { id: 'ph1', number: 1, name: 'Oscillations',          description: 'SHM, damping, and resonance.', difficulty: 'Intermediate' },
      { id: 'ph2', number: 2, name: 'Wave Optics',           description: 'Interference, diffraction, and polarisation.', difficulty: 'Intermediate' },
      { id: 'ph3', number: 3, name: 'Laser & Fibre Optics',  description: 'Laser types, numerical aperture, and applications.', difficulty: 'Intermediate' },
      { id: 'ph4', number: 4, name: 'Quantum Mechanics',     description: 'Wave-particle duality, Schrödinger equation.', difficulty: 'Advanced' },
      { id: 'ph5', number: 5, name: 'Electromagnetic Theory',description: 'Maxwell equations and wave propagation.', difficulty: 'Advanced' },
      { id: 'ph6', number: 6, name: 'Solid State Physics',   description: 'Crystal structure, band theory, semiconductors.', difficulty: 'Advanced' },
      { id: 'ph7', number: 7, name: 'Superconductivity',     description: 'Meissner effect and BCS theory basics.', difficulty: 'Advanced' },
      { id: 'ph8', number: 8, name: 'Acoustics',             description: 'Sound waves, ultrasound, and applications.', difficulty: 'Intermediate' },
      { id: 'ph9', number: 9, name: 'Nanotechnology',        description: 'Carbon nanotubes, quantum dots, applications.', difficulty: 'Advanced' },
    ],
  },

  // ── 6. Engineering Chemistry ─────────────────────────────────────────────
  {
    id: 'chemistry',
    title: 'Engineering Chemistry',
    shortTitle: 'Chemistry',
    description: 'Chemical thermodynamics, polymers, corrosion, and water treatment.',
    chapters: 8,
    accent: '#ec4899',
    accentLight: '#fdf2f8',
    icon: 'Ch',
    topics: [
      { id: 'ch1', number: 1, name: 'Water Technology',      description: 'Hardness, treatment, and softening methods.', difficulty: 'Beginner' },
      { id: 'ch2', number: 2, name: 'Electrochemistry',      description: 'Electrochemical cells, Nernst equation.', difficulty: 'Intermediate' },
      { id: 'ch3', number: 3, name: 'Corrosion',             description: 'Types of corrosion and prevention techniques.', difficulty: 'Intermediate' },
      { id: 'ch4', number: 4, name: 'Polymers',              description: 'Addition, condensation polymers, and plastics.', difficulty: 'Intermediate' },
      { id: 'ch5', number: 5, name: 'Fuels & Combustion',    description: 'Calorific value, bomb calorimeter, and biofuels.', difficulty: 'Intermediate' },
      { id: 'ch6', number: 6, name: 'Lubricants',            description: 'Types, properties, and flash/fire point.', difficulty: 'Beginner' },
      { id: 'ch7', number: 7, name: 'Phase Rule',            description: 'Gibbs phase rule, one- and two-component systems.', difficulty: 'Advanced' },
      { id: 'ch8', number: 8, name: 'Nanomaterials',         description: 'Synthesis, properties, and engineering applications.', difficulty: 'Advanced' },
    ],
  },

  // ── 7. Digital Electronics ───────────────────────────────────────────────
  {
    id: 'digital-electronics',
    title: 'Digital Electronics',
    shortTitle: 'Digital Electronics',
    description: 'Boolean algebra, combinational, and sequential circuits.',
    chapters: 9,
    accent: '#ef4444',
    accentLight: '#fef2f2',
    icon: '01',
    topics: [
      { id: 'de1', number: 1, name: 'Number Systems',       description: 'Binary, octal, hex, and conversions.', difficulty: 'Beginner' },
      { id: 'de2', number: 2, name: 'Boolean Algebra',      description: 'Laws, theorems, and simplification.', difficulty: 'Beginner' },
      { id: 'de3', number: 3, name: 'Logic Gates',          description: 'AND, OR, NOT, NAND, NOR, XOR gates.', difficulty: 'Beginner' },
      { id: 'de4', number: 4, name: 'Karnaugh Maps',        description: 'SOP, POS minimisation with K-map.', difficulty: 'Intermediate' },
      { id: 'de5', number: 5, name: 'Combinational Circuits',description: 'Adders, subtractors, multiplexers, decoders.', difficulty: 'Intermediate' },
      { id: 'de6', number: 6, name: 'Sequential Circuits',  description: 'Flip-flops, latches, and counters.', difficulty: 'Intermediate' },
      { id: 'de7', number: 7, name: 'Registers',            description: 'Shift registers, SISO, SIPO, PISO.', difficulty: 'Intermediate' },
      { id: 'de8', number: 8, name: 'Memories',             description: 'ROM, RAM, EPROM, and flash memory.', difficulty: 'Advanced' },
      { id: 'de9', number: 9, name: 'Programmable Logic',   description: 'PAL, PLA, FPGA basics.', difficulty: 'Advanced' },
    ],
  },

  // ── 8. Computer Organisation ─────────────────────────────────────────────
  {
    id: 'computer-organization',
    title: 'Computer Organization',
    shortTitle: 'Comp. Org.',
    description: 'CPU design, memory hierarchy, I/O, and instruction sets.',
    chapters: 9,
    accent: '#64748b',
    accentLight: '#f8fafc',
    icon: 'CO',
    topics: [
      { id: 'co1', number: 1, name: 'Basic Structure',        description: 'Von Neumann model, ALU, CU, and registers.', difficulty: 'Beginner' },
      { id: 'co2', number: 2, name: 'Instruction Set',        description: 'Addressing modes, RISC vs CISC.', difficulty: 'Intermediate' },
      { id: 'co3', number: 3, name: 'CPU Design',             description: 'Data path, control unit, and hardwiring.', difficulty: 'Advanced' },
      { id: 'co4', number: 4, name: 'Pipelining',             description: 'Pipeline stages, hazards, and stalls.', difficulty: 'Advanced' },
      { id: 'co5', number: 5, name: 'Memory Organisation',    description: 'Cache, virtual memory, and hierarchy.', difficulty: 'Intermediate' },
      { id: 'co6', number: 6, name: 'Cache Memory',           description: 'Mapping techniques, write policies.', difficulty: 'Intermediate' },
      { id: 'co7', number: 7, name: 'I/O Organisation',       description: 'DMA, interrupts, and buses.', difficulty: 'Intermediate' },
      { id: 'co8', number: 8, name: 'Arithmetic Operations',  description: 'Booth algorithm, floating-point, and IEEE 754.', difficulty: 'Advanced' },
      { id: 'co9', number: 9, name: 'Parallel Processing',    description: 'SIMD, MIMD, and multiprocessors.', difficulty: 'Advanced' },
    ],
  },

  // ── 9. Artificial Intelligence ───────────────────────────────────────────
  {
    id: 'artificial-intelligence',
    title: 'Artificial Intelligence',
    shortTitle: 'AI',
    description: 'Search strategies, knowledge representation, and expert systems.',
    chapters: 9,
    accent: '#06b6d4',
    accentLight: '#ecfeff',
    icon: 'AI',
    topics: [
      { id: 'ai1', number: 1, name: 'Introduction to AI',      description: 'History, Turing test, and AI paradigms.', difficulty: 'Beginner' },
      { id: 'ai2', number: 2, name: 'Search Strategies',       description: 'BFS, DFS, A*, and heuristic search.', difficulty: 'Intermediate' },
      { id: 'ai3', number: 3, name: 'Knowledge Representation',description: 'Logic, frames, semantic nets, and ontologies.', difficulty: 'Intermediate' },
      { id: 'ai4', number: 4, name: 'Expert Systems',          description: 'Inference engines, CLIPS, and Prolog basics.', difficulty: 'Intermediate' },
      { id: 'ai5', number: 5, name: 'Natural Language Processing',description: 'Parsing, stemming, and IR basics.', difficulty: 'Advanced' },
      { id: 'ai6', number: 6, name: 'Planning',                description: 'STRIPS, state-space, and partial-order planning.', difficulty: 'Advanced' },
      { id: 'ai7', number: 7, name: 'Uncertainty',             description: 'Bayesian reasoning and fuzzy logic.', difficulty: 'Advanced' },
      { id: 'ai8', number: 8, name: 'Machine Learning Basics', description: 'Supervised, unsupervised, and RL overview.', difficulty: 'Intermediate' },
      { id: 'ai9', number: 9, name: 'Neural Networks',         description: 'Perceptrons, backpropagation, deep learning intro.', difficulty: 'Advanced' },
    ],
  },

  // ── 10. Machine Learning ─────────────────────────────────────────────────
  {
    id: 'machine-learning',
    title: 'Machine Learning',
    shortTitle: 'ML',
    description: 'Algorithms, model evaluation, and real-world ML pipelines.',
    chapters: 9,
    accent: '#f97316',
    accentLight: '#fff7ed',
    icon: 'ML',
    topics: [
      { id: 'ml1', number: 1, name: 'ML Foundations',       description: 'Types of ML, bias-variance tradeoff, and pipelines.', difficulty: 'Beginner' },
      { id: 'ml2', number: 2, name: 'Regression',           description: 'Linear, polynomial, and logistic regression.', difficulty: 'Beginner' },
      { id: 'ml3', number: 3, name: 'Classification',       description: 'KNN, SVM, decision trees, and random forests.', difficulty: 'Intermediate' },
      { id: 'ml4', number: 4, name: 'Clustering',           description: 'K-means, DBSCAN, and hierarchical clustering.', difficulty: 'Intermediate' },
      { id: 'ml5', number: 5, name: 'Dimensionality Reduction', description: 'PCA, LDA, and t-SNE.', difficulty: 'Intermediate' },
      { id: 'ml6', number: 6, name: 'Model Evaluation',     description: 'Cross-validation, confusion matrix, ROC curve.', difficulty: 'Intermediate' },
      { id: 'ml7', number: 7, name: 'Neural Networks',      description: 'Activation functions, layers, and backprop.', difficulty: 'Advanced' },
      { id: 'ml8', number: 8, name: 'Deep Learning',        description: 'CNNs, RNNs, transformers, and transfer learning.', difficulty: 'Advanced' },
      { id: 'ml9', number: 9, name: 'Reinforcement Learning', description: 'Q-learning, policy gradient, and environments.', difficulty: 'Advanced' },
    ],
  },
];

/** Fast lookup by slug */
export function getSubject(id: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id);
}
