import { isPlanetId } from "@/content/planets";
import {
  EXTENDED_BODY_BY_ID,
  isExtendedBodyId,
} from "@/features/solar-system/lib/extended-system";
import { isDwarfSatelliteId } from "@/features/solar-system/lib/dwarf-satellite-catalogue";
import { isMoonId } from "@/features/solar-system/lib/moon-catalogue";
import type { CelestialKind } from "@/features/solar-system/lib/celestial-registry";
import {
  isSystemRegionIdValue,
  type CelestialBodyId,
} from "@/features/solar-system/types/celestial-body";

export const SCENE_VISIBILITY_CATEGORIES = [
  "planets",
  "moons",
  "asteroids",
  "dwarf-kuiper",
  "comets",
  "regions",
] as const;

export type SceneVisibilityCategory =
  (typeof SCENE_VISIBILITY_CATEGORIES)[number];
export type ObjectVisibilityOverride = "visible" | "hidden";
export type SceneVisibility = "hidden" | "primary";

export type SceneVisibilityCategoryState = Readonly<
  Record<SceneVisibilityCategory, boolean>
>;

export interface EffectiveVisibilityState {
  readonly categories: SceneVisibilityCategoryState;
  readonly objectOverrides: Readonly<
    Partial<Record<CelestialBodyId, ObjectVisibilityOverride>>
  >;
}

export const DEFAULT_SCENE_VISIBILITY_CATEGORIES: SceneVisibilityCategoryState =
  Object.freeze({
    planets: true,
    moons: true,
    asteroids: true,
    "dwarf-kuiper": true,
    comets: true,
    regions: true,
  });

/**
 * The single category mapping used by the visibility store, controls and renderers.
 * Navigator categories are deliberately not accepted as input.
 */
export function sceneVisibilityCategoryForBody(
  bodyId: CelestialBodyId,
): SceneVisibilityCategory | null {
  if (bodyId === "sun") return null;
  if (isPlanetId(bodyId)) return "planets";
  if (isMoonId(bodyId) || isDwarfSatelliteId(bodyId)) return "moons";
  if (isSystemRegionIdValue(bodyId)) return "regions";
  if (isExtendedBodyId(bodyId)) {
    const body = EXTENDED_BODY_BY_ID[bodyId];
    if (body.kind === "comet") return "comets";
    if (body.kind === "asteroid" || body.id === "ceres") return "asteroids";
    return "dwarf-kuiper";
  }
  return null;
}

export function sceneVisibilityCategoryForKind(
  kind: CelestialKind,
): SceneVisibilityCategory | null {
  if (kind === "star") return null;
  if (kind === "planet") return "planets";
  if (kind === "moon" || kind === "dwarf-satellite") return "moons";
  if (kind === "asteroid") return "asteroids";
  if (kind === "comet") return "comets";
  if (kind === "region") return "regions";
  return "dwarf-kuiper";
}

export function effectiveBodyVisibility(
  bodyId: CelestialBodyId,
  state: EffectiveVisibilityState,
): boolean {
  const override = state.objectOverrides[bodyId];
  if (override) return override === "visible";
  const category = sceneVisibilityCategoryForBody(bodyId);
  return category === null ? true : state.categories[category];
}

export function effectiveBodyVisibilityReason(
  bodyId: CelestialBodyId,
  state: EffectiveVisibilityState,
):
  | "visible"
  | "hidden-by-category"
  | "hidden-individually"
  | "explicitly-shown" {
  const override = state.objectOverrides[bodyId];
  if (override === "visible") return "explicitly-shown";
  if (override === "hidden") return "hidden-individually";
  return effectiveBodyVisibility(bodyId, state)
    ? "visible"
    : "hidden-by-category";
}

export function bodySceneVisibility(
  bodyId: CelestialBodyId,
  state: EffectiveVisibilityState,
): SceneVisibility {
  return effectiveBodyVisibility(bodyId, state) ? "primary" : "hidden";
}
