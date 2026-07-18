import "server-only";

import { z } from "zod";

import { HORIZONS_TARGETS, type HorizonsTarget } from "./horizons-registry";
import {
  EPHEMERIS_METADATA,
  MAX_PROPAGATION_DAYS,
  ephemerisBundleSchema,
  ephemerisVectorSchema,
  type EphemerisBundle,
  type EphemerisVector,
} from "./models";

const HORIZONS_ENDPOINT = "https://ssd.jpl.nasa.gov/api/horizons.api";
const REQUEST_TIMEOUT_MS = 20_000;
const SAMPLE_INTERVAL_MS = 6 * 60 * 60 * 1_000;
const MAX_CONCURRENT_REQUESTS = 2;

const horizonsResponseSchema = z.object({
  signature: z.object({
    version: z.string().min(1),
    source: z.string().includes("NASA/JPL Horizons"),
  }),
  result: z.string().min(1),
});

export class HorizonsError extends Error {
  constructor(
    message: string,
    readonly kind:
      "network" | "timeout" | "upstream" | "malformed-json" | "schema",
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "HorizonsError";
  }
}

export function sampleEpochFor(requestedAt: Date): Date {
  const sampleMs =
    Math.round(requestedAt.getTime() / SAMPLE_INTERVAL_MS) * SAMPLE_INTERVAL_MS;
  return new Date(sampleMs);
}

function horizonsTime(date: Date): string {
  return date
    .toISOString()
    .replace("T", " ")
    .replace(/\.\d{3}Z$/, "");
}

export function buildHorizonsUrl(
  target: HorizonsTarget,
  observedAt: Date,
): URL {
  const url = new URL(HORIZONS_ENDPOINT);
  const parameters = {
    format: "json",
    COMMAND: `'${target.targetId}'`,
    OBJ_DATA: "NO",
    MAKE_EPHEM: "YES",
    EPHEM_TYPE: "VECTORS",
    CENTER: "'500@10'",
    TLIST: `'${horizonsTime(observedAt)}'`,
    TIME_TYPE: "TDB",
    REF_PLANE: "ECLIPTIC",
    REF_SYSTEM: "ICRF",
    OUT_UNITS: "AU-D",
    VEC_TABLE: "2",
    CSV_FORMAT: "YES",
    VEC_LABELS: "NO",
  } as const;

  for (const [key, value] of Object.entries(parameters)) {
    url.searchParams.set(key, value);
  }
  return url;
}

export function parseHorizonsVector(
  raw: unknown,
  target: HorizonsTarget,
): { apiVersion: string; vector: EphemerisVector } {
  const response = horizonsResponseSchema.parse(raw);
  const result = response.result;

  if (
    !result.includes(
      `Target body name: ${target.targetName} (${target.targetId})`,
    ) ||
    !result.includes("Center body name: Sun (10)") ||
    !result.includes("Output units    : AU-D") ||
    !result.includes("Reference frame : Ecliptic of J2000.0")
  ) {
    throw new HorizonsError(
      "Horizons response does not match the requested vector contract.",
      "schema",
    );
  }

  const match = /\$\$SOE\s*\n([^\n]+)\n\$\$EOE/.exec(result);
  if (!match) {
    throw new HorizonsError(
      "Horizons response is missing its vector record.",
      "schema",
    );
  }

  const columns = match[1].split(",").map((value) => value.trim());
  const values = columns.slice(2, 8).map(Number);
  if (values.length !== 6 || values.some((value) => !Number.isFinite(value))) {
    throw new HorizonsError(
      "Horizons vector contains invalid Cartesian values.",
      "schema",
    );
  }

  return {
    apiVersion: response.signature.version,
    vector: ephemerisVectorSchema.parse({
      ...target,
      positionAu: { x: values[0], y: values[1], z: values[2] },
      velocityAuPerDay: { x: values[3], y: values[4], z: values[5] },
    }),
  };
}

async function fetchTargetVector(
  target: HorizonsTarget,
  observedAt: Date,
): Promise<{ apiVersion: string; vector: EphemerisVector }> {
  let response: Response;
  try {
    response = await fetch(buildHorizonsUrl(target, observedAt), {
      headers: { Accept: "application/json" },
      next: {
        revalidate: 86_400,
        tags: [`horizons-${target.planetId}`],
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    const timeout =
      error instanceof DOMException && error.name === "TimeoutError";
    throw new HorizonsError(
      timeout ? "Horizons request timed out." : "Horizons request failed.",
      timeout ? "timeout" : "network",
      { cause: error },
    );
  }

  if (!response.ok) {
    throw new HorizonsError(
      `Horizons returned HTTP ${response.status}.`,
      "upstream",
    );
  }

  let raw: unknown;
  try {
    raw = await response.json();
  } catch (error) {
    throw new HorizonsError(
      "Horizons returned malformed JSON.",
      "malformed-json",
      { cause: error },
    );
  }

  try {
    return parseHorizonsVector(raw, target);
  } catch (error) {
    if (error instanceof HorizonsError) throw error;
    throw new HorizonsError(
      "Horizons response failed schema validation.",
      "schema",
      { cause: error },
    );
  }
}

export async function loadHorizonsEphemeris(
  requestedAt: Date,
): Promise<EphemerisBundle> {
  const observedAt = sampleEpochFor(requestedAt);
  const retrievedAt = new Date();
  const records: Awaited<ReturnType<typeof fetchTargetVector>>[] = [];
  for (
    let index = 0;
    index < HORIZONS_TARGETS.length;
    index += MAX_CONCURRENT_REQUESTS
  ) {
    records.push(
      ...(await Promise.all(
        HORIZONS_TARGETS.slice(index, index + MAX_CONCURRENT_REQUESTS).map(
          (target) => fetchTargetVector(target, observedAt),
        ),
      )),
    );
  }
  const apiVersion = records[0]?.apiVersion ?? EPHEMERIS_METADATA.apiVersion;

  return ephemerisBundleSchema.parse({
    schemaVersion: 1,
    status: "current",
    requestedAt: requestedAt.toISOString(),
    observedAt: observedAt.toISOString(),
    retrievedAt: retrievedAt.toISOString(),
    validPropagationDays: MAX_PROPAGATION_DAYS,
    vectors: records.map(({ vector }) => vector),
    metadata: { ...EPHEMERIS_METADATA, apiVersion },
  });
}
