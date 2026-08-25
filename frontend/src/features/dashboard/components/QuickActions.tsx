import { Camera, FolderPlus, Link2, Star, Upload } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const actions: { label: string; icon: LucideIcon; filled?: boolean }[] = [
  { label: "Upload", icon: Upload, filled: true },
  { label: "New Folder", icon: FolderPlus },
  { label: "Scan", icon: Camera },
  { label: "Create Link", icon: Link2 },
  { label: "Starred", icon: Star },
];

export function QuickActions() {
  return (
    <section
      aria-label="Quick actions"
      className="shadow-panel rounded-3xl border border-border bg-surface px-2 py-5"
    >
      <ul className="flex items-start justify-between gap-1">
        {actions.map(({ label, icon: Icon, filled }) => (
          <li key={label} className="flex-1">
            <button
              type="button"
              className="group flex w-full flex-col items-center gap-2.5 rounded-2xl px-1 py-1 transition-transform active:scale-95"
            >
              <span
                className={
                  filled
                    ? "flex size-[46px] sm:size-[52px] items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-colors group-hover:bg-primary/90"
                    : "flex size-[46px] sm:size-[52px] items-center justify-center rounded-2xl bg-secondary text-primary transition-colors group-hover:bg-accent"
                }
              >
                <Icon className="size-6" strokeWidth={2.25} />
              </span>
              <span className="whitespace-nowrap text-center text-[0.72rem] font-medium leading-tight text-foreground sm:text-[0.82rem]">
                {label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
