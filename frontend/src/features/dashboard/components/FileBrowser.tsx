import { ChevronRight, Download, FilePlus, Folder, MoreVertical, SlidersHorizontal, SortAsc, Trash2 } from "lucide-react";
import { useState } from "react";
import type { FileEntry, FolderEntry } from "@/lib/api/storage";
import { FileTypeIcon } from "./FileTypeIcon";

type SortOption = "name-asc" | "name-desc" | "newest" | "oldest";

const sortLabels: Record<SortOption, string> = {
  "name-asc": "A → Z",
  "name-desc": "Z → A",
  newest: "Newest first",
  oldest: "Oldest first",
};

type BreadcrumbItem = { id: number | null; name: string };

type Props = {
  folders: FolderEntry[];
  files: FileEntry[];
  breadcrumbs: BreadcrumbItem[];
  onNavigateToFolder: (folder: FolderEntry) => void;
  onNavigateToBreadcrumb: (index: number) => void;
  onUploadFile: () => void;
  onDeleteFolder: (id: number) => void;
  onDeleteFile: (id: number) => void;
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

export function FileBrowser({
  folders,
  files,
  breadcrumbs,
  onNavigateToFolder,
  onNavigateToBreadcrumb,
  onUploadFile,
  onDeleteFolder,
  onDeleteFile,
}: Props) {
  const [sort, setSort] = useState<SortOption>("newest");
  const [showSort, setShowSort] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const sortedFolders = [...folders].sort((a, b) => a.name.localeCompare(b.name));

  const sortedFiles = [...files].sort((a, b) => {
    switch (sort) {
      case "name-asc":
        return a.originalName.localeCompare(b.originalName);
      case "name-desc":
        return b.originalName.localeCompare(a.originalName);
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
  });

  const isEmpty = sortedFolders.length === 0 && sortedFiles.length === 0;
  const hasItems = sortedFolders.length > 0 || sortedFiles.length > 0;

  return (
    <section aria-label="Files">
      {breadcrumbs.length > 1 && (
        <nav className="mb-3 flex items-center gap-1 overflow-x-auto text-[0.8rem] [scrollbar-width:none]">
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <span key={i} className="flex items-center gap-1 whitespace-nowrap">
                {i > 0 && <ChevronRight className="size-3 text-muted-foreground" />}
                <button
                  type="button"
                  onClick={() => !isLast && onNavigateToBreadcrumb(i)}
                  className={`font-medium ${
                    isLast ? "text-foreground" : "text-primary hover:underline"
                  }`}
                >
                  {crumb.name}
                </button>
              </span>
            );
          })}
        </nav>
      )}

      <div className="flex items-center justify-between px-1">
        <h2 className="text-[1rem] font-bold text-foreground sm:text-[1.1rem]">Files</h2>
        {hasItems && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-1.5 text-[0.85rem] font-semibold text-primary transition-opacity hover:opacity-80"
            >
              Sort
              <SortAsc className="size-3.5" />
            </button>
            {showSort && (
              <div className="absolute right-0 top-8 z-20 w-44 overflow-hidden rounded-xl border border-hairline bg-white shadow-lg animate-rise">
                {(Object.keys(sortLabels) as SortOption[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSort(key);
                      setShowSort(false);
                    }}
                    className={`flex w-full items-center px-3.5 py-2.5 text-left text-[0.82rem] transition-colors ${
                      sort === key
                        ? "bg-primary/5 font-medium text-primary"
                        : "text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {sortLabels[key]}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {isEmpty ? (
        <p className="mt-4 text-center text-[0.85rem] text-muted-foreground">
          Your drive is empty. Upload files or create a folder to get started.
        </p>
      ) : (
        <div className="mt-2">
          {sortedFolders.map((folder) => (
            <div
              key={`folder-${folder.id}`}
              className="group flex items-center gap-3 border-b border-hairline/60 px-1 py-3 transition-colors hover:bg-secondary/40"
            >
              <span className="flex size-9 shrink-0 items-center justify-center text-primary sm:size-10">
                <Folder className="size-[22px] fill-primary" strokeWidth={1.5} />
              </span>
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={() => onNavigateToFolder(folder)}
              >
                <span className="truncate text-[0.88rem] font-medium text-foreground sm:text-[0.92rem]">
                  {folder.name}
                </span>
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenMenu(openMenu === `f-${folder.id}` ? null : `f-${folder.id}`)}
                  className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary active:scale-95"
                  aria-label={`Options for ${folder.name}`}
                >
                  <MoreVertical className="size-4" />
                </button>
                {openMenu === `f-${folder.id}` && (
                  <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-xl border border-hairline bg-white shadow-lg animate-rise">
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteFolder(folder.id);
                        setOpenMenu(null);
                      }}
                      className="flex w-full items-center gap-2 px-3.5 py-2.5 text-[0.82rem] text-red-500 transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {sortedFiles.map((file, i) => (
            <div
              key={`file-${file.id}`}
              className={`group flex items-center gap-3 px-1 py-3 transition-colors hover:bg-secondary/40 sm:gap-3.5 ${
                i < sortedFiles.length - 1 || sortedFolders.length > 0 ? "border-b border-hairline/60" : ""
              }`}
            >
              <FileTypeIcon kind={fileKindFromMime(file.mimeType)} />
              <span className="min-w-0 flex-1">
                <span className="truncate text-[0.88rem] font-medium text-foreground sm:text-[0.92rem]">
                  {file.originalName}
                </span>
                <span className="mt-0.5 block text-[0.76rem] text-muted-foreground sm:text-[0.8rem]">
                  {formatDate(file.createdAt)} • {formatSize(file.sizeBytes)}
                </span>
              </span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenMenu(openMenu === `fi-${file.id}` ? null : `fi-${file.id}`)}
                  className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary active:scale-95"
                  aria-label={`Options for ${file.originalName}`}
                >
                  <MoreVertical className="size-4" />
                </button>
                {openMenu === `fi-${file.id}` && (
                  <div className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-xl border border-hairline bg-white shadow-lg animate-rise">
                    <a
                      href={`/api/files/${file.id}/download`}
                      className="flex w-full items-center gap-2 px-3.5 py-2.5 text-[0.82rem] text-foreground transition-colors hover:bg-secondary/50"
                      onClick={() => setOpenMenu(null)}
                    >
                      <Download className="size-3.5" />
                      Download
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteFile(file.id);
                        setOpenMenu(null);
                      }}
                      className="flex w-full items-center gap-2 px-3.5 py-2.5 text-[0.82rem] text-red-500 transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
