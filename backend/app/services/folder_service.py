"""
Folder business logic service.
"""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.repositories.folder_repo import FolderRepository
from app.repositories.file_repo import FileRepository


class FolderService:
    """Business logic for folder operations."""

    def __init__(self, db: Session):
        self.db = db
        self.folders = FolderRepository(db)

    def create_folder(
        self, user_id: int, name: str, parent_id: int | None = None
    ) -> dict:
        """Create a new folder. Raises ValueError on duplicate."""
        existing = self.folders.find_duplicate(user_id, name, parent_id)
        if existing:
            raise ValueError("A folder with this name already exists here")

        folder = self.folders.create(user_id, name, parent_id)
        self.db.commit()
        return folder

    def list_folders(self, user_id: int, parent_id: int | None = None) -> list:
        """List folders at root level or inside a parent."""
        if parent_id is not None:
            return self.folders.list_children(user_id, parent_id)
        return self.folders.list_root(user_id)

    def delete_folder(self, user_id: int, folder_id: int) -> None:
        """Delete a folder. Raises if not found, has children, or has files."""
        folder = self.folders.get_by_id(folder_id, user_id)
        if folder is None:
            raise FileNotFoundError("Folder not found")

        if self.folders.has_children(folder_id):
            raise ValueError("Cannot delete folder that contains subfolders")

        files_repo = FileRepository(self.db)
        files_in_folder = files_repo.list_in_folder(user_id, folder_id)
        if files_in_folder:
            raise ValueError(f"Cannot delete folder: it contains {len(files_in_folder)} file(s). Move or delete them first.")

        self.folders.delete(folder)
        self.db.commit()
