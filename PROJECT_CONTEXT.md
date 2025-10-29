# PDF PROCESSING SYSTEM - PROJECT CONTEXT

## QUICK REFERENCE FOR NEW SESSIONS

### Current State
- **Main Branch:** Complete PDF processing system merged
- **Tech Stack:** FastAPI + React + PostgreSQL + TypeScript
- **Package Managers:** `uv` (backend), `npm` (frontend)
- **Database:** PostgreSQL with Alembic migrations
- **Processing:** German grocery receipt parsing with PyPDF2
- **Frontend State:** TanStack Query (React Query) + TanStack Router
- **API Client:** HeyAPI for type-safe API integration

### Development Commands

#### Backend (FastAPI)
```bash
cd backend
uv sync                                    # Install dependencies
uv run alembic upgrade head                # Run migrations
uv run uvicorn app.main:app --reload       # Start dev server (port 8000)
uv run alembic revision --autogenerate -m "message"  # Create migration
uv run mypy app/                           # Type checking
```

#### Frontend (React)
```bash
cd frontend
npm install                                # Install dependencies
npm run dev                                # Start dev server (port 5173)
npm run build                              # Production build
npm run lint                               # ESLint
```

#### Git Workflow
```bash
git checkout -b feature/branch-name        # Create feature branch
git add .
git commit -m "type: description
- bullet point changes" --no-verify        # Commit with format
git checkout main && git merge feature/branch-name  # Merge to main
```

## ARCHITECTURE OVERVIEW

### Backend Structure
```
backend/app/
├── api/api_v1/endpoints/pdf_processing.py  # Main API (518 lines)
├── services/
│   ├── pdf_processor.py                    # German receipt parser (509 lines)
│   └── file_storage.py                     # File handling (173 lines)
├── crud/
│   ├── crud_pdf_document.py                # Document CRUD (105 lines)
│   └── crud_extracted_data.py              # Data CRUD (68 lines)
├── models/
│   ├── pdf_document.py                     # SQLModel (46 lines)
│   └── extracted_data.py                   # Data model (76 lines)
└── schemas/pdf_document.py                 # Pydantic schemas (93 lines)
```

### Frontend Structure
```
frontend/src/
├── components/PdfUpload/
│   ├── PdfUploadSimple.tsx                 # Drag & drop upload
│   ├── ExtractedDataView.tsx               # Data visualization (292 lines)
│   └── UploadingFileItem.tsx               # Progress tracking (183 lines)
├── hooks/usePdfQueries.ts                  # API integration (210 lines)
├── routes/_layout/
│   ├── pdf-upload.tsx                      # Upload page
│   └── documents.tsx                       # Management dashboard (328 lines)
└── utils/formatters.ts                     # Utility functions (26 lines)
```

### Database Models
```sql
-- PDFDocument table
id (PK), owner_id (FK), filename, original_filename, file_size, 
content_type, file_path, processed, processing_error, created_at, updated_at

-- ExtractedData table  
id (PK), document_id (FK), store_name, store_address, store_phone,
receipt_number, transaction_date, transaction_time, subtotal, tax_amount,
total_amount, payment_method, items (JSON), tax_breakdown (JSON),
extraction_confidence, created_at, updated_at
```

### API Endpoints
```
POST   /api/v1/pdf/upload                   # Upload PDF files
GET    /api/v1/pdf/documents                # List user documents
GET    /api/v1/pdf/documents/{id}           # Get document details
GET    /api/v1/pdf/documents/{id}/status    # Processing status
POST   /api/v1/pdf/search                   # Search documents
DELETE /api/v1/pdf/documents/{id}           # Delete document
POST   /api/v1/pdf/documents/{id}/reprocess # Reprocess document
```

## KEY FEATURES IMPLEMENTED

