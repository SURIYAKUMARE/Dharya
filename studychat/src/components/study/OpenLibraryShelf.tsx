import React, { useRef, useState } from 'react';
import { LibraryShelfData, LibraryBook } from '../../data/libraryShelves';
import { BookCoverRenderer } from './BookCoverRenderer';
import { useStudyApp } from '../../context/StudyAppContext';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

interface OpenLibraryShelfProps {
  shelf: LibraryShelfData;
}

export const OpenLibraryShelf: React.FC<OpenLibraryShelfProps> = ({ shelf }) => {
  const { openTopic } = useStudyApp();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredBookId, setHoveredBookId] = useState<string | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getButtonContent = (buttonType: LibraryBook['buttonType']) => {
    switch (buttonType) {
      case 'locate':
        return (
          <>
            <span>Locate</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </>
        );
      case 'read':
        return (
          <>
            <span>Read</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </>
        );
      case 'preview':
        return <span>Preview Only</span>;
      case 'borrow':
      default:
        return <span>Borrow</span>;
    }
  };

  return (
    <div className="space-y-2.5">
      {/* 1. Category Title (Open Library blue underlined style) */}
      <div className="px-3 sm:px-4">
        <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#0F60B6] hover:underline cursor-pointer inline-block underline-offset-4 decoration-2 tracking-tight">
          {shelf.title}
        </h2>
      </div>

      {/* 2. Horizontal Shelf Row with Warm Cream Surface */}
      <div className="relative bg-[#F4EEE8] border-y border-[#E8E1D7] py-6 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)] group">
        {/* Left Circular Scroll Button */}
        <button
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className="absolute left-2 sm:left-4 top-[130px] -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#E5EEF5] hover:bg-[#D6E5F2] text-[#3D698F] flex items-center justify-center shadow-md transition-all border border-[#CCDCE9] hover:scale-105 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
        </button>

        {/* Scrollable Books Container */}
        <div
          ref={scrollRef}
          className="flex items-start gap-5 sm:gap-6 overflow-x-auto scrollbar-none px-12 sm:px-16 scroll-smooth"
          style={{ scrollSnapType: 'x proximity' }}
        >
          {shelf.books.map((book) => (
            <div
              key={book.id}
              className="w-[150px] sm:w-[160px] shrink-0 flex flex-col items-center group/book cursor-pointer"
              style={{ scrollSnapAlign: 'start' }}
              onMouseEnter={() => setHoveredBookId(book.id)}
              onMouseLeave={() => setHoveredBookId(null)}
              onClick={() => openTopic(book.topicId)}
            >
              {/* Physical Vertical Book Cover */}
              <div className="w-full h-[225px] sm:h-[238px] transition-transform duration-200 group-hover/book:-translate-y-1">
                <BookCoverRenderer
                  book={book}
                  isHovered={hoveredBookId === book.id}
                />
              </div>

              {/* Blue Action Button Beneath the Book */}
              <div className="w-full mt-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openTopic(book.topicId);
                  }}
                  className="w-full h-9 rounded bg-[#1273C4] hover:bg-[#0F60A8] active:bg-[#0C4E83] text-white font-medium text-xs sm:text-[13px] flex items-center justify-center gap-1.5 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {getButtonContent(book.buttonType)}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Circular Scroll Button (Vibrant Blue as in screenshot) */}
        <button
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className="absolute right-2 sm:right-4 top-[130px] -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1075C7] hover:bg-[#0D62A6] text-white flex items-center justify-center shadow-md transition-all border border-[#0D62A6] hover:scale-105 active:scale-95"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
