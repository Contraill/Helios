import type {
  DwarfSystemParentId,
  MoonParentPlanetId,
} from "@/features/solar-system/types/celestial-body";

export const CELESTIAL_NAVIGATOR_CATEGORIES = [
  "sun-planets",
  "planetary-moons",
  "main-belt",
  "dwarf-kuiper",
  "comets",
  "regions-context",
] as const;

export type CelestialNavigatorCategory =
  (typeof CELESTIAL_NAVIGATOR_CATEGORIES)[number];

export type NavigatorView =
  | { readonly kind: "categories" }
  | {
      readonly category: Exclude<
        CelestialNavigatorCategory,
        "planetary-moons" | "dwarf-kuiper"
      >;
      readonly kind: "category";
    }
  | { readonly kind: "moon-parents" }
  | { readonly kind: "dwarf-parents" }
  | {
      readonly kind: "moons";
      readonly parentPlanetId: MoonParentPlanetId;
    }
  | {
      readonly kind: "dwarf-system";
      readonly parentBodyId: DwarfSystemParentId;
    };

export interface NavigatorFrame {
  readonly returnFocusKey: string | null;
  readonly view: NavigatorView;
}

export interface NavigatorState {
  readonly focusRequestKey: string | null;
  readonly frames: readonly NavigatorFrame[];
}

export type NavigatorAction =
  | {
      readonly returnFocusKey: string;
      readonly type: "open-category";
      readonly category: CelestialNavigatorCategory;
    }
  | {
      readonly parentPlanetId: MoonParentPlanetId;
      readonly returnFocusKey: string;
      readonly type: "open-moon-parent";
    }
  | {
      readonly parentBodyId: DwarfSystemParentId;
      readonly returnFocusKey: string;
      readonly type: "open-dwarf-system";
    }
  | { readonly type: "back" }
  | { readonly type: "reset" }
  | { readonly type: "consume-focus-request" };

export type { DwarfSystemParentId, MoonParentPlanetId };
