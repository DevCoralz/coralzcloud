"""Folder API routes — thin controllers, no business logic here."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.auth import User
from app.schemas.storage import FolderCreate, FolderResponse
from app.services.folder_service import FolderService

router = APIRouter(prefix="/api/folders", tags=["folders"])


@router.post("", response_model=FolderResponse, status_code=status.HTTP_201_CREATED)
def create_folder(
    payload: FolderCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = FolderService(db)
    try:
        folder = svc.create_folder(user.id, payload.name, payload.parent_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    return folder


@router.get("", response_model=list[FolderResponse])
def list_folders(
    parentId: int | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = FolderService(db)
    return svc.list_folders(user.id, parentId)


@router.delete("/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_folder(
    folder_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = FolderService(db)
    try:
        svc.delete_folder(user.id, folder_id)
    except FileNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
