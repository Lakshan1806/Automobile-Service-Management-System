"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";

type ProtectedProps = {
  children: React.ReactNode;
  redirectTo: string;
};

export function Protected({ children, redirectTo }: ProtectedProps) {
  const { isAuthenticated, loading, refresh } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    async function verifySession() {
      if (loading) {
        return;
      }

      if (isAuthenticated) {
        setChecking(false);
        return;
      }

      setChecking(true);

      try {
        await refresh();
      } catch {
      } finally {
        if (!active) {
          return;
        }
        setChecking(false);
      }
    }

    verifySession();

    return () => {
      active = false;
    };
  }, [isAuthenticated, loading, refresh]);

  useEffect(() => {
    if (checking) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(`/signin?redirect=${encodeURIComponent(redirectTo)}`);
    }
  }, [checking, isAuthenticated, redirectTo, router]);

  if (loading || checking) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
