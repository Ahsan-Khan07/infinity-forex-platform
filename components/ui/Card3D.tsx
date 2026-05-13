"use client";

import { useRef } from "react";

/**
 * ==========================================================
 * MOTION SAAS V2 — 3D CARD SYSTEM
 * ----------------------------------------------------------
 * - Smooth inertia tilt
 * - Better mobile fallback
 * - Reduced jitter
 * ==========================================================
 */

export default function Card3D({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();

    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const rotateX = (y - 0.5) * -10;
    const rotateY = (x - 0.5) * 10;

    el.style.transform = `
      perspective(1200px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.03)
    `;
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;

    el.style.transform = `
      perspective(1200px)
      rotateX(0deg)
      rotateY(0deg)
      scale(1)
    `;
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className="
        transition-transform duration-300 ease-out
        will-change-transform
        rounded-2xl
        border border-white/10
        bg-white/5
        backdrop-blur-xl
        p-6
        shadow-[0_20px_80px_rgba(0,0,0,0.6)]
        hover:shadow-[0_30px_120px_rgba(0,255,200,0.08)]
      "
    >
      {children}
    </div>
  );
}
