#!/bin/bash

echo "🚀 Starting development services in screen sessions..."

# Install screen if not available
if ! command -v screen &> /dev/null; then
    echo "Installing screen..."
    sudo apt-get update && sudo apt-get install -y screen
fi

# Kill any existing screen sessions
screen -S backend -X quit 2>/dev/null || true
screen -S frontend -X quit 2>/dev/null || true

# Wait for database
echo "⏳ Waiting for database..."
until pg_isready -h db -p 5432 -U postgres -d app; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

# Run database migrations
echo "🗄️ Running database migrations..."
cd /workspace/backend
source /workspace/.env
export POSTGRES_SERVER=db
uv run alembic upgrade head

# Start backend in screen session
echo "📡 Starting FastAPI backend in screen session..."
cd /workspace/backend
screen -dmS backend bash -c "source /workspace/.env && export POSTGRES_SERVER=db && uv run fastapi dev --reload app/main.py --host 0.0.0.0; exec bash"

# Start frontend in screen session
echo "🎨 Starting Vite frontend in screen session..."
cd /workspace/frontend
screen -dmS frontend bash -c "yarn dev --host 0.0.0.0 --port 5173; exec bash"

# Wait a moment for services to start
sleep 5

# Check if screen sessions are running
echo "🔍 Checking services..."
if screen -list | grep -q "backend"; then
    echo "✅ Backend screen session is running"
else
    echo "❌ Backend screen session failed"
fi

if screen -list | grep -q "frontend"; then
    echo "✅ Frontend screen session is running"
else
    echo "❌ Frontend screen session failed"
fi

echo "🎉 Services started in screen sessions!"
echo ""
echo "🔗 URLs:"
echo "  - Frontend: http://localhost:5173"
echo "  - Backend: http://localhost:8000"
echo "  - API Docs: http://localhost:8000/docs"
echo ""
echo "📋 To view service logs:"
echo "  - Backend: screen -r backend"
echo "  - Frontend: screen -r frontend"
echo "  - List sessions: screen -list"
echo ""
echo "🛑 To stop services:"
echo "  - screen -S backend -X quit"
echo "  - screen -S frontend -X quit"