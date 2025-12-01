# OpenRouter.ai Setup Guide

## ✅ OpenRouter Integration Complete!

The application now uses **OpenRouter.ai** for both DeepSeek and OpenAI models.

---

## 🔑 What Changed

### Services Updated
- **DeepSeekService**: Now uses OpenRouter endpoint
- **OpenAIService**: Now uses OpenRouter endpoint

### Model Names Updated
- **DeepSeek**: `deepseek/deepseek-chat` (OpenRouter format)
- **OpenAI**: `openai/gpt-3.5-turbo` (OpenRouter format)

---

## 📝 How to Use

### 1. Get OpenRouter API Key

1. Visit: https://openrouter.ai/
2. Sign up / Login
3. Go to: https://openrouter.ai/keys
4. Create a new API key
5. Copy the key

### 2. Configure in Application

1. **Start the application**
2. **Expand "LLM 1 Configuration"**
   - **Provider**: DeepSeek (or keep as is)
   - **API Key**: Enter your OpenRouter API key
   - **Model**: `deepseek/deepseek-chat` (already set)
   
3. **Expand "LLM 2 Configuration"**
   - **Provider**: OpenAI (or keep as is)
   - **API Key**: Enter the **same** OpenRouter API key
   - **Model**: `openai/gpt-3.5-turbo` (already set)

### 3. Start Conversation

- Click "Start Conversation"
- Enter topic
- Select starting LLM
- Click "Start"

---

## 🎯 OpenRouter Model Names

### DeepSeek Models
- `deepseek/deepseek-chat` (default)
- `deepseek/deepseek-coder`
- `deepseek/deepseek-chat-32k`

### OpenAI Models
- `openai/gpt-3.5-turbo` (default)
- `openai/gpt-4`
- `openai/gpt-4-turbo`
- `openai/gpt-4o`

### Other Available Models
- `anthropic/claude-3-opus`
- `google/gemini-pro`
- `meta-llama/llama-3-70b-instruct`
- And many more!

**See full list**: https://openrouter.ai/models

---

## 💡 Benefits

1. **Single API Key**: Use one key for all providers
2. **Unified Billing**: One billing account
3. **Easy Switching**: Change models without changing code
4. **No Direct API Keys Needed**: No need for separate DeepSeek/OpenAI keys

---

## 🔧 Technical Details

### Endpoint
- **URL**: `https://openrouter.ai/api/v1`
- **Format**: OpenAI-compatible API
- **Headers**: Includes `HTTP-Referer` and `X-Title` for identification

### Model Format
- **Provider/Model**: `deepseek/deepseek-chat`
- **Format**: `{provider}/{model-name}`

---

## ✅ Verification

After setup:
1. Enter OpenRouter API key in both LLM configs
2. Start a conversation
3. Send a message
4. Should work without billing errors!

---

## 🆘 Troubleshooting

### "Billing error" or "Payment required"
- Check OpenRouter account has credits
- Visit: https://openrouter.ai/activity
- Add credits if needed

### "Invalid model"
- Check model name format: `provider/model-name`
- See available models: https://openrouter.ai/models

### "Authentication error"
- Verify API key is correct
- Check key is active in OpenRouter dashboard

---

**You're all set! Use your OpenRouter API key for both LLMs.**

