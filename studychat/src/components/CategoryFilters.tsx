import React from 'react';

export type CategoryFilter = 'all' | 'core' | 'cs' | 'ai' | 'exam';

interface CategoryFiltersProps {
  activeCategory: CategoryFilter;
  onSelectCategory: (category: CategoryFilter) => void;
  categoryCounts: Record<CategoryFilter, number>;
}

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  activeCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  const tabs: { id: CategoryFilter; label: string; icon: string }[] = [
    { id: 'all', label: 'All Textbooks', icon: '📚' },
    { id: 'core', label: 'Core Engineering', icon: '⚙️' },
    { id: 'cs', label: 'CS & Software', icon: '💻' },
    { id: 'ai', label: 'AI & Data Science', icon: '🤖' },
    { id: 'exam', label: 'GATE & ESE Prep', icon: '🎯' },
  ];

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap max-w-5xl mx-auto px-4 mb-10">
      {tabs.map((tab) => {
        const isActive = activeCategory === tab.id;
        const count = categoryCounts[tab.id] ?? 0;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectCategory(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border cursor-pointer select-none ${
              isActive
                ? 'bg-violet-600/25 border-violet-500 text-white shadow-lg shadow-violet-500/20'
                : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.08] hover:border-white/20'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                isActive
                  ? 'bg-violet-500 text-white'
                  : 'bg-white/10 text-slate-400'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
