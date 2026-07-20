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

import { DataState } from "./data-state";
import { RemoteMedia } from "./remote-media";
import styles from "./space-data.module.css";

const categoryLabels: Record<EonetCategory | "all", string> = {
  all: "All selected events",
  wildfires: "Wildfires",
  severeStorms: "Severe storms",
  volcanoes: "Volcanoes",
  floods: "Floods",
  seaLakeIce: "Sea and lake ice",
  dustHaze: "Dust and haze",
};

interface Feed<T> {
  readonly data: readonly T[];
  readonly metadata: ExternalMetadata;
  readonly status: ExternalDataStatus;
}

export function EarthObservatory({
  epic,
  eonet,
  gibs,
  donki,
  nearEarth,
}: {
  readonly epic: Feed<EpicRecord>;
  readonly eonet: Feed<EonetEvent>;
  readonly gibs: Feed<GibsLayer>;
  readonly donki: Feed<DonkiEvent>;
  readonly nearEarth: Feed<NearEarthApproach>;
}) {
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
            alt="Earth seen by DSCOVR EPIC"
            fallbackLabel="EPIC image unavailable"
            src={earth?.imageUrl}
          />
        </div>
        <div>
          <p className={styles.eyebrow}>Earth in observation</p>
          <h2 id="earth-now-heading">One planet, several clocks</h2>
          <p>
            EPIC sees the sunlit disk from DSCOVR. EONET gathers event records
            from contributing sources. GIBS serves dated imagery layers. Their
            timestamps are related, but they are not one synchronized camera.
          </p>
          {earth ? (
            <dl className={styles.miniLedger}>
              <div>
                <dt>Capture</dt>
                <dd>{formatDate(earth.capturedAt)}</dd>
              </div>
              <div>
                <dt>Color</dt>
                <dd>
                  {earth.type === "natural"
                    ? "Natural-color composite"
                    : "Enhanced color"}
                </dd>
              </div>
              <div>
                <dt>Centroid</dt>
                <dd>
                  {earth.centroid.latitude.toFixed(1)}°,{" "}
                  {earth.centroid.longitude.toFixed(1)}°
                </dd>
              </div>
            </dl>
          ) : (
            <p className={styles.empty}>No EPIC image is available.</p>
          )}
          <DataState compact metadata={epic.metadata} status={epic.status} />
        </div>
      </section>

      <section className={styles.eventSection} aria-labelledby="events-heading">
        <header>
          <p className={styles.eyebrow}>Natural events</p>
          <h3 id="events-heading">Read the event, then read its source</h3>
        </header>
        <label className={styles.filterLabel}>
          Category
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
                  {formatDate(event.observedAt)}
                </time>
                <small>
                  {event.status} · {event.geometryType} ·{" "}
                  {event.coordinates[1].toFixed(2)}°,{" "}
                  {event.coordinates[0].toFixed(2)}°
                </small>
                <a href={event.sourceUrl} rel="noreferrer" target="_blank">
                  Event source
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>
            No events match this category in the current record.
          </p>
        )}
        <DataState compact metadata={eonet.metadata} status={eonet.status} />
      </section>

      <section className={styles.layerSection} aria-labelledby="layers-heading">
        <header>
          <p className={styles.eyebrow}>Earthdata layers</p>
          <h3 id="layers-heading">Curated imagery, not a layer catalogue</h3>
        </header>
        <div className={styles.layerGrid}>
          {gibs.data.map((layer) => (
            <article key={layer.id}>
              <RemoteMedia
                alt={layer.title}
                fallbackLabel="GIBS layer preview unavailable"
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
          <p className={styles.eyebrow}>Space environment</p>
          <h3 id="space-environment-heading">
            The Sun does not stop at the sky
          </h3>
          <p>
            DONKI records are kept as separate observations unless official
            activity IDs prove a relationship.
          </p>
          {donki.data.length ? (
            <ol>
              {donki.data.slice(0, 4).map((event) => (
                <li key={event.id}>
                  <strong>{event.eventType}</strong> · {event.title}{" "}
                  <time dateTime={event.startAt}>
                    {formatDate(event.startAt)}
                  </time>
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.empty}>No space-weather event is available.</p>
          )}
          <DataState compact metadata={donki.metadata} status={donki.status} />
          {donki.metadata.failedEndpoints?.length ? (
            <p className={styles.contextNote}>
              Unavailable DONKI families:{" "}
              {donki.metadata.failedEndpoints.join(", ")}. Other event families
              remain current.
            </p>
          ) : null}
        </div>
        <div className={styles.approachCard}>
          <p className={styles.eyebrow}>Near-Earth space</p>
          {approach ? (
            <>
              <h4>{approach.name}</h4>
              <p>
                {Math.round(approach.missDistanceKm).toLocaleString()} km miss
                distance
              </p>
              <p>
                {Math.round(approach.relativeVelocityKph).toLocaleString()} km/h
                relative velocity
              </p>
            </>
          ) : (
            <p className={styles.empty}>No close approach is available.</p>
          )}
          {approach?.potentiallyHazardous ? (
            <p className={styles.contextNote}>
              <strong>Potentially hazardous</strong> is an orbital
              classification. It is not a prediction that an object will strike
              Earth.
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

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
      }).format(date);
}
