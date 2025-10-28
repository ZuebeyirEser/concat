# Grocery Receipt Tracker(Concat)

Full-stack application for automated PDF receipt processing and data extraction.

## Features

- PDF upload with drag & drop interface
- Automated German grocery receipt parsing
- Real-time processing status tracking
- Structured data extraction (items, totals, store info)
- Document management dashboard
- Search and filter capabilities

## Tech Stack

**Backend:** FastAPI, PostgreSQL, SQLModel, Alembic
**Frontend:** React, TypeScript, TanStack Router, TanStack Query
**Processing:** PyPDF2, regex-based text extraction
**UI:** Tailwind CSS, Radix UI components

## Architecture

- RESTful API with background task processing
- Type-safe database models and API schemas
- Reactive frontend with optimistic updates
- Secure file storage and user isolation

## Development

```bash
# Backend
cd backend
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## API Endpoints

- `POST /api/v1/pdf/upload` - Upload PDF files
- `GET /api/v1/pdf/documents` - List user documents
- `GET /api/v1/pdf/documents/{id}` - Get document details
- `POST /api/v1/pdf/search` - Search documents
- `DELETE /api/v1/pdf/documents/{id}` - Delete document