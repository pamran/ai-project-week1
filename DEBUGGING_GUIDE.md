# Debugging Guide
## How to Check if Application is Working & View Logs

---

## 🔍 Quick Health Check

### 1. Check if Servers are Running

```bash
# Check backend (should return {"status":"ok"})
curl http://localhost:3000/health

# Check frontend (should return HTTP 200)
curl -I http://localhost:5173
```

### 2. Check Running Processes

```bash
# See if Python servers are running
ps aux | grep python | grep -E "(app.py|http.server)"
```

---

## 📋 How to Check Logs

### Backend Logs

#### Option 1: View Log File
```bash
# View last 50 lines of backend log
tail -50 backend/server.log

# Follow log in real-time (updates as new logs appear)
tail -f backend/server.log
```

#### Option 2: Check Server Output
If you started the server in a terminal, check that terminal window for output.

#### Option 3: Check Python Process Output
```bash
# Find the process ID
ps aux | grep "python.*app.py" | grep -v grep

# View process output (if running in background)
# Check the terminal where you started it
```

### Frontend Logs (Browser Console)

1. **Open Browser DevTools**:
   - Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
   - Or right-click → "Inspect"

2. **Go to Console Tab**:
   - Look for error messages (red text)
   - Look for "Connected to server" message (green/gray)

3. **Go to Network Tab**:
   - Filter by "WS" (WebSocket)
   - Check if connection is established
   - Look for failed requests (red)

---

## 🐛 Common Errors & Solutions

### Error: "Not connected to server"

**Symptoms:**
- Error banner shows "Not connected to server"
- Console shows connection errors

**Check:**
```bash
# Is backend running?
curl http://localhost:3000/health

# If not, start it:
cd backend
python3 app.py
```

**Solution:**
- Ensure backend is running on port 3000
- Check firewall settings
- Verify CORS is enabled in backend

---

### Error: "API key is not configured"

**Symptoms:**
- Error when trying to start conversation
- "Please configure API keys for both LLMs"

**Check:**
- Open browser → Configuration panels
- Verify API keys are entered for both LLM 1 and LLM 2

**Solution:**
- Enter valid API keys in configuration panels
- Make sure keys are not empty

---

### Error: "It's not LLM1's turn"

**Symptoms:**
- Error when trying to send message
- "It's not llm1's turn. Current turn: llm2"

**Check:**
- Look at the UI - which LLM shows "Your Turn" badge?
- Check browser console for current turn

**Solution:**
- Wait for your turn (check the "Your Turn" indicator)
- Or reset conversation to start fresh

---

### Error: "DeepSeek API error" or "OpenAI API error"

**Symptoms:**
- Error banner shows API error message
- Backend log shows HTTP error

**Check Backend Log:**
```bash
tail -20 backend/server.log
```

**Common Causes:**
1. **Invalid API Key**: Check if API key is correct
2. **API Quota Exceeded**: Check your API usage
3. **Network Issue**: Check internet connection
4. **API Service Down**: Check API status pages

**Solution:**
- Verify API keys are correct
- Check API quotas/limits
- Test API keys directly (curl or API dashboard)
- Check internet connection

---

### Error: "No active conversation"

**Symptoms:**
- Error when trying to send message
- "No active conversation. Please start a conversation first."

**Solution:**
- Click "Start Conversation" button first
- Enter topic and select starting LLM
- Click "Start"

---

### Error: "Conversation is paused"

**Symptoms:**
- Cannot send messages
- "Conversation is paused. Please resume first."

**Solution:**
- Click "Resume" button
- Or reset conversation

---

## 🔧 Step-by-Step Debugging Process

### When You Get an Error:

1. **Check Browser Console** (F12 → Console tab)
   - Look for red error messages
   - Note the exact error text

2. **Check Backend Logs**
   ```bash
   tail -50 backend/server.log
   ```
   - Look for Python tracebacks
   - Look for error messages

3. **Check Network Tab** (F12 → Network tab)
   - Filter by "WS" for WebSocket
   - Check if connection is established
   - Look for failed requests

4. **Verify Servers are Running**
   ```bash
   curl http://localhost:3000/health
   curl -I http://localhost:5173
   ```

5. **Check API Keys**
   - Verify API keys are entered
   - Test API keys are valid
   - Check API quotas

---

## 📊 Real-Time Monitoring

### Monitor Backend Logs in Real-Time

```bash
# Watch backend logs as they happen
tail -f backend/server.log
```

