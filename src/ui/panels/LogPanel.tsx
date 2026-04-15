import React, { useRef, useEffect, useState } from 'react';
import { useStore } from '../store/useStore';

interface LogEntry {
  timestamp: number;
  agent: string;
  text: string;
}

export const LogPanel: React.FC = () => {
  const { showLogs, toggleLogs } = useStore();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Expose addLog for external use
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__addLog = (agent: string, text: string) => {
      setLogs((prev) => [...prev.slice(-200), { timestamp: Date.now(), agent, text }]);
    };
  }, []);

  if (!showLogs) return null;

  return (
    <div style={{
      position: 'absolute',
      left: 0,
      bottom: 0,
      right: 360,
      height: 200,
      background: 'rgba(10, 10, 20, 0.95)',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      zIndex: 98,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '6px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>Agent Logs</span>
        <button onClick={toggleLogs} style={{
          background: 'none',
          border: 'none',
          color: '#888',
          cursor: 'pointer',
        }}>
          ×
        </button>
      </div>
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '4px 12px',
        fontFamily: 'SF Mono, Menlo, monospace',
        fontSize: 11,
        lineHeight: 1.6,
      }}>
        {logs.map((log, i) => (
          <div key={i} style={{ color: '#999' }}>
            <span style={{ color: '#555' }}>
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>{' '}
            <span style={{ color: '#3498db', fontWeight: 600 }}>[{log.agent}]</span>{' '}
            {log.text}
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};
