import { MoreVertical, SlidersHorizontal, Star } from "lucide-react";
import { files } from "../data";
import { FileTypeIcon } from "./FileTypeIcon";

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

      <ul className="shadow-soft mt-3 divide-y divide-hairline overflow-hidden rounded-2xl bg-surface">
        {files.map((file) => {
          return (
            <li key={file.id}>
              <div className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-secondary/50">
                <FileTypeIcon kind={file.kind} />

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
