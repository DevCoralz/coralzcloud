"""
File storage service — orchestration layer.

Coordinates between the DB repository layer and the Telegram MTProto client.
Contains all business logic for file operations. No FastAPI dependencies here.
"""

from __future__ import annotations

import math

from sqlalchemy.orm import Session

from app.repositories.file_repo import FileRepository
from app.repositories.usage_repo import StorageUsageRepository
from app.services.telegram_client import tg_client

# 2 GB per file — Telegram user account limit
MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 * 1024

# 5 GB default plan limit per user
DEFAULT_STORAGE_LIMIT_BYTES = 5 * 1024 * 1024 * 1024


class FileService:
    """Business logic for file upload, download, delete, and listing."""

    def __init__(self, db: Session):
        self.db = db
        self.files = FileRepository(db)
        self.usage = StorageUsageRepository(db)

    def validate_upload(self, size_bytes: int, user_id: int) -> None:
        """Raise ValueError if the upload would exceed limits."""
        if size_bytes > MAX_FILE_SIZE_BYTES:
            raise ValueError(f"File exceeds {MAX_FILE_SIZE_BYTES // (1024*1024*1024)} GB limit")

        current = self.usage.get_or_create(user_id)
        if current.used_bytes + size_bytes > DEFAULT_STORAGE_LIMIT_BYTES:
            raise ValueError("Storage limit reached. Please upgrade your plan.")

    def upload_file(
        self,
        user_id: int,
        file_bytes: bytes,
        filename: str,
        mime_type: str,
        folder_id: int | None = None,
    ) -> dict:
        """Upload a file to Telegram and record it in the DB."""
        self.validate_upload(len(file_bytes), user_id)

        # Upload to Telegram channel
        result = tg_client.run_async(
            tg_client.upload(file_bytes, filename, mime_type)
        )

        # Persist to DB
        record = self.files.create(
            user_id=user_id,
            original_name=filename,
            storage_key=result["storage_key"],
            mime_type=mime_type,
            size_bytes=len(file_bytes),
            folder_id=folder_id,
        )

        # Update usage
        self.usage.add_bytes(user_id, len(file_bytes))
        self.db.commit()

        return record

    def download_file(self, user_id: int, file_id: int) -> tuple[bytes, str, str]:
        """Download a file. Returns (bytes, filename, mime_type)."""
        record = self.files.get_by_id(file_id, user_id)
        if record is None:
            raise FileNotFoundError("File not found")
        if not record.storage_key:
            raise ValueError("File has no storage key")

        file_bytes = tg_client.run_async(tg_client.download(record.storage_key))
        return file_bytes, record.original_name, record.mime_type or "application/octet-stream"

    def delete_file(self, user_id: int, file_id: int) -> None:
        """Delete a file from Telegram and the DB."""
        record = self.files.get_by_id(file_id, user_id)
        if record is None:
            raise FileNotFoundError("File not found")

        # Delete from Telegram
        if record.storage_key:
            tg_client.run_async(tg_client.delete(record.storage_key))

        # Update usage and remove DB record
        self.usage.subtract_bytes(user_id, record.size_bytes)
        self.files.delete(record)
        self.db.commit()

    def list_files(self, user_id: int, folder_id: int | None = None) -> list:
        """List files in root or a specific folder."""
        if folder_id is not None:
            return self.files.list_in_folder(user_id, folder_id)
        return self.files.list_root(user_id)

    def get_usage(self, user_id: int) -> dict:
        """Get formatted storage usage for a user."""
        current = self.usage.get_or_create(user_id)
        used = current.used_bytes
        limit = DEFAULT_STORAGE_LIMIT_BYTES
        percent = int((used / limit) * 100) if limit > 0 else 0

        return {
            "used_bytes": used,
            "used_label": _format_size(used),
            "total_label": _format_size(limit),
            "free_label": f"{_format_size(limit - used)} free",
            "percent": min(percent, 100),
        }


def _format_size(size_bytes: int) -> str:
    """Convert bytes to human-readable string."""
    if size_bytes == 0:
        return "0 B"
    units = ["B", "KB", "MB", "GB", "TB"]
    i = int(math.floor(math.log(size_bytes, 1024)))
    i = min(i, len(units) - 1)
    val = size_bytes / (1024**i)
    return f"{val:.1f} {units[i]}"
