/**
 * Single source of truth for user-facing UI copy.
 *
 * Language decision (docs/decisions.md — "Dil stratejisi"):
 * - The product ships in English by default; Turkish is added before the MVP
 *   release is complete.
 * - Phase 1 intentionally does NOT include a translation system or a language
 *   switcher. What it does guarantee is that no UI string is hard-coded inside
 *   components, so the future locale pass only needs to touch this module (and
 *   the Phase 2+ content model, which carries its own localized fields).
 *
 * This module is plain data — safe to import from server and client components.
 */

export const uiStrings = {
  site: {
    name: "Helios",
    tagline:
      "An interactive Solar System explorer that turns scientific data into a cinematic, personal experience.",
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
    line: "Helios is a portfolio project in early development. Scientific honesty and data transparency are core goals — the Data page will document every source and its freshness.",
  },
  placeholder: {
    label: "Under construction",
  },
  pages: {
    home: {
      intro:
        "Helios sets out to answer questions like \u201cwhat would my weight feel like on Mars?\u201d \u2014 not just \u201cwhat is Mars\u2019 diameter?\u201d. It pairs a cinematic 3D scene with honest scale modes, sourced reference data and clearly labelled NASA integrations.",
      status:
        "Current status: Phase 1 \u2014 project foundation. The 3D exploration scene, planet pages, comparison tools and NASA data integrations arrive in later phases. Nothing on this site pretends to work before it does.",
      cta: "Explore the system",
    },
    explore: {
      title: "Explore",
      description:
        "The interactive 3D Solar System — selectable planets, cinematic camera, time controls and honest scale modes.",
      placeholder:
        "The 3D exploration experience will be built here in Phases 3\u20135. A semantic, keyboard-friendly planet list will accompany the canvas from the start.",
    },
    compare: {
      title: "Compare",
      description:
        "Side-by-side planet comparison with proportional visuals and shareable links.",
      placeholder:
        "Planet-to-planet comparison (diameter, gravity, day length, your weight, and more) is planned for Phase 8.",
    },
    data: {
      title: "Data",
      description:
        "How Helios handles data sources, freshness labels and scientific limits.",
      placeholder:
        "This page will document every data source, the freshness taxonomy (reference / historical / latest-available / near-live / live) and the scientific limits of Helios, as real data lands in Phases 2 and 7.",
    },
    about: {
      title: "About",
      description: "What Helios is and why it exists.",
      placeholder:
        "The story behind the project — goals, non-goals and the people/tools involved — is written in Phase 11.",
    },
    caseStudy: {
      title: "Case study",
      description:
        "Architecture decisions, scale problems, performance work and honest limitations.",
      placeholder:
        "The full case study — decisions, mistakes, measurements and trade-offs — is assembled in Phase 11, from the decision records kept throughout development.",
    },
    planet: {
      descriptionFor: (name: string): string =>
        `${name} in Helios \u2014 planet detail page (in development).`,
      placeholderFor: (name: string): string =>
        `The reference data and editorial page for ${name} arrive with Phase 2 (sourced domain model) and Phase 6 (planet detail pages). No scientific values are shown until they are sourced and verified.`,
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
