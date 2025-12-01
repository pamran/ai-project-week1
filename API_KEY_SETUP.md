# 🔑 API Key Setup Guide

## Configuration Summary

The application now uses **different API providers** for each LLM:

- **LLM1 (DeepSeek):** Uses **OpenRouter.ai** API
- **LLM2 (OpenAI):** Uses **Direct OpenAI API**

---

## 📋 Step-by-Step Setup

### Step 1: Get OpenRouter API Key (for LLM1 - DeepSeek)

1. **Go to:** https://openrouter.ai/keys
2. **Login** or create account
3. **Generate API key**
4. **Copy the key** - it should start with `sk-or-v1-`

**Example:** `sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Get OpenAI API Key (for LLM2 - OpenAI)

1. **Go to:** https://platform.openai.com/api-keys
2. **Login** to your OpenAI account
3. **Create new secret key**
4. **Copy the key** - it should start with `sk-` (NOT `sk-or-v1-`)

**Example:** `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**Important:** This is different from OpenRouter! This is the direct OpenAI key.

### Step 3: Configure in Application

1. **Open:** http://localhost:5173

2. **LLM 1 Configuration (DeepSeek):**
   - Expand "LLM 1 Configuration"
   - **API Key:** Paste your **OpenRouter** key (`sk-or-v1-...`)
   - **Model:** `deepseek/deepseek-chat` (OpenRouter format)
   - **Provider:** deepseek

3. **LLM 2 Configuration (OpenAI):**
   - Expand "LLM 2 Configuration"
   - **API Key:** Paste your **OpenAI** key (`sk-...` from platform.openai.com)
   - **Model:** `gpt-3.5-turbo` (direct OpenAI format, no prefix)
   - **Provider:** openai

---

## ✅ Quick Reference

| LLM | Provider | API Source | Key Format | Model Format |
|-----|----------|------------|------------|--------------|
| LLM1 | DeepSeek | OpenRouter | `sk-or-v1-...` | `deepseek/deepseek-chat` |
| LLM2 | OpenAI | Direct OpenAI | `sk-...` | `gpt-3.5-turbo` |

---

## 🔍 How to Verify

### Check LLM1 (DeepSeek) Key:
- Should start with: `sk-or-v1-`
- Should be 30+ characters
- From: https://openrouter.ai/keys

### Check LLM2 (OpenAI) Key:
- Should start with: `sk-` (NOT `sk-or-v1-`)
- Should be 30+ characters
- From: https://platform.openai.com/api-keys

---

## ⚠️ Common Mistakes

### ❌ Wrong: Using OpenAI Key for LLM1
```
LLM1 API Key: sk-... (from OpenAI)
❌ This won't work! LLM1 needs OpenRouter key.
```

### ❌ Wrong: Using OpenRouter Key for LLM2
```
LLM2 API Key: sk-or-v1-... (from OpenRouter)
❌ This won't work! LLM2 needs direct OpenAI key.
```

### ✅ Correct Configuration:
```
LLM1 API Key: sk-or-v1-... (from OpenRouter)
LLM2 API Key: sk-... (from OpenAI)
```

---

## 🧪 Test Your Keys

### Test OpenRouter Key (for LLM1):
```bash
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_OPENROUTER_KEY" \
  -d '{"model": "deepseek/deepseek-chat", "messages": [{"role": "user", "content": "Hello"}]}'
```

### Test OpenAI Key (for LLM2):
```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_OPENAI_KEY" \
  -d '{"model": "gpt-3.5-turbo", "messages": [{"role": "user", "content": "Hello"}]}'
```

---

## 📝 Summary

- **LLM1 (DeepSeek):** OpenRouter key → OpenRouter API
- **LLM2 (OpenAI):** OpenAI key → Direct OpenAI API
- **Different keys for different LLMs!**