### Monitor Frontend in Browser

1. Open DevTools (F12)
2. Go to Console tab
3. Keep it open while using the app
4. Watch for errors in real-time

### Monitor Network Traffic

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "WS" (WebSocket)
4. Watch WebSocket messages in real-time

---

## 🧪 Testing the Application

### Test 1: Backend Health
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok"}
```

### Test 2: Frontend Loads
```bash
curl -I http://localhost:5173
# Should return: HTTP/1.1 200 OK
```

### Test 3: WebSocket Connection
1. Open browser → http://localhost:5173
2. Open DevTools → Console
3. Should see: "Connected to server"

### Test 4: Start Conversation
1. Enter API keys in config panels
2. Click "Start Conversation"
3. Enter topic
4. Click "Start"
5. Should see topic in header
6. Should see "Your Turn" on starting LLM

### Test 5: Send Message
1. Type message in active LLM panel
2. Click "Send"
3. Should see "Thinking..." indicator
4. Should see response appear
5. Turn should switch to other LLM

---

## 🚨 Emergency Debugging Commands

### Restart Backend
```bash
# Kill existing backend
pkill -f "python.*app.py"

# Start fresh
cd backend
python3 app.py
```

### Restart Frontend
```bash
# Kill existing frontend
pkill -f "python.*http.server"

# Start fresh
cd frontend
python3 -m http.server 5173
```

### Check Port Usage
```bash
# Check if port 3000 is in use
lsof -i :3000

# Check if port 5173 is in use
lsof -i :5173
```

### Clear Browser Cache
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Or clear browser cache in settings

---

## 📝 Log Locations

### Backend Logs
- **File**: `backend/server.log`
- **Location**: Project root → backend folder
- **View**: `tail -f backend/server.log`

### Frontend Logs
- **Browser Console**: F12 → Console tab
- **Network Logs**: F12 → Network tab
- **No file logs**: Frontend logs are in browser only

### Python Error Logs
- **Backend**: `backend/server.log`
- **Terminal**: If running in foreground, check terminal output
- **Python tracebacks**: Usually in server.log or terminal

---

## 🔍 Understanding Error Messages

### Backend Errors

**"Address already in use"**
- Port 3000 is already taken
- Solution: Kill existing process or use different port

**"ModuleNotFoundError"**
- Missing Python package
- Solution: `pip3 install -r backend/requirements.txt`

**"API error: Invalid API key"**
- API key is wrong or expired
- Solution: Check API key in configuration

**"Connection timeout"**
- Cannot reach LLM API
- Solution: Check internet, check API status

### Frontend Errors

**"Failed to load resource"**
- Cannot load file (CSS, JS, etc.)
- Solution: Check file paths, check server is running

**"WebSocket connection failed"**
- Cannot connect to backend
- Solution: Check backend is running, check CORS

**"Uncaught TypeError"**
- JavaScript error
- Solution: Check browser console for details

---

## ✅ Verification Checklist

Before reporting an issue, check:

- [ ] Backend server is running (`curl http://localhost:3000/health`)
- [ ] Frontend server is running (`curl -I http://localhost:5173`)
- [ ] Browser console shows "Connected to server"
- [ ] API keys are entered in configuration panels
- [ ] No errors in browser console
- [ ] No errors in backend log file
- [ ] WebSocket connection is established (Network tab → WS)
- [ ] Conversation is started (not just configured)

---

## 🆘 Getting Help

If you're still stuck:

1. **Collect Information**:
   - Error message from browser console
   - Last 20 lines of backend log: `tail -20 backend/server.log`
   - Screenshot of error
   - Steps to reproduce

2. **Check Common Issues**:
   - API keys valid?
   - Servers running?
   - Internet connection?
   - Browser console errors?

3. **Try Restart**:
   - Restart backend server
   - Restart frontend server
   - Hard refresh browser (Cmd+Shift+R)

---

## 📚 Additional Resources

- **Backend Code**: `backend/app.py`, `backend/models/conversation.py`
- **Frontend Code**: `frontend/app.js`
- **API Services**: `backend/services/deepseek_service.py`, `backend/services/openai_service.py`
- **Documentation**: `README.md`, `KNOWLEDGE_TRANSFER.md`

---

**Remember**: Most errors are logged either in:
1. **Browser Console** (F12 → Console)
2. **Backend Log File** (`backend/server.log`)

Check both when debugging!

