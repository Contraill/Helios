import type { Metadata } from "next";
import { Suspense } from "react";

import { planets } from "@/content/planets";
import { CompareExperience } from "@/features/comparison/components/compare-experience";
import { createComparisonPlanets } from "@/features/comparison/lib/create-comparison-planets";

import styles from "./compare.module.css";

export const metadata: Metadata = {
  title: "Compare",
  description:
    "Compare two planets through sourced reference measurements, human-scale time and gravity, and explicit scientific definitions.",
};

export default function ComparePage() {
  const comparisonPlanets = createComparisonPlanets(planets);
  return (
    <article className={styles.page}>
      <header className={styles.hero}>
        <div>
          <p>Two worlds · one reference frame</p>
          <h1>Compare</h1>
        </div>
        <p>
          Numbers become useful when their definitions stay visible. Dynamic
          observations are deliberately excluded: this comparison uses
          version-controlled planetary reference data.
        </p>
      </header>
      <Suspense fallback={<p>Restoring comparison state…</p>}>
        <CompareExperience planets={comparisonPlanets} />
      </Suspense>
    </article>
  );
}
