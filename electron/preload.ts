import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getMode: () => ipcRenderer.invoke('get-mode'),
  toggleWidget: () => ipcRenderer.invoke('toggle-widget'),
  onModeChange: (callback: (mode: string) => void) => {
    ipcRenderer.on('mode-change', (_event, mode) => callback(mode));
  },
  spawnAgent: (agentName: string, task: string, workDir: string) =>
    ipcRenderer.invoke('spawn-agent', agentName, task, workDir),
  killAgent: (processId: number) =>
    ipcRenderer.invoke('kill-agent', processId),
  detectAgents: () => ipcRenderer.invoke('detect-agents'),
  onAgentEvent: (callback: (event: unknown) => void) => {
    ipcRenderer.on('agent-event', (_event, data) => callback(data));
  },
});
