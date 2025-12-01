# 🔧 How to Fix the 401 Authentication Error

## The Problem

You're getting: `Error code: 401 - {'error': {'message': 'No cookie auth credentials found', 'code': 401}}`

This means **OpenRouter is not receiving your API key correctly**.

---

## ✅ Step-by-Step Fix

### Step 1: Get Your OpenRouter API Key

1. **Go to:** https://openrouter.ai/keys
2. **Login** to your OpenRouter account
3. **Copy the FULL API key** - it should look like:
   - `sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Or: `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Verify Key Format

Your API key should:
- ✅ Start with `sk-or-v1-` or `sk-`
- ✅ Be 30+ characters long
- ✅ Have NO spaces before or after
- ✅ Be the COMPLETE key (not truncated)

### Step 3: Enter Key in Application

1. **Open the application** in your browser: http://localhost:5173
2. **Expand "LLM 2 Configuration"** (this is for OpenAI)
3. **Clear the API Key field** completely
4. **Paste your FULL OpenRouter API key**
5. **Make sure:**
   - No spaces at the beginning
   - No spaces at the end
   - The entire key is pasted

### Step 4: Use SAME Key for Both LLMs

**Important:** Both LLM1 and LLM2 should use the **SAME OpenRouter API key**:
- LLM 1 (DeepSeek): Your OpenRouter key
- LLM 2 (OpenAI): Your OpenRouter key (same one!)

### Step 5: Test Your Key Directly

Before using in the app, test if your key works:

```bash
# Replace YOUR_API_KEY with your actual key
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "HTTP-Referer: https://github.com/dual-llm-conversation" \
  -H "X-Title: Dual LLM Conversation System" \
  -d '{
    "model": "openai/gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

**If this works:** Your key is valid ✅
**If this fails:** Your key is invalid or expired ❌

### Step 6: Check the Logs

After entering your key and starting a conversation, check:

```bash
tail -f backend/logs/app.log
```

Look for:
- ✅ `Using OpenRouter API key: ************XXXX (length: XX)` - Should show length 30+
- ✅ `Key starts with: sk-or-v1-...` - Should match your key prefix
- ❌ `API key appears to be invalid` - Key is wrong
- ❌ `API key doesn't start with expected prefix` - Key format is wrong

---

## 🚨 Common Mistakes

### ❌ Wrong: Using OpenAI API Key
- Don't use: `sk-...` from OpenAI directly
- Use: OpenRouter key that starts with `sk-or-v1-...`

### ❌ Wrong: Truncated Key
- Don't copy only part of the key
- Copy the ENTIRE key from OpenRouter dashboard

### ❌ Wrong: Extra Spaces
- Don't add spaces before/after the key
- Paste exactly as shown in OpenRouter

### ❌ Wrong: Different Keys
- Don't use different keys for LLM1 and LLM2
- Use the SAME OpenRouter key for both

---

## 🔍 Debugging

### Check if Key is Being Received

1. **Start a conversation**
2. **Check logs:**
   ```bash
   tail -f backend/logs/app.log | grep -i "api key"
   ```

3. **You should see:**
   ```
   Using OpenRouter API key: ************XXXX (length: 45)
   ```

### If Key Length is Wrong

- If length is < 30: Key is incomplete or wrong
- If length is 0: Key wasn't entered
- If length is correct but still fails: Key might be expired

---

## ✅ Quick Checklist

Before starting a conversation:

- [ ] Got API key from https://openrouter.ai/keys
- [ ] Key starts with `sk-or-v1-` or `sk-`
- [ ] Key is 30+ characters long
- [ ] Entered SAME key in both LLM1 and LLM2 configs
- [ ] No spaces in the key field
- [ ] Tested key with curl (optional but recommended)

---

## 🆘 Still Not Working?

1. **Generate a NEW API key** from OpenRouter dashboard
2. **Check OpenRouter account** has credits: https://openrouter.ai/activity
3. **Verify key is active** in OpenRouter dashboard
4. **Check OpenRouter status**: https://status.openrouter.ai

---

**The most common issue is: Using the wrong API key or not entering it correctly!**

Double-check your key format and make sure you're using the OpenRouter key, not an OpenAI key directly.

