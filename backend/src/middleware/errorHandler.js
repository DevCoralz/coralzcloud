import { AuthError } from "../services/authService.js";
import { env } from "../config/env.js";

export function notFoundHandler(req, res) {
  res.status(404).json({ error: { message: "Not found", code: "NOT_FOUND" } });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof AuthError) {
    return res.status(err.status).json({
      error: { message: err.message, code: err.code, fields: err.fields || undefined },
    });
  }

  // Postgres unique-violation as a fallback safety net, in case a race
  // condition slips past the application-level existence check.
  if (err && err.code === "23505") {
    return res.status(409).json({
      error: { message: "That username or email is already in use", code: "USER_EXISTS" },
    });
  }

  console.error("[error]", err);

  res.status(err.status || 500).json({
    error: {
      message: env.isProduction ? "Something went wrong" : err.message || "Internal server error",
      code: "INTERNAL_ERROR",
    },
  });
}
