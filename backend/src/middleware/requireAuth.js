/**
 * Protects a route: requires an active session with a logged-in user.
 * Attaches req.userId for downstream handlers.
 */
export function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      error: { message: "Authentication required", code: "UNAUTHENTICATED" },
    });
  }
  req.userId = req.session.userId;
  next();
}
