import React, { useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import {
  Terminal,
  Search,
  X,
  Bookmark,
  CheckCircle2,
  Shield,
  Sparkles,
  Mic,
  Database,
  Cloud,
} from 'lucide-react';
import { OverallStats } from '../utils/storage';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  stats: OverallStats;
  onGoHome: () => void;
  onViewFavorites: () => void;
  onViewLearned: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenVoiceMentor: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  stats,
  onGoHome,
  onViewFavorites,
  onViewLearned,
  currentUser,
  onOpenAuth,
  onOpenVoiceMentor,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Pressing "/" key focuses the search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0a0e1a]/90 border-b border-slate-800/90 shadow-md transition-all">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        {/* Logo & Title - clicking this returns to the home screen */}
        <button
          type="button"
          onClick={onGoHome}
          title="Go to Home Screen"
          aria-label="Linux Cheat Sheet - Return to home screen"
          className="flex items-center gap-3 cursor-pointer select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-xl text-left bg-transparent border-0 p-1 -m-1 transition-transform active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_15px_rgba(0,212,255,0.3)] group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(0,212,255,0.5)] transition-all shrink-0">
            <Terminal className="w-6 h-6 text-slate-950" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg text-slate-100 group-hover:text-cyan-300 transition tracking-tight">
                Linux<span className="text-cyan-400">Cheat</span>Sheet
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 group-hover:border-cyan-400 transition-colors">
                <Shield className="w-2.5 h-2.5" /> CyberSec
              </span>
            </div>
            <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors hidden sm:block">
              193 beginner-to-advanced commands for Linux & security
            </p>
          </div>
        </button>

        {/* Search Bar - ALWAYS VISIBLE with / keyboard shortcut */}
        <div className="relative flex-1 max-w-xl">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-cyan-400/80 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by command (find), action (find files), or category... Press / to focus"
              aria-label="Search Linux commands by name, description, or category"
              className="w-full pl-10 pr-16 py-2 rounded-xl bg-[#111a2e] border border-slate-700/80 text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition shadow-inner font-sans"
            />

            {/* Clear button or Keyboard Shortcut hint */}
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search query"
                className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center absolute right-3 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-400 select-none">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Right Controls: Voice Mentor, Favorites, Progress, & Cloud Auth */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-2.5 shrink-0">
          {/* Live Voice Mentor Button */}
          <button
            type="button"
            onClick={onOpenVoiceMentor}
            title="Talk with AI Linux Voice Mentor (gemini-3.8-live)"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-500/50 hover:border-cyan-400 text-xs font-semibold text-cyan-300 transition shadow-[0_0_12px_rgba(0,212,255,0.2)] cursor-pointer active:scale-95"
          >
            <Mic className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden lg:inline">Voice Mentor</span>
          </button>

          {/* Favorites Button */}
          <button
            type="button"
            onClick={onViewFavorites}
            title="View starred favorites"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#111a2e] hover:bg-[#182542] border border-slate-800 hover:border-amber-500/50 text-xs font-semibold text-slate-300 hover:text-amber-300 transition cursor-pointer"
          >
            <Bookmark className={`w-3.5 h-3.5 ${stats.favoritesCount > 0 ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>{stats.favoritesCount}</span>
          </button>

          {/* Progress Ring / Mastered Badge */}
          <button
            type="button"
            onClick={onViewLearned}
            title="View learned commands"
            className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#111a2e] hover:bg-[#182542] border border-slate-800 hover:border-emerald-500/50 transition cursor-pointer"
          >
            {/* Circular mini progress indicator */}
            <div className="relative w-5 h-5 flex items-center justify-center">
              <svg className="w-5 h-5 transform -rotate-90">
                <circle
                  cx="10"
                  cy="10"
                  r="7.5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="10"
                  cy="10"
                  r="7.5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-emerald-400 transition-all duration-300"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 7.5}
                  strokeDashoffset={2 * Math.PI * 7.5 * (1 - stats.percentage / 100)}
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="text-left font-mono text-xs hidden sm:block">
              <div className="text-[9px] text-slate-400 uppercase tracking-wider leading-none">Learned</div>
              <div className="font-bold text-emerald-300 leading-tight text-[11px]">
                {stats.learnedCount}/{stats.total} <span className="text-[9px] font-normal text-slate-400">({stats.percentage}%)</span>
              </div>
            </div>
          </button>

          {/* Cloud Auth / User Profile */}
          <button
            type="button"
            onClick={onOpenAuth}
            title={currentUser ? `Signed in as ${currentUser.displayName || currentUser.email}` : 'Sign in to sync with Firebase Firestore'}
            className="inline-flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#111a2e] hover:bg-[#182542] border border-slate-800 hover:border-cyan-500/50 text-xs text-slate-300 transition cursor-pointer"
          >
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Avatar"
                className="w-5 h-5 rounded-full border border-cyan-400"
              />
            ) : currentUser ? (
              <div className="w-5 h-5 rounded-full bg-cyan-600 flex items-center justify-center font-bold text-slate-950 text-[10px]">
                {currentUser.displayName?.charAt(0) || 'U'}
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                <Database className="w-3 h-3 text-cyan-400" />
              </div>
            )}
            <span className="hidden md:inline font-mono text-[11px]">
              {currentUser ? 'Cloud Synced' : 'Sign In'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
