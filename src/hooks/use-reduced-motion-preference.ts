"use client";

import { useEffect, useState } from "react";

import type { MotionPreference } from "@/features/solar-system/types/experience-settings";

const QUERY = "(prefers-reduced-motion: reduce)";

export function useReducedMotionPreference(
  preference: MotionPreference = "system",
): boolean {
  const [systemPrefersReducedMotion, setSystemPrefersReducedMotion] =
    useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(QUERY);
    const update = () => setSystemPrefersReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  if (preference === "reduced") return true;
  if (preference === "standard") return false;
  return systemPrefersReducedMotion;
}
