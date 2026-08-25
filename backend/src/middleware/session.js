import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "../db/pool.js";
import { env } from "../config/env.js";

const PgSession = connectPgSimple(session);

export function createSessionMiddleware() {
  if (!env.SESSION_SECRET) {
    console.warn(
      "[session] SESSION_SECRET is not set. Set it in your .env file — see .env.example."
    );
  }

  return session({
    store: new PgSession({
      pool,
      tableName: "session",
      createTableIfMissing: false, // the migration owns schema creation
    }),
    name: env.SESSION_COOKIE_NAME,
    secret: env.SESSION_SECRET || "dev-only-insecure-secret-change-me",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: env.SESSION_SECURE_COOKIE,
      sameSite: env.SESSION_SECURE_COOKIE ? "none" : "lax",
      maxAge: env.SESSION_MAX_AGE_MS,
    },
  });
}
