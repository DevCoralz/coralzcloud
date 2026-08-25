type GoogleButtonProps = {
  label: string;
  onClick?: () => void;
};

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2.5 24 .5 14.6.5 6.5 5.9 2.6 13.8l7.8 6.1C12.3 14 17.6 9.5 24 9.5Z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.9 7.2l7.6 5.9c4.4-4.1 7.1-10.2 7.1-17.6Z"
      />
      <path
        fill="#FBBC05"
        d="M10.4 28.1a14.6 14.6 0 0 1 0-8.2l-7.8-6.1a23.5 23.5 0 0 0 0 20.4l7.8-6.1Z"
      />
      <path
        fill="#34A853"
        d="M24 47.5c6.2 0 11.5-2 15.4-5.6l-7.6-5.9c-2.1 1.4-4.8 2.3-7.8 2.3-6.4 0-11.7-4.5-13.6-10.2l-7.8 6.1C6.5 42.1 14.6 47.5 24 47.5Z"
      />
    </svg>
  );
}

export function GoogleButton({ label, onClick }: GoogleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[3.35rem] w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-border bg-surface text-[1.02rem] font-medium text-foreground transition-colors hover:bg-secondary"
    >
      <GoogleMark />
      {label}
    </button>
  );
}
