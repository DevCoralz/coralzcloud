import { Link } from "@tanstack/react-router";
import { ArrowRight, CirclePlay } from "lucide-react";
import { HeroIllustration } from "./HeroIllustration";

export function HeroSection() {
  return (
    <section className="px-5 pt-6 sm:px-8">
      <div className="mx-auto max-w-md sm:max-w-lg">
        <HeroIllustration />

        <div className="mt-8 text-center animate-rise">
          <h1 className="text-[2.6rem] font-bold leading-[1.1] sm:text-5xl">
            Your files, secure in <span className="text-primary">the cloud</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xs text-lg leading-relaxed text-muted-foreground sm:max-w-sm">
            Store, access and share your files anytime, anywhere.
          </p>
        </div>

        <div className="mt-9 flex flex-col gap-3.5">
          <Link
            to="/"
            className="flex items-center justify-between rounded-xl bg-primary px-7 py-4 text-lg font-medium text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5"
          >
            <span className="flex-1 text-center">Get Started Free</span>
            <ArrowRight className="size-5 shrink-0" />
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-2.5 rounded-xl border border-border bg-surface px-7 py-4 text-lg text-foreground transition-colors hover:bg-secondary"
          >
            <CirclePlay className="size-5" />
            How it works
          </Link>
        </div>
      </div>
    </section>
  );
}
