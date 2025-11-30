# Quick Start Guide
## How to Run the Dual LLM Conversation System

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies

```bash
cd backend
pip3 install -r requirements.txt
cd ..
```

### Step 2: Start Backend Server

```bash
cd backend
python3 app.py
```

**You should see:**
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:3000
```

**Keep this terminal open!**

### Step 3: Start Frontend Server (New Terminal)

Open a **new terminal window** and run:

```bash
cd frontend
python3 -m http.server 5173
```

**You should see:**
```
Serving HTTP on 0.0.0.0 port 5173
```

**Keep this terminal open too!**

### Step 4: Open in Browser

Open your browser and go to:
```
http://localhost:5173
```

---

## 📋 Detailed Instructions

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- API keys for DeepSeek and/or OpenAI

### Installation

1. **Navigate to project directory**:
   ```bash
   cd /Volumes/Mac/ai/ai-project-week1
   ```

2. **Install Python dependencies**:
   ```bash
   cd backend
   pip3 install -r requirements.txt
   ```

   This installs:
   - Flask (web framework)
   - Flask-SocketIO (WebSocket support)
   - LangChain (LLM abstraction)
   - And other dependencies

3. **Create `.env` file** (optional, for API keys):
   ```bash
   cd ..
   # Create .env file in root directory
   # Add your API keys (or enter them in UI)
   ```

---

## 🖥️ Running the Application

### Option 1: Run in Separate Terminals (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
python3 app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
python3 -m http.server 5173
```

**Terminal 3 - Browser:**
- Open http://localhost:5173

---

### Option 2: Run in Background

**Backend (background):**
```bash
cd backend
python3 app.py > server.log 2>&1 &
echo $! > server.pid
```

**Frontend (background):**
```bash
cd frontend
python3 -m http.server 5173 > /dev/null 2>&1 &
echo $! > frontend_server.pid
```

**Check status:**
```bash
./check_status.sh
```

---

## ✅ Verify It's Working

### Check Backend
```bash
curl http://localhost:3000/health
```
Should return: `{"status":"ok"}`

### Check Frontend
```bash
curl -I http://localhost:5173
```
Should return: `HTTP/1.1 200 OK`

### Quick Status Check
```bash
./check_status.sh
```

---

## 🎯 Using the Application

1. **Open Browser**: http://localhost:5173

2. **Configure LLMs**:
   - Click "LLM 1 Configuration" to expand
   - Enter API key
   - Select provider (DeepSeek/OpenAI)
   - Adjust settings (temperature, max tokens, system prompt)
   - Repeat for LLM 2

3. **Start Conversation**:
   - Click "Start Conversation"
   - Enter topic (e.g., "What is consciousness?")
   - Select starting LLM
   - Click "Start"

4. **Send Messages**:
   - Type message in active LLM panel
   - Click "Send" or press Enter
   - Watch conversation flow between LLMs

---

## 🛑 Stopping the Application

### If Running in Foreground
- Press `Ctrl+C` in each terminal

### If Running in Background
```bash
# Stop backend
pkill -f "python.*app.py"

# Stop frontend
pkill -f "python.*http.server"

# Or use PID files
kill $(cat backend/server.pid) 2>/dev/null
kill $(cat frontend_server.pid) 2>/dev/null
```

---

## 🔧 Troubleshooting

### Backend Won't Start

**Error: "Port 3000 is already in use"**
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
# Edit backend/app.py, change PORT
```

**Error: "Module not found"**
```bash
cd backend
pip3 install -r requirements.txt
```

### Frontend Won't Load

**Error: "Cannot connect"**
- Check backend is running: `curl http://localhost:3000/health`
- Check browser console (F12) for errors

**Error: "404 Not Found"**
- Make sure you're in `frontend` directory
- Check `index.html` exists

### Messages Not Sending

**Check:**
1. Browser console (F12 → Console)
2. Backend log: `tail -f backend/server.log`
3. API keys are entered correctly
4. Conversation is started (not just configured)

---

## 📊 Ports Used

- **Backend**: Port 3000
- **Frontend**: Port 5173

Make sure these ports are available!

---

## 🎓 Quick Reference

```bash
# Start backend
cd backend && python3 app.py

# Start frontend (new terminal)
cd frontend && python3 -m http.server 5173

# Check status
./check_status.sh

# View backend logs
tail -f backend/server.log

# Stop servers
pkill -f "python.*app.py"
pkill -f "python.*http.server"
```

---

## 🚀 That's It!

Your application should now be running at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

Open the frontend URL in your browser and start having LLM conversations!

