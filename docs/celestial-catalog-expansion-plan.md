# Helios celestial catalogue expansion plan

Date: 2026-07-18  
Status: Post-MVP implementation contract; the shared selection foundation and
clickable Sun are included in the current Block C repair package.

## Product outcome

Helios will grow beyond the eight planets without presenting an unreadable or
scientifically ambiguous scene. The catalogue will cover:

- the Sun;
- every moon in the pinned authoritative catalogue release for each planet;
- recognised dwarf planets;
- dwarf-planet candidates, explicitly labelled as candidates;
- confirmed exoplanets and exoplanet candidates in a separate distance-scale
  experience;
- the Kuiper Belt as a statistical visual population plus individually
  catalogued Kuiper Belt objects.

Catalogue status is never implied by appearance. A candidate cannot be styled
or described as confirmed, and a procedural texture cannot be described as an
observation.

## Non-negotiable interaction contract

Every catalogue body rendered by Helios must be selectable in two equivalent
ways:

1. direct pointer or touch selection in the 3D scene;
2. a real keyboard-accessible DOM control outside Canvas.

A selection must provide a stable object ID, guided camera focus, a crisp label,
a semantic summary region, classification/status, source metadata and Escape/
Overview focus restoration. The Sun uses this contract in the current package;
future moons, dwarf planets, candidates, exoplanets and named Kuiper Belt
objects must reuse it rather than introduce body-specific camera state.

The anonymous particles used to communicate Kuiper Belt density are a visual
population, not catalogue records, and therefore are not individually
clickable. Every named/catalogued Kuiper Belt object is clickable.

## Delivery slices

### E1 — Catalogue and shared body registry

- Replace planet-only presentation types with a discriminated celestial-body
  record while keeping existing planet routes stable.
- Version the source snapshot and preserve provider timestamps/status.
- Add searchable, virtualised DOM navigation grouped by body class and parent.
- Make the shared selection, hover, focus, label and summary contract mandatory.

### E2 — Planetary moon systems

- Import the complete pinned moon catalogue, grouped by parent planet.
- Render the selected planet's moon system on demand with distance/radius scale
  disclosures.
- Use LOD and lazy textures so the full catalogue remains navigable without
  mounting every high-resolution mesh at once.
- Give every moon a clickable locator even when no sourced surface map exists;
  missing imagery uses an explicitly procedural fallback.

### E3 — Dwarf planets, candidates and Kuiper Belt

- Add recognised dwarf planets and a separately labelled candidate collection.
- Add named major Kuiper Belt objects as individual catalogue bodies.
- Add a seeded statistical belt layer with a legend that explains that its
  particles are representative rather than a one-to-one object catalogue.

### E4 — Exoplanet atlas

- Keep interstellar distances out of the Solar System scene's linear scale.
- Add a searchable atlas with confirmed/candidate filters and provider status.
- Focus a system first, then its planets; every displayed star and planet remains
  keyboard, pointer and touch selectable.
- Use representative rendering when an observed surface map does not exist.

## Data and visual source policy

Orbital/identity records must enter through versioned adapters for primary or
authoritative catalogues such as NASA/JPL Horizons and Small-Body Database,
IAU/MPC records and the NASA Exoplanet Archive. Provider terminology and
classification are preserved. Visual assets require a source ID, source URL,
licence, representation type, dimensions and fallback description before they
can ship.

## Acceptance gate

- Every catalogue body has both Canvas and DOM selection coverage.
- Mouse, touch, keyboard, Escape and focus restoration pass E2E.
- Candidate/confirmed and observed/simulated states are visible and testable.
- Large catalogues use search/virtualisation and do not create one React state
  update per frame.
- Low, medium and high quality retain meaningful GPU, memory and transfer
  budgets.
- Mobile layouts never require horizontal scrolling to reach body navigation.
- The full existing planet experience, sourced time model and stale/fallback
  semantics remain regression-tested.
