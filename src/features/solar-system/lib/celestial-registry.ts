import {
  EXTENDED_BODIES,
  type ExtendedBody,
} from "@/features/solar-system/lib/extended-system";
import {
  DWARF_SATELLITES,
  type DwarfSatellite,
} from "@/features/solar-system/lib/dwarf-satellite-catalogue";
import type { ExplorePlanetSummary } from "@/features/solar-system/lib/explore-planets";
import {
  FEATURED_MOONS,
  type Moon,
} from "@/features/solar-system/lib/moon-catalogue";
import type { SceneSun } from "@/features/solar-system/lib/scene-sun";
import {
  SYSTEM_REGION_IDS,
  type CelestialBodyId,
  type SystemRegionId,
} from "@/features/solar-system/types/celestial-body";
import type { CelestialNavigatorCategory } from "@/features/solar-system/types/celestial-navigation";
import { exploreSceneCopy } from "@/lib/i18n/explore-scene-copy";

export type CelestialKind =
  | "star"
  | "planet"
  | "moon"
  | "dwarf-satellite"
  | "dwarf-planet"
  | "asteroid"
  | "kuiper-object"
  | "comet"
  | "region";

export type SceneRepresentation =
  | "physical-surface"
  | "procedural-reference"
  | "representative-body"
  | "regional-context";

export type OrbitPolicyClass =
  "planet-orbit" | "moon-orbit" | "small-body-orbit" | "no-individual-orbit";

export interface CelestialRegistryEntry {
  readonly id: CelestialBodyId;
  readonly displayName: string;
  readonly kind: CelestialKind;
  readonly navigatorCategory: CelestialNavigatorCategory;
  readonly orbitPolicyClass: OrbitPolicyClass;
  readonly parentId: CelestialBodyId | null;
  readonly sceneRepresentation: SceneRepresentation;
  readonly sourceIds: readonly string[];
  readonly summary: {
    readonly description: string;
    readonly representationLabel: string;
  };
}

type RegionRegistryMetadata = Pick<
  CelestialRegistryEntry,
  | "displayName"
  | "navigatorCategory"
  | "sceneRepresentation"
  | "sourceIds"
  | "summary"
>;

const REGION_METADATA: Readonly<
  Record<SystemRegionId, RegionRegistryMetadata>
> = Object.freeze(
  SYSTEM_REGION_IDS.reduce<Record<SystemRegionId, RegionRegistryMetadata>>(
    (registry, id) => {
      const copy = exploreSceneCopy.registry.regions[id];
      registry[id] = {
        displayName: copy.displayName,
        navigatorCategory: "regions-context",
        sceneRepresentation: "regional-context",
        sourceIds:
          id === "asteroid-belt" || id === "kuiper-belt"
            ? ["jpl-small-body-database"]
            : id === "oort-cloud"
              ? ["nasa-oort-cloud-overview"]
              : ["nasa-heliosphere-overview"],
        summary: {
          description: copy.description,
          representationLabel: copy.representation,
        },
      };
      return registry;
    },
    {} as Record<SystemRegionId, RegionRegistryMetadata>,
  ),
);

export function extendedBodyNavigatorCategory(
  body: Pick<ExtendedBody, "id" | "kind">,
): CelestialNavigatorCategory {
  if (body.kind === "comet") return "comets";
  if (body.id === "ceres" || body.kind === "asteroid") return "main-belt";
  return "dwarf-kuiper";
}

function moonEntry(moon: Moon): CelestialRegistryEntry {
  return {
    id: moon.id,
    displayName: moon.name,
    kind: "moon",
    navigatorCategory: "planetary-moons",
    orbitPolicyClass: "moon-orbit",
    parentId: moon.parentPlanetId,
    sceneRepresentation: "procedural-reference",
    sourceIds: moon.sourceIds,
    summary: {
      description: exploreSceneCopy.registry.moonDescription(
        exploreSceneCopy.registry.parentPlanetNames[moon.parentPlanetId],
      ),
      representationLabel:
        moon.representation.representationType === "horizons-window"
          ? exploreSceneCopy.registry.moonHorizons
          : exploreSceneCopy.registry.moonRepresentative,
    },
  };
}

function dwarfSatelliteEntry(moon: DwarfSatellite): CelestialRegistryEntry {
  return {
    id: moon.id,
    displayName: moon.name,
    kind: "dwarf-satellite",
    navigatorCategory: "dwarf-kuiper",
    orbitPolicyClass: "moon-orbit",
    parentId: moon.parentId,
    sceneRepresentation: "procedural-reference",
    sourceIds: moon.sourceIds,
    summary: {
      description: `Featured satellite in the ${moon.parentId} system.`,
      representationLabel: "Representative dwarf-system context",
    },
  };
}

function extendedEntry(body: ExtendedBody): CelestialRegistryEntry {
  return {
    id: body.id,
    displayName: body.name,
    kind: body.kind,
    navigatorCategory: extendedBodyNavigatorCategory(body),
    orbitPolicyClass: "small-body-orbit",
    parentId: null,
    sceneRepresentation: "representative-body",
    sourceIds: [body.sourceUrl],
    summary: {
      description: body.description,
      representationLabel: exploreSceneCopy.registry.extendedRepresentation,
    },
  };
}

export function createCelestialRegistry(
  planetSummaries: readonly ExplorePlanetSummary[],
  sceneSun: SceneSun,
): ReadonlyMap<CelestialBodyId, CelestialRegistryEntry> {
  const entries: CelestialRegistryEntry[] = [
    {
      id: "sun",
      displayName: sceneSun.name,
      kind: "star",
      navigatorCategory: "sun-planets",
      orbitPolicyClass: "no-individual-orbit",
      parentId: null,
      sceneRepresentation: "physical-surface",
      sourceIds: [sceneSun.radiusSourceId],
      summary: {
        description: exploreSceneCopy.registry.sunDescription,
        representationLabel: exploreSceneCopy.registry.sunRepresentation,
      },
    },
    ...planetSummaries.map((planet): CelestialRegistryEntry => ({
      id: planet.id,
      displayName: planet.name,
      kind: "planet",
      navigatorCategory: "sun-planets",
      orbitPolicyClass: "planet-orbit",
      parentId: null,
      sceneRepresentation: "physical-surface",
      sourceIds: [`planet-catalogue:${planet.id}`],
      summary: {
        description: planet.tagline,
        representationLabel: exploreSceneCopy.registry.planetRepresentation,
      },
    })),
    ...FEATURED_MOONS.map(moonEntry),
    ...DWARF_SATELLITES.map(dwarfSatelliteEntry),
    ...EXTENDED_BODIES.map(extendedEntry),
    ...SYSTEM_REGION_IDS.map((id): CelestialRegistryEntry => ({
      id,
      kind: "region",
      orbitPolicyClass: "no-individual-orbit",
      parentId: null,
      ...REGION_METADATA[id],
    })),
  ];
  return new Map(entries.map((entry) => [entry.id, Object.freeze(entry)]));
}

export function entriesForCategory(
  registry: ReadonlyMap<CelestialBodyId, CelestialRegistryEntry>,
  category: CelestialNavigatorCategory,
): readonly CelestialRegistryEntry[] {
  return [...registry.values()].filter(
    (entry) => entry.navigatorCategory === category,
  );
}

export function regionMetadata(regionId: SystemRegionId) {
  return REGION_METADATA[regionId];
}
