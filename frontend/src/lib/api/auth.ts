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

export function registerRequest(input: {
  fullName: string;
  username: string;
  email: string;
  password: string;
}) {
  // Backend's RegisterRequest (schemas/auth.py) requires full_name — snake_case
  // on the wire, since FastAPI/Pydantic there isn't configured to accept
  // camelCase field names on request bodies (unlike the response, which is
  // aliased the other way). Map the shape here so callers can keep using
  // fullName like every other field in this file.
  return api.post<UserResponse>("/auth/register", {
    full_name: input.fullName,
    username: input.username,
    email: input.email,
    password: input.password,
  });
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
