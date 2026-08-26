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
      className="fixed bottom-0 left-0 right-0 z-50 bg-white"
      style={{
        boxShadow: "0 -2px 8px rgba(0,0,0,0.06)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <ul className="mx-auto flex max-w-5xl items-center justify-around px-4 pt-2 pb-2">
        {items.map(({ label, icon: Icon }) => {
          const isActive = active === label;
          return (
            <li key={label} className="flex-1">
              <button
                type="button"
                onClick={() => setActive(label)}
                aria-current={isActive ? "page" : undefined}
                className="flex w-full flex-col items-center gap-0.5"
              >
                <Icon
                  className="size-6"
                  strokeWidth={isActive ? 2.5 : 1.8}
                  style={{ color: isActive ? "#2563EB" : "#9E9E9E" }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: isActive ? "#2563EB" : "#9E9E9E" }}
                >
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
