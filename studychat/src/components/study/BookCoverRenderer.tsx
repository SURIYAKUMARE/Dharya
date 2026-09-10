import React from 'react';
import { LibraryBook } from '../../data/libraryShelves';

interface BookCoverRendererProps {
  book: LibraryBook;
  isHovered: boolean;
}

export const BookCoverRenderer: React.FC<BookCoverRendererProps> = ({ book, isHovered }) => {
  const renderCoverArt = () => {
    switch (book.coverType) {
      // 1. A NATION OF IDIOTS
      case 'nation-of-idiots':
        return (
          <div className="w-full h-full bg-[#D32328] text-white flex flex-col justify-between p-2.5 relative overflow-hidden select-none font-sans">
            <div className="space-y-1 z-10">
              <div className="text-[7.5px] tracking-wider uppercase opacity-90 font-medium">
                An Irreverent Guide to Modern Life
              </div>
              <h3 className="text-xl font-black tracking-tight leading-none uppercase font-sans">
                A Nation
                <br />
                Of
                <br />
                Idiots
              </h3>
            </div>

            <div className="z-10 space-y-1">
              <div className="text-[7px] tracking-widest uppercase opacity-80 font-bold">
                Daksh Tyagi
              </div>
              {/* Crowd Illustration */}
              <div className="pt-1 flex items-end justify-center gap-0.5 opacity-95">
                {[
                  '#F59E0B', '#06B6D4', '#EC4899', '#F97316', '#10B981',
                  '#8B5CF6', '#E11D48', '#3B82F6', '#84CC16', '#F43F5E'
                ].map((color, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className="w-2.5 h-2.5 rounded-full mb-0.5"
                      style={{ backgroundColor: color }}
                    />
                    <div
                      className="w-3 rounded-t-sm"
                      style={{
                        backgroundColor: color,
                        height: `${12 + (i % 4) * 4}px`,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Subtle background texture */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none" />
          </div>
        );

      // 2. A REFORMED RAKE
      case 'reformed-rake':
        return (
          <div className="w-full h-full bg-[#183D33] text-[#F3E8D6] flex flex-col justify-between p-2.5 relative overflow-hidden select-none">
            <div className="text-center z-10 space-y-0.5">
              <div className="text-[7px] tracking-widest uppercase text-[#FCD34D] font-serif">
                A Zebra Regency Romance
              </div>
              <div className="text-[9px] font-serif italic text-white/90">
                Jeanne Savery
              </div>
            </div>

            {/* Regency Oval Painting Frame */}
            <div className="mx-auto w-24 h-28 rounded-full border-2 border-[#D4AF37]/60 overflow-hidden relative bg-[#2A4E44] flex items-center justify-center shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F2620] via-transparent to-[#FCE7F3]/10" />
              {/* Painted silhouette of romantic couple */}
              <svg className="w-20 h-24" viewBox="0 0 100 120" fill="none">
                <circle cx="45" cy="35" r="10" fill="#FCE7F3" />
                <circle cx="58" cy="38" r="9" fill="#FEF08A" />
                <path d="M35 50 C 35 45, 55 45, 55 50 L 58 100 L 30 100 Z" fill="#1E293B" />
                <path d="M50 52 C 50 48, 70 48, 70 52 L 78 100 L 45 100 Z" fill="#38BDF8" />
              </svg>
            </div>

            <div className="text-center z-10">
              <div className="font-serif italic text-base text-[#FEF3C7] leading-none font-bold">
                A Reformed Rake
              </div>
            </div>
          </div>
        );

      // 3. GLASS SWORD
      case 'glass-sword':
        return (
          <div className="w-full h-full bg-gradient-to-b from-[#E2E8F0] via-[#CBD5E1] to-[#94A3B8] text-slate-800 flex flex-col justify-between p-2.5 relative overflow-hidden select-none">
            <div className="text-center z-10">
              <div className="text-[6.5px] uppercase tracking-wider text-slate-600 font-sans">
                Bestselling Author of Red Queen
              </div>
              <div className="text-[8.5px] uppercase tracking-widest font-serif font-bold text-slate-800">
                Victoria Aveyard
              </div>
            </div>

            {/* Floating Silver Crown with Dripping Blood */}
            <div className="flex flex-col items-center justify-center my-auto relative">
              <svg className="w-20 h-16" viewBox="0 0 100 80" fill="none">
                <path
                  d="M10 60 L 20 20 L 35 45 L 50 10 L 65 45 L 80 20 L 90 60 Z"
                  fill="url(#crownGrad)"
                  stroke="#64748B"
                  strokeWidth="1.5"
                />
                <circle cx="50" cy="12" r="3" fill="#DC2626" />
                <circle cx="20" cy="22" r="2.5" fill="#DC2626" />
                <circle cx="80" cy="22" r="2.5" fill="#DC2626" />
                {/* Dripping Blood Drops */}
                <path d="M50 60 L 50 78 C 50 82, 53 82, 53 78 Z" fill="#DC2626" />
                <path d="M35 60 L 35 70 C 35 73, 37 73, 37 70 Z" fill="#DC2626" />
                <path d="M65 60 L 65 73 C 65 76, 67 76, 67 73 Z" fill="#DC2626" />
                <defs>
                  <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F8FAFC" />
                    <stop offset="50%" stopColor="#CBD5E1" />
                    <stop offset="100%" stopColor="#64748B" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="text-center z-10">
              <h3 className="font-serif text-lg font-bold text-[#B91C1C] tracking-[0.2em] leading-none uppercase">
                Glass
                <br />
                Sword
              </h3>
            </div>
          </div>
        );

      // 4. BORDERLANDS / LA FRONTERA
      case 'borderlands':
        return (
          <div className="w-full h-full bg-[#521921] text-[#FEF08A] flex flex-col justify-between p-2 relative overflow-hidden select-none font-serif">
            {/* Library Barcode Label */}
            <div className="z-10 bg-white text-black p-1 rounded-sm shadow-sm flex items-center justify-between border border-neutral-300">
              <div className="h-3 flex items-center gap-[1px]">
                {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1].map((w, idx) => (
                  <div
                    key={idx}
                    className="h-3 bg-black"
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
              <span className="text-[6.5px] font-mono font-bold text-neutral-700">000011-88741</span>
            </div>

            <div className="z-10 text-center space-y-0.5 mt-1">
              <div className="text-[7.5px] italic text-[#FED7AA]">Gloria Anzaldúa</div>
              <h3 className="text-sm font-bold text-[#FDE047] leading-tight">
                Borderlands
                <br />
                <span className="text-white text-base italic font-serif">La Frontera</span>
              </h3>
              <div className="text-[7px] text-[#FEF08A]/90 italic">The New Mestiza</div>
            </div>

            {/* Folk Art Graphic */}
            <div className="my-auto mx-auto w-24 h-16 relative flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 60">
                <path d="M10 45 C 30 10, 50 60, 70 20 C 80 5, 90 30, 95 45" stroke="#06B6D4" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M15 50 C 35 15, 55 65, 75 25 C 85 10, 95 35, 100 50" stroke="#EC4899" strokeWidth="3" fill="none" strokeLinecap="round" />
                <circle cx="50" cy="22" r="8" fill="#FBBF24" />
              </svg>
            </div>

            <div className="text-center z-10 text-[7px] text-white/70 uppercase tracking-widest font-sans">
              Third Edition
            </div>
          </div>
        );

      // 5. NAUSICAA OF THE VALLEY OF WIND
      case 'nausicaa':
        return (
          <div className="w-full h-full bg-[#1E3A8A] text-white flex flex-col justify-between p-2.5 relative overflow-hidden select-none font-sans">
            <div className="text-center z-10 space-y-0.5">
              <div className="text-[7px] tracking-widest uppercase text-sky-200 font-bold">
                The Graphic Novel
              </div>
              <h3 className="text-sm font-extrabold tracking-wider text-white uppercase font-sans">
                Nausicaä
              </h3>
              <div className="text-[6.5px] uppercase tracking-widest text-sky-300">
                Of The Valley Of Wind
              </div>
            </div>

            {/* Nausicaä Anime Style Illustration Motif */}
            <div className="mx-auto w-24 h-24 relative flex items-center justify-center my-auto">
              <div className="absolute inset-0 bg-gradient-to-b from-sky-400/20 to-transparent rounded-full" />
              <svg className="w-20 h-24" viewBox="0 0 100 120">
                {/* Wind glider silhouette */}
                <path d="M10 30 Q 50 15 90 30 L 70 36 Q 50 25 30 36 Z" fill="#F8FAFC" />
                {/* Character tunic & rifle */}
                <path d="M42 40 L 58 40 L 62 80 L 38 80 Z" fill="#0284C7" />
                <circle cx="50" cy="34" r="6" fill="#FED7AA" />
                <line x1="38" y1="35" x2="68" y2="85" stroke="#78350F" strokeWidth="2.5" />
                {/* Desert Wind Dunes */}
                <path d="M0 95 Q 50 80 100 95 L 100 120 L 0 120 Z" fill="#D97706" />
                <path d="M0 105 Q 40 95 100 105 L 100 120 L 0 120 Z" fill="#92400E" />
              </svg>
            </div>

            <div className="text-center z-10 space-y-0.5">
              <div className="text-[7px] font-bold text-amber-300 uppercase tracking-wider">
                Hayao Miyazaki
              </div>
              <div className="text-[6px] text-sky-200">
                Perfect Collection
              </div>
            </div>
          </div>
        );

      // 6. LOGIC: THE THEORY OF INQUIRY
      case 'logic-dewey':
        return (
          <div className="w-full h-full bg-[#F5EFE3] text-[#292524] flex flex-col justify-between p-3 relative overflow-hidden select-none border border-[#E7DECD]">
            <div className="border border-[#78716C]/40 p-2.5 h-full flex flex-col justify-between">
              <div className="text-center space-y-1">
                <h3 className="font-serif text-lg font-bold tracking-widest uppercase text-[#1C1917]">
                  Logic
                </h3>
                <div className="text-[7px] uppercase tracking-wider font-serif text-[#57534E]">
                  The Theory of Inquiry
                </div>
                <div className="text-[6.5px] italic font-serif text-[#78716C]">
                  by
                </div>
                <div className="text-[8px] font-serif uppercase tracking-widest font-semibold text-[#292524]">
                  John Dewey
                </div>
              </div>

              {/* Antique Publisher Seal Emblem */}
              <div className="my-auto flex justify-center py-2">
                <div className="w-10 h-10 rounded-full border-2 border-[#78716C]/60 flex items-center justify-center p-1">
                  <div className="w-7 h-7 rounded-full border border-[#78716C]/40 flex items-center justify-center">
                    <span className="font-serif text-xs font-black text-[#57534E]">Ω</span>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-0.5 font-serif text-[6.5px] uppercase tracking-wider text-[#78716C]">
                <div>New York</div>
                <div className="font-semibold text-[#44403C]">Henry Holt and Company</div>
              </div>
            </div>
          </div>
        );

      // 7. SÉBASTIEN ROCH
      case 'sebastien-roch':
        return (
          <div className="w-full h-full bg-[#1C1917] text-white flex flex-col justify-between p-2 relative overflow-hidden select-none">
            {/* Top Black Banner with Gold Border */}
            <div className="bg-black/90 border border-[#D4AF37] p-1.5 text-center space-y-0.5 shadow-md">
              <h3 className="font-serif text-xs italic font-bold text-[#FDE047]">
                Sébastien Roch
              </h3>
              <div className="text-[6.5px] uppercase tracking-widest text-slate-300 font-serif">
                Octave Mirbeau
              </div>
            </div>

            {/* Surrealist Painting with Coiled Serpent Motif */}
            <div className="my-auto mx-auto w-24 h-28 relative rounded overflow-hidden bg-[#292524] flex items-center justify-center border border-white/10">
              <svg className="w-full h-full" viewBox="0 0 100 120">
                <rect width="100" height="120" fill="#451A03" />
                {/* Golden Youth Face Silhouette */}
                <circle cx="45" cy="55" r="18" fill="#FDE68A" />
                {/* Classical Muse in background */}
                <path d="M55 20 Q 75 30 70 65 L 85 120 L 50 120 Z" fill="#991B1B" opacity="0.7" />
                {/* Coiled Blue Serpent */}
                <path
                  d="M30 75 Q 45 40 65 60 Q 75 80 45 90 Q 25 100 50 115"
                  stroke="#0284C7"
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="text-[6px] font-mono text-center text-slate-400 uppercase tracking-widest">
              Translated by Nicoletta Simeborowski
            </div>
          </div>
        );

      // 8. EL CRIMEN DEL PADRE AMARO
      case 'padre-amaro':
        return (
          <div className="w-full h-full bg-[#0F141C] text-white flex flex-col justify-between p-2.5 relative overflow-hidden select-none font-serif">
            <div className="z-10">
              <div className="text-[7.5px] tracking-widest uppercase text-[#DC2626] font-bold">
                Eça de Queirós
              </div>
            </div>

            {/* Chiaroscuro Priest Portrait */}
            <div className="my-auto mx-auto w-24 h-28 relative overflow-hidden flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 120">
                <circle cx="50" cy="40" r="16" fill="#FBCFE8" opacity="0.85" />
                {/* Priest cassock & collar */}
                <path d="M25 62 L 75 62 L 85 120 L 15 120 Z" fill="#090D16" />
                {/* White clerical collar */}
                <rect x="46" y="60" width="8" height="6" fill="#FFFFFF" />
              </svg>
            </div>

            <div className="z-10 space-y-0.5">
              <div className="text-[8px] text-slate-400 italic">El crimen del</div>
              <h3 className="text-base font-bold text-white leading-tight">
                Padre
                <br />
                Amaro
              </h3>
              <div className="text-[6px] text-slate-400 font-sans">
                The Crime of Father Amaro
              </div>
            </div>
          </div>
        );

      // 9. THE MAN WHO WAS THURSDAY
      case 'man-thursday':
        return (
          <div className="w-full h-full bg-[#1C1917] text-white flex flex-col justify-between relative overflow-hidden select-none font-serif">
            {/* Cubist / Futurist Angular Painting */}
            <div className="w-full h-44 relative overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 100 120" preserveAspectRatio="none">
                <polygon points="0,0 100,0 60,60 0,40" fill="#7F1D1D" />
                <polygon points="100,0 100,120 40,70 60,60" fill="#D97706" />
                <polygon points="0,40 60,60 30,120 0,120" fill="#1E293B" />
                <polygon points="30,120 60,60 100,120" fill="#B45309" />
                <circle cx="50" cy="50" r="12" fill="#FDE68A" opacity="0.8" />
              </svg>
            </div>

            {/* Black Title Banner at Bottom */}
            <div className="bg-black/95 p-2 text-center border-t border-neutral-800">
              <h3 className="font-serif text-[9px] font-bold tracking-wider text-white uppercase">
                The Man Who
                <br />
                Was Thursday
              </h3>
              <div className="text-[6.5px] uppercase tracking-widest text-[#F59E0B] font-sans mt-0.5">
                G. K. Chesterton
              </div>
            </div>
          </div>
        );

      // 10. CAPTAINS COURAGEOUS
      case 'captains-courageous':
        return (
          <div className="w-full h-full bg-[#F7F3E9] text-[#292524] flex flex-col justify-between p-3 relative overflow-hidden select-none font-serif border border-[#E7E0D3]">
            <div className="text-center space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#1C1917] leading-tight">
                Captains
                <br />
                Courageous
              </h3>
              <div className="text-[6.5px] uppercase tracking-wider text-[#78716C]">
                A Story of the Grand Banks
              </div>
              <div className="text-[6.5px] italic text-[#A8A29E]">by</div>
              <div className="text-[7.5px] uppercase tracking-widest font-semibold text-[#44403C]">
                Rudyard Kipling
              </div>
            </div>

            {/* Maritime Sailboat Sketch */}
            <div className="my-auto mx-auto flex items-center justify-center py-2">
              <svg className="w-16 h-16" viewBox="0 0 100 100">
                <path d="M15 70 L 85 70 L 75 85 L 25 85 Z" fill="#78716C" />
                <path d="M50 20 L 50 70 M 50 25 L 80 65 L 50 65 Z" fill="#D6D3D1" stroke="#57534E" strokeWidth="1.5" />
                <path d="M50 30 L 20 65 L 50 65 Z" fill="#E7E5E4" stroke="#57534E" strokeWidth="1.5" />
              </svg>
            </div>

            <div className="text-center text-[6px] uppercase tracking-wider text-[#A8A29E] border-t border-[#E7E0D3] pt-1">
              London • Macmillan &amp; Co.
            </div>
          </div>
        );

      // 11. THE CASTLE OF OTRANTO (Exact reference with archway)
      case 'castle-otranto':
        return (
          <div className="w-full h-full bg-[#1C1917] text-white flex flex-col justify-between relative overflow-hidden select-none font-serif">
            {/* Gothic Stone Arch Window View */}
            <div className="w-full h-44 relative bg-[#292524] flex items-center justify-center p-2">
              {/* Stone Arch Outline */}
              <div className="w-24 h-36 rounded-t-full border-4 border-[#44403C] overflow-hidden relative bg-gradient-to-b from-[#7DD3FC] via-[#BAE6FD] to-[#CBD5E1] shadow-inner flex items-end">
                {/* Sky and Distant Hills */}
                <div className="w-full h-16 bg-[#64748B]/60 rounded-t-full" />
              </div>
            </div>

            {/* Black Title Banner at Bottom */}
            <div className="bg-black/95 p-2 text-center border-t border-neutral-800">
              <h3 className="font-serif text-[9px] font-bold tracking-wider text-white uppercase">
                The Castle
                <br />
                Of Otranto
              </h3>
              <div className="text-[6.5px] uppercase tracking-widest text-[#94A3B8] font-sans mt-0.5">
                Horace Walpole
              </div>
            </div>
          </div>
        );

      // 12. THE NAPOLEON OF NOTTING HILL
      case 'napoleon-notting-hill':
        return (
          <div className="w-full h-full bg-[#1C1917] text-white flex flex-col justify-between relative overflow-hidden select-none font-serif">
            {/* Neoclassical Building Painting */}
            <div className="w-full h-44 relative bg-[#3F3F46] flex items-center justify-center overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 100 120" preserveAspectRatio="none">
                <rect width="100" height="120" fill="#4B5563" />
                {/* Grand British Portico Columns */}
                <rect x="15" y="40" width="8" height="50" fill="#E5E7EB" />
                <rect x="35" y="40" width="8" height="50" fill="#E5E7EB" />
                <rect x="55" y="40" width="8" height="50" fill="#E5E7EB" />
                <rect x="75" y="40" width="8" height="50" fill="#E5E7EB" />
                <polygon points="10,40 50,15 90,40" fill="#D1D5DB" />
                {/* Crowd in foreground */}
                <rect x="0" y="90" width="100" height="30" fill="#991B1B" opacity="0.6" />
              </svg>
            </div>

            {/* Black Title Banner at Bottom */}
            <div className="bg-black/95 p-2 text-center border-t border-neutral-800">
              <h3 className="font-serif text-[8.5px] font-bold tracking-wider text-white uppercase">
                The Napoleon
                <br />
                Of Notting Hill
              </h3>
              <div className="text-[6.5px] uppercase tracking-widest text-[#F59E0B] font-sans mt-0.5">
                G. K. Chesterton
              </div>
            </div>
          </div>
        );

      // 13. CLRS (Algorithms)
      case 'clrs':
        return (
          <div className="w-full h-full bg-[#0F172A] text-white flex flex-col justify-between p-2.5 relative overflow-hidden select-none font-sans">
            <div className="space-y-1 z-10">
              <div className="text-[7px] tracking-widest uppercase text-sky-400 font-mono font-bold">
                The MIT Press
              </div>
              <h3 className="text-xs font-bold text-white tracking-tight leading-snug">
                Introduction to
                <br />
                Algorithms
              </h3>
              <div className="text-[6.5px] text-slate-400 font-mono">
                Fourth Edition
              </div>
            </div>

            {/* Binary Tree Graphic */}
            <div className="my-auto mx-auto w-24 h-16 relative flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 60">
                <line x1="50" y1="10" x2="25" y2="30" stroke="#38BDF8" strokeWidth="1.5" />
                <line x1="50" y1="10" x2="75" y2="30" stroke="#38BDF8" strokeWidth="1.5" />
                <line x1="25" y1="30" x2="12" y2="50" stroke="#38BDF8" strokeWidth="1.5" />
                <line x1="25" y1="30" x2="38" y2="50" stroke="#38BDF8" strokeWidth="1.5" />
                <line x1="75" y1="30" x2="62" y2="50" stroke="#38BDF8" strokeWidth="1.5" />
                <line x1="75" y1="30" x2="88" y2="50" stroke="#38BDF8" strokeWidth="1.5" />
                <circle cx="50" cy="10" r="4" fill="#0284C7" />
                <circle cx="25" cy="30" r="4" fill="#0284C7" />
                <circle cx="75" cy="30" r="4" fill="#0284C7" />
                <circle cx="12" cy="50" r="3.5" fill="#38BDF8" />
                <circle cx="38" cy="50" r="3.5" fill="#38BDF8" />
                <circle cx="62" cy="50" r="3.5" fill="#38BDF8" />
                <circle cx="88" cy="50" r="3.5" fill="#38BDF8" />
              </svg>
            </div>

            <div className="text-[6.5px] font-mono text-slate-300 z-10 leading-tight">
              Cormen • Leiserson
              <br />
              Rivest • Stein
            </div>
          </div>
        );

      // 14. GREWAL (Higher Engineering Mathematics)
      case 'grewal':
        return (
          <div className="w-full h-full bg-[#7F1D1D] text-[#FEF3C7] flex flex-col justify-between p-2.5 relative overflow-hidden select-none font-serif border border-[#991B1B]">
            <div className="border border-[#FDE68A]/30 p-2 h-full flex flex-col justify-between">
              <div className="text-center space-y-1">
                <div className="text-[7px] uppercase tracking-widest text-[#FCD34D] font-mono font-bold">
                  Khanna Publishers
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white leading-tight font-serif">
                  Higher
                  <br />
                  Engineering
                  <br />
                  Mathematics
                </h3>
              </div>

              {/* Gold Math Crest */}
              <div className="my-auto flex justify-center py-2">
                <div className="w-10 h-10 rounded-full border border-[#FDE68A]/60 flex items-center justify-center">
                  <span className="font-serif text-sm font-bold text-[#FDE68A]">∫dx</span>
                </div>
              </div>

              <div className="text-center space-y-0.5">
                <div className="text-[8px] font-bold text-[#FEF08A] font-serif">
                  Dr. B.S. Grewal
                </div>
                <div className="text-[6px] font-mono text-white/70">
                  44th Edition • Metric SI
                </div>
              </div>
            </div>
          </div>
        );

      // 15. C PROGRAMMING LANGUAGE (K&R)
      case 'c-kr':
        return (
          <div className="w-full h-full bg-[#F8FAFC] text-slate-800 flex flex-col justify-between p-2.5 relative overflow-hidden select-none font-mono border border-slate-300">
            <div className="space-y-0.5">
              <div className="text-[7px] uppercase tracking-wider text-blue-700 font-bold">
                Prentice Hall Software Series
              </div>
              <h3 className="text-xs font-black tracking-tight text-slate-900 leading-tight">
                The C
                <br />
                Programming
                <br />
                Language
              </h3>
            </div>

            {/* Large C Monogram */}
            <div className="my-auto flex justify-center">
              <span className="text-5xl font-black text-blue-600 font-sans">
                C
              </span>
            </div>

            <div className="space-y-0.5 text-[7px] text-slate-600 font-semibold">
              <div>Brian W. Kernighan</div>
              <div>Dennis M. Ritchie</div>
            </div>
          </div>
        );

      // 16. DATABASE SYSTEM CONCEPTS (Silberschatz)
      case 'silberschatz-db':
        return (
          <div className="w-full h-full bg-[#14532D] text-white flex flex-col justify-between p-2.5 relative overflow-hidden select-none font-sans">
            <div className="space-y-1">
              <div className="text-[7px] uppercase tracking-wider text-emerald-300 font-bold">
                McGraw-Hill Education
              </div>
              <h3 className="text-xs font-bold text-white leading-tight font-serif">
                Database System
                <br />
                Concepts
              </h3>
              <div className="text-[6.5px] text-emerald-200/90 font-mono">
                Seventh Edition
              </div>
            </div>

            {/* Relational schema icon */}
            <div className="my-auto mx-auto w-16 h-12 border border-emerald-400/40 rounded p-1 flex flex-col justify-between">
              <div className="h-2 bg-emerald-400/30 rounded-xs" />
              <div className="h-1.5 bg-emerald-400/20 rounded-xs" />
              <div className="h-1.5 bg-emerald-400/20 rounded-xs" />
            </div>

            <div className="text-[6.5px] text-emerald-100 font-mono">
              Silberschatz • Korth • Sudarshan
            </div>
          </div>
        );

      // 17. DEEP LEARNING (Goodfellow)
      case 'deep-learning':
        return (
          <div className="w-full h-full bg-[#312E81] text-white flex flex-col justify-between p-2.5 relative overflow-hidden select-none font-sans">
            <div className="space-y-1">
              <div className="text-[7px] uppercase tracking-wider text-indigo-300 font-mono font-bold">
                Adaptive Computation &amp; ML
              </div>
              <h3 className="text-sm font-black tracking-tight text-white uppercase font-sans">
                Deep
                <br />
                Learning
              </h3>
            </div>

            {/* Neural Net Matrix Graphic */}
            <div className="my-auto mx-auto w-24 h-14 relative flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 60">
                <circle cx="20" cy="15" r="4" fill="#818CF8" />
                <circle cx="20" cy="30" r="4" fill="#818CF8" />
                <circle cx="20" cy="45" r="4" fill="#818CF8" />
                <circle cx="50" cy="10" r="4" fill="#A5B4FC" />
                <circle cx="50" cy="25" r="4" fill="#A5B4FC" />
                <circle cx="50" cy="40" r="4" fill="#A5B4FC" />
                <circle cx="50" cy="55" r="4" fill="#A5B4FC" />
                <circle cx="80" cy="20" r="4" fill="#C7D2FE" />
                <circle cx="80" cy="40" r="4" fill="#C7D2FE" />
                <line x1="20" y1="15" x2="50" y2="10" stroke="#6366F1" strokeWidth="0.75" />
                <line x1="20" y1="15" x2="50" y2="25" stroke="#6366F1" strokeWidth="0.75" />
                <line x1="20" y1="30" x2="50" y2="25" stroke="#6366F1" strokeWidth="0.75" />
                <line x1="20" y1="30" x2="50" y2="40" stroke="#6366F1" strokeWidth="0.75" />
                <line x1="50" y1="25" x2="80" y2="20" stroke="#6366F1" strokeWidth="0.75" />
                <line x1="50" y1="40" x2="80" y2="40" stroke="#6366F1" strokeWidth="0.75" />
              </svg>
            </div>

            <div className="text-[6.5px] font-mono text-indigo-200">
              Goodfellow • Bengio • Courville
            </div>
          </div>
        );

      // 18. CONCEPTS OF MODERN PHYSICS (Beiser)
      case 'beiser':
        return (
          <div className="w-full h-full bg-[#4A044E] text-white flex flex-col justify-between p-2.5 relative overflow-hidden select-none font-sans">
            <div className="space-y-1">
              <div className="text-[7px] uppercase tracking-wider text-fuchsia-300 font-bold">
                McGraw-Hill International
              </div>
              <h3 className="text-xs font-bold text-white leading-tight font-serif">
                Concepts of
                <br />
                Modern Physics
              </h3>
            </div>

            {/* Atomic Orbit Motif */}
            <div className="my-auto mx-auto w-16 h-16 relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border border-fuchsia-400/50 absolute rotate-45" />
              <div className="w-12 h-12 rounded-full border border-cyan-400/50 absolute -rotate-45" />
              <div className="w-3 h-3 rounded-full bg-cyan-300 shadow-md" />
            </div>

            <div className="text-[7px] text-fuchsia-200 font-serif">
              Arthur Beiser
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-full bg-slate-800 text-white p-3 flex flex-col justify-between">
            <div className="text-xs font-bold">{book.title}</div>
            <div className="text-[9px] text-slate-400">{book.author}</div>
          </div>
        );
    }
  };

  return (
    <div className="relative w-full h-full rounded-[3px] overflow-hidden shadow-[2px_4px_12px_rgba(0,0,0,0.22),0_1px_3px_rgba(0,0,0,0.12)]">
      {/* 1. Cover Art */}
      {renderCoverArt()}

      {/* 2. Realistic Left Spine Crease & Shadow */}
      <div
        className="absolute top-0 bottom-0 left-0 w-4 pointer-events-none z-20"
        style={{
          background:
            'linear-gradient(to right, rgba(0,0,0,0.36) 0%, rgba(255,255,255,0.20) 22%, rgba(0,0,0,0.10) 45%, transparent 100%)',
        }}
      />

      {/* 3. Subtle Right Edge Page Shadow */}
      <div
        className="absolute top-0 bottom-0 right-0 w-[2px] pointer-events-none z-20"
        style={{
          background: 'linear-gradient(to left, rgba(0,0,0,0.25), transparent)',
        }}
      />

      {/* 4. Hover Tooltip (Matching reference picture "The Castle of Otranto") */}
      {isHovered && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none whitespace-nowrap bg-[#1C1D1F] text-white text-xs font-medium px-3 py-1.5 rounded shadow-2xl border border-black/40 animate-fade-in">
          {book.title}
        </div>
      )}
    </div>
  );
};
