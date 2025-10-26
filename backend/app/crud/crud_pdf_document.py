import uuid

from sqlalchemy import desc
from sqlmodel import Session, select

from app.crud.base import CRUDBase
from app.models.extracted_data import ExtractedData
from app.models.pdf_document import PDFDocument, PDFDocumentCreate, PDFDocumentUpdate


class CRUDPDFDocument(CRUDBase[PDFDocument, PDFDocumentCreate, PDFDocumentUpdate]):
    def get_by_owner(
        self, db: Session, *, owner_id: uuid.UUID, skip: int = 0, limit: int = 100
    ) -> list[PDFDocument]:
        """Get PDF documents by owner."""
        statement = (
            select(PDFDocument)
            .where(PDFDocument.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
            .order_by(desc(PDFDocument.created_at))
        )
        return db.exec(statement).all()

    def get_by_owner_and_id(
        self, db: Session, *, owner_id: uuid.UUID, document_id: int
    ) -> PDFDocument | None:
        """Get a specific PDF document by owner and document ID."""
        statement = select(PDFDocument).where(
            PDFDocument.owner_id == owner_id,
            PDFDocument.id == document_id
        )
        return db.exec(statement).first()

    def get_unprocessed(
        self, db: Session, *, limit: int = 10
    ) -> list[PDFDocument]:
        """Get unprocessed PDF documents for batch processing."""
        statement = (
            select(PDFDocument)
            .where(PDFDocument.processed == False)
            .limit(limit)
            .order_by(PDFDocument.created_at.asc())
        )
        return db.exec(statement).all()

    def mark_as_processed(
        self, db: Session, *, document_id: int, error: str | None = None
    ) -> PDFDocument | None:
        """Mark document as processed."""
        document = db.get(PDFDocument, document_id)
        if document:
            document.processed = True
            if error:
                document.processing_error = error
            db.add(document)
            db.commit()
            db.refresh(document)
        return document

    def get_with_extracted_data(
        self, db: Session, *, document_id: int, owner_id: uuid.UUID
    ) -> PDFDocument | None:
        """Get document with its extracted data."""
        statement = (
            select(PDFDocument)
            .where(
                PDFDocument.id == document_id,
                PDFDocument.owner_id == owner_id
            )
        )
        document = db.exec(statement).first()
        if document:
            # Load extracted data
            extracted_statement = select(ExtractedData).where(
                ExtractedData.document_id == document_id
            )
            document.extracted_data = list(db.exec(extracted_statement).all())
        return document


pdf_document = CRUDPDFDocument(PDFDocument)
