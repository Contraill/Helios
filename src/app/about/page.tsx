import type { Metadata } from "next";
import Link from "next/link";

import { CELESTIAL_SCOPE } from "@/features/solar-system/lib/celestial-scope";
import { editorialPageCopy } from "@/lib/i18n/editorial-page-copy";
import { getRequestLocale } from "@/lib/i18n/request-locale.server";
import { createPageMetadata } from "@/lib/metadata/page-metadata";

import styles from "@/features/editorial-pages/editorial-page.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return createPageMetadata({
    canonical: "/about",
    description: editorialPageCopy[locale].about.metadataDescription,
    locale,
    title: editorialPageCopy[locale].about.metadataTitle,
  });
}

export default async function AboutPage() {
  const locale = await getRequestLocale();
  const copy = editorialPageCopy[locale].about;

  return (
    <article className={styles.page}>
      <header className={styles.hero}>
        <div>
          <p className={styles.kicker}>{copy.hero.kicker}</p>
          <h1>{copy.hero.title}</h1>
        </div>
        <div>
          <p className={styles.heroLead}>{copy.hero.lead}</p>
          <p className={styles.heroBody}>{copy.hero.body}</p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/explore">
              {copy.hero.explore}
            </Link>
            <Link className={styles.secondaryAction} href="/case-study">
              {copy.hero.caseStudy}
            </Link>
          </div>
        </div>
      </header>

      <dl className={styles.metricBand} aria-label={copy.scopeLabel}>
        <div>
          <dt className={styles.metricLabel}>{copy.metrics.destinations}</dt>
          <dd>
            <strong>{CELESTIAL_SCOPE.detailDestinations}</strong>
            <span>
              {copy.metrics.destinationsBody(
                CELESTIAL_SCOPE.realBodies,
                CELESTIAL_SCOPE.systemRegions,
              )}
            </span>
          </dd>
        </div>
        <div>
          <dt className={styles.metricLabel}>{copy.metrics.planets}</dt>
          <dd>
            <strong>{CELESTIAL_SCOPE.planets}</strong>
            <span>{copy.metrics.planetsBody}</span>
          </dd>
        </div>
        <div>
          <dt className={styles.metricLabel}>{copy.metrics.profiles}</dt>
          <dd>
            <strong>2</strong>
            <span>{copy.metrics.profilesBody}</span>
          </dd>
        </div>
        <div>
          <dt className={styles.metricLabel}>{copy.metrics.quality}</dt>
          <dd>
            <strong>1</strong>
            <span>{copy.metrics.qualityBody}</span>
          </dd>
        </div>
      </dl>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <p className={styles.sectionNumber}>{copy.purpose.number}</p>
          <h2>{copy.purpose.title}</h2>
          <p>{copy.purpose.body}</p>
        </header>
        <blockquote className={styles.quote}>{copy.purpose.quote}</blockquote>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <p className={styles.sectionNumber}>{copy.principles.number}</p>
          <h2>{copy.principles.title}</h2>
          <p>{copy.principles.body}</p>
        </header>
        <div className={styles.cardGrid}>
          {copy.principles.items.map(([label, title, body]) => (
            <article className={styles.card} key={title}>
              <p className={styles.cardLabel}>{label}</p>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <p className={styles.sectionNumber}>{copy.map.number}</p>
          <h2>{copy.map.title}</h2>
          <p>{copy.map.body}</p>
        </header>
        <div className={styles.decisionGrid}>
          {copy.map.items.map(([label, title, body, action, href], index) => (
            <article className={styles.decision} key={href}>
              <p className={styles.cardLabel}>{label}</p>
              <h3>{title}</h3>
              <p>{body}</p>
              {index === 1 ? (
                <div className={styles.cardActions}>
                  <Link href={href}>{action}</Link>
                  <Link href="/region/heliosphere">{copy.map.heliosphere}</Link>
                </div>
              ) : (
                <Link href={href}>{action}</Link>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <p className={styles.sectionNumber}>{copy.guide.number}</p>
          <h2>{copy.guide.title}</h2>
        </header>
        <ul className={styles.list}>
          {copy.guide.items.map(([title, body]) => (
            <li key={title}>
              <strong>{title}</strong>
              <span>{body}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className={styles.callout}>
        <h3>{copy.callout.title}</h3>
        <p>{copy.callout.body}</p>
        <div className={styles.heroActions}>
          <Link className={styles.primaryAction} href="/case-study">
            {copy.callout.action}
          </Link>
        </div>
      </div>
    </article>
  );
}
