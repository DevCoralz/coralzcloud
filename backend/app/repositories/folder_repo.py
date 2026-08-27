"""Repository for folder CRUD operations."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.storage import Folder


class FolderRepository:
    """Handles all database operations for folders."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: int, name: str, parent_id: int | None = None) -> Folder:
        folder = Folder(user_id=user_id, name=name, parent_id=parent_id)
        self.db.add(folder)
        self.db.flush()
        self.db.refresh(folder)
        return folder

    def get_by_id(self, folder_id: int, user_id: int) -> Folder | None:
        return self.db.scalar(
            select(Folder).where(
                Folder.id == folder_id,
                Folder.user_id == user_id,
            )
        )

    def find_duplicate(self, user_id: int, name: str, parent_id: int | None) -> Folder | None:
        return self.db.scalar(
            select(Folder).where(
                Folder.user_id == user_id,
                Folder.parent_id == parent_id,
                Folder.name == name,
            )
        )

    def list_root(self, user_id: int) -> list[Folder]:
        return list(
            self.db.scalars(
                select(Folder)
                .where(Folder.user_id == user_id, Folder.parent_id.is_(None))
                .order_by(Folder.name)
            ).all()
        )

    def list_children(self, user_id: int, parent_id: int) -> list[Folder]:
        return list(
            self.db.scalars(
                select(Folder)
                .where(Folder.user_id == user_id, Folder.parent_id == parent_id)
                .order_by(Folder.name)
            ).all()
        )

    def has_children(self, folder_id: int) -> bool:
        return self.db.scalar(
            select(Folder).where(Folder.parent_id == folder_id).limit(1)
        ) is not None

    def delete(self, folder: Folder) -> None:
        self.db.delete(folder)
        self.db.flush()
