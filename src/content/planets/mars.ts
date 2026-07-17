import { definePlanet, sourced } from "./helpers";

const PHYSICAL = "jpl-planetary-physical-parameters";
const ORBIT = "jpl-approximate-planetary-elements";
const FACTS = "nasa-mars-facts";

export const mars = definePlanet({
  id: "mars",
  orderFromSun: sourced(4, "nasa-planet-order-distance"),
  name: { en: "Mars", tr: "Mars" },
  tagline: {
    en: "A cold desert with the memory of water.",
    tr: "Suyun izlerini taşıyan soğuk çöl.",
  },
  description: {
    en: "Mars is a cold, rocky desert whose surface preserves extensive evidence of a wetter and warmer past.",
    tr: "Mars, yüzeyinde daha sıcak ve daha ıslak bir geçmişe ait geniş izler koruyan soğuk, kayalık bir çöldür.",
  },
  accentColor: "#C65A3A",
  kind: "terrestrial",
  physical: {
    meanRadiusKm: sourced(3389.5, PHYSICAL),
    equatorialDiameterKm: sourced(6792.38, PHYSICAL, {
      derivation: "calculated",
    }),
    massKg: sourced(6.41691e23, PHYSICAL, { derivation: "unit-conversion" }),
    densityKgM3: sourced(3934, PHYSICAL, { derivation: "unit-conversion" }),
    gravityMS2: {
      ...sourced(3.71, PHYSICAL),
      definition: "surface-equatorial",
    },
    escapeVelocityKmS: sourced(5.03, PHYSICAL),
  },
  orbit: {
    semiMajorAxisKm: sourced(227943822.428, ORBIT, {
      derivation: "unit-conversion",
    }),
    semiMajorAxisAu: sourced(1.52371034, ORBIT),
    orbitalPeriodEarthDays: sourced(686.979586, PHYSICAL, {
      derivation: "unit-conversion",
    }),
    eccentricity: sourced(0.0933941, ORBIT),
    inclinationDeg: sourced(1.84969142, ORBIT),
  },
  rotation: {
    siderealRotationHours: sourced(24.622962, PHYSICAL, {
      derivation: "unit-conversion",
    }),
    solarDayHours: sourced(24.6597, FACTS),
    axialTiltDeg: sourced(25.0, FACTS),
    retrograde: false,
  },
  environment: {
    temperature: {
      averageC: sourced(-65, "nasa-solar-system-temperatures"),
      definition: "surface",
    },
    atmosphereSummary: {
      en: "A thin atmosphere dominated by carbon dioxide.",
      tr: "Karbondioksitin baskın olduğu ince bir atmosfer.",
    },
    majorAtmosphericComponents: ["carbon dioxide", "nitrogen", "argon"],
  },
  moons: {
    count: sourced(2, "nasa-mars-moons-facts", { asOf: "2026-07-17" }),
    featured: ["Phobos", "Deimos"],
  },
  rings: {
    hasRings: false,
    description: {
      en: "Mars has no ring system.",
      tr: "Mars’ın halka sistemi yoktur.",
    },
  },
  sourceIds: [
    "jpl-planetary-physical-parameters",
    "jpl-approximate-planetary-elements",
    "nasa-planet-order-distance",
    "nasa-solar-system-temperatures",
    "nasa-mars-facts",
    "nasa-mars-moons-facts",
  ],
});
