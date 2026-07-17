import type { PlanetDetailContent } from "./types";

export const uranusDetailContent: PlanetDetailContent = Object.freeze({
  id: "uranus",
  heroKicker: "World 07 · ice giant",
  heroCaption:
    "Axis-first editorial diagram. The planet is shown on its side to communicate orientation, not a current seasonal pose.",
  visualLabel:
    "Editorial diagram of Uranus tilted almost sideways with a faint ring system",
  layout: Object.freeze([
    "metrics",
    "story",
    "signals",
    "missions",
    "human",
    "methodology",
  ] as const),
  portrait: Object.freeze({
    eyebrow: "Orientation",
    title: "A world whose seasons roll sideways",
    lede: "Uranus's extreme axial tilt changes the geometry of light and time. Its calm visible appearance sits over an ice-giant interior and a long seasonal cycle.",
  }),
  sections: Object.freeze([
    Object.freeze({
      id: "tilt",
      eyebrow: "Tilt",
      title: "The axis is the dominant fact",
      body: Object.freeze([
        "Uranus rotates with an axial tilt near ninety-eight degrees, effectively carrying its poles through the plane of its orbit.",
        "Because one orbit lasts about eighty-four Earth years, each season extends across decades rather than months.",
      ]),
      sourceIds: Object.freeze([
        "nasa-uranus-facts",
        "jpl-planetary-physical-parameters",
      ]),
    }),
    Object.freeze({
      id: "identity",
      eyebrow: "Ice giant",
      title: "Not a smaller blue Jupiter",
      body: Object.freeze([
        "Uranus and Neptune are classified as ice giants because their composition and internal structure differ from the hydrogen-helium-dominated gas giants.",
        "Methane absorbs red light and contributes to the pale cyan appearance, but color alone is not the definition of the class.",
      ]),
      sourceIds: Object.freeze(["nasa-uranus-facts"]),
    }),
  ]),
  humanScale: Object.freeze({
    title: "A familiar gravity ratio in an unfamiliar layer",
    body: "The one-bar reference gravity is close to Venus's and below Earth's. As with every giant planet, it is not a walkable surface measurement.",
  }),
  signals: Object.freeze([
    Object.freeze({
      eyebrow: "Rings",
      title: "Dark, narrow and easy to miss",
      body: "Uranus has a faint ring system. It belongs to the planet's architecture even though it does not dominate the view like Saturn's rings.",
    }),
    Object.freeze({
      eyebrow: "Moons",
      title: "A dated family around a tilted world",
      body: "The recognized moon count is stored with an as-of date. Miranda, Ariel, Umbriel, Titania and Oberon are highlighted in the reference catalog.",
    }),
    Object.freeze({
      eyebrow: "Temperature",
      title: "A cold atmospheric reference",
      body: "The displayed value uses an atmospheric reference level, not a surface that a visitor could reach and stand upon.",
    }),
  ]),
  missions: Object.freeze([
    Object.freeze({
      name: "Voyager 2",
      status: "Completed flyby",
      body: "Voyager 2 remains the only spacecraft to have studied Uranus at close range, discovering new moons and rings during its 1986 encounter.",
      sourceIds: Object.freeze(["nasa-voyager-2-mission"]),
    }),
  ]),
  methodology: Object.freeze({
    title: "Tilt is a geometric relationship, not a frozen picture",
    body: "The hero fixes the unusual axis in a readable diagram. It does not claim to show Uranus's current season or exact orientation at a selected date. Those time-dependent questions belong to the future ephemeris phase.",
  }),
  sourceIds: Object.freeze(["nasa-voyager-2-mission"]),
});
