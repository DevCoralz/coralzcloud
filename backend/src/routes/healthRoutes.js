import { Router } from "express";
import { checkDatabaseConnection } from "../db/pool.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { env } from "../config/env.js";
import { getTelegramConfigStatus } from "../services/telegram/telegramClient.js";

const router = Router();

router.get(
  "/health",
  asyncHandler(async (req, res) => {
    let database = "ok";
    try {
      await checkDatabaseConnection();
    } catch (err) {
      database = "error";
    }

    res.status(database === "ok" ? 200 : 503).json({
      status: database === "ok" ? "ok" : "degraded",
      database,
      publicBackendUrl: env.PUBLIC_BACKEND_URL || null,
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  })
);

// Reports whether the Telegram/MTProto foundation is configured.
// Does NOT connect or touch the storage channel — this phase only
// prepares the plumbing, it doesn't exercise it.
router.get("/health/telegram", (req, res) => {
  res.status(200).json(getTelegramConfigStatus());
});

export default router;
