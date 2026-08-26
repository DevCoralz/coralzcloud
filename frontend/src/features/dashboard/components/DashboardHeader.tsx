import { ChevronDown, Menu, User, X, LogOut } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/layout/Logo";
import { site } from "@/config/site";
import { useAuth } from "@/lib/auth/AuthContext";

export function DashboardHeader() {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    setAccountOpen(false);
    await logout();
    navigate({ to: "/login" });
  }

  return (
    <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6 md:px-8">
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="-ml-1 flex size-10 shrink-0 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-secondary active:scale-95"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" strokeWidth={2.25} />}
        </button>

        <Link to="/" aria-label={site.name} className="ml-1">
          <Logo />
        </Link>

        <div className="relative ml-auto flex items-center gap-2">
          <button
            type="button"
            aria-label="Account menu"
            aria-expanded={accountOpen}
            onClick={() => setAccountOpen((v) => !v)}
            className="flex items-center gap-1 rounded-full transition-opacity hover:opacity-85 active:scale-95"
          >
            <span className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-foreground text-background">
              <User className="size-5" strokeWidth={2} />
            </span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </button>

          {accountOpen && (
            <div className="shadow-soft absolute right-0 top-12 z-40 w-56 animate-rise overflow-hidden rounded-2xl border border-hairline bg-surface">
              {user && (
                <div className="border-b border-hairline px-4 py-3">
                  <p className="truncate text-[0.95rem] font-semibold text-foreground">
                    {user.displayName || user.username}
                  </p>
                  <p className="truncate text-[0.85rem] text-muted-foreground">{user.email}</p>
                </div>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-[0.95rem] font-medium text-destructive transition-colors hover:bg-secondary/50"
              >
                <LogOut className="size-4" strokeWidth={2} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>

      {open && (
        <nav className="mx-auto max-w-5xl animate-rise px-4 pb-3 sm:px-6 md:px-8">
          <ul className="flex flex-col gap-1 sm:flex-row sm:gap-6">
            {site.nav.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-1 py-2 text-[0.95rem] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
