"use client";

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/** System-owned motion policy. Explore no longer exposes a parallel override. */
export function useReducedMotionPreference(): boolean {
  const [systemPrefersReducedMotion, setSystemPrefersReducedMotion] =
    useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mediaQuery = window.matchMedia(QUERY);
    const update = () => setSystemPrefersReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return systemPrefersReducedMotion;
}
