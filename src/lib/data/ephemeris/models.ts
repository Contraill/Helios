import { z } from "zod";

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
  targetId: z.string().regex(/^\d{3}$/),
  targetName: z.string().min(1),
  positionAu: cartesianVectorSchema,
  velocityAuPerDay: cartesianVectorSchema,
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
});

export const ephemerisBundleSchema = z.object({
  schemaVersion: z.literal(1),
  status: z.enum(["current", "fallback"]),
  requestedAt: z.iso.datetime(),
  observedAt: z.iso.datetime(),
  retrievedAt: z.iso.datetime(),
  validPropagationDays: z.literal(MAX_PROPAGATION_DAYS),
  vectors: z.array(ephemerisVectorSchema).length(8),
  metadata: ephemerisMetadataSchema,
});

export type CartesianVector = z.infer<typeof cartesianVectorSchema>;
export type EphemerisVector = z.infer<typeof ephemerisVectorSchema>;
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
