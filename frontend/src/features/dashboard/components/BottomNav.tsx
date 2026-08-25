import { Clock, Home, Star, Trash2, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

const items: { label: string; icon: LucideIcon }[] = [
  { label: "My Drive", icon: Home },
  { label: "Recent", icon: Clock },
  { label: "Shared", icon: Users },
  { label: "Starred", icon: Star },
  { label: "Trash", icon: Trash2 },
];

export function BottomNav() {
  const [active, setActive] = useState("My Drive");

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur-md"
    >
      <ul className="mx-auto flex max-w-5xl items-center justify-between px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 sm:px-8">
        {items.map(({ label, icon: Icon }) => {
          const isActive = active === label;
          return (
            <li key={label} className="flex-1">
              <button
                type="button"
                onClick={() => setActive(label)}
                aria-current={isActive ? "page" : undefined}
                className={`flex w-full flex-col items-center gap-1.5 rounded-xl py-1 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-6" strokeWidth={isActive ? 2.4 : 2} />
                <span className="text-[0.78rem] font-medium">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
