import Link from "next/link";

import type { PlanetDetailModel } from "@/features/planet-details/lib/planet-detail-model";
import type { Locale } from "@/lib/i18n/locale";
import { planetPageCopy } from "@/lib/i18n/planet-page-copy";

import styles from "./planet-detail.module.css";

export function PlanetAdjacentNav({
  locale = "en",
  model,
}: {
  locale?: Locale;
  model: PlanetDetailModel;
}) {
  const copy = planetPageCopy[locale].detail;

  return (
    <nav aria-label={copy.adjacentPlanets} className={styles.planetNav}>
      {model.previous ? (
        <Link href={`/body/${model.previous.id}`}>
          <span>{copy.previousPlanet}</span>
          <strong>{model.previous.name}</strong>
        </Link>
      ) : (
        <span />
      )}
      {model.next ? (
        <Link href={`/body/${model.next.id}`}>
          <span>{copy.nextPlanet}</span>
          <strong>{model.next.name}</strong>
        </Link>
      ) : null}
    </nav>
  );
}
