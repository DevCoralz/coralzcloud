import { ArrowLeft, Users, HardDrive, FileText } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/lib/auth/RequireAuth";
import { api } from "@/lib/api/client";

type AdminStats = {
  totalUsers: number;
  totalStorageBytes: number;
  totalFiles: number;
};

type AdminUser = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  createdAt: string;
  plan: string;
  storageUsed: number;
};

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [s, u] = await Promise.all([
          api.get<AdminStats>("/admin/stats"),
          api.get<AdminUser[]>("/admin/users"),
        ]);
        setStats(s);
        setUsers(u);
      } catch (err: any) {
        setError(err?.message || "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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
            <h1 className="text-[1.05rem] font-bold text-foreground">Admin</h1>
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
          {loading ? (
            <p className="text-center text-[0.85rem] text-muted-foreground">Loading...</p>
          ) : error ? (
            <p className="text-center text-[0.85rem] text-red-500">{error}</p>
          ) : (
            <>
              {stats && (
                <div className="mb-6 grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-surface p-3 text-center">
                    <Users className="mx-auto mb-1 size-5 text-muted-foreground" />
                    <p className="text-[1.2rem] font-bold text-foreground">{stats.totalUsers}</p>
                    <p className="text-[0.72rem] text-muted-foreground">Users</p>
                  </div>
                  <div className="rounded-xl bg-surface p-3 text-center">
                    <HardDrive className="mx-auto mb-1 size-5 text-muted-foreground" />
                    <p className="text-[1.2rem] font-bold text-foreground">{formatSize(stats.totalStorageBytes)}</p>
                    <p className="text-[0.72rem] text-muted-foreground">Storage</p>
                  </div>
                  <div className="rounded-xl bg-surface p-3 text-center">
                    <FileText className="mx-auto mb-1 size-5 text-muted-foreground" />
                    <p className="text-[1.2rem] font-bold text-foreground">{stats.totalFiles}</p>
                    <p className="text-[0.72rem] text-muted-foreground">Files</p>
                  </div>
                </div>
              )}

              <h2 className="mb-3 text-[0.9rem] font-bold text-foreground">Users</h2>
              <div className="space-y-0">
                {users.map((u, i) => (
                  <div
                    key={u.id}
                    className={`flex items-center gap-3 px-1 py-3 ${
                      i < users.length - 1 ? "border-b border-hairline/60" : ""
                    }`}
                  >
                    <div className="flex size-9 items-center justify-center rounded-full bg-secondary text-[0.8rem] font-bold text-foreground">
                      {u.displayName?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.88rem] font-medium text-foreground">
                        {u.displayName || u.username}
                      </p>
                      <p className="truncate text-[0.75rem] text-muted-foreground">{u.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[0.75rem] font-medium text-foreground">{u.plan}</p>
                      <p className="text-[0.7rem] text-muted-foreground">{formatSize(u.storageUsed)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </RequireAuth>
  );
}
