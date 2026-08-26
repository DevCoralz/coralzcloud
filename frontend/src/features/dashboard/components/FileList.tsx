import { FilePlus, MoreVertical, SlidersHorizontal, Star } from "lucide-react";
import { files } from "../data";
import { FileTypeIcon } from "./FileTypeIcon";

export function FileList() {
  return (
    <section aria-label="Files">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[1rem] font-bold text-foreground sm:text-[1.1rem]">Files</h2>
        {files.length > 0 ? (
          <button
            type="button"
            className="flex items-center gap-1.5 text-[0.85rem] font-semibold text-primary transition-opacity hover:opacity-80 sm:text-[0.9rem]"
          >
            Sort
            <SlidersHorizontal className="size-3.5 sm:size-4" strokeWidth={2.5} />
          </button>
        ) : null}
      </div>

      {files.length === 0 ? (
        <button
          type="button"
          className="mt-3 flex w-full items-center gap-3 rounded-xl border border-dashed border-hairline bg-secondary/40 px-4 py-8 transition-colors hover:bg-secondary/70 active:scale-[0.99] sm:py-10"
        >
          <FilePlus className="size-5 text-muted-foreground" strokeWidth={2} />
          <span className="text-[0.88rem] font-medium text-muted-foreground">
            Add your first file
          </span>
        </button>
      ) : (
        <div className="mt-2">
          {files.map((file, i) => {
            return (
              <div
                key={file.id}
                className={`flex items-center gap-3 px-1 py-3 transition-colors hover:bg-secondary/40 sm:gap-3.5 ${
                  i < files.length - 1 ? "border-b border-hairline/60" : ""
                }`}
              >
                <FileTypeIcon kind={file.kind} />

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[0.88rem] font-medium text-foreground sm:text-[0.92rem]">
                      {file.name}
                    </span>
                    {file.starred && (
                      <Star
                        className="size-3.5 shrink-0 fill-primary text-primary sm:size-4"
                        aria-label="Starred"
                      />
                    )}
                  </span>
                  <span className="mt-0.5 block text-[0.76rem] text-muted-foreground sm:text-[0.8rem]">
                    {file.date} • {file.size}
                  </span>
                </span>

                <button
                  type="button"
                  aria-label={`More options for ${file.name}`}
                  className="flex size-8 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary active:scale-95 sm:size-9"
                >
                  <MoreVertical className="size-3.5 sm:size-4" strokeWidth={2.5} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
