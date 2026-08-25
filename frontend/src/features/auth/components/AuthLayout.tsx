import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

import { Logo } from "@/components/layout/Logo";
import { site } from "@/config/site";
import { AuthIllustration } from "./AuthIllustration";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <div className="mx-auto w-full max-w-[30rem] px-6 pb-14 pt-6">
        <header className="relative flex h-11 items-center justify-center">
          <Link
            to="/"
            aria-label="Go back"
            className="absolute left-0 flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary"
          >
            <ChevronLeft className="size-6" strokeWidth={2} />
          </Link>
          <Link to="/" aria-label={site.name}>
            <Logo />
          </Link>
        </header>

        <div className="mt-6">
          <AuthIllustration />
        </div>

        <div className="mt-5 text-center animate-rise">
          <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mx-auto mt-3 max-w-[22rem] text-[1.02rem] leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        </div>

        <section className="mt-7">{children}</section>
      </div>
    </main>
  );
}
