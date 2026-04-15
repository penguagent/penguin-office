import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { AgentName } from '../../shared/types';
import { AGENT_CONFIGS } from '../../shared/constants';

interface ChatPanelProps {
  onSendMessage: (text: string, targetAgent?: AgentName) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ onSendMessage }) => {
  const { messages } = useStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Parse @mentions
    const mentionMatch = input.match(/^@(\w+)\s+(.+)$/);
    let targetAgent: AgentName | undefined;
    let messageText = input;

    if (mentionMatch) {
      const agentName = mentionMatch[1]!.toLowerCase() as AgentName;
      if (agentName in AGENT_CONFIGS) {
        targetAgent = agentName;
        messageText = mentionMatch[2]!;
      }
    }

    onSendMessage(messageText, targetAgent);
    setInput('');
  };

  return (
    <div style={{
      position: 'absolute',
      right: 0,
      top: 48,
      bottom: 0,
      width: 360,
      background: 'rgba(20, 20, 35, 0.95)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid rgba(255,255,255,0.1)',
      zIndex: 100,
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        fontWeight: 600,
        fontSize: 14,
      }}>
        Chat
      </div>

      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const agentConfig = !isUser ? AGENT_CONFIGS[msg.sender as AgentName] : null;
          return (
            <div key={msg.id} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: isUser ? 'flex-end' : 'flex-start',
            }}>
              <span style={{
                fontSize: 11,
                color: agentConfig?.colorAccent ?? '#888',
                marginBottom: 2,
                fontWeight: 600,
              }}>
                {isUser ? 'You' : agentConfig?.displayName ?? msg.sender}
              </span>
              <div style={{
                background: isUser ? 'rgba(52, 152, 219, 0.3)' : 'rgba(255,255,255,0.08)',
                padding: '8px 12px',
                borderRadius: 12,
                fontSize: 13,
                maxWidth: '90%',
                lineHeight: 1.4,
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
              }}>
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} style={{
        padding: 12,
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{
          display: 'flex',
          gap: 8,
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="@claude fix the auth module..."
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              fontSize: 13,
              outline: 'none',
            }}
          />
          <button type="submit" style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: 'none',
            background: '#3498db',
            color: '#fff',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}>
            Send
          </button>
        </div>
        <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
          Use @agent to direct a specific penguin
        </div>
      </form>
    </div>
  );
};
