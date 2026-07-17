import Link from "next/link";

import type { PlanetDetailModel } from "@/features/planet-details/lib/planet-detail-model";
import { uiStrings } from "@/lib/i18n/ui-strings";

import styles from "./planet-detail.module.css";

export function PlanetAdjacentNav({ model }: { model: PlanetDetailModel }) {
  const copy = uiStrings.pages.planet.detail;

  return (
    <nav aria-label={copy.adjacentPlanets} className={styles.planetNav}>
      {model.previous ? (
        <Link href={`/planet/${model.previous.id}`}>
          <span>{copy.previousPlanet}</span>
          <strong>{model.previous.name}</strong>
        </Link>
      ) : (
        <span />
      )}
      {model.next ? (
        <Link href={`/planet/${model.next.id}`}>
          <span>{copy.nextPlanet}</span>
          <strong>{model.next.name}</strong>
        </Link>
      ) : null}
    </nav>
  );
}
