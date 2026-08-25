export function AuthDivider() {
  return (
    <div className="flex items-center gap-4" aria-hidden="true">
      <span className="h-px flex-1 bg-border" />
      <span className="text-sm text-muted-foreground">or</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
