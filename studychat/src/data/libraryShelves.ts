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
    | 'nation-of-idiots'
    | 'reformed-rake'
    | 'glass-sword'
    | 'borderlands'
    | 'nausicaa'
    | 'logic-dewey'
    | 'sebastien-roch'
    | 'padre-amaro'
    | 'man-thursday'
    | 'captains-courageous'
    | 'castle-otranto'
    | 'napoleon-notting-hill'
    | 'clrs'
    | 'grewal'
    | 'c-kr'
    | 'silberschatz-db'
    | 'deep-learning'
    | 'beiser';
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
  // SHELF 1: TRENDING BOOKS (Exact from reference picture)
  // ==========================================
  {
    id: 'trending-books',
    title: 'Trending Books',
    linkText: 'Trending Books',
    books: [
      {
        id: 'book-nation-of-idiots',
        title: 'A Nation of Idiots',
        author: 'Daksh Tyagi',
        publisher: 'HarperCollins',
        year: 2023,
        subjectId: 'programming',
        topicId: 'prog-pointers',
        buttonType: 'locate',
        coverType: 'nation-of-idiots',
        tag: 'TRENDING'
      },
      {
        id: 'book-reformed-rake',
        title: 'A Reformed Rake',
        author: 'Jeanne Savery',
        publisher: 'Zebra Regency Books',
        year: 2021,
        subjectId: 'mathematics',
        topicId: 'math-eigen',
        buttonType: 'borrow',
        coverType: 'reformed-rake',
        tag: 'POPULAR'
      },
      {
        id: 'book-glass-sword',
        title: 'Glass Sword',
        author: 'Victoria Aveyard',
        publisher: "Orion Children's Books",
        year: 2022,
        subjectId: 'data-structures',
        topicId: 'dsa-bst',
        buttonType: 'preview',
        coverType: 'glass-sword',
        tag: 'BESTSELLER'
      },
      {
        id: 'book-borderlands',
        title: 'Borderlands / La Frontera: The New Mestiza',
        author: 'Gloria Anzaldúa',
        publisher: 'Aunt Lute Books',
        year: 2021,
        subjectId: 'physics',
        topicId: 'phy-quantum',
        buttonType: 'borrow',
        coverType: 'borderlands',
        tag: 'CLASSIC'
      },
      {
        id: 'book-nausicaa',
        title: 'Nausicaä of the Valley of Wind',
        author: 'Hayao Miyazaki',
        publisher: 'VIZ Media',
        year: 2022,
        subjectId: 'ai-ml',
        topicId: 'ai-gradient',
        buttonType: 'borrow',
        coverType: 'nausicaa',
        tag: 'GRAPHIC NOVEL'
      },
      {
        id: 'book-logic-dewey',
        title: 'Logic: The Theory of Inquiry',
        author: 'John Dewey',
        publisher: 'Henry Holt and Company',
        year: 2020,
        subjectId: 'database',
        topicId: 'db-normalization',
        buttonType: 'borrow',
        coverType: 'logic-dewey',
        tag: 'PHILOSOPHY & LOGIC'
      }
    ]
  },

  // ==========================================
  // SHELF 2: CLASSIC BOOKS (Exact from reference picture)
  // ==========================================
  {
    id: 'classic-books',
    title: 'Classic Books',
    linkText: 'Classic Books',
    books: [
      {
        id: 'book-sebastien-roch',
        title: 'Sébastien Roch',
        author: 'Octave Mirbeau',
        publisher: 'G. Charpentier et E. Fasquelle',
        year: 2020,
        subjectId: 'programming',
        topicId: 'prog-recursion',
        buttonType: 'borrow',
        coverType: 'sebastien-roch',
        tag: 'FRENCH LITERATURE'
      },
      {
        id: 'book-padre-amaro',
        title: 'El crimen del Padre Amaro',
        author: 'Eça de Queirós',
        publisher: 'Typographia Castro Irmão',
        year: 2021,
        subjectId: 'java',
        topicId: 'java-oop',
        buttonType: 'borrow',
        coverType: 'padre-amaro',
        tag: 'IBERIAN CLASSIC'
      },
      {
        id: 'book-man-thursday',
        title: 'The Man Who Was Thursday',
        author: 'G. K. Chesterton',
        publisher: 'J. W. Arrowsmith',
        year: 2022,
        subjectId: 'python',
        topicId: 'py-comprehensions',
        buttonType: 'read',
        coverType: 'man-thursday',
        tag: 'EDWARDIAN MYSTERY'
      },
      {
        id: 'book-captains-courageous',
        title: 'Captains Courageous',
        author: 'Rudyard Kipling',
        publisher: 'Macmillan & Co.',
        year: 2020,
        subjectId: 'data-structures',
        topicId: 'dsa-graphs',
        buttonType: 'read',
        coverType: 'captains-courageous',
        tag: 'MARITIME CLASSIC'
      },
      {
        id: 'book-castle-otranto',
        title: 'The Castle of Otranto',
        author: 'Horace Walpole',
        publisher: 'Thomas Lownds',
        year: 2021,
        subjectId: 'database',
        topicId: 'db-acid',
        buttonType: 'read',
        coverType: 'castle-otranto',
        tag: 'GOTHIC FICTION'
      },
      {
        id: 'book-napoleon-notting-hill',
        title: 'The Napoleon of Notting Hill',
        author: 'G. K. Chesterton',
        publisher: 'John Lane',
        year: 2022,
        subjectId: 'mathematics',
        topicId: 'math-fourier',
        buttonType: 'read',
        coverType: 'napoleon-notting-hill',
        tag: 'SATIRICAL FICTION'
      }
    ]
  },

  // ==========================================
  // SHELF 3: BOOKS WE LOVE (Curated Engineering & Academic Classics)
  // ==========================================
  {
    id: 'books-we-love',
    title: 'Books We Love',
    linkText: 'Books We Love',
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
        id: 'book-grewal',
        title: 'Higher Engineering Mathematics',
        author: 'Dr. B.S. Grewal',
        publisher: 'Khanna Publishers',
        year: 2024,
        subjectId: 'mathematics',
        topicId: 'math-eigen',
        buttonType: 'borrow',
        coverType: 'grewal',
        tag: 'MATHEMATICS'
      },
      {
        id: 'book-c-kr',
        title: 'The C Programming Language',
        author: 'Brian W. Kernighan & Dennis M. Ritchie',
        publisher: 'Prentice Hall',
        year: 2021,
        subjectId: 'programming',
        topicId: 'prog-pointers',
        buttonType: 'read',
        coverType: 'c-kr',
        tag: 'SYSTEMS'
      },
      {
        id: 'book-silberschatz-db',
        title: 'Database System Concepts',
        author: 'A. Silberschatz, H. Korth, S. Sudarshan',
        publisher: 'McGraw-Hill Education',
        year: 2023,
        subjectId: 'database',
        topicId: 'db-normalization',
        buttonType: 'read',
        coverType: 'silberschatz-db',
        tag: 'DATABASES'
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
        tag: 'AI & ML'
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
        tag: 'PHYSICS'
      }
    ]
  }
];
