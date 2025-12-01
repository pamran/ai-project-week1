# 🚨 QUICK FIX: 401 Authentication Error

## ⚡ Immediate Steps to Fix

### Step 1: Verify Your OpenRouter API Key

1. **Go to:** https://openrouter.ai/keys
2. **Login** to your account
3. **Copy the FULL API key** - it should look like:
   ```
   sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   OR
   ```
   sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Step 2: Check Key Format

Your key MUST:
- ✅ Start with `sk-or-v1-` or `sk-`
- ✅ Be 30+ characters long
- ✅ Have NO spaces before or after
- ✅ Be the COMPLETE key (not cut off)

### Step 3: Clear and Re-Enter in Application

1. **Open:** http://localhost:5173
2. **Expand "LLM 1 Configuration"**
   - Clear the API Key field completely
   - Paste your FULL OpenRouter key
   - Make sure there are NO spaces
3. **Expand "LLM 2 Configuration"**
   - Clear the API Key field completely
   - Paste the SAME OpenRouter key
   - Make sure there are NO spaces

**IMPORTANT:** Use the SAME key for both LLM1 and LLM2!

### Step 4: Test Your Key

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
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

**If you see a response:** ✅ Key works!  
**If you see 401 error:** ❌ Key is wrong or expired

### Step 5: Check the Logs

After entering your key and starting a conversation:

```bash
tail -f backend/logs/app.log
```

**Look for these lines:**
```
Using OpenRouter API key: ************XXXX (length: XX)
```

**What to check:**
- ✅ Length should be 30+ characters
- ✅ Should see: `Key starts with: sk-or-v1-...` or `Key starts with: sk-...`
- ❌ If length is < 30: Key is incomplete
- ❌ If no "Key starts with": Key format is wrong

---

## 🔍 Common Mistakes

### ❌ Wrong: Using OpenAI Key Directly
```
Don't use: sk-... from OpenAI website
Use: sk-or-v1-... from OpenRouter
```

### ❌ Wrong: Incomplete Key
```
Don't copy: sk-or-v1-abc123...
Copy the ENTIRE key from OpenRouter dashboard
```

### ❌ Wrong: Extra Spaces
```
Don't: " sk-or-v1-... " (with spaces)
Do: "sk-or-v1-..." (no spaces)
```

### ❌ Wrong: Different Keys
```
Don't: LLM1 = key1, LLM2 = key2
Do: LLM1 = same key, LLM2 = same key
```

---

## ✅ Checklist

Before starting a conversation:

- [ ] Got API key from https://openrouter.ai/keys
- [ ] Key starts with `sk-or-v1-` or `sk-`
- [ ] Key is 30+ characters long
- [ ] Entered SAME key in both LLM1 and LLM2
- [ ] No spaces in the key field
- [ ] Tested key with curl (optional but recommended)

---

## 🆘 Still Not Working?

### Option 1: Generate New Key
1. Go to https://openrouter.ai/keys
2. Delete old key (if needed)
3. Generate NEW key
4. Copy the new key
5. Enter it in the application

### Option 2: Check Account Status
1. Go to https://openrouter.ai/activity
2. Check if account has credits
3. Check if key is active

### Option 3: Verify Key Works
Run the curl command above - if it fails, the key is invalid.

---

## 📋 Debug Commands

**Check what key is being used:**
```bash
tail -f backend/logs/app.log | grep -i "api key\|using openrouter"
```

**Check for errors:**
```bash
tail -f backend/logs/errors.log
```

**Check recent activity:**
```bash
tail -20 backend/logs/app.log
```

---

**Most likely issue: Wrong API key or key not entered correctly!**

Double-check:
1. Key is from OpenRouter (not OpenAI directly)
2. Key is complete (30+ characters)
3. Key is entered in BOTH LLM configs
4. No spaces in the key field

