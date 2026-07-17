import type { Metadata } from "next";
import Link from "next/link";

import { planets } from "@/content/planets";
import { ExploreCanvasClient } from "@/features/solar-system/components/explore-canvas-client";
import { uiStrings } from "@/lib/i18n/ui-strings";

import styles from "./explore.module.css";

const copy = uiStrings.pages.explore;

export const metadata: Metadata = {
  title: copy.title,
  description: copy.description,
};

export default function ExplorePage() {
  return (
    <article className={styles.explore}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p className={styles.description}>{copy.description}</p>
      </header>

      <section
        aria-label={copy.sceneLabel}
        aria-describedby="exploration-scale-notice"
        className={styles.scene}
      >
        <ExploreCanvasClient />
      </section>

      <aside className={styles.navigator}>
        <p className={styles.navigatorLabel}>{copy.planetListLabel}</p>
        <ol>
          {planets.map((planet) => (
            <li key={planet.id}>
              <Link href={`/planet/${planet.id}`}>
                <span>{planet.orderFromSun.value}</span>
                {planet.name.en}
              </Link>
            </li>
          ))}
        </ol>
      </aside>

      <p className={styles.scaleNotice} id="exploration-scale-notice">
        {copy.scaleNotice}
      </p>
    </article>
  );
}
