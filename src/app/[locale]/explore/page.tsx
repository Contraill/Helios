import type { Metadata } from "next";

import { planets } from "@/content/planets";
import { sun } from "@/content/solar-system/sun";
import { ExploreExperience } from "@/features/solar-system/components/explore-experience";
import { createExplorePlanetSummaries } from "@/features/solar-system/lib/explore-planets";
import { createScenePlanets } from "@/features/solar-system/lib/scene-planets";
import { createSceneSun } from "@/features/solar-system/lib/scene-sun";
import { getExplorePageCopy } from "@/lib/i18n/explore-page-copy";
import { getRequestLocale } from "@/lib/i18n/request-locale.server";
import { createPageMetadata } from "@/lib/metadata/page-metadata";

import styles from "./explore.module.css";

const planetSummaries = createExplorePlanetSummaries(planets);
const scenePlanets = createScenePlanets(planets);
const sceneSun = createSceneSun(sun);

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = getExplorePageCopy(locale);
  return createPageMetadata({
    canonical: "/explore",
    description: copy.description,
    locale,
    title: copy.title,
  });
}

export default async function ExplorePage() {
  const locale = await getRequestLocale();
  const copy = getExplorePageCopy(locale);

  return (
    <article className={styles.explore}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p className={styles.description}>{copy.description}</p>
      </header>

      <ExploreExperience
        planetSummaries={planetSummaries}
        scenePlanets={scenePlanets}
        sceneSun={sceneSun}
      />
    </article>
  );
}
