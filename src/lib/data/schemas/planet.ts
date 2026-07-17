import { z } from "zod";

import { localizedTextSchema, sourceDateSchema } from "./source";

export const planetIdSchema = z.enum([
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
]);

export const sourcedNumberSchema = z
  .object({
    value: z.number().finite(),
    sourceId: z.string().min(1),
    derivation: z
      .enum(["direct", "unit-conversion", "calculated"])
      .default("direct"),
    asOf: sourceDateSchema.optional(),
    note: localizedTextSchema.optional(),
  })
  .strict();

const positiveSourcedNumberSchema = sourcedNumberSchema.refine(
  ({ value }) => value > 0,
  "Value must be positive",
);

const nonNegativeSourcedNumberSchema = sourcedNumberSchema.refine(
  ({ value }) => value >= 0,
  "Value must be non-negative",
);

const datedCountSchema = sourcedNumberSchema
  .refine(
    ({ value }) => Number.isInteger(value) && value >= 0,
    "Count must be a non-negative integer",
  )
  .refine(
    ({ asOf }) => Boolean(asOf),
    "A changing count requires an asOf date",
  );

export const planetSchema = z
  .object({
    id: planetIdSchema,
    orderFromSun: sourcedNumberSchema.refine(
      ({ value }) => Number.isInteger(value) && value >= 1 && value <= 8,
      "Planet order must be an integer from 1 to 8",
    ),
    name: localizedTextSchema,
    tagline: localizedTextSchema,
    description: localizedTextSchema,
    accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    kind: z.enum(["terrestrial", "gas-giant", "ice-giant"]),

    physical: z
      .object({
        meanRadiusKm: positiveSourcedNumberSchema,
        equatorialDiameterKm: positiveSourcedNumberSchema,
        massKg: positiveSourcedNumberSchema,
        densityKgM3: positiveSourcedNumberSchema,
        gravityMS2: sourcedNumberSchema
          .extend({
            definition: z.enum([
              "surface-equatorial",
              "one-bar-reference-level",
            ]),
          })
          .refine(({ value }) => value > 0, "Value must be positive"),
        escapeVelocityKmS: positiveSourcedNumberSchema,
      })
      .strict(),

    orbit: z
      .object({
        semiMajorAxisKm: positiveSourcedNumberSchema,
        semiMajorAxisAu: positiveSourcedNumberSchema,
        orbitalPeriodEarthDays: positiveSourcedNumberSchema,
        eccentricity: nonNegativeSourcedNumberSchema.refine(
          ({ value }) => value < 1,
          "Planetary eccentricity must be below 1",
        ),
        inclinationDeg: nonNegativeSourcedNumberSchema,
      })
      .strict(),

    rotation: z
      .object({
        siderealRotationHours: positiveSourcedNumberSchema,
        solarDayHours: positiveSourcedNumberSchema.optional(),
        axialTiltDeg: nonNegativeSourcedNumberSchema.refine(
          ({ value }) => value <= 180,
          "Axial tilt cannot exceed 180 degrees",
        ),
        retrograde: z.boolean(),
      })
      .strict(),

    environment: z
      .object({
        temperature: z
          .object({
            averageC: sourcedNumberSchema,
            minimumC: sourcedNumberSchema.optional(),
            maximumC: sourcedNumberSchema.optional(),
            definition: z.enum([
              "surface",
              "cloud-top",
              "reference-level",
              "not-applicable",
            ]),
          })
          .strict(),
        atmosphereSummary: localizedTextSchema,
        majorAtmosphericComponents: z.array(z.string().min(1)),
      })
      .strict(),

    moons: z
      .object({
        count: datedCountSchema,
        featured: z.array(z.string().min(1)),
      })
      .strict(),

    rings: z
      .object({
        hasRings: z.boolean(),
        description: localizedTextSchema,
      })
      .strict(),

    sourceIds: z.array(z.string().min(1)).min(1),
  })
  .strict();

export type PlanetId = z.infer<typeof planetIdSchema>;
export type SourcedNumber = z.infer<typeof sourcedNumberSchema>;
export type PlanetData = z.infer<typeof planetSchema>;
export type PlanetInput = z.input<typeof planetSchema>;
