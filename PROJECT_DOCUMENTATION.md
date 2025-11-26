# Dual LLM Conversation System - Project Documentation

## Project Overview

This project implements a web application that enables two Large Language Models (LLMs) to engage in turn-based conversations. The system provides independent configuration for each LLM, real-time updates via WebSocket, and a split-screen user interface for monitoring and controlling the conversation flow.

**Project Name**: Dual LLM Conversation System  
**Date Created**: November 2024  
**Technology Stack**: Node.js, Express, Socket.io, React, Vite

---

## What We Built

### Core Features

1. **Dual LLM Support**
   - Two independent LLM instances (LLM1 and LLM2)
   - Support for DeepSeek and OpenAI APIs
   - Independent configuration per LLM

2. **Turn-Based Conversation System**
   - Enforced alternating turns between LLM1 and LLM2
   - Manual message sending with visual turn indicators
   - Conversation history tracking

3. **Real-Time Communication**
   - WebSocket-based real-time updates
   - Live message broadcasting
   - Instant turn switching

4. **Configuration Management**
   - Per-LLM model selection
   - Customizable parameters (temperature, max tokens)
   - System prompts/character personas
   - API key management

5. **User Interface**
   - Split-screen design with clear visual separation
   - Real-time conversation display
   - Visual indicators (thinking, turn, paused)
   - Responsive design

6. **Conversation Controls**
   - Start new conversations
   - Pause/resume functionality
   - Reset conversation
   - Topic/prompt input

---

## Architecture

### System Architecture

```
┌─────────────────┐
│   Web Browser   │
│   (React App)   │
└────────┬────────┘
         │ HTTP/WebSocket
         │
┌────────▼────────┐
│  Express Server │
│   (Node.js)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│DeepSeek│ │OpenAI │
│  API   │ │  API  │
└────────┘ └───────┘
```

### Technology Stack

**Backend:**
- **Node.js** (v18+) - Runtime environment
- **Express** - Web server framework
- **Socket.io** - WebSocket communication
- **Axios** - HTTP client for API calls
- **dotenv** - Environment variable management
- **CORS** - Cross-origin resource sharing

**Frontend:**
- **React** (v18) - UI framework
- **Vite** - Build tool and dev server
- **Socket.io-client** - WebSocket client
- **CSS3** - Styling (no frameworks)

**APIs:**
- **DeepSeek API** - LLM provider
- **OpenAI API** - LLM provider

---

## Project Structure

```
ai-project-week1/
├── backend/                          # Backend server
│   ├── server.js                     # Main Express server + Socket.io
│   ├── routes/
│   │   └── api.js                    # REST API routes
│   ├── services/
│   │   ├── deepseekService.js        # DeepSeek API wrapper
│   │   └── openaiService.js          # OpenAI API wrapper
│   ├── models/
│   │   └── conversation.js           # Conversation state management
│   └── package.json                  # Backend dependencies
│
├── frontend/                         # Frontend React app
│   ├── index.html                    # HTML entry point
│   ├── vite.config.js                # Vite configuration
│   ├── package.json                  # Frontend dependencies
│   ├── public/                       # Static assets
│   └── src/
│       ├── main.jsx                  # React entry point
│       ├── App.jsx                   # Main app component
│       ├── components/
│       │   ├── ConversationPanel.jsx # Individual LLM panel
│       │   ├── ConfigPanel.jsx       # LLM configuration UI
│       │   ├── ControlPanel.jsx      # Start/pause/reset controls
│       │   └── MessageList.jsx       # Message history display
│       └── styles/
│           └── App.css                # Application styles
│
├── .env                              # Environment variables (not in git)
├── .env.example                      # Environment variable template
├── .gitignore                        # Git ignore rules
├── test-backend.mjs                  # Automated backend test script
├── README.md                         # Setup and usage guide
├── TESTING.md                        # Detailed testing guide
├── QUICK_TEST.md                     # Quick testing reference
└── PROJECT_DOCUMENTATION.md          # This file
```

---

## Implementation Details

### Backend Implementation

#### 1. Server Setup (`backend/server.js`)
- Express server on port 3000
- Socket.io WebSocket server
- CORS enabled for frontend communication
- Environment variable configuration
- Health check endpoints

#### 2. LLM Services (`backend/services/`)
- **DeepSeekService**: Wraps DeepSeek API
  - Chat completions endpoint
  - Error handling
  - Response parsing
  
- **OpenAIService**: Wraps OpenAI API
  - Chat completions endpoint
  - Error handling
  - Response parsing

Both services implement a unified interface for easy switching.

