import { create } from 'zustand';
import type { AgentName, AgentConfig, AgentStatus, Task, ChatMessage } from '../../shared/types';

interface AppState {
  // Agents
  agents: Map<AgentName, AgentConfig>;
  agentStatuses: Map<AgentName, AgentStatus>;
  setAgents: (agents: Map<AgentName, AgentConfig>) => void;
  setAgentStatus: (name: AgentName, status: AgentStatus) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;

  // Chat
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;

  // UI state
  selectedAgent: AgentName | null;
  setSelectedAgent: (name: AgentName | null) => void;
  appMode: 'normal' | 'widget';
  setAppMode: (mode: 'normal' | 'widget') => void;
  showTaskBoard: boolean;
  toggleTaskBoard: () => void;
  showLogs: boolean;
  toggleLogs: () => void;
}

export const useStore = create<AppState>((set) => ({
  agents: new Map(),
  agentStatuses: new Map(),
  setAgents: (agents) => set({ agents }),
  setAgentStatus: (name, status) =>
    set((state) => {
      const updated = new Map(state.agentStatuses);
      updated.set(name, status);
      return { agentStatuses: updated };
    }),

  tasks: [],
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),

  messages: [],
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  selectedAgent: null,
  setSelectedAgent: (name) => set({ selectedAgent: name }),
  appMode: 'normal',
  setAppMode: (mode) => set({ appMode: mode }),
  showTaskBoard: false,
  toggleTaskBoard: () => set((state) => ({ showTaskBoard: !state.showTaskBoard })),
  showLogs: false,
  toggleLogs: () => set((state) => ({ showLogs: !state.showLogs })),
}));
