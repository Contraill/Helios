import type { PlanetId } from "@/lib/data/schemas/planet";

/** A body that can own hover, selection and guided-camera focus. */
export type CelestialBodyId = "sun" | PlanetId;
