#!/bin/bash
set -e

echo "Starting development services..."

# Wait for database to be ready
echo "Waiting for database..."
until pg_isready -h db -p 5432 -U postgres -d app; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is ready!"

# Run database migrations
echo " Running database migrations..."
cd /workspace/backend

# Debug: Check if alembic is available
echo "Checking alembic installation..."
if uv run which alembic > /dev/null 2>&1; then
    echo " Alembic found, running migrations..."
    uv run alembic upgrade head
else
    echo " Alembic not found in virtual environment"
    echo "Checking installed packages..."
    uv run pip list | grep alembic || echo "Alembic not in pip list"
    echo "Attempting to install alembic..."
    uv add alembic==1.17.0
    echo "Retrying migration..."
    uv run alembic upgrade head || echo " Migration failed, continuing without migrations"
fi

echo "Starting backend and frontend services..."

# Start backend in background
echo "Starting FastAPI backend..."
cd /workspace/backend

# Load environment variables from .env file
set -a
source /workspace/.env
set +a

# Override specific settings for dev container
export POSTGRES_SERVER=db

nohup uv run fastapi dev --reload app/main.py --host 0.0.0.0 > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

# Start frontend in background
echo "Starting Vite frontend..."
cd /workspace/frontend

# Kill any existing processes on port 5173
pkill -f "vite.*5173" || true
pkill -f "yarn dev" || true
sleep 2

# Start frontend with explicit port and keep it running
echo "Starting frontend with: yarn dev --host 0.0.0.0 --port 5173"
setsid nohup bash -c "cd /workspace/frontend && exec yarn dev --host 0.0.0.0 --port 5173" > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!

# Save PIDs for later cleanup
echo $BACKEND_PID > /tmp/backend.pid
echo $FRONTEND_PID > /tmp/frontend.pid

# Wait a moment for services to start
sleep 5

# Verify services are running
echo "🔍 Verifying services..."
if ps -p $BACKEND_PID > /dev/null 2>&1; then
    echo "Backend is running (PID: $BACKEND_PID)"
else
    echo "Backend failed to start"
fi

if ps -p $FRONTEND_PID > /dev/null 2>&1; then
    echo "Frontend is running (PID: $FRONTEND_PID)"
else
    echo "Frontend failed to start"
    echo "Frontend log:"
    tail -10 /tmp/frontend.log
fi

echo " Service startup complete!"
echo ""
echo " URLs:"
echo "  - Frontend: http://localhost:5173"
echo "  - Backend: http://localhost:8000"
echo "  - API Docs: http://localhost:8000/docs"
echo "  - Adminer: http://localhost:8080"
echo "  - Mailcatcher: http://localhost:1080"
echo ""
echo " Service logs:"
echo "  - Backend: tail -f /tmp/backend.log"
echo "  - Frontend: tail -f /tmp/frontend.log"
echo ""
echo " To stop services: pkill -f 'fastapi dev' && pkill -f 'yarn dev'"
