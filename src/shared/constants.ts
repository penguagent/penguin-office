import type { AgentConfig, AgentName, OfficeZone } from './types';

export const GRID_SIZE = 1;
export const GRID_COLS = 32;
export const GRID_ROWS = 24;

export const AGENT_CONFIGS: Record<AgentName, Omit<AgentConfig, 'installed'>> = {
  claude: {
    name: 'claude',
    displayName: 'Claude',
    role: 'developer',
    outfit: 'suit',
    colorAccent: '#e67e22',
  },
  codex: {
    name: 'codex',
    displayName: 'Codex',
    role: 'developer',
    outfit: 'hoodie',
    colorAccent: '#2ecc71',
  },
  gemini: {
    name: 'gemini',
    displayName: 'Gemini',
    role: 'developer',
    outfit: 'labcoat',
    colorAccent: '#3498db',
  },
  droid: {
    name: 'droid',
    displayName: 'Droid',
    role: 'developer',
    outfit: 'vest',
    colorAccent: '#9b59b6',
  },
  opencode: {
    name: 'opencode',
    displayName: 'OpenCode',
    role: 'developer',
    outfit: 'tshirt',
    colorAccent: '#1abc9c',
  },
  ollama: {
    name: 'ollama',
    displayName: 'Ollama',
    role: 'developer',
    outfit: 'beanie',
    colorAccent: '#e74c3c',
  },
};

export const OFFICE_ZONES: OfficeZone[] = [
  { name: 'desk-area', gridX: 2, gridY: 2, width: 12, height: 8 },
  { name: 'meeting-room', gridX: 18, gridY: 2, width: 10, height: 6 },
  { name: 'break-room', gridX: 2, gridY: 12, width: 10, height: 8 },
  { name: 'gym', gridX: 18, gridY: 10, width: 10, height: 6 },
  { name: 'server-room', gridX: 2, gridY: 22, width: 8, height: 4 },
  { name: 'lounge', gridX: 18, gridY: 18, width: 10, height: 6 },
];

export const DESK_POSITIONS = [
  { gridX: 4, gridY: 4 },
  { gridX: 8, gridY: 4 },
  { gridX: 12, gridY: 4 },
  { gridX: 4, gridY: 8 },
  { gridX: 8, gridY: 8 },
  { gridX: 12, gridY: 8 },
];

export const BREAK_POSITIONS = [
  { gridX: 4, gridY: 14 },
  { gridX: 7, gridY: 14 },
  { gridX: 10, gridY: 16 },
];

export const GYM_POSITIONS = [
  { gridX: 20, gridY: 12 },
  { gridX: 24, gridY: 12 },
];
