import React from 'react';
import { useStore } from '../store/useStore';
import type { AgentName } from '../../shared/types';
import { AGENT_CONFIGS } from '../../shared/constants';

export const AgentBar: React.FC = () => {
  const { agents, agentStatuses, selectedAgent, setSelectedAgent } = useStore();

  const statusColors: Record<string, string> = {
    idle: '#f1c40f',
    working: '#2ecc71',
    error: '#e74c3c',
    offline: '#95a5a6',
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 48,
      background: 'rgba(20, 20, 35, 0.9)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 8,
      zIndex: 100,
      borderBottom: '1px solid rgba(255,255,255,0.1)',
    }}>
      <span style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginRight: 16 }}>
        PENGUIN OFFICE
      </span>
      {Array.from(agents.entries()).map(([name, config]) => {
        const status = agentStatuses.get(name) ?? (config.installed ? 'idle' : 'offline');
        const isSelected = selectedAgent === name;
        return (
          <button
            key={name}
            onClick={() => setSelectedAgent(isSelected ? null : name)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 20,
              border: isSelected ? `2px solid ${AGENT_CONFIGS[name as AgentName].colorAccent}` : '1px solid rgba(255,255,255,0.15)',
              background: isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
          >
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: statusColors[status],
              display: 'inline-block',
            }} />
            {config.displayName}
          </button>
        );
      })}
      <div style={{ flex: 1 }} />
      <span style={{ fontSize: 11, color: '#888' }}>
        {Array.from(agents.values()).filter(a => a.installed).length} agents online
      </span>
    </div>
  );
};
