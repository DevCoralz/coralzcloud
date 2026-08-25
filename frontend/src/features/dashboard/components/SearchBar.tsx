import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

export function SearchBar() {
  const [value, setValue] = useState("");

  return (
    <div className="flex items-center gap-3">
      <label className="group flex h-14 flex-1 items-center gap-3 rounded-2xl bg-secondary px-4 transition-colors focus-within:bg-surface focus-within:ring-2 focus-within:ring-primary/25">
        <Search className="size-5 shrink-0 text-muted-foreground" strokeWidth={2.25} />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search in My Drive"
          aria-label="Search in My Drive"
          className="w-full bg-transparent text-[1.02rem] text-foreground outline-none placeholder:text-muted-foreground"
        />
      </label>

      <button
        type="button"
        aria-label="Filters"
        className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-secondary text-foreground transition-colors hover:bg-accent active:scale-95"
      >
        <SlidersHorizontal className="size-5" strokeWidth={2.25} />
      </button>
    </div>
  );
}
