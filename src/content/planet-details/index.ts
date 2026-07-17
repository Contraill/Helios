import type { PlanetId } from "@/lib/data/schemas/planet";

import { earthDetailContent } from "./earth";
import { jupiterDetailContent } from "./jupiter";
import { marsDetailContent } from "./mars";
import { mercuryDetailContent } from "./mercury";
import { neptuneDetailContent } from "./neptune";
import { saturnDetailContent } from "./saturn";
import type { PlanetDetailContent } from "./types";
import { uranusDetailContent } from "./uranus";
import { venusDetailContent } from "./venus";

export type { PlanetDetailContent, PlanetDetailMission } from "./types";

const detailContentById = new Map<PlanetId, PlanetDetailContent>([
  ["mercury", mercuryDetailContent],
  ["venus", venusDetailContent],
  ["earth", earthDetailContent],
  ["mars", marsDetailContent],
  ["jupiter", jupiterDetailContent],
  ["saturn", saturnDetailContent],
  ["uranus", uranusDetailContent],
  ["neptune", neptuneDetailContent],
]);

export function getPlanetDetailContent(id: PlanetId): PlanetDetailContent {
  const content = detailContentById.get(id);
  if (!content) throw new Error(`Missing detail content for ${id}.`);
  return content;
}
