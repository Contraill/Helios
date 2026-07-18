import "server-only";

import { z } from "zod";

import { serializeJplSsdRequest } from "@/lib/data/jpl/ssd-request-queue.server";

import { HORIZONS_TARGETS, type HorizonsTarget } from "./horizons-registry";
import {
  EPHEMERIS_METADATA,
  MAX_PROPAGATION_DAYS,
  ephemerisBundleSchema,
  ephemerisVectorSchema,
  ephemerisWindowSchema,
  type EphemerisBundle,
  type EphemerisSample,
  type EphemerisVector,
  type EphemerisWindow,
} from "./models";

const HORIZONS_ENDPOINT = "https://ssd.jpl.nasa.gov/api/horizons.api";
const REQUEST_TIMEOUT_MS = 30_000;
const SAMPLE_INTERVAL_MS = 6 * 60 * 60 * 1_000;
const MILLISECONDS_PER_DAY = 86_400_000;
const WINDOW_RADIUS_DAYS = 1_800;
const WINDOW_STEP_DAYS = 30;
export const SUPPORTED_HORIZONS_API_VERSIONS = ["1.2", "1.3"] as const;

const horizonsResponseSchema = z.object({
  signature: z.object({
    version: z.string().min(1),
    source: z.string().includes("NASA/JPL Horizons"),
  }),
  result: z.string().min(1),
});

const inFlightWindows = new Map<
  string,
  Promise<{
    apiVersion: string;
    vector: EphemerisVector;
    window: EphemerisWindow;
  }>
>();

