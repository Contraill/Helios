import type { PlanetDetailContent } from "./types";

export const earthDetailContent: PlanetDetailContent = Object.freeze({
  id: "earth",
  heroKicker: "World 03 · terrestrial planet",
  heroCaption:
    "Editorial system diagram. Oceans, atmosphere and land are shown as connected conditions rather than a photographic globe.",
  visualLabel:
    "Editorial Earth horizon showing ocean, atmosphere and illuminated land",
  layout: Object.freeze([
    "human",
    "story",
    "metrics",
    "missions",
    "signals",
    "methodology",
  ] as const),
  portrait: Object.freeze({
    eyebrow: "Reference world",
    title: "Habitability is a system, not a single lucky number",
    lede: "Earth defines the units used throughout Helios, but it should not disappear into the role of default. Liquid water, atmosphere, magnetic shielding, chemistry and energy balance work together.",
  }),
  sections: Object.freeze([
    Object.freeze({
      id: "system",
      eyebrow: "Connected conditions",
      title: "Oceans and air continually exchange energy",
      body: Object.freeze([
        "Earth's surface oceans and nitrogen-oxygen atmosphere are parts of one coupled system. Heat, water, carbon and momentum move between ocean, land, ice and air.",
        "A global mean temperature is useful for comparison, but it cannot represent the range of climates and weather across the planet.",
      ]),
      sourceIds: Object.freeze([
        "nasa-earth-facts",
        "nasa-solar-system-temperatures",
      ]),
    }),
    Object.freeze({
      id: "baseline",
      eyebrow: "Baseline",
      title: "Every other world is measured from here",
      body: Object.freeze([
        "Earth gravity, the 24-hour solar day and the Earth year are the reference units behind Helios's personal comparisons.",
        "That familiarity is useful, but it can also hide how unusual stable surface oceans and known life are in the current planetary catalog.",
      ]),
      sourceIds: Object.freeze([
        "jpl-planetary-physical-parameters",
        "nasa-earth-facts",
      ]),
    }),
  ]),
  humanScale: Object.freeze({
    title: "The baseline your body already knows",
    body: "Earth returns the same scale reading entered by the user. That identity result makes it the control case for every other gravity comparison.",
  }),
  signals: Object.freeze([
    Object.freeze({
      eyebrow: "Atmosphere",
      title: "Breathable at the surface, structured above it",
      body: "Nitrogen and oxygen dominate the atmosphere, but habitability also depends on pressure, temperature, water and long-term planetary cycles.",
    }),
    Object.freeze({
      eyebrow: "Moon",
      title: "One large natural satellite",
      body: "The Moon is the single recognized natural satellite in the dated catalog and is unusually large relative to its planet.",
    }),
    Object.freeze({
      eyebrow: "Rings",
      title: "No planetary ring system",
      body: "Earth has dust and temporary particle structures in near-Earth space, but no persistent planetary rings like the giant planets.",
    }),
  ]),
  missions: Object.freeze([
    Object.freeze({
      name: "Terra",
      status: "Earth-observing orbiter",
      body: "Terra studies interactions among land, atmosphere, oceans and radiant energy, reinforcing the page's view of Earth as a connected system.",
      sourceIds: Object.freeze(["nasa-terra-mission"]),
    }),
  ]),
  methodology: Object.freeze({
    title: "The reference is not the whole planet",
    body: "Earth values are used as comparison baselines. Global means do not erase regional climates, altitude, weather or local gravity variation. The page avoids presenting present-day Earth observations as a single planetary state.",
  }),
  sourceIds: Object.freeze(["nasa-terra-mission"]),
});
