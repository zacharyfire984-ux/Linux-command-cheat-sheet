import React from 'react';
import { History, ArrowRight } from 'lucide-react';
import { ALL_COMMANDS } from '../data/commands';

interface RecentlyViewedBarProps {
  recentIds: string[];
  onSelectCommand: (id: string) => void;
}

export const RecentlyViewedBar: React.FC<RecentlyViewedBarProps> = ({
  recentIds,
  onSelectCommand,
}) => {
  if (recentIds.length === 0) return null;

  const recentCommands = recentIds
    .map((id) => ALL_COMMANDS.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => c !== undefined);

  if (recentCommands.length === 0) return null;

  return (
    <div className="p-3.5 rounded-2xl bg-[#111a2e]/70 border border-slate-800/80 flex flex-wrap items-center gap-3 text-xs">
      <div className="flex items-center gap-1.5 text-slate-400 font-medium shrink-0">
        <History className="w-4 h-4 text-cyan-400" />
        <span>Recently Viewed:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {recentCommands.slice(0, 8).map((cmd) => (
          <button
            key={cmd.id}
            type="button"
            onClick={() => onSelectCommand(cmd.id)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0a0e1a] hover:bg-[#182542] text-cyan-300 hover:text-cyan-200 border border-slate-800 font-mono text-xs transition cursor-pointer"
          >
            <span>{cmd.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
