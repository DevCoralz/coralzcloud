import { registerUser, loginUser } from "../services/authService.js";
import { findUserById, toPublicUser } from "../models/userModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  const { username, email, password, displayName } = req.body;
  const user = await registerUser({ username, email, password, displayName });

  // Log the user in immediately after registration.
  req.session.userId = user.id;

  res.status(201).json({ user });
});

export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const user = await loginUser({ identifier, password });

  req.session.userId = user.id;

  res.status(200).json({ user });
});

export const logout = asyncHandler(async (req, res) => {
  if (!req.session) {
    return res.status(200).json({ success: true });
  }
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        error: { message: "Could not log out. Please try again.", code: "LOGOUT_FAILED" },
      });
    }
    res.clearCookie(req.app.get("sessionCookieName"));
    res.status(200).json({ success: true });
  });
});

export const me = asyncHandler(async (req, res) => {
  const row = await findUserById(req.userId);
  if (!row) {
    // Session points at a user that no longer exists — clear it.
    req.session.destroy(() => {});
    return res.status(401).json({ error: { message: "Session invalid", code: "UNAUTHENTICATED" } });
  }
  res.status(200).json({ user: toPublicUser(row) });
});
