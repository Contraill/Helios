import type { ExtendedBody } from "@/features/solar-system/lib/extended-system";
import { extendedBodyNavigatorCategory } from "@/features/solar-system/lib/celestial-registry";
import type { Moon } from "@/features/solar-system/lib/moon-catalogue";
import type { CelestialBodyId } from "@/features/solar-system/types/celestial-body";
import type { NavigatorView } from "@/features/solar-system/types/celestial-navigation";
import type { PlanetId } from "@/lib/data/schemas/planet";

import { activeSceneCategory } from "./scene-visibility-policy";

export type OrbitEmphasis = "hidden" | "context" | "selected";

export interface OrbitVisibilityContext {
  readonly navigatorView: NavigatorView;
  readonly orbitsVisible: boolean;
  readonly selectedBodyId: CelestialBodyId | null;
  readonly hoveredBodyId: CelestialBodyId | null;
}

function emphasisFor(
  bodyId: CelestialBodyId,
  context: OrbitVisibilityContext,
): Exclude<OrbitEmphasis, "hidden"> {
  return context.selectedBodyId === bodyId || context.hoveredBodyId === bodyId
    ? "selected"
    : "context";
}

export function planetOrbitVisibility(
  planetId: PlanetId,
  context: OrbitVisibilityContext,
): OrbitEmphasis {
  return context.orbitsVisible ? emphasisFor(planetId, context) : "hidden";
}

export function moonOrbitVisibility(
  moon: Pick<Moon, "id" | "parentPlanetId">,
  context: OrbitVisibilityContext,
): OrbitEmphasis {
  if (!context.orbitsVisible) return "hidden";
  if (
    context.navigatorView.kind !== "moons" ||
    context.navigatorView.parentPlanetId !== moon.parentPlanetId
  ) {
    return "hidden";
  }
  return emphasisFor(moon.id, context);
}

export function extendedBodyOrbitVisibility(
  body: Pick<ExtendedBody, "id" | "kind">,
  context: OrbitVisibilityContext,
): OrbitEmphasis {
  if (!context.orbitsVisible) return "hidden";
  if (context.selectedBodyId === body.id) return "selected";
  return activeSceneCategory(context.navigatorView) ===
    extendedBodyNavigatorCategory(body)
    ? emphasisFor(body.id, context)
    : "hidden";
}

/** Regional/background context never receives individual orbit geometry. */
export function backgroundLayerHasIndividualOrbit(): false {
  return false;
}
