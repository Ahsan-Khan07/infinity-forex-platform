"use client";

/**
 * MARKETING NAVBAR (SESSION AWARE)
 * ---------------------------------
 * Dynamically switches UI based on authentication state.
 */

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        
        {/* BRAND */}
        <div className="text-xl font-bold">InfinityFX</div>

        {/* NAV */}
        <nav className="flex items-center gap-6 text-sm">
          
          <Link href="#features">Features</Link>
          <Link href="#pricing">Pricing</Link>

          {/* AUTH LOGIC */}
          {!session ? (
            <>
              <Link href="/auth/login">Login</Link>
              <Link
                href="/auth/register"
                className="rounded bg-black px-4 py-2 text-white"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/dashboard/profile">Profile</Link>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded border px-3 py-1"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
