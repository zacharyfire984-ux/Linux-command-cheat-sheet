import { CategoryMeta } from '../types/command';

export const CATEGORIES: CategoryMeta[] = [
  {
    name: 'Moving Around',
    description: 'Find out where you are in the filesystem and jump between directories.',
    iconName: 'Compass',
    color: '#00d4ff', // Cyan
  },
  {
    name: 'Files & Folders',
    description: 'Create, copy, rename, remove, and list files and directories.',
    iconName: 'Folder',
    color: '#38bdf8', // Sky
  },
  {
    name: 'Reading Files',
    description: 'Inspect the contents of text files, logs, and config files without modifying them.',
    iconName: 'FileText',
    color: '#a78bfa', // Purple
  },
  {
    name: 'Permissions',
    description: 'Control who can read, write, or run files, and run commands as administrator.',
    iconName: 'Shield',
    color: '#f59e0b', // Amber
  },
  {
    name: 'Processes',
    description: 'See what programs are running, check resource usage, and stop stuck jobs.',
    iconName: 'Cpu',
    color: '#10b981', // Emerald
  },
  {
    name: 'Networking',
    description: 'Check connectivity, test ports, download files, and analyze network interfaces.',
    iconName: 'Globe',
    color: '#06b6d4', // Cyan
  },
  {
    name: 'Searching & Finding',
    description: 'Find files across your whole hard drive and search inside files for text patterns.',
    iconName: 'Search',
    color: '#ec4899', // Pink
  },
  {
    name: 'System Info',
    description: 'Check your kernel version, CPU, memory, uptime, and hardware configuration.',
    iconName: 'Info',
    color: '#6366f1', // Indigo
  },
  {
    name: 'Users & Groups',
    description: 'Manage user accounts, passwords, groups, and see who is logged in.',
    iconName: 'Users',
    color: '#14b8a6', // Teal
  },
  {
    name: 'Disk & Storage',
    description: 'Check free drive space, mount drives, inspect block devices, and format storage.',
    iconName: 'HardDrive',
    color: '#eab308', // Yellow
  },
  {
    name: 'Text Processing',
    description: 'Filter, sort, cut columns, count words, and transform text streams.',
    iconName: 'AlignLeft',
    color: '#8b5cf6', // Violet
  },
  {
    name: 'Archives',
    description: 'Compress, bundle, unpack, and view files inside zip, tar, and gzip archives.',
    iconName: 'Archive',
    color: '#f97316', // Orange
  },
  {
    name: 'SSH & Remote',
    description: 'Connect to remote servers securely, transfer files, and manage SSH key pairs.',
    iconName: 'Terminal',
    color: '#22c55e', // Green
  },
  {
    name: 'Software & Packages',
    description: 'Install, update, query, and remove system packages and software tools.',
    iconName: 'Package',
    color: '#3b82f6', // Blue
  },
  {
    name: 'Shell Tips & Shortcuts',
    description: 'Command line productivity, history navigation, manual pages, aliases, and variables.',
    iconName: 'Sparkles',
    color: '#d946ef', // Fuchsia
  },
  {
    name: 'Boot & Services',
    description: 'Start and stop background background daemons, inspect system boot logs, and restart.',
    iconName: 'Zap',
    color: '#fb7185', // Rose
  },
  {
    name: 'Security & Forensics',
    description: 'Investigate suspicious files, analyze hashes, inspect open sockets, and triage incidents.',
    iconName: 'Lock',
    color: '#ef4444', // Red
  },
];
