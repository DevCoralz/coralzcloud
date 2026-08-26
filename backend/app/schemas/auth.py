from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    username: str = Field(min_length=3, max_length=32)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("full_name", "username")
    @classmethod
    def clean_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field is required")
        return value

    @field_validator("username")
    @classmethod
    def valid_username(cls, value: str) -> str:
        if not value.replace("_", "").replace("-", "").isalnum():
            raise ValueError("Username may contain only letters, numbers, underscores and hyphens")
        return value.lower()


class LoginRequest(BaseModel):
    identifier: str = Field(min_length=1, max_length=254)
    password: str = Field(min_length=1, max_length=128)


class UserResponse(BaseModel):
    # populate_by_name lets this validate straight off the SQLAlchemy User
    # model (from_attributes=True reads snake_case attrs like full_name),
    # while by_alias serialization (set on AuthResponse below) emits the
    # camelCase keys the frontend's User type in lib/api/auth.ts actually
    # expects. Without both settings this is a two-way mismatch: reading
    # fails without populate_by_name, writing fails without by_alias.
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    username: str
    email: EmailStr
    display_name: str = Field(validation_alias="full_name", serialization_alias="displayName")
    is_active: bool = Field(serialization_alias="isActive")
    created_at: datetime = Field(serialization_alias="createdAt")
    updated_at: datetime = Field(serialization_alias="updatedAt")
    # The users table has no email-verification or last-login tracking yet
    # (see models/auth.py), so these are always null for now rather than
    # backend fields the frontend type expects but nothing populates.
    email_verified_at: datetime | None = Field(default=None, serialization_alias="emailVerifiedAt")
    last_login_at: datetime | None = Field(default=None, serialization_alias="lastLoginAt")

    @field_validator("id", mode="before")
    @classmethod
    def stringify_id(cls, value: object) -> str:
        # The DB's integer PK becomes a string here to match the frontend's
        # `id: string` in User — SQLAlchemy gives an int, JSON would encode
        # it as a number, and json will silently accept either, but the
        # frontend's type-level assumption (string) should hold at runtime.
        return str(value)


class AuthResponse(BaseModel):
    user: UserResponse
