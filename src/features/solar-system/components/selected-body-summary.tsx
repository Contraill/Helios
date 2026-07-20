"use client";

import Link from "next/link";
import { useMemo } from "react";

import {
  DWARF_SATELLITE_BY_ID,
  isDwarfSatelliteId,
} from "@/features/solar-system/lib/dwarf-satellite-catalogue";
import {
  EXTENDED_BODY_BY_ID,
  isExtendedBodyId,
} from "@/features/solar-system/lib/extended-system";
import {
  representationLabel,
  representationTypeAt,
} from "@/features/solar-system/lib/celestial-representation";
import { visualProfileFor } from "@/features/solar-system/lib/celestial-visual-registry";
import { createCelestialRegistry } from "@/features/solar-system/lib/celestial-registry";
import type { ExplorePlanetSummary } from "@/features/solar-system/lib/explore-planets";
import {
  MOON_BY_ID,
  isMoonId,
} from "@/features/solar-system/lib/moon-catalogue";
import type { SceneSun } from "@/features/solar-system/lib/scene-sun";
import type { CelestialBodyId } from "@/features/solar-system/types/celestial-body";
import { planetEphemerisRepresentation } from "@/lib/data/ephemeris/models";
import { exploreSceneCopy } from "@/lib/i18n/explore-scene-copy";
import { useEphemerisStore } from "@/stores/ephemeris-store";
import { useExplorationStore } from "@/stores/exploration-store";
import { useSimulationStore } from "@/stores/simulation-store";

import gateStyles from "./explore-scene-gate.module.css";

interface SelectedBodySummaryProps {
  onCloseSelection?: (bodyId: CelestialBodyId) => void;
  planetSummaries: readonly ExplorePlanetSummary[];
  sceneSun: SceneSun;
}

