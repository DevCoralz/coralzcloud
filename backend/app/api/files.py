"""File API routes — upload, list, download, delete."""

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.auth import User
from app.schemas.storage import FileCreate, FileResponse, FileUploadResponse
from app.services.file_service import FileService

router = APIRouter(prefix="/api/files", tags=["files"])


@router.post("", response_model=FileResponse, status_code=status.HTTP_201_CREATED)
async def create_file(
    payload: FileCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create an empty file (metadata only, no Telegram upload)."""
    from app.repositories.file_repo import FileRepository
    from app.repositories.usage_repo import StorageUsageRepository

    files_repo = FileRepository(db)
    empty_name = payload.name if payload.name.endswith(".txt") else f"{payload.name}.txt"
    record = files_repo.create(
        user_id=user.id,
        original_name=empty_name,
        storage_key="",
        mime_type=payload.mime_type,
        size_bytes=0,
        folder_id=payload.folder_id,
    )
    db.commit()
    return record


@router.post(
    "/upload",
    response_model=list[FileUploadResponse],
    status_code=status.HTTP_201_CREATED,
)
async def upload_files(
    files: list[UploadFile] = File(..., description="Files to upload"),
    folderId: int | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    svc = FileService(db)
    results = []

    for f in files:
        content = await f.read()
        try:
            record = await svc.upload_file(
                user_id=user.id,
                file_bytes=content,
                filename=f.filename or "unnamed",
                mime_type=f.content_type or "application/octet-stream",
                folder_id=folderId,
            )
            results.append(record)
        except ValueError as e:
            raise HTTPException(status_code=413, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

    return results


@router.get("", response_model=list[FileResponse])
def list_files(
    folderId: int | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = FileService(db)
    return svc.list_files(user.id, folderId)


@router.get("/{file_id}/download")
async def download_file(
    file_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = FileService(db)
    try:
        file_bytes, filename, mime_type = await svc.download_file(user.id, file_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return StreamingResponse(
        iter([file_bytes]),
        media_type=mime_type,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Length": str(len(file_bytes)),
        },
    )


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(
    file_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = FileService(db)
    try:
        await svc.delete_file(user.id, file_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")
