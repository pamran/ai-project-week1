# Application Flow Documentation

## Complete Application Flow from Beginning to End

This document describes the complete flow of the Dual LLM Conversation System, including all classes, files, and frontend-to-backend communication.

---

## 1. Application Startup Flow

### Backend Startup Sequence

```
1. User runs: python3 backend/app.py
   │
   ├─> backend/app.py (Line 1-15)
   │   ├─> Imports Flask, SocketIO, CORS
   │   ├─> Imports services: DeepSeekService, OpenAIService
   │   ├─> Imports models: ConversationManager
   │   ├─> Loads .env file (dotenv)
   │   ├─> Creates Flask app instance
   │   ├─> Configures CORS
   │   └─> Creates SocketIO instance
   │
   ├─> backend/models/conversation.py
   │   └─> ConversationManager.__init__(socketio)
   │       └─> Initializes empty conversation state
   │
   └─> backend/app.py (Line 94-96)
       └─> socketio.run(app, host='0.0.0.0', port=3000)
           └─> Server starts listening on port 3000
```

### Frontend Startup Sequence

```
1. User opens: http://localhost:5173/index.html
   │
   ├─> frontend/index.html
   │   ├─> Loads styles.css
   │   ├─> Loads Socket.io client from CDN
   │   └─> Loads app.js
   │
   └─> frontend/app.js
       └─> DOMContentLoaded event fires
           └─> initSocket() called
               └─> Creates Socket.io connection to http://localhost:3000
                   └─> Socket connects
                       └─> Emits 'conversation:getState'
```

---

## 2. Initial Connection Flow

### Frontend → Backend Connection

```
frontend/app.js (Line 35-42)
│
├─> initSocket()
│   └─> socket = io('http://localhost:3000')
│       │
│       └─> Socket.io client connects
│           │
│           └─> backend/app.py (Line 30-32)
│               └─> @socketio.on('connect')
│                   └─> emit('connected', {'message': 'Connected to server'})
│
└─> frontend/app.js (Line 38-41)
    └─> socket.on('connect')
        └─> console.log('Connected to server')
        └─> socket.emit('conversation:getState')
            │
            └─> backend/app.py (Line 82-89)
                └─> @socketio.on('conversation:getState')
                    └─> conversation_manager.get_is_active()
                    └─> conversation_manager.get_is_paused()
                    └─> conversation_manager.get_current_turn()
                    └─> conversation_manager.get_history()
                    └─> conversation_manager.get_topic()
                    └─> emit('conversation:state', {...})
                        │
                        └─> frontend/app.js (Line 108-116)
                            └─> socket.on('conversation:state')
                                └─> Updates conversationState object
                                └─> updateUI() called
```

---

## 3. User Configuration Flow

### User Expands Configuration Panel

```
User clicks "LLM 1 Configuration" header
│
└─> frontend/index.html (Line 40)
    └─> onclick="toggleConfig('llm1')"
        │
        └─> frontend/app.js (Line 150-156)
            └─> toggleConfig('llm1')
                └─> Toggles display of config panel
                └─> Updates expand icon (▶/▼)
```

### User Enters API Key

```
User types in API key field
│
└─> frontend/index.html (Line 50)
    └─> onchange="updateConfig('llm1', 'apiKey', this.value)"
        │
        └─> frontend/app.js (Line 158-165)
            └─> updateConfig('llm1', 'apiKey', value)
                └─> Updates llm1Config.apiKey
                └─> (No backend call - stored in frontend state)
```

---

## 4. Starting a Conversation Flow

### User Clicks "Start Conversation"

```
User clicks "Start Conversation" button
│
└─> frontend/index.html (Line 25)
    └─> onclick="showStartDialog()"
        │
        └─> frontend/app.js (Line 168-170)
            └─> showStartDialog()
                └─> Displays start dialog modal
```

### User Fills Dialog and Clicks "Start"

