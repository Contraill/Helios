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
      role="img"
    >
      <span aria-hidden="true" className={styles.visualField} />
      <span aria-hidden="true" className={styles.visualOrbit} />
      <span aria-hidden="true" className={styles.visualAxis} />
      <span aria-hidden="true" className={styles.visualRing} />
      <span aria-hidden="true" className={styles.visualOrb} />
      <span className={styles.heroIndex}>
        {order.toString().padStart(2, "0")} / 08
      </span>
    </div>
  );
}
