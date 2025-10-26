import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .extracted_data import ExtractedData
    from .user import User


class PDFDocumentBase(SQLModel):
    filename: str = Field(index=True)
    original_filename: str
    file_size: int
    content_type: str
    file_path: str
    processed: bool = Field(default=False)
    processing_error: str | None = None


class PDFDocument(PDFDocumentBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    owner_id: uuid.UUID = Field(foreign_key="user.id", nullable=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    owner: "User" = Relationship(back_populates="pdf_documents")
    extracted_data: list["ExtractedData"] = Relationship(back_populates="document", cascade_delete=True)


class PDFDocumentCreate(PDFDocumentBase):
    pass


class PDFDocumentRead(PDFDocumentBase):
    id: int
    owner_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class PDFDocumentUpdate(SQLModel):
    processed: bool | None = None
    processing_error: str | None = None
