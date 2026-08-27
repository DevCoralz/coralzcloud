"""Pydantic schemas for file and folder operations."""

from datetime import datetime
from pydantic import BaseModel, Field


class FolderCreate(BaseModel):
    name: str
    parent_id: int | None = None


class FolderResponse(BaseModel):
    id: int = Field(serialization_alias="id")
    name: str
    parent_id: int | None = Field(default=None, serialization_alias="parentId")
    created_at: datetime = Field(serialization_alias="createdAt")

    model_config = {"from_attributes": True}


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
