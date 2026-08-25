import { api } from "./client";

export type User = {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  isActive: boolean;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type UserResponse = { user: User };

export function registerRequest(input: { username: string; email: string; password: string }) {
  return api.post<UserResponse>("/auth/register", input);
}

export function loginRequest(input: { identifier: string; password: string }) {
  return api.post<UserResponse>("/auth/login", input);
}

export function logoutRequest() {
  return api.post<{ success: boolean }>("/auth/logout");
}

export function meRequest() {
  return api.get<UserResponse>("/auth/me");
}
