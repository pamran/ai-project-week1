#!/bin/bash

# Quick Status Check Script for Dual LLM Conversation System

echo "=========================================="
echo "  Application Status Check"
echo "=========================================="
echo ""

# Check Backend
echo "1. Backend Server (Port 3000):"
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "   ✅ Backend is running"
    curl -s http://localhost:3000/health | python3 -m json.tool 2>/dev/null || echo "   Response: OK"
else
    echo "   ❌ Backend is NOT running"
    echo "   Start with: cd backend && python3 app.py"
fi
echo ""

# Check Frontend
echo "2. Frontend Server (Port 5173):"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 | grep -q "200"; then
    echo "   ✅ Frontend is running"
else
    echo "   ❌ Frontend is NOT running"
    echo "   Start with: cd frontend && python3 -m http.server 5173"
fi
echo ""

# Check Backend Log
echo "3. Backend Log (Last 10 lines):"
if [ -f "backend/server.log" ]; then
    echo "   Recent log entries:"
    tail -10 backend/server.log | sed 's/^/   /'
else
    echo "   ⚠️  No log file found"
fi
echo ""

# Check for Errors in Log
echo "4. Recent Errors in Backend Log:"
if [ -f "backend/server.log" ]; then
    ERRORS=$(tail -50 backend/server.log | grep -i "error\|exception\|traceback" | tail -5)
    if [ -z "$ERRORS" ]; then
        echo "   ✅ No recent errors found"
    else
        echo "   ⚠️  Found errors:"
        echo "$ERRORS" | sed 's/^/   /'
    fi
else
    echo "   ⚠️  No log file to check"
fi
echo ""

# Check Running Processes
echo "5. Running Python Servers:"
PROCESSES=$(ps aux | grep -E "python.*app.py|python.*http.server" | grep -v grep)
if [ -z "$PROCESSES" ]; then
    echo "   ⚠️  No Python servers found running"
else
    echo "$PROCESSES" | sed 's/^/   /'
fi
echo ""

# Check Ports
echo "6. Port Status:"
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "   ✅ Port 3000 is in use (backend)"
else
    echo "   ❌ Port 3000 is free (backend not running)"
fi

if lsof -ti:5173 > /dev/null 2>&1; then
    echo "   ✅ Port 5173 is in use (frontend)"
else
    echo "   ❌ Port 5173 is free (frontend not running)"
fi
echo ""

echo "=========================================="
echo "  Quick Commands:"
echo "=========================================="
echo "  View backend log:     tail -f backend/server.log"
echo "  Check backend:        curl http://localhost:3000/health"
echo "  Check frontend:       curl -I http://localhost:5173"
echo "  Open in browser:      http://localhost:5173"
echo ""

