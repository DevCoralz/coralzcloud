import * as React from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthFieldProps = React.ComponentProps<"input"> & {
  label: string;
  icon: LucideIcon;
  /** Renders a show/hide toggle and swaps the input type. */
  revealable?: boolean;
  error?: string | undefined;
};

export function AuthField({
  label,
  icon: Icon,
  revealable = false,
  error,
  className,
  id,
  type = "text",
  ...props
}: AuthFieldProps) {
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;
  const [revealed, setRevealed] = React.useState(false);
  const inputType = revealable ? (revealed ? "text" : "password") : type;

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className="text-[0.95rem] font-semibold text-foreground">
        {label}
      </Label>
      <div className="relative">
        <Icon
          aria-hidden="true"
          strokeWidth={1.75}
          className="pointer-events-none absolute left-4 top-1/2 size-[1.15rem] -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id={fieldId}
          type={inputType}
          aria-invalid={error ? true : undefined}
          className={cn(
            "h-[3.35rem] rounded-xl border-border bg-surface pl-12 text-[0.95rem] shadow-none placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:ring-0",
            revealable && "pr-12",
            error && "border-destructive",
            className,
          )}
          {...props}
        />
        {revealable && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
          >
            {revealed ? (
              <EyeOff className="size-[1.15rem]" strokeWidth={1.75} />
            ) : (
              <Eye className="size-[1.15rem]" strokeWidth={1.75} />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