export class HorizonsError extends Error {
  constructor(
    message: string,
    readonly kind:
      | "network"
      | "timeout"
      | "upstream"
      | "malformed-json"
      | "schema"
      | "version",
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

function commonParameters(target: HorizonsTarget) {
  return {
    format: "json",
    COMMAND: `'${target.targetId}'`,
    OBJ_DATA: "NO",
    MAKE_EPHEM: "YES",
    EPHEM_TYPE: "VECTORS",
    CENTER: "'500@10'",
    TIME_TYPE: "TDB",
    REF_PLANE: "ECLIPTIC",
    REF_SYSTEM: "ICRF",
    OUT_UNITS: "AU-D",
    VEC_TABLE: "2",
    CSV_FORMAT: "YES",
    VEC_LABELS: "NO",
  } as const;
}

function urlWithParameters(parameters: Readonly<Record<string, string>>) {
  const url = new URL(HORIZONS_ENDPOINT);
  for (const [key, value] of Object.entries(parameters)) {
    url.searchParams.set(key, value);
  }
  return url;
}

export function buildHorizonsUrl(
  target: HorizonsTarget,
  observedAt: Date,
): URL {
  return urlWithParameters({
    ...commonParameters(target),
    TLIST: `'${horizonsTime(observedAt)}'`,
  });
}

export function buildHorizonsWindowUrl(
  target: HorizonsTarget,
  centerAt: Date,
): URL {
  const startAt = new Date(
    centerAt.getTime() - WINDOW_RADIUS_DAYS * MILLISECONDS_PER_DAY,
  );
  const endAt = new Date(
    centerAt.getTime() + WINDOW_RADIUS_DAYS * MILLISECONDS_PER_DAY,
  );
  return urlWithParameters({
    ...commonParameters(target),
    START_TIME: `'${horizonsTime(startAt)}'`,
    STOP_TIME: `'${horizonsTime(endAt)}'`,
    STEP_SIZE: `'${WINDOW_STEP_DAYS} d'`,
  });
}

function assertSupportedVersion(version: string) {
  if (
    !SUPPORTED_HORIZONS_API_VERSIONS.includes(
      version as (typeof SUPPORTED_HORIZONS_API_VERSIONS)[number],
    )
  ) {
    throw new HorizonsError(
      `Unsupported Horizons API version. Expected ${SUPPORTED_HORIZONS_API_VERSIONS.join(" or ")}; received ${version}.`,
      "version",
    );
  }
}

function assertVectorContract(result: string, target: HorizonsTarget) {
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
}

const monthNumbers: Readonly<Record<string, string>> = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

function vectorTimestamp(value: string): string {
  const match =
    /A\.D\.\s+(\d{4})-([A-Z][a-z]{2})-(\d{2})\s+(\d{2}:\d{2}:\d{2}(?:\.\d+)?)/.exec(
      value,
    );
  const month = match ? monthNumbers[match[2]] : undefined;
  if (!match || !month) {
    throw new HorizonsError(
      `Horizons vector contains an unsupported epoch: ${value}`,
      "schema",
    );
  }
  const milliseconds = Date.parse(
    `${match[1]}-${month}-${match[3]}T${match[4]}Z`,
  );
  if (!Number.isFinite(milliseconds)) {
    throw new HorizonsError(
      "Horizons vector epoch could not be parsed.",
      "schema",
    );
  }
  return new Date(milliseconds).toISOString();
}

function parseVectorLine(line: string): EphemerisSample {
  const columns = line.split(",").map((value) => value.trim());
  const values = columns.slice(2, 8).map(Number);
  if (values.length !== 6 || values.some((value) => !Number.isFinite(value))) {
    throw new HorizonsError(
      "Horizons vector contains invalid Cartesian values.",
      "schema",
    );
  }
  return {
    observedAt: vectorTimestamp(columns[1] ?? ""),
    positionAu: { x: values[0], y: values[1], z: values[2] },
    velocityAuPerDay: { x: values[3], y: values[4], z: values[5] },
  };
}

export function parseHorizonsWindow(
  raw: unknown,
  target: HorizonsTarget,
): { apiVersion: string; vector: EphemerisVector; window: EphemerisWindow } {
  const response = horizonsResponseSchema.parse(raw);
  assertSupportedVersion(response.signature.version);
  assertVectorContract(response.result, target);

  const match = /\$\$SOE\s*\n([\s\S]*?)\n\$\$EOE/.exec(response.result);
  if (!match) {
    throw new HorizonsError(
      "Horizons response is missing its vector window.",
      "schema",
    );
  }
  const samples = match[1]
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseVectorLine);
  if (samples.length === 0) {
    throw new HorizonsError(
      "Horizons returned an empty vector window.",
      "schema",
    );
  }
  const centerSample = samples[Math.floor(samples.length / 2)];
  const vector = ephemerisVectorSchema.parse({
    ...target,
    positionAu: centerSample.positionAu,
    velocityAuPerDay: centerSample.velocityAuPerDay,
  });
  const window = ephemerisWindowSchema.parse({
    ...target,
    startAt: samples[0].observedAt,
    endAt: samples.at(-1)?.observedAt,
    samples,
  });
  return { apiVersion: response.signature.version, vector, window };
}

export function parseHorizonsVector(
  raw: unknown,
  target: HorizonsTarget,
): { apiVersion: string; vector: EphemerisVector } {
  const response = horizonsResponseSchema.parse(raw);
  assertSupportedVersion(response.signature.version);
  assertVectorContract(response.result, target);
  const match = /\$\$SOE\s*\n([^\n]+)\n\$\$EOE/.exec(response.result);
  if (!match) {
    throw new HorizonsError(
      "Horizons response is missing its vector record.",
      "schema",
    );
  }
  const sample = parseVectorLine(match[1]);
  return {
    apiVersion: response.signature.version,
    vector: ephemerisVectorSchema.parse({
      ...target,
      positionAu: sample.positionAu,
      velocityAuPerDay: sample.velocityAuPerDay,
    }),
  };
}

async function fetchTargetWindowUncached(
  target: HorizonsTarget,
  observedAt: Date,
): Promise<{
  apiVersion: string;
  vector: EphemerisVector;
  window: EphemerisWindow;
}> {
  let response: Response;
  try {
    response = await fetch(buildHorizonsWindowUrl(target, observedAt), {
      headers: { Accept: "application/json" },
      next: {
        revalidate: 86_400,
        tags: [`horizons-window-${target.planetId}`],
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
    return parseHorizonsWindow(raw, target);
  } catch (error) {
    if (error instanceof HorizonsError) throw error;
    throw new HorizonsError(
      "Horizons response failed schema validation.",
      "schema",
      { cause: error },
    );
  }
}

function fetchTargetWindow(target: HorizonsTarget, observedAt: Date) {
  const key = buildHorizonsWindowUrl(target, observedAt).toString();
  const existing = inFlightWindows.get(key);
  if (existing) return existing;
  const request = serializeJplSsdRequest(() =>
    fetchTargetWindowUncached(target, observedAt),
  );
  inFlightWindows.set(key, request);
  void request
    .finally(() => inFlightWindows.delete(key))
    .catch(() => undefined);
  return request;
}

export function resolvedTargetForWindow(
  target: HorizonsTarget,
  observedAt: Date,
): HorizonsTarget {
  if (!target.bodyCenterCoverage || !target.longRangeTarget) return target;
  const windowStart =
    observedAt.getTime() - WINDOW_RADIUS_DAYS * MILLISECONDS_PER_DAY;
  const windowEnd =
    observedAt.getTime() + WINDOW_RADIUS_DAYS * MILLISECONDS_PER_DAY;
  if (
    windowStart >= target.bodyCenterCoverage.minimumUtcMs &&
    windowEnd <= target.bodyCenterCoverage.maximumUtcMs
  ) {
    return target;
  }
  return {
    planetId: target.planetId,
    targetId: target.longRangeTarget.targetId,
    targetName: target.longRangeTarget.targetName,
  };
}

export async function loadHorizonsEphemeris(
  requestedAt: Date,
): Promise<EphemerisBundle> {
  const observedAt = sampleEpochFor(requestedAt);
  const retrievedAt = new Date();
  const records: Awaited<ReturnType<typeof fetchTargetWindow>>[] = [];

  // SSD/CNEOS fair-use requires exactly one active JPL API request at a time.
  for (const target of HORIZONS_TARGETS) {
    records.push(
      await fetchTargetWindow(
        resolvedTargetForWindow(target, observedAt),
        observedAt,
      ),
    );
  }

  const versions = new Set(records.map(({ apiVersion }) => apiVersion));
  if (versions.size !== 1) {
    throw new HorizonsError(
      `Horizons returned mixed API versions: ${[...versions].join(", ")}.`,
      "version",
    );
  }
  const apiVersion = records[0]?.apiVersion ?? EPHEMERIS_METADATA.apiVersion;
  const barycenterPlanetIds = records
    .filter(({ vector }) => vector.targetId.length === 1)
    .map(({ vector }) => vector.planetId);

  return ephemerisBundleSchema.parse({
    schemaVersion: 1,
    status: "current",
    requestedAt: requestedAt.toISOString(),
    observedAt: observedAt.toISOString(),
    retrievedAt: retrievedAt.toISOString(),
    validPropagationDays: MAX_PROPAGATION_DAYS,
    vectors: records.map(({ vector }) => vector),
    windows: records.map(({ window }) => window),
    metadata: {
      ...EPHEMERIS_METADATA,
      apiVersion,
      targetFrame:
        barycenterPlanetIds.length > 0 ? "mixed-barycenters" : "planet-centers",
      ...(barycenterPlanetIds.length > 0 ? { barycenterPlanetIds } : {}),
    },
  });
}
