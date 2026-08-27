import { Camera, FilePlus, FolderPlus, Link2, Upload } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Props = {
  onUpload: () => void;
  onCreateFolder: () => void;
};

export function QuickActions({ onUpload, onCreateFolder }: Props) {
  const actions: { label: string; icon: LucideIcon; filled?: boolean; onClick: () => void }[] = [
    { label: "Upload", icon: Upload, filled: true, onClick: onUpload },
    { label: "New File", icon: FilePlus, onClick: () => {} },
    { label: "New Folder", icon: FolderPlus, onClick: onCreateFolder },
    { label: "Scan", icon: Camera, onClick: () => {} },
    { label: "Create Link", icon: Link2, onClick: () => {} },
  ];

  return (
    <section aria-label="Quick actions" className="px-0 py-1">
      <ul className="flex items-start justify-between gap-1 sm:gap-2">
        {actions.map(({ label, icon: Icon, filled, onClick }) => (
          <li key={label} className="flex-1">
            <button
              type="button"
              onClick={onClick}
              className="group flex w-full flex-col items-center gap-2 rounded-xl px-0.5 py-1 transition-transform active:scale-95"
            >
              <span
                className={
                  filled
                    ? "flex size-10 sm:size-11 md:size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors group-hover:bg-primary/90"
                    : "flex size-10 sm:size-11 md:size-12 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-accent"
                }
              >
                <Icon className="size-[18px] sm:size-5 md:size-[22px]" strokeWidth={2.25} />
              </span>
              <span className="whitespace-nowrap text-center text-[0.68rem] font-medium leading-tight text-foreground sm:text-[0.75rem] md:text-[0.8rem]">
                {label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
