import React, { useEffect, useRef, useCallback } from 'react';
import { SceneManager } from '../renderer/SceneManager';
import { AgentBar } from './panels/AgentBar';
import { ChatPanel } from './panels/ChatPanel';
import { TaskBoard } from './panels/TaskBoard';
import { LogPanel } from './panels/LogPanel';
import { useStore } from './store/useStore';
import { eventBus } from '../orchestrator/events/EventBus';
import { AGENT_CONFIGS } from '../shared/constants';
import type { AgentName, AgentConfig, AgentEvent, ChatMessage } from '../shared/types';

let msgId = 0;
function nextMsgId() { return `msg-${++msgId}`; }

export const App: React.FC = () => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);
  const {
    setAgents, addMessage, setAgentStatus, addTask, updateTask,
    selectedAgent, appMode, toggleTaskBoard, toggleLogs,
  } = useStore();

  useEffect(() => {
    if (!sceneRef.current) return;

    const manager = new SceneManager(sceneRef.current);
    sceneManagerRef.current = manager;

    // Detect agents - in browser mode, simulate all as installed for demo
    const detectedAgents = new Map<AgentName, AgentConfig>();
    (Object.keys(AGENT_CONFIGS) as AgentName[]).forEach((name) => {
      detectedAgents.set(name, { ...AGENT_CONFIGS[name], installed: true });
    });
    setAgents(detectedAgents);

    // Try real detection via Electron API
    if (window.electronAPI) {
      window.electronAPI.detectAgents().then((result) => {
        const agents = new Map<AgentName, AgentConfig>();
        (Object.keys(AGENT_CONFIGS) as AgentName[]).forEach((name) => {
          agents.set(name, { ...AGENT_CONFIGS[name], installed: result[name] ?? false });
        });
        setAgents(agents);
        manager.initPenguins(agents);
      });
    } else {
      manager.initPenguins(detectedAgents);
    }

    // Listen for agent events from Electron
    window.electronAPI?.onAgentEvent((event: AgentEvent) => {
      eventBus.emit(`agent:${event.type}`, event);
    });

    // Listen for mode changes
    window.electronAPI?.onModeChange((mode: string) => {
      useStore.getState().setAppMode(mode as 'normal' | 'widget');
    });

    // Connect event bus to store
    eventBus.on('agent:spawned', (event: unknown) => {
      const e = event as AgentEvent;
      setAgentStatus(e.agentName, 'working');
    });
    eventBus.on('agent:complete', (event: unknown) => {
      const e = event as AgentEvent;
      setAgentStatus(e.agentName, 'idle');
      if (e.data) {
        addMessage({
          id: nextMsgId(),
          sender: e.agentName,
          content: e.data,
          timestamp: Date.now(),
          taskId: (event as AgentEvent).taskId,
        });
      }
    });
    eventBus.on('agent:output', (event: unknown) => {
      const e = event as AgentEvent;
      if (e.data) {
        const addLog = (window as unknown as Record<string, unknown>).__addLog as ((a: string, t: string) => void) | undefined;
        addLog?.(e.agentName, e.data);
      }
    });
    eventBus.on('agent:error', (event: unknown) => {
      const e = event as AgentEvent;
      setAgentStatus(e.agentName, 'error');
    });

    manager.start();

    return () => {
      manager.dispose();
    };
  }, []);

  useEffect(() => {
    if (selectedAgent && sceneManagerRef.current) {
      sceneManagerRef.current.focusOnAgent(selectedAgent);
    }
  }, [selectedAgent]);

  const handleSendMessage = useCallback((text: string, targetAgent?: AgentName) => {
    const userMsg: ChatMessage = {
      id: nextMsgId(),
      sender: 'user',
      content: targetAgent ? `@${targetAgent} ${text}` : text,
      timestamp: Date.now(),
    };
    addMessage(userMsg);

    // If targeting an agent, create a task and spawn
    const agent = targetAgent ?? (Object.keys(AGENT_CONFIGS) as AgentName[]).find(
      (name) => useStore.getState().agents.get(name)?.installed && useStore.getState().agentStatuses.get(name) !== 'working',
    );

    if (agent) {
      const task = {
        id: `task-${Date.now()}`,
        title: text.substring(0, 50),
        description: text,
        assignedTo: agent,
        status: 'in-progress' as const,
        output: [],
        tokenCount: 0,
        createdAt: Date.now(),
      };
      addTask(task);

      // Spawn via Electron or simulate
      if (window.electronAPI) {
        window.electronAPI.spawnAgent(agent, text, process.cwd?.() ?? '.');
      } else {
        // Demo mode: simulate agent working
        simulateAgentWork(agent, task.id, text);
      }
    }
  }, [addMessage, addTask]);

  const isWidget = appMode === 'widget';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={sceneRef} style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
      }} />

      {!isWidget && (
        <>
          <AgentBar />
          <ChatPanel onSendMessage={handleSendMessage} />
          <TaskBoard />
          <LogPanel />

          {/* Bottom controls */}
          <div style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            display: 'flex',
            gap: 8,
            zIndex: 100,
          }}>
            <ControlButton label="Tasks" onClick={toggleTaskBoard} />
            <ControlButton label="Logs" onClick={toggleLogs} />
          </div>
        </>
      )}
    </div>
  );
};

const ControlButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button onClick={onClick} style={{
    padding: '6px 14px',
    borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(20, 20, 35, 0.8)',
    color: '#ccc',
    fontSize: 12,
    cursor: 'pointer',
    backdropFilter: 'blur(4px)',
  }}>
    {label}
  </button>
);

function simulateAgentWork(agentName: AgentName, taskId: string, prompt: string) {
  eventBus.emit('agent:spawned', {
    type: 'spawned',
    agentName,
    taskId,
    timestamp: Date.now(),
  });

  const responses = [
    'Analyzing the codebase...',
    'Reading relevant files...',
    'Planning implementation approach...',
    'Writing code changes...',
    'Running tests to verify...',
    `Done! Completed: ${prompt.substring(0, 40)}`,
  ];

  responses.forEach((text, i) => {
    setTimeout(() => {
      eventBus.emit('agent:output', {
        type: 'output',
        agentName,
        taskId,
        data: text,
        timestamp: Date.now(),
      });

      if (i === responses.length - 1) {
        setTimeout(() => {
          eventBus.emit('agent:complete', {
            type: 'complete',
            agentName,
            taskId,
            data: `Task completed: ${prompt.substring(0, 60)}`,
            timestamp: Date.now(),
          });
        }, 2000);
      }
    }, (i + 1) * 3000);
  });
}
