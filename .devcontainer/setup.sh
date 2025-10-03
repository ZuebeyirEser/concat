#!/bin/bash
set -e

echo "🚀 Setting up development environment..."

# Fix workspace permissions
echo "🔧 Fixing workspace permissions..."
sudo chown -R $(whoami):$(whoami) /workspace

# Install system dependencies
echo "🔧 Installing system dependencies..."
sudo apt-get update
sudo apt-get install -y curl git build-essential pkg-config libpq-dev postgresql-client

# Install Node.js 20
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Setup Yarn
echo "📦 Setting up Yarn..."
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Check if Yarn is already installed
if command -v yarn &> /dev/null; then
    echo "Yarn already installed: $(yarn --version)"
else
    echo "Installing Yarn via npm..."
    sudo npm install -g yarn
fi

# Enable corepack with sudo to avoid permission issues
echo "Enabling corepack..."
sudo corepack enable

# Set Yarn version to match project requirements
echo "Setting up Yarn 4.9.4..."
sudo corepack prepare yarn@4.9.4 --activate

# Verify final Yarn installation
echo "Final Yarn version: $(yarn --version)"

# Install uv for Python package management
echo "📦 Installing uv..."
pip install uv

# Setup backend
echo "📦 Installing backend dependencies..."
cd /workspace/backend

# Remove any existing .venv with wrong permissions
if [ -d ".venv" ]; then
    rm -rf .venv
fi

# Create virtual environment and install dependencies
uv sync --dev

# Setup frontend
echo "🎨 Installing frontend dependencies..."
cd /workspace/frontend
echo "Yarn version: $(yarn --version)"
yarn install

# Setup pre-commit hooks
echo "🔧 Setting up pre-commit hooks..."
cd /workspace
pre-commit install

# Create useful aliases and scripts
echo "⚡ Creating development aliases..."
cat >> ~/.bashrc << 'EOF'

# Development aliases
alias be="cd /workspace/backend"
alias fe="cd /workspace/frontend"
alias run-backend="cd /workspace/backend && uv run fastapi dev --reload app/main.py --host 0.0.0.0"
alias run-frontend="cd /workspace/frontend && yarn dev --host 0.0.0.0"
alias run-tests-backend="cd /workspace/backend && uv run pytest"
alias run-tests-frontend="cd /workspace/frontend && yarn test"
alias lint-backend="cd /workspace/backend && uv run ruff check . && uv run mypy ."
alias lint-frontend="cd /workspace/frontend && yarn lint"
alias format-backend="cd /workspace/backend && uv run ruff format ."
alias format-frontend="cd /workspace/frontend && yarn format"

# Quick development commands
alias dev="echo 'Starting both services...' && run-backend & run-frontend"
alias logs="echo 'Use logs-backend or logs-frontend to view service logs'"
alias db="psql -h db -p 5432 -U postgres -d app"
alias stop-dev="pkill -f 'fastapi dev'; pkill -f 'yarn dev'; echo 'Development services stopped'"
alias restart-dev="stop-dev && sleep 2 && bash .devcontainer/start-services.sh"
alias logs-backend="tail -f /tmp/backend.log"
alias logs-frontend="tail -f /tmp/frontend.log"
alias status="ps aux | grep -E '(fastapi|yarn dev)' | grep -v grep"

echo "🎯 Development environment ready!"
echo "📝 Available commands:"
echo "  - run-backend: Start FastAPI dev server"
echo "  - run-frontend: Start Vite dev server"
echo "  - dev: Start both services"
echo "  - be/fe: Navigate to backend/frontend"
echo "  - lint-backend/lint-frontend: Run linting"
echo "  - format-backend/format-frontend: Format code"
echo "  - db: Connect to PostgreSQL"
EOF

echo "✅ Setup complete!"