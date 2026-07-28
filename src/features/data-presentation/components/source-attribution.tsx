"use client";

import { useId } from "react";

import type { SourcePresentation } from "@/features/data-presentation/types/presentation";
import { formatSourceDate } from "@/lib/i18n/formatters";
import { siteCopy } from "@/lib/i18n/site-copy";
import { useLocaleStore } from "@/stores/locale-store";

import { FreshnessBadge } from "./freshness-badge";
import styles from "./data-presentation.module.css";

interface SourceAttributionProps {
  sources: readonly SourcePresentation[];
  title?: string;
}

export function SourceAttribution({ sources, title }: SourceAttributionProps) {
  const locale = useLocaleStore((state) => state.locale);
  const copy = siteCopy[locale].dataPresentation;
  const headingId = useId();
  return (
    <section aria-labelledby={headingId}>
      <h2 className={styles.sourceHeading} id={headingId}>
        {title ?? copy.sources}
      </h2>
      <ul className={styles.sourceList}>
        {sources.map((source) => (
          <li className={styles.sourceItem} key={source.id}>
            <span className={styles.sourceProvider}>{source.provider}</span>
            <a
              aria-label={copy.opensNewTab(source.title)}
              href={source.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              {source.title} <span aria-hidden="true">↗</span>
            </a>
            <span className={styles.sourceMeta}>
              <FreshnessBadge freshness={source.freshness} />
              <span>
                {copy.accessed} {formatSourceDate(source.accessedAt, locale)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
