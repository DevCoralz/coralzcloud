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


def _ensure_columns(engine) -> None:
    """Add missing columns to existing tables without dropping anything."""
    import logging
    logger = logging.getLogger(__name__)

    columns_to_add = [
        # (table, column_def, col_name_for_check)
        ("users", "ALTER TABLE users ADD COLUMN avatar_url TEXT NULL", "avatar_url"),
        ("users", "ALTER TABLE users ADD COLUMN plan_id INT NULL", "plan_id"),
        ("plans", "ALTER TABLE plans ADD COLUMN max_upload_bytes BIGINT NOT NULL DEFAULT 1073741824", "max_upload_bytes"),
        ("plans", "ALTER TABLE plans ADD COLUMN price_label VARCHAR(50) NULL", "price_label"),
    ]

    with engine.connect() as conn:
        existing_tables = [r[0] for r in conn.execute(text("SHOW TABLES")).fetchall()]
        for table, alter_sql, col_name in columns_to_add:
            if table not in existing_tables:
                continue
            cols = [r[0] for r in conn.execute(text(f"SHOW COLUMNS FROM {table}")).fetchall()]
            if col_name not in cols:
                try:
                    conn.execute(text(alter_sql))
                    conn.commit()
                    logger.info(f"[migrate] Added {col_name} to {table}")
                except Exception as e:
                    logger.warning(f"[migrate] Could not add {col_name} to {table}: {e}")


def init_db() -> None:
    from app.models import auth, storage  # noqa: F401

    engine = get_engine()
    _ensure_columns(engine)
    Base.metadata.create_all(bind=engine)


def check_db() -> None:
    with get_engine().connect() as connection:
        connection.execute(text("SELECT 1"))
