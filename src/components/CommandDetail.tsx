import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  Sparkles,
  Terminal,
  ShieldAlert,
  Flame,
  Info,
  ExternalLink,
  BookOpen,
  Mic,
  Edit3,
  Cloud,
  Save,
} from 'lucide-react';
import { Command } from '../types/command';
import { CopyButton } from './CopyButton';

interface CommandDetailProps {
  command: Command;
  allCommands: Command[];
  isFavorite: boolean;
  isLearned: boolean;
  onToggleFavorite: (id: string) => void;
  onToggleLearned: (id: string) => void;
  onSelectCommand: (id: string) => void;
  onBack: () => void;
  onOpenVoiceMentor?: (commandName: string) => void;
  userNote?: string;
  onSaveNote?: (commandId: string, note: string) => void;
  isCloudSynced?: boolean;
}

export const CommandDetail: React.FC<CommandDetailProps> = ({
  command,
  allCommands,
  isFavorite,
  isLearned,
  onToggleFavorite,
  onToggleLearned,
  onSelectCommand,
  onBack,
  onOpenVoiceMentor,
  userNote = '',
  onSaveNote,
  isCloudSynced = false,
}) => {
  const [noteText, setNoteText] = useState(userNote);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setNoteText(userNote);
  }, [userNote, command.id]);
  // Find current index to provide Previous & Next navigation
  const currentIndex = allCommands.findIndex((c) => c.id === command.id);
  const prevCommand = currentIndex > 0 ? allCommands[currentIndex - 1] : null;
  const nextCommand = currentIndex < allCommands.length - 1 ? allCommands[currentIndex + 1] : null;

  // Scroll to top when command changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [command.id]);

  const isDestructive = command.dangerLevel === 'careful' || command.dangerLevel === 'critical';

  return (
    <article className="max-w-4xl mx-auto px-4 py-6 md:py-10 space-y-8 animate-in fade-in duration-200">
      {/* Top Navigation Bar: Back button, Category Breadcrumb, Prev/Next buttons */}
      <nav aria-label="Command navigation" className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111a2e] hover:bg-[#182542] text-slate-200 hover:text-cyan-300 border border-slate-700/80 hover:border-cyan-500/40 text-sm font-medium transition cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cheat Sheet</span>
        </button>

        <div className="flex items-center gap-2">
          {prevCommand && (
            <button
              type="button"
              onClick={() => onSelectCommand(prevCommand.id)}
              title={`Previous: ${prevCommand.name}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111a2e] hover:bg-[#182542] text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-slate-700 text-xs font-mono transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{prevCommand.name}</span>
            </button>
          )}

          {nextCommand && (
            <button
              type="button"
              onClick={() => onSelectCommand(nextCommand.id)}
              title={`Next: ${nextCommand.name}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111a2e] hover:bg-[#182542] text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-slate-700 text-xs font-mono transition cursor-pointer"
            >
              <span>{nextCommand.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </nav>

      {/* Header Banner: Command Name, Badges, Favorite & Learned actions */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl md:text-5xl font-mono font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-200">
                {command.name}
              </h1>

              {/* Category pill */}
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800/80 text-cyan-300 border border-cyan-500/30">
                {command.category}
              </span>

              {/* Difficulty pill */}
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  command.difficulty === 'Beginner'
                    ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                    : 'bg-amber-950/70 border-amber-500/40 text-amber-300'
                }`}
              >
                {command.difficulty}
              </span>

              {/* Destructive Careful badge */}
              {isDestructive && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-950/90 border border-rose-500/70 text-rose-300 uppercase tracking-wider animate-pulse">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  Careful
                </span>
              )}
            </div>

            <p className="text-xl text-slate-300 font-normal leading-relaxed">
              {command.description}
            </p>
          </div>

          {/* Action buttons: Ask Mentor, Bookmark, & Mark as Learned */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {onOpenVoiceMentor && (
              <button
                type="button"
                onClick={() => onOpenVoiceMentor(command.name)}
                title={`Ask AI Voice Mentor about ${command.name}`}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-cyan-500/50 bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 font-medium text-xs sm:text-sm transition cursor-pointer shadow-[0_0_12px_rgba(0,212,255,0.2)] active:scale-95"
              >
                <Mic className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="hidden sm:inline">Ask Mentor</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onToggleFavorite(command.id)}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className={`p-2.5 rounded-lg border transition cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                isFavorite
                  ? 'bg-amber-950/70 border-amber-500/70 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'bg-[#111a2e] hover:bg-[#182542] border-slate-700/80 text-slate-400 hover:text-amber-300'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => onToggleLearned(command.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium text-sm transition cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                isLearned
                  ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-[#111a2e] hover:bg-[#182542] border-slate-700 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-300'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${isLearned ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{isLearned ? 'Marked as Learned ✓' : 'Mark as Learned'}</span>
            </button>
          </div>
        </div>

        {/* Mandatory Destructive Warning Box */}
        {isDestructive && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/60 text-rose-200 space-y-1.5 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
            <div className="flex items-center gap-2 font-semibold text-rose-300">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <span>High Risk / Destructive Operation</span>
            </div>
            <p className="text-sm text-rose-200/90 leading-relaxed pl-7">
              This command can permanently delete data, alter system security boundaries, or terminate processes.
              Always check your syntax, current directory (<code className="font-mono text-rose-200 bg-rose-900/60 px-1 py-0.5 rounded">pwd</code>), and arguments before pressing Enter.
            </p>
          </div>
        )}

        {/* Cybersecurity Context Banner (if present) */}
        {command.cybersecurityNote && (
          <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-cyan-200 text-sm flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-cyan-300 uppercase tracking-wider text-xs mr-1">Cybersecurity Note:</span>
              <span className="text-slate-200">{command.cybersecurityNote}</span>
            </div>
          </div>
        )}
      </header>

      {/* SECTION 1: What it does (Plain English) */}
      <section className="p-6 rounded-2xl bg-[#111a2e] border border-slate-800 space-y-3">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Info className="w-5 h-5 text-cyan-400" />
          <span>1. What It Does</span>
        </h2>
        <p className="text-base text-slate-200 leading-relaxed">
          {command.description} Every parameter is explained step-by-step so you understand what is happening beneath the shell prompt.
        </p>
      </section>

      {/* SECTION 2: Exact Syntax */}
      <section className="p-6 rounded-2xl bg-[#111a2e] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <span>2. Exact Syntax</span>
          </h2>
          <CopyButton text={command.syntax} />
        </div>
        <div className="p-4 rounded-xl bg-[#0a0e1a] border border-slate-800 font-mono text-cyan-300 text-base overflow-x-auto shadow-inner">
          <code>{command.syntax}</code>
        </div>
        <p className="text-xs text-slate-400">
          Items inside square brackets <code className="text-slate-300 font-mono">[options]</code> are optional; items in angle brackets <code className="text-slate-300 font-mono">&lt;target&gt;</code> are required.
        </p>
      </section>

      {/* SECTION 3: Most Useful Flags Table */}
      <section className="p-6 rounded-2xl bg-[#111a2e] border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <span>3. Most Useful Flags</span>
        </h2>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0a0e1a] text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="py-3 px-4">Flag</th>
                <th className="py-3 px-4">What It Changes</th>
                <th className="py-3 px-4">Example Use</th>
                <th className="py-3 px-4 text-right">Copy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-[#111a2e]/60 font-sans">
              {command.flags.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-cyan-300 whitespace-nowrap">
                    {item.flag}
                  </td>
                  <td className="py-3 px-4 text-slate-200">
                    {item.changes}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-300 bg-[#0a0e1a]/40">
                    {item.example}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <CopyButton text={item.example} label="Copy" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 4: Real-world Examples */}
      <section className="p-6 rounded-2xl bg-[#111a2e] border border-slate-800 space-y-5">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <span>4. Real Examples</span>
        </h2>

        <div className="space-y-4">
          {command.examples.map((ex, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#0a0e1a] border border-slate-800/90 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
                  Example {idx + 1}
                </span>
                <CopyButton text={ex.command} />
              </div>

              {/* Command line */}
              <div className="flex items-center gap-2 font-mono text-sm text-cyan-200 bg-[#111a2e]/90 p-2.5 rounded-lg border border-slate-800">
                <span className="text-cyan-500 font-bold select-none">$</span>
                <code className="text-slate-100 font-semibold">{ex.command}</code>
              </div>

              {/* Sample output */}
              <div className="p-3 rounded-lg bg-[#070a13] border border-slate-900 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                <span className="text-slate-500 text-[10px] block select-none uppercase tracking-wider mb-1">
                  Sample Output:
                </span>
                {ex.output}
              </div>

              {/* One line explanation */}
              <p className="text-xs text-slate-300 italic pt-1">
                <strong className="text-slate-200 not-italic">Explanation:</strong> {ex.explanation}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: Common Mistakes */}
      <section className="p-6 rounded-2xl bg-[#111a2e] border border-slate-800 space-y-3">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <span>5. Common Mistakes Beginners Make</span>
        </h2>
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-slate-200 leading-relaxed text-base">
          {command.commonMistakes}
        </div>
      </section>

      {/* SECTION 6: When NOT to Use */}
      <section className="p-6 rounded-2xl bg-[#111a2e] border border-slate-800 space-y-3">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <span>6. When NOT to Use This Command</span>
        </h2>
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 text-slate-200 leading-relaxed text-base">
          {command.whenNotToUse}
        </div>
      </section>

      {/* SECTION 7: Practical Tip */}
      <section className="p-6 rounded-2xl bg-[#111a2e] border border-slate-800 space-y-3">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span>7. Practical Pro Tip</span>
        </h2>
        <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-cyan-100 leading-relaxed text-base">
          {command.tip}
        </div>
      </section>

      {/* SECTION 8: Try it yourself */}
      <section className="p-6 rounded-2xl bg-[#111a2e] border border-cyan-500/30 space-y-3 shadow-[0_0_20px_rgba(0,212,255,0.06)]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <span>8. Try It Yourself (Safe Terminal Exercise)</span>
          </h2>
          <CopyButton text={command.practiceTask} label="Copy task" />
        </div>
        <div className="p-4 rounded-xl bg-[#0a0e1a] border border-slate-800 text-slate-200 font-mono text-sm leading-relaxed space-y-2">
          <p className="text-emerald-300 font-sans text-xs uppercase tracking-wider font-semibold">
            Hands-on Exercise:
          </p>
          <p className="text-slate-100">{command.practiceTask}</p>
        </div>
        <p className="text-xs text-slate-400">
          Open any Linux terminal (or WSL) and type this safely. This task will not harm your system.
        </p>
      </section>

      {/* SECTION 9: Related Commands */}
      <section className="p-6 rounded-2xl bg-[#111a2e] border border-slate-800 space-y-3">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <ExternalLink className="w-5 h-5 text-cyan-400" />
          <span>9. Related Commands</span>
        </h2>
        <div className="flex flex-wrap gap-2.5">
          {command.relatedCommands.map((relId, idx) => {
            const relCmd = allCommands.find((c) => c.id.toLowerCase() === relId.toLowerCase() || c.name.toLowerCase() === relId.toLowerCase());
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectCommand(relCmd ? relCmd.id : relId)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0a0e1a] hover:bg-[#182542] text-cyan-300 hover:text-cyan-200 border border-slate-800 hover:border-cyan-500/50 text-sm font-mono transition cursor-pointer"
              >
                <span>{relId}</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            );
          })}
        </div>
      </section>

      {/* SECTION 10: Personal Study Notes & Lab Log */}
      <section className="p-6 rounded-2xl bg-[#111a2e] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-cyan-400" />
            <span>10. Your Study Notes & Lab Log</span>
          </h2>
          {isCloudSynced ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
              <Cloud className="w-3.5 h-3.5" /> Firestore Synced
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400">
              Saved in browser
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400">
          Save your personal cheat notes, lab observations, or target test scenarios for {command.name}.
        </p>
        <textarea
          value={noteText}
          onChange={(e) => {
            setNoteText(e.target.value);
            setIsSaved(false);
          }}
          placeholder={`e.g. During my privilege escalation lab, ${command.name} revealed interesting files...`}
          rows={3}
          maxLength={4000}
          className="w-full p-3 rounded-xl bg-[#0a0e1a] border border-slate-800 text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-sans"
        />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            {noteText.length}/4000 characters
          </span>
          <button
            type="button"
            onClick={() => {
              onSaveNote?.(command.id, noteText);
              setIsSaved(true);
              setTimeout(() => setIsSaved(false), 2000);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaved ? 'Saved!' : 'Save Note'}</span>
          </button>
        </div>
      </section>

      {/* Bottom Sticky Action Footer for easy mobile marking */}
      <footer className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-300 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all commands</span>
        </button>

        <button
          type="button"
          onClick={() => onToggleLearned(command.id)}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl border font-bold text-sm transition cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            isLearned
              ? 'bg-emerald-950 border-emerald-500 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-400 font-extrabold shadow-[0_0_20px_rgba(0,212,255,0.3)]'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>{isLearned ? 'Command Learned! (Click to Unmark)' : 'Mark as Learned ✓'}</span>
        </button>
      </footer>
    </article>
  );
};
