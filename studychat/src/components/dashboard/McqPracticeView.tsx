import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, RotateCcw, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface McqQuestionItem {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category: string;
}

const SAMPLE_MCQS: McqQuestionItem[] = [
  {
    id: 1,
    question: 'What is the average case time complexity of searching in a Hash Table with collision resolution via Chaining?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
    correct: 0,
    explanation: 'Under the assumption of simple uniform hashing, the load factor alpha = n/m is bounded, ensuring O(1) average lookup time.',
    category: 'Data Structures'
  },
  {
    id: 2,
    question: 'Which of the following sorting algorithms is NOT in-place?',
    options: ['Heap Sort', 'Merge Sort', 'Quick Sort', 'Insertion Sort'],
    correct: 1,
    explanation: 'Standard Merge Sort requires O(n) auxiliary array space to merge the two sorted halves, making it not in-place.',
    category: 'Algorithms'
  },
  {
    id: 3,
    question: 'In TCP congestion control, what triggers the Fast Retransmit mechanism?',
    options: ['Timeout of the RTO timer', 'Arrival of 3 duplicate ACKs', 'Window size reaching zero', 'FIN packet arrival'],
    correct: 1,
    explanation: 'Receipt of 3 duplicate ACKs indicates to the sender that a single packet was lost while subsequent packets arrived, triggering immediate retransmission.',
    category: 'Computer Networks'
  }
];

export const McqPracticeView: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentQ = SAMPLE_MCQS[currentIdx];

  const handleSelect = (optIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIdx]: optIdx }));
  };

  const handleNext = () => {
    if (currentIdx < SAMPLE_MCQS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setIsSubmitted(true);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }
  };

  const score = SAMPLE_MCQS.reduce((acc, q, idx) => {
    return selectedAnswers[idx] === q.correct ? acc + 1 : acc;
  }, 0);

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0875E1] to-[#07549A] text-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-2">
        <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">
          Daily Quiz
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif">MCQ Practice Portal</h1>
        <p className="text-xs sm:text-sm text-blue-100">
          Solve topic-wise multiple choice questions with instant explanations and accuracy tracking.
        </p>
      </div>

      {!isSubmitted ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-xs space-y-5">
          <div className="flex items-center justify-between text-xs text-slate-500 border-b pb-3">
            <span className="font-bold text-[#0875E1] uppercase tracking-wider">{currentQ.category}</span>
            <span className="font-mono">Question {currentIdx + 1} of {SAMPLE_MCQS.length}</span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-[#172B4D] leading-snug">
            {currentQ.question}
          </h3>

          <div className="space-y-2.5">
            {currentQ.options.map((opt, i) => {
              const isSelected = selectedAnswers[currentIdx] === i;
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  className={`w-full p-3.5 rounded-2xl border text-xs sm:text-sm text-left font-medium transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-200'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>
                    <strong className="font-mono mr-2">{String.fromCharCode(65 + i)}.</strong>
                    {opt}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
            >
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={selectedAnswers[currentIdx] === undefined}
              className="px-6 py-2.5 rounded-xl bg-[#0875E1] hover:bg-[#07549A] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-40"
            >
              <span>{currentIdx === SAMPLE_MCQS.length - 1 ? 'Finish Quiz' : 'Next Question'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 border border-[#E2E8F0] text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-[#172B4D]">Quiz Completed!</h2>
          <div className="text-3xl font-mono font-black text-emerald-600">
            Score: {score} / {SAMPLE_MCQS.length} ({Math.round((score / SAMPLE_MCQS.length) * 100)}%)
          </div>
          <p className="text-xs text-slate-500">
            Your results have been automatically recorded into your MCQ Performance Analytics.
          </p>
          <button
            onClick={() => {
              setSelectedAnswers({});
              setCurrentIdx(0);
              setIsSubmitted(false);
            }}
            className="px-6 py-2.5 rounded-xl bg-[#0875E1] text-white text-xs font-bold cursor-pointer"
          >
            Retake Quiz
          </button>
        </div>
      )}
    </div>
  );
};
