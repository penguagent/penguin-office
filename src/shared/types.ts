export type AgentName = 'claude' | 'codex' | 'gemini' | 'droid' | 'opencode' | 'ollama';
export type AgentRole = 'leader' | 'developer' | 'reviewer';
export type AgentStatus = 'idle' | 'working' | 'error' | 'offline';
export type PenguinState = 'idle' | 'walking' | 'sitting' | 'typing' | 'exercising' | 'talking' | 'playing';

export interface AgentConfig {
  name: AgentName;
  displayName: string;
  role: AgentRole;
  outfit: string;
  colorAccent: string;
  installed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo?: AgentName;
  status: 'backlog' | 'in-progress' | 'review' | 'done';
  output: string[];
  tokenCount: number;
  createdAt: number;
  completedAt?: number;
}

export interface AgentEvent {
  type: 'spawned' | 'output' | 'progress' | 'complete' | 'error' | 'killed';
  agentName: AgentName;
  taskId: string;
  data?: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | AgentName;
  content: string;
  timestamp: number;
  taskId?: string;
}

export interface OfficeZone {
  name: string;
  gridX: number;
  gridY: number;
  width: number;
  height: number;
}

export interface PenguinPosition {
  gridX: number;
  gridY: number;
  targetGridX?: number;
  targetGridY?: number;
}

export interface ElectronAPI {
  getMode: () => Promise<string>;
  toggleWidget: () => Promise<void>;
  onModeChange: (callback: (mode: string) => void) => void;
  spawnAgent: (agentName: string, task: string, workDir: string) => Promise<number>;
  killAgent: (processId: number) => Promise<void>;
  detectAgents: () => Promise<Record<string, boolean>>;
  onAgentEvent: (callback: (event: AgentEvent) => void) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
