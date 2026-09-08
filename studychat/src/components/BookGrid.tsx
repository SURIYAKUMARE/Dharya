import React from 'react';
import { Book as BookType } from '../data/books';
import { BookCard } from './BookCard';
import { motion } from 'framer-motion';
import { BookX } from 'lucide-react';

interface BookGridProps {
  books: BookType[];
  onOpenBook: (book: BookType) => void;
  onResetFilters: () => void;
}

export const BookGrid: React.FC<BookGridProps> = ({
  books,
  onOpenBook,
  onResetFilters,
}) => {
  if (books.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto mb-4">
          <BookX className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">No textbooks found</h3>
        <p className="text-sm text-slate-400 mb-5 leading-relaxed">
          No books matched your search query or selected department. Try searching by author (e.g. Khurmi, Grewal) or clear your filters.
        </p>
        <button
          onClick={onResetFilters}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-violet-600/30 border border-violet-500/40 text-violet-300 hover:bg-violet-600/50 hover:text-white transition-all"
        >
          Reset All Filters
        </button>
      </div>
    );
  }

  // Framer Motion container with staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      {/* 3-Column Responsive Grid with Staggered Scroll-Reveal Animations */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {books.map((book) => (
          <motion.div key={book.id} variants={itemVariants}>
            <BookCard book={book} onOpenBook={onOpenBook} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
