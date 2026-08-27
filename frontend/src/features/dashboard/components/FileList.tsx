import { Download, FilePlus, MoreVertical, SlidersHorizontal, Star, Trash2 } from "lucide-react";
import type { FileEntry } from "@/lib/api/storage";
import { FileTypeIcon } from "./FileTypeIcon";

type Props = {
  files: FileEntry[];
  onDeleteFile: (id: number) => void;
  onUploadFile: () => void;
};

function fileKindFromMime(mime: string | null): "pdf" | "sheet" | "doc" | "image" | "video" | "archive" {
  if (!mime) return "doc";
  if (mime.includes("pdf")) return "pdf";
  if (mime.includes("sheet") || mime.includes("excel") || mime.includes("csv")) return "sheet";
  if (mime.includes("word") || mime.includes("document")) return "doc";
  if (mime.includes("image")) return "image";
  if (mime.includes("video")) return "video";
  if (mime.includes("zip") || mime.includes("archive") || mime.includes("compressed")) return "archive";
  return "doc";
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function FileList({ files, onDeleteFile, onUploadFile }: Props) {
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
          onClick={onUploadFile}
          className="mt-3 flex w-full items-center gap-3 rounded-xl border border-dashed border-hairline bg-secondary/40 px-4 py-8 transition-colors hover:bg-secondary/70 active:scale-[0.99] sm:py-10"
        >
          <FilePlus className="size-5 text-muted-foreground" strokeWidth={2} />
          <span className="text-[0.88rem] font-medium text-muted-foreground">
            Upload your first file
          </span>
        </button>
      ) : (
        <div className="mt-2">
          {files.map((file, i) => {
            return (
              <div
                key={file.id}
                className={`group flex items-center gap-3 px-1 py-3 transition-colors hover:bg-secondary/40 sm:gap-3.5 ${
                  i < files.length - 1 ? "border-b border-hairline/60" : ""
                }`}
              >
                <FileTypeIcon kind={fileKindFromMime(file.mimeType)} />

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[0.88rem] font-medium text-foreground sm:text-[0.92rem]">
                      {file.originalName}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-[0.76rem] text-muted-foreground sm:text-[0.8rem]">
                    {formatDate(file.createdAt)} • {formatSize(file.sizeBytes)}
                  </span>
                </span>

                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <a
                    href={`/api/files/${file.id}/download`}
                    className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground active:scale-95"
                    aria-label={`Download ${file.originalName}`}
                  >
                    <Download className="size-3.5 sm:size-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => onDeleteFile(file.id)}
                    className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500 active:scale-95"
                    aria-label={`Delete ${file.originalName}`}
                  >
                    <Trash2 className="size-3.5 sm:size-4" />
                  </button>
                </div>

                <button
                  type="button"
                  aria-label={`More options for ${file.originalName}`}
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
