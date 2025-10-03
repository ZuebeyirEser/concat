#!/bin/bash

echo "🧹 Cleaning up development services..."

# Kill background processes
if [ -f /tmp/backend.pid ]; then
    BACKEND_PID=$(cat /tmp/backend.pid)
    kill $BACKEND_PID 2>/dev/null || true
    rm -f /tmp/backend.pid
fi

if [ -f /tmp/frontend.pid ]; then
    FRONTEND_PID=$(cat /tmp/frontend.pid)
    kill $FRONTEND_PID 2>/dev/null || true
    rm -f /tmp/frontend.pid
fi

# Fallback: kill by process name
pkill -f 'fastapi dev' 2>/dev/null || true
pkill -f 'yarn dev' 2>/dev/null || true

echo "✅ Cleanup complete"
