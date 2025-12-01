# Logging Guide

## 📋 Overview

The application now has comprehensive logging throughout all components. This will help you debug issues, track API calls, and monitor the application's behavior.

---

## 📁 Log Files Location

All logs are stored in: `backend/logs/`

### Log Files:
- **`app.log`** - All application logs (INFO, DEBUG, WARNING, ERROR, CRITICAL)
- **`errors.log`** - Only ERROR and CRITICAL level logs

### Log Rotation:
- Maximum file size: 10MB per log file
- Backup count: 5 files (keeps 5 rotated backups)
- When a log file reaches 10MB, it's rotated and a new file is created

---

## 📊 Log Levels

### INFO (Default)
- Application startup/shutdown
- Conversation start/end
- Message processing
- API calls
- State changes

### DEBUG
- Detailed API request/response information
- Model configurations
- Message content (truncated for long messages)
- Token usage
- Internal state changes

### WARNING
- Invalid requests
- Validation failures
- Non-critical errors

### ERROR
- API failures
- Authentication errors
- Service initialization failures
- Critical errors with full stack traces

---

## 🔍 What Gets Logged

### 1. Application Startup
```
2025-12-01 08:50:00 | INFO     | Starting Dual LLM Conversation System
2025-12-01 08:50:00 | INFO     | Starting server on port 3000
```

### 2. Client Connections
```
2025-12-01 08:50:05 | INFO     | Client connected: abc123 from 127.0.0.1
2025-12-01 08:50:10 | INFO     | Client disconnected: abc123
```

### 3. Conversation Management
```
2025-12-01 08:50:15 | INFO     | Starting conversation - Topic: 'AI Ethics', Starting LLM: llm1
2025-12-01 08:50:15 | DEBUG    | LLM1 - Provider: deepseek, Model: deepseek/deepseek-chat
2025-12-01 08:50:15 | INFO     | Initializing LLM1 service - Provider: deepseek
2025-12-01 08:50:15 | INFO     | LLM1 service initialized successfully
```

### 4. Message Processing
```
2025-12-01 08:50:20 | INFO     | Message received from llm1 - Length: 45 chars
2025-12-01 08:50:20 | DEBUG    | Message content: What is the nature of consciousness?
2025-12-01 08:50:20 | INFO     | Calling llm1 API (Model: deepseek/deepseek-chat)...
2025-12-01 08:50:25 | INFO     | Received response from llm1 - Length: 234 chars
2025-12-01 08:50:25 | DEBUG    | Token usage: {'prompt_tokens': 50, 'completion_tokens': 184}
```

### 5. API Errors
```
2025-12-01 08:50:30 | ERROR    | OpenRouter API authentication error: Error code: 401
2025-12-01 08:50:30 | ERROR    | Authentication error detected - Check API key
```

---

## 🛠️ How to View Logs

### Real-time Log Monitoring

**View all logs in real-time:**
```bash
tail -f backend/logs/app.log
```

**View only errors:**
```bash
tail -f backend/logs/errors.log
```

**View last 50 lines:**
```bash
tail -n 50 backend/logs/app.log
```

### Search Logs

**Search for specific text:**
```bash
grep "API error" backend/logs/app.log
```

**Search for errors only:**
```bash
grep "ERROR" backend/logs/app.log
```

**Search with context (5 lines before/after):**
```bash
grep -C 5 "authentication" backend/logs/app.log
```

### Filter by Date/Time

**View logs from today:**
```bash
grep "$(date +%Y-%m-%d)" backend/logs/app.log
```

**View logs from specific time:**
```bash
grep "08:50" backend/logs/app.log
```

---

## 🔧 Log Configuration

### Change Log Level

Edit `backend/app.py`:
```python
# Change from INFO to DEBUG for more detailed logs
logger = setup_logger('dual_llm_app', logging.DEBUG)
```

### Log Levels:
- `logging.DEBUG` - Most verbose (includes all DEBUG messages)
- `logging.INFO` - Default (INFO, WARNING, ERROR, CRITICAL)
- `logging.WARNING` - Only warnings and errors
- `logging.ERROR` - Only errors and critical issues

---

## 📝 Log Format

Each log entry includes:
```
TIMESTAMP | LEVEL | LOGGER_NAME | FUNCTION:LINE | MESSAGE
```

Example:
```
2025-12-01 08:50:20 | INFO     | dual_llm_app | handle_message_send:65 | Message received from llm1 - Length: 45 chars
```

---

## 🐛 Debugging with Logs

### Common Issues

#### 1. Authentication Errors (401)
```
ERROR | OpenRouter API authentication error: Error code: 401
ERROR | Authentication error detected - Check API key
```
**Solution:** Check your OpenRouter API key in the configuration

#### 2. Model Name Errors
```
INFO  | Model name auto-corrected: 'deepseek-chat' -> 'deepseek/deepseek-chat'
```
**This is normal** - The system automatically fixes model names

#### 3. API Rate Limits
```
ERROR | OpenRouter API rate limit/quota exceeded
```
**Solution:** Check your OpenRouter account credits

#### 4. Service Initialization Failures
```
ERROR | Failed to initialize LLM services: ...
```
**Check:** API keys, network connectivity, model names

---

## 📊 Log Statistics

### Count Errors
```bash
grep -c "ERROR" backend/logs/app.log
```

### Count API Calls
```bash
grep -c "Calling.*API" backend/logs/app.log
```

### Count Conversations Started
```bash
grep -c "Starting conversation" backend/logs/app.log
```

---

## 🔒 Security Notes

- **API Keys**: Logged with masked format (only last 4 characters shown)
  - Example: `API key: ****************abcd`
- **Message Content**: Full content logged at DEBUG level only
- **Sensitive Data**: Be careful when sharing log files

---

## 📚 Example Log Session

```
2025-12-01 08:50:00 | INFO     | Starting Dual LLM Conversation System
2025-12-01 08:50:00 | INFO     | Starting server on port 3000
2025-12-01 08:50:05 | INFO     | Client connected: abc123 from 127.0.0.1
2025-12-01 08:50:15 | INFO     | Starting conversation - Topic: 'AI Ethics'
2025-12-01 08:50:15 | INFO     | DeepSeekService initialized with API key: ****************abcd
2025-12-01 08:50:15 | INFO     | LLM1 service initialized successfully
2025-12-01 08:50:20 | INFO     | Message received from llm1 - Length: 45 chars
2025-12-01 08:50:20 | INFO     | Calling llm1 API (Model: deepseek/deepseek-chat)...
2025-12-01 08:50:25 | INFO     | Received response from llm1 - Length: 234 chars
2025-12-01 08:50:25 | INFO     | Message processed successfully for llm1
```

---

**Happy Debugging! 🐛**

