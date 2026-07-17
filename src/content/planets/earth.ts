import { definePlanet, sourced } from "./helpers";

const PHYSICAL = "jpl-planetary-physical-parameters";
const ORBIT = "jpl-approximate-planetary-elements";
const FACTS = "nasa-earth-facts";

export const earth = definePlanet({
  id: "earth",
  orderFromSun: sourced(3, "nasa-planet-order-distance"),
  name: { en: "Earth", tr: "Dünya" },
  tagline: {
    en: "The ocean world that defines our scale.",
    tr: "Ölçeğimizi tanımlayan okyanus dünyası.",
  },
  description: {
    en: "Earth is the largest terrestrial planet and the only known world with stable surface oceans and life.",
    tr: "Dünya, karasal gezegenlerin en büyüğü ve yüzeyinde kalıcı okyanuslar ile yaşam bulunduğu bilinen tek dünyadır.",
  },
  accentColor: "#4D8BD6",
  kind: "terrestrial",
  physical: {
    meanRadiusKm: sourced(6371.0084, PHYSICAL),
    equatorialDiameterKm: sourced(12756.2732, PHYSICAL, {
      derivation: "calculated",
    }),
    massKg: sourced(5.97217e24, PHYSICAL, { derivation: "unit-conversion" }),
    densityKgM3: sourced(5513.4, PHYSICAL, { derivation: "unit-conversion" }),
    gravityMS2: { ...sourced(9.8, PHYSICAL), definition: "surface-equatorial" },
    escapeVelocityKmS: sourced(11.19, PHYSICAL),
  },
  orbit: {
    semiMajorAxisKm: sourced(149598261.15, ORBIT, {
      derivation: "unit-conversion",
    }),
    semiMajorAxisAu: sourced(1.00000261, ORBIT),
    orbitalPeriodEarthDays: sourced(365.256355, PHYSICAL, {
      derivation: "unit-conversion",
    }),
    eccentricity: sourced(0.01671123, ORBIT),
    inclinationDeg: sourced(1.531e-5, ORBIT),
  },
  rotation: {
    siderealRotationHours: sourced(23.934472, PHYSICAL, {
      derivation: "unit-conversion",
    }),
    solarDayHours: sourced(24.0, FACTS),
    axialTiltDeg: sourced(23.44, FACTS),
    retrograde: false,
  },
  environment: {
    temperature: {
      averageC: sourced(15, "nasa-solar-system-temperatures"),
      definition: "surface",
    },
    atmosphereSummary: {
      en: "A nitrogen-oxygen atmosphere that supports liquid surface water and life.",
      tr: "Yüzeyde sıvı suyu ve yaşamı destekleyen azot-oksijen atmosferi.",
    },
    majorAtmosphericComponents: [
      "nitrogen",
      "oxygen",
      "argon",
      "carbon dioxide",
    ],
  },
  moons: {
    count: sourced(1, "nasa-earth-moon-facts", { asOf: "2026-02-12" }),
    featured: ["Moon"],
  },
  rings: {
    hasRings: false,
    description: {
      en: "Earth has no planetary ring system.",
      tr: "Dünya’nın gezegensel bir halka sistemi yoktur.",
    },
  },
  sourceIds: [
    "jpl-planetary-physical-parameters",
    "jpl-approximate-planetary-elements",
    "nasa-planet-order-distance",
    "nasa-solar-system-temperatures",
    "nasa-earth-facts",
    "nasa-earth-moon-facts",
  ],
});
