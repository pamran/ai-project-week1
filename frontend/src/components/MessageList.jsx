import React, { useEffect, useRef } from 'react';

function MessageList({ messages, llmId }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="message-list empty">
        <p>No messages yet. Start the conversation to begin!</p>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((msg, index) => {
        const isSystem = msg.llmId === 'system';
        const isOwnMessage = msg.llmId === llmId;
        const isUserMessage = msg.role === 'user';

        return (
          <div
            key={index}
            className={`message ${isSystem ? 'system' : ''} ${isOwnMessage ? 'own' : 'other'} ${isUserMessage ? 'user' : 'assistant'}`}
          >
            <div className="message-header">
              <span className="message-role">
                {isSystem
                  ? 'System'
                  : isUserMessage
                  ? 'User'
                  : `LLM ${msg.llmId === 'llm1' ? '1' : '2'}`}
              </span>
              {msg.timestamp && (
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>
            <div className="message-content">{msg.content}</div>
            {msg.model && (
              <div className="message-meta">
                Model: {msg.model}
                {msg.usage && (
                  <span>
                    {' '}
                    (Tokens: {msg.usage.total_tokens || 'N/A'})
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;

