from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from decimal import Decimal
import uuid


class PDFDocumentBase(BaseModel):
    filename: str
    original_filename: str
    file_size: int
    content_type: str


class PDFDocumentCreate(PDFDocumentBase):
    pass


class PDFDocumentResponse(PDFDocumentBase):
    id: int
    owner_id: uuid.UUID
    processed: bool
    processing_error: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ExtractedDataResponse(BaseModel):
    id: int
    document_id: int
    
    # Store information
    store_name: Optional[str] = None
    store_address: Optional[str] = None
    store_phone: Optional[str] = None
    
    # Receipt information
    receipt_number: Optional[str] = None
    cashier_id: Optional[str] = None
    register_number: Optional[str] = None
    
    # Date and time
    transaction_date: Optional[str] = None
    transaction_time: Optional[str] = None
    
    # Financial totals
    subtotal: Optional[Decimal] = None
    tax_amount: Optional[Decimal] = None
    total_amount: Optional[Decimal] = None
    payment_method: Optional[str] = None
    
    # Items and metadata
    items: Optional[List[Dict[str, Any]]] = None
    tax_breakdown: Optional[Dict[str, Any]] = None
    extraction_confidence: Optional[float] = None
    extra_metadata: Optional[Dict[str, Any]] = None
    
    created_at: datetime
    updated_at: datetime


class PDFDocumentWithDataResponse(PDFDocumentResponse):
    extracted_data: List[ExtractedDataResponse] = []


class PDFUploadResponse(BaseModel):
    message: str
    document_id: int
    filename: str
    processing_status: str = "queued"


class PDFProcessingStatus(BaseModel):
    document_id: int
    processed: bool
    processing_error: Optional[str] = None
    extraction_confidence: Optional[float] = None


class PDFSearchRequest(BaseModel):
    store_name: Optional[str] = None
    start_date: Optional[str] = Field(None, description="Date in YYYY-MM-DD format")
    end_date: Optional[str] = Field(None, description="Date in YYYY-MM-DD format")
    skip: int = Field(0, ge=0)
    limit: int = Field(100, ge=1, le=1000)


class PDFSearchResponse(BaseModel):
    documents: List[PDFDocumentWithDataResponse]
    total: int
    skip: int
    limit: int