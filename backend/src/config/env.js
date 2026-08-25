import "dotenv/config";

/**
 * Central environment configuration.
 *
 * Every value the backend needs at runtime is read here, once, and
 * validated. Nothing outside this file should read `process.env`
 * directly — that keeps secrets and environment-specific values from
 * leaking into random modules and makes it obvious what the app
 * actually depends on (see /.env.example at the repo root).
 */

const REQUIRED_IN_PRODUCTION = [
  "DATABASE_URL",
  "SESSION_SECRET",
  "PUBLIC_BACKEND_URL",
  "FRONTEND_URL",
];

function readList(name, fallback = []) {
  const raw = process.env[name];
  if (!raw) return fallback;
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function readInt(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function readBool(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  return raw.toLowerCase() === "true" || raw === "1";
}

const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";

export const env = {
  NODE_ENV,
  isProduction,
  isDevelopment: NODE_ENV === "development",
  isTest: NODE_ENV === "test",

  // --- Server -------------------------------------------------------
  PORT: readInt("PORT", 4000),
  HOST: process.env.HOST || "0.0.0.0",

  // The public URL this backend is reached at — behind the Cloudflare
  // Tunnel in production, or localhost in dev. Never hardcode this
  // anywhere else in the codebase; always read env.PUBLIC_BACKEND_URL.
  PUBLIC_BACKEND_URL: process.env.PUBLIC_BACKEND_URL || "",

  // Where the frontend is served from — used for CORS and cookie
  // settings. Comma-separated list supported for multiple origins.
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  ALLOWED_ORIGINS: readList(
    "ALLOWED_ORIGINS",
    process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : ["http://localhost:3000"]
  ),

  // Set to "true" when the backend sits behind the Cloudflare Tunnel /
  // any reverse proxy, so Express trusts X-Forwarded-* headers and
  // secure cookies work correctly.
  TRUST_PROXY: readBool("TRUST_PROXY", false),

  // --- Database -------------------------------------------------------
  DATABASE_URL: process.env.DATABASE_URL || "",
  DATABASE_SSL: readBool("DATABASE_SSL", false),
  DB_POOL_MAX: readInt("DB_POOL_MAX", 10),

  // --- Sessions / auth -------------------------------------------------------
  SESSION_SECRET: process.env.SESSION_SECRET || "",
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME || "coralz.sid",
  SESSION_MAX_AGE_MS: readInt("SESSION_MAX_AGE_MS", 1000 * 60 * 60 * 24 * 7), // 7 days
  SESSION_SECURE_COOKIE: readBool("SESSION_SECURE_COOKIE", isProduction),

  // --- Telegram / MTProto (foundation only — no upload/download yet) ----
  TELEGRAM_API_ID: process.env.TELEGRAM_API_ID || "",
  TELEGRAM_API_HASH: process.env.TELEGRAM_API_HASH || "",
  // A GramJS StringSession for the account/bot that owns the storage
  // channel. Left empty until the session is generated in the next
  // phase; the service layer tolerates this being unset.
  TELEGRAM_SESSION_STRING: process.env.TELEGRAM_SESSION_STRING || "",
  // Numeric chat ID of the private channel used as cloud storage.
  TELEGRAM_STORAGE_CHANNEL_ID: process.env.TELEGRAM_STORAGE_CHANNEL_ID || "",
  TELEGRAM_CONNECTION_RETRIES: readInt("TELEGRAM_CONNECTION_RETRIES", 5),

  // --- Rate limiting -------------------------------------------------------
  AUTH_RATE_LIMIT_WINDOW_MS: readInt("AUTH_RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
  AUTH_RATE_LIMIT_MAX: readInt("AUTH_RATE_LIMIT_MAX", 20),

  // --- Logging -------------------------------------------------------
  LOG_LEVEL: process.env.LOG_LEVEL || (isProduction ? "combined" : "dev"),
};

export function assertRequiredEnv() {
  if (!env.isProduction) return;
  const missing = REQUIRED_IN_PRODUCTION.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables in production: ${missing.join(", ")}. ` +
        "Copy .env.example to .env and fill these in."
    );
  }
}
