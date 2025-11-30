#!/bin/bash

echo "Stopping Dual LLM Conversation System..."
echo ""

# Stop backend
if [ -f backend/server.pid ]; then
    PID=$(cat backend/server.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID 2>/dev/null
        echo "✅ Stopped backend (PID: $PID)"
    fi
    rm -f backend/server.pid
fi

# Stop frontend
if [ -f frontend_server.pid ]; then
    PID=$(cat frontend_server.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID 2>/dev/null
        echo "✅ Stopped frontend (PID: $PID)"
    fi
    rm -f frontend_server.pid
fi

# Kill any remaining processes
pkill -f "python.*app.py" 2>/dev/null
pkill -f "python.*http.server.*5173" 2>/dev/null

echo ""
echo "✅ All servers stopped"
