import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, Field


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
    processing_error: str | None = None
    created_at: datetime
    updated_at: datetime


class ExtractedDataResponse(BaseModel):
    id: int
    document_id: int

    # Store information
    store_name: str | None = None
    store_address: str | None = None
    store_phone: str | None = None

    # Receipt information
    receipt_number: str | None = None
    cashier_id: str | None = None
    register_number: str | None = None

    # Date and time
    transaction_date: str | None = None
    transaction_time: str | None = None

    # Financial totals
    subtotal: Decimal | None = None
    tax_amount: Decimal | None = None
    total_amount: Decimal | None = None
    payment_method: str | None = None

    # Items and metadata
    items: list[dict[str, Any]] | None = None
    tax_breakdown: dict[str, Any] | None = None
    extraction_confidence: float | None = None
    extra_metadata: dict[str, Any] | None = None

    created_at: datetime
    updated_at: datetime


class PDFDocumentWithDataResponse(PDFDocumentResponse):
    extracted_data: list[ExtractedDataResponse] = []


class PDFUploadResponse(BaseModel):
    message: str
    document_id: int
    filename: str
    processing_status: str = "queued"


class PDFProcessingStatus(BaseModel):
    document_id: int
    processed: bool
    processing_error: str | None = None
    extraction_confidence: float | None = None


class PDFSearchRequest(BaseModel):
    store_name: str | None = None
    start_date: str | None = Field(None, description="Date in YYYY-MM-DD format")
    end_date: str | None = Field(None, description="Date in YYYY-MM-DD format")
    skip: int = Field(0, ge=0)
    limit: int = Field(100, ge=1, le=1000)


class PDFSearchResponse(BaseModel):
    documents: list[PDFDocumentWithDataResponse]
    total: int
    skip: int
    limit: int
