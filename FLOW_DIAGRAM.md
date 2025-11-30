# Application Flow - Visual Summary

## Quick Reference: Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        APPLICATION STARTUP                          │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
            ┌───────▼────────┐              ┌──────▼────────┐
            │  BACKEND       │              │  FRONTEND     │
            │  (Python)      │              │  (JavaScript) │
            └───────┬────────┘              └──────┬────────┘
                    │                               │
    ┌───────────────┼───────────────┐               │
    │               │               │               │
┌───▼───┐    ┌─────▼─────┐  ┌─────▼─────┐        │
│app.py │    │services/   │  │models/    │        │
│       │    │            │  │           │        │
│Flask  │───▶│deepseek_   │  │conversation│       │
│Server │    │service.py  │  │.py        │        │
│       │    │            │  │           │        │
│Socket │    │openai_     │  │Conversation│       │
│IO     │    │service.py  │  │Manager    │        │
└───┬───┘    └────────────┘  └─────┬─────┘        │
    │                               │               │
    └───────────────┬───────────────┘               │
                    │                               │
            ┌───────▼───────────────────────────────▼───────┐
            │         WebSocket Connection                  │
            │         (Socket.io)                          │
            └──────────────────────────────────────────────┘
```

---

## 1. STARTUP FLOW

```
BACKEND STARTUP:
python3 backend/app.py
    │
    ├─> Load .env file
    ├─> Create Flask app
    ├─> Create SocketIO instance
    ├─> Import ConversationManager
    │   └─> Create instance
    │       ├─> Import DeepSeekService
    │       └─> Import OpenAIService
    └─> Start server on port 3000

FRONTEND STARTUP:
Browser loads index.html
    │
    ├─> Load styles.css
    ├─> Load Socket.io client (CDN)
    └─> Load app.js
        └─> initSocket()
            └─> Connect to http://localhost:3000
```

---

## 2. CONFIGURATION FLOW

```
USER ACTION: Click "LLM 1 Configuration"
    │
    └─> frontend/app.js: toggleConfig('llm1')
        └─> Toggle panel visibility (no backend call)

USER ACTION: Enter API Key
    │
    └─> frontend/app.js: updateConfig('llm1', 'apiKey', value)
        └─> Update llm1Config object (stored in frontend only)
```

---

## 3. START CONVERSATION FLOW

```
USER ACTION: Click "Start Conversation"
    │
    └─> frontend/app.js: showStartDialog()
        └─> Display modal dialog

USER ACTION: Fill form and click "Start"
    │
    └─> frontend/app.js: startConversation()
        │
        ├─> Validate inputs
        └─> socket.emit('conversation:start', {
                topic, startingLLM, llm1Config, llm2Config
            })
            │
            └─> backend/app.py: @socketio.on('conversation:start')
                │
                └─> conversation_manager.start_conversation(...)
                    │
                    ├─> Validate all inputs
                    ├─> Create DeepSeekService(api_key)
                    │   └─> backend/services/deepseek_service.py
                    ├─> Create OpenAIService(api_key)
                    │   └─> backend/services/openai_service.py
                    ├─> Initialize conversation state
                    └─> socketio.emit('conversation:started', {...})
                        │
                        └─> frontend/app.js: socket.on('conversation:started')
                            └─> updateUI()
                                └─> Enable input fields, show topic
```

---

## 4. SEND MESSAGE FLOW (Complete)

```
USER ACTION: Type message and click "Send"
    │
    └─> frontend/app.js: sendMessage('llm1')
        │
        ├─> Get message from input field
        └─> socket.emit('message:send', {llmId: 'llm1', message})
            │
            └─> backend/app.py: @socketio.on('message:send')
                │
                └─> conversation_manager.send_message('llm1', message)
                    │
                    ├─> Validate conversation is active
                    ├─> Validate it's LLM1's turn
                    │
                    ├─> socketio.emit('message:thinking', {llmId: 'llm1'})
                    │   │
                    │   └─> frontend/app.js: socket.on('message:thinking')
                    │       └─> Show "Thinking..." indicator
                    │
                    ├─> Get llm1_service
                    ├─> Build API messages array:
                    │   ├─> System prompt
                    │   ├─> Conversation history
                    │   └─> Current user message
                    │
                    └─> llm1_service.generate_response(messages, options)
                        │
                        └─> backend/services/deepseek_service.py
                            │
                            ├─> DeepSeekService.generate_response()
                            │   ├─> Prepare HTTP request
                            │   ├─> POST to api.deepseek.com/v1/chat/completions
                            │   ├─> Wait for response
                            │   └─> Return response content
                            │
                            └─> Return to conversation_manager
                                │
                                ├─> Add user message to history
                                ├─> Add assistant response to history
                                ├─> Switch turn: llm1 → llm2
                                │
                                └─> socketio.emit('message:sent', {
                                        userMessage: {...},
                                        assistantMessage: {...},
                                        currentTurn: 'llm2',
                                        history: [...]
                                    })
                                    │
                                    └─> frontend/app.js: socket.on('message:sent')
                                        │
                                        ├─> Update conversationState
                                        └─> updateUI()
                                            ├─> updatePanel('llm1')
                                            ├─> updatePanel('llm2')
                                            └─> updateMessages('llm1')
                                                └─> Render messages in HTML
