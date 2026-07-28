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
    canonical: "/case-study",
    description: editorialPageCopy[locale].caseStudy.metadataDescription,
    locale,
    title: locale === "tr" ? "Vaka Çalışması" : "Case Study",
  });
}

export default async function CaseStudyPage() {
  const locale = await getRequestLocale();
  const copy = editorialPageCopy[locale].caseStudy;

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
              {copy.hero.product}
            </Link>
            <Link className={styles.secondaryAction} href="/about">
              {copy.hero.principles}
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
          <dt className={styles.metricLabel}>{copy.metrics.moons}</dt>
          <dd>
            <strong>{CELESTIAL_SCOPE.featuredMoons}</strong>
            <span>{copy.metrics.moonsBody}</span>
          </dd>
        </div>
        <div>
          <dt className={styles.metricLabel}>{copy.metrics.bodies}</dt>
          <dd>
            <strong>{CELESTIAL_SCOPE.extendedBodies}</strong>
            <span>{copy.metrics.bodiesBody}</span>
          </dd>
        </div>
        <div>
          <dt className={styles.metricLabel}>{copy.metrics.texture}</dt>
          <dd>
            <strong>2K</strong>
            <span>{copy.metrics.textureBody}</span>
          </dd>
        </div>
      </dl>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <p className={styles.sectionNumber}>{copy.problem.number}</p>
          <h2>{copy.problem.title}</h2>
          <p>{copy.problem.body}</p>
        </header>
        <div className={styles.cardGrid}>
          {copy.problem.cards.map(([label, title, body]) => (
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
          <p className={styles.sectionNumber}>{copy.corrections.number}</p>
          <h2>{copy.corrections.title}</h2>
          <p>{copy.corrections.body}</p>
        </header>
        <div className={styles.timeline}>
          {copy.corrections.items.map(([label, title, body]) => (
            <article key={title}>
              <p className={styles.cardLabel}>{label}</p>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <p className={styles.sectionNumber}>{copy.decisions.number}</p>
          <h2>{copy.decisions.title}</h2>
        </header>
        <div className={styles.decisionGrid}>
          {copy.decisions.items.map(([label, title, body]) => (
            <article className={styles.decision} key={title}>
              <p className={styles.cardLabel}>{label}</p>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <p className={styles.sectionNumber}>{copy.architecture.number}</p>
          <h2>{copy.architecture.title}</h2>
          <p>{copy.architecture.body}</p>
        </header>
        <div className={styles.stackGrid}>
          {copy.architecture.items.map(([label, title, body]) => (
            <article className={styles.stackCard} key={title}>
              <p className={styles.cardLabel}>{label}</p>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <p className={styles.sectionNumber}>{copy.quality.number}</p>
          <h2>{copy.quality.title}</h2>
        </header>
        <ul className={styles.list}>
          {copy.quality.items.map(([title, body]) => (
            <li key={title}>
              <strong>{title}</strong>
              <span>{body}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <p className={styles.sectionNumber}>{copy.result.number}</p>
          <h2>{copy.result.title}</h2>
        </header>
        <div className={styles.callout}>
          <h3>{copy.result.calloutTitle}</h3>
          <p>{copy.result.body}</p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/body/sun">
              {copy.result.library}
            </Link>
            <Link className={styles.secondaryAction} href="/region/oort-cloud">
              {copy.result.outer}
            </Link>
            <Link className={styles.secondaryAction} href="/data">
              {copy.result.data}
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
