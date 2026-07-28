"use client";

import { useMemo } from "react";
import Link from "next/link";

import {
  DWARF_SATELLITE_BY_ID,
  isDwarfSatelliteId,
} from "@/features/solar-system/lib/dwarf-satellite-catalogue";
import {
  EXTENDED_BODY_BY_ID,
  isExtendedBodyId,
} from "@/features/solar-system/lib/extended-system";
import { representationTypeAt } from "@/features/solar-system/lib/celestial-representation";
import { celestialDetailHref } from "@/features/solar-system/lib/celestial-detail-routes";
import { createCelestialRegistry } from "@/features/solar-system/lib/celestial-registry";
import { regionVisualProfileFor } from "@/features/solar-system/lib/region-visual-policy";
import { sceneProfileFor } from "@/features/solar-system/lib/scene-profiles";
import {
  effectiveBodyVisibility,
  effectiveBodyVisibilityReason,
} from "@/features/solar-system/lib/scene-visibility-policy";
import type { ExplorePlanetSummary } from "@/features/solar-system/lib/explore-planets";
import {
  MOON_BY_ID,
  isMoonId,
} from "@/features/solar-system/lib/moon-catalogue";
import type { SceneSun } from "@/features/solar-system/lib/scene-sun";
import {
  isSystemRegionIdValue,
  type CelestialBodyId,
} from "@/features/solar-system/types/celestial-body";
import { planetEphemerisRepresentation } from "@/lib/data/ephemeris/models";
import { getExploreSceneCopy } from "@/lib/i18n/explore-scene-copy";
import { useLocaleStore } from "@/stores/locale-store";
import { useEphemerisStore } from "@/stores/ephemeris-store";
import { useExplorationStore } from "@/stores/exploration-store";
import { useSimulationStore } from "@/stores/simulation-store";
import { useSceneVisibilityStore } from "@/stores/scene-visibility-store";

