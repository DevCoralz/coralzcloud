from urllib.parse import quote_plus, urlparse

from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # DATABASE_URL remains optional. Pterodactyl commonly exposes the database
    # allocation as MYSQL_HOST / MYSQL_PORT / MYSQL_DATABASE / MYSQL_USERNAME /
    # MYSQL_PASSWORD, so those values are preferred and assembled automatically.
    database_url: str = Field(default="", validation_alias="DATABASE_URL")
    mysql_host: str = Field(default="127.0.0.1", validation_alias=AliasChoices("MYSQL_HOST", "DB_HOST"))
    mysql_port: int = Field(default=3306, validation_alias=AliasChoices("MYSQL_PORT", "DB_PORT"))
    mysql_database: str = Field(default="coralzcloud", validation_alias=AliasChoices("MYSQL_DATABASE", "MYSQL_DB", "DB_DATABASE"))
    mysql_user: str = Field(default="", validation_alias=AliasChoices("MYSQL_USER", "MYSQL_USERNAME", "MYSQL_USER_NAME", "DB_USERNAME", "DB_USER"))
    mysql_password: str = Field(default="", validation_alias=AliasChoices("MYSQL_PASSWORD", "DB_PASSWORD"))

    cloudflare_tunnel_token: str = ""
    cors_origin: str = ""
    session_secret: str
    telegram_api_id: str = ""
    telegram_api_hash: str = ""
    telegram_session_string: str = ""
    telegram_storage_channel_id: str = ""
    node_env: str = "production"
    auth_cookie_name: str = "coralz_cloud_session"
    auth_cookie_max_age: int = 7 * 24 * 60 * 60
    # Cookie flags are configurable because the correct values depend on how the
    # app is served, and getting them wrong silently breaks login (the browser
    # accepts the response but drops the cookie, so /api/auth/me stays 401):
    #  - local dev over plain http://localhost -> Secure=false, SameSite=lax
    #  - frontend and API on different hostnames (Cloudflare Tunnel setup)
    #    -> SameSite=none REQUIRES Secure=true, otherwise Chrome rejects it.
    # Empty = auto-derive from node_env (see cookie_secure/cookie_samesite).
    auth_cookie_secure: str = ""
    auth_cookie_samesite: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    @field_validator("session_secret")
    @classmethod
    def required_secret(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("SESSION_SECRET is required")
        if len(value) < 32:
            raise ValueError("SESSION_SECRET must be at least 32 characters")
        return value

    @staticmethod
    def _normalize_database_url(value: str) -> str:
        value = value.strip().strip('"').strip("'")
        # Some tools/panels hand out JDBC-style URLs (jdbc:mysql://...).
        # That "jdbc:" prefix isn't a SQLAlchemy scheme, so strip it before
        # anything else, or urlparse() below silently fails to find a
        # hostname and the "explicit URL" branch gets skipped entirely.
        if value.startswith("jdbc:"):
            value = value[len("jdbc:") :]
        # A few panels/hosts expose mysql:// rather than mysql+pymysql://.
        # Normalize it so SQLAlchemy always uses the bundled PyMySQL driver.
        if value.startswith("mysql://"):
            return "mysql+pymysql://" + value[len("mysql://") :]
        return value

    @property
    def resolved_database_url(self) -> str:
        # Prefer the explicit URL only when it is a real SQLAlchemy URL. This
        # prevents a malformed/placeholder DATABASE_URL from breaking startup
        # when valid Pterodactyl MYSQL_* variables are available.
        explicit = self._normalize_database_url(self.database_url)
        if explicit:
            parsed = urlparse(explicit)
            if parsed.scheme in {"mysql+pymysql", "mysql", "sqlite", "sqlite+pysqlite"} and (parsed.hostname or parsed.scheme.startswith("sqlite")):
                return explicit

        if not self.mysql_user:
            raise ValueError(
                "No MySQL credentials found. Pterodactyl should provide MYSQL_HOST, "
                "MYSQL_PORT, MYSQL_DATABASE, MYSQL_USERNAME and MYSQL_PASSWORD."
            )

        user = quote_plus(self.mysql_user)
        password = quote_plus(self.mysql_password)
        database = quote_plus(self.mysql_database)
        host = self.mysql_host.strip() or "127.0.0.1"
        return f"mysql+pymysql://{user}:{password}@{host}:{self.mysql_port}/{database}"

    @property
    def database_host(self) -> str:
        parsed = urlparse(self.resolved_database_url)
        return parsed.hostname or self.mysql_host

    @property
    def database_port(self) -> int:
        parsed = urlparse(self.resolved_database_url)
        return parsed.port or self.mysql_port

    @property
    def cors_origins(self) -> list[str]:
        origins = [item.strip() for item in self.cors_origin.split(",") if item.strip()]
        # A wildcard is incompatible with credentialed requests: the frontend
        # sends fetch(..., credentials: "include"), and browsers reject
        # Access-Control-Allow-Origin: * on those responses outright.
        origins = [o for o in origins if o != "*"]
        if not origins:
            # Without this the CORS middleware was never registered at all, so
            # every browser call from the dev frontend failed preflight and the
            # UI only ever showed "Could not reach the server".
            return [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:8080",
                "http://127.0.0.1:8080",
            ]
        return origins

    @property
    def cookie_secure(self) -> bool:
        raw = self.auth_cookie_secure.strip().lower()
        if raw in {"1", "true", "yes", "on"}:
            return True
        if raw in {"0", "false", "no", "off"}:
            return False
        # Auto: only mark Secure when every allowed origin is https, otherwise a
        # Secure cookie set over http://localhost is discarded by the browser.
        return all(origin.startswith("https://") for origin in self.cors_origins)

    @property
    def cookie_samesite(self) -> str:
        raw = self.auth_cookie_samesite.strip().lower()
        if raw in {"lax", "strict", "none"}:
            return raw
        # Cross-site (frontend domain != API domain) needs "none", which is only
        # honoured together with Secure.
        return "none" if self.cookie_secure else "lax"

    @property
    def is_production(self) -> bool:
        return self.node_env.lower() == "production"


# A single instance built at import time, same pattern as Elcoral's
# app/core/config.py. Settings() either succeeds once here and every
# other module just imports `settings`, or it fails here with a real
# pydantic ValidationError traceback pointing at config.py — instead of
# failing later, inside some function's default argument, where the
# traceback (if any survives) points at an unrelated file and the
# process can exit with no visible error at all. See app/api/deps.py's
# get_current_user for the incident that motivated this.
settings = Settings()
