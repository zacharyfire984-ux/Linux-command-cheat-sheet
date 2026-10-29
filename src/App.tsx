import React, { useState, useEffect, useMemo } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { ALL_COMMANDS, COMMANDS_BY_ID } from './data/commands';
import { Category, Difficulty } from './types/command';
import {
  filterAndSortCommands,
  FilterView,
  SortOption,
} from './utils/filterSearch';
import {
  loadFavorites,
  saveFavorites,
  loadLearned,
  saveLearned,
  loadRecentlyViewed,
  addRecentlyViewed,
  loadNotes,
  saveNotes,
  calculateCategoryStats,
  calculateOverallStats,
} from './utils/storage';
import {
  auth,
  syncUserDataFromCloud,
  cloudToggleLearned,
  cloudToggleFavorite,
  cloudSaveNote,
} from './firebase';
import { Navbar } from './components/Navbar';
import { First10Section } from './components/First10Section';
import { CategoryCards } from './components/CategoryCards';
import { FilterBar } from './components/FilterBar';
import { CommandCard } from './components/CommandCard';
import { CommandDetail } from './components/CommandDetail';
import { RecentlyViewedBar } from './components/RecentlyViewedBar';
import { StudyBeatsWidget } from './components/StudyBeatsWidget';
import { VoiceMentorModal } from './components/VoiceMentorModal';
import { AuthModal } from './components/AuthModal';
import { SearchX, Terminal, Shield, ArrowUp, Mic, Headphones } from 'lucide-react';

