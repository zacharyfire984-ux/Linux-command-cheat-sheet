import React from 'react';
import { CheckCircle2, ArrowRight, Compass, ShieldCheck } from 'lucide-react';
import { FIRST_10_COMMANDS } from '../data/commands';

interface First10SectionProps {
  learnedIds: Set<string>;
  onSelectCommand: (id: string) => void;
}

export const First10Section: React.FC<First10SectionProps> = ({
  learnedIds,
  onSelectCommand,
}) => {
  const completedCount = FIRST_10_COMMANDS.filter((cmd) => learnedIds.has(cmd.id)).length;
  const progressPercent = Math.round((completedCount / FIRST_10_COMMANDS.length) * 100);

  return (
    <section aria-labelledby="start-here-heading" className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#111a2e] via-[#0d1527] to-[#0a0e1a] border border-cyan-500/30 space-y-6 shadow-[0_0_30px_rgba(0,212,255,0.05)]">
      {/* Header and Progress Meter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Compass className="w-5 h-5 text-cyan-400" />
            </span>
            <h2 id="start-here-heading" className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">
              Start Here: Your First 10 Commands
            </h2>
          </div>
          <p className="text-sm md:text-base text-slate-300">
            Absolute beginner? Master these 10 core commands in order to unlock complete comfort in any Linux terminal.
          </p>
        </div>

        {/* Progress Pill */}
        <div className="flex items-center gap-3 shrink-0 bg-[#0a0e1a] px-4 py-2.5 rounded-2xl border border-slate-800">
          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">Foundation Progress</div>
            <div className="text-sm font-bold text-cyan-300 font-mono">
              {completedCount} / 10 Mastered ({progressPercent}%)
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
            {completedCount === 10 ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            ) : (
              <span className="text-xs font-mono font-bold">{completedCount}</span>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar line */}
      <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 10 Command Sequential Steps Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {FIRST_10_COMMANDS.map((cmd, index) => {
          const isLearned = learnedIds.has(cmd.id);
          const stepNumber = index + 1;

          return (
            <button
              key={cmd.id}
              type="button"
              onClick={() => onSelectCommand(cmd.id)}
              className={`group relative flex flex-col p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                isLearned
                  ? 'bg-[#0f1d2e] border-emerald-500/50 hover:border-emerald-400'
                  : 'bg-[#0a0e1a] border-slate-800 hover:border-cyan-500/50 hover:bg-[#111a2e]'
              }`}
            >
              {/* Step number badge & status */}
              <div className="flex items-center justify-between gap-1 w-full mb-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  STEP {stepNumber}
                </span>

                {isLearned ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-700" />
                )}
              </div>

              {/* Command name in monospace */}
              <div className="font-mono text-lg font-bold text-cyan-300 group-hover:text-cyan-200">
                {cmd.name}
              </div>

              {/* One line simplified purpose */}
              <div className="text-xs text-slate-400 line-clamp-2 mt-1 leading-snug">
                {cmd.description}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 group-hover:text-cyan-400 transition">
                <span>Explore</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
