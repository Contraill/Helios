import type { CSSProperties } from "react";

import type { PlanetId } from "@/lib/data/schemas/planet";

import styles from "./planet-detail.module.css";

export function PlanetEditorialVisual({
  id,
  label,
  order,
}: {
  readonly id: PlanetId;
  readonly label: string;
  readonly order: number;
}) {
  return (
    <div
      aria-label={label}
      className={styles.visual}
      data-planet={id}
      data-planet-visual="true"
      role="img"
      style={
        {
          "--planet-editorial-texture": `url("/textures/planets/${id}.webp")`,
        } as CSSProperties
      }
    >
      <span
        aria-hidden="true"
        className={styles.visualField}
        data-planet-visual-field="true"
      />
      <span
        aria-hidden="true"
        className={styles.visualOrbit}
        data-planet-visual-orbit="true"
      />
      <span
        aria-hidden="true"
        className={styles.visualAxis}
        data-planet-visual-axis="true"
      />
      <span
        aria-hidden="true"
        className={styles.visualRing}
        data-planet-visual-ring="true"
      />
      <span
        aria-hidden="true"
        className={styles.visualOrb}
        data-planet-visual-orb="true"
      >
        <span
          className={styles.visualTexture}
          data-planet-visual-texture="true"
        />
      </span>
      <span className={styles.heroIndex}>
        {order.toString().padStart(2, "0")} / 08
      </span>
    </div>
  );
}
