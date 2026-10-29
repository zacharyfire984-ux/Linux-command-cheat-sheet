import { Command } from '../../types/command';
import { PART1_COMMANDS } from './part1';
import { PART2_COMMANDS } from './part2';
import { PART3_COMMANDS } from './part3';
import { PART4_COMMANDS } from './part4';

export const ALL_COMMANDS: Command[] = [
  ...PART1_COMMANDS,
  ...PART2_COMMANDS,
  ...PART3_COMMANDS,
  ...PART4_COMMANDS,
];

// Map for instant O(1) lookup by command ID or name
export const COMMANDS_BY_ID = new Map<string, Command>(
  ALL_COMMANDS.map((cmd) => [cmd.id.toLowerCase(), cmd])
);

// Specifically requested "Start Here" guided path in exact order:
// ls, pwd, cd, cat, mkdir, cp, mv, rm, man, clear
export const FIRST_10_COMMAND_IDS = [
  'ls',
  'pwd',
  'cd',
  'cat',
  'mkdir',
  'cp',
  'mv',
  'rm',
  'man',
  'clear',
];

export const FIRST_10_COMMANDS = FIRST_10_COMMAND_IDS.map((id) => {
  const found = COMMANDS_BY_ID.get(id);
  if (!found) {
    throw new Error(`Command not found for first 10: ${id}`);
  }
  return found;
});
