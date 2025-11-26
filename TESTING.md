# Testing Guide

## Quick Test Checklist

### ✅ Prerequisites
- [ ] Backend server running on port 3000
- [ ] Frontend server running on port 5173
- [ ] API keys configured in `.env` file (or in UI)

---

## Method 1: Automated Backend Tests

Run the automated test script:

```bash
cd /Volumes/Mac/ai/ai-project-week1
node test-backend.js
```

This will test:
- ✅ Health check endpoint
- ✅ API health endpoint  
- ✅ WebSocket connection
- ✅ WebSocket event handling

---

## Method 2: Manual Browser Testing

### Step 1: Open the Application

1. Open your browser and navigate to: **http://localhost:5173**

2. You should see:
   - Header: "Dual LLM Conversation System"
   - "Start Conversation" button
   - Two configuration panels (LLM 1 and LLM 2)
   - Two conversation panels (currently empty)

### Step 2: Configure LLMs

1. **Expand LLM 1 Configuration**:
   - Click on "LLM 1 Configuration" header
   - Select provider: **DeepSeek** (or OpenAI)
   - Enter your API key
   - Set model: `deepseek-chat` (or your preferred model)
   - Adjust temperature: 0.7
   - Set max tokens: 1000
   - Add system prompt: "You are a neuroscience-focused AI assistant."

2. **Expand LLM 2 Configuration**:
   - Click on "LLM 2 Configuration" header
   - Select provider: **OpenAI** (or DeepSeek)
   - Enter your API key
   - Set model: `gpt-3.5-turbo` (or your preferred model)
   - Adjust temperature: 0.7
   - Set max tokens: 1000
   - Add system prompt: "You are a philosophy-focused AI assistant."

### Step 3: Start a Conversation

1. Click **"Start Conversation"** button
2. Enter a topic: `"What is the nature of consciousness?"`
3. Select starting LLM: **LLM 1**
4. Click **"Start"**

**Expected Result**:
- ✅ Topic appears in header
- ✅ System message appears in both panels
- ✅ LLM 1 panel shows "Your Turn" indicator
- ✅ LLM 2 panel shows "Waiting for LLM 1..."

### Step 4: Send First Message

1. In **LLM 1 panel**, type a message:
   ```
   Consciousness emerges from complex neural computations in the brain. We can map specific brain regions to different aspects of conscious experience through fMRI studies.
   ```

2. Click **"Send"** button (or press Enter)

**Expected Result**:
- ✅ Message appears in LLM 1 panel
- ✅ "Thinking..." indicator appears
- ✅ After a few seconds, response appears
- ✅ Turn switches to LLM 2
- ✅ LLM 2 panel shows "Your Turn" indicator

### Step 5: Continue Conversation

1. In **LLM 2 panel**, type a response:
   ```
   But that only describes the correlates of consciousness, not consciousness itself. How do electrochemical signals transform into subjective experience? The hard problem of consciousness remains unsolved.
   ```

2. Click **"Send"**

**Expected Result**:
- ✅ Message appears in LLM 2 panel
- ✅ Response generated
- ✅ Turn switches back to LLM 1
- ✅ Conversation history visible in both panels

### Step 6: Test Controls

1. **Pause Test**:
   - Click **"Pause"** button
   - Try to send a message → Should be disabled
   - ✅ Panel shows "Paused" indicator

2. **Resume Test**:
   - Click **"Resume"** button
   - ✅ Conversation continues
   - ✅ Can send messages again

3. **Reset Test**:
   - Click **"Reset"** button
   - ✅ All messages cleared
   - ✅ Conversation state reset
   - ✅ Can start new conversation

---

## Method 3: Browser Developer Tools Testing

### Check WebSocket Connection

1. Open browser DevTools (F12 or Cmd+Option+I)
2. Go to **Network** tab
3. Filter by **WS** (WebSocket)
4. Refresh the page
5. You should see a WebSocket connection to `localhost:3000`

### Check Console for Errors

1. Open **Console** tab in DevTools
2. Look for:
   - ✅ "Connected to server" message
   - ❌ No red error messages
   - ✅ Socket events logged (if verbose logging enabled)

### Monitor Network Requests

1. In **Network** tab, watch for:
   - ✅ WebSocket connection established
   - ✅ Socket.io handshake successful
   - ❌ No failed requests

---

## Method 4: cURL Testing (Backend Only)

### Test Health Endpoint

```bash
curl http://localhost:3000/health
```

**Expected**: `{"status":"ok"}`

### Test API Health

```bash
curl http://localhost:3000/api/health
```

**Expected**: `{"status":"ok"}`

---

## Method 5: Full Integration Test

### Test Scenario: Philosophy Debate

1. **Setup**:
   - LLM 1: DeepSeek, Neuroscience character
   - LLM 2: OpenAI, Philosophy character
   - Topic: "What is the nature of consciousness?"

2. **Conversation Flow**:
   - LLM 1 sends: "Consciousness emerges from neural computations..."
   - LLM 2 responds: "But that only describes correlates..."
   - LLM 1 responds: "The hard problem may be philosophical..."
   - Continue for 5-10 turns

3. **Verify**:
   - ✅ Messages alternate correctly
   - ✅ Turn indicators update properly
   - ✅ History visible in both panels
   - ✅ No duplicate messages
   - ✅ Error handling works (try invalid API key)

---

## Common Issues & Solutions

### Issue: "Not connected to server"
**Solution**: 
- Check backend is running: `curl http://localhost:3000/health`
- Check browser console for connection errors
- Verify CORS settings in `backend/server.js`

### Issue: "API key is not configured"
**Solution**:
- Add API keys in configuration panels
- Or update `.env` file and restart backend

### Issue: "It's not LLM1's turn"
**Solution**:
- Check current turn indicator
- Wait for the other LLM's turn
- Or reset conversation to start fresh

### Issue: Messages not appearing
**Solution**:
- Check WebSocket connection in DevTools
- Verify backend logs for errors
- Check browser console for errors
- Ensure conversation is not paused

---

## Performance Testing

### Test with Long Conversations

1. Start conversation with 20+ turns
2. Verify:
   - ✅ No performance degradation
   - ✅ Messages render quickly
   - ✅ History scrolls properly
   - ✅ Memory usage reasonable

### Test with Different Models

1. Try different model combinations:
   - DeepSeek + DeepSeek
   - OpenAI + OpenAI
   - DeepSeek + OpenAI (default)

2. Verify:
   - ✅ Both providers work
   - ✅ Responses are appropriate
   - ✅ Error handling for invalid models

---

## Success Criteria

✅ **Backend Tests**:
- All automated tests pass
- Health endpoints respond
- WebSocket connects successfully

✅ **Frontend Tests**:
- UI loads without errors
- Configuration panels work
- Messages send and receive
- Turn indicators update
- Controls (pause/resume/reset) work

✅ **Integration Tests**:
- Full conversation flows correctly
- Both LLMs respond appropriately
- Error handling works
- Real-time updates function

---

## Next Steps After Testing

Once all tests pass:
1. ✅ Application is ready for use
2. ✅ You can customize system prompts for different scenarios
3. ✅ Experiment with different temperature settings
4. ✅ Try various conversation topics

Happy testing! 🚀

