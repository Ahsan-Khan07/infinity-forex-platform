"use client";

/**
 * GLOBAL SESSION PROVIDER
 * -----------------------
 * Wraps entire app with authentication context.
 */

import { SessionProvider as NextAuthProvider } from "next-auth/react";

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NextAuthProvider>{children}</NextAuthProvider>;
}
