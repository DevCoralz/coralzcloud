"""Admin API routes."""

import math

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_admin_user
from app.db.session import get_db
from app.models.auth import User
from app.models.storage import Plan, StorageUsage
from app.schemas.storage import (
    AdminStatsResponse,
    AdminUserResponse,
    PlanCreateRequest,
    PlanResponse,
)

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users", response_model=list[AdminUserResponse])
def list_users(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    users = db.scalars(select(User).order_by(User.created_at.desc())).all()
    return [AdminUserResponse.model_validate(u) for u in users]


@router.get("/stats", response_model=AdminStatsResponse)
def get_stats(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    total_users = db.scalar(select(func.count(User.id))) or 0
    total_bytes = db.scalar(select(func.coalesce(func.sum(StorageUsage.used_bytes), 0))) or 0

    if total_bytes == 0:
        label = "0 B"
    else:
        units = ["B", "KB", "MB", "GB", "TB"]
        i = int(math.floor(math.log(total_bytes, 1024)))
        i = min(i, len(units) - 1)
        label = f"{total_bytes / (1024**i):.1f} {units[i]}"

    return AdminStatsResponse(
        total_users=total_users,
        total_storage_bytes=total_bytes,
        total_storage_label=label,
    )


@router.get("/plans", response_model=list[PlanResponse])
def list_plans(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    plans = db.scalars(select(Plan).order_by(Plan.id)).all()
    return [PlanResponse.model_validate(p) for p in plans]


@router.post("/plans", response_model=PlanResponse)
def create_or_update_plan(
    payload: PlanCreateRequest,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    existing = db.scalar(select(Plan).where(Plan.name == payload.name))
    if existing:
        existing.storage_limit_bytes = payload.storage_limit_bytes
        existing.max_upload_bytes = payload.max_upload_bytes
        existing.price_label = payload.price_label
        db.commit()
        db.refresh(existing)
        return PlanResponse.model_validate(existing)

    plan = Plan(
        name=payload.name,
        storage_limit_bytes=payload.storage_limit_bytes,
        max_upload_bytes=payload.max_upload_bytes,
        price_label=payload.price_label,
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return PlanResponse.model_validate(plan)

@router.get("/slug")
async def get_admin_slug(user: User = Depends(get_admin_user)):
    """Return the admin page slug (for frontend routing). Only admins."""
    from app.core.config import settings
    return {"slug": settings.admin_slug}
