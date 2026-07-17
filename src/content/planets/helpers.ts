import {
  planetSchema,
  type PlanetData,
  type PlanetInput,
  type SourcedNumber,
} from "@/lib/data/schemas/planet";
import type { LocalizedText } from "@/lib/data/schemas/source";

interface SourceOptions {
  asOf?: string;
  derivation?: SourcedNumber["derivation"];
  note?: LocalizedText;
}

export function sourced(
  value: number,
  sourceId: string,
  options: SourceOptions = {},
): SourcedNumber {
  return {
    value,
    sourceId,
    derivation: options.derivation ?? "direct",
    ...(options.asOf ? { asOf: options.asOf } : {}),
    ...(options.note ? { note: options.note } : {}),
  };
}

export function definePlanet(input: PlanetInput): PlanetData {
  return Object.freeze(planetSchema.parse(input));
}
