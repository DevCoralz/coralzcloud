from __future__ import annotations

import os
import sys

# Pterodactyl's fixed startup command runs this file directly as
# `python app/main.py`, which puts app/ (not the repo root) on sys.path.
# That breaks the `from app...` absolute imports below. This inserts the
# parent dir (repo root) onto sys.path so the `app` package resolves no
# matter how this file is invoked. Same fix as Elcoral's app/main.py.
if __package__ in (None, ""):
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.admin import router as admin_router
from app.api.auth import router as auth_router
from app.api.files import router as files_router
from app.api.folders import router as folders_router
from app.api.profile import router as profile_router
from app.api.storage import router as storage_router
from app.core.config import settings
from app.services.telegram import TelegramStorageService

app = FastAPI(title="Coralz Cloud API", version="1.0.0")


# The frontend's request() in lib/api/client.ts reads errors as
# data?.error?.message and data?.error?.fields — a shape FastAPI does not
# produce by default. HTTPException(detail=...) serializes to {"detail":
# "..."}, and unhandled validation errors serialize to {"detail": [...]}.
# Both left every backend error falling through to the frontend's generic
# "Something went wrong" fallback, so the two handlers below translate
# FastAPI's default shapes into {"error": {"message", "code", "fields"}}
# for every route, not just auth — no per-route changes needed elsewhere.
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    # detail is usually a plain string ("Invalid email/username or
    # password") -> error.message only. Routes that need to point at a
    # specific form field (e.g. register's duplicate-email/username check)
    # instead raise HTTPException(detail={"field": "email", "message":
    # "..."}), which this turns into error.fields = {"email": "..."} so
    # LoginPage/RegisterPage highlight that exact input.
    if isinstance(exc.detail, dict) and "field" in exc.detail:
        content = {
            "error": {
                "message": exc.detail.get("message", "Something went wrong."),
                "fields": {exc.detail["field"]: exc.detail.get("message", "Invalid value")},
            }
        }
    else:
        content = {"error": {"message": exc.detail}}
    return JSONResponse(status_code=exc.status_code, content=content, headers=exc.headers)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Pydantic gives one entry per invalid field, e.g. loc =
    # ("body", "email"). fields turns that into {"email": "<message>"},
    # matching what LoginPage/RegisterPage read as err.fields to show
    # per-field errors instead of one generic message.
    fields: dict[str, str] = {}
    for error in exc.errors():
        loc = error.get("loc", ())
        field_name = str(loc[-1]) if loc else "form"
        fields.setdefault(field_name, error.get("msg", "Invalid value"))
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "message": "Please fix the highlighted fields and try again.",
                "fields": fields,
            }
        },
    )

# Always registered: settings.cors_origins falls back to the local dev origins
# when CORS_ORIGIN is unset, so a missing env var can no longer leave the API
# without CORS headers (which made every browser login/register fail preflight
# while curl against the same endpoints worked fine).
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
)

app.include_router(auth_router)
app.include_router(files_router)
app.include_router(folders_router)
app.include_router(storage_router)
app.include_router(profile_router)
app.include_router(admin_router)


@app.on_event("startup")
async def start_telegram_storage():
    # Instantiated on the event loop, not before uvicorn binds the port —
    # same lesson as Elcoral's start_telegram_storage: a slow/misconfigured
    # Telegram session must never delay the health check from coming up.
    app.state.telegram_storage = TelegramStorageService()


@app.on_event("startup")
async def seed_default_plans():
    """Seed default plans if they do not already exist."""
    from app.db.session import get_session_factory
    from app.models.storage import Plan

    defaults = [
        {"name": "Free", "storage_limit_bytes": 5 * 1024 * 1024 * 1024, "max_upload_bytes": 1 * 1024 * 1024 * 1024, "price_label": None},
        {"name": "Pro", "storage_limit_bytes": 500 * 1024 * 1024 * 1024, "max_upload_bytes": 2 * 1024 * 1024 * 1024, "price_label": None},
        {"name": "Business", "storage_limit_bytes": 1024 * 1024 * 1024 * 1024, "max_upload_bytes": 4 * 1024 * 1024 * 1024, "price_label": None},
    ]
    db = get_session_factory()()
    try:
        for plan_data in defaults:
            existing = db.scalar(select(Plan).where(Plan.name == plan_data["name"]))
            if not existing:
                db.add(Plan(**plan_data))
        db.commit()
    finally:
        db.close()


@app.get("/healthz")
def healthz():
    return {"status": "ok", "service": "coralz-cloud-api"}


