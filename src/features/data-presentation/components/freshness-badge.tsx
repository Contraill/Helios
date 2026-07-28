"use client";

import type { DataFreshness } from "@/lib/data/schemas/source";
import { siteCopy } from "@/lib/i18n/site-copy";
import { useLocaleStore } from "@/stores/locale-store";

import styles from "./data-presentation.module.css";

export function FreshnessBadge({ freshness }: { freshness: DataFreshness }) {
  const locale = useLocaleStore((state) => state.locale);
  return (
    <span className={styles.badge}>
      {siteCopy[locale].dataPresentation.freshness[freshness]}
    </span>
  );
}
