export function Logo() {
  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap">
      <svg viewBox="0 0 40 30" className="h-6 w-8 sm:h-7 sm:w-9" aria-hidden="true">
        <path
          fill="currentColor"
          className="text-primary"
          d="M11 27.5C4.92 27.5 0 22.7 0 16.8 0 11.3 4.3 6.8 9.8 6.2 12 2.4 16.2 0 20.8 0 27.4 0 33 4.8 34 11.2c3.5 1 6 4.1 6 7.8 0 4.7-3.9 8.5-8.7 8.5H11Z"
        />
        <path
          fill="var(--color-surface)"
          d="M20.2 9.3c.8 0 1.4.6 1.4 1.4v5.1h1.9c.6 0 .9.7.5 1.1l-3.3 3.4a.9.9 0 0 1-1.3 0l-3.3-3.4c-.4-.4-.1-1.1.5-1.1h1.9v-5.1c0-.8.6-1.4 1.4-1.4Z"
        />
      </svg>
      <span className="text-[1.28rem] font-bold sm:text-[1.6rem] tracking-tight">
        <span className="text-primary">Coralz</span> <span className="text-foreground">Cloud</span>
      </span>
    </span>
  );
}
