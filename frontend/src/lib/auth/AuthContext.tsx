import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../api/client";
import {
  loginRequest,
  logoutRequest,
  meRequest,
  registerRequest,
  type User,
} from "../api/auth";

const CURRENT_USER_QUERY_KEY = ["auth", "me"] as const;

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  register: (input: { username: string; email: string; password: string }) => Promise<User>;
  login: (input: { identifier: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  // Avoids flashing a "logged out" state on first paint while the
  // session check is in flight.
  const [hasCheckedOnce, setHasCheckedOnce] = useState(false);

  const meQuery = useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: async () => {
      try {
        const { user } = await meRequest();
        return user;
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          return null;
        }
        throw err;
      }
    },
    staleTime: 60_000,
    retry: false,
  });

  useEffect(() => {
    if (!meQuery.isPending) setHasCheckedOnce(true);
  }, [meQuery.isPending]);

  const registerMutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: ({ user }) => {
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, user);
    },
  });

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: ({ user }) => {
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, null);
    },
  });

  const value: AuthContextValue = {
    user: meQuery.data ?? null,
    isLoading: !hasCheckedOnce,
    register: async (input) => {
      const { user } = await registerMutation.mutateAsync(input);
      return user;
    },
    login: async (input) => {
      const { user } = await loginMutation.mutateAsync(input);
      return user;
    },
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
