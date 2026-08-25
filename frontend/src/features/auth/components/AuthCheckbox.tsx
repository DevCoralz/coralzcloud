import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type AuthCheckboxProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  "aria-label"?: string;
};

export function AuthCheckbox({
  checked,
  onCheckedChange,
  className,
  "aria-label": ariaLabel,
}: AuthCheckboxProps) {
  return (
    <span className={cn("relative inline-flex size-[1.15rem] shrink-0", className)}>
      <input
        type="checkbox"
        aria-label={ariaLabel}
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="peer size-full cursor-pointer appearance-none rounded-[0.3rem] border border-border bg-surface transition-colors checked:border-primary checked:bg-primary"
      />
      <Check
        aria-hidden="true"
        strokeWidth={3.5}
        className="pointer-events-none absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 text-primary-foreground opacity-0 peer-checked:opacity-100"
      />
    </span>
  );
}