#### 3. Conversation Manager (`backend/models/conversation.js`)
- Manages conversation state
- Tracks turn order (LLM1 ↔ LLM2)
- Stores conversation history
- Handles message sending and API calls
- Manages pause/resume/reset functionality
- Validates inputs and configurations

#### 4. WebSocket Events

**Client → Server:**
- `conversation:start` - Initialize new conversation
- `message:send` - Send message from LLM
- `conversation:reset` - Reset conversation
- `conversation:pause` - Pause conversation
- `conversation:resume` - Resume conversation
- `conversation:getState` - Get current state

**Server → Client:**
- `conversation:started` - Conversation initialized
- `message:sent` - New message broadcast
- `message:thinking` - LLM processing indicator
- `conversation:reset` - Conversation cleared
- `conversation:paused` - Conversation paused
- `conversation:resumed` - Conversation resumed
- `conversation:state` - Current state response
- `error` - Error notification

### Frontend Implementation

#### 1. Main App (`frontend/src/App.jsx`)
- Manages global state
- Socket.io connection handling
- Event listeners for WebSocket events
- State management for conversation, configs, and UI

#### 2. Components

**ConversationPanel** (`components/ConversationPanel.jsx`):
- Displays messages for one LLM
- Input field and send button
- Turn indicators
- Thinking status
- Expand/collapse functionality

**ConfigPanel** (`components/ConfigPanel.jsx`):
- Expandable configuration form
- Provider selection (DeepSeek/OpenAI)
- API key input
- Model, temperature, max tokens settings
- System prompt/character configuration

**ControlPanel** (`components/ControlPanel.jsx`):
- Start conversation dialog
- Pause/resume buttons
- Reset button
- Topic input and starting LLM selection

**MessageList** (`components/MessageList.jsx`):
- Scrollable message history
- Message formatting (user/assistant/system)
- Timestamps
- Model and token usage info
- Auto-scroll to latest message

#### 3. Styling (`styles/App.css`)
- Split-screen layout (CSS Grid)
- Responsive design
- Visual indicators (colors, badges, animations)
- Modern UI with gradients and shadows
- Mobile-friendly breakpoints

---

## Key Features Implemented

### 1. Turn-Based Flow
- Enforced alternating turns
- Visual turn indicators
- Disabled input when not active turn
- Automatic turn switching after message

### 2. Real-Time Updates
- WebSocket for instant updates
- No page refresh needed
- Live message broadcasting
- Real-time status updates

### 3. Error Handling
- API error catching and display
- Validation for required fields
- User-friendly error messages
- Network error handling
- Connection status monitoring

### 4. Configuration System
- Per-LLM independent settings
- Provider selection
- Model customization
- Temperature control (0-2)
- Max tokens configuration
- Custom system prompts

### 5. Conversation Management
- Start with topic/prompt
- Pause/resume functionality
- Reset to clear history
- Conversation state persistence
- History tracking

### 6. User Experience
- Clean, modern interface
- Visual feedback (thinking, turn, paused)
- Responsive design
- Intuitive controls
- Error banners
- Loading states

---

## Testing

### Automated Testing

**Backend Test Script** (`test-backend.mjs`):
- Health check endpoint test
- API health endpoint test
- WebSocket connection test
- WebSocket events test

Run with: `node test-backend.mjs`

### Manual Testing

**Browser Testing**:
1. Open http://localhost:5173
2. Configure LLMs with API keys
3. Start conversation
4. Send messages
5. Test controls (pause/resume/reset)

**DevTools Testing**:
- Console: Check for connection messages
- Network: Verify WebSocket connection
- Elements: Inspect UI structure

### Test Results

✅ All backend tests passing  
✅ Frontend loads correctly  
✅ WebSocket connection established  
✅ UI components functional  
✅ Real-time updates working  

---

## Setup and Installation

### Prerequisites
- Node.js v18 or higher
- npm or yarn
- API keys for DeepSeek and/or OpenAI

### Installation Steps

1. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Configure Environment Variables**
   - Create `.env` file in root directory
   - Add API keys:
     ```
     DEEPSEEK_API_KEY=your_key_here
     OPENAI_API_KEY=your_key_here
     PORT=3000
     FRONTEND_URL=http://localhost:5173
     ```

4. **Start Backend Server**
   ```bash
   cd backend
   npm start
   ```

5. **Start Frontend Server**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Open Browser**
   - Navigate to http://localhost:5173

---

## Usage Guide

### Starting a Conversation

1. **Configure LLMs**:
   - Expand "LLM 1 Configuration"
   - Select provider (DeepSeek or OpenAI)
   - Enter API key
   - Customize model, temperature, max tokens
   - Add system prompt/character
   - Repeat for LLM 2

