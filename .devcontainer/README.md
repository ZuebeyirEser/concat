# Development Container Setup

This dev container provides a complete development environment for both the FastAPI backend and React frontend.


### Languages & Runtimes
- Python 3.14 with uv package manager
- Node.js 20 with Yarn
- PostgreSQL 12 (via docker-compose)


### Services
- **Backend**: FastAPI with hot reload on port 8000
- **Frontend**: Vite dev server with hot reload on port 5173
- **Database**: PostgreSQL on port 5432
- **Adminer**: Database admin UI on port 8080
- **Mailcatcher**: Email testing on port 1080

## Quick Start

1. **Open in VS Code**: Use "Reopen in Container" when prompted
2. **Wait for setup**: The container will automatically install dependencies
3. **Start development**:
   ```bash
   # Start both services
   dev

   # Or start individually
   run-backend   # FastAPI on :8000
   run-frontend  # Vite on :5173
   ```

## Available Commands

### Navigation
- `be` - Navigate to backend directory
- `fe` - Navigate to frontend directory

### Development
- `dev` - Start both backend and frontend
- `run-backend` - Start FastAPI dev server
- `run-frontend` - Start Vite dev server

### Testing & Quality
- `run-tests-backend` - Run backend tests with pytest
- `run-tests-frontend` - Run frontend tests
- `lint-backend` - Run ruff and mypy on backend
- `lint-frontend` - Run biome on frontend
- `format-backend` - Format backend code with ruff
- `format-frontend` - Format frontend code with biome
