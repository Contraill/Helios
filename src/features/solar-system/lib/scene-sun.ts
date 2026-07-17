import type { ScaleMode } from "@/features/solar-system/types/experience-settings";
import { explorationScale, scientificScale } from "@/lib/calculations/scale";
import type { SunData } from "@/lib/data/schemas/sun";

export interface SceneSun {
  readonly id: "sun";
  readonly name: string;
  readonly radiusSourceId: string;
  readonly scales: Readonly<Record<ScaleMode, number>>;
}

export function createSceneSun(source: SunData): SceneSun {
  const meanRadiusKm = source.physical.meanRadiusKm.value;

  return Object.freeze({
    id: source.id,
    name: source.name.en,
    radiusSourceId: source.physical.meanRadiusKm.sourceId,
    scales: Object.freeze({
      exploration: Math.max(2.5, explorationScale.radiusFromKm(meanRadiusKm)),
      scientific: scientificScale.radiusFromKm(meanRadiusKm),
    }),
  });
}
