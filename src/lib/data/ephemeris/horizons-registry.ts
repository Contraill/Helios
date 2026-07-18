import type { PlanetId } from "@/lib/data/schemas/planet";

export interface HorizonsTarget {
  readonly planetId: PlanetId;
  readonly targetId: string;
  readonly targetName: string;
}

export const HORIZONS_TARGETS = Object.freeze([
  { planetId: "mercury", targetId: "199", targetName: "Mercury" },
  { planetId: "venus", targetId: "299", targetName: "Venus" },
  { planetId: "earth", targetId: "399", targetName: "Earth" },
  { planetId: "mars", targetId: "499", targetName: "Mars" },
  { planetId: "jupiter", targetId: "599", targetName: "Jupiter" },
  { planetId: "saturn", targetId: "699", targetName: "Saturn" },
  { planetId: "uranus", targetId: "799", targetName: "Uranus" },
  { planetId: "neptune", targetId: "899", targetName: "Neptune" },
] as const satisfies readonly HorizonsTarget[]);

export const HORIZONS_TARGET_BY_PLANET = Object.freeze(
  Object.fromEntries(
    HORIZONS_TARGETS.map((target) => [target.planetId, target]),
  ) as Readonly<Record<PlanetId, HorizonsTarget>>,
);
