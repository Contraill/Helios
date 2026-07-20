"use client";

import { create } from "zustand";

import {
  currentNavigatorView,
  initialNavigatorState,
  navigatorReducer,
} from "@/features/solar-system/lib/celestial-navigation-state";
import type {
  CelestialNavigatorCategory,
  DwarfSystemParentId,
  MoonParentPlanetId,
  NavigatorState,
  NavigatorView,
} from "@/features/solar-system/types/celestial-navigation";

export type ExploreDockPanel = "selection" | "navigator" | "view" | "time";

interface ExploreSceneUiState {
  activeDockPanel: ExploreDockPanel;
  desktopDockCollapsed: boolean;
  mobileDockOpen: boolean;
  navigator: NavigatorState;
  setActiveDockPanel: (panel: ExploreDockPanel) => void;
  toggleDesktopDock: () => void;
  openMobileDock: (panel?: ExploreDockPanel) => void;
  closeMobileDock: () => void;
  openCategory: (
    category: CelestialNavigatorCategory,
    returnFocusKey: string,
  ) => void;
  openMoonParent: (
    parentPlanetId: MoonParentPlanetId,
    returnFocusKey: string,
  ) => void;
  openDwarfSystem: (
    parentBodyId: DwarfSystemParentId,
    returnFocusKey: string,
  ) => void;
  goBack: () => void;
  resetNavigator: () => void;
  consumeNavigatorFocusRequest: () => void;
}

export const useExploreSceneUiStore = create<ExploreSceneUiState>((set) => ({
  activeDockPanel: "navigator",
  desktopDockCollapsed: false,
  mobileDockOpen: false,
  navigator: initialNavigatorState,
  setActiveDockPanel: (activeDockPanel) => set({ activeDockPanel }),
  toggleDesktopDock: () =>
    set((state) => ({ desktopDockCollapsed: !state.desktopDockCollapsed })),
  openMobileDock: (activeDockPanel) =>
    set((state) => ({
      activeDockPanel: activeDockPanel ?? state.activeDockPanel,
      mobileDockOpen: true,
    })),
  closeMobileDock: () => set({ mobileDockOpen: false }),
  openCategory: (category, returnFocusKey) =>
    set((state) => ({
      navigator: navigatorReducer(state.navigator, {
        type: "open-category",
        category,
        returnFocusKey,
      }),
    })),
  openMoonParent: (parentPlanetId, returnFocusKey) =>
    set((state) => ({
      navigator: navigatorReducer(state.navigator, {
        type: "open-moon-parent",
        parentPlanetId,
        returnFocusKey,
      }),
    })),
  openDwarfSystem: (parentBodyId, returnFocusKey) =>
    set((state) => ({
      navigator: navigatorReducer(state.navigator, {
        type: "open-dwarf-system",
        parentBodyId,
        returnFocusKey,
      }),
    })),
  goBack: () =>
    set((state) => ({
      navigator: navigatorReducer(state.navigator, { type: "back" }),
    })),
  resetNavigator: () => set({ navigator: initialNavigatorState }),
  consumeNavigatorFocusRequest: () =>
    set((state) => ({
      navigator: navigatorReducer(state.navigator, {
        type: "consume-focus-request",
      }),
    })),
}));

export function activeNavigatorView(): NavigatorView {
  return currentNavigatorView(useExploreSceneUiStore.getState().navigator);
}

export function resetExploreSceneUiStore(): void {
  useExploreSceneUiStore.setState({
    activeDockPanel: "navigator",
    desktopDockCollapsed: false,
    mobileDockOpen: false,
    navigator: initialNavigatorState,
  });
}
