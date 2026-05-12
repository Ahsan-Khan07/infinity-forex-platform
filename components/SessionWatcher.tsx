"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

/**
 * Detect session invalidation via version mismatch
 */
export default function SessionWatcher() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) return;

    const interval = setInterval(async () => {
      const res = await fetch("/api/user/me");

      if (!res.ok) {
        signOut();
        return;
      }

      const data = await res.json();

      if (
        data.user.sessionVersion !==
        (session.user as any).sessionVersion
      ) {
        signOut();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [session]);

  return null;
}
