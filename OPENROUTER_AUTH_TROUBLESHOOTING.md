# OpenRouter Authentication Troubleshooting

## Error: "No cookie auth credentials found" (401)

This error indicates that OpenRouter is not receiving the API key correctly.

---

## ✅ Solution Steps

### 1. Verify Your API Key Format

OpenRouter API keys should:
- Start with `sk-or-v1-`
- Be the full key from your OpenRouter dashboard
- Have no extra spaces or characters

**Get your key:**
1. Go to https://openrouter.ai/keys
2. Copy the full API key (it should look like: `sk-or-v1-...`)

### 2. Check API Key in Application

When you configure LLM2 (OpenAI):
- Make sure you paste the **entire** API key
- No spaces before or after
- The key should be at least 20+ characters long

### 3. Test Your API Key Directly

Test if your API key works with OpenRouter:

```bash
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -H "HTTP-Referer: https://github.com/dual-llm-conversation" \
  -H "X-Title: Dual LLM Conversation System" \
  -d '{
    "model": "openai/gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

**If this works:** The key is valid, the issue is in the application
**If this fails:** The key is invalid or expired

### 4. Check Application Logs

```bash
tail -f backend/logs/app.log
```

Look for:
- `OpenAIService initialized with API key: ************XXXX`
- `Using API key: ************XXXX (length: XX)`
- Any authentication errors

### 5. Common Issues

#### Issue: API Key Not Set
**Symptom:** Error on initialization
**Fix:** Make sure you enter the API key in the LLM2 configuration panel

#### Issue: Wrong API Key Format
**Symptom:** 401 error
**Fix:** Ensure the key starts with `sk-or-v1-` and is the full key

#### Issue: API Key Expired/Revoked
**Symptom:** 401 error
**Fix:** Generate a new key from OpenRouter dashboard

#### Issue: Insufficient Credits
**Symptom:** Billing/quota errors
**Fix:** Add credits to your OpenRouter account

### 6. Verify Both LLMs Use Same Key

For this application, **both LLM1 and LLM2 should use the same OpenRouter API key**:
- LLM1 (DeepSeek): Your OpenRouter key
- LLM2 (OpenAI): Your OpenRouter key (same key)

### 7. Check OpenRouter Account

1. Visit: https://openrouter.ai/activity
2. Check if:
   - Your account has credits
   - API key is active
   - No rate limits are hit

---

## 🔧 Debugging Steps

1. **Check API Key Length:**
   ```bash
   # In the application logs, you should see:
   # "Using API key: ************XXXX (length: XX)"
   # Length should be 30+ characters
   ```

2. **Verify Key Format:**
   - Should start with: `sk-or-v1-`
   - Should not have spaces
   - Should be copied completely

3. **Test with curl (see step 3 above)**

4. **Check Logs:**
   ```bash
   tail -f backend/logs/app.log | grep -i "api key\|auth\|401"
   ```

---

## ✅ Expected Behavior

When working correctly:
- ✅ Service initializes: `OpenAIService initialized with API key: ************XXXX`
- ✅ API call succeeds: `LLM response received successfully`
- ✅ No 401 errors in logs

---

## 🆘 Still Having Issues?

1. **Double-check API key** in OpenRouter dashboard
2. **Generate a new API key** if needed
3. **Check OpenRouter status** at https://status.openrouter.ai
4. **Verify account has credits** at https://openrouter.ai/activity

---

**The key is: Make sure your OpenRouter API key is correct and properly entered!**

