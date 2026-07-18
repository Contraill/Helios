"use client";

import { create } from "zustand";

import {
  ephemerisBundleSchema,
  type EphemerisBundle,
} from "@/lib/data/ephemeris/models";
import { HORIZONS_SNAPSHOT } from "@/lib/data/ephemeris/horizons-snapshot";

export type EphemerisLoadStatus = "fallback" | "loading" | "current" | "error";

interface EphemerisState {
  bundle: EphemerisBundle;
  loadStatus: EphemerisLoadStatus;
  errorMessage: string | null;
  beginLoading: () => void;
  setBundle: (bundle: EphemerisBundle) => void;
  setError: (message: string) => void;
}

export const initialEphemerisState = {
  bundle: HORIZONS_SNAPSHOT,
  loadStatus: "fallback" as const,
  errorMessage: null,
};

export const useEphemerisStore = create<EphemerisState>((set) => ({
  ...initialEphemerisState,
  beginLoading: () => set({ loadStatus: "loading", errorMessage: null }),
  setBundle: (input) => {
    const bundle = ephemerisBundleSchema.parse(input);
    set({
      bundle,
      loadStatus: bundle.status,
      errorMessage: null,
    });
  },
  setError: (message) => set({ loadStatus: "error", errorMessage: message }),
}));

export function resetEphemerisStore(): void {
  useEphemerisStore.setState(initialEphemerisState);
}
