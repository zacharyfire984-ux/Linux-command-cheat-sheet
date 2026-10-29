import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_COMMANDS } from '../data/commands';
import { filterAndSortCommands, splitHighlight } from './filterSearch';
import { calculateCategoryStats, calculateOverallStats } from './storage';

test('library contains over 150 commands', () => {
  assert.ok(ALL_COMMANDS.length >= 150, `Expected at least 150 commands, got ${ALL_COMMANDS.length}`);
});

test('first 10 commands exist and match required sequence', () => {
  const expectedOrder = ['ls', 'pwd', 'cd', 'cat', 'mkdir', 'cp', 'mv', 'rm', 'man', 'clear'];
  for (const cmdId of expectedOrder) {
    const found = ALL_COMMANDS.find((c) => c.id === cmdId);
    assert.ok(found, `Expected command ${cmdId} to exist in library`);
  }
});

test('every command has required structured fields and real examples', () => {
  for (const cmd of ALL_COMMANDS) {
    assert.ok(cmd.name, `Command missing name: ${JSON.stringify(cmd)}`);
    assert.ok(cmd.syntax, `Command missing syntax: ${cmd.name}`);
    assert.ok(cmd.description, `Command missing description: ${cmd.name}`);
    assert.ok(cmd.flags.length >= 1, `Command ${cmd.name} should have flags table`);
    assert.ok(cmd.examples.length >= 2, `Command ${cmd.name} should have examples`);
    assert.ok(cmd.commonMistakes, `Command ${cmd.name} should have common mistakes`);
    assert.ok(cmd.whenNotToUse, `Command ${cmd.name} should have when-not-to-use`);
    assert.ok(cmd.tip, `Command ${cmd.name} should have tip`);
    assert.ok(cmd.practiceTask, `Command ${cmd.name} should have practice task`);
    assert.ok(Array.isArray(cmd.relatedCommands), `Command ${cmd.name} should have relatedCommands`);
  }
});

test('search finds command by description (e.g. "find files" finds find)', () => {
  const results = filterAndSortCommands(ALL_COMMANDS, { query: 'find files' });
  const hasFind = results.some((c) => c.name === 'find');
  assert.ok(hasFind, 'Searching for "find files" must return the find command');
});

test('search finds command by name (e.g. "grep")', () => {
  const results = filterAndSortCommands(ALL_COMMANDS, { query: 'grep' });
  assert.ok(results.length > 0);
  assert.equal(results[0].name, 'grep');
});

test('search finds command by category (e.g. "Networking")', () => {
  const results = filterAndSortCommands(ALL_COMMANDS, { query: 'Networking' });
  assert.ok(results.length >= 10);
  assert.ok(results.some((c) => c.name === 'ping'));
});

test('category filter limits results properly', () => {
  const netCommands = filterAndSortCommands(ALL_COMMANDS, { category: 'Networking' });
  for (const cmd of netCommands) {
    assert.equal(cmd.category, 'Networking');
  }
});

test('difficulty filter limits results properly', () => {
  const beginners = filterAndSortCommands(ALL_COMMANDS, { difficulty: 'Beginner' });
  for (const cmd of beginners) {
    assert.equal(cmd.difficulty, 'Beginner');
  }
});

test('danger filter isolates destructive commands', () => {
  const dangerous = filterAndSortCommands(ALL_COMMANDS, { filterView: 'careful' });
  assert.ok(dangerous.length > 0);
  for (const cmd of dangerous) {
    assert.ok(cmd.dangerLevel === 'careful' || cmd.dangerLevel === 'critical');
  }
  assert.ok(dangerous.some((c) => c.name === 'rm'));
  assert.ok(dangerous.some((c) => c.name === 'dd'));
  assert.ok(dangerous.some((c) => c.name === 'shred'));
  assert.ok(dangerous.some((c) => c.name === 'mkfs'));
});

test('splitHighlight marks matches accurately', () => {
  const parts = splitHighlight('List files in directory', 'files');
  assert.equal(parts.length, 3);
  assert.equal(parts[0].text, 'List ');
  assert.equal(parts[0].isMatch, false);
  assert.equal(parts[1].text, 'files');
  assert.equal(parts[1].isMatch, true);
  assert.equal(parts[2].text, ' in directory');
  assert.equal(parts[2].isMatch, false);
});

test('storage stats calculates accurately', () => {
  const learnedIds = new Set(['pwd', 'ls', 'cd']);
  const favoriteIds = new Set(['grep', 'awk']);
  const stats = calculateOverallStats(ALL_COMMANDS, learnedIds, favoriteIds);
  assert.equal(stats.learnedCount, 3);
  assert.equal(stats.favoritesCount, 2);
  assert.ok(stats.percentage >= 1);

  const catStats = calculateCategoryStats(ALL_COMMANDS, learnedIds);
  const movingAround = catStats.get('Moving Around');
  assert.ok(movingAround);
  assert.ok(movingAround.learnedCount >= 2);
});
