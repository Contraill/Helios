import type { PlanetDetailContent } from "./types";

export const neptuneDetailContent: PlanetDetailContent = Object.freeze({
  id: "neptune",
  heroKicker: "World 08 · ice giant",
  heroCaption:
    "Distance-led editorial diagram. The small solar signal and deep field communicate remoteness, not a photographed sky.",
  visualLabel:
    "Editorial deep-space diagram of Neptune with a distant solar light signal",
  layout: Object.freeze([
    "human",
    "metrics",
    "story",
    "signals",
    "missions",
    "methodology",
  ] as const),
  portrait: Object.freeze({
    eyebrow: "Far light",
    title: "Distance becomes part of every experience",
    lede: "Neptune is not simply Uranus in darker blue. Its remoteness, atmospheric activity and long orbital period create a different rhythm and a stronger sense of depth.",
  }),
  sections: Object.freeze([
    Object.freeze({
      id: "distance",
      eyebrow: "Distance",
      title: "Sunlight arrives after hours, not minutes",
      body: Object.freeze([
        "At Neptune's average orbital distance, sunlight takes several hours to arrive. Communication and observation inherit that delay even before mission operations add their own constraints.",
        "The Sun would remain intensely bright to the eye but occupy a much smaller apparent disk than it does from Earth.",
      ]),
      sourceIds: Object.freeze([
        "nasa-neptune-facts",
        "jpl-planetary-physical-parameters",
      ]),
    }),
    Object.freeze({
      id: "motion",
      eyebrow: "Atmosphere",
      title: "A cold world with vigorous motion",
      body: Object.freeze([
        "Neptune's atmosphere is hydrogen- and helium-rich with methane, yet it supports highly dynamic weather and exceptionally fast winds.",
        "The reference temperature is tied to an atmospheric pressure level, not a solid surface and not a current storm measurement.",
      ]),
      sourceIds: Object.freeze([
        "nasa-neptune-facts",
        "nasa-solar-system-temperatures",
      ]),
    }),
  ]),
  humanScale: Object.freeze({
    title: "The delay is more tangible than the gravity",
    body: "A scale comparison is possible at the one-bar reference level, but the defining human-scale fact is time: sunlight and radio signals cross an enormous distance.",
  }),
  signals: Object.freeze([
    Object.freeze({
      eyebrow: "Moon",
      title: "Triton moves against the usual direction",
      body: "Triton is Neptune's largest featured moon and follows a retrograde orbit, making the moon system as distinctive as the atmosphere.",
    }),
    Object.freeze({
      eyebrow: "Rings",
      title: "Faint rings with concentrated arcs",
      body: "Neptune's ring system is subtle and includes prominent arcs rather than Saturn-like bright continuous bands.",
    }),
    Object.freeze({
      eyebrow: "Year",
      title: "One orbit exceeds a human lifetime",
      body: "Neptune requires roughly 165 Earth years to circle the Sun, separating daily atmospheric motion from an extraordinarily long seasonal clock.",
    }),
  ]),
  missions: Object.freeze([
    Object.freeze({
      name: "Voyager 2",
      status: "Completed flyby",
      body: "Voyager 2 is the only spacecraft to have visited Neptune, revealing moons, rings and the Great Dark Spot during the 1989 encounter.",
      sourceIds: Object.freeze(["nasa-voyager-2-mission"]),
    }),
  ]),
  methodology: Object.freeze({
    title: "Distance and weather use different clocks",
    body: "Light-travel time is calculated from average orbital distance. Atmospheric language comes from reference science, not a live forecast. The hero is a distance diagram rather than an observation from a spacecraft camera.",
  }),
  sourceIds: Object.freeze(["nasa-voyager-2-mission"]),
});
