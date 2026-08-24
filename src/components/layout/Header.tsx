import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { site } from "@/config/site";
import { Logo } from "@/components/layout/Logo";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-20 px-5 pt-6 sm:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="-ml-1 flex size-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" strokeWidth={2.25} />}
        </button>

        <Link to="/" className="absolute left-1/2 w-max -translate-x-1/2" aria-label={site.name}>
          <Logo />
        </Link>

        <Link
          to="/"
          className="rounded-xl border border-border bg-surface px-5 py-2.5 text-[0.95rem] font-medium text-primary transition-colors hover:bg-secondary"
        >
          Login
        </Link>
      </div>

      {open && (
        <nav className="mx-auto mt-4 max-w-6xl animate-rise">
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
