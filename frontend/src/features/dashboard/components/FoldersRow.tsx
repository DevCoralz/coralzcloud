import { ChevronRight, Folder, MoreVertical } from "lucide-react";
import { folders } from "../data";

export function FoldersRow() {
  return (
    <section aria-label="Folders">
      <div className="flex items-center justify-between">
        <h2 className="text-[1.15rem] font-bold text-foreground">Folders</h2>
        <button
          type="button"
          className="flex items-center gap-1 text-[0.98rem] font-semibold text-primary transition-opacity hover:opacity-80"
        >
          View all
          <ChevronRight className="size-4" strokeWidth={2.5} />
        </button>
      </div>

      <ul className="-mx-5 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        {folders.map((folder) => (
          <li key={folder.id} className="w-[42%] min-w-[148px] max-w-[190px] shrink-0 snap-start sm:w-auto sm:flex-1">
            <button
              type="button"
              className="shadow-soft flex w-full flex-col rounded-2xl bg-surface p-4 text-left transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <span className="flex items-start justify-between">
                <Folder className="size-7 fill-primary text-primary" strokeWidth={1.5} />
                <MoreVertical className="size-4 text-muted-foreground" />
              </span>
              <span className="mt-6 text-[1.05rem] font-semibold text-foreground">
                {folder.name}
              </span>
              <span className="mt-1 text-[0.9rem] text-muted-foreground">
                {folder.count} items
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
