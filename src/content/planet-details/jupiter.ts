import type { PlanetDetailContent } from "./types";

export const jupiterDetailContent: PlanetDetailContent = Object.freeze({
  id: "jupiter",
  heroKicker: "World 05 · gas giant",
  heroCaption:
    "Editorial atmospheric bands. The visible edge is a cloud system, not solid ground.",
  visualLabel:
    "Editorial cropped view of Jupiter with broad atmospheric bands and storms",
  layout: Object.freeze([
    "metrics",
    "signals",
    "story",
    "human",
    "missions",
    "methodology",
  ] as const),
  portrait: Object.freeze({
    eyebrow: "Scale without ground",
    title: "A planet defined by depth",
    lede: "Jupiter's visible bands are the top of a deep atmosphere. Moving downward does not lead to a walkable surface; pressure and density increase through fluid layers.",
  }),
  sections: Object.freeze([
    Object.freeze({
      id: "layers",
      eyebrow: "Layers",
      title: "Cloud tops are not a surface",
      body: Object.freeze([
        "Helios uses a one-bar reference level for gravity and temperature because Jupiter has no solid surface comparable with Earth's ground.",
        "The familiar circular outline is a visual boundary in the clouds, while the planet continues inward through increasingly dense hydrogen-rich material.",
      ]),
      sourceIds: Object.freeze([
        "nasa-jupiter-facts",
        "jpl-planetary-physical-parameters",
        "nasa-solar-system-temperatures",
      ]),
    }),
    Object.freeze({
      id: "tempo",
      eyebrow: "Tempo",
      title: "The largest planet turns in under ten hours",
      body: Object.freeze([
        "Jupiter combines enormous size with a short day. Rapid rotation shapes its banded atmosphere and contributes to an equatorial bulge.",
        "Its year is long by human standards, but the daily rhythm is faster than on any terrestrial planet.",
      ]),
      sourceIds: Object.freeze([
        "nasa-jupiter-facts",
        "jpl-planetary-physical-parameters",
      ]),
    }),
  ]),
  humanScale: Object.freeze({
    title: "A scale comparison at a defined pressure level",
    body: "The gravity calculation uses Jupiter's one-bar reference level. It is a comparison convention, not a promise that a person could stand there.",
  }),
  signals: Object.freeze([
    Object.freeze({
      eyebrow: "Gravity",
      title: "Powerful, but defined without a surface",
      body: "The reference gravity is more than twice Earth's. Its definition matters because Jupiter's atmosphere has no fixed ground boundary.",
    }),
    Object.freeze({
      eyebrow: "Moons",
      title: "A planetary system inside the Solar System",
      body: "The dated catalog includes more than one hundred recognized moons, with Io, Europa, Ganymede and Callisto forming the prominent Galilean group.",
    }),
    Object.freeze({
      eyebrow: "Rings",
      title: "A faint dusty system",
      body: "Jupiter has rings, but they are thin and subdued rather than the dominant architecture seen around Saturn.",
    }),
  ]),
  missions: Object.freeze([
    Object.freeze({
      name: "Juno",
      status: "Jupiter orbiter",
      body: "Juno probes beneath Jupiter's clouds to study its origin, interior, magnetic field, atmosphere and polar storms.",
      sourceIds: Object.freeze(["nasa-juno-mission"]),
    }),
  ]),
  methodology: Object.freeze({
    title: "Reference-level language is mandatory",
    body: "Temperature and gravity are tied to a stated atmospheric pressure level. Helios does not call that level a surface, and the editorial bands do not claim photographic or real-time accuracy.",
  }),
  sourceIds: Object.freeze(["nasa-juno-mission"]),
});
