import { definePlanet, sourced } from "./helpers";

const PHYSICAL = "jpl-planetary-physical-parameters";
const ORBIT = "jpl-approximate-planetary-elements";
const FACTS = "nasa-uranus-facts";

export const uranus = definePlanet({
  id: "uranus",
  orderFromSun: sourced(7, "nasa-planet-order-distance"),
  name: { en: "Uranus", tr: "Uranüs" },
  tagline: {
    en: "An ice giant rotating almost on its side.",
    tr: "Neredeyse yan yatmış dönen buz devi.",
  },
  description: {
    en: "Uranus is a cold ice giant whose extreme axial tilt produces unusually long and severe seasons.",
    tr: "Uranüs, aşırı eksen eğikliği olağan dışı uzun ve sert mevsimler oluşturan soğuk bir buz devidir.",
  },
  accentColor: "#86D7DE",
  kind: "ice-giant",
  physical: {
    meanRadiusKm: sourced(25362, PHYSICAL),
    equatorialDiameterKm: sourced(51118, PHYSICAL, {
      derivation: "calculated",
    }),
    massKg: sourced(8.68099e25, PHYSICAL, { derivation: "unit-conversion" }),
    densityKgM3: sourced(1270, PHYSICAL, { derivation: "unit-conversion" }),
    gravityMS2: {
      ...sourced(8.87, PHYSICAL),
      definition: "one-bar-reference-level",
    },
    escapeVelocityKmS: sourced(21.38, PHYSICAL),
  },
  orbit: {
    semiMajorAxisKm: sourced(2870658170.656, ORBIT, {
      derivation: "unit-conversion",
    }),
    semiMajorAxisAu: sourced(19.18916464, ORBIT),
    orbitalPeriodEarthDays: sourced(30687.153001, PHYSICAL, {
      derivation: "unit-conversion",
    }),
    eccentricity: sourced(0.04725744, ORBIT),
    inclinationDeg: sourced(0.77263783, ORBIT),
  },
  rotation: {
    siderealRotationHours: sourced(17.23992, PHYSICAL, {
      derivation: "unit-conversion",
    }),
    solarDayHours: sourced(17.0, FACTS),
    axialTiltDeg: sourced(97.77, FACTS),
    retrograde: true,
  },
  environment: {
    temperature: {
      averageC: sourced(-195, "nasa-solar-system-temperatures"),
      definition: "reference-level",
    },
    atmosphereSummary: {
      en: "A hydrogen-helium atmosphere with methane that absorbs red light.",
      tr: "Kırmızı ışığı soğuran metan içeren hidrojen-helyum atmosferi.",
    },
    majorAtmosphericComponents: ["hydrogen", "helium", "methane"],
  },
  moons: {
    count: sourced(29, "jpl-planetary-satellite-discoveries", {
      asOf: "2026-07-17",
    }),
    featured: ["Miranda", "Ariel", "Umbriel", "Titania", "Oberon"],
  },
  rings: {
    hasRings: true,
    description: {
      en: "Uranus is surrounded by a faint ring system.",
      tr: "Uranüs, soluk bir halka sistemiyle çevrilidir.",
    },
  },
  sourceIds: [
    "jpl-planetary-physical-parameters",
    "jpl-approximate-planetary-elements",
    "nasa-planet-order-distance",
    "nasa-solar-system-temperatures",
    "nasa-uranus-facts",
    "jpl-planetary-satellite-discoveries",
  ],
});
