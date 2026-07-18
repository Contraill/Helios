import type { Metadata } from "next";

import { DataState } from "@/features/space-data/components/data-state";
import {
  loadApodArchive,
  loadCneosCad,
  loadDonki,
  loadEonet,
  loadEpic,
  loadFireballs,
  loadGibsLayers,
  loadInsight,
  loadNearEarth,
} from "@/lib/data/external/providers/space-data.server";

import styles from "./data.module.css";

export const metadata: Metadata = {
  title: "Data",
  description:
    "A dated, sourced view of solar activity, near-Earth space, Earth observation and the Mars archive.",
};

export const revalidate = 60;

export default async function DataPage() {
  const [apod, donki, neows, cad, epic, eonet, insight, fireballs] =
    await Promise.all([
      loadApodArchive(),
      loadDonki(),
      loadNearEarth(),
      loadCneosCad(),
      loadEpic(),
      loadEonet(),
      loadInsight(),
      loadFireballs(),
    ]);
  const gibs = loadGibsLayers();
  const approaches = cad.data?.length ? cad : neows;
  const services = [
    apod,
    donki,
    neows,
    cad,
    epic,
    eonet,
    gibs,
    insight,
    fireballs,
  ] as const;

  return (
    <article className={styles.page}>
      <header className={styles.hero}>
        <div>
          <p className={styles.kicker}>Observation, archive, reference</p>
          <h1>Data</h1>
        </div>
        <p>
          Helios keeps separate clocks separate. An observation time describes
          when an instrument or service recorded something. Retrieval time
          describes when Helios obtained the record. A fallback is identified as
          a fallback rather than quietly presented as current.
        </p>
      </header>

      <DataSection
        number="01"
        title="Solar activity"
        intro="DONKI records solar and geospace events. Helios shows a restrained timeline instead of exposing the provider's raw payload."
      >
        {donki.data?.length ? (
          <div className={styles.timeline}>
            {donki.data.slice(0, 8).map((event) => (
              <article key={event.id}>
                <span className={styles.eventType}>{event.eventType}</span>
                <strong>{event.title}</strong>
                <time dateTime={event.startAt}>
                  {formatDate(event.startAt)}
                </time>
                {event.classOrIntensity ? (
                  <small>{event.classOrIntensity}</small>
                ) : null}
                <a href={event.sourceUrl} rel="noreferrer" target="_blank">
                  Official event record
                </a>
              </article>
            ))}
          </div>
        ) : (
          <Empty />
        )}
        <DataState metadata={donki.metadata} status={donki.status} />
      </DataSection>

      <DataSection
        number="02"
        title="Near-Earth space"
        intro="NeoWs provides object properties. JPL CNEOS provides close-approach and historical fireball tables. The same approach is not duplicated as two competing cards."
      >
        {approaches.data?.length ? (
          <div className={styles.approachList}>
            {approaches.data.slice(0, 8).map((item) => (
              <article key={`${item.id}-${item.approachAt}`}>
                <strong>{item.name}</strong>
                <time dateTime={item.approachAt}>
                  {formatDate(item.approachAt)}
                </time>
                <div className={styles.approachMetrics}>
                  <span>
                    {Math.round(item.missDistanceKm).toLocaleString()} km miss
                  </span>
                  <span>
                    {Math.round(item.relativeVelocityKph).toLocaleString()} km/h
                  </span>
                  <span>
                    {Math.round(item.diameterMinM)}–
                    {Math.round(item.diameterMaxM)} m
                  </span>
                </div>
                <small>
                  {item.potentiallyHazardous
                    ? "Potentially hazardous classification"
                    : "Not classified as potentially hazardous"}
                </small>
                <a href={item.sourceUrl} rel="noreferrer" target="_blank">
                  Object/source record
                </a>
              </article>
            ))}
          </div>
        ) : (
          <Empty />
        )}
        <p className={styles.hazardNote}>
          <strong>Potentially hazardous</strong> describes an object’s size and
          orbit relative to Earth. It does not mean the object is predicted to
          collide with Earth.
        </p>
        <DataState metadata={approaches.metadata} status={approaches.status} />
        <h3>Historical atmospheric fireballs</h3>
        {fireballs.data?.length ? (
          <ul className={styles.fireballs}>
            {fireballs.data.slice(0, 6).map((event) => (
              <li key={`${event.date}-${event.energyKt}`}>
                <time dateTime={event.date}>{formatDate(event.date)}</time>
                <span>
                  {event.energyKt.toFixed(2)} kt radiated/impact-energy field
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty />
        )}
      </DataSection>

      <DataSection
        number="03"
        title="Earth in observation"
        intro="EPIC, EONET and GIBS answer different questions. Their status is shown together, but their observations are not collapsed into one false present moment."
      >
        <div className={styles.observationBand}>
          <article>
            <span className={styles.metricLabel}>EPIC</span>
            <h3>{epic.data?.[0]?.caption ?? "Earth image unavailable"}</h3>
            <p>
              {epic.data?.[0]
                ? `Captured ${formatDate(epic.data[0].capturedAt)} from DSCOVR's L1 perspective.`
                : "The Earth page remains available without the remote image."}
            </p>
            <DataState compact metadata={epic.metadata} status={epic.status} />
          </article>
          <article>
            <span className={styles.metricLabel}>EONET</span>
            <h3>{eonet.data?.length ?? 0} curated event records</h3>
            <p>
              Wildfires, storms, volcanoes, floods, ice, dust and haze are
              filtered on the Earth page.
            </p>
            <DataState
              compact
              metadata={eonet.metadata}
              status={eonet.status}
            />
          </article>
          <article>
            <span className={styles.metricLabel}>GIBS</span>
            <h3>{gibs.data?.length ?? 0} selected imagery layers</h3>
            <p>
              Layer ID, instrument, observation date, color mode and latency
              remain visible.
            </p>
            <DataState compact metadata={gibs.metadata} status={gibs.status} />
          </article>
        </div>
      </DataSection>

      <DataSection
        number="04"
        title="Mars archive"
        intro="InSight measured one location at Elysium Planitia. The record is historical and is never labelled as Mars's current weather."
      >
        {insight.data ? (
          <dl className={styles.marsRecord}>
            <div>
              <dt>Sol</dt>
              <dd>{insight.data.sol}</dd>
            </div>
            <div>
              <dt>Mean temperature</dt>
              <dd>{insight.data.temperatureC.average.toFixed(1)} °C</dd>
            </div>
            <div>
              <dt>Mean pressure</dt>
              <dd>{insight.data.pressurePa.average.toFixed(1)} Pa</dd>
            </div>
          </dl>
        ) : (
          <Empty />
        )}
        <DataState metadata={insight.metadata} status={insight.status} />
      </DataSection>

      <DataSection
        number="05"
        title="Provenance and service health"
        intro="This is a user-facing account of what is current, historical, cached or unavailable—not a technical log."
      >
        <div className={styles.statusGrid}>
          {services.map((service) => (
            <article
              data-status={service.status}
              key={`${service.metadata.provider}-${service.metadata.sourceTitle}`}
            >
              <span className={styles.statusName}>
                {service.metadata.provider}
              </span>
              <strong>{service.status.replaceAll("-", " ")}</strong>
              <p>{service.metadata.notes ?? service.metadata.attribution}</p>
              <a
                href={service.metadata.sourceUrl}
                rel="noreferrer"
                target="_blank"
              >
                Source
              </a>
            </article>
          ))}
        </div>
        <div className={styles.ledger}>
          <article>
            <h3>Observed versus retrieved</h3>
            <p>
              Observed time belongs to the event, image or measurement.
              Retrieved time belongs to the Helios request or bundled snapshot.
            </p>
          </article>
          <article>
            <h3>Fallback chain</h3>
            <p>
              Provider response → verified snapshot → static explanation →
              unavailable. A snapshot never inherits a current label.
            </p>
          </article>
          <article>
            <h3>Scientific limits</h3>
            <p>
              Planetary reference values are not local weather. One lander
              record is not a global Mars state. Event trackers are not
              emergency alert services.
            </p>
          </article>
          <article>
            <h3>Cache</h3>
            <p>
              Each provider has its own revalidation policy. Serverless process
              memory is not treated as durable cache.
            </p>
          </article>
        </div>
      </DataSection>
    </article>
  );
}

function DataSection({
  number,
  title,
  intro,
  children,
}: {
  readonly number: string;
  readonly title: string;
  readonly intro: string;
  readonly children: React.ReactNode;
}) {
  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <span className={styles.sectionNumber}>{number}</span>
        <h2>{title}</h2>
        <p>{intro}</p>
      </header>
      <div>{children}</div>
    </section>
  );
}
function Empty() {
  return (
    <p className={styles.empty}>
      No usable record is available for this source.
    </p>
  );
}
function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
      }).format(date);
}
