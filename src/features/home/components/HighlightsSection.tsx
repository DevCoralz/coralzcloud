import { Shield, Zap, Users } from "lucide-react";

const highlights = [
  {
    icon: Shield,
    title: "Secure Storage",
    body: "Your files are encrypted and protected.",
  },
  {
    icon: Zap,
    title: "Fast Access",
    body: "Access your files instantly, anywhere.",
  },
  {
    icon: Users,
    title: "Easy Sharing",
    body: "Share files and folders with anyone.",
  },
];

export function HighlightsSection() {
  return (
    <section className="px-5 pb-4 pt-14 sm:px-8">
      <ul className="mx-auto grid max-w-md grid-cols-3 gap-2.5 sm:max-w-2xl sm:gap-8">
        {highlights.map(({ icon: Icon, title, body }) => (
          <li key={title} className="text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-xl bg-accent/70">
              <Icon className="size-6 text-primary" strokeWidth={2.25} />
            </span>
            <h2 className="mt-4 whitespace-nowrap text-[0.9rem] font-semibold sm:text-[0.95rem]">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