### PDF Processing Pipeline
1. **Upload:** Multi-file drag & drop with 10MB limit
2. **Validation:** PDF format checking
3. **Storage:** Secure filesystem storage with UUID paths
4. **Background Processing:** Async text extraction
5. **German Receipt Parsing:** Store detection, item extraction, tax calculation
6. **Real-time Status:** Polling-based progress updates
7. **Data Display:** Rich visualization of extracted data

### German Receipt Parser Capabilities
- **Supported Stores:** REWE, EDEKA, ALDI, LIDL, PENNY, NETTO, etc.
- **Data Extraction:** Items, prices, quantities, tax codes
- **Financial Data:** Subtotals, tax amounts, payment methods
- **Store Info:** Name, address, phone numbers
- **Confidence Scoring:** Quality assessment of extraction

### Frontend Features
- **Modern UI:** Tailwind CSS + Radix UI components
- **Type Safety:** Full TypeScript coverage with HeyAPI generated clients
- **State Management:** TanStack Query (React Query) for server state
- **Routing:** TanStack Router with file-based routing
- **API Integration:** HeyAPI for type-safe API calls and OpenAPI client generation
- **Error Handling:** Consistent error states and retry logic
- **Responsive Design:** Mobile-friendly interface
- **Real-time Updates:** Status polling and optimistic updates with TanStack Query

## DEVELOPMENT PATTERNS

### Code Style
- **Backend:** FastAPI with SQLModel, type hints everywhere
- **Frontend:** React hooks, TypeScript interfaces, TanStack Query patterns
- **Routing:** TanStack Router file-based routing with type-safe navigation
- **API Client:** HeyAPI generated clients for type-safe API communication
- **Database:** Alembic migrations, UUID foreign keys
- **API:** RESTful design with proper HTTP status codes and OpenAPI specs

### Error Handling
- **Backend:** HTTPException with proper status codes
- **Frontend:** handleError() utility for consistent error display
- **Database:** Proper constraint handling and rollbacks
- **File Processing:** Graceful failure with error storage

### Testing & Quality
- **Type Checking:** MyPy for backend, TypeScript for frontend
- **Linting:** ESLint for frontend code quality
- **API Documentation:** Auto-generated Swagger/OpenAPI docs
- **Database:** Migration-based schema management

## CURRENT CAPABILITIES

### Working Features
✅ Complete PDF upload and processing pipeline
✅ German grocery receipt parsing (REWE optimized)
✅ Real-time processing status tracking  
✅ Document management dashboard
✅ Search and filtering by store/date
✅ Type-safe API with comprehensive error handling
✅ Responsive UI with drag & drop interface
✅ Background task processing
✅ User isolation and security
✅ File storage with cleanup on deletion

### Performance Characteristics
- **File Size Limit:** 10MB per PDF
- **Processing Time:** ~2-5 seconds per receipt
- **Concurrent Uploads:** Multiple files supported
- **Status Polling:** 2-second intervals with 5-minute timeout
- **Database:** Optimized queries with proper indexing

## NEXT DEVELOPMENT AREAS

### Potential Enhancements
- **OCR Integration:** For scanned/image-based receipts
- **Batch Processing:** Multiple document processing
- **Export Features:** CSV, Excel, PDF reports
- **Analytics Dashboard:** Spending patterns, store analysis
- **Mobile App:** React Native or PWA
- **Additional Formats:** Support for other receipt types
- **API Rate Limiting:** Enhanced security measures
- **Caching Layer:** Redis for improved performance

### Technical Debt
- **Test Coverage:** Add comprehensive test suites
- **Monitoring:** Application performance monitoring
- **Logging:** Structured logging with correlation IDs
- **Documentation:** API documentation improvements
- **Security:** Enhanced file validation and scanning

## TROUBLESHOOTING

### Common Issues
- **Migration Errors:** Check database connection, run `alembic upgrade head`
- **Type Errors:** Run `mypy app/` to check backend types
- **Frontend Build:** Clear node_modules and reinstall if needed
- **PDF Processing:** Check file permissions and storage directory
- **API Errors:** Verify backend is running on port 8000

### Development URLs
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

This document serves as your complete project reference for future development sessions.