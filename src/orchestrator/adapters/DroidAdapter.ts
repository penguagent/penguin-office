import { spawn } from 'child_process';
import { BaseAdapter } from './BaseAdapter';
import type { AgentProcess } from './BaseAdapter';
import type { AgentName, Task } from '../../shared/types';

export class DroidAdapter extends BaseAdapter {
  name: AgentName = 'droid';
  cliCommand = 'droid';

  async detect(): Promise<boolean> {
    return new Promise((resolve) => {
      const proc = spawn('which', [this.cliCommand]);
      proc.on('close', (code) => resolve(code === 0));
      proc.on('error', () => resolve(false));
    });
  }

  async spawn(task: Task, workDir: string): Promise<AgentProcess> {
    const proc = spawn(this.cliCommand, [task.description], {
      cwd: workDir,
      env: { ...process.env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const outputCallbacks: ((data: string) => void)[] = [];
    const exitCallbacks: ((code: number | null) => void)[] = [];

    proc.stdout?.on('data', (data: Buffer) => {
      outputCallbacks.forEach((cb) => cb(data.toString()));
    });
    proc.stderr?.on('data', (data: Buffer) => {
      outputCallbacks.forEach((cb) => cb(`[stderr] ${data.toString()}`));
    });
    proc.on('close', (code) => {
      exitCallbacks.forEach((cb) => cb(code));
    });

    return {
      pid: proc.pid ?? -1,
      kill: () => proc.kill('SIGTERM'),
      onOutput: (cb) => outputCallbacks.push(cb),
      onExit: (cb) => exitCallbacks.push(cb),
    };
  }
}
