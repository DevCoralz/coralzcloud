import { ChevronLeft, ChevronRight, Folder, FolderPlus, MoreVertical } from "lucide-react";
import type { BreadcrumbItem } from "../hooks/useDashboard";
import type { FolderEntry } from "@/lib/api/storage";

type Props = {
  folders: FolderEntry[];
  breadcrumbs: BreadcrumbItem[];
  onNavigateToFolder: (folder: FolderEntry) => void;
  onNavigateToBreadcrumb: (index: number) => void;
  onCreateFolder: () => void;
  onDeleteFolder: (id: number) => void;
};

export function FoldersRow({
  folders,
  breadcrumbs,
  onNavigateToFolder,
  onNavigateToBreadcrumb,
  onCreateFolder,
  onDeleteFolder,
}: Props) {
  return (
    <section aria-label="Folders">
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

      <div className="flex items-center justify-between">
        <h2 className="text-[1rem] font-bold text-foreground sm:text-[1.1rem]">Folders</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCreateFolder}
            className="flex items-center gap-1 text-[0.8rem] font-medium text-primary transition-opacity hover:opacity-80"
          >
            <FolderPlus className="size-4" />
            New
          </button>
          {folders.length > 0 && (
            <button
              type="button"
              className="flex items-center gap-0.5 text-[0.85rem] font-semibold text-primary transition-opacity hover:opacity-80 sm:text-[0.9rem]"
            >
              View all
              <ChevronRight className="size-3.5 sm:size-4" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {folders.length === 0 ? (
        <button
          type="button"
          onClick={onCreateFolder}
          className="mt-3 flex w-full items-center gap-3 rounded-xl border border-dashed border-hairline bg-secondary/40 px-4 py-8 transition-colors hover:bg-secondary/70 active:scale-[0.99] sm:py-10"
        >
          <FolderPlus className="size-5 text-muted-foreground" strokeWidth={2} />
          <span className="text-[0.88rem] font-medium text-muted-foreground">
            Create your first folder
          </span>
        </button>
      ) : (
        <ul className="-mx-4 mt-3 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:gap-3 sm:px-0">
          {folders.map((folder) => (
            <li key={folder.id} className="w-[28%] min-w-[110px] max-w-[160px] shrink-0 snap-start sm:w-auto sm:flex-1">
              <div className="group relative flex w-full flex-col rounded-xl bg-surface p-3 text-left transition-transform hover:-translate-y-0.5 active:scale-[0.98] sm:rounded-2xl sm:p-4">
                <button
                  type="button"
                  className="flex w-full flex-col text-left"
                  onClick={() => onNavigateToFolder(folder)}
                >
                  <span className="flex items-start justify-between">
                    <Folder className="size-6 fill-primary text-primary sm:size-7" strokeWidth={1.5} />
                  </span>
                  <span className="mt-4 text-[0.88rem] font-semibold text-foreground sm:mt-5 sm:text-[0.95rem]">
                    {folder.name}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFolder(folder.id);
                  }}
                  className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-secondary group-hover:opacity-100"
                  aria-label={`Delete ${folder.name}`}
                >
                  <MoreVertical className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
