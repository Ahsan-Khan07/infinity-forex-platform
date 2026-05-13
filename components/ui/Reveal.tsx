"use client";

import { useEffect, useRef } from "react";

/**
 * MOTION SAAS V2 — SCROLL REVEAL
 * Fade + slide up animation on view
 */

export default function Reveal({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("opacity-100", "translate-y-0");
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="
        opacity-0 translate-y-6
        transition-all duration-700 ease-out
      "
    >
      {children}
    </div>
  );
}
