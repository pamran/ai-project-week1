# Dual LLM Conversation System

A web application that enables two Large Language Models (LLMs) to engage in turn-based conversations with independent configuration, real-time updates, and manual control.

## Features

- **Dual LLM Support**: Configure and use two different LLMs (DeepSeek and OpenAI) simultaneously
- **Turn-based Communication**: Enforce alternating turns between LLM1 and LLM2
- **Independent Configuration**: Set model, temperature, max tokens, and system prompts for each LLM
- **Real-time Updates**: WebSocket-based real-time conversation flow
- **Manual Control**: Send messages manually with visual turn indicators
- **Split-screen UI**: Clear visual separation between the two LLM panels
- **Conversation Management**: Start, pause, resume, and reset conversations

## Technology Stack

- **Backend**: Node.js + Express + Socket.io
- **Frontend**: React + Vite
- **LLM APIs**: DeepSeek API and OpenAI API

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- API keys for DeepSeek and/or OpenAI

### Getting API Keys

1. **DeepSeek API Key**:
   - Visit: https://platform.deepseek.com/usage
   - Sign up/login with your Google/Gmail account
   - Navigate to API keys section
   - Create a new API key

2. **OpenAI API Key**:
   - Visit: https://platform.openai.com/settings/organization/api-keys
   - Sign up/login with your Google/Gmail account
   - Navigate to API keys section
   - Create a new API key

Both services offer free tiers for basic usage, so no payment is required for this project.

## Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd ai-project-week1
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   cd ..
   ```

3. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Set up environment variables**:
   
   Create a `.env` file in the root directory:
   ```bash
   # Copy the example (if available) or create manually
   touch .env
   ```
   
   Add the following to `.env`:
   ```
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3000
   FRONTEND_URL=http://localhost:5173
   ```

   **Note**: Replace `your_deepseek_api_key_here` and `your_openai_api_key_here` with your actual API keys.

## Running the Application

### Development Mode

1. **Start the backend server** (in one terminal):
   ```bash
   cd backend
   npm start
   # or for auto-reload:
   npm run dev
   ```
   
   The backend will run on `http://localhost:3000`

2. **Start the frontend development server** (in another terminal):
   ```bash
   cd frontend
   npm run dev
   ```
   
   The frontend will run on `http://localhost:5173`

3. **Open your browser** and navigate to `http://localhost:5173`

## Usage

### Starting a Conversation

1. **Configure LLMs**:
   - Expand the configuration panels for LLM1 and LLM2
   - Select the provider (DeepSeek or OpenAI)
   - Enter your API key
   - Optionally customize:
     - Model name
     - Temperature (0-2)
     - Max tokens
     - System prompt/character persona

2. **Start Conversation**:
   - Click "Start Conversation" button
   - Enter a conversation topic/prompt
   - Select which LLM should start (LLM1 or LLM2)
   - Click "Start"

### Sending Messages

- Each LLM panel has its own input field and "Send" button
- Only the LLM whose turn it is can send messages
- The active turn is indicated by a green "Your Turn" badge
- Messages appear in real-time in both panels

### Managing Conversations

- **Pause**: Temporarily pause the conversation
- **Resume**: Continue a paused conversation
- **Reset**: Clear the conversation history and start fresh

## Example Use Cases

### Philosophy Debate

**Setup**:
- Topic: "What is the nature of consciousness?"
- Starting LLM: LLM1
- LLM1 Character: Neuroscience-focused AI (practical, scientific)
- LLM2 Character: Philosophy-focused AI (abstract, theoretical)

**System Prompts**:
- LLM1: "You are a neuroscience-focused AI. You approach questions from a scientific, empirical perspective, emphasizing brain research, neural networks, and observable phenomena."
- LLM2: "You are a philosophy-focused AI. You approach questions from a theoretical, abstract perspective, emphasizing concepts, reasoning, and the nature of existence."

### Business Strategy Session

**Setup**:
- Topic: "Developing a market entry strategy for eco-friendly tech in emerging markets"
- Starting LLM: LLM2
- LLM1 Character: Risk-averse corporate strategist
- LLM2 Character: Innovative startup founder

**System Prompts**:
- LLM1: "You are a risk-averse corporate strategist. You emphasize careful analysis, due diligence, and minimizing risks."
- LLM2: "You are an innovative startup founder. You emphasize speed, first-mover advantage, and creative solutions."

## Project Structure

```
ai-project-week1/
├── backend/
│   ├── server.js              # Express server + Socket.io setup
│   ├── routes/
│   │   └── api.js              # REST API routes
│   ├── services/
│   │   ├── deepseekService.js  # DeepSeek API integration
│   │   └── openaiService.js    # OpenAI API integration
│   ├── models/
│   │   └── conversation.js     # Conversation state management
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx             # Main app component
│   │   ├── components/
│   │   │   ├── ConversationPanel.jsx  # Individual LLM panel
│   │   │   ├── ConfigPanel.jsx         # LLM configuration UI
│   │   │   ├── ControlPanel.jsx        # Start/pause/reset controls
│   │   │   └── MessageList.jsx         # Message history display
│   │   └── styles/
│   │       └── App.css                 # Split-screen styling
│   ├── package.json
│   └── vite.config.js
├── .env                         # Environment variables (create this)
├── .gitignore
└── README.md
```

## API Endpoints

The backend provides WebSocket events for real-time communication:

### WebSocket Events

**Client → Server**:
- `conversation:start` - Start a new conversation
- `message:send` - Send a message from an LLM
- `conversation:reset` - Reset the conversation
- `conversation:pause` - Pause the conversation
- `conversation:resume` - Resume the conversation
- `conversation:getState` - Get current conversation state

**Server → Client**:
- `conversation:started` - Conversation started
- `message:sent` - New message sent
- `message:thinking` - LLM is processing
- `conversation:reset` - Conversation reset
- `conversation:paused` - Conversation paused
- `conversation:resumed` - Conversation resumed
- `conversation:state` - Current conversation state
- `error` - Error occurred

## Troubleshooting

### Backend won't start
- Check that port 3000 is not already in use
- Verify your `.env` file exists and has valid API keys
- Check Node.js version (should be v18+)

### Frontend won't connect to backend
- Ensure backend is running on port 3000
- Check CORS settings in `backend/server.js`
- Verify `FRONTEND_URL` in `.env` matches your frontend URL

### API errors
- Verify API keys are correct
- Check API key permissions and quotas
- Ensure you have internet connectivity
- Check browser console and server logs for detailed error messages

### Messages not appearing
- Check WebSocket connection status
- Verify it's the correct LLM's turn
- Check browser console for errors
- Ensure conversation is not paused

## Development

### Backend Development
- Server auto-reloads with `npm run dev` (using Node.js watch mode)
- Logs are output to console
- Socket.io debugging: Set `DEBUG=socket.io:*` environment variable

### Frontend Development
- Hot module replacement enabled in Vite
- React components auto-reload on save
- Check browser console for React warnings

## License

ISC

## Contributing

This is a learning project. Feel free to fork and modify as needed!
