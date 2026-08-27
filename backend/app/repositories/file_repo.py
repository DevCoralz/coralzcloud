"""Repository for file CRUD operations."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.storage import File


class FileRepository:
    """Handles all database operations for files."""

    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        user_id: int,
        original_name: str,
        storage_key: str,
        mime_type: str | None,
        size_bytes: int,
        folder_id: int | None = None,
    ) -> File:
        record = File(
            user_id=user_id,
            folder_id=folder_id,
            original_name=original_name,
            storage_key=storage_key,
            mime_type=mime_type,
            size_bytes=size_bytes,
        )
        self.db.add(record)
        self.db.flush()
        self.db.refresh(record)
        return record

    def get_by_id(self, file_id: int, user_id: int) -> File | None:
        return self.db.scalar(
            select(File).where(
                File.id == file_id,
                File.user_id == user_id,
            )
        )

    def list_root(self, user_id: int) -> list[File]:
        return list(
            self.db.scalars(
                select(File)
                .where(File.user_id == user_id, File.folder_id.is_(None))
                .order_by(File.created_at.desc())
            ).all()
        )

    def list_in_folder(self, user_id: int, folder_id: int) -> list[File]:
        return list(
            self.db.scalars(
                select(File)
                .where(File.user_id == user_id, File.folder_id == folder_id)
                .order_by(File.created_at.desc())
            ).all()
        )

    def delete(self, record: File) -> None:
        self.db.delete(record)
        self.db.flush()

    def sum_size_by_user(self, user_id: int) -> int:
        from sqlalchemy import func

        result = self.db.scalar(
            select(func.coalesce(func.sum(File.size_bytes), 0)).where(
                File.user_id == user_id
            )
        )
        return result or 0
