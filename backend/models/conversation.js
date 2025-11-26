import { DeepSeekService } from '../services/deepseekService.js';
import { OpenAIService } from '../services/openaiService.js';

export class ConversationManager {
  constructor(io) {
    this.io = io;
    this.history = [];
    this.topic = null;
    this.startingLLM = null;
    this.currentTurn = null;
    this.isActive = false;
    this.isPaused = false;
    this.llm1Config = null;
    this.llm2Config = null;
    this.llm1Service = null;
    this.llm2Service = null;
  }

  async startConversation(topic, startingLLM, llm1Config, llm2Config) {
    // Validation
    if (!topic || !topic.trim()) {
      throw new Error('Topic is required');
    }

    if (!['llm1', 'llm2'].includes(startingLLM)) {
      throw new Error('Starting LLM must be either "llm1" or "llm2"');
    }

    if (!llm1Config || !llm2Config) {
      throw new Error('Both LLM configurations are required');
    }

    if (!llm1Config.apiKey || !llm1Config.apiKey.trim()) {
      throw new Error('LLM1 API key is required');
    }

    if (!llm2Config.apiKey || !llm2Config.apiKey.trim()) {
      throw new Error('LLM2 API key is required');
    }

    if (!['deepseek', 'openai'].includes(llm1Config.provider)) {
      throw new Error('LLM1 provider must be either "deepseek" or "openai"');
    }

    if (!['deepseek', 'openai'].includes(llm2Config.provider)) {
      throw new Error('LLM2 provider must be either "deepseek" or "openai"');
    }

    this.topic = topic.trim();
    this.startingLLM = startingLLM;
    this.currentTurn = startingLLM;
    this.isActive = true;
    this.isPaused = false;
    this.history = [];
    this.llm1Config = llm1Config;
    this.llm2Config = llm2Config;

    // Initialize LLM services
    try {
      this.llm1Service = this._createService(llm1Config.provider, llm1Config.apiKey);
      this.llm2Service = this._createService(llm2Config.provider, llm2Config.apiKey);
    } catch (error) {
      throw new Error(`Failed to initialize LLM services: ${error.message}`);
    }

    // Add initial system messages
    const systemMessage1 = {
      role: 'system',
      content: llm1Config.systemPrompt || 'You are a helpful AI assistant.'
    };
    const systemMessage2 = {
      role: 'system',
      content: llm2Config.systemPrompt || 'You are a helpful AI assistant.'
    };

    // Add topic as first user message
    const topicMessage = {
      role: 'user',
      content: `Topic: ${topic}`
    };

    this.history.push({
      llmId: 'system',
      role: 'system',
      content: `Conversation started. Topic: ${topic}. ${startingLLM} will start.`,
      timestamp: new Date().toISOString()
    });

    // Emit conversation started event
    this.io.emit('conversation:started', {
      topic,
      startingLLM,
      history: this.history
    });
  }

  _createService(provider, apiKey) {
    if (provider === 'deepseek') {
      return new DeepSeekService(apiKey);
    } else if (provider === 'openai') {
      return new OpenAIService(apiKey);
    } else {
      throw new Error(`Unknown provider: ${provider}`);
    }
  }

  async sendMessage(llmId, message) {
    if (!this.isActive) {
      throw new Error('No active conversation. Please start a conversation first.');
    }

    if (this.isPaused) {
      throw new Error('Conversation is paused. Please resume first.');
    }

    if (!['llm1', 'llm2'].includes(llmId)) {
      throw new Error(`Invalid LLM ID: ${llmId}`);
    }

    if (!message || !message.trim()) {
      throw new Error('Message cannot be empty');
    }

    if (llmId !== this.currentTurn) {
      throw new Error(`It's not ${llmId}'s turn. Current turn: ${this.currentTurn}`);
    }

    // Emit thinking state
    this.io.emit('message:thinking', { llmId });

    try {
      // Get the appropriate service and config
      const service = llmId === 'llm1' ? this.llm1Service : this.llm2Service;
      const config = llmId === 'llm1' ? this.llm1Config : this.llm2Config;

      // Build messages array for API
      const apiMessages = [
        {
          role: 'system',
          content: config.systemPrompt || 'You are a helpful AI assistant.'
        }
      ];

      // Add conversation history
      this.history.forEach(msg => {
        if (msg.llmId !== 'system') {
          apiMessages.push({
            role: msg.llmId === llmId ? 'assistant' : 'user',
            content: msg.content
          });
        }
      });

      // Add current message
      apiMessages.push({
        role: 'user',
        content: message
      });

      // Generate response
      const response = await service.generateResponse(apiMessages, {
        temperature: config.temperature || 0.7,
        maxTokens: config.maxTokens || 1000,
        model: config.model
      });

      // Add message to history
      const userMessage = {
        llmId,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };

      const assistantMessage = {
        llmId,
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        model: response.model,
        usage: response.usage
      };

      this.history.push(userMessage, assistantMessage);

      // Switch turn
      this.currentTurn = llmId === 'llm1' ? 'llm2' : 'llm1';

      // Emit message sent event
      this.io.emit('message:sent', {
        userMessage,
        assistantMessage,
        currentTurn: this.currentTurn,
        history: this.history
      });
    } catch (error) {
      this.io.emit('error', {
        llmId,
        message: error.message
      });
      throw error;
    }
  }

  reset() {
    this.history = [];
    this.topic = null;
    this.startingLLM = null;
    this.currentTurn = null;
    this.isActive = false;
    this.isPaused = false;
    this.llm1Config = null;
    this.llm2Config = null;
    this.llm1Service = null;
    this.llm2Service = null;
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  getHistory() {
    return this.history;
  }

  getCurrentTurn() {
    return this.currentTurn;
  }

  getTopic() {
    return this.topic;
  }

  getIsActive() {
    return this.isActive;
  }

  getIsPaused() {
    return this.isPaused;
  }
}

