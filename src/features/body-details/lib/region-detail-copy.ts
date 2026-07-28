import type {
  CelestialBodyId,
  SystemRegionId,
} from "@/features/solar-system/types/celestial-body";

export interface RegionMetricCopy {
  readonly label: string;
  readonly value: string;
  readonly note?: string;
}

export interface RegionSectionCopy {
  readonly eyebrow: string;
  readonly title: string;
  readonly body: string;
}

export interface RegionSourceCopy {
  readonly label: string;
  readonly href: string;
}

export interface RegionRelatedCopy {
  readonly id: CelestialBodyId;
  readonly context: string;
}

export interface RegionEditorialCopy {
  readonly kindLabel: string;
  readonly accentColor: string;
  readonly tagline: string;
  readonly overview: string;
  readonly metadataDescription: string;
  readonly metricTitle: string;
  readonly metrics: readonly RegionMetricCopy[];
  readonly sections: readonly RegionSectionCopy[];
  readonly sourceLinks: readonly RegionSourceCopy[];
  readonly related: readonly RegionRelatedCopy[];
  readonly representationLabel: string;
  readonly representationNote: string;
  readonly visualLabel: string;
  readonly visualValue: string;
  readonly visualNote: string;
  readonly visualKind: "belt" | "cloud" | "boundary";
}