```
User enters topic and selects starting LLM
│
└─> frontend/index.html (Line 190)
    └─> onclick="startConversation()"
        │
        └─> frontend/app.js (Line 172-195)
            └─> startConversation()
                ├─> Validates topic input
                ├─> Validates API keys are set
                ├─> Gets topic from input field
                ├─> Gets startingLLM from select
                └─> socket.emit('conversation:start', {
                        topic,
                        startingLLM,
                        llm1Config,
                        llm2Config
                    })
                    │
                    └─> backend/app.py (Line 34-48)
                        └─> @socketio.on('conversation:start')
                            └─> Extracts data from request
                            └─> conversation_manager.start_conversation(
                                    topic,
                                    startingLLM,
                                    llm1Config,
                                    llm2Config
                                )
                                │
                                └─> backend/models/conversation.py (Line 18-75)
                                    ├─> Validates inputs
                                    ├─> Creates DeepSeekService or OpenAIService
                                    │   │
                                    │   └─> backend/services/deepseek_service.py
                                    │       └─> DeepSeekService.__init__(api_key)
                                    │   │
                                    │   └─> backend/services/openai_service.py
                                    │       └─> OpenAIService.__init__(api_key)
                                    │
                                    ├─> Sets conversation state
                                    ├─> Adds system message to history
                                    └─> socketio.emit('conversation:started', {...})
                                        │
                                        └─> frontend/app.js (Line 48-56)
                                            └─> socket.on('conversation:started')
                                                ├─> Updates conversationState
                                                └─> updateUI() called
                                                    └─> Updates all UI elements
```

---

## 5. Sending a Message Flow

### User Types Message and Clicks "Send"

```
User types message in LLM 1 input field
│
└─> User presses Enter or clicks "Send" button
    │
    └─> frontend/index.html (Line 130)
        └─> onclick="sendMessage('llm1')"
            │
            └─> frontend/app.js (Line 197-210)
                └─> sendMessage('llm1')
                    ├─> Gets message from input field
                    ├─> Validates message is not empty
                    └─> socket.emit('message:send', {
                            llmId: 'llm1',
                            message: message
                        })
                        │
                        └─> backend/app.py (Line 50-65)
                            └─> @socketio.on('message:send')
                                └─> Extracts llmId and message
                                └─> conversation_manager.send_message(
                                        'llm1',
                                        message
                                    )
                                    │
                                    └─> backend/models/conversation.py (Line 77-150)
                                        ├─> Validates conversation is active
                                        ├─> Validates it's the correct turn
                                        ├─> socketio.emit('message:thinking', {'llmId': 'llm1'})
                                        │   │
                                        │   └─> frontend/app.js (Line 58-62)
                                        │       └─> socket.on('message:thinking')
                                        │           └─> Sets thinking.llm1 = true
                                        │           └─> updateUI() - shows "Thinking..." indicator
                                        │
                                        ├─> Gets appropriate service (llm1_service or llm2_service)
                                        ├─> Builds API messages array
                                        │   ├─> Adds system prompt
                                        │   ├─> Adds conversation history
                                        │   └─> Adds current user message
                                        │
                                        └─> service.generate_response(api_messages, options)
                                            │
                                            ├─> If provider is 'deepseek':
                                            │   └─> backend/services/deepseek_service.py (Line 12-55)
                                            │       └─> DeepSeekService.generate_response()
                                            │           ├─> Makes HTTP POST to DeepSeek API
                                            │           ├─> https://api.deepseek.com/v1/chat/completions
                                            │           └─> Returns response content
                                            │
                                            └─> If provider is 'openai':
                                                └─> backend/services/openai_service.py (Line 12-55)
                                                    └─> OpenAIService.generate_response()
                                                        ├─> Makes HTTP POST to OpenAI API
                                                        ├─> https://api.openai.com/v1/chat/completions
                                                        └─> Returns response content
                                        │
                                        ├─> Adds user message to history
                                        ├─> Adds assistant response to history
                                        ├─> Switches turn (llm1 → llm2 or llm2 → llm1)
                                        └─> socketio.emit('message:sent', {
                                                userMessage: {...},
                                                assistantMessage: {...},
                                                currentTurn: 'llm2',
                                                history: [...]
                                            })
                                            │
                                            └─> frontend/app.js (Line 64-72)
                                                └─> socket.on('message:sent')
                                                    ├─> Updates conversationState.history
                                                    ├─> Updates conversationState.currentTurn
                                                    ├─> Sets thinking flags to false
                                                    └─> updateUI() called
                                                        ├─> updatePanel('llm1')
                                                        ├─> updatePanel('llm2')
                                                        └─> updateMessages('llm1')
                                                            └─> Renders messages in UI
```

