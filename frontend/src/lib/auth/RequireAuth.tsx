import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "./AuthContext";

/**
 * Wraps a page component that requires an authenticated session.
 * Redirects to /login as soon as we know there's no user — while the
 * initial session check is still in flight, renders nothing rather
 * than flashing the protected content.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [isLoading, user, navigate]);

  if (isLoading || !user) {
    return <div className="min-h-screen bg-background" aria-hidden="true" />;
  }

  return <>{children}</>;
}
