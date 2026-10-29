import React from 'react';
import {
  Filter,
  ArrowDownAZ,
  ArrowUpAZ,
  Layers,
  GraduationCap,
  Bookmark,
  CheckCircle2,
  Flame,
  RotateCcw,
} from 'lucide-react';
import { Category, Difficulty } from '../types/command';
import { CATEGORIES } from '../data/categories';
import { FilterView, SortOption } from '../utils/filterSearch';

interface FilterBarProps {
  selectedCategory: Category | 'All';
  selectedDifficulty: Difficulty | 'All';
  filterView: FilterView;
  sortOption: SortOption;
  totalFilteredCount: number;
  totalCount: number;
  favoritesCount: number;
  learnedCount: number;
  onSelectCategory: (cat: Category | 'All') => void;
  onSelectDifficulty: (diff: Difficulty | 'All') => void;
  onSelectFilterView: (view: FilterView) => void;
  onSelectSortOption: (sort: SortOption) => void;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedCategory,
  selectedDifficulty,
  filterView,
  sortOption,
  totalFilteredCount,
  totalCount,
  favoritesCount,
  learnedCount,
  onSelectCategory,
  onSelectDifficulty,
  onSelectFilterView,
  onSelectSortOption,
  onResetFilters,
}) => {
  const isFiltered =
    selectedCategory !== 'All' ||
    selectedDifficulty !== 'All' ||
    filterView !== 'all' ||
    sortOption !== 'a-z';

  return (
    <div className="space-y-4">
      {/* Top Filter Row: View modes (All, Favorites, Learned, Careful) + Difficulty + Sorting */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#111a2e] border border-slate-800">
        {/* Left: Quick View Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onSelectFilterView('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterView === 'all'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(0,212,255,0.3)]'
                : 'bg-[#0a0e1a] text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Commands ({totalCount})
          </button>

          <button
            type="button"
            onClick={() => onSelectFilterView('favorites')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterView === 'favorites'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-[#0a0e1a] text-slate-300 hover:text-amber-300 hover:bg-slate-800'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>Favorites ({favoritesCount})</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectFilterView('learned')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterView === 'learned'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-[#0a0e1a] text-slate-300 hover:text-emerald-300 hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-current" />
            <span>Learned ({learnedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectFilterView('careful')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterView === 'careful'
                ? 'bg-rose-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                : 'bg-[#0a0e1a] text-slate-300 hover:text-rose-300 hover:bg-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Destructive / Careful</span>
          </button>
        </div>

        {/* Right: Difficulty & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Difficulty Dropdown / Group */}
          <div className="inline-flex items-center p-1 rounded-xl bg-[#0a0e1a] border border-slate-800 text-xs">
            <span className="px-2 text-slate-400 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Level:</span>
            </span>
            {(['All', 'Beginner', 'Intermediate'] as const).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => onSelectDifficulty(diff)}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  selectedDifficulty === diff
                    ? 'bg-slate-700 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="inline-flex items-center px-2.5 py-1 rounded-xl bg-[#0a0e1a] border border-slate-800 text-xs text-slate-300 gap-1.5">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Sort:</span>
            <select
              aria-label="Sort commands by"
              value={sortOption}
              onChange={(e) => onSelectSortOption(e.target.value as SortOption)}
              className="bg-transparent text-cyan-300 font-mono text-xs focus:outline-none cursor-pointer pr-1"
            >
              <option value="a-z" className="bg-[#111a2e] text-slate-100">A to Z</option>
              <option value="z-a" className="bg-[#111a2e] text-slate-100">Z to A</option>
              <option value="category" className="bg-[#111a2e] text-slate-100">By Category</option>
              <option value="difficulty" className="bg-[#111a2e] text-slate-100">By Difficulty</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={onResetFilters}
              title="Reset all filters"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Row with Horizontal Scrolling */}
      <div className="relative">
        <div
          role="region"
          aria-label="Category Filter List"
          tabIndex={0}
          className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none focus-visible:ring-1 focus-visible:ring-cyan-400 focus-visible:rounded-xl"
        >
          {/* "All" button */}
          <button
            type="button"
            onClick={() => onSelectCategory('All')}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
              selectedCategory === 'All'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold shadow-[0_0_10px_rgba(0,212,255,0.2)]'
                : 'bg-[#111a2e] hover:bg-[#182542] border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Categories
          </button>

          {/* 17 Categories buttons */}
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => onSelectCategory(cat.name)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold shadow-[0_0_10px_rgba(0,212,255,0.2)]'
                    : 'bg-[#111a2e] hover:bg-[#182542] border-slate-800 text-slate-300 hover:text-slate-100'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Result Count Banner */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
        <div>
          Showing <span className="font-bold text-cyan-300">{totalFilteredCount}</span> of{' '}
          <span className="text-slate-200">{totalCount}</span> commands
          {selectedCategory !== 'All' && (
            <span className="text-slate-400"> in <strong className="text-cyan-400">{selectedCategory}</strong></span>
          )}
        </div>

        {totalFilteredCount === 0 && (
          <span className="text-amber-400">No matching commands</span>
        )}
      </div>
    </div>
  );
};
