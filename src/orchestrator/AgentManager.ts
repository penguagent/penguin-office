import { BaseAdapter, type AgentProcess as AgentProc } from './adapters/BaseAdapter';
import { ClaudeAdapter } from './adapters/ClaudeAdapter';
import { CodexAdapter } from './adapters/CodexAdapter';
import { GeminiAdapter } from './adapters/GeminiAdapter';
import { DroidAdapter } from './adapters/DroidAdapter';
import { OpenCodeAdapter } from './adapters/OpenCodeAdapter';
import { OllamaAdapter } from './adapters/OllamaAdapter';
import { eventBus } from './events/EventBus';
import type { AgentName, AgentConfig, Task } from '../shared/types';
import { AGENT_CONFIGS } from '../shared/constants';

interface RunningAgent {
  process: AgentProc;
  taskId: string;
}

export class AgentManager {
  private adapters: Map<AgentName, BaseAdapter> = new Map();
  private agents: Map<AgentName, AgentConfig> = new Map();
  private running: Map<AgentName, RunningAgent> = new Map();

  constructor() {
    this.adapters.set('claude', new ClaudeAdapter());
    this.adapters.set('codex', new CodexAdapter());
    this.adapters.set('gemini', new GeminiAdapter());
    this.adapters.set('droid', new DroidAdapter());
    this.adapters.set('opencode', new OpenCodeAdapter());
    this.adapters.set('ollama', new OllamaAdapter());
  }

  async detectAll(): Promise<Map<AgentName, AgentConfig>> {
    const results = await Promise.all(
      Array.from(this.adapters.entries()).map(async ([name, adapter]) => {
        const installed = await adapter.detect();
        const config: AgentConfig = { ...AGENT_CONFIGS[name], installed };
        return [name, config] as const;
      }),
    );

    this.agents.clear();
    for (const [name, config] of results) {
      this.agents.set(name, config);
    }
    return this.agents;
  }

  getAgents(): Map<AgentName, AgentConfig> {
    return this.agents;
  }

  isRunning(name: AgentName): boolean {
    return this.running.has(name);
  }

  async spawnAgent(name: AgentName, task: Task, workDir: string): Promise<void> {
    const adapter = this.adapters.get(name);
    if (!adapter) throw new Error(`No adapter for agent: ${name}`);

    const config = this.agents.get(name);
    if (!config?.installed) throw new Error(`Agent ${name} is not installed`);

    if (this.running.has(name)) {
      throw new Error(`Agent ${name} is already running`);
    }

    const proc = await adapter.spawn(task, workDir);
    this.running.set(name, { process: proc, taskId: task.id });

    eventBus.emit('agent:spawned', {
      type: 'spawned',
      agentName: name,
      taskId: task.id,
      timestamp: Date.now(),
    });

    proc.onOutput((data) => {
      eventBus.emit('agent:output', {
        type: 'output',
        agentName: name,
        taskId: task.id,
        data,
        timestamp: Date.now(),
      });
    });

    proc.onExit((code) => {
      this.running.delete(name);
      eventBus.emit('agent:complete', {
        type: code === 0 ? 'complete' : 'error',
        agentName: name,
        taskId: task.id,
        data: code === 0 ? 'Task completed successfully' : `Exited with code ${code}`,
        timestamp: Date.now(),
      });
    });
  }

  killAgent(name: AgentName): void {
    const running = this.running.get(name);
    if (running) {
      running.process.kill();
      this.running.delete(name);
      eventBus.emit('agent:killed', {
        type: 'killed',
        agentName: name,
        taskId: running.taskId,
        timestamp: Date.now(),
      });
    }
  }

  killAll(): void {
    for (const name of this.running.keys()) {
      this.killAgent(name);
    }
  }
}

export const agentManager = new AgentManager();
