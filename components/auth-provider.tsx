"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/lib/auth";

const publicPaths = new Set(["/", "/login", "/register", "/verify-email"]);

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  refreshUser: () => Promise<User | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const isPublicPath = publicPaths.has(pathname);

  // Fetch the currently authenticated user from the backend.
  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const result = await api<{ user: User }>("/api/v1/auth/me");

      const authenticatedUser = result?.user ?? null;
      setUser(authenticatedUser);

      return authenticatedUser;
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) {
        setUser(null);
        return null;
      }

      throw cause;
    }
  }, []);

  // Check the current session when the application loads.
  useEffect(() => {
    let active = true;

    async function initializeAuth() {
      try {
        const result = await api<{ user: User }>("/api/v1/auth/me");

        if (active) {
          setUser(result?.user ?? null);
        }
      } catch {
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setReady(true);
        }
      }
    }

    void initializeAuth();

    return () => {
      active = false;
    };
  }, []);

  // Redirect users who are not authenticated.
  useEffect(() => {
    if (!ready || isPublicPath) return;

    if (!user) {
      router.replace("/login");
    }
  }, [isPublicPath, ready, router, user]);

  // Invalidate the server session before clearing client state.
  const signOut = useCallback(async () => {
    try {
      await api("/api/v1/auth/logout", {
        method: "DELETE",
      });
    } catch {
      // Keep the user signed in if the server could not invalidate the session.
      return;
    }

    setUser(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      ready,
      refreshUser,
      signOut,
    }),
    [user, ready, refreshUser, signOut],
  );

  // Public pages render immediately without waiting for authentication.
  // Protected pages wait until authentication has been checked.
  if (!isPublicPath && (!ready || !user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Loading HostelFix...
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
