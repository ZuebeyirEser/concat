import logging
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlmodel import Session

from app import crud
from app.api import deps
from app.core.db import get_db
from app.models import User, PDFDocument, ExtractedData
from app.schemas.pdf_document import (
    PDFDocumentResponse,
    PDFDocumentWithDataResponse,
    PDFUploadResponse,
    PDFProcessingStatus,
    PDFSearchRequest,
    PDFSearchResponse,
    ExtractedDataResponse
)
from app.services.file_storage import file_storage
from app.services.pdf_processor import pdf_processor

logger = logging.getLogger(__name__)
router = APIRouter()


async def process_pdf_background(document_id: int, file_path: str):
    """Background task to process PDF and extract data."""
    from app.core.db import SessionLocal
    
    db = SessionLocal()
    try:
        # Get the document
        document = crud.pdf_document.get(db, id=document_id)
        if not document:
            logger.error(f"Document {document_id} not found")
            return
        
        # Read the PDF file
        pdf_content = file_storage.read_file(file_path)
        
        # Process the PDF
        extracted_info = pdf_processor.process_receipt(pdf_content)
        
        # Save extracted data
        extracted_data_create = {
            "document_id": document_id,
            **extracted_info
        }
        
        crud.extracted_data.create(db, obj_in=extracted_data_create)
        
        # Mark document as processed
        crud.pdf_document.mark_as_processed(db, document_id=document_id)
        
        logger.info(f"Successfully processed PDF document {document_id}")
        
    except Exception as e:
        logger.error(f"Error processing PDF {document_id}: {e}")
        # Mark document as processed with error
        crud.pdf_document.mark_as_processed(db, document_id=document_id, error=str(e))
    finally:
        db.close()


@router.post("/upload", response_model=PDFUploadResponse)
async def upload_pdf(
    *,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    file: UploadFile = File(...)
) -> Any:
    """
    Upload a PDF document for processing.
    """
    try:
        # Save the file
        filename, file_path, file_size = await file_storage.save_file(file, str(current_user.id))
        
        # Create database record
        pdf_document_create = {
            "filename": filename,
            "original_filename": file.filename or "unknown.pdf",
            "file_size": file_size,
            "content_type": file.content_type or "application/pdf",
            "file_path": file_path,
            "owner_id": current_user.id
        }
        
        document = crud.pdf_document.create(db, obj_in=pdf_document_create)
        
        # Queue background processing
        background_tasks.add_task(process_pdf_background, document.id, file_path)
        
        return PDFUploadResponse(
            message="PDF uploaded successfully and queued for processing",
            document_id=document.id,
            filename=filename,
            processing_status="queued"
        )
        
    except Exception as e:
        logger.error(f"Error uploading PDF: {e}")
        raise HTTPException(status_code=500, detail="Error uploading PDF")


@router.get("/documents", response_model=List[PDFDocumentResponse])
def get_user_documents(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Get all PDF documents for the current user.
    """
    documents = crud.pdf_document.get_by_owner(
        db, owner_id=current_user.id, skip=skip, limit=limit
    )
    return documents


@router.get("/documents/{document_id}", response_model=PDFDocumentWithDataResponse)
def get_document_with_data(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    document_id: int
) -> Any:
    """
    Get a specific PDF document with its extracted data.
    """
    document = crud.pdf_document.get_with_extracted_data(
        db, document_id=document_id, owner_id=current_user.id
    )
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return document


@router.get("/documents/{document_id}/status", response_model=PDFProcessingStatus)
def get_processing_status(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    document_id: int
) -> Any:
    """
    Get processing status of a PDF document.
    """
    document = crud.pdf_document.get_by_owner_and_id(
        db, owner_id=current_user.id, document_id=document_id
    )
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Get latest extracted data for confidence score
    extracted_data = crud.extracted_data.get_latest_by_document(db, document_id=document_id)
    
    return PDFProcessingStatus(
        document_id=document.id,
        processed=document.processed,
        processing_error=document.processing_error,
        extraction_confidence=extracted_data.extraction_confidence if extracted_data else None
    )


@router.post("/search", response_model=PDFSearchResponse)
def search_documents(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    search_params: PDFSearchRequest
) -> Any:
    """
    Search PDF documents and extracted data.
    """
    documents = []
    
    if search_params.store_name:
        # Search by store name
        extracted_data_list = crud.extracted_data.search_by_store(
            db,
            store_name=search_params.store_name,
            owner_id=current_user.id,
            skip=search_params.skip,
            limit=search_params.limit
        )
        
        # Get unique documents
        document_ids = list(set([ed.document_id for ed in extracted_data_list]))
        for doc_id in document_ids:
            doc = crud.pdf_document.get_with_extracted_data(
                db, document_id=doc_id, owner_id=current_user.id
            )
            if doc:
                documents.append(doc)
    
    elif search_params.start_date and search_params.end_date:
        # Search by date range
        extracted_data_list = crud.extracted_data.get_by_date_range(
            db,
            owner_id=current_user.id,
            start_date=search_params.start_date,
            end_date=search_params.end_date,
            skip=search_params.skip,
            limit=search_params.limit
        )
        
        # Get unique documents
        document_ids = list(set([ed.document_id for ed in extracted_data_list]))
        for doc_id in document_ids:
            doc = crud.pdf_document.get_with_extracted_data(
                db, document_id=doc_id, owner_id=current_user.id
            )
            if doc:
                documents.append(doc)
    
    else:
        # Get all documents
        documents = crud.pdf_document.get_by_owner(
            db,
            owner_id=current_user.id,
            skip=search_params.skip,
            limit=search_params.limit
        )
        
        # Load extracted data for each document
        for doc in documents:
            doc.extracted_data = crud.extracted_data.get_by_document(db, document_id=doc.id)
    
    return PDFSearchResponse(
        documents=documents,
        total=len(documents),
        skip=search_params.skip,
        limit=search_params.limit
    )


@router.delete("/documents/{document_id}")
def delete_document(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    document_id: int
) -> Any:
    """
    Delete a PDF document and its associated data.
    """
    document = crud.pdf_document.get_by_owner_and_id(
        db, owner_id=current_user.id, document_id=document_id
    )
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete the physical file
    file_storage.delete_file(document.file_path)
    
    # Delete from database (cascade will handle extracted_data)
    crud.pdf_document.remove(db, id=document_id)
    
    return {"message": "Document deleted successfully"}


@router.post("/documents/{document_id}/reprocess")
async def reprocess_document(
    *,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    document_id: int
) -> Any:
    """
    Reprocess a PDF document.
    """
    document = crud.pdf_document.get_by_owner_and_id(
        db, owner_id=current_user.id, document_id=document_id
    )
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Reset processing status
    document.processed = False
    document.processing_error = None
    db.add(document)
    db.commit()
    
    # Queue background processing
    background_tasks.add_task(process_pdf_background, document.id, document.file_path)
    
    return {"message": "Document queued for reprocessing"}