import { getPlanetById } from "@/content/planets";
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
import { EXTENDED_BODY_COPY_TR } from "@/features/body-details/lib/extended-body-copy.tr";
import { getExploreSceneCopy } from "@/lib/i18n/explore-scene-copy";
import type { Locale } from "@/lib/i18n/locale";

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

function regionMetadataMap(
  locale: Locale,
): Readonly<Record<SystemRegionId, RegionRegistryMetadata>> {
  const copy = getExploreSceneCopy(locale);
  return Object.freeze(
    SYSTEM_REGION_IDS.reduce<Record<SystemRegionId, RegionRegistryMetadata>>(
      (registry, id) => {
        const region = copy.registry.regions[id];
        registry[id] = {
          displayName: region.displayName,
          navigatorCategory: "regions-context",
          sceneRepresentation: "regional-context",
          sourceIds:
            id === "asteroid-belt"
              ? ["nasa-asteroid-facts", "jpl-sbdb-orbital-elements"]
              : id === "kuiper-belt"
                ? ["nasa-kuiper-belt-facts", "jpl-sbdb-orbital-elements"]
                : id === "oort-cloud"
                  ? ["nasa-oort-cloud-facts"]
                  : ["nasa-heliosphere-components"],
          summary: {
            description: region.description,
            representationLabel: region.representation,
          },
        };
        return registry;
      },
      {} as Record<SystemRegionId, RegionRegistryMetadata>,
    ),
  );
}

export function extendedBodyNavigatorCategory(
  body: Pick<ExtendedBody, "id" | "kind">,
): CelestialNavigatorCategory {
  if (body.kind === "comet") return "comets";
  if (body.id === "ceres" || body.kind === "asteroid") return "main-belt";
  return "dwarf-kuiper";
}

function moonEntry(moon: Moon, locale: Locale): CelestialRegistryEntry {
  const copy = getExploreSceneCopy(locale);
  return {
    id: moon.id,
    displayName:
      moon.id === "moon-earth-moon" && locale === "tr" ? "Ay" : moon.name,
    kind: "moon",
    navigatorCategory: "planetary-moons",
    orbitPolicyClass: "moon-orbit",
    parentId: moon.parentPlanetId,
    sceneRepresentation: "procedural-reference",
    sourceIds: moon.sourceIds,
    summary: {
      description: copy.registry.moonDescription(
        copy.registry.parentPlanetNames[moon.parentPlanetId],
      ),
      representationLabel:
        moon.representation.representationType === "horizons-window"
          ? copy.registry.moonHorizons
          : copy.registry.moonRepresentative,
    },
  };
}

function dwarfSatelliteEntry(
  moon: DwarfSatellite,
  locale: Locale,
): CelestialRegistryEntry {
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
      description:
        locale === "tr"
          ? `${moon.parentId} sisteminde öne çıkan uydu.`
          : `Featured satellite in the ${moon.parentId} system.`,
      representationLabel:
        locale === "tr"
          ? "Temsili cüce sistem bağlamı"
          : "Representative dwarf-system context",
    },
  };
}

function extendedEntry(
  body: ExtendedBody,
  locale: Locale,
): CelestialRegistryEntry {
  const copy = getExploreSceneCopy(locale);
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
      description:
        locale === "tr"
          ? EXTENDED_BODY_COPY_TR[body.id].description
          : body.description,
      representationLabel: copy.registry.extendedRepresentation,
    },
  };
}

export function createCelestialRegistry(
  planetSummaries: readonly ExplorePlanetSummary[],
  sceneSun: SceneSun,
  locale: Locale = "en",
): ReadonlyMap<CelestialBodyId, CelestialRegistryEntry> {
  const copy = getExploreSceneCopy(locale);
  const regions = regionMetadataMap(locale);
  const entries: CelestialRegistryEntry[] = [
    {
      id: "sun",
      displayName: locale === "tr" ? "Güneş" : sceneSun.name,
      kind: "star",
      navigatorCategory: "sun-planets",
      orbitPolicyClass: "no-individual-orbit",
      parentId: null,
      sceneRepresentation: "physical-surface",
      sourceIds: [sceneSun.radiusSourceId],
      summary: {
        description: copy.registry.sunDescription,
        representationLabel: copy.registry.sunRepresentation,
      },
    },
    ...planetSummaries.map((planet): CelestialRegistryEntry => {
      const sourcePlanet = getPlanetById(planet.id);
      return {
        id: planet.id,
        displayName: sourcePlanet?.name[locale] ?? planet.name,
        kind: "planet",
        navigatorCategory: "sun-planets",
        orbitPolicyClass: "planet-orbit",
        parentId: null,
        sceneRepresentation: "physical-surface",
        sourceIds: [`planet-catalogue:${planet.id}`],
        summary: {
          description: sourcePlanet?.tagline[locale] ?? planet.tagline,
          representationLabel: copy.registry.planetRepresentation,
        },
      };
    }),
    ...FEATURED_MOONS.map((moon) => moonEntry(moon, locale)),
    ...DWARF_SATELLITES.map((moon) => dwarfSatelliteEntry(moon, locale)),
    ...EXTENDED_BODIES.map((body) => extendedEntry(body, locale)),
    ...SYSTEM_REGION_IDS.map((id): CelestialRegistryEntry => ({
      id,
      kind: "region",
      orbitPolicyClass: "no-individual-orbit",
      parentId: null,
      ...regions[id],
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

export function regionMetadata(
  regionId: SystemRegionId,
  locale: Locale = "en",
): RegionRegistryMetadata {
  return regionMetadataMap(locale)[regionId];
}
