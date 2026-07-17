import type { PlanetDetailContent } from "./types";

export const mercuryDetailContent: PlanetDetailContent = Object.freeze({
  id: "mercury",
  heroKicker: "World 01 · terrestrial planet",
  heroCaption:
    "Editorial geometry, not a surface photograph. The hard terminator emphasizes Mercury's extreme light-and-dark cycle.",
  visualLabel:
    "Editorial diagram of Mercury beside a sharp solar light boundary",
  layout: Object.freeze([
    "metrics",
    "story",
    "human",
    "missions",
    "signals",
    "methodology",
  ] as const),
  portrait: Object.freeze({
    eyebrow: "Solar edge",
    title: "A small world under an enormous Sun",
    lede: "Mercury's story is not simply heat. It is exposure: long days, almost no atmosphere, and a surface that cannot redistribute energy the way Earth does.",
  }),
  sections: Object.freeze([
    Object.freeze({
      id: "light",
      eyebrow: "Light",
      title: "Daylight arrives without a protective sky",
      body: Object.freeze([
        "Mercury has a tenuous exosphere rather than a substantial atmosphere. Sunlight reaches the surface with little scattering, so the boundary between illumination and darkness is visually and thermally severe.",
        "The displayed mean temperature is a global reference. Individual locations can move far above or below it depending on sunlight and local time.",
      ]),
      sourceIds: Object.freeze([
        "nasa-mercury-facts",
        "nasa-solar-system-temperatures",
      ]),
    }),
    Object.freeze({
      id: "time",
      eyebrow: "Time",
      title: "A solar day outlasts two Mercury years",
      body: Object.freeze([
        "Mercury moves around the Sun quickly, but turns slowly. Its spin-orbit relationship produces a solar day far longer than its orbital year.",
        "A familiar clock therefore fails twice: sunrise advances slowly while the planet completes repeated trips around the Sun.",
      ]),
      sourceIds: Object.freeze([
        "nasa-mercury-facts",
        "jpl-planetary-physical-parameters",
      ]),
    }),
  ]),
  humanScale: Object.freeze({
    title: "Light on your feet, exposed to the Sun",
    body: "A scale would read much less than on Earth, but lower gravity does not soften radiation, vacuum or the enormous day-night temperature range.",
  }),
  signals: Object.freeze([
    Object.freeze({
      eyebrow: "Surface",
      title: "Rock, craters and no weather blanket",
      body: "Mercury is a solid terrestrial world. Its surface record remains sharply preserved because there is no dense atmosphere producing Earth-like weather and erosion.",
    }),
    Object.freeze({
      eyebrow: "Companions",
      title: "No moons, no rings",
      body: "The current catalog records no recognized moons and no planetary ring system.",
    }),
    Object.freeze({
      eyebrow: "Rotation",
      title: "Slow spin, fast orbit",
      body: "The contrast between a short year and a very long solar day is the defining time-scale relationship on Mercury.",
    }),
  ]),
  missions: Object.freeze([
    Object.freeze({
      name: "MESSENGER",
      status: "Completed orbiter",
      body: "The first spacecraft to orbit Mercury mapped the planet, studied its composition and magnetic field, and verified water-ice-dominated polar deposits.",
      sourceIds: Object.freeze(["nasa-messenger-mission"]),
    }),
  ]),
  methodology: Object.freeze({
    title: "A mean is not a forecast",
    body: "Mercury's temperature reference is a planetary surface mean. It does not describe the sunlit maximum, night-side minimum or a current local condition. The hero is an editorial diagram; numerical values remain tied to the source registry.",
  }),
  sourceIds: Object.freeze(["nasa-messenger-mission"]),
});
