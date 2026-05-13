"use client";

import { ReactNode } from "react";

/**
 * ==========================================================
 * INFINITY FINANCE — AUTH CARD (CENTER FIX + V5 UI)
 * ==========================================================
 */

export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-[#05060a]">

      {/* BACKGROUND GLOW */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 blur-[140px] rounded-full top-[-200px] left-[-200px]" />
      <div className="absolute w-[500px] h-[500px] bg-blue-500/10 blur-[160px] rounded-full bottom-[-200px] right-[-200px]" />

      {/* CARD WRAPPER */}
      <div className="relative w-full max-w-md">

        {/* Glow Border */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 blur-2xl rounded-3xl opacity-60" />

        {/* MAIN CARD */}
        <div className="relative bg-black/40 border border-white/10 backdrop-blur-2xl rounded-2xl p-8 shadow-[0_0_80px_rgba(0,255,200,0.08)]">

          {/* HEADER */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold text-white">
              {title}
            </h1>

            {subtitle && (
              <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* CONTENT */}
          <div className="space-y-4">
            {children}
          </div>

        </div>
      </div>
    </div>
  );
}
