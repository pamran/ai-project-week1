import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import { ConversationManager } from './models/conversation.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

// Initialize conversation manager
const conversationManager = new ConversationManager(io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Handle conversation start
  socket.on('conversation:start', async (data) => {
    try {
      const { topic, startingLLM, llm1Config, llm2Config } = data;
      await conversationManager.startConversation(
        topic,
        startingLLM,
        llm1Config,
        llm2Config
      );
      socket.emit('conversation:started', {
        topic,
        startingLLM,
        history: conversationManager.getHistory()
      });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Handle message send
  socket.on('message:send', async (data) => {
    try {
      const { llmId, message } = data;
      await conversationManager.sendMessage(llmId, message);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Handle conversation reset
  socket.on('conversation:reset', () => {
    conversationManager.reset();
    io.emit('conversation:reset');
  });

  // Handle pause
  socket.on('conversation:pause', () => {
    conversationManager.pause();
    io.emit('conversation:paused');
  });

  // Handle resume
  socket.on('conversation:resume', () => {
    conversationManager.resume();
    io.emit('conversation:resumed');
  });

  // Get current conversation state
  socket.on('conversation:getState', () => {
    socket.emit('conversation:state', {
      isActive: conversationManager.getIsActive(),
      isPaused: conversationManager.getIsPaused(),
      currentTurn: conversationManager.getCurrentTurn(),
      history: conversationManager.getHistory(),
      topic: conversationManager.getTopic()
    });
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

