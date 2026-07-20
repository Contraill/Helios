import type { CelestialBodyId } from "@/features/solar-system/types/celestial-body";

export type OrbitEmphasis = "hidden" | "context" | "selected";

export interface OrbitVisibilityContext {
  readonly bodyVisible: boolean;
  readonly orbitsVisible: boolean;
  readonly selectedBodyId: CelestialBodyId | null;
  readonly hoveredBodyId: CelestialBodyId | null;
}

export function orbitVisibilityForBody(
  bodyId: CelestialBodyId,
  context: OrbitVisibilityContext,
): OrbitEmphasis {
  if (!context.orbitsVisible || !context.bodyVisible) return "hidden";
  return context.selectedBodyId === bodyId || context.hoveredBodyId === bodyId
    ? "selected"
    : "context";
}

export const planetOrbitVisibility = orbitVisibilityForBody;
export const moonOrbitVisibility = orbitVisibilityForBody;
export const extendedBodyOrbitVisibility = orbitVisibilityForBody;

/** Regional/background context never receives individual orbit geometry. */
export function backgroundLayerHasIndividualOrbit(): false {
  return false;
}
