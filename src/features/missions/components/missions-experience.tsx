"use client";

import Link from "next/link";

import { FreshnessBadge } from "@/features/data-presentation/components";
import type { MissionCatalogueEntry } from "@/features/missions/lib/mission-catalogue";
import { landingCopy } from "@/lib/i18n/landing-copy";
import type { Locale } from "@/lib/i18n/locale";
import { useLocaleStore } from "@/stores/locale-store";

import styles from "@/app/missions/missions.module.css";

interface MissionsExperienceProps {
  readonly initialLocale?: Locale;
  readonly missions: readonly MissionCatalogueEntry[];
  readonly planetCount: number;
}

export function MissionsExperience({
  missions,
  planetCount,
}: MissionsExperienceProps) {
  const locale = useLocaleStore((state) => state.locale);
  return (
    <MissionsPresentation
      locale={locale}
      missions={missions}
      planetCount={planetCount}
    />
  );
}

export function MissionsPresentation({
  locale,
  missions,
  planetCount,
}: Omit<MissionsExperienceProps, "initialLocale"> & {
  readonly locale: Locale;
}) {
  const copy = landingCopy[locale].missions;

  return (
    <article className={styles.page} lang={locale}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>{copy.hero.kicker}</p>
          <h1>{copy.hero.title}</h1>
          <p className={styles.lede}>{copy.hero.body}</p>
          <div className={styles.actions}>
            <Link href="/explore">{copy.hero.explore}</Link>
            <Link href="/data">{copy.hero.data}</Link>
          </div>
        </div>
        <dl className={styles.scope} aria-label={copy.scope.label}>
          <div>
            <dt>{copy.scope.records}</dt>
            <dd>{missions.length}</dd>
          </div>
          <div>
            <dt>{copy.scope.systems}</dt>
            <dd>{planetCount}</dd>
          </div>
          <div>
            <dt>{copy.scope.rule}</dt>
            <dd>{copy.scope.official}</dd>
          </div>
        </dl>
      </header>

      <section
        aria-labelledby="mission-catalogue-heading"
        className={styles.catalogue}
      >
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>{copy.catalogue.kicker}</p>
          <h2 id="mission-catalogue-heading">{copy.catalogue.title}</h2>
          <p>{copy.catalogue.body}</p>
        </div>

        <ol className={styles.grid}>
          {missions.map((mission, index) => (
            <li className={styles.card} id={mission.id} key={mission.id}>
              <article>
                <header>
                  <span className={styles.index}>
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <div>
                    <p className={styles.planet}>{mission.planetName}</p>
                    <h3>{mission.title}</h3>
                  </div>
                </header>
                <div className={styles.statusRow}>
                  <span>{mission.status}</span>
                  <FreshnessBadge freshness={mission.sources[0].freshness} />
                </div>
                <p>{mission.body}</p>
                <footer>
                  <Link href={`/body/${mission.planetId}`}>
                    {copy.catalogue.openPlanet(mission.planetName)}
                  </Link>
                  {mission.sources.map((source) => (
                    <a
                      aria-label={copy.catalogue.officialLabel(
                        source.title,
                        mission.title,
                      )}
                      href={source.url}
                      key={source.id}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {copy.catalogue.official}{" "}
                      <span aria-hidden="true">↗</span>
                    </a>
                  ))}
                </footer>
              </article>
            </li>
          ))}
        </ol>
      </section>

      <section
        className={styles.method}
        aria-labelledby="mission-method-heading"
      >
        <p className={styles.eyebrow}>{copy.method.kicker}</p>
        <h2 id="mission-method-heading">{copy.method.title}</h2>
        <div>
          <p>{copy.method.first}</p>
          <p>{copy.method.second}</p>
        </div>
      </section>
    </article>
  );
}
