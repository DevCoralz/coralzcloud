"""
File storage service — orchestration layer.

Coordinates between the DB repository layer and the Telegram MTProto client.
All methods are async to work properly inside FastAPI's event loop.
"""

from __future__ import annotations

import math

from sqlalchemy.orm import Session

from app.repositories.file_repo import FileRepository
from app.repositories.usage_repo import StorageUsageRepository
from app.services.telegram_client import tg_client

MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 * 1024
DEFAULT_STORAGE_LIMIT_BYTES = 5 * 1024 * 1024 * 1024


class FileService:
    """Business logic for file upload, download, delete, and listing."""

    def __init__(self, db: Session):
        self.db = db
        self.files = FileRepository(db)
        self.usage = StorageUsageRepository(db)

    def validate_upload(self, size_bytes: int, user_id: int) -> None:
        from app.models.auth import User
        from app.models.storage import Plan

        user = self.db.get(User, user_id)
        if user and user.plan_id:
            plan = self.db.get(Plan, user.plan_id)
            if plan:
                max_upload = plan.max_upload_bytes
                storage_limit = plan.storage_limit_bytes
            else:
                max_upload = MAX_FILE_SIZE_BYTES
                storage_limit = DEFAULT_STORAGE_LIMIT_BYTES
        else:
            max_upload = MAX_FILE_SIZE_BYTES
            storage_limit = DEFAULT_STORAGE_LIMIT_BYTES

        if size_bytes > max_upload:
            raise ValueError(f"File exceeds plan upload limit of {max_upload // (1024*1024*1024)} GB")

        current = self.usage.get_or_create(user_id)
        if current.used_bytes + size_bytes > storage_limit:
            raise ValueError("Storage limit reached. Please upgrade your plan.")

    async def upload_file(
        self,
        user_id: int,
        file_bytes: bytes,
        filename: str,
        mime_type: str,
        folder_id: int | None = None,
    ):
        self.validate_upload(len(file_bytes), user_id)

        result = await tg_client.upload(file_bytes, filename, mime_type)

        record = self.files.create(
            user_id=user_id,
            original_name=filename,
            storage_key=result["storage_key"],
            mime_type=mime_type,
            size_bytes=len(file_bytes),
            folder_id=folder_id,
        )

        self.usage.add_bytes(user_id, len(file_bytes))
        self.db.commit()
        return record

    async def download_file(self, user_id: int, file_id: int) -> tuple[bytes, str, str]:
        record = self.files.get_by_id(file_id, user_id)
        if record is None:
            raise FileNotFoundError("File not found")
        if not record.storage_key or not record.storage_key.strip():
            raise ValueError("File is empty (no content stored)")

        file_bytes = await tg_client.download(record.storage_key)
        return file_bytes, record.original_name, record.mime_type or "application/octet-stream"

    async def delete_file(self, user_id: int, file_id: int) -> None:
        record = self.files.get_by_id(file_id, user_id)
        if record is None:
            raise FileNotFoundError("File not found")

        if record.storage_key and record.storage_key.strip():
            await tg_client.delete(record.storage_key)

        self.usage.subtract_bytes(user_id, record.size_bytes)
        self.files.delete(record)
        self.db.commit()

    def list_files(self, user_id: int, folder_id: int | None = None) -> list:
        if folder_id is not None:
            return self.files.list_in_folder(user_id, folder_id)
        return self.files.list_root(user_id)

    def get_usage(self, user_id: int) -> dict:
        from app.models.auth import User
        from app.models.storage import Plan

        current = self.usage.get_or_create(user_id)
        used = current.used_bytes

        user = self.db.get(User, user_id)
        if user and user.plan_id:
            plan = self.db.get(Plan, user.plan_id)
            if plan:
                limit = plan.storage_limit_bytes
            else:
                limit = DEFAULT_STORAGE_LIMIT_BYTES
        else:
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
    if size_bytes == 0:
        return "0 B"
    units = ["B", "KB", "MB", "GB", "TB"]
    i = int(math.floor(math.log(size_bytes, 1024)))
    i = min(i, len(units) - 1)
    val = size_bytes / (1024**i)
    return f"{val:.1f} {units[i]}"
