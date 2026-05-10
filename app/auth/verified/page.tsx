"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function VerifiedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-black relative overflow-hidden">

      {/* ================= BACKGROUND GLOW SYSTEM ================= */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-220px] left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-blue-600/20 blur-[160px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-200px] right-[-120px] w-[550px] h-[550px] bg-cyan-500/20 blur-[160px] rounded-full animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:40px_40px] opacity-20" />
      </div>

      {/* ================= VERIFIED CARD ================= */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="
          relative w-full max-w-md
          rounded-2xl
          border border-white/10
          bg-white/5
          backdrop-blur-2xl
          shadow-[0_0_60px_rgba(0,0,0,0.6)]
          p-8
          text-center
        "
      >
        {/* ICON */}
        <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-full bg-green-500/15 border border-green-500/20 text-green-400 text-2xl">
          ✓
        </div>

        {/* TITLE */}
        <h1 className="mt-6 text-3xl font-bold text-white tracking-tight">
          Email Verified Successfully
        </h1>

        {/* DESCRIPTION */}
        <p className="mt-3 text-white/60 text-sm leading-relaxed">
          Your InfinityForex account is now activated.  
          You can login and access your dashboard, signals, and premium trading tools.
        </p>

        {/* DIVIDER */}
        <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* BUTTON */}
        <Link
          href="/auth/login"
          className="
            inline-block w-full py-3 rounded-xl font-semibold
            bg-gradient-to-r from-blue-600 to-cyan-500
            hover:scale-105 transition
            text-white
          "
        >
          Continue to Login
        </Link>

        {/* SMALL TEXT */}
        <p className="mt-4 text-xs text-white/40">
          If you didn’t create this account, please ignore this verification.
        </p>
      </motion.div>
    </div>
  );
}
