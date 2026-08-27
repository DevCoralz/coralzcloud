"""Pydantic schemas for file and folder operations."""

from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator


class FolderCreate(BaseModel):
    name: str
    parent_id: int | None = None


class FolderResponse(BaseModel):
    id: int = Field(serialization_alias="id")
    name: str
    parent_id: int | None = Field(default=None, serialization_alias="parentId")
    created_at: datetime = Field(serialization_alias="createdAt")

    model_config = {"from_attributes": True}


class FileCreate(BaseModel):
    name: str
    folder_id: int | None = Field(default=None, alias="folderId")
    mime_type: str = Field(default="text/plain", alias="mimeType")


class FileUploadResponse(BaseModel):
    id: int
    original_name: str = Field(serialization_alias="originalName")
    mime_type: str | None = Field(default=None, serialization_alias="mimeType")
    size_bytes: int = Field(serialization_alias="sizeBytes")
    storage_key: str | None = Field(default=None, serialization_alias="storageKey")
    folder_id: int | None = Field(default=None, serialization_alias="folderId")
    created_at: datetime = Field(serialization_alias="createdAt")


class FileResponse(BaseModel):
    id: int
    original_name: str = Field(serialization_alias="originalName")
    mime_type: str | None = Field(default=None, serialization_alias="mimeType")
    size_bytes: int = Field(serialization_alias="sizeBytes")
    folder_id: int | None = Field(default=None, serialization_alias="folderId")
    created_at: datetime = Field(serialization_alias="createdAt")
    updated_at: datetime = Field(serialization_alias="updatedAt")

    model_config = {"from_attributes": True}


class StorageUsageResponse(BaseModel):
    used_bytes: int = Field(serialization_alias="usedBytes")
    used_label: str = Field(serialization_alias="usedLabel")
    total_label: str = Field(serialization_alias="totalLabel")
    free_label: str = Field(serialization_alias="freeLabel")
    percent: int


class ProfileUpdateRequest(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=120)
    username: str | None = Field(default=None, min_length=3, max_length=32)
    email: EmailStr | None = None

    @field_validator("username")
    @classmethod
    def valid_username(cls, value: str | None) -> str | None:
        if value is None:
            return None
        if not value.replace("_", "").replace("-", "").isalnum():
            raise ValueError("Username may contain only letters, numbers, underscores and hyphens")
        return value.lower()


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class ProfileResponse(BaseModel):
    id: int = Field(serialization_alias="id")
    full_name: str = Field(serialization_alias="displayName")
    username: str
    email: str
    avatar_url: str | None = Field(default=None, serialization_alias="avatarUrl")
    plan_id: int | None = Field(default=None, serialization_alias="planId")
    created_at: datetime = Field(serialization_alias="createdAt")
    storage: StorageUsageResponse | None = None

    model_config = {"from_attributes": True}

    @field_validator("id", mode="before")
    @classmethod
    def stringify_id(cls, value: object) -> int:
        return value


class PlanResponse(BaseModel):
    id: int
    name: str
    storage_limit_bytes: int = Field(serialization_alias="storageLimitBytes")
    max_upload_bytes: int = Field(serialization_alias="maxUploadBytes")
    price_label: str | None = Field(default=None, serialization_alias="priceLabel")
    created_at: datetime = Field(serialization_alias="createdAt")

    model_config = {"from_attributes": True}


class PlanCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    storage_limit_bytes: int = Field(gt=0)
    max_upload_bytes: int = Field(gt=0)
    price_label: str | None = Field(default=None, max_length=50)


class AdminUserResponse(BaseModel):
    id: int
    full_name: str = Field(serialization_alias="displayName")
    username: str
    email: str
    avatar_url: str | None = Field(default=None, serialization_alias="avatarUrl")
    plan_id: int | None = Field(default=None, serialization_alias="planId")
    is_active: bool = Field(serialization_alias="isActive")
    created_at: datetime = Field(serialization_alias="createdAt")

    model_config = {"from_attributes": True}


    @field_validator("id", mode="before")
    @classmethod
    def stringify_id(cls, value: object) -> int:
        return value


class AdminStatsResponse(BaseModel):
    total_users: int = Field(serialization_alias="totalUsers")
    total_storage_bytes: int = Field(serialization_alias="totalStorageBytes")
    total_storage_label: str = Field(serialization_alias="totalStorageLabel")
