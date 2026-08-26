import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

export function SearchBar() {
  const [value, setValue] = useState("");

  return (
    <div className="flex items-center gap-3">
      <label className="group flex h-11 sm:h-12 flex-1 items-center gap-3 rounded-xl bg-secondary/80 px-3.5 transition-colors focus-within:bg-surface focus-within:ring-2 focus-within:ring-primary/20">
        <Search className="size-[18px] shrink-0 text-muted-foreground sm:size-5" strokeWidth={2.25} />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search in My Drive"
          aria-label="Search in My Drive"
          className="w-full bg-transparent text-[0.92rem] text-foreground outline-none placeholder:text-muted-foreground sm:text-[0.95rem]"
        />
      </label>

      <button
        type="button"
        aria-label="Filters"
        className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary/80 text-foreground transition-colors hover:bg-accent active:scale-95 sm:size-12"
      >
        <SlidersHorizontal className="size-[18px] sm:size-5" strokeWidth={2.25} />
      </button>
    </div>
  );
}
