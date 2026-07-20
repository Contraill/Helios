import { z } from "zod";

import {
  celestialRepresentationSchema,
  type CelestialRepresentation,
} from "@/features/solar-system/lib/celestial-representation";
import { utcMsToApproxJulianDateTdb } from "@/features/solar-system/lib/elliptic-orbit-evaluator";
import type { PlanetId } from "@/lib/data/schemas/planet";
import { planetIdSchema } from "@/lib/data/schemas/planet";

export const EPHEMERIS_SOURCE_URL =
  "https://ssd-api.jpl.nasa.gov/doc/horizons.html";
export const MAX_PROPAGATION_DAYS = 370;

export const cartesianVectorSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  z: z.number().finite(),
});

export const ephemerisVectorSchema = z.object({
  planetId: planetIdSchema,
  targetId: z.string().regex(/^\d{1,3}$/),
  targetName: z.string().min(1),
  positionAu: cartesianVectorSchema,
  velocityAuPerDay: cartesianVectorSchema,
});

export const ephemerisSampleSchema = z.object({
  observedAt: z.iso.datetime(),
  positionAu: cartesianVectorSchema,
  velocityAuPerDay: cartesianVectorSchema,
});

export const ephemerisWindowSchema = z.object({
  planetId: planetIdSchema,
  targetId: z.string().regex(/^\d{1,3}$/),
  targetName: z.string().min(1),
  startAt: z.iso.datetime(),
  endAt: z.iso.datetime(),
  samples: z.array(ephemerisSampleSchema).min(2),
});

export const ephemerisMetadataSchema = z.object({
  provider: z.literal("NASA/JPL Horizons"),
  sourceUrl: z.url(),
  center: z.literal("Sun body center (500@10)"),
  referencePlane: z.literal("Ecliptic of J2000.0"),
  referenceSystem: z.literal("ICRF"),
  units: z.literal("AU and AU/day"),
  timeScale: z.literal("TDB"),
  correction: z.literal("Geometric; no aberration correction"),
  apiVersion: z.string().min(1),
  targetFrame: z.enum(["planet-centers", "mixed-barycenters"]).optional(),
  barycenterPlanetIds: z.array(planetIdSchema).optional(),
});

export const ephemerisBundleSchema = z.object({
  schemaVersion: z.literal(1),
  status: z.enum(["current", "fallback"]),
  requestedAt: z.iso.datetime(),
  observedAt: z.iso.datetime(),
  retrievedAt: z.iso.datetime(),
  validPropagationDays: z.literal(MAX_PROPAGATION_DAYS),
  vectors: z.array(ephemerisVectorSchema).length(8),
  windows: z.array(ephemerisWindowSchema).length(8).optional(),
  metadata: ephemerisMetadataSchema,
});

export type CartesianVector = z.infer<typeof cartesianVectorSchema>;
export type EphemerisVector = z.infer<typeof ephemerisVectorSchema>;
export type EphemerisSample = z.infer<typeof ephemerisSampleSchema>;
export type EphemerisWindow = z.infer<typeof ephemerisWindowSchema>;
export type EphemerisBundle = z.infer<typeof ephemerisBundleSchema>;

export const EPHEMERIS_METADATA: EphemerisBundle["metadata"] = Object.freeze({
  provider: "NASA/JPL Horizons",
  sourceUrl: EPHEMERIS_SOURCE_URL,
  center: "Sun body center (500@10)",
  referencePlane: "Ecliptic of J2000.0",
  referenceSystem: "ICRF",
  units: "AU and AU/day",
  timeScale: "TDB",
  correction: "Geometric; no aberration correction",
  apiVersion: "1.2",
});

export function planetEphemerisRepresentation(
  bundle: EphemerisBundle,
  planetId: PlanetId,
  timestampMs: number,
): CelestialRepresentation {
  const window = bundle.windows?.find(
    (candidate) => candidate.planetId === planetId,
  );
  const insideWindow = window
    ? timestampMs >= Date.parse(window.startAt) &&
      timestampMs <= Date.parse(window.endAt)
    : false;
  const observedAtMs = Date.parse(bundle.observedAt);
  const nearObservedState =
    Math.abs(timestampMs - observedAtMs) <= 60 * 60 * 1_000;
  const representationType =
    bundle.status === "fallback"
      ? "verified-fallback"
      : insideWindow
        ? "horizons-window"
        : nearObservedState
          ? "latest-available"
          : "propagated-preview";
  const recommendedRange = window
    ? {
        startIso: window.startAt,
        endIso: window.endAt,
        note: "Hermite interpolation uses source-provided Horizons vectors inside this window.",
      }
    : {
        startIso: new Date(
          observedAtMs - MAX_PROPAGATION_DAYS * 86_400_000,
        ).toISOString(),
        endIso: new Date(
          observedAtMs + MAX_PROPAGATION_DAYS * 86_400_000,
        ).toISOString(),
        note: "Outside a Horizons sample window Helios shows a bounded osculating preview, not an accurate ephemeris.",
      };
  return celestialRepresentationSchema.parse({
    provider: bundle.metadata.provider,
    sourceId: "jpl-horizons-vectors",
    sourceUrl: bundle.metadata.sourceUrl,
    targetCode: bundle.vectors.find((vector) => vector.planetId === planetId)
      ?.targetId,
    referenceFrame: "ecliptic-j2000",
    referencePlane: `${bundle.metadata.referencePlane}; ${bundle.metadata.referenceSystem}`,
    epoch: {
      julianDate: utcMsToApproxJulianDateTdb(observedAtMs),
      timeScale: "TDB",
      calendarLabel: bundle.observedAt,
    },
    recommendedRange,
    representationType,
    precisionNote:
      representationType === "horizons-window"
        ? "Source-provided Horizons vectors are interpolated inside the returned sample window."
        : representationType === "latest-available"
          ? "The source vector nearest the requested state is shown without claiming live telemetry."
          : representationType === "verified-fallback"
            ? "A bundled verified Horizons snapshot is retained because the provider response was unavailable."
            : "A two-body osculating preview is propagated from the nearest source state and is not navigation-grade.",
    observedAt: bundle.observedAt,
    retrievedAt: bundle.retrievedAt,
    fallbackReason:
      bundle.status === "fallback"
        ? "The live Horizons request was unavailable; the verified bundle snapshot remains active."
        : undefined,
  });
}
