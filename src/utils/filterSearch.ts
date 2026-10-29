import { Category, Command, Difficulty } from '../types/command';

export type FilterView = 'all' | 'favorites' | 'learned' | 'unlearned' | 'careful';
export type SortOption = 'a-z' | 'z-a' | 'category' | 'difficulty';

export interface FilterOptions {
  query?: string;
  category?: Category | 'All';
  difficulty?: Difficulty | 'All';
  filterView?: FilterView;
  sortOption?: SortOption;
  favoriteIds?: Set<string>;
  learnedIds?: Set<string>;
}

export function filterAndSortCommands(
  commands: Command[],
  options: FilterOptions
): Command[] {
  const {
    query = '',
    category = 'All',
    difficulty = 'All',
    filterView = 'all',
    sortOption = 'a-z',
    favoriteIds = new Set<string>(),
    learnedIds = new Set<string>(),
  } = options;

  const cleanQuery = query.trim().toLowerCase();

  const filtered = commands.filter((cmd) => {
    // 1. Category Filter
    if (category !== 'All' && cmd.category !== category) {
      return false;
    }

    // 2. Difficulty Filter
    if (difficulty !== 'All' && cmd.difficulty !== difficulty) {
      return false;
    }

    // 3. View Filter (all, favorites, learned, unlearned, careful)
    if (filterView === 'favorites' && !favoriteIds.has(cmd.id)) {
      return false;
    }
    if (filterView === 'learned' && !learnedIds.has(cmd.id)) {
      return false;
    }
    if (filterView === 'unlearned' && learnedIds.has(cmd.id)) {
      return false;
    }
    if (filterView === 'careful' && cmd.dangerLevel === 'safe') {
      return false;
    }

    // 4. Search Query: Matches name, description, category, syntax, cybersecurity note, or keywords
    if (cleanQuery) {
      const matchName = (cmd.name || '').toLowerCase().includes(cleanQuery);
      const matchDesc = (cmd.description || '').toLowerCase().includes(cleanQuery);
      const matchCat = (cmd.category || '').toLowerCase().includes(cleanQuery);
      const matchSyntax = (cmd.syntax || '').toLowerCase().includes(cleanQuery);
      const matchCyber = cmd.cybersecurityNote?.toLowerCase().includes(cleanQuery) ?? false;
      const matchTip = (cmd.tip || '').toLowerCase().includes(cleanQuery);

      const queryWords = cleanQuery.split(/\s+/).filter(Boolean);
      const haystack = `${cmd.name || ''} ${cmd.description || ''} ${cmd.category || ''} ${cmd.syntax || ''} ${cmd.cybersecurityNote || ''} ${cmd.tip || ''}`.toLowerCase();
      const allWordsMatch = queryWords.every((word) => haystack.includes(word));

      if (!matchName && !matchDesc && !matchCat && !matchSyntax && !matchCyber && !matchTip && !allWordsMatch) {
        return false;
      }
    }

    return true;
  });

  // Relevance ranking when a search query is active
  if (cleanQuery) {
    const queryWords = cleanQuery.split(/\s+/).filter(Boolean);

    return filtered.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      // 1. Exact name match first
      if (aName === cleanQuery && bName !== cleanQuery) return -1;
      if (bName === cleanQuery && aName !== cleanQuery) return 1;

      // 2. Command name is an exact word in multi-word query (e.g. "find files" matches command "find")
      const aMatchesWord = queryWords.includes(aName);
      const bMatchesWord = queryWords.includes(bName);
      if (aMatchesWord && !bMatchesWord) return -1;
      if (bMatchesWord && !aMatchesWord) return 1;

      // 3. Starts with query
      if (aName.startsWith(cleanQuery) && !bName.startsWith(cleanQuery)) return -1;
      if (bName.startsWith(cleanQuery) && !aName.startsWith(cleanQuery)) return 1;

      // 4. Starts with any word in query
      const aStartsWithWord = queryWords.some((w) => aName.startsWith(w));
      const bStartsWithWord = queryWords.some((w) => bName.startsWith(w));
      if (aStartsWithWord && !bStartsWithWord) return -1;
      if (bStartsWithWord && !aStartsWithWord) return 1;

      // 5. Contains name
      const aHasName = aName.includes(cleanQuery);
      const bHasName = bName.includes(cleanQuery);
      if (aHasName && !bHasName) return -1;
      if (bHasName && !aHasName) return 1;

      return aName.localeCompare(bName);
    });
  }

  // Sorting when no query is typed
  const sorted = [...filtered].sort((a, b) => {
    switch (sortOption) {
      case 'a-z':
        return a.name.localeCompare(b.name);
      case 'z-a':
        return b.name.localeCompare(a.name);
      case 'category': {
        const catCompare = a.category.localeCompare(b.category);
        if (catCompare !== 0) return catCompare;
        return a.name.localeCompare(b.name);
      }
      case 'difficulty': {
        if (a.difficulty !== b.difficulty) {
          return a.difficulty === 'Beginner' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      }
      default:
        return 0;
    }
  });

  return sorted;
}

/**
 * Splits text into highlighted matching segments and non-matching segments
 */
export function splitHighlight(text: string, query: string): { text: string; isMatch: boolean }[] {
  if (!query || !query.trim()) {
    return [{ text, isMatch: false }];
  }

  const cleanQuery = query.trim();
  const escaped = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return parts
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      isMatch: part.toLowerCase() === cleanQuery.toLowerCase(),
    }));
}
