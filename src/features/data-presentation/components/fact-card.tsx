import type { CSSProperties } from "react";

import styles from "./data-presentation.module.css";

interface FactCardProps {
  accentColor?: string;
  body: string;
  eyebrow: string;
  title: string;
}

export function FactCard({ accentColor, body, eyebrow, title }: FactCardProps) {
  return (
    <article
      className={styles.fact}
      style={
        accentColor
          ? ({ "--fact-accent": accentColor } as CSSProperties)
          : undefined
      }
    >
      <p className={styles.factEyebrow}>{eyebrow}</p>
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  );
}
