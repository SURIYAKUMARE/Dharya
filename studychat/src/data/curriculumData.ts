export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TopicExplanation {
  id: string;
  subjectId: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedMinutes: number;
  simpleExplanation: string;
  detailedExplanation: string;
  importantConcepts: string[];
  examples: Array<{ title: string; problem: string; solution: string }>;
  formulasOrCode: {
    type: 'formula' | 'code';
    language?: string;
    content: string;
    caption: string;
  };
  stepByStep: Array<{ step: number; title: string; description: string }>;
  keyPoints: string[];
  commonMistakes: string[];
  quickRevision: string[];
  assessmentQuestions: AssessmentQuestion[];
}

export interface Subject {
  id: string;
  title: string;
  code: string;
  department: string;
  icon: string;
  accent: string;
  accentLight: string;
  description: string;
  topicsCount: number;
  topics: TopicExplanation[];
}

export const SUBJECTS_DATA: Subject[] = [
  // 1. Mathematics
  {
    id: 'mathematics',
    title: 'Mathematics',
    code: 'MATH-201',
    department: 'Applied Sciences',
    icon: '∑',
    accent: '#8B5CF6',
    accentLight: 'rgba(139, 92, 246, 0.15)',
    description: 'Linear algebra, calculus, differential equations, and eigenvalues for engineering problem solving.',
    topicsCount: 4,
    topics: [
      {
        id: 'math-eigen',
        subjectId: 'mathematics',
        title: 'Eigenvalues & Eigenvectors',
        difficulty: 'Intermediate',
        estimatedMinutes: 45,
        simpleExplanation:
          'When a matrix transforms a vector, most vectors change both their length and direction. But special vectors only stretch or shrink without rotating at all. These special vectors are eigenvectors, and their scaling factor is the eigenvalue.',
        detailedExplanation:
          'In linear algebra, an eigenvector of a square matrix A is a non-zero vector v that satisfies the characteristic equation Av = λv, where λ is a scalar known as the eigenvalue. To compute the eigenvalues, we solve the characteristic equation det(A - λI) = 0. Once eigenvalues are found, each corresponding eigenvector is determined by finding the null space of (A - λI).',
        importantConcepts: [
          'Characteristic Equation: det(A - λI) = 0',
          'Trace Theorem: The sum of eigenvalues equals the trace of the matrix',
          'Determinant Theorem: The product of eigenvalues equals the determinant of the matrix',
          'Diagonalisation: If matrix A has n linearly independent eigenvectors, A = PDP⁻¹',
          'Cayley-Hamilton Theorem: Every square matrix satisfies its own characteristic equation'
        ],
        examples: [
          {
            title: 'Finding Eigenvalues of a 2x2 Matrix',
            problem: 'Find the eigenvalues of A = [[4, 2], [1, 3]].',
            solution:
              'Set det(A - λI) = 0:\n| 4 - λ    2   |\n|   1    3 - λ |\n= (4 - λ)(3 - λ) - (2)(1) = 0\nλ² - 7λ + 12 - 2 = 0\nλ² - 7λ + 10 = 0\n(λ - 2)(λ - 5) = 0\nTherefore, eigenvalues are λ₁ = 2 and λ₂ = 5.'
          }
        ],
        formulasOrCode: {
          type: 'formula',
          content: 'A · v = λ · v   ⟺   det(A - λI) = 0',
          caption: 'Fundamental Eigenvalue Equation and Characteristic Determinant'
        },
        stepByStep: [
          { step: 1, title: 'Form the Matrix (A - λI)', description: 'Subtract scalar λ from each diagonal entry of matrix A.' },
          { step: 2, title: 'Compute the Determinant', description: 'Calculate det(A - λI) to formulate the characteristic polynomial equation.' },
          { step: 3, title: 'Solve the Roots', description: 'Factor the polynomial to solve for the scalar roots λ₁, λ₂, ..., λₙ.' },
          { step: 4, title: 'Find Eigenvectors', description: 'Substitute each λ back into (A - λI)v = 0 and solve using Gaussian elimination.' }
        ],
        keyPoints: [
          'Eigenvalues can be real, repeated, or complex conjugates.',
          'Symmetric real matrices always have strictly real eigenvalues.',
          'An n×n matrix always has exactly n eigenvalues counting algebraic multiplicities.'
        ],
        commonMistakes: [
          'Forgetting that the zero vector cannot be an eigenvector by definition.',
          'Sign errors when computing (a - λ)(d - λ) in 2x2 determinants.',
          'Confusing algebraic multiplicity with geometric multiplicity.'
        ],
        quickRevision: [
          'det(A - λI) = 0 yields eigenvalues.',
          'Sum of λ = Trace(A).',
          'Product of λ = det(A).'
        ],
        assessmentQuestions: [
          {
            id: 'q1',
            question: 'What is the characteristic equation used to determine the eigenvalues of an n×n matrix A?',
            options: ['det(A + λI) = 0', 'det(A - λI) = 0', 'trace(A) · λ = 0', 'Av = 0'],
            correctIndex: 1,
            explanation: 'The characteristic equation is derived from (A - λI)v = 0 having non-trivial solutions, which requires det(A - λI) = 0.'
          },
          {
            id: 'q2',
            question: 'If the eigenvalues of a 2×2 matrix are 3 and 7, what is the determinant of the matrix?',
            options: ['10', '21', '4', '0'],
            correctIndex: 1,
            explanation: 'The determinant of a matrix is equal to the product of its eigenvalues: 3 × 7 = 21.'
          },
          {
            id: 'q3',
            question: 'Which theorem states that every square matrix satisfies its own characteristic equation?',
            options: ['Cramer’s Rule', 'Rolle’s Theorem', 'Cayley-Hamilton Theorem', 'Gauss-Jordan Theorem'],
            correctIndex: 2,
            explanation: 'The Cayley-Hamilton Theorem states that substituting matrix A into its own characteristic polynomial P(λ) gives P(A) = 0.'
          }
        ]
      }
    ]
  },

  // 2. Physics
  {
    id: 'physics',
    title: 'Physics',
    code: 'PHY-101',
    department: 'Applied Sciences',
    icon: '⚛',
    accent: '#06B6D4',
    accentLight: 'rgba(6, 182, 212, 0.15)',
    description: 'Quantum physics, wave optics, electromagnetic field theory, and laser dynamics for engineers.',
    topicsCount: 3,
    topics: [
      {
        id: 'phy-quantum',
        subjectId: 'physics',
        title: 'Wave-Particle Duality & De Broglie Hypothesis',
        difficulty: 'Intermediate',
        estimatedMinutes: 40,
        simpleExplanation:
          'Light behaves like both a continuous ripple in water (wave) and a beam of tiny ping-pong balls (particles). De Broglie realized that matter, like electrons, behaves the exact same way.',
        detailedExplanation:
          'In 1924, Louis de Broglie hypothesized that if light exhibits dual particle-wave characteristics, matter particles in motion must also possess wave-like properties. The wavelength of a particle is given by λ = h / p, where h is Planck’s constant and p is momentum (mv). This laid the mathematical foundation for wave mechanics and Schrödinger’s equation.',
        importantConcepts: [
          'De Broglie Relation: λ = h / p = h / (mv)',
          'Heisenberg Uncertainty Principle: Δx · Δp ≥ ℏ / 2',
          'Wave Function: Ψ(x, t) whose modulus squared |Ψ|² represents probability density',
          'Photoelectric Effect: E = hν - Φ (Work Function)'
        ],
        examples: [
          {
            title: 'Wavelength of an Accelerated Electron',
            problem: 'Calculate the de Broglie wavelength of an electron accelerated through an electric potential of 100 Volts.',
            solution: 'Using λ = 1.227 / √V nm:\nλ = 1.227 / √100 = 1.227 / 10 = 0.1227 nm (or 1.23 Å). This matches X-ray wavelengths and enables electron microscopy.'
          }
        ],
        formulasOrCode: {
          type: 'formula',
          content: 'λ = \\frac{h}{p} = \\frac{h}{m \\cdot v} = \\frac{1.227}{\\sqrt{V}} \\text{ nm}',
          caption: 'De Broglie Wavelength of Matter Waves'
        },
        stepByStep: [
          { step: 1, title: 'Find Momentum', description: 'Determine the relativistic or classical momentum p = mv or p = √(2mE).' },
          { step: 2, title: 'Apply Planck’s Constant', description: 'Divide Planck’s constant h (6.626 × 10⁻³⁴ J·s) by the momentum.' },
          { step: 3, title: 'Verify Scale', description: 'For macroscopic objects, λ is negligible; for microscopic particles (electrons), λ is significant.' }
        ],
        keyPoints: [
          'Macroscopic objects have undetectable de Broglie wavelengths because mass m is large.',
          'Davisson-Germer electron diffraction proved electron wave properties experimentally.'
        ],
        commonMistakes: [
          'Using velocity instead of momentum in the denominator.',
          'Forgetting that electromagnetic waves travel at c, while matter waves travel at particle velocity v.'
        ],
        quickRevision: [
          'λ = h / p.',
          'Wavelength is inversely proportional to momentum.',
          'Electron microscope resolution exceeds optical microscope due to tiny λ.'
        ],
        assessmentQuestions: [
          {
            id: 'q_phy1',
            question: 'What is the relationship between de Broglie wavelength (λ) and momentum (p)?',
            options: ['λ = h · p', 'λ = h / p', 'λ = p / h', 'λ = h / p²'],
            correctIndex: 1,
            explanation: 'De Broglie postulated that the wavelength is inversely proportional to momentum: λ = h / p.'
          },
          {
            id: 'q_phy2',
            question: 'If the velocity of an electron is doubled, what happens to its de Broglie wavelength?',
            options: ['Doubles', 'Quadruples', 'Halved', 'Remains unchanged'],
            correctIndex: 2,
            explanation: 'Since λ = h / (m · v), doubling velocity v halves the wavelength λ.'
          }
        ]
      }
    ]
  },

  // 3. Programming (C/C++)
  {
    id: 'programming',
    title: 'Programming',
    code: 'CSE-102',
    department: 'Computer Science',
    icon: '⌨',
    accent: '#3B82F6',
    accentLight: 'rgba(59, 130, 246, 0.15)',
    description: 'C and C++ low-level memory allocation, pointers, references, dynamic arrays, and structures.',
    topicsCount: 3,
    topics: [
      {
        id: 'prog-pointers',
        subjectId: 'programming',
        title: 'Pointers & Dynamic Memory Allocation',
        difficulty: 'Beginner',
        estimatedMinutes: 35,
        simpleExplanation:
          'A normal variable holds data like the number 42. A pointer is a variable that holds the house address (memory location) where that number 42 is stored in RAM.',
        detailedExplanation:
          'Pointers are variables that store memory addresses of other variables. Declared using the dereference operator (*), pointers provide low-level control over memory, allow efficient passing of large data structures by reference, and enable dynamic memory management via malloc(), calloc(), free() in C, or new/delete in C++.',
        importantConcepts: [
          'Address-of Operator (&): Retrieves the memory address of a variable',
          'Dereference Operator (*): Accesses the value residing at the stored address',
          'Heap vs Stack: Stack memory is automatic; Heap memory is allocated dynamically at runtime',
          'Memory Leaks: Forgetting to release allocated heap memory causes gradual memory exhaustion'
        ],
        examples: [
          {
            title: 'Dynamic Array Allocation in C++',
            problem: 'Allocate an integer array of size n on the heap, initialize values, and properly delete it.',
            solution: 'int* arr = new int[n];\nfor(int i = 0; i < n; i++) arr[i] = (i + 1) * 10;\n// free memory to prevent leak\ndelete[] arr;\narr = nullptr;'
          }
        ],
        formulasOrCode: {
          type: 'code',
          language: 'cpp',
          content: `int val = 100;
int* ptr = &val;       // ptr stores address of val
cout << *ptr << endl;  // prints 100

// Dynamic allocation
int* dyn = new int(250);
delete dyn;            // free memory
dyn = nullptr;`,
          caption: 'Pointer declaration, dereferencing, and safe deallocation'
        },
        stepByStep: [
          { step: 1, title: 'Declaration', description: 'Specify data type followed by asterisk, e.g. int* p.' },
          { step: 2, title: 'Initialization', description: 'Assign address using &, e.g. p = &x; or allocate via new.' },
          { step: 3, title: 'Dereferencing', description: 'Use *p to read or update the value stored at that location.' },
          { step: 4, title: 'Cleanup', description: 'Always delete or free heap pointers and reset to nullptr.' }
        ],
        keyPoints: [
          'Uninitialized pointers point to random memory (wild pointers).',
          'Always set pointers to nullptr after deleting them to avoid dangling pointer bugs.'
        ],
        commonMistakes: [
          'Dereferencing a null or unallocated pointer (causes Segmentation Fault).',
          'Using delete instead of delete[] for dynamically allocated arrays.'
        ],
        quickRevision: [
          '& gets address; * gets value.',
          'new pairs with delete; new[] pairs with delete[].',
          'Always free heap allocations.'
        ],
        assessmentQuestions: [
          {
            id: 'q_prog1',
            question: 'Which operator is used to get the memory address of a variable in C/C++?',
            options: ['*', '&', '->', '%'],
            correctIndex: 1,
            explanation: 'The ampersand (&) is the address-of operator that returns the memory location of a variable.'
          },
          {
            id: 'q_prog2',
            question: 'What happens if you allocate memory with new in C++ and never call delete?',
            options: ['Stack overflow', 'Memory leak', 'Compile error', 'Garbage collection occurs'],
            correctIndex: 1,
            explanation: 'C++ does not have automatic garbage collection. Unreleased heap memory remains occupied, resulting in a memory leak.'
          }
        ]
      }
    ]
  },

  // 4. Data Structures
  {
    id: 'data-structures',
    title: 'Data Structures',
    code: 'CSE-201',
    department: 'Computer Science',
    icon: '🌲',
    accent: '#10B981',
    accentLight: 'rgba(16, 185, 129, 0.15)',
    description: 'Arrays, linked lists, stacks, queues, binary search trees, hash tables, and graphs.',
    topicsCount: 3,
    topics: [
      {
        id: 'dsa-bst',
        subjectId: 'data-structures',
        title: 'Binary Search Trees (BST)',
        difficulty: 'Intermediate',
        estimatedMinutes: 50,
        simpleExplanation:
          'A Binary Search Tree is an upside-down family tree where every node has at most two children: smaller numbers go to the left branch, and larger numbers go to the right branch.',
        detailedExplanation:
          'A Binary Search Tree is a hierarchical node-based data structure satisfying the BST invariant: for every node X, all values in its left subtree are strictly less than X, and all values in its right subtree are strictly greater than X. This ordering enables average O(log n) time complexity for search, insertion, and deletion.',
        importantConcepts: [
          'BST Property: Left < Node < Right',
          'Inorder Traversal: Traverses Left-Node-Right and always outputs keys in sorted order',
          'Search Time Complexity: Average O(log n), Worst case O(n) for skewed tree',
          'Balancing: AVL and Red-Black trees maintain O(log n) worst case via self-balancing rotations'
        ],
        examples: [
          {
            title: 'Searching for Key 45 in BST',
            problem: 'Root is 50. Left child is 30, right is 70. How is key 45 found?',
            solution: '1. Compare 45 with root (50): 45 < 50, go left to node 30.\n2. Compare 45 with node 30: 45 > 30, go right to node 45.\n3. Key matched! Found in only 2 comparisons.'
          }
        ],
        formulasOrCode: {
          type: 'code',
          language: 'cpp',
          content: `struct Node {
    int data;
    Node *left, *right;
    Node(int val) : data(val), left(nullptr), right(nullptr) {}
};

Node* search(Node* root, int key) {
    if (!root || root->data == key) return root;
    if (key < root->data) return search(root->left, key);
    return search(root->right, key);
}`,
          caption: 'Recursive Binary Search Tree Lookup'
        },
        stepByStep: [
          { step: 1, title: 'Start at Root', description: 'Compare target key with current node value.' },
          { step: 2, title: 'Branch Decision', description: 'If target < node value, branch to left child; if target > node value, branch to right child.' },
          { step: 3, title: 'Terminate', description: 'Stop when key is found or null pointer is encountered.' }
        ],
        keyPoints: [
          'Inorder traversal of any BST yields strictly sorted ascending order.',
          'Worst case occurs when items are inserted in already sorted order, forming a degenerate linked list with O(n) lookup.'
        ],
        commonMistakes: [
          'Assuming a binary tree is automatically a binary search tree.',
          'Forgetting that all elements in the entire left subtree must be less than the root, not just the immediate left child.'
        ],
        quickRevision: [
          'Left < Root < Right.',
          'Inorder Traversal = Sorted Order.',
          'Average search: O(log n); Worst search: O(n).'
        ],
        assessmentQuestions: [
          {
            id: 'q_dsa1',
            question: 'Which traversal of a Binary Search Tree produces elements in sorted ascending order?',
            options: ['Preorder', 'Inorder', 'Postorder', 'Level-order'],
            correctIndex: 1,
            explanation: 'Inorder traversal visits Left Subtree, Root, then Right Subtree, which yields keys in sorted order due to the BST invariant.'
          },
          {
            id: 'q_dsa2',
            question: 'What is the worst-case time complexity of searching in an unbalanced BST with n elements?',
            options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
            correctIndex: 2,
            explanation: 'When inserted in sorted order, an unbalanced BST degenerates into a linear chain (linked list), causing O(n) search time.'
          }
        ]
      }
    ]
  },

  // 5. Java
  {
    id: 'java',
    title: 'Java',
    code: 'CSE-205',
    department: 'Software Engineering',
    icon: '☕',
    accent: '#EC4899',
    accentLight: 'rgba(236, 72, 153, 0.15)',
    description: 'Object-oriented programming, inheritance, interfaces, polymorphism, JVM memory, and collections.',
    topicsCount: 3,
    topics: [
      {
        id: 'java-oop',
        subjectId: 'java',
        title: 'Core OOP: Polymorphism & Interfaces',
        difficulty: 'Beginner',
        estimatedMinutes: 40,
        simpleExplanation:
          'Polymorphism means "many forms". A parent can have an instruction like "speak()", but a dog says "bark" and a cat says "meow". The same method call behaves differently depending on the object.',
        detailedExplanation:
          'Java implements Object-Oriented Programming through Encapsulation, Abstraction, Inheritance, and Polymorphism. Polymorphism exists in two forms: Compile-time (Method Overloading) and Runtime (Method Overriding via dynamic method dispatch). Interfaces establish contracts that unrelated classes can implement, enabling multiple inheritance of type and decoupled architectural designs.',
        importantConcepts: [
          'Method Overriding: Subclass provides a specific implementation of a parent class method',
          'Dynamic Method Dispatch: JVM resolves method call at runtime based on the actual object instance',
          'Interface: Abstract type specifying method signatures without state',
          'Abstract Class vs Interface: Abstract classes can hold member state and constructors; interfaces define pure behavior'
        ],
        examples: [
          {
            title: 'Runtime Polymorphism with Shape Interface',
            problem: 'Create a Shape interface and implement Circle and Rectangle with different area calculations.',
            solution: 'interface Shape { double getArea(); }\nclass Circle implements Shape { double r; Circle(double r){this.r=r;} public double getArea(){ return Math.PI*r*r; } }\nShape s = new Circle(5); // Dynamic dispatch'
          }
        ],
        formulasOrCode: {
          type: 'code',
          language: 'java',
          content: `interface PaymentService {
    void process(double amount);
}

class UPIPayment implements PaymentService {
    @Override
    public void process(double amount) {
        System.out.println("Processing ₹" + amount + " via UPI gateway.");
    }
}`,
          caption: 'Interface Implementation and Method Overriding'
        },
        stepByStep: [
          { step: 1, title: 'Define Interface', description: 'Use the interface keyword to define reusable behavioral contracts.' },
          { step: 2, title: 'Implement Contract', description: 'Concrete classes use the implements keyword and override methods.' },
          { step: 3, title: 'Reference via Interface', description: 'Declare reference variables using the interface type for decoupling.' }
        ],
        keyPoints: [
          'Static methods and private methods cannot be overridden.',
          'The @Override annotation ensures compiler verification of method signatures.'
        ],
        commonMistakes: [
          'Changing the return type or parameter list when attempting to override (results in overloading instead).',
          'Instantiating an interface directly with new.'
        ],
        quickRevision: [
          'Overloading = Compile-time; Overriding = Runtime.',
          'Interface = contract of behavior.',
          'Use @Override annotation.'
        ],
        assessmentQuestions: [
          {
            id: 'q_java1',
            question: 'Which keyword is used by a Java class to adopt an interface contract?',
            options: ['extends', 'implements', 'inherits', 'adopts'],
            correctIndex: 1,
            explanation: 'In Java, classes use the implements keyword to implement an interface contract.'
          },
          {
            id: 'q_java2',
            question: 'Runtime polymorphism in Java is achieved through which mechanism?',
            options: ['Method Overloading', 'Method Overriding', 'Private Constructors', 'Final Methods'],
            correctIndex: 1,
            explanation: 'Runtime polymorphism is achieved via method overriding resolved through dynamic method dispatch by the JVM.'
          }
        ]
      }
    ]
  },

  // 6. Python
  {
    id: 'python',
    title: 'Python',
    code: 'CSE-108',
    department: 'Software Engineering',
    icon: '🐍',
    accent: '#F59E0B',
    accentLight: 'rgba(245, 158, 11, 0.15)',
    description: 'Pythonic idioms, list comprehensions, generators, decorators, file I/O, and data processing.',
    topicsCount: 3,
    topics: [
      {
        id: 'py-comprehensions',
        subjectId: 'python',
        title: 'List Comprehensions & Lambda Functions',
        difficulty: 'Beginner',
        estimatedMinutes: 30,
        simpleExplanation:
          'Instead of writing a 5-line for-loop with append() to build a new list, a list comprehension lets you build and filter the entire list in one concise, readable line.',
        detailedExplanation:
          'List comprehensions provide a concise syntax for creating new lists from existing iterables. They are more readable and generally execute faster than standard for-loops because the bytecode loop is executed at C speed. Lambdas are small, anonymous functions defined with the lambda keyword that can accept any number of arguments but contain only a single expression.',
        importantConcepts: [
          'Syntax: [expression for item in iterable if condition]',
          'Generator Expressions: (x for x in iterable) creates memory-efficient lazy iterators',
          'Lambda Syntax: lambda x: x * 2 for one-line throwaway functions',
          'Map & Filter: Higher-order functions commonly paired with lambda functions'
        ],
        examples: [
          {
            title: 'Filtering Even Squares',
            problem: 'Generate squares of even numbers between 1 and 10.',
            solution: 'evens_squared = [x**2 for x in range(1, 11) if x % 2 == 0]\n# Result: [4, 16, 36, 64, 100]'
          }
        ],
        formulasOrCode: {
          type: 'code',
          language: 'python',
          content: `# Traditional loop
squares = []
for n in range(5):
    squares.append(n ** 2)

# List comprehension (Pythonic)
squares = [n ** 2 for n in range(5)]

# Lambda with filter
evens = list(filter(lambda x: x % 2 == 0, range(10)))`,
          caption: 'List Comprehension and Lambda Expressions'
        },
        stepByStep: [
          { step: 1, title: 'Output Expression', description: 'Specify what each transformed item in the new list should be.' },
          { step: 2, title: 'Iteration', description: 'Write the for-in clause specifying the source iterable.' },
          { step: 3, title: 'Optional Filter', description: 'Append an if-condition to selectively filter included elements.' }
        ],
        keyPoints: [
          'List comprehensions return an entire list in memory.',
          'For massive datasets, use generator expressions with parentheses to avoid high memory usage.'
        ],
        commonMistakes: [
          'Overcomplicating comprehensions with nested loops, sacrificing code readability.',
          'Attempting multiple statements inside a lambda expression.'
        ],
        quickRevision: [
          '[expr for item in list if cond].',
          'Lambdas are anonymous single-expression functions.',
          'Faster execution than manual loop appends.'
        ],
        assessmentQuestions: [
          {
            id: 'q_py1',
            question: 'What is the output of [x * 2 for x in [1, 2, 3] if x > 1]?',
            options: ['[2, 4, 6]', '[4, 6]', '[2, 4]', '[2]'],
            correctIndex: 1,
            explanation: 'The list filtered items greater than 1 ([2, 3]) and multiplied them by 2, giving [4, 6].'
          },
          {
            id: 'q_py2',
            question: 'How do you define an anonymous one-line function in Python?',
            options: ['def', 'func', 'lambda', 'anon'],
            correctIndex: 2,
            explanation: 'The lambda keyword defines anonymous inline functions in Python.'
          }
        ]
      }
    ]
  },

  // 7. AI & ML
  {
    id: 'ai-ml',
    title: 'AI & ML',
    code: 'AIML-301',
    department: 'Artificial Intelligence',
    icon: '🤖',
    accent: '#14B8A6',
    accentLight: 'rgba(20, 184, 166, 0.15)',
    description: 'Machine learning fundamentals, gradient descent, loss functions, neural networks, and evaluation metrics.',
    topicsCount: 3,
    topics: [
      {
        id: 'ai-gradient',
        subjectId: 'ai-ml',
        title: 'Gradient Descent & Loss Optimization',
        difficulty: 'Advanced',
        estimatedMinutes: 55,
        simpleExplanation:
          'Imagine being blindfolded on a foggy mountain and wanting to reach the bottom of the valley. You feel the ground with your feet, find which way slopes downward, and take a step in that direction. That is gradient descent.',
        detailedExplanation:
          'Gradient Descent is a first-order iterative optimization algorithm used to minimize an objective loss function J(θ). At each step, model parameters θ are adjusted proportionally to the negative of the gradient ∇J(θ). The step size is controlled by the learning rate hyperparameter α. Variants include Batch Gradient Descent, Stochastic Gradient Descent (SGD), and Adam optimization.',
        importantConcepts: [
          'Cost Function J(θ): Measures error between predicted values and ground truth targets',
          'Learning Rate (α): Controls the step size during parameter updates',
          'Vanishing / Exploding Gradients: Gradients becoming too small or excessively large in deep networks',
          'Convex vs Non-Convex: Convex landscapes guarantee a global minimum'
        ],
        examples: [
          {
            title: 'Parameter Update in Linear Regression',
            problem: 'Given loss J(w), update weight w with learning rate α = 0.01 and gradient ∂J/∂w = 4.0.',
            solution: 'w_new = w_old - α · (∂J/∂w)\nw_new = w_old - 0.01 · 4.0 = w_old - 0.04.'
          }
        ],
        formulasOrCode: {
          type: 'formula',
          content: '\\theta_{t+1} = \\theta_t - \\alpha \\cdot \\nabla J(\\theta_t)',
          caption: 'Standard Gradient Descent Parameter Update Rule'
        },
        stepByStep: [
          { step: 1, title: 'Initialize Weights', description: 'Initialize model weights randomly or with Xavier/He initialization.' },
          { step: 2, title: 'Compute Forward Loss', description: 'Calculate model predictions and evaluate error using loss function J(θ).' },
          { step: 3, title: 'Backpropagation', description: 'Calculate partial derivatives ∇J(θ) using the chain rule.' },
          { step: 4, title: 'Update Parameters', description: 'Subtract α · ∇J(θ) to step towards lower cost.' }
        ],
        keyPoints: [
          'Too large a learning rate causes divergence (overshooting).',
          'Too small a learning rate causes extremely slow convergence or getting stuck in local plateaus.'
        ],
        commonMistakes: [
          'Not normalizing or scaling input features prior to training.',
          'Using fixed high learning rate without decay schedules.'
        ],
        quickRevision: [
          'Update rule: θ = θ - α · ∇J(θ).',
          'Minimizes loss function iteratively.',
          'SGD updates per sample; Batch updates per epoch.'
        ],
        assessmentQuestions: [
          {
            id: 'q_ai1',
            question: 'What hyperparameter governs the step size in Gradient Descent?',
            options: ['Batch Size', 'Learning Rate (α)', 'Momentum Factor', 'Epoch Count'],
            correctIndex: 1,
            explanation: 'The learning rate (α) scales the gradient to dictate the step size taken towards the minimum.'
          },
          {
            id: 'q_ai2',
            question: 'What happens if the learning rate is set excessively high?',
            options: ['Convergence is instantaneous', 'The algorithm diverges and overshoots the minimum', 'Underfitting occurs', 'Gradients vanish to zero'],
            correctIndex: 1,
            explanation: 'An excessively large learning rate causes step sizes to overshoot the valley, resulting in oscillation and divergence.'
          }
        ]
      }
    ]
  },

  // 8. Database
  {
    id: 'database',
    title: 'Database',
    code: 'CSE-214',
    department: 'Information Systems',
    icon: '🗄',
    accent: '#E11D48',
    accentLight: 'rgba(225, 29, 72, 0.15)',
    description: 'Relational database architecture, SQL queries, normalization, indexing, and ACID transactions.',
    topicsCount: 3,
    topics: [
      {
        id: 'db-acid',
        subjectId: 'database',
        title: 'ACID Properties & Transaction Management',
        difficulty: 'Intermediate',
        estimatedMinutes: 45,
        simpleExplanation:
          'When you transfer money from bank account A to account B, money must leave A AND arrive in B. If the server crashes halfway, the system must rollback so your money does not vanish into thin air. That is an ACID transaction.',
        detailedExplanation:
          'A transaction is a single logical unit of database work. To ensure data integrity, relational database management systems enforce ACID properties: Atomicity (all operations succeed or none do), Consistency (transitions database from one valid state to another satisfying all constraints), Isolation (concurrent transactions execute independently without dirty reads), and Durability (committed changes survive system crashes).',
        importantConcepts: [
          'Atomicity: All-or-nothing execution via Commit and Rollback',
          'Consistency: Integrity constraints, foreign keys, and uniqueness checks are strictly maintained',
          'Isolation Levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable',
          'Durability: Write-Ahead Logging (WAL) ensures committed transactions persist on disk'
        ],
        examples: [
          {
            title: 'Bank Fund Transfer Transaction',
            problem: 'Transfer $500 from Account 101 to Account 202 securely.',
            solution: 'BEGIN TRANSACTION;\nUPDATE Accounts SET balance = balance - 500 WHERE id = 101;\nUPDATE Accounts SET balance = balance + 500 WHERE id = 202;\nCOMMIT;'
          }
        ],
        formulasOrCode: {
          type: 'code',
          language: 'sql',
          content: `BEGIN TRANSACTION;

-- Deduct from sender
UPDATE Accounts 
SET balance = balance - 1000 
WHERE account_num = 'ACC-8912';

-- Add to receiver
UPDATE Accounts 
SET balance = balance + 1000 
WHERE account_num = 'ACC-4421';

-- Ensure both succeed
COMMIT;`,
          caption: 'Atomic SQL Transaction with Commit'
        },
        stepByStep: [
          { step: 1, title: 'Begin Transaction', description: 'Establish transaction boundary and acquire necessary row/table locks.' },
          { step: 2, title: 'Execute Operations', description: 'Perform DML operations while logging changes in the transaction log (WAL).' },
          { step: 3, title: 'Commit or Rollback', description: 'If all operations succeed, commit changes permanently; if any fails, rollback completely.' }
        ],
        keyPoints: [
          'Isolation prevents anomalies like dirty reads, non-repeatable reads, and phantom reads.',
          'Serializable is the highest isolation level but incurs the highest concurrency performance cost.'
        ],
        commonMistakes: [
          'Assuming autocommit is disabled by default in all client libraries.',
          'Holding long-running transactions open, causing widespread lock contention and deadlocks.'
        ],
        quickRevision: [
          'Atomicity: All or nothing.',
          'Consistency: Valid rules preserved.',
          'Isolation: Independent execution.',
          'Durability: Committed data survives crashes.'
        ],
        assessmentQuestions: [
          {
            id: 'q_db1',
            question: 'Which ACID property guarantees that all operations within a transaction succeed together, or all are rolled back?',
            options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
            correctIndex: 0,
            explanation: 'Atomicity ensures that a transaction is treated as an indivisible unit: all operations succeed or all fail.'
          },
          {
            id: 'q_db2',
            question: 'What ensures that committed transaction records persist permanently even if the server immediately loses power?',
            options: ['Isolation', 'Durability', 'Atomicity', 'Redundancy'],
            correctIndex: 1,
            explanation: 'Durability guarantees that once a transaction is committed, its data persists permanently in non-volatile storage.'
          }
        ]
      }
    ]
  }
];
