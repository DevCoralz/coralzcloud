import { Crown } from "lucide-react";
import type { StorageUsage } from "@/lib/api/storage";

type Props = {
  usage: StorageUsage;
};

export function StorageCard({ usage }: Props) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const dash = (usage.percent / 100) * c;

  return (
    <section
      aria-label="Storage used"
      className="bg-royal flex items-center gap-3 rounded-2xl px-4 py-5 text-primary-foreground sm:gap-4 sm:rounded-3xl sm:px-6 sm:py-6"
    >
      <div className="relative size-[64px] shrink-0 sm:size-[72px] md:size-[80px]">
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
        <span className="absolute inset-0 flex items-center justify-center text-[0.9rem] font-bold sm:text-[1rem]">
          {usage.percent}%
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[0.82rem] font-medium opacity-85 sm:text-[0.88rem]">Storage Used</p>
        <p className="mt-0.5 whitespace-nowrap font-bold leading-none text-[1.2rem] sm:text-[1.35rem]">
          {usage.usedLabel}
          <span className="ml-1 text-[0.82rem] sm:text-[0.9rem] font-medium opacity-80">
            / {usage.totalLabel}
          </span>
        </p>
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-primary-foreground/25">
          <div
            className="h-full rounded-full bg-primary-foreground transition-all duration-1000"
            style={{ width: `${usage.percent}%` }}
          />
        </div>
        <p className="mt-1.5 whitespace-nowrap text-[0.78rem] opacity-85 sm:text-[0.82rem]">
          {usage.percent}% used • {usage.freeLabel}
        </p>
      </div>

      <button
        type="button"
        className="flex shrink-0 items-center gap-1.5 self-center rounded-xl border border-primary-foreground/60 px-3 py-2 text-[0.82rem] font-semibold transition-colors hover:bg-primary-foreground/15 active:scale-95 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-[0.88rem]"
      >
        <Crown className="size-3.5 sm:size-4" strokeWidth={2.25} />
        Upgrade
      </button>
    </section>
  );
}
