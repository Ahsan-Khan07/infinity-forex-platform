"use client";

/**
 * ==========================================================
 * MOTION SAAS V2 — BACKGROUND SYSTEM
 * ----------------------------------------------------------
 * - Animated gradient mesh
 * - Low CPU cost (CSS only)
 * - Premium fintech depth feel
 * ==========================================================
 */

export default function MeshBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#05060a]">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#050816] to-black" />

      {/* Floating glow blobs */}
      <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-cyan-500/20 blur-[140px] animate-pulse" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-blue-500/20 blur-[140px] animate-pulse" />

      {/* Mesh overlay */}
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(0,255,200,0.15),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(0,100,255,0.15),transparent_40%)]" />
    </div>
  );
}
