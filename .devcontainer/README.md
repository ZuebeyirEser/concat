# Development Container Setup

This dev container provides a complete development environment for both the FastAPI backend and React frontend.

## What's Included

### Languages & Runtimes
- Python 3.10 with uv package manager
- Node.js 20 with Yarn
- PostgreSQL 12 (via docker-compose)

### Development Tools
- Git & GitHub CLI
- Docker CLI
- Pre-commit hooks
- VS Code extensions for Python, TypeScript, and more

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

### Database
- `db` - Connect to PostgreSQL CLI
- `logs` - View docker-compose logs

## URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database Admin**: http://localhost:8080
- **Email Testing**: http://localhost:1080

## File Structure

```
.devcontainer/
├── devcontainer.json     # VS Code dev container config
├── Dockerfile           # Multi-language dev environment
├── docker-compose.dev.yml # Dev container services
├── setup.sh            # Initial setup script
├── start-services.sh   # Service startup script
└── README.md          # This file
```

## Customization

### VS Code Extensions
Edit `devcontainer.json` to add/remove extensions.

### Environment Variables
Modify `.env` in the project root for configuration.

### Additional Services
Add services to `docker-compose.dev.yml` as needed.

## Troubleshooting

### Container won't start
- Check Docker is running
- Ensure ports 5173, 8000, 5432 aren't in use

### Dependencies not installing
- Rebuild container: "Dev Containers: Rebuild Container"
- Check network connectivity

### Hot reload not working
- Ensure file watching is enabled in your OS
- Check volume mounts in docker-compose.dev.yml

### Database connection issues
- Wait for database to fully start (check logs)
- Verify environment variables in `.env`
