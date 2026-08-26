from functools import lru_cache

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings


class Base(DeclarativeBase):
    pass


@lru_cache
def get_engine():
    return create_engine(
        settings.resolved_database_url,
        pool_pre_ping=True,
        pool_recycle=1800,
        future=True,
    )


@lru_cache
def get_session_factory():
    return sessionmaker(bind=get_engine(), autoflush=False, autocommit=False, expire_on_commit=False)


# Compatibility aliases for code that imports engine/SessionLocal directly.
# They are lazy, so an invalid environment cannot crash the module import before
# the startup script has had a chance to validate/wait for MySQL.
class _LazyEngine:
    def __getattr__(self, name):
        return getattr(get_engine(), name)


engine = _LazyEngine()


class _LazySessionFactory:
    def __call__(self, *args, **kwargs):
        return get_session_factory()(*args, **kwargs)


SessionLocal = _LazySessionFactory()


def get_db():
    db = get_session_factory()()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    from app.models import auth, storage  # noqa: F401

    Base.metadata.create_all(bind=get_engine())


def check_db() -> None:
    with get_engine().connect() as connection:
        connection.execute(text("SELECT 1"))
