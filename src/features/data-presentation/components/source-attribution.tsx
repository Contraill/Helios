import type { SourcePresentation } from "@/features/data-presentation/types/presentation";
import { uiStrings } from "@/lib/i18n/ui-strings";

import { FreshnessBadge } from "./freshness-badge";
import styles from "./data-presentation.module.css";

interface SourceAttributionProps {
  sources: readonly SourcePresentation[];
  title?: string;
}

export function SourceAttribution({
  sources,
  title = uiStrings.dataPresentation.sources,
}: SourceAttributionProps) {
  return (
    <section aria-labelledby="source-attribution-heading">
      <h2 className={styles.sourceHeading} id="source-attribution-heading">
        {title}
      </h2>
      <ul className={styles.sourceList}>
        {sources.map((source) => (
          <li className={styles.sourceItem} key={source.id}>
            <span className={styles.sourceProvider}>{source.provider}</span>
            <a href={source.url} rel="noreferrer" target="_blank">
              {source.title}
            </a>
            <span className={styles.sourceMeta}>
              <FreshnessBadge freshness={source.freshness} />
              <span>
                {uiStrings.dataPresentation.accessed} {source.accessedAt}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
