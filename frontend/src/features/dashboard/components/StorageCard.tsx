import { Crown } from "lucide-react";
import { storage } from "../data";

export function StorageCard() {
  const r = 34;
  const c = 2 * Math.PI * r;
  const dash = (storage.percent / 100) * c;

  return (
    <section
      aria-label="Storage used"
      className="bg-royal shadow-royal flex items-center gap-4 rounded-3xl px-4 py-6 sm:gap-5 sm:px-7 text-primary-foreground sm:px-7"
    >
      <div className="relative size-[76px] shrink-0 sm:size-[84px]">
        <svg viewBox="0 0 80 80" className="size-full -rotate-90">
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="7"
            className="opacity-25"
          />
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
            style={{ transition: "stroke-dasharray 1s cubic-bezier(0.16,1,0.3,1)" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[1.05rem] font-bold">
          {storage.percent}%
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[0.92rem] font-medium opacity-85 sm:text-[0.98rem]">Storage Used</p>
        <p className="mt-1 whitespace-nowrap font-bold leading-none sm:text-[1.6rem] text-[1.35rem]">
          {storage.usedLabel}
          <span className="ml-1 text-[0.92rem] sm:text-[1.02rem] font-medium opacity-80">
            / {storage.totalLabel}
          </span>
        </p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-primary-foreground/25">
          <div
            className="h-full rounded-full bg-primary-foreground transition-all duration-1000"
            style={{ width: `${storage.percent}%` }}
          />
        </div>
        <p className="mt-2 whitespace-nowrap text-[0.85rem] opacity-85 sm:text-[0.9rem]">
          {storage.percent}% used • {storage.freeLabel}
        </p>
      </div>

      <button
        type="button"
        className="flex shrink-0 items-center gap-2 self-center rounded-xl border border-primary-foreground/70 px-3 py-2.5 text-[0.9rem] font-semibold transition-colors hover:bg-primary-foreground/15 active:scale-95 sm:px-5 sm:text-[1rem]"
      >
        <Crown className="size-4 sm:size-5" strokeWidth={2.25} />
        Upgrade
      </button>
    </section>
  );
}
