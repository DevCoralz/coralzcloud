import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { findUserById, toPublicUser } from "../models/userModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// Kept separate from /api/auth/me so future profile-management
// endpoints (update display name, change password, delete account)
// have a natural home without overloading the auth routes.
router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const row = await findUserById(req.userId);
    res.status(200).json({ user: toPublicUser(row) });
  })
);

export default router;
