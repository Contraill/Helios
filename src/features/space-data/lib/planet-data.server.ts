import "server-only";

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
  const [epic, eonet, donki, nearEarth] = await Promise.all([
    loadEpic(),
    loadEonet(),
    loadDonki(),
    loadNearEarth(),
  ]);
  return { epic, eonet, gibs: loadGibsLayers(), donki, nearEarth };
}

export async function loadMarsArchiveData() {
  const [weather, media] = await Promise.all([
    loadInsight(),
    loadMissionMedia("Mars Perseverance InSight MRO"),
  ]);
  return { weather, media, trek: loadTrekRegions("Mars") };
}
