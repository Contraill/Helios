import type { CSSProperties } from "react";
import Link from "next/link";

import {
  celestialDetailHref,
  type BodyDetailModel,
} from "@/features/body-details/lib/body-detail-model";
import { bodyPageCopy } from "@/lib/i18n/body-page-copy";
import type { Locale } from "@/lib/i18n/locale";

import styles from "./body-detail.module.css";

export function BodyDetailPage({
  locale = "en",
  model,
}: {
  readonly locale?: Locale;
  readonly model: BodyDetailModel;
}) {
  const copy = bodyPageCopy[locale];
  const visualStyle = {
    "--body-accent": model.accentColor,
    ...(model.visualAssetPath
      ? { "--body-visual-image": `url("${model.visualAssetPath}")` }
      : {}),
  } as CSSProperties;
  const parentHref = model.parent ? celestialDetailHref(model.parent.id) : null;

  return (
    <article className={styles.page} style={visualStyle}>
      <div className={styles.backdrop} aria-hidden="true" />
      <nav className={styles.breadcrumbs} aria-label={copy.breadcrumb}>
        <Link href="/explore">{copy.explore}</Link>
        <span aria-hidden="true">/</span>
        {model.parent && parentHref ? (
          <>
            <Link href={parentHref}>{model.parent.name}</Link>
            <span aria-hidden="true">/</span>
          </>
        ) : null}
        <span aria-current="page">{model.name}</span>
      </nav>

      <header className={styles.hero} aria-labelledby="body-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{model.kindLabel}</p>
          <h1 id="body-title">{model.name}</h1>
          <p className={styles.tagline}>{model.tagline}</p>
          <p className={styles.overview}>{model.overview}</p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/explore">
              {copy.openExplore}
            </Link>
            {model.parent && parentHref ? (
              <Link className={styles.secondaryAction} href={parentHref}>
                {copy.openParent(model.parent.name)}
              </Link>
            ) : null}
          </div>
        </div>
        <div className={styles.visualColumn}>
          <div
            className={styles.orbitHalo}
            data-has-image={model.visualAssetPath ? "true" : "false"}
            data-visual-geometry={model.visualGeometry ?? "sphere"}
            data-visual-kind={model.visualKind}
            aria-hidden="true"
          >
            <div className={styles.world} />
          </div>
          <dl className={styles.visualLedger}>
            <div>
              <dt>{model.modelLabel ?? copy.orbitModel}</dt>
              <dd>{model.representationLabel}</dd>
            </div>
            <div>
              <dt>{model.visualLabel ?? copy.surface}</dt>
              <dd>{model.surfaceLabel}</dd>
            </div>
          </dl>
        </div>
      </header>

      <section className={styles.metricSection} aria-labelledby="metrics-title">
        <header className={styles.sectionIntro}>
          <p>{copy.referenceEyebrow}</p>
          <h2 id="metrics-title">{model.metricTitle ?? copy.metricTitle}</h2>
        </header>
        <dl className={styles.metrics}>
          {model.metrics.map((metric) => (
            <div key={metric.label}>
              <dt>{metric.label}</dt>
              <dd>
                <span className={styles.metricValue}>{metric.value}</span>
                {metric.note ? (
                  <span className={styles.metricNote}>{metric.note}</span>
                ) : null}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className={styles.editorialSections}>
        {model.sections.map((section, index) => (
          <section
            className={styles.editorialSection}
            key={`${section.eyebrow}-${section.title}`}
          >
            <span className={styles.sectionIndex} aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <p className={styles.eyebrow}>{section.eyebrow}</p>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </div>
          </section>
        ))}
      </div>

      <section className={styles.method} aria-labelledby="method-title">
        <div>
          <p className={styles.eyebrow}>{copy.ledgerEyebrow}</p>
          <h2 id="method-title">{copy.ledgerTitle}</h2>
        </div>
        <div className={styles.methodCopy}>
          <p>{model.representationNote}</p>
          <p>{model.surfaceNote}</p>
        </div>
      </section>

      <section className={styles.sources} aria-labelledby="sources-title">
        <div>
          <p className={styles.eyebrow}>{copy.provenance}</p>
          <h2 id="sources-title">{copy.sourcesTitle}</h2>
        </div>
        <div className={styles.sourceColumns}>
          <div>
            <h3>{copy.primaryRecords}</h3>
            <ul>
              {model.sourceLinks.map((source) => (
                <li key={source.href}>
                  <a
                    href={source.href}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {source.label}
                    <span aria-hidden="true"> ↗</span>
                    <span className={styles.srOnly}> ({copy.newTab})</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>{copy.continueSystem}</h3>
            {model.related.length ? (
              <ul>
                {model.related.map((destination) => {
                  const href = celestialDetailHref(destination.id);
                  return href ? (
                    <li key={destination.id}>
                      <Link href={href}>
                        <strong>{destination.name}</strong>
                        <span>{destination.context}</span>
                      </Link>
                    </li>
                  ) : null;
                })}
              </ul>
            ) : (
              <p className={styles.quiet}>{copy.returnExplore}</p>
            )}
          </div>
        </div>
      </section>
    </article>
  );
}
