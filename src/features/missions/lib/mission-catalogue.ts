import { getPlanetDetailContent } from "@/content/planet-details";
import { planets } from "@/content/planets";
import { planetaryReferenceSourceById } from "@/content/sources/planetary-reference";
import type { DataSourceReference } from "@/lib/data/schemas/source";
import type { PlanetId } from "@/lib/data/schemas/planet";

export interface MissionCatalogueEntry {
  readonly body: string;
  readonly id: string;
  readonly planetId: PlanetId;
  readonly planetName: string;
  readonly sourceIds: readonly string[];
  readonly sources: readonly DataSourceReference[];
  readonly status: string;
  readonly title: string;
}

function missionId(planetId: PlanetId, title: string): string {
  return `${planetId}-${title}`
    .toLocaleLowerCase("en-US")
    .normalize("NFKD")
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

export const MISSION_CATALOGUE: readonly MissionCatalogueEntry[] =
  Object.freeze(
    planets.flatMap((planet) => {
      const content = getPlanetDetailContent(planet.id);
      return content.missions.map((mission) => {
        const sources = mission.sourceIds.map((sourceId) => {
          const source = planetaryReferenceSourceById.get(sourceId);
          if (!source) {
            throw new Error(
              `Mission ${mission.name} references unknown source ${sourceId}.`,
            );
          }
          return source;
        });

        return Object.freeze({
          body: mission.body,
          id: missionId(planet.id, mission.name),
          planetId: planet.id,
          planetName: planet.name.en,
          sourceIds: mission.sourceIds,
          sources: Object.freeze(sources),
          status: mission.status,
          title: mission.name,
        });
      });
    }),
  );

export const MISSION_PLANET_COUNT = new Set(
  MISSION_CATALOGUE.map((mission) => mission.planetId),
).size;
