import { create } from "zustand";

export type GalacticContextPhase = "local" | "transition" | "galactic";

interface GalacticContextState {
  phase: GalacticContextPhase;
  setPhase: (phase: GalacticContextPhase) => void;
}

export const useGalacticContextStore = create<GalacticContextState>((set) => ({
  phase: "local",
  setPhase: (phase) =>
    set((state) => (state.phase === phase ? state : { phase })),
}));
