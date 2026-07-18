import type { PlanetId } from "@/lib/data/schemas/planet";

export interface HorizonsTarget {
  readonly planetId: PlanetId;
  readonly targetId: string;
  readonly targetName: string;
  readonly bodyCenterCoverage?: {
    readonly minimumUtcMs: number;
    readonly maximumUtcMs: number;
  };
  readonly longRangeTarget?: {
    readonly targetId: string;
    readonly targetName: string;
  };
}

export const HORIZONS_TARGETS = Object.freeze([
  { planetId: "mercury", targetId: "199", targetName: "Mercury" },
  { planetId: "venus", targetId: "299", targetName: "Venus" },
  { planetId: "earth", targetId: "399", targetName: "Earth" },
  {
    planetId: "mars",
    targetId: "499",
    targetName: "Mars",
    bodyCenterCoverage: {
      minimumUtcMs: Date.parse("1600-01-02T00:00:00Z"),
      maximumUtcMs: Date.parse("2600-01-01T00:00:00Z"),
    },
    longRangeTarget: { targetId: "4", targetName: "Mars Barycenter" },
  },
  {
    planetId: "jupiter",
    targetId: "599",
    targetName: "Jupiter",
    bodyCenterCoverage: {
      minimumUtcMs: Date.parse("1600-01-11T00:00:00Z"),
      maximumUtcMs: Date.parse("2200-01-09T00:00:00Z"),
    },
    longRangeTarget: { targetId: "5", targetName: "Jupiter Barycenter" },
  },
  {
    planetId: "saturn",
    targetId: "699",
    targetName: "Saturn",
    bodyCenterCoverage: {
      minimumUtcMs: Date.parse("1749-12-31T00:00:00Z"),
      maximumUtcMs: Date.parse("2250-01-05T00:00:00Z"),
    },
    longRangeTarget: { targetId: "6", targetName: "Saturn Barycenter" },
  },
  {
    planetId: "uranus",
    targetId: "799",
    targetName: "Uranus",
    bodyCenterCoverage: {
      minimumUtcMs: Date.parse("1600-01-05T00:00:00Z"),
      maximumUtcMs: Date.parse("2399-12-16T00:00:00Z"),
    },
    longRangeTarget: { targetId: "7", targetName: "Uranus Barycenter" },
  },
  {
    planetId: "neptune",
    targetId: "899",
    targetName: "Neptune",
    bodyCenterCoverage: {
      minimumUtcMs: Date.parse("1800-01-02T00:00:00Z"),
      maximumUtcMs: Date.parse("2199-12-30T00:00:00Z"),
    },
    longRangeTarget: { targetId: "8", targetName: "Neptune Barycenter" },
  },
] as const satisfies readonly HorizonsTarget[]);

export const HORIZONS_TARGET_BY_PLANET = Object.freeze(
  Object.fromEntries(
    HORIZONS_TARGETS.map((target) => [target.planetId, target]),
  ) as Readonly<Record<PlanetId, HorizonsTarget>>,
);
