import type { PlanetId } from "@/lib/data/schemas/planet";
import type {
  ExtendedBodyId,
  SystemRegionId,
} from "@/features/solar-system/lib/extended-system";

/** A body that can own hover, selection and guided-camera focus. */
export type CelestialBodyId =
  "sun" | PlanetId | ExtendedBodyId | SystemRegionId;