@app.get("/api/health")
def api_health():
    return JSONResponse({"status": "ok"})


def _wait_for_mysql(host: str, port: int, timeout_seconds: int = 60) -> None:
    """
    Blocks until `host:port` accepts a TCP connection, or exits the process.

    Pterodactyl containers can come up before the paired MySQL allocation
    is actually accepting connections, so the API must not try to connect
    (via init_db/check_db) before the socket is even open. Bounded at 60s
    total, polling once a second, matching start.sh's old step 4 exactly —
    just done in-process instead of a bash loop shelling out to Python
    once per attempt.
    """
    import socket
    import time

    print(f"[startup] waiting for MySQL at {host}:{port}...")
    deadline = time.monotonic() + timeout_seconds
    while time.monotonic() < deadline:
        try:
            with socket.create_connection((host, port), timeout=2):
                print("[startup] MySQL is reachable.")
                return
        except OSError:
            time.sleep(1)

    print(f"[startup] MySQL at {host}:{port} did not become reachable within {timeout_seconds}s — refusing to start")
    sys.exit(1)


def _init_database() -> None:
    """
    Creates/verifies the schema before the app serves traffic. Coralz has
    no Alembic migrations (see Elcoral's _run_migrations for the versioned
    equivalent) — this is Base.metadata.create_all, which is idempotent,
    so it's safe to run on every boot. Any failure here means the app
    would otherwise serve against a broken schema, so this exits non-zero
    rather than letting FastAPI come up half-initialized.
    """
    from app.db.session import check_db, init_db

    print("[startup] initializing database schema...")
    try:
        init_db()
        check_db()
    except Exception:
        import traceback

        traceback.print_exc()
        print("[startup] database initialization failed — refusing to start")
        sys.exit(1)
    print("[startup] database ready.")


def _start_cloudflare_tunnel(port: int):
    """
    Runs cloudflared as a background thread using a permanent Tunnel
    Token (CLOUDFLARE_TUNNEL_TOKEN), same approach and same reasoning as
    Elcoral's _start_cloudflare_tunnel: a stable hostname that survives
    restarts, downloaded once into .bin/, and never blocking uvicorn from
    binding the port. A no-op if the token isn't set.
    """
    token = settings.cloudflare_tunnel_token.strip()
    if not token:
        print("[startup] CLOUDFLARE_TUNNEL_TOKEN not set — skipping tunnel.")
        return

    import logging
    import platform
    import stat
    import subprocess
    import threading
    import urllib.request

    logger = logging.getLogger("uvicorn.error")

    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    bin_dir = os.path.join(repo_root, ".bin")
    os.makedirs(bin_dir, exist_ok=True)
    cloudflared_path = os.path.join(bin_dir, "cloudflared")

    if not os.path.exists(cloudflared_path):
        machine = platform.machine().lower()
        arch = "arm64" if machine in ("aarch64", "arm64") else "amd64"
        url = f"https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-{arch}"
        logger.info(f"Downloading cloudflared ({arch})...")
        try:
            urllib.request.urlretrieve(url, cloudflared_path)
            st = os.stat(cloudflared_path)
            os.chmod(cloudflared_path, st.st_mode | stat.S_IEXEC)
        except Exception:
            logger.exception("Failed to download cloudflared — public tunnel will not start")
            return

    cmd = [cloudflared_path, "tunnel", "--no-autoupdate", "run", "--token", token]

    def _run_forever():
        while True:
            try:
                proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
                for line in proc.stdout:
                    logger.info(f"[cloudflared] {line.strip()}")
                proc.wait()
                logger.warning("cloudflared exited — restarting tunnel in 5s")
            except Exception:
                logger.exception("cloudflared process failed — retrying in 5s")
            import time

            time.sleep(5)

    threading.Thread(target=_run_forever, daemon=True).start()
    logger.info("Starting named Cloudflare tunnel (stable hostname)...")


if __name__ == "__main__":
    # Pterodactyl's fixed startup command runs `python app/main.py`
    # directly instead of `uvicorn app.main:app`, so this boots the
    # server manually — same as Elcoral's __main__ block. Python
    # dependencies are installed by the panel's Install script (pip
    # install -r requirements.txt), not here, so the only things this
    # needs to do before uvicorn.run are: wait for MySQL, init the
    # schema, and start the tunnel in the background.
    import uvicorn

    _wait_for_mysql(settings.database_host, settings.database_port)
    _init_database()

    port = int(os.environ.get("PORT", 8000))
    _start_cloudflare_tunnel(port)

    print(f"[startup] starting Coralz Cloud API on 0.0.0.0:{port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
