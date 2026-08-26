# Coralz Cloud Backend

Python/FastAPI backend for Coralz Cloud. Authentication uses a signed HttpOnly session cookie and MySQL via SQLAlchemy.

## Startup

Everything happens in-process inside `app/main.py`'s `__main__` block — there is no separate startup shell script. On boot it:

1. Waits (up to 60s) for the MySQL host:port from `Settings.resolved_database_url` to accept a TCP connection.
2. Initializes/verifies the schema via `Base.metadata.create_all`, then runs a `SELECT 1` sanity check. Exits non-zero on failure rather than serving against a broken schema.
3. Starts the Cloudflare Tunnel in a background thread from `CLOUDFLARE_TUNNEL_TOKEN`, if set — this never blocks uvicorn from binding the port.
4. Starts FastAPI via `uvicorn.run(...)`.

Python dependency installation is handled by the panel's own Install step (`pip install -r requirements.txt`), not by the app itself.

On Pterodactyl, the recommended startup command is:

```text
python app/main.py
```

For Docker/VPS, the image's `CMD` already runs this. `docker compose up -d --build` starts MariaDB first and then the API.

## Environment

The application-level configuration is intentionally small:

```text
DATABASE_URL=
CLOUDFLARE_TUNNEL_TOKEN=
CORS_ORIGIN=
SESSION_SECRET=
TELEGRAM_API_ID=
TELEGRAM_API_HASH=
TELEGRAM_SESSION_STRING=
TELEGRAM_STORAGE_CHANNEL_ID=
NODE_ENV=production
```

`DATABASE_URL` is optional when the host injects standard `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, and `MYSQL_PASSWORD` variables. In that case the backend builds the MySQL URL at runtime.

`SESSION_SECRET` is required and must be at least 32 characters — `Settings()` is built once at import time in `app/core/config.py` and fails loudly with a real traceback if this is missing, instead of failing later inside some unrelated function.

No real `.env` is committed.

## API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /healthz`

## Frontend

The frontend calls the backend with `credentials: include` so the HttpOnly session cookie is used. It is same-origin by default. For a separately hosted frontend, set `VITE_API_BASE_URL` during the frontend build.

## Telegram foundation

Only the configuration/service boundary exists in this phase. Actual MTProto storage and file transfer are intentionally deferred.
