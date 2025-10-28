import uuid

from sqlalchemy import text
from sqlmodel import Session, col, select

from app.crud.base import CRUDBase
from app.models.extracted_data import (
    ExtractedData,
    ExtractedDataCreate,
    ExtractedDataUpdate,
)
from app.models.pdf_document import PDFDocument


class CRUDExtractedData(CRUDBase[ExtractedData, ExtractedDataCreate, ExtractedDataUpdate]):
    def get_by_document(
        self, db: Session, *, document_id: int
    ) -> list[ExtractedData]:
        """Get extracted data by document ID."""
        statement = select(ExtractedData).where(ExtractedData.document_id == document_id)
        return list(db.exec(statement).all())

    def get_latest_by_document(
        self, db: Session, *, document_id: int
    ) -> ExtractedData | None:
        """Get the latest extracted data for a document."""
        statement = (
            select(ExtractedData)
            .where(ExtractedData.document_id == document_id)
            .order_by(text("created_at DESC"))
            .limit(1)
        )
        return db.exec(statement).first()

    def search(
        self, db: Session, *, owner_id: uuid.UUID, store_name: str | None = None,
        start_date: str | None = None, end_date: str | None = None, skip: int = 0, limit: int = 100
    ) -> list[ExtractedData]:
        """Search extracted data with optional filters for a specific owner."""
        statement = (
            select(ExtractedData)
            .join(PDFDocument)
            .where(PDFDocument.owner_id == owner_id)
        )

        # Add optional filters
        if store_name:
            statement = statement.where(col(ExtractedData.store_name).ilike(f"%{store_name}%"))

        if start_date and end_date:
            # Use raw SQL for date filtering to avoid type issues
            statement = statement.where(
                text("transaction_date IS NOT NULL"),
                text(f"transaction_date >= '{start_date}'"),
                text(f"transaction_date <= '{end_date}'")
            )

        statement = (
            statement
            .offset(skip)
            .limit(limit)
            .order_by(text("created_at DESC"))
        )

        return list(db.exec(statement).all())


extracted_data = CRUDExtractedData(ExtractedData)
