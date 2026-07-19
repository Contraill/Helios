"use client";

import type { CSSProperties } from "react";
import Link from "next/link";

import styles from "@/app/explore/explore.module.css";
import {
  EXTENDED_BODIES,
  EXTENDED_BODY_BY_ID,
  isExtendedBodyId,
  type ExtendedBodyId,
  type SystemRegionId,
} from "@/features/solar-system/lib/extended-system";
import { useExplorationStore } from "@/stores/exploration-store";
import {
  useExtendedSystemStore,
  type BeltDensity,
  type BeltRepresentation,
} from "@/stores/extended-system-store";

const categories: readonly {
  label: string;
  ids: readonly ExtendedBodyId[];
}[] = [
  {
    label: "Main-belt worlds",
    ids: ["ceres", "vesta", "pallas", "hygiea"],
  },
  {
    label: "Dwarf & Kuiper worlds",
    ids: [
      "pluto",
      "eris",
      "haumea",
      "makemake",
      "quaoar",
      "gonggong",
      "sedna",
      "orcus",
    ],
  },
  {
    label: "Comets",
    ids: ["halley", "hale-bopp", "encke", "67p", "neowise", "tempel-1"],
  },
];

const regions: readonly { id: SystemRegionId; label: string }[] = [
  { id: "asteroid-belt", label: "Asteroid Belt" },
  { id: "kuiper-belt", label: "Kuiper Belt" },
  { id: "oort-cloud", label: "Oort Cloud" },
  { id: "heliosphere", label: "Heliosphere" },
];

const regionCopy: Record<
  SystemRegionId,
  { accent: string; type: string; tagline: string; description: string }
> = {
  "asteroid-belt": {
    accent: "#aa9a84",
    type: "Sparse small-body region",
    tagline: "A broad, mostly empty population between Mars and Jupiter.",
    description:
      "The visible particles are a sampled representation, not adjacent boulders. A spacecraft would normally cross enormous empty gaps and see no nearby asteroid.",
  },
  "kuiper-belt": {
    accent: "#8fb8d2",
    type: "Thick trans-Neptunian region",
    tagline:
      "An extended, inclined population beyond Neptune — not a thin ring.",
    description:
      "The cold and dynamically excited populations are combined into a broad torus-like distribution. Featured worlds remain individually selectable.",
  },
  "oort-cloud": {
    accent: "#7695b5",
    type: "Schematic · inferred region",
    tagline:
      "A remote, extremely sparse spherical reservoir inferred from comet orbits.",
    description:
      "Its existence and structure are not directly imaged. Scientific mode preserves the inner-cloud distance; the displayed sample is deliberately limited by the Milky Way zoom boundary.",
  },
  heliosphere: {
    accent: "#6caad2",
    type: "Solar-wind boundary context",
    tagline:
      "Solar wind, termination shock and heliopause shown as contextual layers.",
    description:
      "The shells mark representative boundaries rather than a fixed spherical wall. Parker Solar Probe samples the inner wind; Voyagers provide outer-boundary context. The CME cone is DONKI-style context, not a collision forecast.",
  },
};

export function ExtendedSelectionSummary() {
  const selectedBodyId = useExplorationStore((state) => state.selectedBodyId);
  const clearSelection = useExplorationStore((state) => state.clearSelection);
  const body =
    selectedBodyId && isExtendedBodyId(selectedBodyId)
      ? EXTENDED_BODY_BY_ID[selectedBodyId]
      : null;
  const region =
    selectedBodyId && selectedBodyId in regionCopy
      ? regionCopy[selectedBodyId as SystemRegionId]
      : null;
  if (!body && !region) return null;

  const accent = body?.color ?? region!.accent;
  const title =
    body?.name ?? regions.find(({ id }) => id === selectedBodyId)!.label;
  const type = body?.kind.replaceAll("-", " ") ?? region!.type;
  const tagline = body?.tagline ?? region!.tagline;
  const description = body?.description ?? region!.description;

  return (
    <section
      aria-live="polite"
      className={`${styles.summaryPanel} ${styles.extendedSummary}`}
      style={{ "--planet-accent": accent } as CSSProperties}
    >
      <div className={styles.summaryHeader}>
        <div>
          <p className={styles.summaryType}>{type}</p>
          <h2>{title}</h2>
        </div>
        <button
          aria-label="Return to system overview"
          className={styles.closeButton}
          onClick={clearSelection}
          type="button"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <p className={styles.summaryTagline}>{tagline}</p>
      <p className={styles.extendedDescription}>{description}</p>
      {body ? (
        <>
          <dl className={styles.summaryMetrics}>
            <div>
              <dt>Semi-major axis</dt>
              <dd>{body.semiMajorAxisAu.toLocaleString("en-GB")} AU</dd>
            </div>
            <div>
              <dt>Inclination</dt>
              <dd>{body.inclinationDeg.toFixed(2)}°</dd>
            </div>
            <div>
              <dt>Model</dt>
              <dd>Kepler preview</dd>
            </div>
          </dl>
          <Link className={styles.detailsLink} href={`/object/${body.id}`}>
            Open {body.name} editorial page
          </Link>
        </>
      ) : null}
    </section>
  );
}