import controlStyles from "./explore-scene-controls.module.css";

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
  const locale = useLocaleStore((state) => state.locale);
  const copy = getExploreSceneCopy(locale);
  const numberLocale = locale === "tr" ? "tr-TR" : "en-US";
  const selectedBodyId = useExplorationStore((state) => state.selectedBodyId);
  const scaleMode = useExplorationStore((state) => state.scaleMode);
  const clearSelection = useExplorationStore((state) => state.clearSelection);
  const ephemerisBundle = useEphemerisStore((state) => state.bundle);
  const simulationAtMs = useSimulationStore((state) => state.simulationAtMs);
  const registry = useMemo(
    () => createCelestialRegistry(planetSummaries, sceneSun, locale),
    [locale, planetSummaries, sceneSun],
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
      <section className={controlStyles.emptySummary}>
        <p className={controlStyles.eyebrow}>{copy.summary.selection}</p>
        <h2>{copy.summary.overviewTitle}</h2>
        <p>{copy.summary.overviewBody}</p>
      </section>
    );
  }

  if (selectedBodyId === "sun") {
    return (
      <section className={controlStyles.summary}>
        <SummaryHeader
          closeLabel={copy.summary.closeOverview}
          eyebrow={copy.labels.star}
          name={selectedMetadata.displayName}
          onClose={close}
        />
        <p>{selectedMetadata.summary.description}</p>
        <dl className={controlStyles.metrics}>
          <div>
            <dt>{copy.summary.sceneRole}</dt>
            <dd>{copy.summary.systemOrigin}</dd>
          </div>
          <div>
            <dt>{copy.summary.positionMethod}</dt>
            <dd>{selectedMetadata.summary.representationLabel}</dd>
          </div>
        </dl>
        <DetailLink
          bodyId={selectedBodyId}
          label={copy.summary.openSunDetail}
        />
      </section>
    );
  }

  if (isMoonId(selectedBodyId)) {
    const moon = MOON_BY_ID[selectedBodyId];
    const parent = registry.get(moon.parentPlanetId);
    const type = representationTypeAt(moon.representation, simulationAtMs);
    return (
      <section className={controlStyles.summary}>
        <SummaryHeader
          closeLabel={copy.summary.closeMoon}
          eyebrow={copy.summary.featuredMoon}
          name={selectedMetadata.displayName}
          onClose={close}
        />
        <p>
          {copy.registry.moonDescription(
            parent?.displayName ??
              copy.registry.parentPlanetNames[moon.parentPlanetId],
          )}
        </p>
        <dl className={controlStyles.metrics}>
          <div>
            <dt>{copy.summary.meanRadius}</dt>
            <dd>{moon.meanRadiusKm.toLocaleString(numberLocale)} km</dd>
          </div>
          <div>
            <dt>{copy.summary.orbitalPeriod}</dt>
            <dd>
              {moon.orbitalPeriodDays.toLocaleString(numberLocale)}{" "}
              {copy.summary.days}
            </dd>
          </div>
          <div>
            <dt>{copy.summary.representation}</dt>
            <dd>{copy.summary.representationLabels[type]}</dd>
          </div>
          <div>
            <dt>{copy.summary.referenceFrame}</dt>
            <dd>{moon.representation.referencePlane}</dd>
          </div>
          <div>
            <dt>{copy.summary.visual}</dt>
            <dd>{copy.summary.proceduralVisual}</dd>
          </div>
        </dl>
        <p className={controlStyles.methodNote}>
          {copy.summary.featuredSetNote}
        </p>
        <p className={controlStyles.methodNote}>
          {copy.summary.proceduralVisualNote}
        </p>
        <DetailLink
          bodyId={selectedBodyId}
          label={copy.summary.openBodyDetail(selectedMetadata.displayName)}
        />
      </section>
    );
  }

  if (isDwarfSatelliteId(selectedBodyId)) {
    const moon = DWARF_SATELLITE_BY_ID[selectedBodyId];
    const type = representationTypeAt(moon.representation, simulationAtMs);
    return (
      <section className={controlStyles.summary}>
        <SummaryHeader
          closeLabel={copy.summary.closeMoon}
          eyebrow={copy.summary.dwarfSatellite}
          name={selectedMetadata.displayName}
          onClose={close}
        />
        <p>{selectedMetadata.summary.description}</p>
        <dl className={controlStyles.metrics}>
          <div>
            <dt>{copy.summary.meanRadius}</dt>
            <dd>{moon.meanRadiusKm.toLocaleString(numberLocale)} km</dd>
          </div>
          <div>
            <dt>{copy.summary.orbitalPeriod}</dt>
            <dd>
              {moon.orbitalPeriodDays.toLocaleString(numberLocale)}{" "}
              {copy.summary.days}
            </dd>
          </div>
          <div>
            <dt>{copy.summary.representation}</dt>
            <dd>{copy.summary.representationLabels[type]}</dd>
          </div>
          <div>
            <dt>{copy.summary.visual}</dt>
            <dd>{copy.summary.proceduralVisual}</dd>
          </div>
          <div>
            <dt>{copy.summary.provider}</dt>
            <dd>{moon.representation.provider}</dd>
          </div>
        </dl>
        <p className={controlStyles.methodNote}>
          {copy.summary.representationNotes[type]}
        </p>
        <p className={controlStyles.methodNote}>
          {copy.summary.proceduralVisualNote}
        </p>
        <DetailLink
          bodyId={selectedBodyId}
          label={copy.summary.openBodyDetail(selectedMetadata.displayName)}
        />
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
      <section className={controlStyles.summary}>
        <SummaryHeader
          closeLabel={copy.summary.closeOverview}
          eyebrow={copy.summary.planetEyebrow(planet.orderFromSun)}
          name={selectedMetadata.displayName}
          onClose={close}
        />
        <p>{selectedMetadata.summary.description}</p>
        <dl className={controlStyles.metrics}>
          <div>
            <dt>{copy.summary.gravity}</dt>
            <dd>{planet.gravityMS2.toFixed(1)} m/s²</dd>
          </div>
          <div>
            <dt>{copy.summary.year}</dt>
            <dd>
              {planet.orbitalPeriodEarthDays.toLocaleString(numberLocale)}{" "}
              {copy.summary.earthDays}
            </dd>
          </div>
          <div>
            <dt>{copy.summary.knownMoons}</dt>
            <dd>
              {planet.moonCount} · {copy.summary.asOf} {planet.moonCountAsOf}
            </dd>
          </div>
          <div>
            <dt>{copy.summary.positionMethod}</dt>
            <dd>
              {
                copy.summary.representationLabels[
                  representation.representationType
                ]
              }
            </dd>
          </div>
          <div>
            <dt>{copy.summary.referenceFrame}</dt>
            <dd>{representation.referencePlane}</dd>
          </div>
        </dl>
        <p className={controlStyles.methodNote}>
          {copy.summary.representationNotes[representation.representationType]}
        </p>
        <DetailLink
          bodyId={planet.id}
          label={copy.summary.openPlanetDetail(selectedMetadata.displayName)}
        />
      </section>
    );
  }

  if (isExtendedBodyId(selectedBodyId)) {
    const body = EXTENDED_BODY_BY_ID[selectedBodyId];
    const type = representationTypeAt(body.representation, simulationAtMs);
    return (
      <section className={controlStyles.summary}>
        <SummaryHeader
          closeLabel={copy.summary.closeOverview}
          eyebrow={copy.summary.kindLabels[body.kind]}
          name={selectedMetadata.displayName}
          onClose={close}
        />
        <p>{selectedMetadata.summary.description}</p>
        <dl className={controlStyles.metrics}>
          <div>
            <dt>{copy.summary.semiMajorAxis}</dt>
            <dd>{body.semiMajorAxisAu} AU</dd>
          </div>
          <div>
            <dt>{copy.summary.positionMethod}</dt>
            <dd>{copy.summary.representationLabels[type]}</dd>
          </div>
          <div>
            <dt>{copy.summary.referenceFrame}</dt>
            <dd>{body.representation.referencePlane}</dd>
          </div>
          <div>
            <dt>{copy.summary.provider}</dt>
            <dd>{body.representation.provider}</dd>
          </div>
          <div>
            <dt>{copy.summary.visual}</dt>
            <dd>{copy.summary.proceduralVisual}</dd>
          </div>
        </dl>
        <p className={controlStyles.methodNote}>
          {copy.summary.representationNotes[type]}
        </p>
        <p className={controlStyles.methodNote}>
          {copy.summary.proceduralVisualNote}
        </p>
        <DetailLink
          bodyId={body.id}
          label={copy.summary.openObjectEditorial(selectedMetadata.displayName)}
        />
      </section>
    );
  }

  if (isSystemRegionIdValue(selectedBodyId)) {
    const regionProfile = regionVisualProfileFor(
      selectedBodyId,
      scaleMode,
      sceneProfileFor(scaleMode),
    );
    const heliosphereSelected = selectedBodyId === "heliosphere";
    return (
      <section className={controlStyles.summary}>
        <SummaryHeader
          closeLabel={copy.summary.closeOverview}
          eyebrow={
            heliosphereSelected
              ? copy.summary.heliosphereBoundary
              : copy.summary.regionType
          }
          name={selectedMetadata.displayName}
          onClose={close}
        />
        <p>{selectedMetadata.summary.description}</p>
        <dl className={controlStyles.metrics}>
          <div>
            <dt>{copy.summary.representation}</dt>
            <dd>
              {
                copy.summary.regionRepresentationLabels[
                  regionProfile.representation
                ]
              }
            </dd>
          </div>
          <div>
            <dt>{copy.summary.regionVisualModel}</dt>
            <dd>{copy.summary.regionKindLabels[regionProfile.kind]}</dd>
          </div>
        </dl>
        <p className={controlStyles.methodNote}>
          {heliosphereSelected
            ? copy.summary.heliosphereNote
            : selectedMetadata.summary.representationLabel}
        </p>
        <DetailLink
          bodyId={selectedBodyId}
          label={copy.summary.openRegionDetail(selectedMetadata.displayName)}
        />
      </section>
    );
  }

  return null;
}

