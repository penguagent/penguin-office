import { z } from 'zod';

export const AgentNameSchema = z.enum(['claude', 'codex', 'gemini', 'droid', 'opencode', 'ollama']);

export const AgentEventSchema = z.object({
  type: z.enum(['spawned', 'output', 'progress', 'complete', 'error', 'killed']),
  agentName: AgentNameSchema,
  taskId: z.string(),
  data: z.string().optional(),
  timestamp: z.number(),
});

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  assignedTo: AgentNameSchema.optional(),
  status: z.enum(['backlog', 'in-progress', 'review', 'done']),
  output: z.array(z.string()),
  tokenCount: z.number(),
  createdAt: z.number(),
  completedAt: z.number().optional(),
});

export const ChatMessageSchema = z.object({
  id: z.string(),
  sender: z.union([z.literal('user'), AgentNameSchema]),
  content: z.string(),
  timestamp: z.number(),
  taskId: z.string().optional(),
});
