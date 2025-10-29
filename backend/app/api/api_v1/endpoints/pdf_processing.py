import logging
import traceback
from typing import Any

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile
from sqlmodel import Session

from app import crud
from app.api import deps
from app.core.db import get_db
from app.models import User
from app.schemas.pdf_document import (
    ExtractedDataResponse,
    PDFDocumentWithDataResponse,
    PDFProcessingStatus,
    PDFSearchRequest,
    PDFSearchResponse,
    PDFUploadResponse,
)
from app.services.file_storage import file_storage
from app.services.pdf_processor import pdf_processor
from app.services.product_integration import product_integration

logger = logging.getLogger(__name__)
router = APIRouter()


async def process_pdf_background(document_id: int, file_path: str):
    """Background task to process PDF and extract data."""
    from sqlmodel import Session

    from app.core.db import engine

    with Session(engine) as db:
        try:
            logger.info(f"Starting background processing for document {document_id}")

            # Get the document
            document = crud.pdf_document.get(db, id=document_id)
            if not document:
                logger.error(f"Document {document_id} not found")
                return

            logger.info(f"Found document: {document.original_filename}")

            # Read the PDF file
            logger.info(f"Reading PDF file from: {file_path}")
            pdf_content = file_storage.read_file(file_path)
            logger.info(f"PDF file size: {len(pdf_content)} bytes")

            # Process the PDF
            logger.info("Starting PDF processing...")
            try:
                extracted_info = pdf_processor.process_receipt(pdf_content)
                logger.info(f"PDF processing completed. Extracted {len(extracted_info)} fields")
                logger.info(f"Sample extracted data: {list(extracted_info.keys())}")
            except Exception as process_error:
                logger.error(f"PDF processing failed: {process_error}")
                logger.error(f"PDF processing traceback: {traceback.format_exc()}")
                raise process_error

            # Convert date objects to strings for database storage
            if extracted_info.get('transaction_date') and hasattr(extracted_info['transaction_date'], 'isoformat'):
                extracted_info['transaction_date'] = extracted_info['transaction_date'].isoformat()
                logger.info(f"Converted transaction_date to string: {extracted_info['transaction_date']}")

            # Convert Decimal objects to float for JSON serialization
            for key in ['subtotal', 'tax_amount', 'total_amount']:
                if extracted_info.get(key) is not None:
                    try:
                        extracted_info[key] = float(extracted_info[key])
                        logger.info(f"Converted {key} to float: {extracted_info[key]}")
                    except (TypeError, ValueError) as e:
                        logger.warning(f"Could not convert {key} to float: {e}")
                        extracted_info[key] = None

            # Ensure items is a list
            if extracted_info.get('items') is None:
                extracted_info['items'] = []

            # Ensure tax_breakdown is a dict
            if extracted_info.get('tax_breakdown') is None:
                extracted_info['tax_breakdown'] = {}

            # Save extracted data
            from app.models.extracted_data import ExtractedDataCreate

            extracted_data_create = ExtractedDataCreate(
                document_id=document_id,
                **extracted_info
            )

            logger.info("Creating extracted data record...")
            logger.info(f"Items count: {len(extracted_info.get('items', []))}")
            logger.info(f"Store name: {extracted_info.get('store_name')}")
            logger.info(f"Total amount: {extracted_info.get('total_amount')}")

            try:
                extracted_data_record = crud.extracted_data.create(db, obj_in=extracted_data_create)
                logger.info(f"Created extracted data record with ID: {extracted_data_record.id}")
            except Exception as db_error:
                logger.error(f"Database error creating extracted data: {db_error}")
                logger.error(f"Database error traceback: {traceback.format_exc()}")
                logger.error(f"Data being saved: {extracted_data_create}")
                raise db_error

            # Process products from receipt items
            logger.info("Starting product matching and creation...")
            try:
                product_results = product_integration.process_receipt_items(
                    db, extracted_data_record, document.owner_id, auto_create_products=True
                )
                logger.info(f"Product processing results: {product_results['total_items']} items, "
                           f"{len(product_results['matched_items'])} matched, "
                           f"{len(product_results['created_products'])} new products created")
            except Exception as product_error:
                logger.error(f"Product processing failed: {product_error}")
                logger.error(f"Product processing traceback: {traceback.format_exc()}")
                # Continue processing even if product matching fails
                logger.info("Continuing with document processing despite product matching failure")
            
            # Mark document as processed
            try:
                crud.pdf_document.mark_as_processed(db, document_id=document_id)
                logger.info(f"Marked document {document_id} as processed")
            except Exception as mark_error:
                logger.error(f"Failed to mark document as processed: {mark_error}")
                # Rollback and try again with a fresh transaction
                db.rollback()
                try:
                    crud.pdf_document.mark_as_processed(db, document_id=document_id)
                    logger.info(f"Marked document {document_id} as processed after rollback")
                except Exception as final_error:
                    logger.error(f"Final attempt to mark document failed: {final_error}")

            logger.info(f"Successfully processed PDF document {document_id}")

        except Exception as e:
            logger.error(f"Error processing PDF {document_id}: {e}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            # Mark document as processed with error
            try:
                db.rollback()  # Rollback any failed transaction first
                crud.pdf_document.mark_as_processed(db, document_id=document_id, error=str(e))
                logger.info(f"Marked document {document_id} as processed with error")
            except Exception as mark_error:
                logger.error(f"Failed to mark document as processed with error: {mark_error}")
                # Try one more time with a completely fresh session
                try:
                    with Session(engine) as fresh_db:
                        crud.pdf_document.mark_as_processed(fresh_db, document_id=document_id, error=str(e))
                        logger.info(f"Marked document {document_id} as processed with error using fresh session")
                except Exception as final_mark_error:
                    logger.error(f"Final attempt to mark document with error failed: {final_mark_error}")


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
        from app.models.pdf_document import PDFDocument

        document = PDFDocument(
            filename=filename,
            original_filename=file.filename or "unknown.pdf",
            file_size=file_size,
            content_type=file.content_type or "application/pdf",
            file_path=file_path,
            owner_id=current_user.id
        )

        db.add(document)
        db.commit()
        db.refresh(document)

        # Ensure document ID is not None after commit
        if document.id is None:
            raise HTTPException(status_code=500, detail="Failed to create document")

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


@router.get("/documents", response_model=list[PDFDocumentWithDataResponse])
def get_user_documents(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Get all PDF documents for the current user with extracted data.
    """
    documents = crud.pdf_document.get_by_owner(
        db, owner_id=current_user.id, skip=skip, limit=limit
    )

    # Load extracted data for each document and convert to proper format
    result = []
    for document in documents:
        # Load extracted data for this document
        if document.id is not None:
            extracted_data = crud.extracted_data.get_by_document(db, document_id=document.id)
        else:
            extracted_data = []

        # Convert to response format
        response_data: dict[str, Any] = {
            "id": document.id,
            "filename": document.filename,
            "original_filename": document.original_filename,
            "file_size": document.file_size,
            "content_type": document.content_type,
            "processed": document.processed,
            "processing_error": document.processing_error,
            "created_at": document.created_at,
            "updated_at": document.updated_at,
            "owner_id": document.owner_id,
            "extracted_data": []
        }

        # Convert extracted data to proper format
        for data in extracted_data:
            extracted_dict = {
                "id": data.id,
                "document_id": data.document_id,
                "store_name": data.store_name,
                "store_address": data.store_address,
                "store_phone": data.store_phone,
                "receipt_number": data.receipt_number,
                "cashier_id": data.cashier_id,
                "register_number": data.register_number,
                "transaction_date": data.transaction_date.isoformat() if data.transaction_date else None,
                "transaction_time": data.transaction_time,
                "subtotal": data.subtotal,
                "tax_amount": data.tax_amount,
                "total_amount": data.total_amount,
                "payment_method": data.payment_method,
                "items": data.items,
                "tax_breakdown": data.tax_breakdown,
                "extraction_confidence": data.extraction_confidence,
                "extra_metadata": data.extra_metadata,
                "created_at": data.created_at,
                "updated_at": data.updated_at
            }
            response_data["extracted_data"].append(extracted_dict)

        result.append(response_data)

    return result


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
    try:
        logger.info(f"Getting document {document_id} for user {current_user.id}")
        document = crud.pdf_document.get_with_extracted_data(
            db, document_id=document_id, owner_id=current_user.id
        )

        if not document:
            logger.warning(f"Document {document_id} not found for user {current_user.id}")
            raise HTTPException(status_code=404, detail="Document not found")

        logger.info(f"Found document {document_id} with {len(document.extracted_data)} extracted data records")

        # Convert SQLModel to Pydantic-compatible dict
        response_data: dict[str, Any] = {
            "id": document.id,
            "filename": document.filename,
            "original_filename": document.original_filename,
            "file_size": document.file_size,
            "content_type": document.content_type,
            "processed": document.processed,
            "processing_error": document.processing_error,
            "created_at": document.created_at,
            "updated_at": document.updated_at,
            "owner_id": document.owner_id,
            "extracted_data": []
        }

        # Convert extracted data to proper format
        for data in document.extracted_data:
            extracted_dict = {
                "id": data.id,
                "document_id": data.document_id,
                "store_name": data.store_name,
                "store_address": data.store_address,
                "store_phone": data.store_phone,
                "receipt_number": data.receipt_number,
                "cashier_id": data.cashier_id,
                "register_number": data.register_number,
                "transaction_date": data.transaction_date.isoformat() if data.transaction_date else None,
                "transaction_time": data.transaction_time,
                "subtotal": data.subtotal,
                "tax_amount": data.tax_amount,
                "total_amount": data.total_amount,
                "payment_method": data.payment_method,
                "items": data.items,
                "tax_breakdown": data.tax_breakdown,
                "extraction_confidence": data.extraction_confidence,
                "extra_metadata": data.extra_metadata,
                "created_at": data.created_at,
                "updated_at": data.updated_at
            }
            response_data["extracted_data"].append(extracted_dict)

        return response_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting document {document_id}: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


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
    try:
        logger.info(f"Getting status for document {document_id} for user {current_user.id}")
        document = crud.pdf_document.get_by_owner_and_id(
            db, owner_id=current_user.id, document_id=document_id
        )

        if not document:
            logger.warning(f"Document {document_id} not found for user {current_user.id}")
            raise HTTPException(status_code=404, detail="Document not found")

        logger.info(f"Document {document_id} status: processed={document.processed}, error={document.processing_error}")

        # Get latest extracted data for confidence score
        extracted_data = crud.extracted_data.get_latest_by_document(db, document_id=document_id)
        logger.info(f"Found extracted data: {extracted_data is not None}")

        return PDFProcessingStatus(
            document_id=document_id,  # Use the parameter instead of document.id
            processed=document.processed,
            processing_error=document.processing_error,
            extraction_confidence=extracted_data.extraction_confidence if extracted_data else None
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting status for document {document_id}: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


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

    if search_params.store_name or (search_params.start_date and search_params.end_date):
        # Search with filters
        extracted_data_list = crud.extracted_data.search(
            db,
            owner_id=current_user.id,
            store_name=search_params.store_name,
            start_date=search_params.start_date,
            end_date=search_params.end_date,
            skip=search_params.skip,
            limit=search_params.limit
        )

        # Get unique documents with extracted data
        document_ids = list({ed.document_id for ed in extracted_data_list})
        documents = crud.pdf_document.get_multiple_with_extracted_data(
            db, document_ids=document_ids, owner_id=current_user.id
        )

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
            if doc.id is not None:
                doc.extracted_data = crud.extracted_data.get_by_document(db, document_id=doc.id)

    # Convert documents to response format
    response_documents = []
    for document in documents:
        # Convert extracted data to proper format if it exists
        extracted_data_responses = []
        if hasattr(document, 'extracted_data') and document.extracted_data:
            for data in document.extracted_data:
                # Skip if data.id is None (shouldn't happen in practice)
                if data.id is None:
                    continue
                extracted_response = ExtractedDataResponse(
                    id=data.id,
                    document_id=data.document_id,
                    store_name=data.store_name,
                    store_address=data.store_address,
                    store_phone=data.store_phone,
                    receipt_number=data.receipt_number,
                    cashier_id=data.cashier_id,
                    register_number=data.register_number,
                    transaction_date=data.transaction_date.isoformat() if data.transaction_date else None,
                    transaction_time=data.transaction_time,
                    subtotal=data.subtotal,
                    tax_amount=data.tax_amount,
                    total_amount=data.total_amount,
                    payment_method=data.payment_method,
                    items=data.items,
                    tax_breakdown=data.tax_breakdown,
                    extraction_confidence=data.extraction_confidence,
                    extra_metadata=data.extra_metadata,
                    created_at=data.created_at,
                    updated_at=data.updated_at
                )
                extracted_data_responses.append(extracted_response)

        if document.id is None:
            continue
        # Create document response
        document_response = PDFDocumentWithDataResponse(
            id=document.id,
            filename=document.filename,
            original_filename=document.original_filename,
            file_size=document.file_size,
            content_type=document.content_type,
            processed=document.processed,
            processing_error=document.processing_error,
            created_at=document.created_at,
            updated_at=document.updated_at,
            owner_id=document.owner_id,
            extracted_data=extracted_data_responses
        )
        response_documents.append(document_response)

    return PDFSearchResponse(
        documents=response_documents,
        total=len(response_documents),
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
    db.refresh(document)

    # Ensure document ID is not None
    if document.id is None:
        raise HTTPException(status_code=500, detail="Document ID is missing")

    # Queue background processing
    background_tasks.add_task(process_pdf_background, document.id, document.file_path)

    return {"message": "Document queued for reprocessing"}


@router.post("/documents/{document_id}/mark-processed")
async def mark_document_processed(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    document_id: int
) -> Any:
    """
    Manually mark a document as processed (for debugging stuck documents).
    """
    document = crud.pdf_document.get_by_owner_and_id(
        db, owner_id=current_user.id, document_id=document_id
    )

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Mark as processed
    crud.pdf_document.mark_as_processed(db, document_id=document_id)

    return {"message": "Document marked as processed"}


@router.post("/documents/{document_id}/create-products")
async def create_products_from_document(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    document_id: int
) -> Any:
    """
    Manually create products from a processed document's items.
    """
    document = crud.pdf_document.get_by_owner_and_id(
        db, owner_id=current_user.id, document_id=document_id
    )

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Get extracted data
    extracted_data_list = crud.extracted_data.get_by_document(db, document_id=document_id)
    
    if not extracted_data_list:
        raise HTTPException(status_code=404, detail="No extracted data found for this document")
    
    extracted_data = extracted_data_list[0]  # Get the first (and usually only) extracted data record
    
    # Process products
    try:
        product_results = product_integration.process_receipt_items(
            db, extracted_data, current_user.id, auto_create_products=True
        )
        
        return {
            "message": "Products created successfully",
            "results": product_results
        }
    except Exception as e:
        logger.error(f"Error creating products from document {document_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating products: {str(e)}")