function DetailLink({
  bodyId,
  label,
}: {
  readonly bodyId: CelestialBodyId;
  readonly label: string;
}) {
  const href = celestialDetailHref(bodyId);
  return (
    <Link className={controlStyles.detailLink} href={href}>
      {label}
    </Link>
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
  const locale = useLocaleStore((state) => state.locale);
  const copy = getExploreSceneCopy(locale);
  const bodyId = useExplorationStore((state) => state.selectedBodyId);
  const visible = useSceneVisibilityStore((state) =>
    bodyId ? effectiveBodyVisibility(bodyId, state) : true,
  );
  const reason = useSceneVisibilityStore((state) =>
    bodyId ? effectiveBodyVisibilityReason(bodyId, state) : "visible",
  );
  const hideObject = useSceneVisibilityStore((state) => state.hideObject);
  const showObject = useSceneVisibilityStore((state) => state.showObject);
  const visibilityNoun =
    bodyId && isSystemRegionIdValue(bodyId)
      ? copy.summary.visibility.layer
      : copy.summary.visibility.object;
  const statusLabels = copy.summary.visibility.statuses;

  return (
    <>
      <header className={controlStyles.summaryHeader}>
        <div>
          <p className={controlStyles.eyebrow}>{eyebrow}</p>
          <h2 data-selection-summary-heading tabIndex={-1}>
            {name}
          </h2>
        </div>
        <button aria-label={closeLabel} onClick={onClose} type="button">
          ×
        </button>
      </header>
      {bodyId ? (
        <div className={controlStyles.objectVisibilityAction}>
          <button
            onClick={() => (visible ? hideObject(bodyId) : showObject(bodyId))}
            type="button"
          >
            {visible
              ? copy.summary.visibility.hide(visibilityNoun)
              : copy.summary.visibility.show(visibilityNoun)}
          </button>
          <span className={controlStyles.objectVisibilityStatus} role="status">
            {statusLabels[reason]}
          </span>
        </div>
      ) : null}
    </>
  );
}
