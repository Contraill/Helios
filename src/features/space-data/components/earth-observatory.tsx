"use client";

import { useMemo, useState } from "react";

import type {
  DonkiEvent,
  EonetCategory,
  EonetEvent,
  EpicRecord,
  GibsLayer,
  NearEarthApproach,
} from "@/lib/data/external/models";
import type {
  ExternalMetadata,
  ExternalDataStatus,
} from "@/lib/data/external/types";
import type { Locale } from "@/lib/i18n/locale";
import { localeTag } from "@/lib/i18n/locale";
import { spaceDataCopy } from "@/lib/i18n/space-data-copy";

import { DataState } from "./data-state";
import { RemoteMedia } from "./remote-media";
import styles from "./space-data.module.css";

interface Feed<T> {
  readonly data: readonly T[];
  readonly metadata: ExternalMetadata;
  readonly status: ExternalDataStatus;
}

export function EarthObservatory({
  locale = "en",
  epic,
  eonet,
  gibs,
  donki,
  nearEarth,
}: {
  readonly locale?: Locale;
  readonly epic: Feed<EpicRecord>;
  readonly eonet: Feed<EonetEvent>;
  readonly gibs: Feed<GibsLayer>;
  readonly donki: Feed<DonkiEvent>;
  readonly nearEarth: Feed<NearEarthApproach>;
}) {
  const copy = spaceDataCopy[locale].earth;
  const categoryLabels = spaceDataCopy[locale].categories;
  const [category, setCategory] = useState<EonetCategory | "all">("all");
  const events = useMemo(
    () =>
      category === "all"
        ? eonet.data
        : eonet.data.filter((event) => event.category === category),
    [category, eonet.data],
  );
  const earth = epic.data[0];
  const approach = nearEarth.data[0];
  return (
    <div className={styles.observatory}>
      <section
        className={styles.observatoryLead}
        aria-labelledby="earth-now-heading"
      >
        <div className={styles.observatoryMedia}>
          <RemoteMedia
            alt={copy.imageAlt}
            fallbackLabel={copy.imageFallback}
            src={earth?.imageUrl}
          />
        </div>
        <div>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h2 id="earth-now-heading">{copy.title}</h2>
          <p>{copy.intro}</p>
          {earth ? (
            <dl className={styles.miniLedger}>
              <div>
                <dt>{copy.capture}</dt>
                <dd>{formatDate(earth.capturedAt, locale)}</dd>
              </div>
              <div>
                <dt>{copy.color}</dt>
                <dd>
                  {earth.type === "natural" ? copy.natural : copy.enhanced}
                </dd>
              </div>
              <div>
                <dt>{copy.centroid}</dt>
                <dd>
                  {earth.centroid.latitude.toFixed(1)}°,{" "}
                  {earth.centroid.longitude.toFixed(1)}°
                </dd>
              </div>
            </dl>
          ) : (
            <p className={styles.empty}>{copy.noEpic}</p>
          )}
          <DataState compact metadata={epic.metadata} status={epic.status} />
        </div>
      </section>

      <section className={styles.eventSection} aria-labelledby="events-heading">
        <header>
          <p className={styles.eyebrow}>{copy.eventsEyebrow}</p>
          <h3 id="events-heading">{copy.eventsTitle}</h3>
        </header>
        <label className={styles.filterLabel}>
          {copy.category}
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as EonetCategory | "all")
            }
          >
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        {events.length ? (
          <ul className={styles.eventList}>
            {events.slice(0, 8).map((event) => (
              <li data-eonet-category={event.category} key={event.id}>
                <span>{categoryLabels[event.category]}</span>
                <strong>{event.title}</strong>
                <time dateTime={event.observedAt}>
                  {formatDate(event.observedAt, locale)}
                </time>
                <small>
                  {event.status} · {event.geometryType} ·{" "}
                  {event.coordinates[1].toFixed(2)}°,{" "}
                  {event.coordinates[0].toFixed(2)}°
                </small>
                <a
                  aria-label={copy.eventSourceLabel(event.title)}
                  href={event.sourceUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {copy.eventSource} <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>{copy.noEvents}</p>
        )}
        <DataState compact metadata={eonet.metadata} status={eonet.status} />
      </section>

      <section className={styles.layerSection} aria-labelledby="layers-heading">
        <header>
          <p className={styles.eyebrow}>{copy.layersEyebrow}</p>
          <h3 id="layers-heading">{copy.layersTitle}</h3>
        </header>
        <div className={styles.layerGrid}>
          {gibs.data.map((layer) => (
            <article key={layer.id}>
              <RemoteMedia
                alt={layer.title}
                fallbackLabel={copy.layerFallback}
                src={layer.imageUrl}
              />
              <h4>{layer.title}</h4>
              <p>
                {layer.instrument} · {layer.colorMode}
              </p>
              <time dateTime={layer.observedAt}>{layer.observedAt}</time>
              <small>{layer.latencyNote}</small>
              <code>{layer.id}</code>
            </article>
          ))}
        </div>
        <DataState compact metadata={gibs.metadata} status={gibs.status} />
      </section>

      <section
        className={styles.spaceEnvironment}
        aria-labelledby="space-environment-heading"
      >
        <div>
          <p className={styles.eyebrow}>{copy.environmentEyebrow}</p>
          <h3 id="space-environment-heading">{copy.environmentTitle}</h3>
          <p>{copy.environmentIntro}</p>
          {donki.data.length ? (
            <ol>
              {donki.data.slice(0, 4).map((event) => (
                <li key={event.id}>
                  <strong>{event.eventType}</strong> · {event.title}{" "}
                  <time dateTime={event.startAt}>
                    {formatDate(event.startAt, locale)}
                  </time>
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.empty}>{copy.noSpaceWeather}</p>
          )}
          <DataState compact metadata={donki.metadata} status={donki.status} />
          {donki.metadata.failedEndpoints?.length ? (
            <p className={styles.contextNote}>
              {copy.failedFamilies}: {donki.metadata.failedEndpoints.join(", ")}
              . {copy.remainingCurrent}
            </p>
          ) : null}
        </div>
        <div className={styles.approachCard}>
          <p className={styles.eyebrow}>{copy.nearEarth}</p>
          {approach ? (
            <>
              <h4>{approach.name}</h4>
              <p>
                {Math.round(approach.missDistanceKm).toLocaleString(
                  localeTag(locale),
                )}{" "}
                {copy.missDistance}
              </p>
              <p>
                {Math.round(approach.relativeVelocityKph).toLocaleString(
                  localeTag(locale),
                )}{" "}
                {copy.velocity}
              </p>
            </>
          ) : (
            <p className={styles.empty}>{copy.noApproach}</p>
          )}
          {approach?.potentiallyHazardous ? (
            <p className={styles.contextNote}>
              <strong>{copy.hazardousTitle}</strong> {copy.hazardousBody}
            </p>
          ) : null}
          <DataState
            compact
            metadata={nearEarth.metadata}
            status={nearEarth.status}
          />
        </div>
      </section>
    </div>
  );
}

function formatDate(value: string, locale: Locale): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(localeTag(locale), {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
      }).format(date);
}
