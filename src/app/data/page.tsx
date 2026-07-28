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
import { preferFreshestResult } from "@/lib/data/external/prefer-result";
import { dataPageCopy } from "@/lib/i18n/data-page-copy";
import { localeTag, type Locale } from "@/lib/i18n/locale";
import { getRequestLocale } from "@/lib/i18n/request-locale.server";
import { createPageMetadata } from "@/lib/metadata/page-metadata";
import { siteCopy } from "@/lib/i18n/site-copy";

import styles from "./data.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return createPageMetadata({
    canonical: "/data",
    description: dataPageCopy[locale].metadataDescription,
    locale,
    title: dataPageCopy[locale].hero.title,
  });
}

export const revalidate = 60;

export default async function DataPage() {
  const locale = await getRequestLocale();
  const copy = dataPageCopy[locale];
  const statusCopy = siteCopy[locale].dataState.labels;
  const [apod, donki, neows, cad, epic, eonet, insight, fireballs, gibs] =
    await Promise.all([
      loadApodArchive(),
      loadDonki(),
      loadNearEarth(),
      loadCneosCad(),
      loadEpic(),
      loadEonet(),
      loadInsight(),
      loadFireballs(),
      loadGibsLayers(),
    ]);
  const approaches = preferFreshestResult(cad, neows);
  const hasPotentiallyHazardousApproach = Boolean(
    approaches.data?.some((item) => item.potentiallyHazardous),
  );
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
          <p className={styles.kicker}>{copy.hero.kicker}</p>
          <h1>{copy.hero.title}</h1>
        </div>
        <div className={styles.heroCopy}>
          <p>{copy.hero.body}</p>
          <nav className={styles.sectionNav} aria-label={copy.hero.navLabel}>
            <a href="#solar-activity">{copy.hero.nav.solar}</a>
            <a href="#near-earth">{copy.hero.nav.nearEarth}</a>
            <a href="#earth-observation">{copy.hero.nav.earth}</a>
            <a href="#mars-archive">{copy.hero.nav.mars}</a>
            <a href="#provenance">{copy.hero.nav.provenance}</a>
          </nav>
        </div>
      </header>

      <section className={styles.legend} aria-labelledby="status-legend-title">
        <div>
          <p className={styles.kicker}>{copy.legend.kicker}</p>
          <h2 id="status-legend-title">{copy.legend.title}</h2>
        </div>
        <dl>
          {copy.legend.items.map(([term, description]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{description}</dd>
            </div>
          ))}
        </dl>
      </section>

      <DataSection
        id="solar-activity"
        number="01"
        title={copy.solar.title}
        intro={copy.solar.intro}
      >
        {donki.data?.length ? (
          <div className={styles.timeline}>
            {donki.data.slice(0, 8).map((event) => (
              <article key={event.id}>
                <span className={styles.eventType}>{event.eventType}</span>
                <h3>{event.title}</h3>
                <time dateTime={event.startAt}>
                  {formatDate(event.startAt, locale)}
                </time>
                {event.classOrIntensity ? (
                  <small>{event.classOrIntensity}</small>
                ) : null}
                <ExternalSourceLink
                  href={event.sourceUrl}
                  label={copy.solar.official}
                  accessibleLabel={copy.solar.officialLabel(event.title)}
                  copy={copy.opensNewTab}
                />
              </article>
            ))}
          </div>
        ) : (
          <Empty copy={copy.empty} />
        )}
        <DataState metadata={donki.metadata} status={donki.status} />
      </DataSection>

      <DataSection
        id="near-earth"
        number="02"
        title={copy.nearEarth.title}
        intro={copy.nearEarth.intro}
      >
        {approaches.data?.length ? (
          <div className={styles.approachList}>
            {approaches.data.slice(0, 8).map((item) => (
              <article key={`${item.id}-${item.approachAt}`}>
                <h3>{item.name}</h3>
                <time dateTime={item.approachAt}>
                  {formatDate(item.approachAt, locale)} {item.timeScale}
                </time>
                <div className={styles.approachMetrics}>
                  <span>
                    {copy.nearEarth.miss(
                      formatNumber(item.missDistanceKm, locale, 0),
                    )}
                  </span>
                  <span>
                    {copy.nearEarth.velocity(
                      formatNumber(item.relativeVelocityKph, locale, 0),
                    )}
                  </span>
                  <span>
                    {item.diameterMinM !== undefined &&
                    item.diameterMaxM !== undefined
                      ? `${formatNumber(item.diameterMinM, locale, 0)}–${formatNumber(item.diameterMaxM, locale, 0)} m`
                      : copy.nearEarth.diameterUnavailable}
                  </span>
                </div>
                <small>
                  {item.potentiallyHazardous === true
                    ? copy.nearEarth.hazardTrue
                    : item.potentiallyHazardous === false
                      ? copy.nearEarth.hazardFalse
                      : copy.nearEarth.hazardUnknown}
                </small>
                <ExternalSourceLink
                  href={item.sourceUrl}
                  label={copy.nearEarth.objectRecord}
                  accessibleLabel={copy.nearEarth.objectLabel(item.name)}
                  copy={copy.opensNewTab}
                />
              </article>
            ))}
          </div>
        ) : (
          <Empty copy={copy.empty} />
        )}
        {hasPotentiallyHazardousApproach ? (
          <p className={styles.hazardNote}>
            <strong>{copy.nearEarth.hazardStrong}</strong>{" "}
            {copy.nearEarth.hazardNote}
          </p>
        ) : null}
        <DataState metadata={approaches.metadata} status={approaches.status} />
        <h3>{copy.nearEarth.fireballs}</h3>
        {fireballs.data?.length ? (
          <ul className={styles.fireballs}>
            {fireballs.data.slice(0, 6).map((event) => (
              <li key={event.date}>
                <time dateTime={event.date}>
                  {formatDate(event.date, locale)}
                </time>
                {event.radiatedEnergy10e10J !== undefined ? (
                  <span>
                    {copy.nearEarth.radiated(
                      formatNumber(event.radiatedEnergy10e10J, locale, 2),
                    )}
                  </span>
                ) : null}
                {event.estimatedImpactEnergyKt !== undefined ? (
                  <span>
                    {copy.nearEarth.impact(
                      formatNumber(event.estimatedImpactEnergyKt, locale, 2),
                    )}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <Empty copy={copy.empty} />
        )}
      </DataSection>

      <DataSection
        id="earth-observation"
        number="03"
        title={copy.earth.title}
        intro={copy.earth.intro}
      >
        <div className={styles.observationBand}>
          <article>
            <span className={styles.metricLabel}>EPIC</span>
            <h3>{epic.data?.[0]?.caption ?? copy.earth.imageUnavailable}</h3>
            <p>
              {epic.data?.[0]
                ? copy.earth.captured(
                    formatDate(epic.data[0].capturedAt, locale),
                  )
                : copy.earth.noImage}
            </p>
            <DataState compact metadata={epic.metadata} status={epic.status} />
          </article>
          <article>
            <span className={styles.metricLabel}>EONET</span>
            <h3>{copy.earth.curated(eonet.data?.length ?? 0)}</h3>
            <p>{copy.earth.curatedBody}</p>
            <DataState
              compact
              metadata={eonet.metadata}
              status={eonet.status}
            />
          </article>
          <article>
            <span className={styles.metricLabel}>GIBS</span>
            <h3>{copy.earth.layers(gibs.data?.length ?? 0)}</h3>
            <p>{copy.earth.layersBody}</p>
            <DataState compact metadata={gibs.metadata} status={gibs.status} />
          </article>
        </div>
      </DataSection>

      <DataSection
        id="mars-archive"
        number="04"
        title={copy.mars.title}
        intro={copy.mars.intro}
      >
        {insight.data ? (
          <dl className={styles.marsRecord}>
            <div>
              <dt>{copy.mars.sol}</dt>
              <dd>{insight.data.sol}</dd>
            </div>
            <div>
              <dt>{copy.mars.temperature}</dt>
              <dd>
                {insight.data.temperatureC
                  ? `${formatNumber(insight.data.temperatureC.average, locale, 1)} °C`
                  : copy.mars.unavailable}
              </dd>
            </div>
            <div>
              <dt>{copy.mars.pressure}</dt>
              <dd>
                {insight.data.pressurePa
                  ? `${formatNumber(insight.data.pressurePa.average, locale, 1)} Pa`
                  : copy.mars.unavailable}
              </dd>
            </div>
          </dl>
        ) : (
          <Empty copy={copy.empty} />
        )}
        <DataState metadata={insight.metadata} status={insight.status} />
      </DataSection>

      <DataSection
        id="provenance"
        number="05"
        title={copy.provenance.title}
        intro={copy.provenance.intro}
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
              <h3>{service.metadata.sourceTitle}</h3>
              <strong className={styles.statusValue}>
                {statusCopy[service.status]}
              </strong>
              <p>
                {copy.provenance.serviceNotes[
                  service.metadata
                    .provider as keyof typeof copy.provenance.serviceNotes
                ] ?? service.metadata.attribution}
              </p>
              <ExternalSourceLink
                href={service.metadata.sourceUrl}
                label={copy.provenance.sourceRecord}
                accessibleLabel={copy.provenance.sourceLabel(
                  service.metadata.sourceTitle,
                )}
                copy={copy.opensNewTab}
              />
            </article>
          ))}
        </div>
        <div className={styles.ledger}>
          {copy.provenance.ledgers.map(([title, body]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </DataSection>
    </article>
  );
}

function ExternalSourceLink({
  href,
  label,
  accessibleLabel,
  copy = "opens in a new tab",
}: {
  readonly href: string;
  readonly label: string;
  readonly accessibleLabel: string;
  readonly copy?: string;
}) {
  return (
    <a
      aria-label={`${accessibleLabel} (${copy})`}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {label}
      <span aria-hidden="true"> ↗</span>
    </a>
  );
}

function DataSection({
  id,
  number,
  title,
  intro,
  children,
}: {
  readonly id: string;
  readonly number: string;
  readonly title: string;
  readonly intro: string;
  readonly children: React.ReactNode;
}) {
  const headingId = `${id}-title`;
  return (
    <section className={styles.section} id={id} aria-labelledby={headingId}>
      <header className={styles.sectionHeader}>
        <span className={styles.sectionNumber}>{number}</span>
        <h2 id={headingId}>{title}</h2>
        <p>{intro}</p>
      </header>
      <div>{children}</div>
    </section>
  );
}
function Empty({ copy }: { readonly copy: string }) {
  return <p className={styles.empty}>{copy}</p>;
}
function formatDate(value: string, locale: Locale) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(localeTag(locale), {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
      }).format(date);
}

function formatNumber(value: number, locale: Locale, digits: number) {
  return new Intl.NumberFormat(localeTag(locale), {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}
