"use client";

import { ReactNode } from "react";

export default function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-black relative overflow-hidden">

      {/* ================= BACKGROUND GLOW SYSTEM ================= */}
      <div className="absolute inset-0 -z-10">
        {/* Main top glow */}
        <div className="absolute top-[-220px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/20 blur-[140px] rounded-full animate-pulse" />

        {/* Bottom right glow */}
        <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-cyan-500/20 blur-[140px] rounded-full animate-pulse" />

        {/* Subtle grid overlay for SaaS feel */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:40px_40px] opacity-20" />
      </div>

      {/* ================= AUTH CARD ================= */}
      <div
        className="
          relative w-full max-w-md
          rounded-2xl
          border border-white/10
          bg-white/5
          backdrop-blur-2xl
          shadow-[0_0_60px_rgba(0,0,0,0.6)]
          p-8
          transition-all
          duration-300
          hover:border-white/20
        "
      >
        {/* Title */}
        <h2 className="text-3xl font-bold text-white tracking-tight">
          {title}
        </h2>

        {/* Description */}
        {description && (
          <p className="text-white/60 text-sm mt-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Divider */}
        <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
