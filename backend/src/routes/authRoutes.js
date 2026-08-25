import { Router } from "express";
import { register, login, logout, me } from "../controllers/authController.js";
import { validateBody } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validation/authSchemas.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { authRateLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.post("/register", authRateLimiter, validateBody(registerSchema), register);
router.post("/login", authRateLimiter, validateBody(loginSchema), login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

export default router;
