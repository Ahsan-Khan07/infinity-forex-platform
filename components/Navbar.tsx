"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="w-full px-6 py-4 flex justify-between items-center 
      bg-black/40 backdrop-blur-xl border-b border-white/10
      shadow-[0_0_40px_rgba(0,150,255,0.08)]">
      
      {/* LEFT - BRAND */}
      <Link
        href="/"
        className="text-xl font-bold tracking-wide text-white relative"
      >
        <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-500 bg-clip-text text-transparent">
          InfinityForex
        </span>

        {/* glow effect */}
        <span className="absolute -inset-1 blur-xl opacity-30 bg-blue-500 rounded-full -z-10" />
      </Link>

      {/* RIGHT MENU */}
      <div className="flex items-center gap-5">

        <Link
          href="/dashboard"
          className="text-sm text-gray-300 hover:text-white transition"
        >
          Dashboard
        </Link>

        {/* LOADING */}
        {status === "loading" ? (
          <div className="text-gray-400 text-sm">Loading...</div>
        ) : !session ? (
          <>
            <Link
              href="/auth/login"
              className="px-4 py-2 rounded-xl text-sm
              bg-white/5 border border-white/10
              hover:bg-white/10 transition"
            >
              Login
            </Link>

            <Link
              href="/auth/register"
              className="px-4 py-2 rounded-xl text-sm
              bg-gradient-to-r from-blue-600 to-cyan-500
              hover:scale-105 transition shadow-lg shadow-blue-500/20"
            >
              Register
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-3">

            {/* USER BADGE */}
            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">
              {session.user?.name}
            </div>

            {/* LOGOUT BUTTON */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="px-4 py-2 rounded-xl text-sm
              bg-red-500/90 hover:bg-red-600
              shadow-lg shadow-red-500/20 transition"
            >
              Logout
            </motion.button>
          </div>
        )}
      </div>
    </nav>
  );
}
