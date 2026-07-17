import type { PlanetDetailContent } from "./types";

export const saturnDetailContent: PlanetDetailContent = Object.freeze({
  id: "saturn",
  heroKicker: "World 06 · gas giant",
  heroCaption:
    "Diagrammatic ring plane. The ring width is emphasized for reading; particles are not drawn individually or to scale.",
  visualLabel:
    "Editorial diagram of Saturn crossed by a broad tilted ring plane",
  layout: Object.freeze([
    "story",
    "missions",
    "metrics",
    "human",
    "signals",
    "methodology",
  ] as const),
  portrait: Object.freeze({
    eyebrow: "Ring architecture",
    title: "A giant framed by countless small particles",
    lede: "Saturn's rings are visually dominant but physically thin. The planet beneath them remains a deep hydrogen-helium world without a solid surface.",
  }),
  sections: Object.freeze([
    Object.freeze({
      id: "rings",
      eyebrow: "Rings",
      title: "Broad in reach, thin in depth",
      body: Object.freeze([
        "The main rings are made of innumerable particles, largely water ice with rocky material. Gaps and divisions create structure across the ring plane.",
        "The page treats the rings as a system with scale and composition, not as a decorative outline around a yellow planet.",
      ]),
      sourceIds: Object.freeze(["nasa-saturn-facts", "nasa-cassini-mission"]),
    }),
    Object.freeze({
      id: "layers",
      eyebrow: "Planet",
      title: "No platform beneath the clouds",
      body: Object.freeze([
        "Like Jupiter, Saturn has no solid surface for a person to stand on. Gravity and temperature use a one-bar reference level in the atmosphere.",
        "Its low mean density describes the whole planet; it does not mean the atmosphere is gentle or the deeper interior is empty.",
      ]),
      sourceIds: Object.freeze([
        "nasa-saturn-facts",
        "jpl-planetary-physical-parameters",
      ]),
    }),
  ]),
  humanScale: Object.freeze({
    title: "Earth-like gravity is not Earth-like ground",
    body: "The one-bar gravity reference is surprisingly close to Earth's, but the similar scale reading exists inside an atmosphere with no solid surface beneath it.",
  }),
  signals: Object.freeze([
    Object.freeze({
      eyebrow: "Moons",
      title: "A changing catalog of worlds",
      body: "Saturn's recognized moon count is dated because discoveries and classifications change. Titan and Enceladus remain central scientific targets.",
    }),
    Object.freeze({
      eyebrow: "Day",
      title: "Fast rotation under a quiet palette",
      body: "Saturn turns in roughly eleven hours. The subdued visible colors should not be mistaken for a static atmosphere.",
    }),
    Object.freeze({
      eyebrow: "Temperature",
      title: "A reference layer, not a surface mean",
      body: "The displayed temperature corresponds to an atmospheric reference level equivalent to Earth sea-level pressure.",
    }),
  ]),
  missions: Object.freeze([
    Object.freeze({
      name: "Cassini-Huygens",
      status: "Completed Saturn system mission",
      body: "Cassini spent thirteen years at Saturn, studying the planet, rings, magnetosphere and moons while Huygens descended through Titan's atmosphere.",
      sourceIds: Object.freeze(["nasa-cassini-mission"]),
    }),
  ]),
  methodology: Object.freeze({
    title: "The ring visual is a reading aid",
    body: "The hero exaggerates ring visibility and does not resolve particle scale. Moon counts carry an as-of date, while temperature and gravity explicitly use a one-bar atmospheric reference level.",
  }),
  sourceIds: Object.freeze(["nasa-cassini-mission"]),
});
