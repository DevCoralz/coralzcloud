from datetime import datetime, timedelta, timezone

import jwt

from app.core.config import settings


ALGORITHM = "HS256"


def create_session_token(user_id: int) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + timedelta(seconds=settings.auth_cookie_max_age),
    }
    return jwt.encode(payload, settings.session_secret, algorithm=ALGORITHM)


def decode_session_token(token: str) -> int | None:
    try:
        payload = jwt.decode(token, settings.session_secret, algorithms=[ALGORITHM])
        return int(payload["sub"])
    except (jwt.PyJWTError, KeyError, TypeError, ValueError):
        return None
