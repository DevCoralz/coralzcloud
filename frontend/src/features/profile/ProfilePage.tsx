import { ArrowLeft, Camera, ChevronRight, Mail, Monitor, Pencil, Trash2, User, AtSign, Calendar, Lock, Clock, Home, Users, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useRef } from "react";

import { useAuth } from "@/lib/auth/AuthContext";

export function ProfilePage() {
  const { user, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/profile/avatar", { method: "POST", credentials: "include", body: fd });
      if (res.ok) window.location.reload();
    } catch (err) {
      console.error("Avatar upload failed", err);
    }
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    
      <div className="min-h-screen bg-white pb-40">
        {/* ─── HEADER ─── */}
        <div className="flex items-center justify-between bg-white px-4 py-3">
          <Link to="/dashboard" className="flex size-10 items-center justify-center rounded-xl text-[#1F2937] transition-colors hover:bg-gray-100 active:scale-95">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 40 30" className="h-5 w-7" aria-hidden="true">
              <path fill="#2563EB" d="M11 27.5C4.92 27.5 0 22.7 0 16.8 0 11.3 4.3 6.8 9.8 6.2 12 2.4 16.2 0 20.8 0 27.4 0 33 4.8 34 11.2c3.5 1 6 4.1 6 7.8 0 4.7-3.9 8.5-8.7 8.5H11Z" />
              <path fill="#FFFFFF" d="M19.5 8.7a.9.9 0 0 1 1.3 0l3.3 3.4c.4.4.1 1.1-.5 1.1h-1.9v5.1c0 .8-.6 1.4-1.4 1.4s-1.4-.6-1.4-1.4v-5.1h-1.9c-.6 0-.9-.7-.5-1.1l3-3.4Z" />
            </svg>
            <span className="text-[1rem] font-bold"><span className="text-primary">Coralz</span> <span className="text-[#1F2937]">Cloud</span></span>
          </div>
          <button type="button" className="flex size-10 items-center justify-center rounded-xl text-[#1F2937] transition-colors hover:bg-gray-100 active:scale-95">
            <svg className="size-5" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
          </button>
        </div>

        {/* ─── BLUE GRADIENT + AVATAR ─── */}
        <div className="relative">
          <div className="h-44" style={{ background: "linear-gradient(180deg, #1A368D 0%, #2563EB 100%)" }} />
          <div className="absolute bottom-0 left-0 flex w-full justify-center" style={{ transform: "translateY(50%)" }}>
            <div className="relative">
              <div className="size-[100px] rounded-full border-[3px] border-white" style={{ background: "#2563EB" }}>
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center"><User className="size-12 text-white" strokeWidth={1.5} /></div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-white"
                style={{ background: "#2563EB" }}
              >
                <Camera className="size-3.5 text-white" />
              </button>
            </div>
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />

        {/* ─── NAME + USERNAME ─── */}
        <div className="mt-14 text-center">
          <h2 className="text-[1.2rem] font-bold text-[#1F2937]">{user?.displayName || "User"}</h2>
          <p className="text-[0.88rem] text-[#6B7280]">@{user?.username || "username"}</p>
        </div>

        {/* ─── STORAGE CARD ─── */}
        <div className="mx-auto mt-4 flex max-w-sm items-center rounded-xl border border-gray-200 px-6 py-4" style={{ background: "#F3F4F6" }}>
          <div className="flex flex-1 items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full" style={{ background: "#EEF2FF" }}>
              <Clock className="size-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[0.95rem] font-bold text-[#1F2937]">{user?.storage?.usedLabel || "0 B"}</p>
              <p className="text-[0.72rem] text-[#6B7280]">Used</p>
            </div>
          </div>
          <div className="mx-3 h-10 w-px bg-gray-300" />
          <div className="flex flex-1 items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full" style={{ background: "#EEF2FF" }}>
              <svg viewBox="0 0 24 24" className="size-5 text-[#2563EB]" fill="currentColor">
                <path d="M4.5 13.5a5 5 0 0 1 9.9-1.5A3.5 3.5 0 0 1 21 16a3 3 0 0 1-3 3H6a4.5 4.5 0 0 1-.5-9z" />
              </svg>
            </div>
            <div>
              <p className="text-[0.95rem] font-bold text-[#1F2937]">{user?.storage?.totalLabel || "5.0 GB"}</p>
              <p className="text-[0.72rem] text-[#6B7280]">Total Storage</p>
            </div>
          </div>
        </div>

        {/* ─── TAB BAR ─── */}
        <div className="mt-5 border-b border-gray-200">
          <div className="flex">
            {[
              { key: "profile", label: "Profile", icon: User, active: true },
              { key: "security", label: "Security", icon: Lock, active: false },
              { key: "sessions", label: "Sessions", icon: Monitor, active: false },
            ].map(({ key, label, icon: Icon, active }) => (
              <button
                key={key}
                type="button"
                className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-[0.82rem] font-medium transition-colors ${
                  active ? "border-b-2 text-[#2563EB]" : "text-[#9CA3AF]"
                }`}
                style={active ? { borderColor: "#2563EB" } : {}}
              >
                <Icon className="size-3.5" strokeWidth={2} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── PROFILE FIELDS ─── */}
        <div className="px-5 pt-4">
          <ProfileFieldRow icon={User} label="Full Name" value={user?.displayName || "Not set"} />
          <ProfileFieldRow icon={AtSign} label="Username" value={user?.username || "Not set"} last />
        </div>

        <div className="px-5 pt-3">
          <ProfileFieldRow icon={Mail} label="Email Address" value={user?.email || "Not set"} />
          <ProfileFieldRow icon={Calendar} label="Joined" value={user?.createdAt ? formatDate(user.createdAt) : "Unknown"} last />
        </div>

        {/* ─── ACTION ROWS ─── */}
        <div className="px-5 pt-4">
          <ActionRow icon={Lock} label="Change Password" to="/profile/password" />
          <ActionRow icon={Monitor} label="Connected Devices" />
          <ActionRow icon={Trash2} label="Delete Account" last />
        </div>

        {/* ─── BOTTOM NAV ─── */}
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white" style={{ boxShadow: "0 -2px 8px rgba(0,0,0,0.06)" }}>
          <ul className="mx-auto flex max-w-5xl items-center justify-around px-4 pt-2 pb-2">
            {[
              { label: "My Drive", icon: Home, active: true },
              { label: "Recent", icon: Clock, active: false },
              { label: "Shared", icon: Users, active: false },
              { label: "Starred", icon: Star, active: false },
              { label: "Trash", icon: Trash2, active: false },
            ].map(({ label, icon: Icon, active }) => (
              <li key={label} className="flex-1">
                <Link to={label === "My Drive" ? "/dashboard" : "#"} className="flex w-full flex-col items-center gap-0.5">
                  <Icon className="size-5" strokeWidth={active ? 2.5 : 1.8} style={{ color: active ? "#2563EB" : "#9CA3AF" }} />
                  <span className="text-[0.65rem] font-medium" style={{ color: active ? "#2563EB" : "#9CA3AF" }}>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    
  );
}

/* ─── Field Row: icon circle + label/value + pencil ─── */
function ProfileFieldRow({ icon: Icon, label, value, last }: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 py-4 ${!last ? "border-b border-gray-100" : ""}`}>
      <div className="flex size-10 items-center justify-center rounded-full" style={{ background: "#EBF5FF" }}>
        <Icon className="size-5" strokeWidth={1.8} style={{ color: "#2563EB" }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[0.72rem] text-[#9CA3AF]">{label}</p>
        <p className="text-[0.95rem] font-bold text-[#1F2937]">{value}</p>
      </div>
      <Pencil className="size-4 text-[#9CA3AF]" />
    </div>
  );
}

/* ─── Action Row: icon + label + chevron ─── */
function ActionRow({ icon: Icon, label, to, last }: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  to?: string;
  last?: boolean;
}) {
  const content = (
    <div className={`flex items-center gap-3 py-4 ${!last ? "border-b border-gray-100" : ""}`}>
      <div className="flex size-10 items-center justify-center">
        <Icon className="size-5" strokeWidth={1.8} style={{ color: "#2563EB" }} />
      </div>
      <span className="flex-1 text-[0.95rem] font-medium text-[#1F2937]">{label}</span>
      <ChevronRight className="size-4 text-[#9CA3AF]" />
    </div>
  );

  if (to) return <Link to={to}>{content}</Link>;
  return <button type="button" className="w-full text-left">{content}</button>;
}