```

---

## 5. FILE CALL HIERARCHY

### Starting Conversation

```
app.js (startConversation)
    └─> socket.emit('conversation:start')
        └─> app.py (handle_conversation_start)
            └─> conversation.py (start_conversation)
                ├─> deepseek_service.py (DeepSeekService.__init__)
                └─> openai_service.py (OpenAIService.__init__)
```

### Sending Message

```
app.js (sendMessage)
    └─> socket.emit('message:send')
        └─> app.py (handle_message_send)
            └─> conversation.py (send_message)
                └─> deepseek_service.py (generate_response)
                    └─> HTTP POST to DeepSeek API
                        └─> Returns response
                            └─> conversation.py (adds to history)
                                └─> socketio.emit('message:sent')
                                    └─> app.js (socket.on('message:sent'))
                                        └─> updateUI()
```

---

## 6. CLASS AND METHOD CALLS

### ConversationManager Class

```python
# File: backend/models/conversation.py

ConversationManager
├── __init__(socketio)
│   └─> Initializes all state variables
│
├── start_conversation(topic, starting_llm, llm1_config, llm2_config)
│   ├─> Validates inputs
│   ├─> _create_service('deepseek', api_key)
│   │   └─> DeepSeekService(api_key)
│   ├─> _create_service('openai', api_key)
│   │   └─> OpenAIService(api_key)
│   └─> socketio.emit('conversation:started')
│
├── send_message(llm_id, message)
│   ├─> Validates state
│   ├─> socketio.emit('message:thinking')
│   ├─> Gets service (llm1_service or llm2_service)
│   ├─> service.generate_response(messages, options)
│   ├─> Adds messages to history
│   └─> socketio.emit('message:sent')
│
├── reset()
├── pause()
├── resume()
└── Getter methods (get_history, get_current_turn, etc.)
```

### Service Classes

```python
# File: backend/services/deepseek_service.py

DeepSeekService
├── __init__(api_key)
│   └─> Stores API key
│
└── generate_response(messages, options)
    ├─> Prepares HTTP request
    ├─> POST to DeepSeek API
    └─> Returns response content

# File: backend/services/openai_service.py

OpenAIService
├── __init__(api_key)
│   └─> Stores API key
│
└── generate_response(messages, options)
    ├─> Prepares HTTP request
    ├─> POST to OpenAI API
    └─> Returns response content
```

### Frontend Functions

```javascript
// File: frontend/app.js

Global Functions:
├── initSocket()
│   └─> Creates Socket.io connection
│       └─> Sets up all event listeners
│
├── Configuration Functions:
│   ├── toggleConfig(llmId)
│   ├── updateConfig(llmId, key, value)
│   └── updateTemperature(llmId, value)
│
├── Conversation Functions:
│   ├── showStartDialog()
│   ├── startConversation()
│   ├── sendMessage(llmId)
│   ├── pauseConversation()
│   ├── resumeConversation()
│   └── resetConversation()
│
└── UI Functions:
    ├── updateUI()
    ├── updatePanel(llmId)
    ├── updateMessages(llmId)
    └── Error handling functions
```

---

## 7. DATA FLOW

```
┌─────────────────────────────────────────────────────────┐
│                    DATA FLOW                            │
└─────────────────────────────────────────────────────────┘

USER INPUT (Frontend)
    │
    ├─> Configuration Data
    │   └─> Stored in: llm1Config, llm2Config (JavaScript objects)
    │
    ├─> Conversation Topic
    │   └─> Sent via WebSocket → Stored in: conversation_manager.topic
    │
    └─> Message
        └─> Sent via WebSocket → Processed → Sent to LLM API
            │
            └─> Response from LLM API
                └─> Stored in: conversation_manager.history
                    └─> Sent via WebSocket → Frontend
                        └─> Displayed in UI
```

---

## 8. WEB SOCKET EVENT FLOW

```
CLIENT (Frontend)                    SERVER (Backend)
     │                                      │
     │  connect                             │
     ├─────────────────────────────────────>│
     │                                      │  handle_connect()
     │                                      │  emit('connected')
     │  connected                           │
     │<─────────────────────────────────────┤
     │                                      │
     │  conversation:getState              │
     │─────────────────────────────────────>│
     │                                      │  handle_get_state()
     │                                      │  emit('conversation:state')
     │  conversation:state                 │
     │<─────────────────────────────────────┤
     │                                      │
     │  conversation:start                 │
     │─────────────────────────────────────>│
     │                                      │  handle_conversation_start()
     │                                      │  conversation_manager.start_conversation()
     │                                      │  emit('conversation:started')
     │  conversation:started                │
     │<─────────────────────────────────────┤
     │                                      │
     │  message:send                        │
     │─────────────────────────────────────>│
     │                                      │  handle_message_send()
     │                                      │  conversation_manager.send_message()
     │                                      │  emit('message:thinking')
     │  message:thinking                    │
     │<─────────────────────────────────────┤
     │                                      │  [LLM API Call]
     │                                      │  emit('message:sent')
     │  message:sent                        │
     │<─────────────────────────────────────┤
```

---

## Summary

**Key Points:**

1. **Frontend** handles all UI and user interactions
2. **Backend** handles business logic and API calls
3. **WebSocket** enables real-time bidirectional communication
4. **Services** handle external LLM API integration
5. **Models** manage conversation state and flow

**Communication Pattern:**
- Frontend → Backend: WebSocket events (socket.emit)
- Backend → Frontend: WebSocket events (socketio.emit)
- Backend → LLM APIs: HTTP POST requests
- All updates are real-time and event-driven

