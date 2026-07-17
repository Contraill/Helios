import type { Metadata } from "next";

import { planets } from "@/content/planets";
import { ExploreExperience } from "@/features/solar-system/components/explore-experience";
import { createExplorePlanetSummaries } from "@/features/solar-system/lib/explore-planets";
import { createScenePlanets } from "@/features/solar-system/lib/scene-planets";
import { uiStrings } from "@/lib/i18n/ui-strings";

import styles from "./explore.module.css";

const copy = uiStrings.pages.explore;
const planetSummaries = createExplorePlanetSummaries(planets);
const scenePlanets = createScenePlanets(planets);

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

      <ExploreExperience
        planetSummaries={planetSummaries}
        scenePlanets={scenePlanets}
      />
    </article>
  );
}
