from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.auth import User
from app.services.auth import decode_session_token

# FastAPI's Cookie() reads its alias at decoration time (i.e. at import),
# not per-request, so this has to be the resolved string, not a settings
# lookup. `settings` is already built by the time this module imports
# (app.core.config imports first in every chain that reaches here), so
# this reflects whatever AUTH_COOKIE_NAME actually resolved to.
_SESSION_COOKIE_NAME = settings.auth_cookie_name


def get_current_user(
    db: Session = Depends(get_db),
    session_cookie: str | None = Cookie(default=None, alias=_SESSION_COOKIE_NAME),
) -> User:
    if not session_cookie:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    user_id = decode_session_token(session_cookie)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session")

    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return user
