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
  dataPresentation: {
    accessed: "Accessed",
    sources: "Sources and provenance",
    freshness: {
      live: "Live",
      "near-live": "Near-live",
      "latest-available": "Latest available",
      historical: "Historical",
      reference: "Reference",
    },
  },
  pages: {
    home: {
      intro:
        "Helios connects planetary science to human scale: your weight on Mars, the length of a day on Venus, or the time sunlight needs to reach Neptune.",
      status:
        "The sourced planet catalog now drives an interactive 3D system with camera focus, simulation speed, scale modes and persistent viewing preferences.",
      cta: "Explore the system",
    },
    explore: {
      title: "Explore",
      description:
        "A moving overview of the Sun and eight planets, built from the sourced Helios catalog.",
      eyebrow: "Solar System overview",
      scaleNotice:
        "Exploration scale enlarges planets and compresses distances so the full system remains legible. It is not a true-scale astronomical view.",
      sceneLabel: (
        scaleMode: "exploration" | "scientific",
        reducedMotion: boolean,
      ): string => {
        const motion = reducedMotion ? "Static" : "Animated";
        const scale =
          scaleMode === "scientific" ? "scientific-scale" : "exploration-scale";
        return `${motion} ${scale} model of the Sun and the eight planets`;
      },
      loading: "Preparing the Solar System",
      fallbackTitle: "The 3D view is unavailable",
      fallbackBody:
        "The planet list and reference pages remain available without WebGL.",
      planetListLabel: "Planets ordered from the Sun",
      returnToOverview: "Overview",
      returnToOverviewLabel: "Return to the Solar System overview",
      keyboardHint:
        "Drag or touch the scene to control the camera. Use Tab and Enter to focus a planet; Escape returns to guided view.",
      freeCameraHint:
        "Free camera: drag or touch to orbit, wheel or pinch to zoom, arrow keys to pan, and Escape to return to guided view.",
      planetSummaryType: (kind: string, order: number): string => {
        const kinds: Record<string, string> = {
          "gas-giant": "Gas giant",
          "ice-giant": "Ice giant",
          terrestrial: "Terrestrial",
        };
        return `${kinds[kind] ?? kind.replaceAll("-", " ")} · planet ${order}`;
      },
      formatGravity: (value: string): string => `${value} m/s²`,
      formatEarthDays: (value: string): string => `${value} Earth days`,
      formatMinutes: (value: string): string => `${value} min`,
      scientificMarkerCaption: "",
      scientificSelectedMarkerCaption: "Selected locator · not body size",
      scaleNotices: {
        exploration:
          "Exploration scale · bodies enlarged and distance compressed",
        scientific:
          "Scientific positions · locator discs identify worlds, not body size",
      },
      gravityLabel: "Gravity",
      yearLabel: "Orbital year",
      lightLabel: "Sunlight travel",
      openPlanetPage: (name: string): string =>
        `Open the ${name} reference page`,
      cameraStatus: (
        name: string | undefined,
        mode: "overview" | "transition" | "focus" | "free",
      ): string => {
        if (mode === "free") {
          return name
            ? `Free camera around ${name}.`
            : "Free camera around the Solar System.";
        }
        if (!name) {
          return mode === "transition"
            ? "Returning to the Solar System overview."
            : "Solar System overview.";
        }
        return mode === "focus"
          ? `${name} is in focus.`
          : `Moving toward ${name}.`;
      },
      motionPaused:
        "Continuous motion is paused by the current motion preference.",
      controls: {
        label: "Simulation controls",
        eyebrow: "System state",
        pause: "Pause",
        resume: "Resume",
        reset: "Reset",
        collapseControls: "Collapse simulation controls",
        openControls: "Open controls",
        compactStatus: (
          paused: boolean,
          speed: string,
          scale: string,
        ): string => `${paused ? "Paused" : speed} · ${scale}`,
        speed: "Simulation advance per real second",
        scale: "Scale model",
        scene: "Scene layers",
        orbits: "Orbit paths",
        labels: "Planet labels",
        quality: "Render quality",
        motion: "Motion",
        camera: "Camera",
        freeCamera: "Free",
        guidedCamera: "Guided",
        resetView: "Reset view",
        scaleOptions: {
          exploration: "Explore",
          scientific: "Scientific",
        },
        qualityOptions: {
          low: "Low",
          medium: "Medium",
          high: "High",
        },
        motionOptions: {
          system: "System",
          reduced: "Reduced",
          standard: "Standard",
        },
        scaleDescriptions: {
          exploration:
            "Exploration scale enlarges bodies and compresses distance for legibility. It is intentionally not to scale.",
          scientific:
            "Scientific scale uses one shared ratio for radii and distance. Colored locator discs preserve planet identity and mark position only; they do not represent physical size.",
        },
      },
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
      detail: {
        backToExplore: "Return to the system",
        jumpToHumanScale: "Human scale",
        jumpToSources: "Method and sources",
        heroNavigation: (name: string): string => `${name} page shortcuts`,
        heroMeta: {
          order: "Order from Sun",
          kind: "World type",
        },
        kindLabels: {
          terrestrial: "Terrestrial",
          "gas-giant": "Gas giant",
          "ice-giant": "Ice giant",
        },
        metrics: {
          radius: "Mean radius",
          solarDay: "Solar day",
          temperature: "Temperature reference",
          temperatureContexts: {
            surface: "Global surface reference, not local weather",
            "cloud-top": "Cloud-top reference, not solid ground",
            "reference-level": "Atmospheric reference level, not a surface",
            "not-applicable": "No single physical surface definition",
          },
        },
        sections: {
          humanEyebrow: "Personal comparison",
          humanTitle: "Put the numbers against your own body",
          humanLede:
            "Gravity, day length and sunlight delay become more understandable when related to an Earth reference.",
          signalsEyebrow: "Reference signals",
          signalsTitle: "The conditions that define this world",
          missionsEyebrow: "Exploration record",
          missionsTitle: "How we learned to read this planet",
          missionsLede:
            "Mission summaries are tied to dated official records and are not presented as live telemetry.",
          methodologyEyebrow: "Scientific limits",
          methodologyTitle: "What these values do—and do not—describe",
          methodologyLede:
            "Reference values keep their definition, source and date context. Editorial diagrams are separated from measured planetary data.",
        },
        methodologyLabel: "Methodology and limits",
        adjacentPlanets: "Adjacent planets",
        previousPlanet: "Previous world",
        nextPlanet: "Next world",
        missionSource: "Mission source",
        humanScale: {
          eyebrow: "Your Earth reference",
          inputLabel: "Earth scale reading",
          inputHelp: "Use a value from 0 to 1,000 kilograms.",
          inputError: "Enter a number from 0 to 1,000.",
          resultLabel: (name: string): string => `${name} scale equivalent`,
          resultExplanation:
            "This is an Earth-style scale equivalent. Your mass does not change, and a giant-planet value refers to a defined atmospheric level rather than a place to stand.",
          gravityLabel: "Earth gravity",
          gravityNotes: {
            "surface-equatorial": "surface-reference ratio",
            "one-bar-reference-level": "one-bar reference ratio",
          },
          dayLabel: "Solar-day difference",
          dayNote: "compared with 24 hours",
          lightLabel: "Sunlight travel",
          lightNote: "average orbital distance",
        },
      },
      mars: {
        backToExplore: "Return to the system",
        jumpToHumanScale: "Human scale",
        jumpToSources: "Method and sources",
        heroNavigation: "Mars page shortcuts",
        editorialVisualLabel:
          "Editorial visual interpretation of Mars with orbital annotations",
        heroMeta: {
          order: "Order from Sun",
          kind: "World type",
        },
        kindLabels: {
          terrestrial: "Terrestrial",
          "gas-giant": "Gas giant",
          "ice-giant": "Ice giant",
        },
        metrics: {
          radius: "Mean radius",
          radiusContext: "About half Earth’s diameter",
          solarDay: "Solar day",
          dayContext: "Only about forty minutes beyond Earth",
          temperature: "Mean surface reference",
          temperatureContext: "A planetary mean, not local weather",
        },
        sections: {
          portraitEyebrow: "Planet portrait",
          portraitTitle: "Familiar rhythms, alien conditions",
          portraitLede:
            "Mars is close enough to invite comparison and different enough to expose where intuition fails.",
          humanEyebrow: "Personal comparison",
          humanTitle: "Put the numbers against your own body",
          humanLede:
            "Gravity, day length and sunlight delay become more understandable when they are related to an Earth reference.",
          environmentEyebrow: "Reference signals",
          environmentTitle: "Three numbers that change the whole experience",
          methodologyEyebrow: "Scientific limits",
          methodologyTitle: "What these values do—and do not—describe",
          methodologyLede:
            "Every displayed value keeps its source, definition and date context. Reference values are not presented as observations happening now.",
        },
        facts: {
          gravityEyebrow: "Gravity",
          gravityTitle: "Your mass stays; the scale reading changes",
          gravityBody: (percent: string): string =>
            `Mars surface gravity is about ${percent}% of the Earth reference used by Helios. The result is a scale-reading comparison, not a change in mass.`,
          yearEyebrow: "Year",
          yearTitle: "One orbit, hundreds of local days",
          yearBody: (earthDays: string, localDays: string): string =>
            `A Martian year lasts about ${earthDays} Earth days, or roughly ${localDays} Martian solar days using the reference day length.`,
          moonsEyebrow: "Moons",
          moonsTitle: "Two small companions",
          moonsBody: (count: number, asOf: string): string =>
            `Mars has ${count} recognized moons—Phobos and Deimos. The catalog snapshot is dated ${asOf}.`,
          undated: "date not recorded",
        },
        methodologyLabel: "Methodology and limits",
        adjacentPlanets: "Adjacent planets",
        previousPlanet: "Previous world",
        nextPlanet: "Next world",
        humanScale: {
          eyebrow: "Your Earth reference",
          title: "What would the scale read on Mars?",
          body: "Enter an Earth scale reading. The calculation applies the ratio between Mars surface gravity and standard Earth gravity; your mass does not change.",
          inputLabel: "Earth scale reading",
          inputHelp: "Use a value from 0 to 1,000 kilograms.",
          inputError: "Enter a number from 0 to 1,000.",
          resultLabel: "Mars scale equivalent",
          resultExplanation:
            "This is an Earth-style scale equivalent. It is not a medical or body-mass calculation.",
          gravityLabel: "Earth gravity",
          gravityNote: "surface-reference ratio",
          dayLabel: "Extra per solar day",
          dayNote: "compared with 24 hours",
          lightLabel: "Sunlight travel",
          lightNote: "average orbital distance",
        },
      },
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
