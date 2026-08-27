"""Storage usage API route."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.auth import User
from app.schemas.storage import StorageUsageResponse
from app.services.file_service import FileService

router = APIRouter(prefix="/api/storage", tags=["storage"])


@router.get("/usage", response_model=StorageUsageResponse)
def get_storage_usage(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = FileService(db)
    return svc.get_usage(user.id)
