import type { ContentSectionModel } from "@/features/data-presentation/types/presentation";

export interface MarsDetailContent {
  readonly heroCaption: string;
  readonly heroKicker: string;
  readonly methodology: {
    readonly body: string;
    readonly title: string;
  };
  readonly sections: readonly ContentSectionModel[];
}

export const marsDetailContent: MarsDetailContent = Object.freeze({
  heroKicker: "World 04 · terrestrial planet",
  heroCaption:
    "Editorial representation. Color and relief are interpretive; measurements below use the sourced reference catalog.",
  sections: Object.freeze([
    Object.freeze({
      id: "time",
      eyebrow: "Time",
      title: "A day close enough to feel familiar",
      body: Object.freeze([
        "A Martian solar day is only about forty minutes longer than a day on Earth. That near-match makes the daily rhythm feel intuitive, even while the planet’s year stretches across almost 687 Earth days.",
        "The similarity is useful for human-scale comparison, but it does not make the environment Earth-like: temperature, pressure and breathable air remain entirely different constraints.",
      ]),
      sourceIds: Object.freeze([
        "nasa-mars-facts",
        "jpl-planetary-physical-parameters",
      ]),
    }),
    Object.freeze({
      id: "environment",
      eyebrow: "Environment",
      title: "Thin air changes every familiar rule",
      body: Object.freeze([
        "Mars has a thin atmosphere dominated by carbon dioxide. It offers little thermal insulation and no breathable air, so the average surface temperature and pressure cannot be read as ordinary weather conditions.",
        "Helios treats the temperature shown here as a planetary reference value, not a forecast and not a measurement for every location or season.",
      ]),
      sourceIds: Object.freeze([
        "nasa-mars-facts",
        "nasa-solar-system-temperatures",
      ]),
    }),
    Object.freeze({
      id: "surface",
      eyebrow: "Surface record",
      title: "A dry world that still carries water’s evidence",
      body: Object.freeze([
        "Channels, deltas, minerals and layered terrain preserve evidence that liquid water once shaped parts of Mars. The planet is presented as a geological record, not as a promise that its present surface is wet or habitable.",
        "Its red appearance comes from iron-bearing minerals in the soil and dust. The visual treatment on this page is editorial, while the physical values remain tied to the source registry.",
      ]),
      sourceIds: Object.freeze(["nasa-mars-facts"]),
    }),
  ]),
  methodology: Object.freeze({
    title: "Reference world, not a live weather feed",
    body: "This page uses version-controlled planetary reference values. Average temperature is not a current local observation, and a rover measurement would describe one instrument, place and time—not the whole planet. Future NASA integrations will keep observed-at and retrieved-at dates separate and will fall back without inventing current conditions.",
  }),
});
