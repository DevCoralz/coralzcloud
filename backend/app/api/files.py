"""File API routes — upload, list, download, delete."""

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.auth import User
from app.schemas.storage import FileResponse, FileUploadResponse
from app.services.file_service import FileService

router = APIRouter(prefix="/api/files", tags=["files"])


@router.post(
    "/upload",
    response_model=FileUploadResponse,
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
            record = svc.upload_file(
                user_id=user.id,
                file_bytes=content,
                filename=f.filename or "unnamed",
                mime_type=f.content_type or "application/octet-stream",
                folder_id=folderId,
            )
            results.append(record)
        except ValueError as e:
            raise HTTPException(status_code=413, detail=str(e))

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
def download_file(
    file_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = FileService(db)
    try:
        file_bytes, filename, mime_type = svc.download_file(user.id, file_id)
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
def delete_file(
    file_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = FileService(db)
    try:
        svc.delete_file(user.id, file_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")
