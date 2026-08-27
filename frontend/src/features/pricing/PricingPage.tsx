import { ArrowLeft, Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { RequireAuth } from "@/lib/auth/RequireAuth";

const plans = [
  {
    name: "Free",
    price: "Free",
    storage: "5 GB",
    maxUpload: "1 GB",
    features: ["5 GB storage", "1 GB max upload", "Basic file management", "Email support"],
    current: true,
  },
  {
    name: "Pro",
    price: "Coming soon",
    storage: "500 GB",
    maxUpload: "2 GB",
    features: ["500 GB storage", "2 GB max upload", "Priority support", "Advanced sharing"],
    current: false,
  },
  {
    name: "Business",
    price: "Coming soon",
    storage: "1 TB",
    maxUpload: "4 GB",
    features: ["1 TB storage", "4 GB max upload", "Team collaboration", "Admin controls", "Priority support"],
    current: false,
  },
];

export function PricingPage() {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6 md:px-8">
            <Link
              to="/profile"
              className="flex size-10 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-secondary active:scale-95"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <h1 className="text-[1.05rem] font-bold text-foreground">Plans & Storage</h1>
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
          <div className="space-y-5">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-5 ${
                  plan.current
                    ? "border-2 border-primary bg-primary/5"
                    : "border border-hairline bg-surface"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-[1rem] font-bold text-foreground">{plan.name}</h3>
                    <p className="text-[0.82rem] text-muted-foreground">{plan.price}</p>
                  </div>
                  {plan.current && (
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-[0.75rem] font-semibold text-primary">
                      Current
                    </span>
                  )}
                </div>
                <div className="mb-3 flex gap-4">
                  <div>
                    <p className="text-[0.75rem] text-muted-foreground">Storage</p>
                    <p className="text-[0.95rem] font-bold text-foreground">{plan.storage}</p>
                  </div>
                  <div>
                    <p className="text-[0.75rem] text-muted-foreground">Max upload</p>
                    <p className="text-[0.95rem] font-bold text-foreground">{plan.maxUpload}</p>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[0.82rem] text-foreground">
                      <Check className="size-3.5 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
