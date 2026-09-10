import React from 'react';
import { LibraryBook } from '../../data/libraryShelves';

interface BookCoverRendererProps {
  book: LibraryBook;
  isHovered: boolean;
}

export const BookCoverRenderer: React.FC<BookCoverRendererProps> = ({ book, isHovered }) => {
  const renderCoverArt = () => {
    switch (book.coverType) {
      // 1. CLRS: INTRODUCTION TO ALGORITHMS
      case 'clrs':
        return (
          <div className="w-full h-full bg-[#0B132B] text-white flex flex-col justify-between p-2.5 relative overflow-hidden select-none font-sans">
            <div className="space-y-1 z-10">
              <div className="text-[7px] tracking-widest uppercase text-sky-400 font-mono font-bold">
                The MIT Press
              </div>
              <h3 className="text-xs font-bold text-white tracking-tight leading-snug">
                Introduction to
                <br />
                <span className="text-sky-300 text-sm font-black font-sans">Algorithms</span>
              </h3>
              <div className="text-[6.5px] text-slate-400 font-mono">
                Fourth Edition • Worldwide Reference
              </div>
            </div>

            {/* Binary Search Tree Graphic */}
            <div className="my-auto mx-auto w-24 h-16 relative flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 60">
                <line x1="50" y1="10" x2="25" y2="30" stroke="#38BDF8" strokeWidth="1.5" />
                <line x1="50" y1="10" x2="75" y2="30" stroke="#38BDF8" strokeWidth="1.5" />
                <line x1="25" y1="30" x2="12" y2="50" stroke="#38BDF8" strokeWidth="1.5" />
                <line x1="25" y1="30" x2="38" y2="50" stroke="#38BDF8" strokeWidth="1.5" />
                <line x1="75" y1="30" x2="62" y2="50" stroke="#38BDF8" strokeWidth="1.5" />
                <line x1="75" y1="30" x2="88" y2="50" stroke="#38BDF8" strokeWidth="1.5" />
                <circle cx="50" cy="10" r="4.5" fill="#0284C7" stroke="#38BDF8" strokeWidth="1" />
                <circle cx="25" cy="30" r="4" fill="#0284C7" stroke="#38BDF8" strokeWidth="1" />
                <circle cx="75" cy="30" r="4" fill="#0284C7" stroke="#38BDF8" strokeWidth="1" />
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

      // 2. GREWAL: HIGHER ENGINEERING MATHEMATICS
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
                <div className="w-11 h-11 rounded-full border-2 border-[#FDE68A]/70 flex items-center justify-center shadow-inner">
                  <span className="font-serif text-base font-bold text-[#FDE68A]">∫dx</span>
                </div>
              </div>

              <div className="text-center space-y-0.5">
                <div className="text-[8.5px] font-bold text-[#FEF08A] font-serif">
                  Dr. B.S. Grewal
                </div>
                <div className="text-[6px] font-mono text-white/70">
                  44th Edition • B.Tech Standard
                </div>
              </div>
            </div>
          </div>
        );

      // 3. K&R: THE C PROGRAMMING LANGUAGE
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
              <div className="text-[6.5px] text-slate-500 font-mono">Second Edition • ANSI C</div>
            </div>

            {/* Giant Iconic Blue C */}
            <div className="my-auto flex justify-center">
              <span className="text-6xl font-black text-blue-600 font-sans tracking-tighter drop-shadow-sm">
                C
              </span>
            </div>

            <div className="space-y-0.5 text-[7px] text-slate-700 font-semibold border-t border-slate-200 pt-1">
              <div>Brian W. Kernighan</div>
              <div>Dennis M. Ritchie</div>
            </div>
          </div>
        );

      // 4. BEISER: CONCEPTS OF MODERN PHYSICS
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
                <span className="text-fuchsia-300 text-sm font-sans font-bold">Modern Physics</span>
              </h3>
            </div>

            {/* Quantum Orbit Motif */}
            <div className="my-auto mx-auto w-16 h-16 relative flex items-center justify-center">
              <div className="w-14 h-14 rounded-full border border-fuchsia-400/60 absolute rotate-45" />
              <div className="w-14 h-14 rounded-full border border-cyan-400/60 absolute -rotate-45" />
              <div className="w-3 h-3 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee]" />
            </div>

            <div className="space-y-0.5 text-[7px] text-fuchsia-200 font-serif">
              <div className="font-bold">Arthur Beiser</div>
              <div className="text-[6px] text-slate-300 font-mono">Sixth Edition</div>
            </div>
          </div>
        );

      // 5. SILBERSCHATZ: DATABASE SYSTEM CONCEPTS
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
                <span className="text-emerald-300 font-sans font-black text-sm">Concepts</span>
              </h3>
              <div className="text-[6.5px] text-emerald-200/90 font-mono">
                Seventh Edition
              </div>
            </div>

            {/* Relational Table Schema Grid */}
            <div className="my-auto mx-auto w-20 h-14 border border-emerald-400/40 rounded p-1.5 flex flex-col justify-between bg-black/20">
              <div className="h-2.5 bg-emerald-400/40 rounded-xs flex items-center px-1">
                <div className="w-2 h-1 bg-emerald-200 rounded-xs" />
              </div>
              <div className="h-1.5 bg-emerald-400/20 rounded-xs" />
              <div className="h-1.5 bg-emerald-400/20 rounded-xs" />
              <div className="h-1.5 bg-emerald-400/20 rounded-xs" />
            </div>

            <div className="text-[6.5px] text-emerald-100 font-mono">
              Silberschatz • Korth • Sudarshan
            </div>
          </div>
        );

      // 6. RUSSELL & NORVIG: ARTIFICIAL INTELLIGENCE
      case 'russell-norvig':
        return (
          <div className="w-full h-full bg-[#3D2514] text-[#FEF3C7] flex flex-col justify-between p-2.5 relative overflow-hidden select-none font-serif">
            <div className="space-y-0.5 z-10">
              <div className="text-[7px] uppercase tracking-wider text-amber-300 font-mono font-bold">
                Pearson Series in AI
              </div>
              <h3 className="text-xs font-bold text-white leading-tight font-sans">
                Artificial Intelligence
              </h3>
              <div className="text-[7px] text-amber-200/90 italic font-serif">
                A Modern Approach
              </div>
            </div>

            {/* Chess Knight & Neural Graph */}
            <div className="my-auto mx-auto w-20 h-16 relative flex items-center justify-center">
              <svg className="w-16 h-16" viewBox="0 0 100 100">
                {/* Chess Knight Silhouette */}
                <path d="M40 85 L65 85 L60 65 C60 55, 75 45, 65 30 C60 20, 45 15, 35 25 C30 30, 25 45, 35 60 Z" fill="#F59E0B" />
                <circle cx="50" cy="30" r="3" fill="#1C1917" />
              </svg>
            </div>

            <div className="text-[6.5px] font-sans text-amber-100 z-10 border-t border-amber-800/60 pt-1">
              Stuart Russell • Peter Norvig
            </div>
          </div>
        );

      // 7. DRAGON BOOK: COMPILERS
      case 'dragon-compilers':
        return (
          <div className="w-full h-full bg-[#7C2D12] text-white flex flex-col justify-between p-2.5 relative overflow-hidden select-none font-serif">
            <div className="space-y-0.5 z-10">
              <div className="text-[7px] uppercase tracking-wider text-amber-300 font-mono font-bold">
                Addison-Wesley Computer Science
              </div>
              <h3 className="text-sm font-black tracking-tight text-white uppercase font-sans">
                Compilers
              </h3>
              <div className="text-[6.5px] text-amber-200">
                Principles, Techniques, &amp; Tools
              </div>
            </div>

            {/* Red Dragon Silhouette Artwork */}
            <div className="my-auto mx-auto w-20 h-20 relative flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Dragon Wings & Claws */}
                <path d="M20 70 Q 30 20 60 30 Q 80 15 90 40 Q 80 60 70 70 Q 50 85 20 70 Z" fill="#DC2626" />
                <path d="M40 40 L 70 10 L 60 45 Z" fill="#FBBF24" />
                {/* Knight Sword */}
                <line x1="25" y1="80" x2="55" y2="45" stroke="#FFFFFF" strokeWidth="2.5" />
              </svg>
            </div>

            <div className="text-[6px] font-mono text-amber-100 border-t border-amber-900/60 pt-1">
              Aho • Lam • Sethi • Ullman
            </div>
          </div>
        );

      // 8. DINOSAUR BOOK: OPERATING SYSTEM CONCEPTS
      case 'dinosaur-os':
        return (
          <div className="w-full h-full bg-[#0C4A6E] text-white flex flex-col justify-between p-2.5 relative overflow-hidden select-none font-sans">
            <div className="space-y-0.5 z-10">
              <div className="text-[7px] uppercase tracking-wider text-sky-300 font-bold">
                John Wiley &amp; Sons
              </div>
              <h3 className="text-xs font-bold text-white leading-tight">
                Operating System
                <br />
                <span className="text-sky-300 font-black text-sm">Concepts</span>
              </h3>
              <div className="text-[6.5px] text-sky-200/80 font-mono">Tenth Edition</div>
            </div>

            {/* Dinosaur Silhouette Graphic */}
            <div className="my-auto mx-auto w-20 h-16 relative flex items-center justify-center">
              <svg className="w-18 h-14" viewBox="0 0 100 70">
                <path
                  d="M10 50 Q 20 30 35 32 Q 50 15 70 20 Q 85 25 90 40 Q 80 55 65 52 Q 50 65 40 55 Z"
                  fill="#10B981"
                />
                <circle cx="75" cy="28" r="2.5" fill="#0C4A6E" />
                <rect x="35" y="48" width="6" height="18" fill="#10B981" />
                <rect x="55" y="48" width="6" height="18" fill="#10B981" />
              </svg>
            </div>

            <div className="text-[6.5px] font-mono text-sky-100 border-t border-sky-800 pt-1">
              Silberschatz • Galvin • Gagne
            </div>
          </div>
        );

      // 9. KUROSE & ROSS: COMPUTER NETWORKING
      case 'kurose-ross':
        return (
          <div className="w-full h-full bg-[#1E3A8A] text-white flex flex-col justify-between p-2.5 relative overflow-hidden select-none font-sans">
            <div className="space-y-0.5 z-10">
              <div className="text-[7px] uppercase tracking-wider text-orange-300 font-bold">
                Pearson Higher Ed
              </div>
              <h3 className="text-xs font-extrabold text-white leading-tight">
                Computer Networking
              </h3>
              <div className="text-[6.5px] text-orange-200 font-mono">
                A Top-Down Approach
              </div>
            </div>

            {/* Network Mesh Graphic */}
            <div className="my-auto mx-auto w-20 h-14 relative flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 60">
                <line x1="20" y1="20" x2="50" y2="10" stroke="#FB923C" strokeWidth="1.5" />
                <line x1="50" y1="10" x2="80" y2="25" stroke="#FB923C" strokeWidth="1.5" />
                <line x1="20" y1="20" x2="40" y2="45" stroke="#FB923C" strokeWidth="1.5" />
                <line x1="40" y1="45" x2="80" y2="25" stroke="#FB923C" strokeWidth="1.5" />
                <line x1="40" y1="45" x2="70" y2="50" stroke="#FB923C" strokeWidth="1.5" />
                <circle cx="20" cy="20" r="4" fill="#F97316" />
                <circle cx="50" cy="10" r="4" fill="#F97316" />
                <circle cx="80" cy="25" r="4" fill="#F97316" />
                <circle cx="40" cy="45" r="4" fill="#F97316" />
                <circle cx="70" cy="50" r="4" fill="#F97316" />
              </svg>
            </div>

            <div className="text-[6.5px] font-mono text-slate-200 border-t border-blue-800 pt-1">
              James F. Kurose • Keith W. Ross
            </div>
          </div>
        );

      // 10. KREYSZIG: ADVANCED ENGINEERING MATHEMATICS
      case 'kreyszig-math':
        return (
          <div className="w-full h-full bg-[#18181B] text-[#FEF08A] flex flex-col justify-between p-2.5 relative overflow-hidden select-none font-serif border border-[#3F3F46]">
            <div className="space-y-1">
              <div className="text-[7px] uppercase tracking-wider text-amber-400 font-mono font-bold">
                Wiley Engineering
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider leading-tight">
                Advanced
                <br />
                Engineering
                <br />
                Mathematics
              </h3>
            </div>

            {/* 3D Mathematical Wave Vector */}
            <div className="my-auto mx-auto w-20 h-16 relative flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 60">
                <path d="M10 40 Q 30 10 50 35 T 90 25" stroke="#F59E0B" strokeWidth="2" fill="none" />
                <path d="M10 45 Q 30 15 50 40 T 90 30" stroke="#FBBF24" strokeWidth="1.5" fill="none" opacity="0.6" />
                <path d="M10 50 Q 30 20 50 45 T 90 35" stroke="#FDE68A" strokeWidth="1" fill="none" opacity="0.4" />
              </svg>
            </div>

            <div className="text-[7px] font-bold text-amber-200 font-sans border-t border-[#3F3F46] pt-1">
              Erwin Kreyszig • 10th Edition
            </div>
          </div>
        );

      // 11. GRIFFITHS: INTRODUCTION TO ELECTRODYNAMICS
      case 'griffiths-em':
        return (
          <div className="w-full h-full bg-[#0E7490] text-white flex flex-col justify-between p-2.5 relative overflow-hidden select-none font-sans">
            <div className="space-y-0.5">
              <div className="text-[7px] uppercase tracking-wider text-cyan-200 font-bold">
                Cambridge University Press
              </div>
              <h3 className="text-xs font-bold text-white leading-tight font-serif">
                Introduction to
                <br />
                <span className="text-cyan-200 text-sm font-sans font-black">Electrodynamics</span>
              </h3>
            </div>

            {/* Magnetic Field Dipole Graphic */}
            <div className="my-auto mx-auto w-18 h-16 relative flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 70">
                <ellipse cx="50" cy="35" rx="35" ry="16" fill="none" stroke="#67E8F9" strokeWidth="1.5" />
                <ellipse cx="50" cy="35" rx="22" ry="10" fill="none" stroke="#A5F3FC" strokeWidth="1.2" />
                <circle cx="35" cy="35" r="4" fill="#EF4444" />
                <circle cx="65" cy="35" r="4" fill="#3B82F6" />
              </svg>
            </div>

            <div className="text-[7px] text-cyan-100 font-serif border-t border-cyan-800 pt-1">
              David J. Griffiths
            </div>
          </div>
        );

      // 12. SICP: WIZARD BOOK
      case 'sicp-wizard':
        return (
          <div className="w-full h-full bg-[#312E81] text-white flex flex-col justify-between p-2.5 relative overflow-hidden select-none font-serif">
            <div className="space-y-0.5">
              <div className="text-[7px] uppercase tracking-wider text-indigo-300 font-mono font-bold">
                MIT Electrical Eng &amp; CS
              </div>
              <h3 className="text-xs font-bold text-white leading-tight font-serif">
                Structure &amp;
                <br />
                Interpretation of
                <br />
                Computer Programs
              </h3>
            </div>

            {/* SICP Wizard Graphic */}
            <div className="my-auto mx-auto w-16 h-16 relative flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Wizard Robe & Hat */}
                <path d="M50 15 L35 50 L65 50 Z" fill="#818CF8" />
                <circle cx="50" cy="55" r="8" fill="#FDE68A" />
                <path d="M30 65 L70 65 L75 95 L25 95 Z" fill="#4338CA" />
                <circle cx="70" cy="45" r="4" fill="#FBBF24" />
              </svg>
            </div>

            <div className="text-[6.5px] font-mono text-indigo-200 border-t border-indigo-900 pt-1">
              Harold Abelson • Gerald Jay Sussman
            </div>
          </div>
        );

      // 13. DEEP LEARNING (Goodfellow)
      case 'deep-learning':
        return (
          <div className="w-full h-full bg-[#1E1B4B] text-white flex flex-col justify-between p-2.5 relative overflow-hidden select-none font-sans">
            <div className="space-y-1">
              <div className="text-[7px] uppercase tracking-wider text-indigo-300 font-mono font-bold">
                The MIT Press
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
                <circle cx="20" cy="15" r="3.5" fill="#818CF8" />
                <circle cx="20" cy="30" r="3.5" fill="#818CF8" />
                <circle cx="20" cy="45" r="3.5" fill="#818CF8" />
                <circle cx="50" cy="10" r="3.5" fill="#A5B4FC" />
                <circle cx="50" cy="25" r="3.5" fill="#A5B4FC" />
                <circle cx="50" cy="40" r="3.5" fill="#A5B4FC" />
                <circle cx="50" cy="55" r="3.5" fill="#A5B4FC" />
                <circle cx="80" cy="20" r="3.5" fill="#C7D2FE" />
                <circle cx="80" cy="40" r="3.5" fill="#C7D2FE" />
                <line x1="20" y1="15" x2="50" y2="10" stroke="#6366F1" strokeWidth="0.75" />
                <line x1="20" y1="15" x2="50" y2="25" stroke="#6366F1" strokeWidth="0.75" />
                <line x1="20" y1="30" x2="50" y2="25" stroke="#6366F1" strokeWidth="0.75" />
                <line x1="20" y1="30" x2="50" y2="40" stroke="#6366F1" strokeWidth="0.75" />
                <line x1="50" y1="25" x2="80" y2="20" stroke="#6366F1" strokeWidth="0.75" />
                <line x1="50" y1="40" x2="80" y2="40" stroke="#6366F1" strokeWidth="0.75" />
              </svg>
            </div>

            <div className="text-[6.5px] font-mono text-indigo-200 border-t border-indigo-900 pt-1">
              Goodfellow • Bengio • Courville
            </div>
          </div>
        );

      // 14. EFFECTIVE JAVA (Bloch)
      case 'effective-java':
        return (
          <div className="w-full h-full bg-[#9A3412] text-white flex flex-col justify-between p-2.5 relative overflow-hidden select-none font-sans">
            <div className="space-y-0.5">
              <div className="text-[7px] uppercase tracking-wider text-orange-200 font-bold">
                Addison-Wesley Java Series
              </div>
              <h3 className="text-xs font-extrabold text-white leading-tight">
                Effective
                <br />
                <span className="text-amber-300 text-sm font-black">Java</span>
              </h3>
              <div className="text-[6.5px] text-orange-100 font-mono">Third Edition • Best Practices</div>
            </div>

            {/* Coffee Cup & Java Crest */}
            <div className="my-auto mx-auto w-16 h-16 relative flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <rect x="25" y="40" width="45" height="40" rx="6" fill="#F97316" stroke="#FEF3C7" strokeWidth="2" />
                <path d="M70 50 C82 50, 82 70, 70 70" fill="none" stroke="#FEF3C7" strokeWidth="2.5" />
                {/* Steam Waves */}
                <path d="M40 25 Q 45 15 40 10" stroke="#FDE68A" strokeWidth="2" fill="none" />
                <path d="M55 25 Q 60 15 55 10" stroke="#FDE68A" strokeWidth="2" fill="none" />
              </svg>
            </div>

            <div className="text-[7px] font-mono text-orange-100 border-t border-orange-800 pt-1">
              Joshua Bloch
            </div>
          </div>
        );

      // 15. FLUENT PYTHON (Ramalho)
      case 'fluent-python':
        return (
          <div className="w-full h-full bg-[#0F172A] text-white flex flex-col justify-between p-2.5 relative overflow-hidden select-none font-mono border-t-4 border-[#0284C7]">
            <div className="space-y-0.5">
              <div className="text-[7px] tracking-widest uppercase text-sky-400 font-bold">
                O'Reilly Media
              </div>
              <h3 className="text-xs font-black text-white leading-tight font-sans">
                Fluent
                <br />
                Python
              </h3>
              <div className="text-[6px] text-slate-400">Clear, Concise, &amp; Effective Code</div>
            </div>

            {/* Animal Silhouette Woodcut (Python style) */}
            <div className="my-auto mx-auto w-20 h-16 relative flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 60">
                <path
                  d="M20 30 Q 35 10 50 30 T 80 30 Q 85 45 70 45 T 30 45 Z"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="22" cy="28" r="2" fill="#38BDF8" />
              </svg>
            </div>

            <div className="text-[6.5px] text-slate-300 border-t border-slate-700 pt-1">
              Luciano Ramalho
            </div>
          </div>
        );

      // 16. DDIA (Kleppmann)
      case 'ddia-kleppmann':
        return (
          <div className="w-full h-full bg-[#1C1917] text-white flex flex-col justify-between p-2.5 relative overflow-hidden select-none font-sans border-t-4 border-[#DC2626]">
            <div className="space-y-0.5">
              <div className="text-[7px] tracking-widest uppercase text-rose-400 font-mono font-bold">
                O'Reilly Media
              </div>
              <h3 className="text-xs font-black text-white leading-tight">
                Designing
                <br />
                Data-Intensive
                <br />
                <span className="text-rose-400">Applications</span>
              </h3>
            </div>

            {/* Wild Boar Woodcut Motif */}
            <div className="my-auto mx-auto w-20 h-16 relative flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 60">
                <path
                  d="M20 40 Q 30 20 55 22 Q 80 25 85 40 Q 75 52 50 50 Z"
                  fill="#78716C"
                />
                <circle cx="78" cy="35" r="2" fill="#FFFFFF" />
                <rect x="30" y="45" width="5" height="12" fill="#78716C" />
                <rect x="65" y="45" width="5" height="12" fill="#78716C" />
              </svg>
            </div>

            <div className="text-[6.5px] font-mono text-slate-300 border-t border-neutral-700 pt-1">
              Martin Kleppmann
            </div>
          </div>
        );

      // 17. CLEAN CODE (Uncle Bob)
      case 'clean-code':
        return (
          <div className="w-full h-full bg-[#1E293B] text-white flex flex-col justify-between p-2.5 relative overflow-hidden select-none font-sans border border-slate-700">
            <div className="space-y-0.5">
              <div className="text-[7px] uppercase tracking-wider text-blue-400 font-mono font-bold">
                Robert C. Martin Series
              </div>
              <h3 className="text-sm font-black tracking-tight text-white uppercase font-sans">
                Clean
                <br />
                Code
              </h3>
              <div className="text-[6.5px] text-slate-300">A Handbook of Agile Craftsmanship</div>
            </div>

            {/* Clean Code Emblem */}
            <div className="my-auto mx-auto w-14 h-14 rounded-xl bg-blue-600/20 border border-blue-400/40 flex items-center justify-center">
              <span className="font-mono text-lg font-black text-blue-400">&lt;/&gt;</span>
            </div>

            <div className="text-[6.5px] font-mono text-slate-300 border-t border-slate-700 pt-1">
              Robert C. Martin ("Uncle Bob")
            </div>
          </div>
        );

      // 18. ASYNCIO IN PYTHON (Hattingh)
      case 'asyncio-python':
        return (
          <div className="w-full h-full bg-[#18181B] text-white flex flex-col justify-between p-2.5 relative overflow-hidden select-none font-mono border-t-4 border-[#06B6D4]">
            <div className="space-y-0.5">
              <div className="text-[7px] tracking-widest uppercase text-cyan-400 font-bold">
                O'Reilly Media
              </div>
              <h3 className="text-xs font-bold text-white leading-tight font-sans">
                Using Asyncio
                <br />
                in Python
              </h3>
              <div className="text-[6px] text-slate-400">Understanding Python's Asynchronous Engine</div>
            </div>

            {/* Async Event Loop Graphic */}
            <div className="my-auto mx-auto w-16 h-16 relative flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="28" fill="none" stroke="#06B6D4" strokeWidth="2.5" strokeDasharray="6 4" />
                <circle cx="50" cy="22" r="5" fill="#22D3EE" />
                <circle cx="78" cy="50" r="5" fill="#22D3EE" />
                <circle cx="50" cy="78" r="5" fill="#22D3EE" />
              </svg>
            </div>

            <div className="text-[6.5px] text-slate-300 border-t border-neutral-800 pt-1">
              Caleb Hattingh
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

      {/* 4. Hover Tooltip (Dark floating card on hover) */}
      {isHovered && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none whitespace-nowrap bg-[#1C1D1F] text-white text-xs font-medium px-3 py-1.5 rounded shadow-2xl border border-black/40">
          {book.title}
        </div>
      )}
    </div>
  );
};
