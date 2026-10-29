import React from 'react';
import { Bookmark, CheckCircle2, Flame, ArrowRight, Shield } from 'lucide-react';
import { Command } from '../types/command';
import { splitHighlight } from '../utils/filterSearch';

interface CommandCardProps {
  command: Command;
  isFavorite: boolean;
  isLearned: boolean;
  searchQuery?: string;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onToggleLearned: (id: string, e: React.MouseEvent) => void;
}

export const CommandCard: React.FC<CommandCardProps> = ({
  command,
  isFavorite,
  isLearned,
  searchQuery = '',
  onSelect,
  onToggleFavorite,
  onToggleLearned,
}) => {
  const isDestructive = command.dangerLevel === 'careful' || command.dangerLevel === 'critical';

  const nameParts = splitHighlight(command.name, searchQuery);
  const descParts = splitHighlight(command.description, searchQuery);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(command.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(command.id);
        }
      }}
      className={`group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
        isLearned
          ? 'bg-[#0f172a]/95 border-emerald-500/40 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]'
          : isDestructive
          ? 'bg-[#111a2e] border-slate-800 hover:border-rose-500/50 hover:shadow-[0_0_20px_rgba(244,63,94,0.12)]'
          : 'bg-[#111a2e] border-slate-800 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(0,212,255,0.12)]'
      }`}
    >
      {/* Top row: Name, Category, Badges, Favorite & Learned buttons */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          {/* Command Name in large monospace */}
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-mono text-2xl font-bold tracking-tight text-cyan-300 group-hover:text-cyan-200 transition">
              {nameParts.map((part, i) =>
                part.isMatch ? (
                  <mark key={i} className="bg-cyan-500/30 text-cyan-100 rounded px-1 py-0.5">
                    {part.text}
                  </mark>
                ) : (
                  <span key={i}>{part.text}</span>
                )
              )}
            </h3>

            {/* Category tiny pill */}
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60">
              {command.category}
            </span>
          </div>

          {/* Quick action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Mark as learned toggle button */}
            <button
              type="button"
              aria-label={isLearned ? `Mark ${command.name} as unlearned` : `Mark ${command.name} as learned`}
              onClick={(e) => onToggleLearned(command.id, e)}
              className={`p-1.5 rounded-lg border transition cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                isLearned
                  ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-300'
                  : 'bg-[#0a0e1a]/80 border-slate-800 text-slate-500 hover:text-emerald-300 hover:border-emerald-500/40'
              }`}
              title={isLearned ? 'Learned' : 'Click to mark as learned'}
            >
              <CheckCircle2 className={`w-4 h-4 ${isLearned ? 'text-emerald-400' : ''}`} />
            </button>

            {/* Favorite toggle button */}
            <button
              type="button"
              aria-label={isFavorite ? `Remove ${command.name} from favorites` : `Star ${command.name} to favorites`}
              onClick={(e) => onToggleFavorite(command.id, e)}
              className={`p-1.5 rounded-lg border transition cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                isFavorite
                  ? 'bg-amber-950/80 border-amber-500/60 text-amber-300'
                  : 'bg-[#0a0e1a]/80 border-slate-800 text-slate-500 hover:text-amber-300 hover:border-amber-500/40'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Star to save'}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Plain-English one-line description */}
        <p className="text-sm md:text-base text-slate-300 leading-relaxed font-normal">
          {descParts.map((part, i) =>
            part.isMatch ? (
              <mark key={i} className="bg-cyan-500/30 text-cyan-100 rounded px-1 py-0.5 font-medium">
                {part.text}
              </mark>
            ) : (
              <span key={i}>{part.text}</span>
            )
          )}
        </p>

        {/* Syntax preview snippet */}
        <div className="py-1 px-2.5 rounded-md bg-[#0a0e1a] border border-slate-800/80 font-mono text-xs text-slate-400 truncate">
          <span className="text-cyan-500 mr-1.5">$</span>
          <code>{command.syntax}</code>
        </div>
      </div>

      {/* Footer row: Difficulty badge, Careful badge, and "View Details" hint */}
      <div className="flex items-center justify-between gap-2 pt-4 mt-3 border-t border-slate-800/60 text-xs">
        <div className="flex items-center gap-2">
          {/* Difficulty Badge */}
          <span
            className={`px-2 py-0.5 rounded-full font-medium border ${
              command.difficulty === 'Beginner'
                ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-950/60 border-amber-500/30 text-amber-300'
            }`}
          >
            {command.difficulty}
          </span>

          {/* Red Careful Badge for destructive commands */}
          {isDestructive && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold bg-rose-950/80 border border-rose-500/60 text-rose-300 uppercase tracking-wide">
              <Flame className="w-3 h-3 text-rose-400" />
              Careful
            </span>
          )}

          {command.cybersecurityNote && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-cyan-400/90 font-mono">
              <Shield className="w-3 h-3 text-cyan-400" />
              Sec
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-1 text-slate-400 group-hover:text-cyan-300 font-medium transition">
          <span>Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </div>
  );
};
