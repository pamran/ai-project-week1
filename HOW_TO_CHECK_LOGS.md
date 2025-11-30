# How to Check Logs - Quick Guide

## 🚀 Quick Status Check

Run this command to check everything at once:
```bash
./check_status.sh
```

---

## 📋 When You Get an Error - Step by Step

### Step 1: Check Browser Console (Frontend Errors)

1. **Open your browser** where the app is running
2. **Press F12** (or `Cmd+Option+I` on Mac)
3. **Click "Console" tab**
4. **Look for red error messages**
5. **Copy the error message**

**What to look for:**
- Red text = Errors
- Yellow text = Warnings
- "Connected to server" = Good (green/gray)

---

### Step 2: Check Backend Log File

**View the log file:**
```bash
# See last 20 lines
tail -20 backend/server.log

# See last 50 lines (more context)
tail -50 backend/server.log

# Watch in real-time (updates automatically)
tail -f backend/server.log
```

**What to look for:**
- `Traceback` = Python error
- `Error` or `Exception` = Something went wrong
- `API error` = Problem with LLM API
- `Connection` errors = Network issues

---

### Step 3: Check Network Tab (WebSocket Issues)

1. **Open DevTools** (F12)
2. **Click "Network" tab**
3. **Filter by "WS"** (WebSocket)
4. **Look for connection status**
   - Green = Connected
   - Red = Failed

---

## 🔍 Common Error Scenarios

### Scenario 1: "Error sending message"

**Check:**
1. Browser Console (F12 → Console)
2. Backend log: `tail -20 backend/server.log`

**Look for:**
- API key errors
- "Not your turn" errors
- Network errors

---

### Scenario 2: "Cannot connect to server"

**Check:**
1. Is backend running?
   ```bash
   curl http://localhost:3000/health
   ```
2. Browser Console (F12 → Console)
3. Network tab (F12 → Network → WS filter)

**Fix:**
- Start backend: `cd backend && python3 app.py`

---

### Scenario 3: "API error" when sending message

**Check:**
1. Backend log: `tail -30 backend/server.log`
2. Look for API error details

**Common causes:**
- Invalid API key
- API quota exceeded
- Network issue

**Fix:**
- Verify API keys in configuration panels
- Check API quotas
- Check internet connection

---

## 📊 Real-Time Monitoring

### Watch Backend Logs Live

```bash
# This will show new log entries as they happen
tail -f backend/server.log
```

**Keep this terminal open** while using the app to see errors in real-time.

### Watch Browser Console Live

1. Open DevTools (F12)
2. Go to Console tab
3. Keep it open while using the app
4. Errors will appear immediately

---

## 🛠️ Quick Commands Reference

```bash
# Check if backend is running
curl http://localhost:3000/health

# Check if frontend is running
curl -I http://localhost:5173

# View backend log (last 20 lines)
tail -20 backend/server.log

# Watch backend log in real-time
tail -f backend/server.log

# Check for errors in log
grep -i "error\|exception" backend/server.log | tail -10

# Check running servers
ps aux | grep python | grep -E "(app.py|http.server)"

# Run status check script
./check_status.sh
```

---

## 🎯 What Error Message Tells You

### "Not connected to server"
→ **Check**: Browser Console, Network tab
→ **Fix**: Ensure backend is running

### "API key is not configured"
→ **Check**: Configuration panels in UI
→ **Fix**: Enter API keys

### "It's not LLM1's turn"
→ **Check**: UI - which LLM shows "Your Turn"?
→ **Fix**: Wait for your turn or reset

### "DeepSeek API error" or "OpenAI API error"
→ **Check**: Backend log (`tail -30 backend/server.log`)
→ **Fix**: Check API key, quota, network

### "No active conversation"
→ **Check**: Did you click "Start Conversation"?
→ **Fix**: Start a conversation first

---

## 📝 Log File Locations

- **Backend Log**: `backend/server.log`
- **Frontend Logs**: Browser Console only (F12)
- **No separate frontend log file**

---

## ✅ Quick Health Check

Run this to check everything:
```bash
./check_status.sh
```

This will show:
- ✅ Backend status
- ✅ Frontend status  
- ✅ Recent log entries
- ✅ Recent errors
- ✅ Running processes
- ✅ Port status

---

## 🆘 Still Having Issues?

1. **Collect Information**:
   - Error from browser console
   - Last 30 lines of backend log: `tail -30 backend/server.log`
   - Screenshot of error

2. **Check**:
   - Are servers running? (`./check_status.sh`)
   - Are API keys valid?
   - Is internet working?

3. **Try**:
   - Restart backend
   - Restart frontend
   - Hard refresh browser (Cmd+Shift+R)

---

**Remember**: 
- **Frontend errors** = Check Browser Console (F12)
- **Backend errors** = Check `backend/server.log`
- **Both** = Run `./check_status.sh`