export const REGION_EDITORIAL_COPY = {
  "asteroid-belt": {
    kindLabel: "Main-belt region · rocky population",
    accentColor: "#b79b79",
    tagline: "A broad orbital population, not a packed ring of rubble.",
    overview:
      "The main asteroid belt occupies the space between Mars and Jupiter. It contains a large population of rocky and metallic remnants, but the distances between individual objects are immense compared with their size. Helios treats the belt as spatial context while reserving individual paths for selected worlds.",
    metadataDescription:
      "Explore the main asteroid belt as a sparse, structured population between Mars and Jupiter, with sourced boundaries and explicit visual limits.",
    metricTitle: "The boundaries and rules of the belt",
    metrics: [
      {
        label: "Location",
        value: "Between Mars and Jupiter",
      },
      {
        label: "Explore context span",
        value: "2.05–3.35 AU",
        note: "A visual policy range, not a catalogue cutoff for every asteroid family.",
      },
      {
        label: "Featured worlds",
        value: "4",
        note: "Ceres, Vesta, Pallas and Hygiea receive individual pages and orbits.",
      },
      {
        label: "Context particles",
        value: "1,050",
        note: "A stable visual sample, not a census of known asteroids.",
      },
      {
        label: "Spatial form",
        value: "Annular belt",
      },
      {
        label: "Individual orbit policy",
        value: "Featured bodies only",
      },
    ],
    sections: [
      {
        eyebrow: "Density",
        title: "Mostly empty space",
        body: "The familiar image of a hazardous wall of rocks is misleading. Even inside the main belt, objects are separated by distances that make accidental close passes uncommon. The visual layer increases readability without presenting the particles as physically crowded.",
      },
      {
        eyebrow: "Structure",
        title: "A population shaped by resonance",
        body: "Jupiter's gravity helps organise the belt. Resonances create depleted zones and divide the population into families with different inclinations and eccentricities. Explore suggests this structure through layered distributions rather than drawing an orbit for every point.",
      },
      {
        eyebrow: "Selection behavior",
        title: "Context stays light; worlds stay inspectable",
        body: "Background particles carry no identity, detail route or individual orbit. Ceres, Vesta, Pallas and Hygiea remain selectable objects with sourced geometry, mean elements and their own editorial pages.",
      },
    ],
    sourceLinks: [
      {
        label: "NASA Asteroid Facts",
        href: "https://science.nasa.gov/solar-system/asteroids/facts/",
      },
      {
        label: "JPL Small-Body Database API",
        href: "https://ssd-api.jpl.nasa.gov/doc/sbdb.html",
      },
    ],
    related: [
      { id: "ceres", context: "Largest world in the main belt" },
      { id: "vesta", context: "Differentiated protoplanetary remnant" },
      { id: "pallas", context: "Highly inclined main-belt world" },
      { id: "hygiea", context: "Large dark outer-belt body" },
    ],
    representationLabel: "Regional context layer",
    representationNote:
      "Explore uses a repeatable annular sample between the documented scene boundaries. Particle placement communicates density, inclination and broad gaps; it is not a live small-body catalogue or a collision simulation.",
    visualLabel: "Visual representation",
    visualValue: "Layered annular ribbon",
    visualNote:
      "The belt uses three particle strata and a low-opacity macro envelope. Point size and density are increased for legibility in both scene profiles.",
    visualKind: "belt",
  },
  "kuiper-belt": {
    kindLabel: "Trans-Neptunian region · icy population",
    accentColor: "#7fa3bd",
    tagline: "A cold, broad frontier beyond Neptune rather than a thin ring.",
    overview:
      "The Kuiper Belt is a doughnut-shaped region of icy bodies beyond Neptune. Classical, resonant and scattered populations overlap across a large volume, so Helios presents it as a thick outer-system context layer instead of a single circular track.",
    metadataDescription:
      "Explore the Kuiper Belt as a broad, layered population beyond Neptune, with featured worlds, sourced context and an explicit explanation of scale.",
    metricTitle: "The scale and populations of the outer belt",
    metrics: [
      {
        label: "Inner reference",
        value: "Beyond Neptune",
      },
      {
        label: "Explore context span",
        value: "30–72 AU",
        note: "The visible layer includes broad Kuiper and scattered-disk context.",
      },
      {
        label: "Featured primary worlds",
        value: "8",
        note: "Pluto, Eris, Haumea, Makemake, Quaoar, Gonggong, Sedna and Orcus.",
      },
      {
        label: "Featured satellites",
        value: "8",
        note: "Selected companions are modelled inside their parent systems.",
      },
      {
        label: "Context particles",
        value: "820",
        note: "A representative render population, not a discovered-object count.",
      },
      {
        label: "Spatial form",
        value: "Thick volumetric belt",
      },
    ],
    sections: [
      {
        eyebrow: "Population",
        title: "Several orbital families share one frontier",
        body: "The Kuiper region is not dynamically uniform. Classical objects, resonant bodies and more eccentric scattered objects occupy different paths. The scene separates these broad populations through stable visual strata and inclination ranges.",
      },
      {
        eyebrow: "Preservation",
        title: "Cold remnants of early Solar System history",
        body: "Low temperatures allowed volatile-rich and icy material to persist far from the Sun. Individual worlds still show very different surfaces, densities, satellites and ring systems, which is why the featured catalogue remains separate from the background field.",
      },
      {
        eyebrow: "Scale boundary",
        title: "Readable context without claiming a hard edge",
        body: "The 30–72 AU scene span is a presentation boundary. Real trans-Neptunian populations overlap and extend beyond a single neat limit, while detached objects such as Sedna require their own individual orbital treatment.",
      },
    ],
    sourceLinks: [
      {
        label: "NASA Kuiper Belt Facts",
        href: "https://science.nasa.gov/solar-system/kuiper-belt/facts/",
      },
      {
        label: "JPL Small-Body Database API",
        href: "https://ssd-api.jpl.nasa.gov/doc/sbdb.html",
      },
    ],
    related: [
      { id: "pluto", context: "Explored Kuiper Belt dwarf planet" },
      { id: "eris", context: "Massive scattered-disk dwarf planet" },
      { id: "haumea", context: "Fast-rotating ringed dwarf planet" },
      { id: "makemake", context: "Bright classical Kuiper Belt world" },
    ],
    representationLabel: "Regional context layer",
    representationNote:
      "Explore combines classical, resonant and scattered populations inside a bounded visual volume. It does not imply that every point is a known object or that the Kuiper Belt ends sharply at the rendered edge.",
    visualLabel: "Visual representation",
    visualValue: "Volumetric population belt",
    visualNote:
      "Three particle strata and a faint macro envelope communicate thickness, inclination and outer-system scale while keeping featured bodies readable.",
    visualKind: "belt",
  },
  "oort-cloud": {
    kindLabel: "Inferred outer reservoir · comet source",
    accentColor: "#8fb0cd",
    tagline:
      "A theorised shell so distant that the Sun becomes one star among many.",
    overview:
      "The Oort Cloud is an inferred, extremely distant reservoir of icy bodies surrounding the planetary system. No spacecraft has imaged the cloud as a whole; its existence and structure are inferred primarily from the orbits of long-period comets.",
    metadataDescription:
      "Read the Oort Cloud as an inferred distant comet reservoir, with NASA edge ranges and a clearly labelled compressed visual representation.",
    metricTitle: "What is estimated, inferred and compressed",
    metrics: [
      {
        label: "Estimated inner edge",
        value: "2,000–5,000 AU",
        note: "NASA reference range; not a measured solid boundary.",
      },
      {
        label: "Estimated outer edge",
        value: "10,000–100,000 AU",
        note: "NASA reference range; the inferred boundary remains uncertain.",
      },
      {
        label: "Geometry",
        value: "Roughly spherical shell",
      },
      {
        label: "Evidence basis",
        value: "Long-period comet orbits",
      },
      {
        label: "Direct global image",
        value: "None",
      },
      {
        label: "Context particles",
        value: "1,650",
        note: "A stable schematic sample.",
      },
      {
        label: "Scene scale",
        value: "Strongly compressed",
      },
    ],
    sections: [
      {
        eyebrow: "Evidence",
        title: "A region reconstructed from visitors",
        body: "Long-period comets arrive from many directions and follow extremely extended paths. Their orbital distribution supports the idea of a distant, approximately spherical source reservoir, but it does not provide a photographed map of individual Oort Cloud objects.",
      },
      {
        eyebrow: "Distance",
        title: "The planetary system occupies only the centre",
        body: "At Oort Cloud distances, the familiar orbits of the planets collapse into a tiny central structure. A literal shared scale would make both navigation and comparison unusable, so Explore compresses this region while keeping the scientific range explicit on the page.",
      },
      {
        eyebrow: "Representation",
        title: "An inferred shell, not a luminous bubble",
        body: "The visible cloud is a restrained diagram made of sparse inner, outer and anchor populations. Brightness, opacity and particle size are interface choices; the actual bodies would be small, dark and extraordinarily far apart.",
      },
    ],
    sourceLinks: [
      {
        label: "NASA Oort Cloud Facts",
        href: "https://science.nasa.gov/solar-system/oort-cloud/facts/",
      },
      {
        label: "NASA Oort Cloud overview",
        href: "https://science.nasa.gov/solar-system/oort-cloud/",
      },
    ],
    related: [
      { id: "halley", context: "Periodic comet with an outer-system history" },
      { id: "hale-bopp", context: "Long-period comet" },
      { id: "neowise", context: "Long-period comet observed in 2020" },
      {
        id: "heliosphere",
        context: "Solar influence inside the distant reservoir",
      },
    ],
    representationLabel: "Inferred schematic context",
    representationNote:
      "Explore uses a compressed shell whose rendered radius is chosen for framing and performance. The page preserves the much larger scientific distance range and labels the population as inferred.",
    visualLabel: "Visual representation",
    visualValue: "Sparse distant shell",
    visualNote:
      "Inner, outer and anchor strata make the shell readable only when selected. Their opacity does not represent measured density or emitted light.",
    visualKind: "cloud",
  },
  heliosphere: {
    kindLabel: "Solar-wind domain · dynamic boundary",
    accentColor: "#69b8df",
    tagline:
      "The moving boundary where the Sun's outflow meets interstellar space.",
    overview:
      "The heliosphere is the vast region shaped by the solar wind and the Sun's magnetic influence. Its boundary is not a rigid sphere: solar activity, direction and the surrounding interstellar medium all affect where the solar wind slows and where solar and interstellar pressures balance.",
    metadataDescription:
      "Explore the heliosphere as a dynamic solar-wind boundary, with Voyager-era guide distances and an explicit schematic representation.",
    metricTitle: "The layers of a changing solar boundary",
    metrics: [
      {
        label: "Shaped by",
        value: "Solar wind",
      },
      {
        label: "Inner scene guide",
        value: "Termination shock · 84 AU",
        note: "A schematic anchor used for Explore framing, not a fixed universal distance.",
      },
      {
        label: "Outer scene guide",
        value: "Heliopause · 121 AU",
        note: "A schematic anchor; Voyager crossings differed by direction and time.",
      },
      {
        label: "Between the guides",
        value: "Heliosheath",
      },
      {
        label: "Boundary character",
        value: "Dynamic and asymmetric",
      },
      {
        label: "Direct crossings",
        value: "Voyager 1 and 2",
      },
    ],
    sections: [
      {
        eyebrow: "Flow",
        title: "The Sun fills space with moving plasma",
        body: "Charged particles stream outward as the solar wind. Far from the Sun, that flow slows abruptly at the termination shock and continues through the heliosheath before reaching the heliopause.",
      },
      {
        eyebrow: "Boundary",
        title: "There is no single permanent radius",
        body: "The heliopause marks pressure balance between solar and interstellar environments, but its location changes. Voyager measurements are direct crossings along two trajectories, not a complete three-dimensional outline of the boundary at every moment.",
      },
      {
        eyebrow: "Scene representation",
        title: "Two guide surfaces and directional flow",
        body: "Explore renders a termination-shock guide, a heliopause guide and sparse radial particles. The shapes communicate nested regions and solar-wind direction; they do not claim a current measured global form.",
      },
    ],
    sourceLinks: [
      {
        label: "NASA Components of the Heliosphere",
        href: "https://science.nasa.gov/learn/heat/resource/components-of-the-heliosphere/",
      },
      {
        label: "NASA Voyager 1 mission",
        href: "https://science.nasa.gov/mission/voyager/voyager-1/",
      },
      {
        label: "NASA Voyager 2 mission",
        href: "https://science.nasa.gov/mission/voyager/voyager-2/",
      },
    ],
    related: [
      { id: "sun", context: "Source of the solar wind" },
      {
        id: "oort-cloud",
        context: "Much more distant inferred comet reservoir",
      },
      { id: "neptune", context: "Outermost planet in the catalogue" },
      { id: "sedna", context: "Detached world on a much larger solar orbit" },
    ],
    representationLabel: "Schematic dynamic boundary",
    representationNote:
      "The termination-shock and heliopause radii are stable scene anchors derived from representative Voyager-era context. They are not a claim that the real heliosphere is spherical, static or identical in every direction.",
    visualLabel: "Visual representation",
    visualValue: "Nested boundary guides",
    visualNote:
      "Two translucent guide surfaces and a sparse solar-wind flow layer communicate structure. Their opacity and smoothness are presentation choices, not measured plasma density.",
    visualKind: "boundary",
  },
} as const satisfies Record<SystemRegionId, RegionEditorialCopy>;
