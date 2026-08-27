import { api } from "../api/client";

export type UserProfile = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
  plan: {
    id: number;
    name: string;
    storageLimitBytes: number;
    maxUploadBytes: number;
    priceLabel: string | null;
  };
  usage: {
    usedBytes: number;
    usedLabel: string;
    totalLabel: string;
    freeLabel: string;
    percent: number;
  };
};

export type Plan = {
  id: number;
  name: string;
  storageLimitBytes: number;
  maxUploadBytes: number;
  priceLabel: string | null;
  features: string[];
};

export const profileApi = {
  getProfile: () => api.get<UserProfile>("/profile"),

  updateProfile: (data: { fullName?: string; username?: string; email?: string }) =>
    api.post<UserProfile>("/profile/update", data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post<{ success: boolean }>("/profile/password", data),

  uploadAvatar: async (file: File) => {
    const fd = new FormData();
    fd.append("avatar", file);
    const response = await fetch(`/api/profile/avatar`, {
      method: "POST",
      credentials: "include",
      body: fd,
    });
    if (!response.ok) throw new Error("Upload failed");
    return response.json() as Promise<{ avatarUrl: string }>;
  },

  getPlans: () => api.get<Plan[]>("/plans"),
};
