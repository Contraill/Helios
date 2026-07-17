import { planetaryReferenceSourceById } from "@/content/sources/planetary-reference";
import {
  planetIdSchema,
  type PlanetData,
  type PlanetId,
} from "@/lib/data/schemas/planet";

import { earth } from "./earth";
import { jupiter } from "./jupiter";
import { mars } from "./mars";
import { mercury } from "./mercury";
import { neptune } from "./neptune";
import { saturn } from "./saturn";
import { uranus } from "./uranus";
import { venus } from "./venus";

export const planets = Object.freeze([
  mercury,
  venus,
  earth,
  mars,
  jupiter,
  saturn,
  uranus,
  neptune,
] satisfies readonly PlanetData[]);

export const planetIds = Object.freeze(planets.map(({ id }) => id));

const planetById = new Map(
  planets.map((planet) => [planet.id, planet] as const),
);

assertPlanetCatalogIntegrity(planets);

export function isPlanetId(value: string): value is PlanetId {
  return planetIdSchema.safeParse(value).success;
}

export function getPlanetById(id: string): PlanetData | undefined {
  return isPlanetId(id) ? planetById.get(id) : undefined;
}

function assertPlanetCatalogIntegrity(catalog: readonly PlanetData[]): void {
  if (catalog.length !== 8) {
    throw new Error(`Expected eight planets, received ${catalog.length}.`);
  }

  const ids = new Set<PlanetId>();
  const orders = new Set<number>();

  for (const planet of catalog) {
    if (ids.has(planet.id)) {
      throw new Error(`Duplicate planet id: ${planet.id}`);
    }
    ids.add(planet.id);

    const order = planet.orderFromSun.value;
    if (orders.has(order)) {
      throw new Error(`Duplicate order from Sun: ${order}`);
    }
    orders.add(order);

    for (const sourceId of collectPlanetSourceIds(planet)) {
      if (!planetaryReferenceSourceById.has(sourceId)) {
        throw new Error(`Unknown source id "${sourceId}" in ${planet.id}.`);
      }
    }
  }
}

export function collectPlanetSourceIds(
  planet: PlanetData,
): ReadonlySet<string> {
  const ids = new Set(planet.sourceIds);

  const visit = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (value === null || typeof value !== "object") {
      return;
    }

    const record = value as Record<string, unknown>;
    const sourceId = record.sourceId;
    if (typeof sourceId === "string") {
      ids.add(sourceId);
    }
    Object.values(record).forEach(visit);
  };

  visit(planet);
  return ids;
}
