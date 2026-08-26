import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///:memory:")
os.environ.setdefault("SESSION_SECRET", "test-secret-that-is-long-enough-32+")
os.environ.setdefault("NODE_ENV", "test")

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.session import Base, get_db
from app.main import app

engine = create_engine(
    "sqlite+pysqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base.metadata.create_all(engine)


def override_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_db


def test_register_login_me_logout():
    # The application lifespan is intentionally not used here because the
    # test database is supplied through the dependency override.
    with TestClient(app, raise_server_exceptions=True) as client:
        registered = client.post(
            "/api/auth/register",
            json={
                "full_name": "Coralz Test",
                "email": "coralz@example.com",
                "username": "coralz",
                "password": "correct horse battery staple",
            },
        )
        assert registered.status_code == 201
        assert registered.json()["user"]["username"] == "coralz"

        duplicate = client.post(
            "/api/auth/register",
            json={
                "full_name": "Another",
                "email": "coralz@example.com",
                "username": "other",
                "password": "correct horse battery staple",
            },
        )
        assert duplicate.status_code == 409

        me = client.get("/api/auth/me")
        assert me.status_code == 200

        client.post("/api/auth/logout")
        assert client.get("/api/auth/me").status_code == 401

        login = client.post(
            "/api/auth/login",
            json={"identifier": "coralz", "password": "correct horse battery staple"},
        )
        assert login.status_code == 200

        bad_login = client.post(
            "/api/auth/login",
            json={"identifier": "coralz", "password": "wrong password"},
        )
        assert bad_login.status_code == 401