2. **Start Conversation**:
   - Click "Start Conversation"
   - Enter topic/prompt
   - Select starting LLM
   - Click "Start"

3. **Send Messages**:
   - Type message in active LLM panel
   - Click "Send" or press Enter
   - Wait for response
   - Turn automatically switches

### Example Use Cases

**Philosophy Debate**:
- LLM 1: Neuroscience-focused character
- LLM 2: Philosophy-focused character
- Topic: "What is the nature of consciousness?"

**Business Strategy**:
- LLM 1: Risk-averse strategist
- LLM 2: Innovative startup founder
- Topic: "Market entry strategy for eco-friendly tech"

---

## API Integration

### DeepSeek API
- Endpoint: `https://api.deepseek.com/v1/chat/completions`
- Default model: `deepseek-chat`
- Authentication: Bearer token

### OpenAI API
- Endpoint: `https://api.openai.com/v1/chat/completions`
- Default model: `gpt-3.5-turbo`
- Authentication: Bearer token

Both APIs use the same chat completions format, making it easy to switch providers.

---

## File Descriptions

### Backend Files

- **server.js**: Main Express server, Socket.io setup, event handlers
- **deepseekService.js**: DeepSeek API client wrapper
- **openaiService.js**: OpenAI API client wrapper
- **conversation.js**: Conversation state management, turn logic, message handling
- **api.js**: REST API routes (currently minimal, mostly WebSocket)

### Frontend Files

- **App.jsx**: Main React component, state management, Socket.io client
- **ConversationPanel.jsx**: Individual LLM conversation interface
- **ConfigPanel.jsx**: LLM configuration form
- **ControlPanel.jsx**: Conversation controls (start/pause/reset)
- **MessageList.jsx**: Message history display component
- **App.css**: All application styles

---

## Development Decisions

### Why Socket.io?
- Real-time bidirectional communication
- Automatic reconnection
- Room/namespace support (future expansion)
- Cross-browser compatibility

### Why React + Vite?
- Fast development with hot reload
- Component-based architecture
- Modern tooling
- Small bundle size

### Why Split-Screen UI?
- Clear visual separation
- Easy to follow conversation flow
- Both LLMs visible simultaneously
- Better UX for monitoring

### Why Manual Send Buttons?
- User control over conversation pace
- Ability to review before sending
- Prevents runaway conversations
- Better for testing/debugging

---

## Future Enhancements (Potential)

1. **Auto-Response Mode**: Automatic turn-taking without manual send
2. **Conversation Export**: Save conversations to file
3. **Multiple Conversations**: Support for multiple concurrent conversations
4. **User Messages**: Allow human to interject in conversation
5. **Model Comparison**: Side-by-side response comparison
6. **Analytics**: Token usage, response time metrics
7. **Preset Configurations**: Save/load LLM configurations
8. **Dark Mode**: Theme switching
9. **Mobile App**: Native mobile application
10. **More LLM Providers**: Support for Anthropic, Google, etc.

---

## Known Limitations

1. **API Keys**: Must be entered in UI (not from .env for frontend)
2. **Single Conversation**: Only one active conversation at a time
3. **No Persistence**: Conversation history lost on refresh
4. **No User Messages**: Only LLM-to-LLM communication
5. **Manual Control**: Requires clicking send for each message

---

## Troubleshooting

### Common Issues

**Backend won't start**:
- Check port 3000 is available
- Verify .env file exists
- Check Node.js version

**Frontend won't connect**:
- Verify backend is running
- Check CORS settings
- Check browser console

**API errors**:
- Verify API keys are correct
- Check API quotas
- Review error messages in console

**WebSocket issues**:
- Check firewall settings
- Verify ports are accessible
- Check browser console for errors

---

## Project Statistics

- **Total Files Created**: ~20 files
- **Lines of Code**: ~2,000+ lines
- **Components**: 4 React components
- **Backend Services**: 2 API wrappers
- **WebSocket Events**: 10+ events
- **Dependencies**: 15+ npm packages

---

## Conclusion

This project successfully implements a dual LLM conversation system with:
- ✅ Real-time WebSocket communication
- ✅ Independent LLM configuration
- ✅ Turn-based conversation flow
- ✅ Modern, responsive UI
- ✅ Error handling and validation
- ✅ Comprehensive testing

The system is ready for use and can be extended with additional features as needed.

---

## Credits

- **Built with**: Node.js, Express, Socket.io, React, Vite
- **LLM Providers**: DeepSeek, OpenAI
- **Development**: Cursor AI assistance

---

**Last Updated**: November 2024  
**Version**: 1.0.0  
**Status**: Production Ready ✅

