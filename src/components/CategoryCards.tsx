import React from 'react';
import {
  Compass,
  Folder,
  FileText,
  Shield,
  Cpu,
  Globe,
  Search,
  Info,
  Users,
  HardDrive,
  AlignLeft,
  Archive,
  Terminal,
  Package,
  Sparkles,
  Zap,
  Lock,
  Layers,
} from 'lucide-react';
import { Category } from '../types/command';
import { CATEGORIES } from '../data/categories';
import { CategoryStats } from '../utils/storage';

interface CategoryCardsProps {
  statsMap: Map<Category, CategoryStats>;
  selectedCategory: Category | 'All';
  onSelectCategory: (category: Category | 'All') => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Compass,
  Folder,
  FileText,
  Shield,
  Cpu,
  Globe,
  Search,
  Info,
  Users,
  HardDrive,
  AlignLeft,
  Archive,
  Terminal,
  Package,
  Sparkles,
  Zap,
  Lock,
};

export const CategoryCards: React.FC<CategoryCardsProps> = ({
  statsMap,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <section aria-labelledby="categories-heading" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <h2 id="categories-heading" className="text-xl font-bold text-slate-100">
            Command Categories
          </h2>
        </div>

        {selectedCategory !== 'All' && (
          <button
            type="button"
            onClick={() => onSelectCategory('All')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
          >
            Show All Categories
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {CATEGORIES.map((cat) => {
          const stats = statsMap.get(cat.name) || { total: 0, learnedCount: 0, percentage: 0 };
          const isSelected = selectedCategory === cat.name;
          const IconComponent = ICON_MAP[cat.iconName] || Terminal;

          return (
            <button
              key={cat.name}
              type="button"
              onClick={() => onSelectCategory(isSelected ? 'All' : cat.name)}
              className={`group flex flex-col justify-between p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                isSelected
                  ? 'bg-[#182542] border-cyan-400 shadow-[0_0_20px_rgba(0,212,255,0.2)] ring-1 ring-cyan-400'
                  : 'bg-[#111a2e] border-slate-800 hover:border-slate-700 hover:bg-[#131f37]'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div
                    className="p-2 rounded-xl"
                    style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-[#0a0e1a] text-slate-400 border border-slate-800">
                    {stats.total} commands
                  </span>
                </div>

                <div>
                  <h3 className={`font-semibold text-base transition ${isSelected ? 'text-cyan-300' : 'text-slate-100 group-hover:text-cyan-300'}`}>
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Learned</span>
                  <span className="text-cyan-300 font-semibold">
                    {stats.learnedCount}/{stats.total} ({stats.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
