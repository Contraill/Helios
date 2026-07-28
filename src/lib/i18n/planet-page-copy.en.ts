/** English copy for the eight custom planet compositions. */
export const planetPageEnglishCopy = {
  referenceDataReady: "Reference data verified",
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
    missionSource: "Mission source",
    ledger: {
      axialTilt: "Axial tilt",
      recognizedMoons: "Recognized moons",
      rings: "Rings",
      atmosphere: "Atmosphere",
    },
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
} as const;