export function SelectedBodySummary({
  onCloseSelection,
  planetSummaries,
  sceneSun,
}: SelectedBodySummaryProps) {
  const selectedBodyId = useExplorationStore((state) => state.selectedBodyId);
  const clearSelection = useExplorationStore((state) => state.clearSelection);
  const ephemerisBundle = useEphemerisStore((state) => state.bundle);
  const simulationAtMs = useSimulationStore((state) => state.simulationAtMs);
  const registry = useMemo(
    () => createCelestialRegistry(planetSummaries, sceneSun),
    [planetSummaries, sceneSun],
  );
  const selectedMetadata = selectedBodyId
    ? registry.get(selectedBodyId)
    : undefined;
  const close = () => {
    if (selectedBodyId && onCloseSelection) onCloseSelection(selectedBodyId);
    else clearSelection();
  };

  if (!selectedBodyId || !selectedMetadata) {
    return (
      <section className={gateStyles.emptySummary} aria-live="polite">
        <p className={gateStyles.eyebrow}>
          {exploreSceneCopy.summary.selection}
        </p>
        <h2>{exploreSceneCopy.summary.overviewTitle}</h2>
        <p>{exploreSceneCopy.summary.overviewBody}</p>
      </section>
    );
  }

  if (selectedBodyId === "sun") {
    return (
      <section className={gateStyles.summary} aria-live="polite">
        <SummaryHeader
          closeLabel={exploreSceneCopy.summary.closeOverview}
          eyebrow={exploreSceneCopy.labels.star}
          name={selectedMetadata.displayName}
          onClose={close}
        />
        <p>{selectedMetadata.summary.description}</p>
        <dl className={gateStyles.metrics}>
          <div>
            <dt>{exploreSceneCopy.summary.sceneRole}</dt>
            <dd>{exploreSceneCopy.summary.systemOrigin}</dd>
          </div>
          <div>
            <dt>{exploreSceneCopy.summary.positionMethod}</dt>
            <dd>{selectedMetadata.summary.representationLabel}</dd>
          </div>
        </dl>
      </section>
    );
  }

  if (isMoonId(selectedBodyId)) {
    const moon = MOON_BY_ID[selectedBodyId];
    const parent = registry.get(moon.parentPlanetId);
    const type = representationTypeAt(moon.representation, simulationAtMs);
    return (
      <section className={gateStyles.summary} aria-live="polite">
        <SummaryHeader
          closeLabel={exploreSceneCopy.summary.closeMoon}
          eyebrow={exploreSceneCopy.summary.featuredMoon}
          name={selectedMetadata.displayName}
          onClose={close}
        />
        <p>
          {exploreSceneCopy.registry.moonDescription(
            parent?.displayName ??
              exploreSceneCopy.registry.parentPlanetNames[moon.parentPlanetId],
          )}
        </p>
        <dl className={gateStyles.metrics}>
          <div>
            <dt>{exploreSceneCopy.summary.meanRadius}</dt>
            <dd>{moon.meanRadiusKm.toLocaleString("en-US")} km</dd>
          </div>
          <div>
            <dt>{exploreSceneCopy.summary.orbitalPeriod}</dt>
            <dd>{moon.orbitalPeriodDays.toLocaleString("en-US")} days</dd>
          </div>
          <div>
            <dt>{exploreSceneCopy.summary.representation}</dt>
            <dd>{representationLabel(type)}</dd>
          </div>
          <div>
            <dt>{exploreSceneCopy.summary.referenceFrame}</dt>
            <dd>{moon.representation.referencePlane}</dd>
          </div>
          <div>
            <dt>{exploreSceneCopy.summary.visual}</dt>
            <dd>{visualProfileFor(moon.id).surface.representation}</dd>
          </div>
        </dl>
        <p className={gateStyles.methodNote}>
          {exploreSceneCopy.summary.featuredSetNote}
        </p>
      </section>
    );
  }

  if (isDwarfSatelliteId(selectedBodyId)) {
    const moon = DWARF_SATELLITE_BY_ID[selectedBodyId];
    const type = representationTypeAt(moon.representation, simulationAtMs);
    const visual = visualProfileFor(moon.id);
    return (
      <section className={gateStyles.summary} aria-live="polite">
        <SummaryHeader
          closeLabel={exploreSceneCopy.summary.closeMoon}
          eyebrow="dwarf-system satellite"
          name={selectedMetadata.displayName}
          onClose={close}
        />
        <p>{selectedMetadata.summary.description}</p>
        <dl className={gateStyles.metrics}>
          <div><dt>Mean radius</dt><dd>{moon.meanRadiusKm.toLocaleString("en-US")} km</dd></div>
          <div><dt>Orbital period</dt><dd>{moon.orbitalPeriodDays.toLocaleString("en-US")} days</dd></div>
          <div><dt>Representation</dt><dd>{representationLabel(type)}</dd></div>
          <div><dt>Visual</dt><dd>{visual.surface.representation}</dd></div>
          <div><dt>Provider</dt><dd>{moon.representation.provider}</dd></div>
        </dl>
        <p className={gateStyles.methodNote}>{moon.representation.precisionNote}</p>
      </section>
    );
  }

  const planet = planetSummaries.find(({ id }) => id === selectedBodyId);
  if (planet) {
    const representation = planetEphemerisRepresentation(
      ephemerisBundle,
      planet.id,
      simulationAtMs,
    );
    return (
      <section className={gateStyles.summary} aria-live="polite">
        <SummaryHeader
          closeLabel={exploreSceneCopy.summary.closeOverview}
          eyebrow={exploreSceneCopy.summary.planetEyebrow(planet.orderFromSun)}
          name={selectedMetadata.displayName}
          onClose={close}
        />
        <p>{selectedMetadata.summary.description}</p>
        <dl className={gateStyles.metrics}>
          <div>
            <dt>{exploreSceneCopy.summary.gravity}</dt>
            <dd>{planet.gravityMS2.toFixed(1)} m/s²</dd>
          </div>
          <div>
            <dt>{exploreSceneCopy.summary.year}</dt>
            <dd>
              {planet.orbitalPeriodEarthDays.toLocaleString("en-US")}{" "}
              {exploreSceneCopy.summary.earthDays}
            </dd>
          </div>
          <div>
            <dt>{exploreSceneCopy.summary.knownMoons}</dt>
            <dd>
              {planet.moonCount} · {exploreSceneCopy.summary.asOf}{" "}
              {planet.moonCountAsOf}
            </dd>
          </div>
          <div>
            <dt>{exploreSceneCopy.summary.positionMethod}</dt>
            <dd>{representationLabel(representation.representationType)}</dd>
          </div>
          <div>
            <dt>{exploreSceneCopy.summary.referenceFrame}</dt>
            <dd>{representation.referencePlane}</dd>
          </div>
        </dl>
        <p className={gateStyles.methodNote}>{representation.precisionNote}</p>
        <Link className={gateStyles.detailLink} href={`/planet/${planet.id}`}>
          {exploreSceneCopy.summary.openPlanetDetail(planet.name)}
        </Link>
      </section>
    );
  }

  if (isExtendedBodyId(selectedBodyId)) {
    const body = EXTENDED_BODY_BY_ID[selectedBodyId];
    const type = representationTypeAt(body.representation, simulationAtMs);
    return (
      <section className={gateStyles.summary} aria-live="polite">
        <SummaryHeader
          closeLabel={exploreSceneCopy.summary.closeOverview}
          eyebrow={selectedMetadata.kind.replaceAll("-", " ")}
          name={selectedMetadata.displayName}
          onClose={close}
        />
        <p>{selectedMetadata.summary.description}</p>
        <dl className={gateStyles.metrics}>
          <div>
            <dt>{exploreSceneCopy.summary.semiMajorAxis}</dt>
            <dd>{body.semiMajorAxisAu} AU</dd>
          </div>
          <div>
            <dt>{exploreSceneCopy.summary.positionMethod}</dt>
            <dd>{representationLabel(type)}</dd>
          </div>
          <div>
            <dt>{exploreSceneCopy.summary.referenceFrame}</dt>
            <dd>{body.representation.referencePlane}</dd>
          </div>
          <div>
            <dt>{exploreSceneCopy.summary.provider}</dt>
            <dd>{body.representation.provider}</dd>
          </div>
          <div>
            <dt>{exploreSceneCopy.summary.visual}</dt>
            <dd>{visualProfileFor(body.id).surface.representation}</dd>
          </div>
        </dl>
        <p className={gateStyles.methodNote}>
          {body.representation.precisionNote}
        </p>
        <Link className={gateStyles.detailLink} href={`/object/${body.id}`}>
          {exploreSceneCopy.summary.openObjectEditorial(body.name)}
        </Link>
      </section>
    );
  }

  return (
    <section className={gateStyles.summary} aria-live="polite">
      <SummaryHeader
        closeLabel={exploreSceneCopy.summary.closeOverview}
        eyebrow={exploreSceneCopy.summary.regionType}
        name={selectedMetadata.displayName}
        onClose={close}
      />
      <p>{selectedMetadata.summary.description}</p>
      <p className={gateStyles.methodNote}>
        {selectedMetadata.summary.representationLabel}
      </p>
    </section>
  );
}

function SummaryHeader({
  closeLabel,
  eyebrow,
  name,
  onClose,
}: {
  closeLabel: string;
  eyebrow: string;
  name: string;
  onClose: () => void;
}) {
  return (
    <header className={gateStyles.summaryHeader}>
      <div>
        <p className={gateStyles.eyebrow}>{eyebrow}</p>
        <h2>{name}</h2>
      </div>
      <button aria-label={closeLabel} onClick={onClose} type="button">
        ×
      </button>
    </header>
  );
}
