#!/bin/bash

# Development aliases for devcontainer
# Ensure uv is in PATH
export PATH="$HOME/.local/bin:$PATH"
alias be="cd /workspace/backend"
alias fe="cd /workspace/frontend"
alias activate-backend="cd /workspace/backend && source .venv/bin/activate"
alias run-backend="cd /workspace/backend && source .venv/bin/activate && fastapi dev --reload app/main.py --host 0.0.0.0"
alias run-frontend="cd /workspace/frontend && yarn dev --host 0.0.0.0"
alias run-tests-backend="cd /workspace/backend && source .venv/bin/activate && pytest"
alias run-tests-frontend="cd /workspace/frontend && CI=false npx playwright test --workers=2"
alias lint-backend="cd /workspace/backend && source .venv/bin/activate && ruff check . && mypy ."
alias lint-frontend="cd /workspace/frontend && yarn lint"
alias format-backend="cd /workspace/backend && source .venv/bin/activate && ruff check . --fix && ruff format ."
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

# Set a beautiful prompt with colors and git info
export PS1='\[\033[01;32m\]sss \u@devcontainer\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\[\033[01;33m\]$(git branch 2>/dev/null | grep "^*" | colrm 1 2 | sed "s/.*/(&)/")\[\033[00m\]$ '

# Add some useful environment variables
export EDITOR=code
export PYTHONDONTWRITEBYTECODE=1
export PYTHONUNBUFFERED=1

# Enable colored output
alias ls='ls --color=auto'
alias grep='grep --color=auto'
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'

# Git aliases
alias gs='git status'
alias ga='git add'
alias gc='git commit'
alias gp='git push'
alias gl='git log --oneline'
alias gd='git diff'

echo -e "\033[1;36m Development environment loaded!\033[0m"
echo -e "\033[1;32m Available commands:\033[0m"
echo -e "  \033[0;33m• Navigation:\033[0m be, fe"
echo -e "  \033[0;33m• Development:\033[0m run-backend, run-frontend, dev"
echo -e "  \033[0;33m• Testing:\033[0m run-tests-backend, run-tests-frontend"
echo -e "  \033[0;33m• Code Quality:\033[0m lint-backend, format-backend"
echo -e "  \033[0;33m• Database:\033[0m db"
echo -e "  \033[0;33m• Git:\033[0m gs, ga, gc, gp, gl, gd"
echo -e "  \033[0;33m• Utils:\033[0m ll, la, status, stop-dev"