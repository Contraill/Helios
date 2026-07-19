export type ProceduralRingPlanetId = "jupiter" | "neptune" | "uranus";

export interface PlanetaryRingBand {
  readonly color: string;
  readonly id: string;
  readonly innerRadius: number;
  readonly opacity: number;
  readonly outerRadius: number;
}

export interface PlanetaryRingArc extends PlanetaryRingBand {
  readonly arcLength: number;
  readonly arcStart: number;
}

export interface PlanetaryRingProfile {
  readonly arcs: readonly PlanetaryRingArc[];
  readonly bands: readonly PlanetaryRingBand[];
  readonly sourceUrl: string;
}

const band = (
  id: string,
  innerRadius: number,
  outerRadius: number,
  color: string,
  opacity: number,
): PlanetaryRingBand =>
  Object.freeze({ color, id, innerRadius, opacity, outerRadius });

const arc = (
  id: string,
  radius: number,
  width: number,
  arcStart: number,
  arcLength: number,
): PlanetaryRingArc =>
  Object.freeze({
    ...band(id, radius - width / 2, radius + width / 2, "#c7b9a6", 0.2),
    arcLength,
    arcStart,
  });

/**
 * Radii are expressed in equatorial planet radii. Very narrow measured rings
 * receive a small minimum display width so they survive rasterization while
 * their centers, ordering, relative brightness and color remain meaningful.
 */
export const PLANETARY_RING_PROFILES: Readonly<
  Record<ProceduralRingPlanetId, PlanetaryRingProfile>
> = Object.freeze({
  jupiter: Object.freeze({
    sourceUrl:
      "https://science.nasa.gov/photojournal/jupiters-main-ring-and-halo/",
    bands: Object.freeze([
      band("halo", 1.4, 1.715, "#9b806e", 0.018),
      band("main", 1.715, 1.806, "#cbb8a5", 0.082),
      band("amalthea-gossamer", 1.806, 2.54, "#8f7768", 0.012),
      band("thebe-gossamer", 2.54, 3.11, "#806c63", 0.007),
    ]),
    arcs: Object.freeze([]),
  }),
  uranus: Object.freeze({
    sourceUrl: "https://science.nasa.gov/uranus/facts/",
    bands: Object.freeze([
      band("zeta", 1.46, 1.515, "#514e4b", 0.1),
      band("6", 1.632, 1.642, "#605c58", 0.19),
      band("5", 1.647, 1.657, "#625e59", 0.18),
      band("4", 1.66, 1.67, "#5d5956", 0.2),
      band("alpha", 1.744, 1.756, "#69635e", 0.23),
      band("beta", 1.78, 1.792, "#6b655f", 0.22),
      band("eta", 1.84, 1.852, "#625d59", 0.18),
      band("gamma", 1.857, 1.869, "#6b6661", 0.22),
      band("delta", 1.884, 1.896, "#6f6964", 0.23),
      band("lambda", 1.95, 1.964, "#7a716a", 0.16),
      band("epsilon", 1.992, 2.014, "#81776f", 0.31),
      band("nu", 2.59, 2.68, "#8b5d55", 0.075),
      band("mu", 3.72, 3.92, "#7a9ca8", 0.07),
    ]),
    arcs: Object.freeze([]),
  }),
  neptune: Object.freeze({
    sourceUrl:
      "https://science.nasa.gov/neptune/neptune-facts/#hds-sidebar-nav-8",
    bands: Object.freeze([
      band("galle", 1.685, 1.699, "#8b8078", 0.055),
      band("leverrier", 2.14, 2.156, "#a69a91", 0.09),
      band("lassell", 2.18, 2.29, "#837a75", 0.032),
      band("arago", 2.319, 2.333, "#968a82", 0.07),
      band("adams", 2.532, 2.55, "#a89b91", 0.11),
    ]),
    arcs: Object.freeze([
      arc("liberte", 2.541, 0.024, 0.16, 0.2),
      arc("egalite", 2.541, 0.024, 0.43, 0.15),
      arc("fraternite", 2.541, 0.024, 0.65, 0.28),
      arc("courage", 2.541, 0.024, 1.02, 0.13),
    ]),
  }),
});