---

## 6. Control Functions Flow

### Pause Conversation

```
User clicks "Pause" button
│
└─> frontend/index.html (Line 29)
    └─> onclick="pauseConversation()"
        │
        └─> frontend/app.js (Line 212-216)
            └─> pauseConversation()
                └─> socket.emit('conversation:pause')
                    │
                    └─> backend/app.py (Line 72-75)
                        └─> @socketio.on('conversation:pause')
                            └─> conversation_manager.pause()
                                │
                                └─> backend/models/conversation.py (Line 152-153)
                                    └─> Sets self.is_paused = True
                            └─> socketio.emit('conversation:paused')
                                │
                                └─> frontend/app.js (Line 90-95)
                                    └─> socket.on('conversation:paused')
                                        └─> Updates conversationState.isPaused
                                        └─> updateUI()
```

### Resume Conversation

```
User clicks "Resume" button
│
└─> frontend/index.html (Line 30)
    └─> onclick="resumeConversation()"
        │
        └─> frontend/app.js (Line 218-222)
            └─> resumeConversation()
                └─> socket.emit('conversation:resume')
                    │
                    └─> backend/app.py (Line 77-80)
                        └─> @socketio.on('conversation:resume')
                            └─> conversation_manager.resume()
                                │
                                └─> backend/models/conversation.py (Line 155-156)
                                    └─> Sets self.is_paused = False
                            └─> socketio.emit('conversation:resumed')
                                │
                                └─> frontend/app.js (Line 97-101)
                                    └─> socket.on('conversation:resumed')
                                        └─> Updates conversationState.isPaused
                                        └─> updateUI()
```

### Reset Conversation

```
User clicks "Reset" button
│
└─> frontend/index.html (Line 31)
    └─> onclick="resetConversation()"
        │
        └─> frontend/app.js (Line 224-230)
            └─> resetConversation()
                ├─> Shows confirmation dialog
                └─> socket.emit('conversation:reset')
                    │
                    └─> backend/app.py (Line 67-70)
                        └─> @socketio.on('conversation:reset')
                            └─> conversation_manager.reset()
                                │
                                └─> backend/models/conversation.py (Line 158-168)
                                    └─> Clears all conversation state
                                    └─> Resets all variables to initial state
                            └─> socketio.emit('conversation:reset')
                                │
                                └─> frontend/app.js (Line 74-82)
                                    └─> socket.on('conversation:reset')
                                        └─> Resets conversationState
                                        └─> Resets thinking flags
                                        └─> updateUI()
```

---

## 7. File and Class Dependency Map

### Backend Files

```
backend/
│
├── app.py (Main Flask Application)
│   ├── Imports: Flask, SocketIO, CORS, dotenv
│   ├── Imports: DeepSeekService, OpenAIService
│   ├── Imports: ConversationManager
│   ├── Creates: Flask app instance
│   ├── Creates: SocketIO instance
│   └── Creates: ConversationManager instance
│
├── services/
│   ├── deepseek_service.py
│   │   └── Class: DeepSeekService
│   │       ├── __init__(api_key)
│   │       └── generate_response(messages, options)
│   │           └── Uses: requests library
│   │           └── Calls: https://api.deepseek.com/v1/chat/completions
│   │
│   └── openai_service.py
│       └── Class: OpenAIService
│           ├── __init__(api_key)
│           └── generate_response(messages, options)
│               └── Uses: requests library
│               └── Calls: https://api.openai.com/v1/chat/completions
│
└── models/
    └── conversation.py
        └── Class: ConversationManager
            ├── __init__(socketio)
            ├── start_conversation(topic, starting_llm, llm1_config, llm2_config)
            │   └── Creates: DeepSeekService or OpenAIService instances
            ├── send_message(llm_id, message)
            │   └── Calls: service.generate_response()
            ├── reset()
            ├── pause()
            ├── resume()
            └── Getter methods: get_history(), get_current_turn(), etc.
```

### Frontend Files

