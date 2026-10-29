export type Category =
  | 'Moving Around'
  | 'Files & Folders'
  | 'Reading Files'
  | 'Permissions'
  | 'Processes'
  | 'Networking'
  | 'Searching & Finding'
  | 'System Info'
  | 'Users & Groups'
  | 'Disk & Storage'
  | 'Text Processing'
  | 'Archives'
  | 'SSH & Remote'
  | 'Software & Packages'
  | 'Shell Tips & Shortcuts'
  | 'Boot & Services'
  | 'Security & Forensics';

export type Difficulty = 'Beginner' | 'Intermediate';

export type DangerLevel = 'safe' | 'careful' | 'critical';

export interface CommandFlag {
  flag: string;
  changes: string;
  example: string;
}

export interface CommandExample {
  command: string;
  output: string;
  explanation: string;
}

export interface Command {
  id: string;
  name: string;
  category: Category;
  difficulty: Difficulty;
  dangerLevel: DangerLevel;
  description: string;
  syntax: string;
  flags: CommandFlag[];
  examples: CommandExample[];
  commonMistakes: string;
  whenNotToUse: string;
  tip: string;
  practiceTask: string;
  relatedCommands: string[];
  cybersecurityNote?: string;
}

export interface CategoryMeta {
  name: Category;
  description: string;
  iconName: string;
  color: string;
}
