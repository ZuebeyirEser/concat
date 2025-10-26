import uuid

from sqlalchemy import desc
from sqlmodel import Session, select

from app.crud.base import CRUDBase
from app.models.extracted_data import (
    ExtractedData,
    ExtractedDataCreate,
    ExtractedDataUpdate,
)


class CRUDExtractedData(CRUDBase[ExtractedData, ExtractedDataCreate, ExtractedDataUpdate]):
    def get_by_document(
        self, db: Session, *, document_id: int
    ) -> list[ExtractedData]:
        """Get extracted data by document ID."""
        statement = select(ExtractedData).where(ExtractedData.document_id == document_id)
        return db.exec(statement).all()

    def get_latest_by_document(
        self, db: Session, *, document_id: int
    ) -> ExtractedData | None:
        """Get the latest extracted data for a document."""
        statement = (
            select(ExtractedData)
            .where(ExtractedData.document_id == document_id)
            .order_by(desc(ExtractedData.created_at))
            .limit(1)
        )
        return db.exec(statement).first()

    def search_by_store(
        self, db: Session, *, store_name: str, owner_id: uuid.UUID, skip: int = 0, limit: int = 100
    ) -> list[ExtractedData]:
        """Search extracted data by store name for a specific owner."""
        statement = (
            select(ExtractedData)
            .join(ExtractedData.document)
            .where(
                ExtractedData.store_name.ilike(f"%{store_name}%"),
                ExtractedData.document.has(owner_id=owner_id)
            )
            .offset(skip)
            .limit(limit)
            .order_by(desc(ExtractedData.created_at))
        )
        return db.exec(statement).all()

    def get_by_date_range(
        self, db: Session, *, owner_id: uuid.UUID, start_date: str, end_date: str,
        skip: int = 0, limit: int = 100
    ) -> list[ExtractedData]:
        """Get extracted data by transaction date range for a specific owner."""
        statement = (
            select(ExtractedData)
            .join(ExtractedData.document)
            .where(
                ExtractedData.transaction_date >= start_date,
                ExtractedData.transaction_date <= end_date,
                ExtractedData.document.has(owner_id=owner_id)
            )
            .offset(skip)
            .limit(limit)
            .order_by(desc(ExtractedData.transaction_date))
        )
        return db.exec(statement).all()


extracted_data = CRUDExtractedData(ExtractedData)