```
frontend/
│
├── index.html
│   ├── Loads: styles.css
│   ├── Loads: Socket.io client (CDN)
│   ├── Loads: app.js
│   └── Contains: All HTML structure
│
├── styles.css
│   └── Contains: All CSS styling
│
└── app.js
    ├── Global variables: socket, conversationState, llm1Config, llm2Config
    ├── initSocket() - Initializes Socket.io connection
    ├── Configuration functions:
    │   ├── toggleConfig()
    │   ├── updateConfig()
    │   └── updateTemperature()
    ├── Conversation functions:
    │   ├── showStartDialog()
    │   ├── startConversation()
    │   ├── sendMessage()
    │   ├── pauseConversation()
    │   ├── resumeConversation()
    │   └── resetConversation()
    └── UI functions:
        ├── updateUI()
        ├── updatePanel()
        ├── updateMessages()
        └── Error handling functions
```

---

## 8. Complete Message Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (app.js)                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. User clicks "Send" button                             │  │
│  │    └─> sendMessage('llm1', message)                     │  │
│  │                                                           │  │
│  │ 2. Validates message                                     │  │
│  │                                                           │  │
│  │ 3. socket.emit('message:send', {...})                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (app.py)                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. @socketio.on('message:send')                          │  │
│  │    └─> Extracts llmId and message                         │  │
│  │                                                           │  │
│  │ 2. conversation_manager.send_message()                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              ConversationManager (conversation.py)              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. Validates conversation state                           │  │
│  │                                                           │  │
│  │ 2. Emits 'message:thinking'                              │  │
│  │    └─> Frontend shows "Thinking..." indicator            │  │
│  │                                                           │  │
│  │ 3. Gets service (llm1_service or llm2_service)          │  │
│  │                                                           │  │
│  │ 4. Builds API messages array                              │  │
│  │    ├─> System prompt                                      │  │
│  │    ├─> Conversation history                               │  │
│  │    └─> Current message                                    │  │
│  │                                                           │  │
│  │ 5. service.generate_response()                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│         DeepSeekService / OpenAIService                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. generate_response(messages, options)                  │  │
│  │                                                           │  │
│  │ 2. Makes HTTP POST request                                │  │
│  │    ├─> DeepSeek: api.deepseek.com/v1/chat/completions    │  │
│  │    └─> OpenAI: api.openai.com/v1/chat/completions        │  │
│  │                                                           │  │
│  │ 3. Returns response content                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              ConversationManager (conversation.py)              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. Adds user message to history                           │  │
│  │                                                           │  │
│  │ 2. Adds assistant response to history                     │  │
│  │                                                           │  │
│  │ 3. Switches turn (llm1 ↔ llm2)                          │  │
│  │                                                           │  │
│  │ 4. socketio.emit('message:sent', {...})                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (app.js)                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. socket.on('message:sent')                             │  │
│  │    └─> Updates conversationState                         │  │
│  │                                                           │  │
│  │ 2. updateUI()                                             │  │
│  │    ├─> updatePanel('llm1')                                │  │
│  │    ├─> updatePanel('llm2')                                │  │
│  │    └─> updateMessages('llm1')                             │  │
│  │        └─> Renders messages in HTML                       │  │
│  │                                                           │  │
│  │ 3. User sees message in UI                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. WebSocket Event Flow Summary

### Client → Server Events

| Event | Trigger | Handler | Action |
|-------|---------|---------|--------|
| `connect` | Socket connects | Auto | Emits 'connected' |
| `conversation:start` | User starts conversation | `handle_conversation_start` | Initializes conversation |
| `message:send` | User sends message | `handle_message_send` | Processes message |
| `conversation:reset` | User resets | `handle_conversation_reset` | Clears conversation |
| `conversation:pause` | User pauses | `handle_conversation_pause` | Pauses conversation |
| `conversation:resume` | User resumes | `handle_conversation_resume` | Resumes conversation |
| `conversation:getState` | Client requests state | `handle_get_state` | Returns current state |

### Server → Client Events

