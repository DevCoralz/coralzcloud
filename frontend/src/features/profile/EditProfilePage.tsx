import { ArrowLeft } from "lucide-react";
import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { RequireAuth } from "@/lib/auth/RequireAuth";
import { useAuth } from "@/lib/auth/AuthContext";
import { api } from "@/lib/api/client";

export function EditProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState(user?.displayName || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/profile/update", {
        full_name: fullName,
        username,
        email,
      });
      setSuccess("Profile updated");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      setError(err?.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-[1.05rem] font-bold text-foreground">Edit Profile</h1>
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-[0.82rem] font-medium text-muted-foreground">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-hairline bg-secondary/50 px-4 py-2.5 text-[0.9rem] text-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
              />
            </div>
            <div>
              <label className="mb-1 block text-[0.82rem] font-medium text-muted-foreground">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-hairline bg-secondary/50 px-4 py-2.5 text-[0.9rem] text-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
              />
            </div>
            <div>
              <label className="mb-1 block text-[0.82rem] font-medium text-muted-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-hairline bg-secondary/50 px-4 py-2.5 text-[0.9rem] text-foreground outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </div>

          {error && <p className="mt-3 text-[0.82rem] text-red-500">{error}</p>}
          {success && <p className="mt-3 text-[0.82rem] text-green-600">{success}</p>}

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-primary py-2.5 text-[0.9rem] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </main>
      </div>
    </RequireAuth>
  );
}
