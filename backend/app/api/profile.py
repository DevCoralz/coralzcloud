"""Profile management API routes."""

import base64

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.auth import User
from app.schemas.storage import (
    PasswordChangeRequest,
    PlanResponse,
    ProfileResponse,
    ProfileUpdateRequest,
    StorageUsageResponse,
)
from app.services.file_service import FileService
from app.services.passwords import hash_password, verify_password

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("", response_model=ProfileResponse)
def get_profile(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = FileService(db)
    usage = svc.get_usage(user.id)

    plan_response = None
    if user.plan_id:
        from app.models.storage import Plan

        plan = db.get(Plan, user.plan_id)
        if plan:
            plan_response = PlanResponse.model_validate(plan)

    return ProfileResponse(
        id=user.id,
        full_name=user.full_name,
        username=user.username,
        email=user.email,
        avatar_url=user.avatar_url,
        plan_id=user.plan_id,
        created_at=user.created_at,
        storage=StorageUsageResponse(**usage),
    )


@router.post("/update", response_model=ProfileResponse)
def update_profile(
    payload: ProfileUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.username is not None:
        username = payload.username.lower()
        existing = db.scalar(
            select(User).where(User.username == username, User.id != user.id)
        )
        if existing:
            raise HTTPException(
                status_code=409,
                detail={"field": "username", "message": "Username is already taken"},
            )
        user.username = username

    if payload.email is not None:
        email = str(payload.email).lower()
        existing = db.scalar(
            select(User).where(User.email == email, User.id != user.id)
        )
        if existing:
            raise HTTPException(
                status_code=409,
                detail={"field": "email", "message": "Email is already registered"},
            )
        user.email = email

    if payload.full_name is not None:
        user.full_name = payload.full_name.strip()

    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Username or email already taken")

    svc = FileService(db)
    usage = svc.get_usage(user.id)

    return ProfileResponse(
        id=user.id,
        full_name=user.full_name,
        username=user.username,
        email=user.email,
        avatar_url=user.avatar_url,
        plan_id=user.plan_id,
        created_at=user.created_at,
        storage=StorageUsageResponse(**usage),
    )


@router.post("/password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    payload: PasswordChangeRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.current_password, user.password_hash):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    user.password_hash = hash_password(payload.new_password)
    db.commit()


@router.post("/avatar", response_model=ProfileResponse)
async def upload_avatar(
    file: UploadFile,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Avatar must be under 5MB")

    b64 = base64.b64encode(contents).decode("utf-8")
    user.avatar_url = f"data:{file.content_type};base64,{b64}"

    db.commit()
    db.refresh(user)

    svc = FileService(db)
    usage = svc.get_usage(user.id)

    return ProfileResponse(
        id=user.id,
        full_name=user.full_name,
        username=user.username,
        email=user.email,
        avatar_url=user.avatar_url,
        plan_id=user.plan_id,
        created_at=user.created_at,
        storage=StorageUsageResponse(**usage),
    )
