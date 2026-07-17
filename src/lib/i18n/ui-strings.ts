/** Shared UI copy. Planet content carries its own EN/TR fields. */
export const uiStrings = {
  site: {
    name: "Helios",
    tagline:
      "An interactive Solar System explorer built around scale, place and perspective.",
  },
  a11y: {
    skipToContent: "Skip to main content",
    mainNavLabel: "Main navigation",
  },
  nav: {
    explore: "Explore",
    compare: "Compare",
    data: "Data",
    about: "About",
    caseStudy: "Case study",
  },
  footer: {
    line: "A portfolio project by İzzet Can Öztozlu. Sources and scientific limits are documented throughout the project.",
  },
  placeholder: {
    label: "In development",
  },
  pages: {
    home: {
      intro:
        "Helios connects planetary science to human scale: your weight on Mars, the length of a day on Venus, or the time sunlight needs to reach Neptune.",
      status:
        "The sourced planet catalog now drives a lightweight 3D overview. Camera focus and selection arrive in the next interaction phase.",
      cta: "Explore the system",
    },
    explore: {
      title: "Explore",
      description:
        "A moving overview of the Sun and eight planets, built from the sourced Helios catalog.",
      eyebrow: "Solar System overview",
      scaleNotice:
        "Exploration scale enlarges planets and compresses distances so the full system remains legible. It is not a true-scale astronomical view.",
      sceneLabel:
        "Animated exploration-scale model of the Sun and the eight planets",
      loading: "Preparing the Solar System",
      fallbackTitle: "The 3D view is unavailable",
      fallbackBody:
        "The planet list and reference pages remain available without WebGL.",
      planetListLabel: "Planets ordered from the Sun",
      returnToOverview: "Overview",
      returnToOverviewLabel: "Return to the Solar System overview",
      keyboardHint:
        "Use Tab to reach a planet, Enter to focus, and Escape to return.",
      gravityLabel: "Gravity",
      yearLabel: "Orbital year",
      lightLabel: "Sunlight travel",
      openPlanetPage: (name: string): string =>
        `Open the ${name} reference page`,
      cameraStatus: (
        name: string | undefined,
        mode: "overview" | "transition" | "focus",
      ): string => {
        if (!name) {
          return mode === "transition"
            ? "Returning to the Solar System overview."
            : "Solar System overview.";
        }
        return mode === "focus"
          ? `${name} is in focus.`
          : `Moving toward ${name}.`;
      },
      motionPaused: "Motion is paused because reduced motion is enabled.",
    },
    compare: {
      title: "Compare",
      description:
        "Compare two worlds through size, gravity, time, atmosphere and personal measurements.",
      placeholder:
        "The comparison view will follow the core exploration and planet-detail work.",
    },
    data: {
      title: "Data",
      description:
        "Sources, freshness labels, scale transforms and the limits of each dataset.",
      placeholder:
        "The source registry is active. This page will expose it through a readable methodology view.",
    },
    about: {
      title: "About",
      description:
        "Why Helios exists and how its constraints shape the product.",
      placeholder:
        "The project story will be published with the first complete release.",
    },
    caseStudy: {
      title: "Case study",
      description:
        "Design decisions, engineering trade-offs, measurements and known limits.",
      placeholder:
        "The case study is assembled from decision records and measured development results.",
    },
    planet: {
      referenceDataReady: "Reference data verified",
      placeholderFor: (name: string): string =>
        `${name} is connected to the validated planet catalog. Its full editorial page and personal calculations are scheduled for the planet-detail phase.`,
      backToExplore: "Back to Explore",
    },
    notFound: {
      title: "Page not found",
      body: "This page does not exist.",
      backHome: "Back to the home page",
    },
    error: {
      title: "Something went wrong",
      body: "An unexpected error occurred while rendering this page.",
      retry: "Try again",
    },
  },
} as const;
