import { Category, Command } from '../types/command';

const STORAGE_KEYS = {
  FAVORITES: 'cyber_linux_cheat_favorites',
  LEARNED: 'cyber_linux_cheat_learned',
  RECENT: 'cyber_linux_cheat_recent',
  NOTES: 'cyber_linux_cheat_notes',
};

function readSet(key: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function writeSet(key: string, set: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch {
    // Ignore storage quota errors in private browsing
  }
}

export function loadFavorites(): Set<string> {
  return readSet(STORAGE_KEYS.FAVORITES);
}

export function saveFavorites(favorites: Set<string>): void {
  writeSet(STORAGE_KEYS.FAVORITES, favorites);
}

export function loadLearned(): Set<string> {
  return readSet(STORAGE_KEYS.LEARNED);
}

export function saveLearned(learned: Set<string>): void {
  writeSet(STORAGE_KEYS.LEARNED, learned);
}

export function loadRecentlyViewed(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENT);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.slice(0, 10) : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(id: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = loadRecentlyViewed().filter((item) => item !== id);
    const updated = [id, ...current].slice(0, 10);
    localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export interface CategoryStats {
  category: Category;
  total: number;
  learnedCount: number;
  percentage: number;
}

export function calculateCategoryStats(
  commands: Command[],
  learnedIds: Set<string>
): Map<Category, CategoryStats> {
  const map = new Map<Category, { total: number; learned: number }>();

  for (const cmd of commands) {
    const current = map.get(cmd.category) || { total: 0, learned: 0 };
    current.total += 1;
    if (learnedIds.has(cmd.id)) {
      current.learned += 1;
    }
    map.set(cmd.category, current);
  }

  const result = new Map<Category, CategoryStats>();
  for (const [cat, data] of map.entries()) {
    result.set(cat, {
      category: cat,
      total: data.total,
      learnedCount: data.learned,
      percentage: data.total > 0 ? Math.round((data.learned / data.total) * 100) : 0,
    });
  }

  return result;
}

export interface OverallStats {
  total: number;
  learnedCount: number;
  percentage: number;
  favoritesCount: number;
}

export function calculateOverallStats(
  commands: Command[],
  learnedIds: Set<string>,
  favoriteIds: Set<string>
): OverallStats {
  const total = commands.length;
  let learnedCount = 0;
  for (const cmd of commands) {
    if (learnedIds.has(cmd.id)) {
      learnedCount += 1;
    }
  }

  return {
    total,
    learnedCount,
    percentage: total > 0 ? Math.round((learnedCount / total) * 100) : 0,
    favoritesCount: favoriteIds.size,
  };
}

export function loadNotes(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveNotes(notes: Record<string, string>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  } catch {}
}