export default function App() {
  // User Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Live Voice Mentor state
  const [isVoiceMentorOpen, setIsVoiceMentorOpen] = useState(false);
  const [voiceMentorTarget, setVoiceMentorTarget] = useState<string | undefined>(undefined);

  // Navigation & Active View state
  const [selectedCommandId, setSelectedCommandId] = useState<string | null>(null);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'All'>('All');
  const [filterView, setFilterView] = useState<FilterView>('all');
  const [sortOption, setSortOption] = useState<SortOption>('a-z');

  // Persistence sets
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => loadFavorites());
  const [learnedIds, setLearnedIds] = useState<Set<string>>(() => loadLearned());
  const [recentIds, setRecentIds] = useState<string[]>(() => loadRecentlyViewed());
  const [notes, setNotes] = useState<Record<string, string>>(() => loadNotes());

  // Show "Scroll to top" floating button
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Listen to Firebase Auth state changes and sync with Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // User logged in: sync cloud data
        const cloudData = await syncUserDataFromCloud(user.uid);

        // Merge guest items into cloud so no progress is lost
        setLearnedIds((prev) => {
          const merged = new Set([...prev, ...cloudData.learned]);
          saveLearned(merged);
          // Sync any local-only items to cloud
          prev.forEach((id) => {
            if (!cloudData.learned.has(id)) {
              cloudToggleLearned(user.uid, id, true);
            }
          });
          return merged;
        });

        setFavoriteIds((prev) => {
          const merged = new Set([...prev, ...cloudData.favorites]);
          saveFavorites(merged);
          prev.forEach((id) => {
            if (!cloudData.favorites.has(id)) {
              cloudToggleFavorite(user.uid, id, true);
            }
          });
          return merged;
        });

        setNotes((prev) => {
          const merged = { ...prev, ...cloudData.notes };
          saveNotes(merged);
          Object.entries(prev).forEach(([cmdId, noteText]) => {
            if (!cloudData.notes[cmdId] && noteText) {
              cloudSaveNote(user.uid, cmdId, noteText);
            }
          });
          return merged;
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync hash routing for shareable URLs (e.g. #grep opens grep directly)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '').toLowerCase().trim();
      if (hash && COMMANDS_BY_ID.has(hash)) {
        setSelectedCommandId(hash);
        setRecentIds(addRecentlyViewed(hash));
      } else if (!hash) {
        setSelectedCommandId(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Monitor scroll for back-to-top button
  useEffect(() => {
    const checkScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  // Handlers for Favorites & Learned
  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      const isFav = !next.has(id);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      saveFavorites(next);
      if (currentUser) {
        cloudToggleFavorite(currentUser.uid, id, isFav);
      }
      return next;
    });
  };

  const toggleLearned = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLearnedIds((prev) => {
      const next = new Set(prev);
      const isLrn = !next.has(id);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      saveLearned(next);
      if (currentUser) {
        cloudToggleLearned(currentUser.uid, id, isLrn);
      }
      return next;
    });
  };

  const handleSaveNote = (commandId: string, noteText: string) => {
    setNotes((prev) => {
      const next = { ...prev, [commandId]: noteText };
      saveNotes(next);
      return next;
    });
    if (currentUser) {
      cloudSaveNote(currentUser.uid, commandId, noteText);
    }
  };

  const handleSelectCommand = (id: string) => {
    const cleanId = id.toLowerCase();
    setSelectedCommandId(cleanId);
    window.location.hash = cleanId;
    setRecentIds(addRecentlyViewed(cleanId));
  };

  // Return to pristine home screen (clearing search, category, difficulty, view filters, and command detail)
  const handleGoHome = () => {
    setSelectedCommandId(null);
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    setFilterView('all');
    setSortOption('a-z');
    if (window.location.hash) {
      try {
        history.pushState('', document.title, window.location.pathname + window.location.search);
      } catch {
        window.location.hash = '';
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setSelectedCommandId(null);
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    setFilterView('all');
    setSortOption('a-z');
  };

  // Filtered and sorted commands list
  const filteredCommands = useMemo(() => {
    return filterAndSortCommands(ALL_COMMANDS, {
      query: searchQuery,
      category: selectedCategory,
      difficulty: selectedDifficulty,
      filterView,
      sortOption,
      favoriteIds,
      learnedIds,
    });
  }, [
    searchQuery,
    selectedCategory,
    selectedDifficulty,
    filterView,
    sortOption,
    favoriteIds,
    learnedIds,
  ]);

  // Overall Statistics & Category Breakdown
  const overallStats = useMemo(() => {
    return calculateOverallStats(ALL_COMMANDS, learnedIds, favoriteIds);
  }, [learnedIds, favoriteIds]);

  const categoryStatsMap = useMemo(() => {
    return calculateCategoryStats(ALL_COMMANDS, learnedIds);
  }, [learnedIds]);

  // Find active command object if detail view is open
  const activeCommand = selectedCommandId ? COMMANDS_BY_ID.get(selectedCommandId) || null : null;

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Sticky Universal Header with Search & Progress */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (selectedCommandId) {
            setSelectedCommandId(null);
            window.location.hash = '';
          }
        }}
        stats={overallStats}
        onGoHome={handleGoHome}
        onViewFavorites={() => {
          handleBackToHome();
          setFilterView('favorites');
        }}
        onViewLearned={() => {
          handleBackToHome();
          setFilterView('learned');
        }}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenVoiceMentor={() => {
          setVoiceMentorTarget(undefined);
          setIsVoiceMentorOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 md:py-8 space-y-10">
        {activeCommand ? (
          /* Command Detail Page View */
          <CommandDetail
            command={activeCommand}
            allCommands={ALL_COMMANDS}
            isFavorite={favoriteIds.has(activeCommand.id)}
            isLearned={learnedIds.has(activeCommand.id)}
            onToggleFavorite={(id) => toggleFavorite(id)}
            onToggleLearned={(id) => toggleLearned(id)}
            onSelectCommand={handleSelectCommand}
            onBack={handleBackToHome}
            onOpenVoiceMentor={(name) => {
              setVoiceMentorTarget(name);
              setIsVoiceMentorOpen(true);
            }}
            userNote={notes[activeCommand.id] || ''}
            onSaveNote={handleSaveNote}
            isCloudSynced={!!currentUser}
          />
        ) : (
          /* Home View: Guided Path, Categories, Filter Bar, and Command Cards Grid */
          <>
            {/* Hero / Intro only when not deep searching */}
            {!searchQuery && selectedCategory === 'All' && filterView === 'all' && (
              <div className="space-y-8">
                {/* 1. "Start Here: Your First 10 Commands" Guided Path */}
                <First10Section
                  learnedIds={learnedIds}
                  onSelectCommand={handleSelectCommand}
                />

                {/* 2. Category Cards with counts & progress bars */}
                <CategoryCards
                  statsMap={categoryStatsMap}
                  selectedCategory={selectedCategory}
                  onSelectCategory={(cat) => setSelectedCategory(cat)}
                />
              </div>
            )}

            {/* Recently Viewed Bar */}
            <RecentlyViewedBar
              recentIds={recentIds}
              onSelectCommand={handleSelectCommand}
            />

            {/* Filter and Navigation Toolbar */}
            <FilterBar
              selectedCategory={selectedCategory}
              selectedDifficulty={selectedDifficulty}
              filterView={filterView}
              sortOption={sortOption}
              totalFilteredCount={filteredCommands.length}
              totalCount={ALL_COMMANDS.length}
              favoritesCount={overallStats.favoritesCount}
              learnedCount={overallStats.learnedCount}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              onSelectDifficulty={(diff) => setSelectedDifficulty(diff)}
              onSelectFilterView={(view) => setFilterView(view)}
              onSelectSortOption={(sort) => setSortOption(sort)}
              onResetFilters={handleResetFilters}
            />

            {/* Command Cards Grid or Friendly Empty State */}
            {filteredCommands.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCommands.map((command) => (
                  <CommandCard
                    key={command.id}
                    command={command}
                    isFavorite={favoriteIds.has(command.id)}
                    isLearned={learnedIds.has(command.id)}
                    searchQuery={searchQuery}
                    onSelect={handleSelectCommand}
                    onToggleFavorite={toggleFavorite}
                    onToggleLearned={toggleLearned}
                  />
                ))}
              </div>
            ) : (
              /* Friendly Empty State */
              <div className="text-center py-16 px-4 rounded-3xl bg-[#111a2e]/50 border border-slate-800 space-y-4 max-w-md mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                  <SearchX className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-100">
                    No matching commands found
                  </h3>
                  <p className="text-sm text-slate-400">
                    We couldn't find any command matching &ldquo;{searchQuery || selectedCategory}&rdquo;. Try another term or clear active filters.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition cursor-pointer shadow-[0_0_15px_rgba(0,212,255,0.2)]"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Scroll to Top button (desktop) */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll back to top"
          className="hidden md:flex fixed bottom-6 right-6 p-3 rounded-full bg-cyan-500 text-slate-950 font-bold shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:scale-110 active:scale-95 transition-all z-30 cursor-pointer items-center justify-center"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Persistent Web Audio Study Beats Rhythmic Synthesizer */}
      <StudyBeatsWidget />

      {/* Gemini 3.8 Live Voice Mentor Modal */}
      <VoiceMentorModal
        isOpen={isVoiceMentorOpen}
        onClose={() => setIsVoiceMentorOpen(false)}
        activeCommandName={voiceMentorTarget}
      />

      {/* Firebase Auth & Firestore Sync Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        learnedCount={overallStats.learnedCount}
        favoritesCount={overallStats.favoritesCount}
      />

      {/* Mobile Bottom Thumb-Reachable Filter Bar */}
      <nav aria-label="Mobile quick filters" className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0a0e1a]/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          type="button"
          onClick={handleGoHome}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition ${
            !selectedCommandId && filterView === 'all' && selectedCategory === 'All' && !searchQuery
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => {
            handleBackToHome();
            setFilterView('favorites');
          }}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition ${
            filterView === 'favorites'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-amber-300'
          }`}
        >
          <span className="relative">
            <span className="w-4 h-4 flex items-center justify-center">★</span>
            {overallStats.favoritesCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 text-[8px] bg-amber-500 text-slate-950 font-bold rounded-full">
                {overallStats.favoritesCount}
              </span>
            )}
          </span>
          <span>Starred</span>
        </button>

        <button
          type="button"
          onClick={() => {
            handleBackToHome();
            setFilterView('learned');
          }}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition ${
            filterView === 'learned'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-emerald-300'
          }`}
        >
          <span className="relative">
            <span className="w-4 h-4 flex items-center justify-center">✓</span>
            {overallStats.learnedCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 text-[8px] bg-emerald-500 text-slate-950 font-bold rounded-full">
                {overallStats.learnedCount}
              </span>
            )}
          </span>
          <span>Learned</span>
        </button>

        {/* Mobile Voice Mentor button */}
        <button
          type="button"
          onClick={() => {
            setVoiceMentorTarget(undefined);
            setIsVoiceMentorOpen(true);
          }}
          className="flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-medium text-cyan-400 hover:text-cyan-300 transition"
        >
          <Mic className="w-4 h-4 mb-0.5 animate-pulse" />
          <span>Mentor</span>
        </button>

        <button
          type="button"
          onClick={() => setIsAuthModalOpen(true)}
          className="flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-medium text-slate-400 hover:text-slate-200 transition"
        >
          <Shield className="w-4 h-4 mb-0.5" />
          <span>{currentUser ? 'Cloud' : 'Sign In'}</span>
        </button>
      </nav>

      {/* Footer */}
      <footer className="mt-auto mb-16 md:mb-0 border-t border-slate-800/80 bg-[#0a0e1a] py-8 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-2 font-mono text-slate-400">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>Linux Cheat Sheet for Cybersecurity Beginners</span>
        </div>
        <p className="text-slate-500 px-4">
          Structured Linux command reference, real-time AI voice mentor, rhythmic study beats, and cloud sync.
        </p>
      </footer>
    </div>
  );
}
