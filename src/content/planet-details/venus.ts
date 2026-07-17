import type { PlanetDetailContent } from "./types";

export const venusDetailContent: PlanetDetailContent = Object.freeze({
  id: "venus",
  heroKicker: "World 02 · terrestrial planet",
  heroCaption:
    "Layered editorial atmosphere. The visible cloud envelope is not a direct surface view.",
  visualLabel:
    "Editorial diagram of Venus enclosed by layered atmospheric bands",
  layout: Object.freeze([
    "story",
    "metrics",
    "signals",
    "human",
    "missions",
    "methodology",
  ] as const),
  portrait: Object.freeze({
    eyebrow: "Atmospheric weight",
    title: "An Earth-sized world sealed beneath clouds",
    lede: "Venus demonstrates that similar size does not imply similar conditions. Its dense carbon-dioxide atmosphere changes pressure, heat and visibility together.",
  }),
  sections: Object.freeze([
    Object.freeze({
      id: "greenhouse",
      eyebrow: "Heat",
      title: "The atmosphere is the engine of the surface climate",
      body: Object.freeze([
        "Venus is the hottest planet even though Mercury is closer to the Sun. A runaway greenhouse effect traps heat beneath a massive carbon-dioxide atmosphere.",
        "The temperature shown by Helios is a surface reference, not a cloud-top value and not a present-time measurement.",
      ]),
      sourceIds: Object.freeze([
        "nasa-venus-facts",
        "nasa-solar-system-temperatures",
      ]),
    }),
    Object.freeze({
      id: "rotation",
      eyebrow: "Direction",
      title: "A slow world turning backward",
      body: Object.freeze([
        "Venus rotates in the retrograde direction relative to most planets. Its rotation is so slow that the relationship between a sidereal rotation and a solar day is deeply unintuitive.",
        "The page separates day and year values instead of compressing them into one ambiguous number.",
      ]),
      sourceIds: Object.freeze([
        "nasa-venus-facts",
        "jpl-planetary-physical-parameters",
      ]),
    }),
  ]),
  humanScale: Object.freeze({
    title: "Nearly Earth gravity, radically un-Earth conditions",
    body: "The scale reading would be close to Earth's, but that familiar number says nothing about the crushing atmosphere, heat or absence of breathable air.",
  }),
  signals: Object.freeze([
    Object.freeze({
      eyebrow: "Atmosphere",
      title: "Carbon dioxide and sulfuric-acid clouds",
      body: "The cloud deck hides the solid surface from ordinary visible-light observation and makes atmospheric layers central to every description of Venus.",
    }),
    Object.freeze({
      eyebrow: "Surface",
      title: "Solid ground under extreme pressure",
      body: "Venus is terrestrial, not a gas giant. Its rocky surface exists beneath the dense atmosphere, where pressure and heat dominate the environment.",
    }),
    Object.freeze({
      eyebrow: "Moons and rings",
      title: "Neither companion nor ring system",
      body: "The dated reference catalog records no recognized moons and no planetary rings.",
    }),
  ]),
  missions: Object.freeze([
    Object.freeze({
      name: "Magellan",
      status: "Completed radar orbiter",
      body: "Magellan used synthetic-aperture radar to map Venus through its clouds and produced the first near-global view of its surface.",
      sourceIds: Object.freeze(["nasa-magellan-mission"]),
    }),
    Object.freeze({
      name: "DAVINCI",
      status: "Future atmospheric probe",
      body: "DAVINCI is designed to examine Venus from above the clouds to the surface, including atmospheric chemistry, pressure, temperature and descent imaging.",
      sourceIds: Object.freeze(["nasa-davinci-mission"]),
    }),
  ]),
  methodology: Object.freeze({
    title: "Surface, cloud top and atmosphere are different reference levels",
    body: "Helios labels Venus's temperature as a surface reference and avoids treating cloud imagery as a direct surface photograph. Mission status is described from dated official sources rather than presented as live telemetry.",
  }),
  sourceIds: Object.freeze(["nasa-magellan-mission", "nasa-davinci-mission"]),
});
