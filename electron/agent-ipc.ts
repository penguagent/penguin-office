import { ipcMain, BrowserWindow } from 'electron';
import { spawn, type ChildProcess } from 'child_process';

const runningProcesses = new Map<number, ChildProcess>();

const CLI_COMMANDS: Record<string, { cmd: string; args: (task: string) => string[] }> = {
  claude: { cmd: 'claude', args: (task) => ['--print', task] },
  codex: { cmd: 'codex', args: (task) => [task] },
  gemini: { cmd: 'gemini', args: (task) => ['-p', task] },
  droid: { cmd: 'droid', args: (task) => [task] },
  opencode: { cmd: 'opencode', args: (task) => [task] },
  ollama: { cmd: 'ollama', args: (task) => ['run', 'codellama', task] },
};

function detectCli(command: string): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn('which', [command]);
    proc.on('close', (code) => resolve(code === 0));
    proc.on('error', () => resolve(false));
  });
}

export function setupAgentIPC() {
  ipcMain.handle('detect-agents', async () => {
    const results: Record<string, boolean> = {};
    await Promise.all(
      Object.entries(CLI_COMMANDS).map(async ([name, { cmd }]) => {
        results[name] = await detectCli(cmd);
      }),
    );
    return results;
  });

  ipcMain.handle('spawn-agent', async (event, agentName: string, task: string, workDir: string) => {
    const config = CLI_COMMANDS[agentName];
    if (!config) throw new Error(`Unknown agent: ${agentName}`);

    const proc = spawn(config.cmd, config.args(task), {
      cwd: workDir || process.cwd(),
      env: { ...process.env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const pid = proc.pid ?? -1;
    runningProcesses.set(pid, proc);

    const win = BrowserWindow.fromWebContents(event.sender);

    const taskId = `task-${Date.now()}`;

    win?.webContents.send('agent-event', {
      type: 'spawned',
      agentName,
      taskId,
      timestamp: Date.now(),
    });

    proc.stdout?.on('data', (data: Buffer) => {
      win?.webContents.send('agent-event', {
        type: 'output',
        agentName,
        taskId,
        data: data.toString(),
        timestamp: Date.now(),
      });
    });

    proc.stderr?.on('data', (data: Buffer) => {
      win?.webContents.send('agent-event', {
        type: 'output',
        agentName,
        taskId,
        data: `[stderr] ${data.toString()}`,
        timestamp: Date.now(),
      });
    });

    proc.on('close', (code) => {
      runningProcesses.delete(pid);
      win?.webContents.send('agent-event', {
        type: code === 0 ? 'complete' : 'error',
        agentName,
        taskId,
        data: code === 0 ? 'Task completed' : `Exited with code ${code}`,
        timestamp: Date.now(),
      });
    });

    return pid;
  });

  ipcMain.handle('kill-agent', (_event, processId: number) => {
    const proc = runningProcesses.get(processId);
    if (proc) {
      proc.kill('SIGTERM');
      runningProcesses.delete(processId);
    }
  });
}

export function killAllAgents() {
  runningProcesses.forEach((proc) => {
    try { proc.kill('SIGTERM'); } catch {}
  });
  runningProcesses.clear();
}
