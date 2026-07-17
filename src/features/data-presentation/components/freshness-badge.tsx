import type { DataFreshness } from "@/lib/data/schemas/source";
import { uiStrings } from "@/lib/i18n/ui-strings";

import styles from "./data-presentation.module.css";

export function FreshnessBadge({ freshness }: { freshness: DataFreshness }) {
  return (
    <span className={styles.badge}>
      {uiStrings.dataPresentation.freshness[freshness]}
    </span>
  );
}
