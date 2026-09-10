export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  subjectId: string;
  topicId: string;
  buttonType: 'borrow' | 'read' | 'preview' | 'locate';
  coverType:
    | 'clrs'
    | 'grewal'
    | 'c-kr'
    | 'beiser'
    | 'silberschatz-db'
    | 'russell-norvig'
    | 'sawhney-measurements'
    | 'dragon-compilers'
    | 'dinosaur-os'
    | 'kurose-ross'
    | 'kreyszig-math'
    | 'griffiths-em'
    | 'sicp-wizard'
    | 'ogata-control'
    | 'deep-learning'
    | 'effective-java'
    | 'fluent-python'
    | 'ddia-kleppmann'
    | 'clean-code'
    | 'asyncio-python'
    | 'doebelin-sensors'
    | 'nagrath-control';
  tag: string;
}

export interface LibraryShelfData {
  id: string;
  title: string;
  linkText: string;
  books: LibraryBook[];
}

export const LIBRARY_SHELVES: LibraryShelfData[] = [
  // ==========================================
  // SHELF 1: TRENDING ENGINEERING TEXTBOOKS
  // ==========================================
  {
    id: 'trending-books',
    title: 'Trending Engineering Textbooks',
    linkText: 'Trending Textbooks',
    books: [
      {
        id: 'book-clrs',
        title: 'Introduction to Algorithms',
        author: 'T. Cormen, C. Leiserson, R. Rivest, C. Stein',
        publisher: 'The MIT Press',
        year: 2022,
        subjectId: 'data-structures',
        topicId: 'dsa-bst',
        buttonType: 'borrow',
        coverType: 'clrs',
        tag: 'ALGORITHMS'
      },
      {
        id: 'book-sawhney',
        title: 'A Course in Electrical & Electronic Measurements & Instrumentation',
        author: 'Dr. A.K. Sawhney & Puneet Sawhney',
        publisher: 'Dhanpat Rai & Co. / Khanna',
        year: 2023,
        subjectId: 'sensors-transducers',
        topicId: 'eie-lvdt',
        buttonType: 'borrow',
        coverType: 'sawhney-measurements',
        tag: 'EIE • MEASUREMENTS'
      },
      {
        id: 'book-grewal',
        title: 'Higher Engineering Mathematics',
        author: 'Dr. B.S. Grewal',
        publisher: 'Khanna Publishers',
        year: 2024,
        subjectId: 'mathematics',
        topicId: 'math-eigen',
        buttonType: 'locate',
        coverType: 'grewal',
        tag: 'MATHEMATICS'
      },
      {
        id: 'book-c-kr',
        title: 'The C Programming Language (ANSI C)',
        author: 'Brian W. Kernighan & Dennis M. Ritchie',
        publisher: 'Prentice Hall',
        year: 2021,
        subjectId: 'programming',
        topicId: 'prog-pointers',
        buttonType: 'read',
        coverType: 'c-kr',
        tag: 'C SYSTEMS'
      },
      {
        id: 'book-beiser',
        title: 'Concepts of Modern Physics',
        author: 'Arthur Beiser',
        publisher: 'McGraw-Hill Education',
        year: 2022,
        subjectId: 'physics',
        topicId: 'phy-quantum',
        buttonType: 'borrow',
        coverType: 'beiser',
        tag: 'QUANTUM PHYSICS'
      },
      {
        id: 'book-silberschatz-db',
        title: 'Database System Concepts',
        author: 'A. Silberschatz, H. Korth, S. Sudarshan',
        publisher: 'McGraw-Hill Education',
        year: 2023,
        subjectId: 'database',
        topicId: 'db-normalization',
        buttonType: 'borrow',
        coverType: 'silberschatz-db',
        tag: 'DATABASES'
      },
      {
        id: 'book-russell-norvig',
        title: 'Artificial Intelligence: A Modern Approach',
        author: 'Stuart Russell & Peter Norvig',
        publisher: 'Pearson Education',
        year: 2022,
        subjectId: 'ai-ml',
        topicId: 'ai-gradient',
        buttonType: 'preview',
        coverType: 'russell-norvig',
        tag: 'AI & ML'
      }
    ]
  },

  // ==========================================
  // SHELF 2: CLASSIC ENGINEERING TEXTBOOKS
  // ==========================================
  {
    id: 'classic-books',
    title: 'Classic Engineering Textbooks',
    linkText: 'Classic Textbooks',
    books: [
      {
        id: 'book-ogata-control',
        title: 'Modern Control Engineering',
        author: 'Katsuhiko Ogata',
        publisher: 'Prentice Hall / Pearson',
        year: 2022,
        subjectId: 'control-systems',
        topicId: 'eie-transfer-function',
        buttonType: 'borrow',
        coverType: 'ogata-control',
        tag: 'EIE • CONTROL SYSTEMS'
      },
      {
        id: 'book-dragon-compilers',
        title: 'Compilers: Principles, Techniques, & Tools',
        author: 'A. Aho, M. Lam, R. Sethi, J. Ullman',
        publisher: 'Pearson / Addison-Wesley',
        year: 2021,
        subjectId: 'programming',
        topicId: 'prog-structs',
        buttonType: 'borrow',
        coverType: 'dragon-compilers',
        tag: 'COMPILERS'
      },
      {
        id: 'book-dinosaur-os',
        title: 'Operating System Concepts',
        author: 'A. Silberschatz, P. Galvin, G. Gagne',
        publisher: 'John Wiley & Sons',
        year: 2022,
        subjectId: 'database',
        topicId: 'db-acid',
        buttonType: 'borrow',
        coverType: 'dinosaur-os',
        tag: 'OPERATING SYSTEMS'
      },
      {
        id: 'book-kurose-ross',
        title: 'Computer Networking: A Top-Down Approach',
        author: 'James F. Kurose & Keith W. Ross',
        publisher: 'Pearson Education',
        year: 2021,
        subjectId: 'data-structures',
        topicId: 'dsa-graphs',
        buttonType: 'read',
        coverType: 'kurose-ross',
        tag: 'NETWORKING'
      },
      {
        id: 'book-kreyszig-math',
        title: 'Advanced Engineering Mathematics',
        author: 'Erwin Kreyszig',
        publisher: 'John Wiley & Sons',
        year: 2022,
        subjectId: 'mathematics',
        topicId: 'math-fourier',
        buttonType: 'read',
        coverType: 'kreyszig-math',
        tag: 'ENGINEERING MATH'
      },
      {
        id: 'book-griffiths-em',
        title: 'Introduction to Electrodynamics',
        author: 'David J. Griffiths',
        publisher: 'Cambridge University Press',
        year: 2021,
        subjectId: 'physics',
        topicId: 'phy-maxwell',
        buttonType: 'read',
        coverType: 'griffiths-em',
        tag: 'ELECTRODYNAMICS'
      },
      {
        id: 'book-sicp-wizard',
        title: 'Structure and Interpretation of Computer Programs',
        author: 'Harold Abelson & Gerald Jay Sussman',
        publisher: 'The MIT Press',
        year: 2020,
        subjectId: 'programming',
        topicId: 'prog-recursion',
        buttonType: 'read',
        coverType: 'sicp-wizard',
        tag: 'COMPUTER SCIENCE'
      }
    ]
  },

  // ==========================================
  // SHELF 3: BOOKS WE LOVE (Engineering Masterpieces)
  // ==========================================
  {
    id: 'books-we-love',
    title: 'Books We Love (Engineering Masterpieces)',
    linkText: 'Engineering Masterpieces',
    books: [
      {
        id: 'book-doebelin-sensors',
        title: 'Measurement Systems: Application & Design',
        author: 'Ernest O. Doebelin & Dhanesh N. Manik',
        publisher: 'McGraw-Hill Education',
        year: 2022,
        subjectId: 'sensors-transducers',
        topicId: 'eie-temperature',
        buttonType: 'borrow',
        coverType: 'doebelin-sensors',
        tag: 'EIE • TRANSDUCERS'
      },
      {
        id: 'book-nagrath-control',
        title: 'Control Systems Engineering',
        author: 'I.J. Nagrath & M. Gopal',
        publisher: 'New Age International',
        year: 2023,
        subjectId: 'control-systems',
        topicId: 'eie-pid-tuning',
        buttonType: 'read',
        coverType: 'nagrath-control',
        tag: 'EIE • PROCESS CONTROL'
      },
      {
        id: 'book-deep-learning',
        title: 'Deep Learning',
        author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
        publisher: 'The MIT Press',
        year: 2023,
        subjectId: 'ai-ml',
        topicId: 'ai-neural',
        buttonType: 'borrow',
        coverType: 'deep-learning',
        tag: 'DEEP LEARNING'
      },
      {
        id: 'book-effective-java',
        title: 'Effective Java',
        author: 'Joshua Bloch',
        publisher: 'Addison-Wesley Professional',
        year: 2021,
        subjectId: 'java',
        topicId: 'java-oop',
        buttonType: 'borrow',
        coverType: 'effective-java',
        tag: 'JAVA DESIGN'
      },
      {
        id: 'book-fluent-python',
        title: 'Fluent Python: Clear, Concise Code',
        author: 'Luciano Ramalho',
        publisher: "O'Reilly Media",
        year: 2023,
        subjectId: 'python',
        topicId: 'py-comprehensions',
        buttonType: 'read',
        coverType: 'fluent-python',
        tag: 'PYTHON ARCHITECTURE'
      },
      {
        id: 'book-ddia-kleppmann',
        title: 'Designing Data-Intensive Applications',
        author: 'Martin Kleppmann',
        publisher: "O'Reilly Media",
        year: 2023,
        subjectId: 'database',
        topicId: 'db-indexes',
        buttonType: 'borrow',
        coverType: 'ddia-kleppmann',
        tag: 'DISTRIBUTED SYSTEMS'
      },
      {
        id: 'book-clean-code',
        title: 'Clean Code: A Handbook of Agile Craftsmanship',
        author: 'Robert C. Martin',
        publisher: 'Prentice Hall',
        year: 2021,
        subjectId: 'java',
        topicId: 'java-collections',
        buttonType: 'read',
        coverType: 'clean-code',
        tag: 'SOFTWARE ENG'
      },
      {
        id: 'book-asyncio-python',
        title: 'Using Asyncio in Python',
        author: 'Caleb Hattingh',
        publisher: "O'Reilly Media",
        year: 2021,
        subjectId: 'python',
        topicId: 'py-async',
        buttonType: 'read',
        coverType: 'asyncio-python',
        tag: 'CONCURRENCY'
      }
    ]
  }
];
