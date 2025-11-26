import React, { useState, useRef, useEffect } from 'react';
import MessageList from './MessageList';

function ConversationPanel({
  llmId,
  title,
  config,
  history,
  currentTurn,
  isThinking,
  isActive,
  isPaused,
  onSendMessage
}) {
  const [message, setMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef(null);

  const canSend = isActive && 
                  !isPaused && 
                  currentTurn === llmId && 
                  message.trim() && 
                  !isThinking;

  const handleSend = () => {
    if (canSend) {
      onSendMessage(llmId, message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredHistory = history.filter(msg => msg.llmId === llmId || msg.llmId === 'system');

  return (
    <div className={`conversation-panel ${currentTurn === llmId ? 'active-turn' : ''}`}>
      <div className="panel-header">
        <h2>{title}</h2>
        <div className="panel-status">
          {isThinking && <span className="thinking-indicator">Thinking...</span>}
          {currentTurn === llmId && isActive && !isPaused && (
            <span className="turn-indicator">Your Turn</span>
          )}
          {isPaused && <span className="paused-indicator">Paused</span>}
          {config.provider && (
            <span className="provider-badge">{config.provider}</span>
          )}
        </div>
      </div>

      <div className={`panel-content ${isExpanded ? 'expanded' : ''}`}>
        <MessageList messages={filteredHistory} llmId={llmId} />
      </div>

      <div className="panel-footer">
        <div className="input-container">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              !isActive
                ? 'Start a conversation to begin...'
                : currentTurn !== llmId
                ? `Waiting for ${currentTurn === 'llm1' ? 'LLM 1' : 'LLM 2'}...`
                : isPaused
                ? 'Conversation is paused...'
                : 'Type your message...'
            }
            disabled={!canSend}
            rows={3}
          />
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="send-button"
          >
            Send
          </button>
        </div>
        <button
          className="expand-button"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
    </div>
  );
}

export default ConversationPanel;

