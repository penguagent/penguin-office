import React from 'react';
import { useStore } from '../store/useStore';
import { AGENT_CONFIGS } from '../../shared/constants';
import type { AgentName, Task } from '../../shared/types';

const COLUMNS: { key: Task['status']; label: string }[] = [
  { key: 'backlog', label: 'Backlog' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'review', label: 'Review' },
  { key: 'done', label: 'Done' },
];

export const TaskBoard: React.FC = () => {
  const { tasks, showTaskBoard, toggleTaskBoard } = useStore();

  if (!showTaskBoard) return null;

  return (
    <div style={{
      position: 'absolute',
      left: 0,
      top: 48,
      bottom: 0,
      width: 'calc(100% - 360px)',
      background: 'rgba(20, 20, 35, 0.95)',
      backdropFilter: 'blur(10px)',
      zIndex: 99,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>Task Board</span>
        <button onClick={toggleTaskBoard} style={{
          background: 'none',
          border: 'none',
          color: '#888',
          cursor: 'pointer',
          fontSize: 18,
        }}>
          ×
        </button>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        gap: 12,
        padding: 16,
        overflow: 'auto',
      }}>
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} style={{
              flex: 1,
              minWidth: 200,
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 12,
              padding: 12,
            }}>
              <div style={{
                fontWeight: 600,
                fontSize: 13,
                marginBottom: 12,
                color: '#aaa',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}>
                {col.label} ({colTasks.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {colTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const agentConfig = task.assignedTo ? AGENT_CONFIGS[task.assignedTo] : null;
  return (
    <div style={{
      background: 'rgba(255,255,255,0.06)',
      borderRadius: 8,
      padding: 12,
      borderLeft: `3px solid ${agentConfig?.colorAccent ?? '#555'}`,
    }}>
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{task.title}</div>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
        {task.description.substring(0, 80)}{task.description.length > 80 ? '...' : ''}
      </div>
      {task.assignedTo && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 11,
          color: agentConfig?.colorAccent,
        }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: agentConfig?.colorAccent,
          }} />
          {agentConfig?.displayName}
          {task.tokenCount > 0 && (
            <span style={{ color: '#666', marginLeft: 'auto' }}>
              {task.tokenCount.toLocaleString()} tokens
            </span>
          )}
        </div>
      )}
    </div>
  );
};
