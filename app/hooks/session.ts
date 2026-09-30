// hooks/useSession.ts
"use client";

import { useEffect, useState } from "react";

type SessionUser = {
  id: string;
  email: string;
  name?: string;
  image?:string | null;
  githubAccessToken?: string;
} | null;

export function useSession() {
  const [user, setUser] = useState<SessionUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include", 
        });

        if (!res.ok) {
          if (!cancelled) setUser(null);
          return;
        }

        const data = await res.json();
        if (!cancelled) setUser(data.user ?? null);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSession();

    return () => {
      cancelled = true;
    };
  }, []);

  return { user, loading };
}