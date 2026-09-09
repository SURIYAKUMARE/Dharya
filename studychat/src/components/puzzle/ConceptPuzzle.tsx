import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMaskedFeature } from '../../hooks/useMaskedFeature';
import { Grid3X3, Shuffle, Trophy, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ConceptPuzzle: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { isMasked, title, description, courseCode } = useMaskedFeature('practice');

  // 3x3 sliding puzzle tile state (0 represents the empty space)
  // Target solved state: [1, 2, 3, 4, 5, 6, 7, 8, 0]
  const solvedState = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  const [board, setBoard] = useState<number[]>([1, 2, 3, 4, 0, 5, 7, 8, 6]);
  const [moves, setMoves] = useState(0);
  const [isSolved, setIsSolved] = useState(false);

  // Check solved
  useEffect(() => {
    const won = board.every((val, idx) => val === solvedState[idx]);
    if (won && moves > 0) {
      setIsSolved(true);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#6366f1', '#ec4899', '#f59e0b'],
      });
    }
  }, [board, moves]);

  const handleTileClick = (index: number) => {
    const emptyIndex = board.indexOf(0);
    const row = Math.floor(index / 3);
    const col = index % 3;
    const emptyRow = Math.floor(emptyIndex / 3);
    const emptyCol = emptyIndex % 3;

    // Check if adjacent (same row & diff col 1, or same col & diff row 1)
    const isAdjacent =
      (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
      (col === emptyCol && Math.abs(row - emptyRow) === 1);

    if (isAdjacent) {
      const nextBoard = [...board];
      nextBoard[emptyIndex] = board[index];
      nextBoard[index] = 0;
      setBoard(nextBoard);
      setMoves((m) => m + 1);
    }
  };

  const handleShuffle = () => {
    // Solvable permutation
    setBoard([2, 1, 3, 4, 5, 6, 7, 0, 8]);
    setMoves(0);
    setIsSolved(false);
  };

  const handleAutoSolve = () => {
    setBoard([...solvedState]);
    setMoves((m) => m + 1);
  };

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="bg-[#0d0a17]/90 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <Grid3X3 className="w-4 h-4" />
            <span>{courseCode}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">{description}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
            Moves: <span className="text-emerald-400 font-bold">{moves}</span>
          </div>
        </div>
      </div>

      {/* Main Puzzle Container */}
      <div className="bg-[#0d0a17]/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col items-center">
        {/* Solved Banner */}
        {isSolved && (
          <div className="w-full mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-center flex items-center justify-center gap-3 font-semibold text-xs sm:text-sm animate-pulse">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>
              {isMasked
                ? 'Spatial Schematic Reconstructed Successfully ✓'
                : 'Puzzle Solved! You put our special photo back together! ❤️🌿'}
            </span>
          </div>
        )}

        {/* 3x3 Tile Grid */}
        <div className="w-72 h-72 sm:w-80 sm:h-80 grid grid-cols-3 gap-2 p-2 rounded-2xl bg-[#07040f] border border-white/10 shadow-inner">
          {board.map((val, idx) => {
            if (val === 0) {
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-dashed border-white/10 bg-transparent flex items-center justify-center text-[10px] text-slate-600 font-mono"
                >
                  Empty
                </div>
              );
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleTileClick(idx)}
                className={`relative rounded-xl border flex flex-col items-center justify-center font-black transition-all active:scale-95 shadow-md ${
                  isSolved
                    ? 'bg-gradient-to-br from-emerald-600/40 to-teal-600/40 border-emerald-400/50 text-emerald-200'
                    : 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
                }`}
              >
                {isMasked ? (
                  // Academic Schematic Symbol
                  <div className="text-center font-mono">
                    <span className="text-lg">{val}</span>
                    <span className="block text-[8px] text-slate-400 opacity-70">
                      λ_{val}
                    </span>
                  </div>
                ) : (
                  // Picture Slice Indicator
                  <div className="text-center">
                    <span className="text-xl">
                      {val === 1 ? '✨' : val === 2 ? '🌿' : val === 3 ? '❤️' : val === 4 ? '🌸' : val === 5 ? '☕' : val === 6 ? '💖' : val === 7 ? '🌅' : '🌟'}
                    </span>
                    <span className="block text-[9px] text-slate-300 font-mono mt-0.5">
                      Piece {val}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Puzzle Controls */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleShuffle}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Shuffle Puzzle</span>
          </button>
          <button
            onClick={handleAutoSolve}
            className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-semibold text-emerald-300 transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Auto Solve</span>
          </button>
        </div>
      </div>
    </div>
  );
};
