import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile


class FileStorageService:
    """
    Service for handling file uploads and storage with security best practices.
    """

    ALLOWED_MIME_TYPES = {
        "application/pdf",
        "application/x-pdf",
    }

    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

    def __init__(self, upload_dir: str = "uploads"):
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(exist_ok=True)

        self.pdf_dir = self.upload_dir / "pdfs"
        self.pdf_dir.mkdir(exist_ok=True)

    async def validate_file(self, file: UploadFile) -> None:
        """Validate uploaded file for security and format requirements."""

        if file.size and file.size > self.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size is {self.MAX_FILE_SIZE // (1024*1024)}MB",
            )

        content = await file.read()
        await file.seek(0)

        if len(content) > self.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size is {self.MAX_FILE_SIZE // (1024*1024)}MB",
            )

        if file.content_type and file.content_type not in self.ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Only PDF files are allowed. Detected: {file.content_type}",
            )

        if file.filename:
            file_extension = Path(file.filename).suffix.lower()
            if file_extension != ".pdf":
                raise HTTPException(
                    status_code=400,
                    detail="Invalid file extension. Only .pdf files are allowed.",
                )

        if not content.startswith(b"%PDF-"):
            raise HTTPException(status_code=400, detail="Invalid PDF file format")

    async def save_file(self, file: UploadFile, user_id: str) -> tuple[str, str, int]:
        """
        Save uploaded file to storage.

        Returns:
            Tuple of (filename, file_path, file_size)
        """

        await self.validate_file(file)

        file_extension = Path(file.filename or "").suffix.lower()
        if not file_extension:
            file_extension = ".pdf"

        unique_filename = f"{uuid.uuid4()}{file_extension}"

        user_dir = self.pdf_dir / str(user_id)
        user_dir.mkdir(exist_ok=True)

        file_path = user_dir / unique_filename

        try:
            content = await file.read()
            with open(file_path, "wb") as f:
                f.write(content)

            return unique_filename, str(file_path), len(content)

        except Exception:
            if file_path.exists():
                file_path.unlink()
            raise HTTPException(status_code=500, detail="Error saving file")

    def read_file(self, file_path: str) -> bytes:
        """Read file content from storage."""
        path = Path(file_path)

        if not path.exists():
            raise HTTPException(status_code=404, detail="File not found")

        try:
            with open(path, "rb") as f:
                return f.read()
        except Exception:
            raise HTTPException(status_code=500, detail="Error reading file")

    def delete_file(self, file_path: str) -> bool:
        """Delete file from storage."""
        path = Path(file_path)

        try:
            if path.exists():
                path.unlink()
                return True
            return False
        except Exception:
            return False

    def get_file_info(self, file_path: str) -> dict | None:
        """Get file information."""
        path = Path(file_path)

        if not path.exists():
            return None

        try:
            stat = path.stat()
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Failed to read file info: {e}"
            )

        if stat.st_size > self.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size is {self.MAX_FILE_SIZE // (1024*1024)}MB",
            )

        return {
            "size": stat.st_size,
            "created": stat.st_ctime,
            "modified": stat.st_mtime,
            "exists": True,
        }


file_storage = FileStorageService()
