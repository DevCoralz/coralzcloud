import { ChevronDown } from "lucide-react";

export function ScrollCue() {
  return (
    <div className="relative mt-16 h-40 overflow-hidden">
      <svg
        viewBox="0 0 390 160"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <path
          d="M0 44C70 12 150 46 220 40S330 8 390 26V160H0V44Z"
          fill="var(--color-wave)"
        />
      </svg>
      <span
        aria-hidden="true"
        className="absolute left-[26%] top-[62%] size-2 rounded-full bg-primary/25 animate-drift"
      />
      <span
        aria-hidden="true"
        className="absolute right-[30%] top-[52%] size-2 rounded-full bg-primary/25 animate-drift"
        style={{ animationDelay: "1.5s" }}
      />
      <div className="relative flex h-full items-end justify-center pb-10">
        <ChevronDown className="size-7 text-primary animate-float-soft" />
      </div>
    </div>
  );
}
