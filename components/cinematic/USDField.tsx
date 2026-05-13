"use client";

import { useEffect, useRef } from "react";

/**
 * ==========================================================
 * USD PARTICLE FIELD (CINEMATIC BACKGROUND)
 * - simulates floating capital / liquidity flow
 * - optimized canvas animation
 * ==========================================================
 */

export default function USDField() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const particles = Array.from({ length: 80 }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random() * 1,
      speed: 0.3 + Math.random() * 1.2,
      size: 10 + Math.random() * 20
    }));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = "#05060a";
      ctx.fillRect(0, 0, w, h);

      for (const p of particles) {
        ctx.fillStyle = "rgba(0,255,200,0.12)";
        ctx.font = `${p.size}px Arial`;
        ctx.fillText("$", p.x, p.y);

        p.y += p.speed;

        if (p.y > h) {
          p.y = -20;
          p.x = Math.random() * w;
        }
      }

      requestAnimationFrame(draw);
    };

    draw();

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resize);
  }, []);

  return <canvas ref={ref} className="absolute inset-0 z-0" />;
}
