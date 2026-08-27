"""Repository for storage usage tracking."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.storage import StorageUsage


class StorageUsageRepository:
    """Tracks per-user storage consumption."""

    def __init__(self, db: Session):
        self.db = db

    def get_or_create(self, user_id: int) -> StorageUsage:
        usage = self.db.scalar(
            select(StorageUsage).where(StorageUsage.user_id == user_id)
        )
        if usage is None:
            usage = StorageUsage(user_id=user_id, used_bytes=0)
            self.db.add(usage)
            self.db.flush()
        return usage

    def add_bytes(self, user_id: int, size_bytes: int) -> StorageUsage:
        usage = self.get_or_create(user_id)
        usage.used_bytes += size_bytes
        self.db.flush()
        return usage

    def subtract_bytes(self, user_id: int, size_bytes: int) -> StorageUsage:
        usage = self.get_or_create(user_id)
        usage.used_bytes = max(0, usage.used_bytes - size_bytes)
        self.db.flush()
        return usage

    def recalculate(self, user_id: int, actual_bytes: int) -> StorageUsage:
        """Force-set usage to actual bytes (for reconciliation)."""
        usage = self.get_or_create(user_id)
        usage.used_bytes = actual_bytes
        self.db.flush()
        return usage
