import {
  Archive,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  MoreVertical,
  Play,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { files, type FileKind } from "../data";

const kindStyles: Record<FileKind, { icon: LucideIcon; className: string }> = {
  pdf: { icon: FileText, className: "bg-file-pdf" },
  sheet: { icon: FileSpreadsheet, className: "bg-file-sheet" },
  doc: { icon: FileText, className: "bg-file-doc" },
  image: { icon: ImageIcon, className: "bg-file-image" },
  video: { icon: Play, className: "bg-file-video" },
  archive: { icon: Archive, className: "bg-file-archive" },
};

export function FileList() {
  return (
    <section aria-label="Files">
      <div className="flex items-center justify-between">
        <h2 className="text-[1.15rem] font-bold text-foreground">Files</h2>
        <button
          type="button"
          className="flex items-center gap-2 text-[0.98rem] font-semibold text-primary transition-opacity hover:opacity-80"
        >
          Sort
          <SlidersHorizontal className="size-4" strokeWidth={2.5} />
        </button>
      </div>

      <ul className="shadow-panel mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
        {files.map((file) => {
          const { icon: Icon, className } = kindStyles[file.kind];
          return (
            <li key={file.id}>
              <div className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-secondary/60">
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-primary-foreground ${className}`}
                >
                  <Icon className="size-5" strokeWidth={2.25} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[1.02rem] font-medium text-foreground">
                      {file.name}
                    </span>
                    {file.starred && (
                      <Star
                        className="size-4 shrink-0 fill-primary text-primary"
                        aria-label="Starred"
                      />
                    )}
                  </span>
                  <span className="mt-0.5 block text-[0.88rem] text-muted-foreground">
                    {file.date} • {file.size}
                  </span>
                </span>

                <button
                  type="button"
                  aria-label={`More options for ${file.name}`}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary active:scale-95"
                >
                  <MoreVertical className="size-4" strokeWidth={2.5} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
