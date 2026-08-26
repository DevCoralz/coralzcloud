from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.auth import User
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UserResponse
from app.services.auth import create_session_token
from app.services.passwords import hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["authentication"])


def set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=settings.auth_cookie_name,
        value=token,
        max_age=settings.auth_cookie_max_age,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        path="/",
    )


@router.post(
    "/register",
    response_model=AuthResponse,
    response_model_by_alias=True,
    status_code=status.HTTP_201_CREATED,
)
def register(payload: RegisterRequest, response: Response, db: Session = Depends(get_db)):
    email = str(payload.email).lower()
    username = payload.username.lower()

    existing = db.scalar(select(User).where(or_(User.email == email, User.username == username)))
    if existing:
        if existing.email == email:
            raise HTTPException(
                status_code=409,
                detail={"field": "email", "message": "Email is already registered"},
            )
        raise HTTPException(
            status_code=409,
            detail={"field": "username", "message": "Username is already taken"},
        )

    user = User(
        full_name=payload.full_name,
        email=email,
        username=username,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Email or username is already registered")

    set_session_cookie(response, create_session_token(user.id))
    return AuthResponse(user=UserResponse.model_validate(user))


@router.post("/login", response_model=AuthResponse, response_model_by_alias=True)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    identifier = payload.identifier.strip().lower()
    user = db.scalar(select(User).where(or_(User.email == identifier, User.username == identifier)))

    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email/username or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="This account is disabled")

    set_session_cookie(response, create_session_token(user.id))
    return AuthResponse(user=UserResponse.model_validate(user))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response):
    # The delete must repeat the same flags used when setting the cookie, or the
    # browser treats it as a different cookie and the session survives logout.
    response.delete_cookie(
        key=settings.auth_cookie_name,
        path="/",
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )


@router.get("/me", response_model=AuthResponse, response_model_by_alias=True)
def me(user: User = Depends(get_current_user)):
    return AuthResponse(user=UserResponse.model_validate(user))
