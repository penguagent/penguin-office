import type { Task, AgentName } from '../shared/types';
import { eventBus } from './events/EventBus';

let taskIdCounter = 0;

function generateTaskId(): string {
  taskIdCounter++;
  return `task-${Date.now()}-${taskIdCounter}`;
}

export class TaskQueue {
  private tasks: Map<string, Task> = new Map();

  createTask(title: string, description: string, assignTo?: AgentName): Task {
    const task: Task = {
      id: generateTaskId(),
      title,
      description,
      assignedTo: assignTo,
      status: 'backlog',
      output: [],
      tokenCount: 0,
      createdAt: Date.now(),
    };
    this.tasks.set(task.id, task);
    eventBus.emit('task:created', task);
    return task;
  }

  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  getByStatus(status: Task['status']): Task[] {
    return this.getAllTasks().filter((t) => t.status === status);
  }

  updateStatus(id: string, status: Task['status']): void {
    const task = this.tasks.get(id);
    if (task) {
      task.status = status;
      if (status === 'done') task.completedAt = Date.now();
      eventBus.emit('task:updated', task);
    }
  }

  appendOutput(id: string, output: string): void {
    const task = this.tasks.get(id);
    if (task) {
      task.output.push(output);
      task.tokenCount += Math.ceil(output.length / 4);
    }
  }

  assignTask(id: string, agentName: AgentName): void {
    const task = this.tasks.get(id);
    if (task) {
      task.assignedTo = agentName;
      eventBus.emit('task:assigned', task);
    }
  }

  getNextBacklogTask(): Task | undefined {
    return this.getByStatus('backlog')[0];
  }
}

export const taskQueue = new TaskQueue();