export function ExtendedSystemControls() {
  const selectedBodyId = useExplorationStore((state) => state.selectedBodyId);
  const selectBody = useExplorationStore((state) => state.selectBody);
  const panelExpanded = useExtendedSystemStore((state) => state.panelExpanded);
  const togglePanel = useExtendedSystemStore((state) => state.togglePanel);
  const density = useExtendedSystemStore((state) => state.density);
  const setDensity = useExtendedSystemStore((state) => state.setDensity);
  const representation = useExtendedSystemStore(
    (state) => state.representation,
  );
  const setRepresentation = useExtendedSystemStore(
    (state) => state.setRepresentation,
  );
  const toggleLayer = useExtendedSystemStore((state) => state.toggleLayer);
  const layers = {
    asteroidBeltVisible: useExtendedSystemStore(
      (state) => state.asteroidBeltVisible,
    ),
    kuiperBeltVisible: useExtendedSystemStore(
      (state) => state.kuiperBeltVisible,
    ),
    cometsVisible: useExtendedSystemStore((state) => state.cometsVisible),
    oortCloudVisible: useExtendedSystemStore((state) => state.oortCloudVisible),
    dustVisible: useExtendedSystemStore((state) => state.dustVisible),
    heliosphereVisible: useExtendedSystemStore(
      (state) => state.heliosphereVisible,
    ),
  };

  return (
    <div className={styles.extendedControls}>
      <button
        aria-expanded={panelExpanded}
        className={styles.extendedToggle}
        onClick={togglePanel}
        type="button"
      >
        <span>Extended system</span>
        <span aria-hidden="true">{panelExpanded ? "−" : "+"}</span>
      </button>
      {panelExpanded ? (
        <div className={styles.extendedPanel}>
          <div className={styles.extendedRegionGrid}>
            {regions.map((region) => (
              <button
                aria-pressed={selectedBodyId === region.id}
                key={region.id}
                onClick={() => selectBody(region.id)}
                type="button"
              >
                {region.label}
              </button>
            ))}
          </div>

          <fieldset>
            <legend>Visible layers</legend>
            <div className={styles.extendedLayerGrid}>
              {(
                [
                  ["asteroidBeltVisible", "Asteroids"],
                  ["kuiperBeltVisible", "Kuiper"],
                  ["cometsVisible", "Comets"],
                  ["oortCloudVisible", "Oort"],
                  ["dustVisible", "Dust"],
                  ["heliosphereVisible", "Solar wind"],
                ] as const
              ).map(([layer, label]) => (
                <button
                  aria-pressed={layers[layer]}
                  key={layer}
                  onClick={() => toggleLayer(layer)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Density · representation</legend>
            <div className={styles.extendedLayerGrid}>
              {(["sparse", "standard", "detailed"] as BeltDensity[]).map(
                (value) => (
                  <button
                    aria-pressed={density === value}
                    key={value}
                    onClick={() => setDensity(value)}
                    type="button"
                  >
                    {value}
                  </button>
                ),
              )}
              {(["physical", "cinematic"] as BeltRepresentation[]).map(
                (value) => (
                  <button
                    aria-pressed={representation === value}
                    key={value}
                    onClick={() => setRepresentation(value)}
                    type="button"
                  >
                    {value}
                  </button>
                ),
              )}
            </div>
          </fieldset>

          <p className={styles.extendedNote}>
            Physical mode preserves sparse distributions. Cinematic mode
            increases only the visible sample and is explicitly non-literal.
          </p>

          {categories.map((category) => (
            <details key={category.label}>
              <summary>{category.label}</summary>
              <div className={styles.extendedBodyGrid}>
                {EXTENDED_BODIES.filter((body) =>
                  category.ids.includes(body.id),
                ).map((body) => (
                  <button
                    aria-pressed={selectedBodyId === body.id}
                    key={body.id}
                    onClick={() => selectBody(body.id)}
                    type="button"
                  >
                    {body.name}
                  </button>
                ))}
              </div>
            </details>
          ))}
        </div>
      ) : null}
    </div>
  );
}
