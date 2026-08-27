import { Menu, User, X } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/layout/Logo";
import { useAuth } from "@/lib/auth/AuthContext";

export function DashboardHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const navItems = [
    { label: "My Drive", to: "/dashboard" },
    { label: "Pricing", to: "/pricing" },
  ];

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

        <Link to="/dashboard" aria-label="Coralz Cloud" className="ml-1">
          <Logo />
        </Link>

        <div className="ml-auto">
          <Link
            to="/profile"
            className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-foreground text-background transition-opacity hover:opacity-85 active:scale-95"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              <User className="size-5" strokeWidth={2} />
            )}
          </Link>
        </div>
      </div>

      {open && (
        <nav className="mx-auto max-w-5xl animate-rise px-4 pb-3 sm:px-6 md:px-8">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
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
