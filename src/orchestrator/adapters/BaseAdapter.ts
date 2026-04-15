import type { AgentName, Task, AgentEvent } from '../../shared/types';

export interface AgentProcess {
  pid: number;
  kill: () => void;
  onOutput: (callback: (data: string) => void) => void;
  onExit: (callback: (code: number | null) => void) => void;
}

export abstract class BaseAdapter {
  abstract name: AgentName;
  abstract cliCommand: string;

  abstract detect(): Promise<boolean>;
  abstract spawn(task: Task, workDir: string): Promise<AgentProcess>;

  protected createEvent(
    type: AgentEvent['type'],
    taskId: string,
    data?: string,
  ): AgentEvent {
    return {
      type,
      agentName: this.name,
      taskId,
      data,
      timestamp: Date.now(),
    };
  }
}
