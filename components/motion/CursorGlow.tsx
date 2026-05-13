"use client";

import { useEffect, useRef } from "react";

/**
 * ==========================================================
 * CURSOR GLOW — ULTRA MOTION SYSTEM V4
 * - follows mouse
 * - creates ambient fintech glow
 * ==========================================================
 */

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!glowRef.current) return;

      glowRef.current.style.transform = `
        translate3d(${e.clientX - 150}px, ${e.clientY - 150}px, 0)
      `;
    };

    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed top-0 left-0 z-50 w-[300px] h-[300px]
      rounded-full blur-[120px] opacity-40 bg-cyan-400 transition-transform duration-100"
    />
  );
}
