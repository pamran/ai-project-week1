# LangChain Visual Guide
## Quick Reference: How LangChain Works

---

## 🎯 The Big Picture

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR APPLICATION                          │
│                                                              │
│  ConversationManager                                         │
│  └─> Builds messages: [{'role': 'user', 'content': '...'}] │
│      └─> Calls: service.generate_response(messages)          │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              LANGCHAIN LAYER (Our Services)                  │
│                                                              │
│  DeepSeekService / OpenAIService                             │
│  ├─> Receives: Dict messages                                 │
│  ├─> Converts: Dict → LangChain Messages                     │
│  ├─> Creates: ChatOpenAI instance                           │
│  └─> Calls: llm.invoke(langchain_messages)                  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              LANGCHAIN FRAMEWORK                             │
│                                                              │
│  ChatOpenAI Class                                            │
│  ├─> Formats HTTP request                                    │
│  ├─> Adds authentication                                     │
│  ├─> Makes API call                                          │
│  └─> Parses response                                         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              LLM APIs (External)                             │
│                                                              │
│  DeepSeek API / OpenAI API                                   │
│  └─> Returns JSON response                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Message Transformation Flow

### Step 1: Application Format (Dict)

```python
# What ConversationManager sends
messages = [
    {'role': 'system', 'content': 'You are a helpful AI'},
    {'role': 'user', 'content': 'Hello'},
    {'role': 'assistant', 'content': 'Hi there!'},
    {'role': 'user', 'content': 'What is consciousness?'}
]
```

### Step 2: LangChain Conversion

```python
# What happens in service
langchain_messages = []
for msg in messages:
    if msg['role'] == 'system':
        langchain_messages.append(SystemMessage(content=msg['content']))
    elif msg['role'] == 'user':
        langchain_messages.append(HumanMessage(content=msg['content']))
    elif msg['role'] == 'assistant':
        langchain_messages.append(AIMessage(content=msg['content']))
```

### Step 3: LangChain Format

```python
# Result
[
    SystemMessage(content='You are a helpful AI'),
    HumanMessage(content='Hello'),
    AIMessage(content='Hi there!'),
    HumanMessage(content='What is consciousness?')
]
```

### Step 4: LangChain Invoke

```python
# LangChain makes API call internally
response = llm.invoke(langchain_messages)

# Response object
response.content  # 'Consciousness is...'
response.response_metadata  # {'token_usage': {...}}
```

### Step 5: Extract and Return

```python
# Convert back to dict format
return {
    'content': response.content,
    'model': model,
    'usage': response.response_metadata.get('token_usage', {})
}
```

---

## 📊 Code Flow Diagram

```
User sends message
    │
    ▼
Frontend: socket.emit('message:send')
    │
    ▼
Backend: handle_message_send()
    │
    ▼
ConversationManager.send_message()
    │
    ├─> Builds message array (dict format)
    │   [
    │     {'role': 'system', 'content': '...'},
    │     {'role': 'user', 'content': '...'}
    │   ]
    │
    └─> service.generate_response(messages, options)
        │
        ▼
DeepSeekService.generate_response()
    │
    ├─> Initialize LangChain
    │   llm = ChatOpenAI(
    │       model='deepseek-chat',
    │       openai_api_key=api_key,
    │       openai_api_base='https://api.deepseek.com/v1'
    │   )
    │
    ├─> Convert messages
    │   Dict → LangChain Messages
    │   [
    │     SystemMessage(...),
    │     HumanMessage(...)
    │   ]
    │
    └─> llm.invoke(langchain_messages)
        │
        ├─> LangChain formats request
        ├─> Adds auth headers
        ├─> POST to https://api.deepseek.com/v1/chat/completions
        ├─> Receives JSON response
        └─> Parses to response object
            │
            └─> response.content = '...'
                │
                ▼
Return to ConversationManager
    │
    └─> {'content': '...', 'model': '...', 'usage': {...}}
        │
        ▼
Add to history, emit to frontend
    │
    ▼
Frontend displays message
```

---

## 🔑 Key LangChain Components

### 1. ChatOpenAI

```python
from langchain_openai import ChatOpenAI

# Initialize
llm = ChatOpenAI(
    model='deepseek-chat',              # Model name
    temperature=0.7,                     # Creativity
    max_tokens=1000,                     # Max length
    openai_api_key='your-key',          # API key
    openai_api_base='https://...',      # Endpoint (optional)
    timeout=30                           # Timeout
)
```

**What it does:**
- Abstracts API communication
- Handles authentication
- Formats requests
- Parses responses

### 2. Message Types

```python
from langchain_core.messages import (
    SystemMessage,   # System prompts
    HumanMessage,    # User input
    AIMessage        # LLM responses
)

# Usage
SystemMessage(content='You are a helpful AI')
HumanMessage(content='Hello, how are you?')
AIMessage(content='I am doing well, thank you!')
```

### 3. Invoke Method

```python
# Send messages and get response
response = llm.invoke(langchain_messages)

# Access response
content = response.content
metadata = response.response_metadata
```

---

## 💡 How DeepSeek Works with LangChain

### The Magic: OpenAI-Compatible API

**Key Insight**: DeepSeek uses an OpenAI-compatible API!

```python
# For OpenAI (default endpoint)
llm = ChatOpenAI(
    openai_api_key=api_key
    # Uses: https://api.openai.com/v1
)

# For DeepSeek (custom endpoint)
llm = ChatOpenAI(
    openai_api_key=api_key,
    openai_api_base='https://api.deepseek.com/v1'
    # Uses: https://api.deepseek.com/v1
)
```

**Same code, different endpoint!**

---

## 🎨 Visual: Before vs After LangChain

### Before (Direct HTTP)

```
Application
    │
    ├─> Format JSON manually
    ├─> Add headers manually
    ├─> Make HTTP POST
    ├─> Parse JSON response
    └─> Extract content
```

### After (LangChain)

```
Application
    │
    └─> llm.invoke(messages)
        │
        └─> LangChain handles everything!
```

---

## 📝 Real Example

### Complete Flow

```python
# 1. Application sends messages
messages = [
    {'role': 'system', 'content': 'You are a neuroscience expert'},
    {'role': 'user', 'content': 'What is consciousness?'}
]

# 2. Service converts to LangChain
langchain_messages = [
    SystemMessage(content='You are a neuroscience expert'),
    HumanMessage(content='What is consciousness?')
]

# 3. Initialize LangChain
llm = ChatOpenAI(
    model='deepseek-chat',
    openai_api_key='sk-...',
    openai_api_base='https://api.deepseek.com/v1'
)

# 4. Invoke (LangChain makes API call)
response = llm.invoke(langchain_messages)

# 5. Extract response
content = response.content
# "Consciousness is the state of being aware..."

# 6. Return to application
return {'content': content, ...}
```

---

## 🎯 Summary

**LangChain in 3 Steps:**

1. **Convert**: Dict messages → LangChain messages
2. **Invoke**: `llm.invoke(langchain_messages)`
3. **Extract**: `response.content`

**That's it!** LangChain handles all the HTTP, authentication, and parsing.

---

## 🔍 Where to Look in Code

**DeepSeek Service**: `backend/services/deepseek_service.py`
- Lines 22-29: Initialize ChatOpenAI
- Lines 31-42: Convert messages
- Line 45: Invoke LangChain
- Lines 47-58: Extract response

**OpenAI Service**: `backend/services/openai_service.py`
- Same pattern, no custom base_url

---

**For detailed explanation, see: LANGCHAIN_KT.md**


