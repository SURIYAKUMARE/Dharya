import { useState, useMemo } from 'react';
import { BOOKS, Book } from './data/books';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryFilters, CategoryFilter } from './components/CategoryFilters';
import { BookGrid } from './components/BookGrid';
import { TopicReaderModal } from './components/TopicReaderModal';
import { MessageSquare, ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';

export function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [activeBook, setActiveBook] = useState<Book | null>(null);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    return {
      all: BOOKS.length,
      core: BOOKS.filter((b) => b.category === 'core').length,
      cs: BOOKS.filter((b) => b.category === 'cs').length,
      ai: BOOKS.filter((b) => b.category === 'ai').length,
      exam: BOOKS.filter((b) => ['mathematics', 'mechanical-engineering', 'data-structures', 'digital-electronics'].includes(b.id)).length,
    };
  }, []);

  // Filter books based on search query and category
  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return BOOKS.filter((book) => {
      // Category filter
      if (selectedCategory === 'exam') {
        const isExam = ['mathematics', 'mechanical-engineering', 'data-structures', 'digital-electronics'].includes(book.id);
        if (!isExam) return false;
      } else if (selectedCategory !== 'all' && book.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (!q) return true;
      return (
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.description.toLowerCase().includes(q) ||
        book.categoryLabel.toLowerCase().includes(q) ||
        book.topics.some((t) => t.name.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, selectedCategory]);

  const handleLoginClick = () => {
    // If in standalone window, navigate to root login or show prompt
    window.location.href = '/login.html';
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-slate-100 flex flex-col selection:bg-violet-500/30 selection:text-violet-200">
      {/* Sticky Navigation Bar */}
      <Navbar onLoginClick={handleLoginClick} />

      {/* Hero Section */}
      <main className="flex-1">
        <Hero
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          booksCount={filteredBooks.length}
        />

        {/* Shelf Category Filters */}
        <CategoryFilters
          activeCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categoryCounts={categoryCounts}
        />

        {/* 3-Column Responsive Book Card Grid with Staggered Scroll-Reveal */}
        <BookGrid
          books={filteredBooks}
          onOpenBook={(book) => setActiveBook(book)}
          onResetFilters={() => {
            setSearchQuery('');
            setSelectedCategory('all');
          }}
        />

        {/* Bottom Call-to-Action Banner */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="relative rounded-3xl p-8 sm:p-10 overflow-hidden bg-gradient-to-r from-violet-950/40 via-purple-900/20 to-slate-900/60 border border-violet-500/30 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-300 text-xs font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Collaborative Campus Network</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Ready to collaborate and discuss?
              </h2>
              <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                Connect directly with professors, peers, and study circles in real-time chat. Share textbook derivations and solve doubts together.
              </p>
            </div>

            <button
              onClick={handleLoginClick}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm sm:text-base font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-xl shadow-violet-600/35 hover:shadow-violet-600/55 transition-all transform hover:-translate-y-1 active:translate-y-0 flex-shrink-0 cursor-pointer border border-violet-400/40"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Next: Continue to Chat</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-black/40 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-slate-400">
            <BookOpen className="w-4 h-4 text-violet-400" />
            <span>StudyChat Digital Engineering Library</span>
          </div>
          <p>© 2026-2027 AICTE & University Engineering Curriculum Standard</p>
        </div>
      </footer>

      {/* Interactive Topic Reader Modal */}
      <TopicReaderModal
        book={activeBook}
        onClose={() => setActiveBook(null)}
        onContinueToChat={handleLoginClick}
      />
    </div>
  );
}

export default App;
