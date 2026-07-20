import type { CelestialNavigatorCategory } from "@/features/solar-system/types/celestial-navigation";
import type { ExploreDockPanel } from "@/stores/explore-scene-ui-store";

export const exploreSceneCopy = Object.freeze({
  dock: {
    label: "Explore scene controls",
    tabsLabel: "Explore panels",
    mobileOpen: (panel: string) => `${panel} · Open controls`,
    mobileClose: "Close Explore controls",
    mobileEyebrow: "Explore controls",
    mobileSelectionLabel: "Info",
    panelLabels: {
      selection: "Selection",
      navigator: "Navigator",
      view: "View",
      time: "Time",
    } satisfies Readonly<Record<ExploreDockPanel, string>>,
  },
  navigator: {
    label: "Celestial navigator",
    eyebrow: "Browse by category",
    back: "← Back",
    categories: {
      "sun-planets": {
        label: "Sun & planets",
        description: "The central star and eight planets.",
      },
      "planetary-moons": {
        label: "Planetary moons",
        description: "Choose a parent planet, then a featured major moon.",
      },
      "main-belt": {
        label: "Main-belt worlds",
        description: "Ceres and selected large main-belt bodies.",
      },
      "dwarf-kuiper": {
        label: "Dwarf & Kuiper worlds",
        description: "Selected trans-Neptunian and dwarf worlds.",
      },
      comets: {
        label: "Comets",
        description: "All modelled comets and their orbit previews.",
      },
      "regions-context": {
        label: "Regions & context",
        description: "Belts, dust, heliosphere and schematic outer context.",
      },
    } satisfies Readonly<
      Record<CelestialNavigatorCategory, { label: string; description: string }>
    >,
    featuredMoons: "Featured major moons",
    openMoons: (planet: string) => `Open featured moons of ${planet}`,
    moonShortcut: "Moons",
    dustContext: "Zodiacal dust & meteor context",
    featuredMoonCount: (count: number) => `${count} featured major moons`,
    context: {
      beltDensity: "Belt density",
      representation: "Representation",
      densityLabels: {
        sparse: "Sparse",
        standard: "Standard",
        detailed: "Detailed",
      },
      representationLabels: {
        physical: "Physical",
        cinematic: "Cinematic",
      },
    },
  },
  registry: {
    parentPlanetNames: {
      earth: "Earth",
      mars: "Mars",
      jupiter: "Jupiter",
      saturn: "Saturn",
      uranus: "Uranus",
      neptune: "Neptune",
    },
    moonDescription: (parent: string) =>
      `${parent} system · calculated for the shared simulation time from published orbital elements.`,
    extendedRepresentation: "Calculated for simulation time",
    planetRepresentation: "JPL Horizons ephemeris",
    moonRepresentative: "Representative orbit preview",
    moonHorizons: "JPL Horizons ephemeris",
    sunDescription: "The central reference body for the heliocentric scene.",
    sunRepresentation: "Heliocentric reference",
    regions: {
      "asteroid-belt": {
        displayName: "Asteroid belt",
        description:
          "A regional particle population; individual background particles do not receive orbit lines.",
        representation: "Regional context",
      },
      "kuiper-belt": {
        displayName: "Kuiper belt",
        description:
          "A distant population region shown as context rather than thousands of selectable orbit meshes.",
        representation: "Regional context",
      },
      "oort-cloud": {
        displayName: "Oort cloud",
        description:
          "A schematic, inferred outer reservoir. Its particle shell is not a live census.",
        representation: "Schematic regional context",
      },
      heliosphere: {
        displayName: "Heliosphere",
        description:
          "A contextual solar-wind boundary representation, not a solid surface.",
        representation: "Regional context",
      },
    },
  },
  summary: {
    selection: "Selection",
    overviewTitle: "Solar System overview",
    overviewBody:
      "Choose a category, then a body. The scene keeps only low-emphasis spatial anchors outside the active category.",
    closeOverview: "Return to overview",
    closeMoon: "Close moon summary",
    featuredMoon: "Featured major moon",
    featuredSetNote:
      "This is a featured set, not a claim that every known moon is modelled.",
    representativeOrbit: "Representative orbit preview",
    proceduralVisual: "Procedural reference visual",
    calculatedForTime: "Calculated for simulation time",
    publishedElements: "Published orbital elements",
    regionType: "Region & context",
    sceneRole: "Scene role",
    systemOrigin: "System origin",
    positionMethod: "Position method",
    meanRadius: "Mean radius",
    orbitalPeriod: "Orbital period",
    representation: "Representation",
    visual: "Visual",
    gravity: "Gravity",
    year: "Year",
    earthDays: "Earth days",
    knownMoons: "Known moons",
    asOf: "as of",
    sourceBasis: "Source basis",
    provider: "Provider",
    referenceFrame: "Reference frame",
    precisionNote: "Usage note",
    semiMajorAxis: "Semi-major axis",
    openPlanetDetail: (planet: string) => `Open ${planet} detail`,
    openObjectEditorial: (body: string) => `Open ${body} editorial page`,
    planetEyebrow: (order: number) => `Planet ${order}`,
  },
  labels: {
    star: "Star",
    selectedStar: "Selected star",
    moonRepresentative: "FEATURED MAJOR MOON · REPRESENTATIVE ORBIT",
  },
  ephemeris: {
    controlsLabel: "Simulation time controls",
    preparing: "Preparing current UTC…",
    label: "Horizons ephemeris · TDB",
    dateTime: "UTC date and time",
    apply: "Apply",
    now: "Now",
    copyLink: "Copy link",
    copied: "Copied",
    paused: "The simulation is paused.",
    pause: "Pause simulation",
    resume: "Resume simulation",
    speed: "Simulation advance per real second",
    resetNow: "Return to now",
    editingDraft: "Draft date is not applied until you choose Apply.",
    approximatePreview: "Approximate preview",
    computedVector: "JPL computed vector",
    barycenterVector: "JPL barycenter vector",
    verifiedFallback: "Verified JPL fallback",
    computing: "Computing positions…",
    previousRetained: "Previous solution retained",
    maximumReached: "Maximum supported date reached",
    minimumReached: "Minimum supported date reached",
    requestFailed: "The requested ephemeris could not be loaded.",
    chooseInsideRange: "Choose a UTC date inside the supported session range.",
    rangeError: (minimum: string, maximum: string) =>
      `Choose a UTC date from ${minimum} through ${maximum}.`,
    generalDate: (offset: number) =>
      `General date · ${offset > 0 ? "+" : ""}${offset} years from session start`,
    timelinePast: "Past",
    timelineNow: "Now",
    timelineFuture: "Future",
    approximateDescription: (observed: string) =>
      `Approximate local osculating preview from vector epoch ${observed} TDB. Pause or release the scrubber to request the exact date.`,
    vectorDescription: (
      observed: string,
      retrieved: string,
      barycenters: readonly string[],
    ) =>
      `Vector epoch ${observed} TDB. Retrieved ${retrieved} UTC.${
        barycenters.length
          ? ` Long-range Horizons barycenters: ${barycenters.join(", ")}.`
          : ""
      }`,
    method:
      "Sun-centred geometric vectors · Ecliptic J2000 / ICRF · AU. Exact dates use JPL Horizons; accelerated playback and active scrubbing are explicitly labelled osculating-orbit previews.",
  },
});
