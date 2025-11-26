import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import ConversationPanel from './components/ConversationPanel';
import ConfigPanel from './components/ConfigPanel';
import ControlPanel from './components/ControlPanel';
import './styles/App.css';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

function App() {
  const [socket, setSocket] = useState(null);
  const [conversationState, setConversationState] = useState({
    isActive: false,
    isPaused: false,
    currentTurn: null,
    history: [],
    topic: null
  });
  const [llm1Config, setLlm1Config] = useState({
    provider: 'deepseek',
    apiKey: '',
    model: 'deepseek-chat',
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompt: 'You are a helpful AI assistant.'
  });
  const [llm2Config, setLlm2Config] = useState({
    provider: 'openai',
    apiKey: '',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompt: 'You are a helpful AI assistant.'
  });
  const [thinking, setThinking] = useState({ llm1: false, llm2: false });
  const [error, setError] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setError(null);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    newSocket.on('conversation:started', (data) => {
      setConversationState(prev => ({
        ...prev,
        isActive: true,
        isPaused: false,
        currentTurn: data.startingLLM,
        history: data.history,
        topic: data.topic
      }));
      setError(null);
    });

    newSocket.on('message:sent', (data) => {
      setConversationState(prev => ({
        ...prev,
        history: data.history,
        currentTurn: data.currentTurn
      }));
      setThinking({ llm1: false, llm2: false });
      setError(null);
    });

    newSocket.on('message:thinking', (data) => {
      setThinking(prev => ({
        ...prev,
        [data.llmId]: true
      }));
    });

    newSocket.on('conversation:reset', () => {
      setConversationState({
        isActive: false,
        isPaused: false,
        currentTurn: null,
        history: [],
        topic: null
      });
      setThinking({ llm1: false, llm2: false });
      setError(null);
    });

    newSocket.on('conversation:paused', () => {
      setConversationState(prev => ({
        ...prev,
        isPaused: true
      }));
    });

    newSocket.on('conversation:resumed', () => {
      setConversationState(prev => ({
        ...prev,
        isPaused: false
      }));
    });

    newSocket.on('error', (data) => {
      setError(data.message || 'An error occurred');
      setThinking({ llm1: false, llm2: false });
    });

    // Request current state on connection
    newSocket.emit('conversation:getState');

    newSocket.on('conversation:state', (data) => {
      setConversationState({
        isActive: data.isActive,
        isPaused: data.isPaused,
        currentTurn: data.currentTurn,
        history: data.history || [],
        topic: data.topic
      });
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleStartConversation = (topic, startingLLM) => {
    if (!socket) {
      setError('Not connected to server');
      return;
    }

    if (!llm1Config.apiKey || !llm2Config.apiKey) {
      setError('Please configure API keys for both LLMs');
      return;
    }

    socket.emit('conversation:start', {
      topic,
      startingLLM,
      llm1Config,
      llm2Config
    });
  };

  const handleSendMessage = (llmId, message) => {
    if (!socket) {
      setError('Not connected to server');
      return;
    }

    socket.emit('message:send', { llmId, message });
  };

  const handleReset = () => {
    if (socket) {
      socket.emit('conversation:reset');
    }
  };

  const handlePause = () => {
    if (socket) {
      socket.emit('conversation:pause');
    }
  };

  const handleResume = () => {
    if (socket) {
      socket.emit('conversation:resume');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Dual LLM Conversation System</h1>
        {conversationState.topic && (
          <div className="topic-display">
            <strong>Topic:</strong> {conversationState.topic}
          </div>
        )}
      </header>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <ControlPanel
        isActive={conversationState.isActive}
        isPaused={conversationState.isPaused}
        onStart={handleStartConversation}
        onReset={handleReset}
        onPause={handlePause}
        onResume={handleResume}
      />

      <div className="config-section">
        <ConfigPanel
          title="LLM 1 Configuration"
          config={llm1Config}
          onChange={setLlm1Config}
        />
        <ConfigPanel
          title="LLM 2 Configuration"
          config={llm2Config}
          onChange={setLlm2Config}
        />
      </div>

      <div className="conversation-container">
        <ConversationPanel
          llmId="llm1"
          title="LLM 1"
          config={llm1Config}
          history={conversationState.history}
          currentTurn={conversationState.currentTurn}
          isThinking={thinking.llm1}
          isActive={conversationState.isActive}
          isPaused={conversationState.isPaused}
          onSendMessage={handleSendMessage}
        />
        <ConversationPanel
          llmId="llm2"
          title="LLM 2"
          config={llm2Config}
          history={conversationState.history}
          currentTurn={conversationState.currentTurn}
          isThinking={thinking.llm2}
          isActive={conversationState.isActive}
          isPaused={conversationState.isPaused}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}

export default App;

