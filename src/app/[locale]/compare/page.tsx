import type { Metadata } from "next";
import { Suspense } from "react";

import { planets } from "@/content/planets";
import { CompareExperience } from "@/features/comparison/components/compare-experience";
import { createComparisonPlanets } from "@/features/comparison/lib/create-comparison-planets";
import { comparisonCopy } from "@/lib/i18n/comparison-copy";
import { getRequestLocale } from "@/lib/i18n/request-locale.server";
import { createPageMetadata } from "@/lib/metadata/page-metadata";

import styles from "./compare.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return createPageMetadata({
    canonical: "/compare",
    description: comparisonCopy[locale].metadataDescription,
    locale,
    title: comparisonCopy[locale].hero.title,
  });
}

export default async function ComparePage() {
  const locale = await getRequestLocale();
  const copy = comparisonCopy[locale];
  const comparisonPlanets = createComparisonPlanets(planets, locale);
  return (
    <article className={styles.page}>
      <header className={styles.hero}>
        <div>
          <p>{copy.hero.kicker}</p>
          <h1>{copy.hero.title}</h1>
        </div>
        <p>{copy.hero.body}</p>
      </header>
      <Suspense fallback={<p>{copy.hero.restoring}</p>}>
        <CompareExperience planets={comparisonPlanets} />
      </Suspense>
    </article>
  );
}
