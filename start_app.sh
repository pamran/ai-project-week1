#!/bin/bash

echo "=========================================="
echo "  Starting Dual LLM Conversation System"
echo "=========================================="
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed!"
    exit 1
fi

# Check if dependencies are installed
echo "1. Checking dependencies..."
cd backend
if ! python3 -c "import flask" 2>/dev/null; then
    echo "   Installing dependencies..."
    pip3 install -q -r requirements.txt
fi
cd ..

# Check if ports are available
echo "2. Checking ports..."
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "   ⚠️  Port 3000 is in use. Stopping existing process..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 1
fi

if lsof -ti:5173 > /dev/null 2>&1; then
    echo "   ⚠️  Port 5173 is in use. Stopping existing process..."
    lsof -ti:5173 | xargs kill -9 2>/dev/null
    sleep 1
fi

# Start backend
echo "3. Starting backend server..."
cd backend
python3 app.py > server.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > server.pid
cd ..
sleep 3

# Check if backend started
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "   ✅ Backend started (PID: $BACKEND_PID)"
else
    echo "   ❌ Backend failed to start. Check backend/server.log"
    exit 1
fi

# Start frontend
echo "4. Starting frontend server..."
cd frontend
python3 -m http.server 5173 > /dev/null 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../frontend_server.pid
cd ..
sleep 2

# Check if frontend started
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 | grep -q "200"; then
    echo "   ✅ Frontend started (PID: $FRONTEND_PID)"
else
    echo "   ❌ Frontend failed to start"
    exit 1
fi

echo ""
echo "=========================================="
echo "  ✅ Application is running!"
echo "=========================================="
echo ""
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3000"
echo ""
echo "  To stop: ./stop_app.sh"
echo "  To check status: ./check_status.sh"
echo ""
echo "  Opening browser..."
sleep 2

# Try to open browser (Mac)
if command -v open &> /dev/null; then
    open http://localhost:5173
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173
fi

echo ""
echo "Press Ctrl+C to stop servers (or run ./stop_app.sh)"
echo ""

# Wait for user interrupt
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
