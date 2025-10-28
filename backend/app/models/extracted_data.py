from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Any

from sqlmodel import JSON, Column, Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .pdf_document import PDFDocument


class ExtractedDataBase(SQLModel):
    # Store information
    store_name: str | None = None
    store_address: str | None = None
    store_phone: str | None = None

    # Receipt information
    receipt_number: str | None = None
    cashier_id: str | None = None
    register_number: str | None = None

    # Date and time
    transaction_date: date | None = None
    transaction_time: str | None = None

    # Financial totals
    subtotal: Decimal | None = None
    tax_amount: Decimal | None = None
    total_amount: Decimal | None = None
    payment_method: str | None = None

    # Items data (stored as JSON)
    items: list[dict[str, Any]] | None = Field(default=None, sa_column=Column(JSON))

    # Tax breakdown data (stored as JSON)
    tax_breakdown: dict[str, Any] | None = Field(default=None, sa_column=Column(JSON))

    # Raw extracted text
    raw_text: str | None = None

    # Confidence scores
    extraction_confidence: float | None = Field(default=0.0, ge=0.0, le=1.0)

    # Additional metadata
    extra_metadata: dict[str, Any] | None = Field(default=None, sa_column=Column(JSON))


class ExtractedData(ExtractedDataBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    document_id: int = Field(foreign_key="pdfdocument.id", nullable=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    document: "PDFDocument" = Relationship(back_populates="extracted_data")


class ExtractedDataCreate(ExtractedDataBase):
    document_id: int


class ExtractedDataRead(ExtractedDataBase):
    id: int
    document_id: int
    created_at: datetime
    updated_at: datetime


class ExtractedDataUpdate(SQLModel):
    store_name: str | None = None
    store_address: str | None = None
    subtotal: Decimal | None = None
    tax_amount: Decimal | None = None
    total_amount: Decimal | None = None
    items: dict[str, Any] | None = None
    extraction_confidence: float | None = None
