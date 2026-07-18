import "server-only";

import type { PlanetId } from "@/lib/data/schemas/planet";

import {
  loadDonki,
  loadEonet,
  loadEpic,
  loadGibsLayers,
  loadInsight,
  loadMissionMedia,
  loadNearEarth,
  loadTrekRegions,
} from "@/lib/data/external/providers/space-data.server";

export async function loadEarthObservatoryData() {
  const [epic, eonet, gibs, donki, nearEarth, media] = await Promise.all([
    loadEpic(),
    loadEonet(),
    loadGibsLayers(),
    loadDonki(),
    loadNearEarth(),
    loadMissionMedia("earth"),
  ]);
  return { epic, eonet, gibs, donki, nearEarth, media };
}

export async function loadMarsArchiveData() {
  const [weather, media] = await Promise.all([
    loadInsight(),
    loadMissionMedia("mars"),
  ]);
  return { weather, media, trek: loadTrekRegions("Mars") };
}

export function loadPlanetMissionMedia(planetId: PlanetId) {
  return loadMissionMedia(planetId);
}
