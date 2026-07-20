import { DWARF_SATELLITE_BY_ID, isDwarfSatelliteId } from "@/features/solar-system/lib/dwarf-satellite-catalogue";
import type { ExtendedBody } from "@/features/solar-system/lib/extended-system";
import { extendedBodyNavigatorCategory } from "@/features/solar-system/lib/celestial-registry";
import type { Moon } from "@/features/solar-system/lib/moon-catalogue";
import type {
  CelestialBodyId,
  SystemRegionId,
} from "@/features/solar-system/types/celestial-body";
import type {
  CelestialNavigatorCategory,
  NavigatorView,
} from "@/features/solar-system/types/celestial-navigation";
import type { PlanetId } from "@/lib/data/schemas/planet";

export type SceneVisibility = "hidden" | "anchor" | "primary";

export interface SceneVisibilityContext {
  readonly navigatorView: NavigatorView;
  readonly selectedBodyId: CelestialBodyId | null;
}

export function activeSceneCategory(
  view: NavigatorView,
): CelestialNavigatorCategory | "overview" {
  if (view.kind === "categories") return "overview";
  if (view.kind === "moon-parents" || view.kind === "moons") {
    return "planetary-moons";
  }
  if (view.kind === "dwarf-parents" || view.kind === "dwarf-system") {
    return "dwarf-kuiper";
  }
  return view.category;
}

export function planetSceneVisibility(
  planetId: PlanetId,
  context: SceneVisibilityContext,
): SceneVisibility {
  if (context.selectedBodyId === planetId) return "primary";
  const category = activeSceneCategory(context.navigatorView);
  if (category === "overview" || category === "sun-planets") return "primary";
  if (
    context.navigatorView.kind === "moons" &&
    context.navigatorView.parentPlanetId === planetId
  ) {
    return "primary";
  }
  return "anchor";
}

export function sunSceneVisibility(
  context: SceneVisibilityContext,
): SceneVisibility {
  if (context.selectedBodyId === "sun") return "primary";
  const category = activeSceneCategory(context.navigatorView);
  return category === "overview" || category === "sun-planets"
    ? "primary"
    : "anchor";
}

export function moonSceneVisibility(
  moon: Pick<Moon, "id" | "parentPlanetId">,
  context: SceneVisibilityContext,
): SceneVisibility {
  if (
    context.navigatorView.kind === "moons" &&
    context.navigatorView.parentPlanetId === moon.parentPlanetId
  ) {
    return "primary";
  }
  return context.selectedBodyId === moon.id ? "primary" : "hidden";
}

export function extendedBodySceneVisibility(
  body: Pick<ExtendedBody, "id" | "kind">,
  context: SceneVisibilityContext,
): SceneVisibility {
  if (
    context.selectedBodyId &&
    isDwarfSatelliteId(context.selectedBodyId) &&
    DWARF_SATELLITE_BY_ID[context.selectedBodyId].parentId === body.id
  ) {
    return "primary";
  }
  const category = activeSceneCategory(context.navigatorView);
  if (category === extendedBodyNavigatorCategory(body)) return "primary";
  return context.selectedBodyId === body.id ? "primary" : "hidden";
}

export function regionSceneVisibility(
  regionId: SystemRegionId,
  context: SceneVisibilityContext,
): SceneVisibility {
  const category = activeSceneCategory(context.navigatorView);
  if (
    category === "overview" &&
    (regionId === "asteroid-belt" || regionId === "kuiper-belt")
  ) {
    return "anchor";
  }
  if (category === "regions-context") return "primary";
  if (category === "main-belt" && regionId === "asteroid-belt") return "anchor";
  if (category === "dwarf-kuiper" && regionId === "kuiper-belt") {
    return "anchor";
  }
  return context.selectedBodyId === regionId ? "primary" : "hidden";
}