| Event | Trigger | Handler | Action |
|-------|---------|---------|--------|
| `connected` | Client connects | Auto | Confirms connection |
| `conversation:started` | Conversation initialized | `socket.on('conversation:started')` | Updates UI |
| `message:thinking` | LLM processing | `socket.on('message:thinking')` | Shows thinking indicator |
| `message:sent` | Message processed | `socket.on('message:sent')` | Updates messages |
| `conversation:reset` | Conversation reset | `socket.on('conversation:reset')` | Clears UI |
| `conversation:paused` | Conversation paused | `socket.on('conversation:paused')` | Updates UI |
| `conversation:resumed` | Conversation resumed | `socket.on('conversation:resumed')` | Updates UI |
| `conversation:state` | State requested | `socket.on('conversation:state')` | Updates UI |
| `error` | Error occurred | `socket.on('error')` | Shows error message |

---

## 10. Key Function Call Chains

### Starting a Conversation

```
User Action
  └─> showStartDialog() [app.js:168]
      └─> startConversation() [app.js:172]
          └─> socket.emit('conversation:start') [app.js:188]
              └─> handle_conversation_start() [app.py:34]
                  └─> conversation_manager.start_conversation() [conversation.py:18]
                      ├─> _create_service('deepseek') [conversation.py:67]
                      │   └─> DeepSeekService(api_key) [deepseek_service.py:8]
                      ├─> _create_service('openai') [conversation.py:67]
                      │   └─> OpenAIService(api_key) [openai_service.py:8]
                      └─> socketio.emit('conversation:started') [conversation.py:73]
                          └─> socket.on('conversation:started') [app.js:48]
                              └─> updateUI() [app.js:234]
```

### Sending a Message

```
User Action
  └─> sendMessage('llm1') [app.js:197]
      └─> socket.emit('message:send') [app.js:207]
          └─> handle_message_send() [app.py:50]
              └─> conversation_manager.send_message() [conversation.py:77]
                  ├─> socketio.emit('message:thinking') [conversation.py:95]
                  │   └─> socket.on('message:thinking') [app.js:58]
                  │       └─> updateUI() [app.js:234]
                  ├─> service.generate_response() [conversation.py:120]
                  │   └─> DeepSeekService.generate_response() [deepseek_service.py:12]
                  │       └─> requests.post(DeepSeek API) [deepseek_service.py:33]
                  ├─> Adds messages to history [conversation.py:125-140]
                  └─> socketio.emit('message:sent') [conversation.py:145]
                      └─> socket.on('message:sent') [app.js:64]
                          └─> updateUI() [app.js:234]
                              ├─> updatePanel('llm1') [app.js:248]
                              ├─> updatePanel('llm2') [app.js:248]
                              └─> updateMessages('llm1') [app.js:260]
```

---

## 11. State Management

### Backend State (ConversationManager)

```python
# Stored in: backend/models/conversation.py

self.history = []              # Message history
self.topic = None              # Conversation topic
self.starting_llm = None       # Which LLM starts
self.current_turn = None       # Current turn (llm1 or llm2)
self.is_active = False         # Is conversation active
self.is_paused = False         # Is conversation paused
self.llm1_config = None        # LLM1 configuration
self.llm2_config = None        # LLM2 configuration
self.llm1_service = None       # LLM1 service instance
self.llm2_service = None       # LLM2 service instance
```

### Frontend State (app.js)

```javascript
// Stored in: frontend/app.js

let socket = null;             // Socket.io connection
let conversationState = {     // Conversation state
    isActive: false,
    isPaused: false,
    currentTurn: null,
    history: [],
    topic: null
};
let llm1Config = {...};        // LLM1 configuration
let llm2Config = {...};        // LLM2 configuration
let thinking = {               // Thinking indicators
    llm1: false,
    llm2: false
};
```

---

## 12. Error Handling Flow

```
Error occurs in backend
  └─> Exception caught in try/except block
      └─> emit('error', {'message': str(e)}) [app.py:65]
          └─> socket.on('error') [app.js:103]
              └─> showError(message) [app.js:355]
                  └─> Displays error banner in UI
```

---

## Summary

This application follows a **client-server architecture** with **real-time WebSocket communication**:

1. **Frontend** (Vanilla JavaScript) handles UI and user interactions
2. **Backend** (Python/Flask) handles business logic and API calls
3. **WebSocket** (Socket.io) enables real-time bidirectional communication
4. **Services** (DeepSeek/OpenAI) handle LLM API integration
5. **Models** (ConversationManager) manage conversation state and flow

All communication is **event-driven** through WebSocket events, ensuring real-time updates without page refreshes.

