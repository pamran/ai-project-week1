# Quick Testing Guide

## ✅ Backend Tests (Automated)

Run this command to test the backend:

```bash
node test-backend.mjs
```

**Expected Output**: All 4 tests should pass ✅

---

## 🌐 Frontend Tests (Browser)

### Step 1: Open the App
Open your browser and go to: **http://localhost:5173**

### Step 2: Quick Visual Check
You should see:
- ✅ Header: "Dual LLM Conversation System"
- ✅ "Start Conversation" button
- ✅ Two configuration panels (collapsed)
- ✅ Two empty conversation panels

### Step 3: Configure & Test

1. **Expand LLM 1 Config** → Enter API key → Set provider (DeepSeek/OpenAI)
2. **Expand LLM 2 Config** → Enter API key → Set provider (OpenAI/DeepSeek)
3. **Click "Start Conversation"** → Enter topic → Select starting LLM → Click "Start"
4. **Type a message** in the active LLM panel → Click "Send"
5. **Watch the conversation** flow between the two LLMs

### Step 4: Test Controls
- ✅ **Pause** button → Messages disabled
- ✅ **Resume** button → Messages enabled again
- ✅ **Reset** button → Clears everything

---

## 🔍 Browser DevTools Testing

1. **Open DevTools** (F12 or Cmd+Option+I)
2. **Console Tab**: Should show "Connected to server" (no errors)
3. **Network Tab**: Filter by "WS" → Should see WebSocket connection
4. **Watch for**: Real-time message events in console

---

## 📋 Quick Checklist

- [ ] Backend running: `curl http://localhost:3000/health` → `{"status":"ok"}`
- [ ] Frontend running: Open http://localhost:5173 → Page loads
- [ ] WebSocket connects: Check browser console → "Connected to server"
- [ ] Can configure LLMs: Enter API keys in config panels
- [ ] Can start conversation: Click "Start Conversation" → Dialog appears
- [ ] Messages send: Type message → Click Send → Response appears
- [ ] Turn alternates: After each message, turn switches to other LLM
- [ ] Controls work: Pause/Resume/Reset buttons function correctly

---

## 🚨 Troubleshooting

**Backend not running?**
```bash
cd backend && npm start
```

**Frontend not running?**
```bash
cd frontend && npm run dev
```

**WebSocket not connecting?**
- Check backend is running on port 3000
- Check browser console for errors
- Verify CORS settings

**API errors?**
- Verify API keys are correct
- Check API key permissions
- Look at browser console for detailed errors

---

## 🎯 Success Indicators

✅ **Backend**: All automated tests pass  
✅ **Frontend**: UI loads, no console errors  
✅ **Integration**: Messages flow between LLMs  
✅ **Real-time**: Updates appear instantly  
✅ **Controls**: Pause/Resume/Reset work  

**You're all set!** 🎉

