import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

/**
 * Applied to register/login only — generous enough for normal use,
 * tight enough to slow down credential-stuffing / brute force.
 */
export const authRateLimiter = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: "Too many attempts. Please wait a bit and try again.",
      code: "RATE_LIMITED",
    },
  },
});
