export interface VisualRotationSource {
  readonly sourceId: string;
  readonly sourceUrl: string;
  readonly retrievedAt: string;
  readonly measurementNote: string;
}

export const VISUAL_ROTATION_SOURCES: Readonly<
  Record<string, VisualRotationSource>
> = Object.freeze({
  "nasa-ceres-facts": Object.freeze({
    sourceId: "nasa-ceres-facts",
    sourceUrl: "https://science.nasa.gov/dwarf-planets/ceres/facts/",
    retrievedAt: "2026-07-21",
    measurementNote: "NASA reports a rotation period of about 9 hours.",
  }),
  "nasa-dawn-vesta-rotation": Object.freeze({
    sourceId: "nasa-dawn-vesta-rotation",
    sourceUrl: "https://science.nasa.gov/solar-system/asteroids/4-vesta/",
    retrievedAt: "2026-07-21",
    measurementNote: "NASA reports a rotation period of 5.34 hours.",
  }),
  "nasa-pluto-facts": Object.freeze({
    sourceId: "nasa-pluto-facts",
    sourceUrl: "https://science.nasa.gov/dwarf-planets/pluto/facts/",
    retrievedAt: "2026-07-21",
    measurementNote:
      "NASA reports a 153-hour retrograde rotation period for Pluto.",
  }),
  "nasa-pluto-charon-facts": Object.freeze({
    sourceId: "nasa-pluto-charon-facts",
    sourceUrl: "https://science.nasa.gov/dwarf-planets/pluto/moons/charon/",
    retrievedAt: "2026-07-21",
    measurementNote:
      "NASA describes Pluto and Charon as mutually tidally locked.",
  }),
  "nasa-haumea-facts": Object.freeze({
    sourceId: "nasa-haumea-facts",
    sourceUrl: "https://science.nasa.gov/dwarf-planets/haumea/facts/",
    retrievedAt: "2026-07-21",
    measurementNote: "NASA reports a rotation period of about 4 hours.",
  }),
  "nasa-halley-facts": Object.freeze({
    sourceId: "nasa-halley-facts",
    sourceUrl: "https://science.nasa.gov/solar-system/comets/1p-halley/",
    retrievedAt: "2026-07-21",
    measurementNote: "NASA reports a 2.2-Earth-day rotation period.",
  }),
  "esa-rosetta-67p-rotation": Object.freeze({
    sourceId: "esa-rosetta-67p-rotation",
    sourceUrl: "https://sci.esa.int/web/rosetta/-/14615-comet-67p",
    retrievedAt: "2026-07-21",
    measurementNote:
      "ESA reports a 12.40-hour period for the accepted June 2014 reference state.",
  }),
  "nasa-deep-impact-tempel-1-rotation": Object.freeze({
    sourceId: "nasa-deep-impact-tempel-1-rotation",
    sourceUrl:
      "https://science.nasa.gov/asset/hubble/" +
      "space-eyes-see-comet-tempel-1-animated-artists-concept/",
    retrievedAt: "2026-07-21",
    measurementNote: "NASA reports a rotation period of about 41 hours.",
  }),
});

export function visualRotationSourceFor(
  sourceId: string,
): VisualRotationSource | null {
  return VISUAL_ROTATION_SOURCES[sourceId] ?? null;
}
