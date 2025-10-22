#!/bin/bash
set -e

echo "Setting up development environment..."

# Fix workspace permissions
echo "Fixing workspace permissions..."
sudo chown -R vscode:vscode /workspace

# Install system dependencies
echo "Installing system dependencies..."
sudo apt-get update
sudo apt-get install -y curl git build-essential pkg-config libpq-dev postgresql-client

# Install Node.js 20
echo "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Setup Yarn
echo "Setting up Yarn..."
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
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.cargo/env

# Ensure uv is in PATH
export PATH="$HOME/.cargo/bin:$PATH"
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.bashrc
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.zshrc

# Setup backend
echo "Installing backend dependencies..."
cd /workspace/backend

# Remove any existing .venv with wrong permissions
if [ -d ".venv" ]; then
    rm -rf .venv
fi

# Create virtual environment and install dependencies
echo "Creating virtual environment and installing dependencies..."
uv sync --dev

# Verify installation
echo "Checking installed packages..."
uv run pip list | grep -E "(pre-commit|pytest|ruff)" || echo "Some dev packages may not be installed"

# Setup frontend
echo "nstalling frontend dependencies..."
cd /workspace/frontend
echo "Yarn version: $(yarn --version)"
yarn install

# Setup pre-commit hooks
echo "🔧 Setting up pre-commit hooks..."
cd /workspace/backend

# Check if pre-commit is available in the virtual environment
if uv run which pre-commit > /dev/null 2>&1; then
    echo "Installing pre-commit hooks..."
    uv run pre-commit install
    echo "Pre-commit hooks installed successfully!"
else
    echo "Pre-commit not found in virtual environment, skipping hook installation"
    echo "You can install it later with: cd backend && uv run pre-commit install"
fi

# Create useful aliases and scripts
echo "⚡ Creating development aliases..."

# Add source command to shell configs
echo "source /workspace/.devcontainer/aliases.sh" >> ~/.bashrc
echo "source /workspace/.devcontainer/aliases.sh" >> ~/.zshrc

echo "✅ Setup complete!"
