<<<<<<< Updated upstream
ai-project-week1
=======
# Dual LLM Conversation System

A web application that enables two Large Language Models (LLMs) to engage in turn-based conversations with independent configuration, real-time updates, and manual control.

**Technology Stack**: Python (Flask + Socket.io) Backend + Vanilla JavaScript Frontend

## Features

- **Dual LLM Support**: Configure and use two different LLMs (DeepSeek and OpenAI) simultaneously
- **Turn-based Communication**: Enforce alternating turns between LLM1 and LLM2
- **Independent Configuration**: Set model, temperature, max tokens, and system prompts for each LLM
- **Real-time Updates**: WebSocket-based real-time conversation flow
- **Manual Control**: Send messages manually with visual turn indicators
- **Split-screen UI**: Clear visual separation between the two LLM panels
- **Conversation Management**: Start, pause, resume, and reset conversations

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
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

1. **Navigate to the project directory**:
   ```bash
   cd ai-project-week1
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install backend dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
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
   SECRET_KEY=your-secret-key-here
   ```

   **Note**: Replace placeholder values with your actual API keys.

## Running the Application

### Start Backend Server

```bash
cd backend
python app.py
```

The backend will run on `http://localhost:3000`

### Start Frontend

Simply open `frontend/index.html` in your web browser, or use a simple HTTP server:

```bash
# Option 1: Python HTTP server
cd frontend
python3 -m http.server 5173

# Option 2: Using Node.js (if installed)
cd frontend
npx http-server -p 5173

# Option 3: Just open index.html directly in browser
# (Note: WebSocket may have CORS issues, use a server for best results)
```

Then open your browser and navigate to: **http://localhost:5173**

## Usage

### Starting a Conversation

1. **Configure LLMs**:
   - Click on "LLM 1 Configuration" header to expand
   - Select provider: **DeepSeek** (or OpenAI)
   - Enter your API key
   - Set model: `deepseek-chat` (or your preferred model)
   - Adjust temperature: 0.7
   - Set max tokens: 1000
   - Add system prompt: "You are a neuroscience-focused AI assistant."
   - Repeat for LLM 2

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
- Press Enter (without Shift) to send a message quickly

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
│   ├── app.py                    # Flask server + Socket.io setup
│   ├── requirements.txt          # Python dependencies
│   ├── services/
│   │   ├── deepseek_service.py  # DeepSeek API integration
│   │   └── openai_service.py    # OpenAI API integration
│   └── models/
│       └── conversation.py       # Conversation state management
├── frontend/
│   ├── index.html               # Main HTML file
│   ├── styles.css               # All CSS styles
│   └── app.js                   # All JavaScript logic
├── .env                         # Environment variables (create this)
├── .env.example                 # Environment variable template
├── .gitignore
└── README.md                    # This file
```

## API Endpoints

The backend provides WebSocket events for real-time communication:

### WebSocket Events

**Client → Server**:
- `conversation:start` - Initialize conversation
- `message:send` - Send message from LLM
- `conversation:reset` - Reset conversation
- `conversation:pause` - Pause conversation
- `conversation:resume` - Resume conversation
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

### REST Endpoints

- `GET /health` - Health check
- `GET /api/health` - API health check

## Troubleshooting

### Backend won't start
- Check that port 3000 is not already in use
- Verify your `.env` file exists and has valid API keys
- Check Python version: `python3 --version` (should be 3.8+)
- Ensure all dependencies are installed: `pip install -r requirements.txt`

### Frontend won't connect to backend
- Ensure backend is running on port 3000
- Check browser console for errors (F12)
- Verify CORS settings in `backend/app.py`
- Use a local HTTP server instead of opening HTML directly

### API errors
- Verify API keys are correct
- Check API key permissions and quotas
- Ensure you have internet connectivity
- Check browser console and server logs for detailed error messages

### Messages not appearing
- Check WebSocket connection in browser DevTools (Network → WS)
- Verify it's the correct LLM's turn
- Check browser console for errors
- Ensure conversation is not paused

## Development

### Backend Development
- Server auto-reloads with `debug=True` in Flask
- Logs are output to console
- Socket.io debugging: Check server console

### Frontend Development
- No build step required - just edit HTML/CSS/JS
- Refresh browser to see changes
- Check browser console for JavaScript errors

## Technology Details

**Backend**:
- Flask: Web framework
- Flask-SocketIO: WebSocket support
- Flask-CORS: Cross-origin requests
- Requests: HTTP client for API calls
- Eventlet: Async networking

**Frontend**:
- Vanilla JavaScript (no frameworks)
- Socket.io-client: WebSocket client
- HTML5 + CSS3
- No build tools required

## License

ISC

## Contributing

This is a learning project. Feel free to fork and modify as needed!
>>>>>>> Stashed changes
