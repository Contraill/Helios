import { definePlanet, sourced } from "./helpers";

const PHYSICAL = "jpl-planetary-physical-parameters";
const ORBIT = "jpl-approximate-planetary-elements";
const FACTS = "nasa-mercury-facts";

export const mercury = definePlanet({
  id: "mercury",
  orderFromSun: sourced(1, "nasa-planet-order-distance"),
  name: { en: "Mercury", tr: "Merkür" },
  tagline: {
    en: "The swift, cratered world nearest the Sun.",
    tr: "Güneş'e en yakın, hızlı ve kraterli dünya.",
  },
  description: {
    en: "Mercury is the Solar System's smallest planet, a rocky world with extreme day-night temperature swings and only a tenuous exosphere.",
    tr: "Merkür, Güneş Sistemi'nin en küçük gezegenidir; aşırı gündüz-gece sıcaklık farklarına ve yalnızca çok seyrek bir ekzosfere sahip kayalık bir dünyadır.",
  },
  accentColor: "#A9A39A",
  kind: "terrestrial",
  physical: {
    meanRadiusKm: sourced(2439.4, PHYSICAL),
    equatorialDiameterKm: sourced(4881.06, PHYSICAL, {
      derivation: "calculated",
    }),
    massKg: sourced(3.30103e23, PHYSICAL, { derivation: "unit-conversion" }),
    densityKgM3: sourced(5428.9, PHYSICAL, { derivation: "unit-conversion" }),
    gravityMS2: { ...sourced(3.7, PHYSICAL), definition: "surface-equatorial" },
    escapeVelocityKmS: sourced(4.25, PHYSICAL),
  },
  orbit: {
    semiMajorAxisKm: sourced(57909226.542, ORBIT, {
      derivation: "unit-conversion",
    }),
    semiMajorAxisAu: sourced(0.38709927, ORBIT),
    orbitalPeriodEarthDays: sourced(87.969257, PHYSICAL, {
      derivation: "unit-conversion",
    }),
    eccentricity: sourced(0.20563593, ORBIT),
    inclinationDeg: sourced(7.00497902, ORBIT),
  },
  rotation: {
    siderealRotationHours: sourced(1407.5088, PHYSICAL, {
      derivation: "unit-conversion",
    }),
    solarDayHours: sourced(4222.6, FACTS),
    axialTiltDeg: sourced(2.0, FACTS),
    retrograde: false,
  },
  environment: {
    temperature: {
      averageC: sourced(167, "nasa-solar-system-temperatures"),
      definition: "surface",
    },
    atmosphereSummary: {
      en: "A very thin exosphere rather than a substantial atmosphere.",
      tr: "Yoğun bir atmosfer yerine son derece seyrek bir ekzosfer bulunur.",
    },
    majorAtmosphericComponents: [
      "oxygen",
      "sodium",
      "hydrogen",
      "helium",
      "potassium",
    ],
  },
  moons: {
    count: sourced(0, "nasa-mercury-facts", { asOf: "2026-07-17" }),
    featured: [],
  },
  rings: {
    hasRings: false,
    description: {
      en: "Mercury has no ring system.",
      tr: "Merkür’ün halka sistemi yoktur.",
    },
  },
  sourceIds: [
    "jpl-planetary-physical-parameters",
    "jpl-approximate-planetary-elements",
    "nasa-planet-order-distance",
    "nasa-solar-system-temperatures",
    "nasa-mercury-facts",
  ],
});
