"use client";

import Link from "next/link";

import { ApodFeature } from "@/features/space-data/components/apod-feature";
import { CELESTIAL_SCOPE } from "@/features/solar-system/lib/celestial-scope";
import type { ApodRecord } from "@/lib/data/external/models";
import type {
  ExternalDataStatus,
  ExternalMetadata,
} from "@/lib/data/external/types";
import { landingCopy } from "@/lib/i18n/landing-copy";
import type { Locale } from "@/lib/i18n/locale";
import { useLocaleStore } from "@/stores/locale-store";

import styles from "@/app/home.module.css";

interface HomeExperienceProps {
  readonly initialLocale?: Locale;
  readonly metadata: ExternalMetadata;
  readonly records: readonly ApodRecord[];
  readonly status: ExternalDataStatus;
}

export function HomeExperience({
  initialLocale = "en",
  ...props
}: HomeExperienceProps) {
  const storeLocale = useLocaleStore((state) => state.locale);
  const locale = storeLocale === initialLocale ? storeLocale : initialLocale;
  return <HomePresentation {...props} locale={locale} />;
}

export function HomePresentation({
  locale,
  metadata,
  records,
  status,
}: Omit<HomeExperienceProps, "initialLocale"> & { readonly locale: Locale }) {
  const copy = landingCopy[locale].home;

  return (
    <article className={styles.page} lang={locale}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>{copy.heroKicker}</p>
          <h1>Helios</h1>
          <p className={styles.intro}>{copy.intro}</p>
          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/explore">
              {copy.actions.explore}
            </Link>
            <Link href="/missions">{copy.actions.missions}</Link>
            <Link href="/compare">{copy.actions.compare}</Link>
          </div>
        </div>

        <div aria-hidden="true" className={styles.heroSystem}>
          <svg
            className={styles.heroSystemGraphic}
            viewBox="0 0 600 600"
            focusable="false"
          >
            <defs>
              <radialGradient id="home-sun-gradient" cx="35%" cy="30%">
                <stop offset="0" stopColor="#fff3cc" />
                <stop offset="0.48" stopColor="#f6ad51" />
                <stop offset="1" stopColor="#b44c20" />
              </radialGradient>
              <filter
                id="home-sun-glow"
                x="-180%"
                y="-180%"
                width="460%"
                height="460%"
              >
                <feGaussianBlur stdDeviation="20" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <g
              className={`${styles.heroOrbitGroup} ${styles.heroOrbitOne}`}
              data-home-orbit="inner"
            >
              <ellipse
                className={styles.heroOrbitLine}
                cx="300"
                cy="300"
                rx="132"
                ry="72"
              />
              <circle
                className={`${styles.heroPlanet} ${styles.heroPlanetOne}`}
                cx="432"
                cy="300"
                r="7"
                data-home-planet="inner"
              />
            </g>
            <g
              className={`${styles.heroOrbitGroup} ${styles.heroOrbitTwo}`}
              data-home-orbit="middle"
            >
              <ellipse
                className={styles.heroOrbitLine}
                cx="300"
                cy="300"
                rx="210"
                ry="117"
              />
              <circle
                className={`${styles.heroPlanet} ${styles.heroPlanetTwo}`}
                cx="90"
                cy="300"
                r="10"
                data-home-planet="middle"
              />
            </g>
            <g
              className={`${styles.heroOrbitGroup} ${styles.heroOrbitThree}`}
              data-home-orbit="outer"
            >
              <ellipse
                className={styles.heroOrbitLine}
                cx="300"
                cy="300"
                rx="288"
                ry="168"
              />
              <circle
                className={`${styles.heroPlanet} ${styles.heroPlanetThree}`}
                cx="300"
                cy="132"
                r="8"
                data-home-planet="outer"
              />
            </g>

            <circle
              className={styles.heroSun}
              cx="300"
              cy="300"
              r="48"
              fill="url(#home-sun-gradient)"
              filter="url(#home-sun-glow)"
            />
          </svg>
        </div>

        <dl className={styles.scopeStrip} aria-label={copy.scope.label}>
          <div>
            <dt>{copy.scope.bodies}</dt>
            <dd>{CELESTIAL_SCOPE.realBodies}</dd>
          </div>
          <div>
            <dt>{copy.scope.regions}</dt>
            <dd>{CELESTIAL_SCOPE.systemRegions}</dd>
          </div>
          <div>
            <dt>{copy.scope.destinations}</dt>
            <dd>{CELESTIAL_SCOPE.detailDestinations}</dd>
          </div>
          <div>
            <dt>{copy.scope.visual}</dt>
            <dd>{copy.scope.high}</dd>
          </div>
        </dl>
      </section>

      <section
        className={styles.principles}
        aria-labelledby="home-principles-title"
      >
        <header>
          <p className={styles.kicker}>{copy.principles.kicker}</p>
          <h2 id="home-principles-title">{copy.principles.title}</h2>
        </header>
        <div className={styles.principleGrid}>
          {copy.principles.items.map((item, index) => (
            <article key={item.title}>
              <span>{(index + 1).toString().padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className={styles.destinations}
        aria-labelledby="home-destinations-title"
      >
        <div className={styles.sectionIntro}>
          <div>
            <p className={styles.kicker}>{copy.destinations.kicker}</p>
            <h2 id="home-destinations-title">{copy.destinations.title}</h2>
          </div>
          <p>{copy.destinations.lede}</p>
        </div>
        <ol className={styles.destinationGrid}>
          {copy.destinations.items.map((destination) => (
            <li key={destination.href}>
              <Link href={destination.href}>
                <span>{destination.index}</span>
                <p>{destination.label}</p>
                <h3>{destination.title}</h3>
                <p>{destination.body}</p>
                <strong>{copy.destinations.open}</strong>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.apodWrap} aria-labelledby="home-apod-title">
        <div className={styles.sectionIntro}>
          <div>
            <p className={styles.kicker}>{copy.apod.kicker}</p>
            <h2 id="home-apod-title">{copy.apod.title}</h2>
          </div>
          <p>{copy.apod.body}</p>
        </div>
        <ApodFeature metadata={metadata} records={records} status={status} />
      </section>

      <section className={styles.closing} aria-labelledby="home-closing-title">
        <p className={styles.kicker}>{copy.closing.kicker}</p>
        <h2 id="home-closing-title">{copy.closing.title}</h2>
        <p>{copy.closing.body}</p>
        <div className={styles.actions}>
          <Link className={styles.primaryAction} href="/explore">
            {copy.closing.explore}
          </Link>
          <Link href="/data">{copy.closing.data}</Link>
          <Link href="/case-study">{copy.closing.caseStudy}</Link>
        </div>
      </section>
    </article>
  );
}
