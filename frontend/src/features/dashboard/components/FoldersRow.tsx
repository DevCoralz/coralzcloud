import { ChevronRight, Folder, FolderPlus, MoreVertical } from "lucide-react";
import { folders } from "../data";

export function FoldersRow() {
  return (
    <section aria-label="Folders">
      <div className="flex items-center justify-between">
        <h2 className="text-[1rem] font-bold text-foreground sm:text-[1.1rem]">Folders</h2>
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

      {folders.length === 0 ? (
        <button
          type="button"
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
              <button
                type="button"
                className="flex w-full flex-col rounded-xl bg-surface p-3 text-left transition-transform hover:-translate-y-0.5 active:scale-[0.98] sm:rounded-2xl sm:p-4"
              >
                <span className="flex items-start justify-between">
                  <Folder className="size-6 fill-primary text-primary sm:size-7" strokeWidth={1.5} />
                  <MoreVertical className="size-3.5 text-muted-foreground sm:size-4" />
                </span>
                <span className="mt-4 text-[0.88rem] font-semibold text-foreground sm:mt-5 sm:text-[0.95rem]">
                  {folder.name}
                </span>
                <span className="mt-0.5 text-[0.78rem] text-muted-foreground sm:text-[0.82rem]">
                  {folder.count} items
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
