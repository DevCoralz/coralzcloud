import { ArrowLeft, Camera, ChevronRight, Lock, Shield, User, CreditCard, LogOut } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { RequireAuth } from "@/lib/auth/RequireAuth";
import { useAuth } from "@/lib/auth/AuthContext";

export function ProfilePage() {
  const { user, logout } = useAuth();

  const sections = [
    {
      title: "Account",
      items: [
        { icon: User, label: "Personal Info", desc: "Name, username, email", to: "/profile/edit" },
        { icon: Camera, label: "Profile Photo", desc: "Change your avatar" },
      ],
    },
    {
      title: "Security",
      items: [
        { icon: Lock, label: "Password", desc: "Change your password", to: "/profile/password" },
        { icon: Shield, label: "Sessions", desc: "Manage active sessions" },
      ],
    },
    {
      title: "Billing",
      items: [
        { icon: CreditCard, label: "Plan & Storage", desc: "5 GB free", to: "/pricing" },
      ],
    },
  ];

  return (
    <RequireAuth>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6 md:px-8">
            <Link
              to="/dashboard"
              className="flex size-10 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-secondary active:scale-95"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <h1 className="text-[1.05rem] font-bold text-foreground">Settings</h1>
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-4 py-4 sm:px-6">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex size-16 items-center justify-center overflow-hidden rounded-full bg-foreground text-background">
              {user?.displayName ? (
                <span className="text-xl font-bold">{user.displayName.charAt(0).toUpperCase()}</span>
              ) : (
                <User className="size-7" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[1rem] font-semibold text-foreground">
                {user?.displayName || user?.username || "User"}
              </p>
              <p className="truncate text-[0.85rem] text-muted-foreground">{user?.email}</p>
            </div>
            <Link
              to="/profile/edit"
              className="text-[0.85rem] font-medium text-primary"
            >
              Edit
            </Link>
          </div>

          {sections.map((section) => (
            <div key={section.title} className="mb-6">
              <h2 className="mb-2 px-1 text-[0.78rem] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h2>
              <div>
                {section.items.map((item, i) => {
                  const Icon = item.icon;
                  const isLast = i === section.items.length - 1;
                  return item.to ? (
                    <Link
                      key={item.label}
                      to={item.to}
                      className={`flex items-center gap-3 px-1 py-3.5 transition-colors hover:bg-secondary/40 ${
                        !isLast ? "border-b border-hairline/60" : ""
                      }`}
                    >
                      <Icon className="size-5 text-muted-foreground" strokeWidth={1.8} />
                      <span className="flex-1">
                        <span className="block text-[0.9rem] font-medium text-foreground">{item.label}</span>
                        <span className="block text-[0.78rem] text-muted-foreground">{item.desc}</span>
                      </span>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </Link>
                  ) : (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        if (item.label === "Profile Photo") {
                          document.getElementById("avatar-input")?.click();
                        }
                      }}
                      className={`flex w-full items-center gap-3 px-1 py-3.5 text-left transition-colors hover:bg-secondary/40 ${
                        !isLast ? "border-b border-hairline/60" : ""
                      }`}
                    >
                      <Icon className="size-5 text-muted-foreground" strokeWidth={1.8} />
                      <span className="flex-1">
                        <span className="block text-[0.9rem] font-medium text-foreground">{item.label}</span>
                        <span className="block text-[0.78rem] text-muted-foreground">{item.desc}</span>
                      </span>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={async () => {
              await logout();
            }}
            className="flex w-full items-center gap-3 px-1 py-3.5 text-left text-red-500 transition-colors hover:bg-red-50/50"
          >
            <LogOut className="size-5" strokeWidth={1.8} />
            <span className="text-[0.9rem] font-medium">Log out</span>
          </button>
        </main>
      </div>
    </RequireAuth>
  );
}
