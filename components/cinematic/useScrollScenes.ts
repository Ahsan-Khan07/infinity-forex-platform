"use client";

import { useEffect, useState } from "react";

/**
 * ==========================================================
 * CINEMATIC SCROLL ENGINE (V5 CORE)
 * Break page into "scenes"
 * like Apple keynote transitions
 * ==========================================================
 */

export function useScrollScenes() {
  const [scene, setScene] = useState(0);

  useEffect(() => {
    const handle = () => {
      const y = window.scrollY;

      // Scene mapping (adjust per layout height)
      if (y < 600) setScene(0);
      else if (y < 1400) setScene(1);
      else if (y < 2200) setScene(2);
      else setScene(3);
    };

    window.addEventListener("scroll", handle);
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return scene;
}
