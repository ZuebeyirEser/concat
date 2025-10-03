#!/bin/bash

echo "🚀 Auto-starting development services..."

# Wait a moment for the container to fully initialize
sleep 3

# Start backend in background
echo "📡 Starting FastAPI backend..."
cd /workspace/backend
source /workspace/.env
export POSTGRES_SERVER=db
nohup uv run fastapi dev --reload app/main.py --host 0.0.0.0 > /tmp/backend.log 2>&1 &
echo $! > /tmp/backend.pid

# Start frontend in background
echo "🎨 Starting Vite frontend..."
cd /workspace/frontend
nohup yarn dev --host 0.0.0.0 --port 5173 > /tmp/frontend.log 2>&1 &
echo $! > /tmp/frontend.pid

echo "✅ Services started in background!"
echo "📋 Logs: tail -f /tmp/backend.log or tail -f /tmp/frontend.log"
echo "🔗 URLs: Frontend: http://localhost:5173 | Backend: http://localhost:8000"
