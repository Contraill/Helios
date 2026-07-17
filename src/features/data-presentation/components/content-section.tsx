import type { ReactNode } from "react";

import styles from "./data-presentation.module.css";

interface ContentSectionProps {
  children: ReactNode;
  eyebrow?: string;
  id?: string;
  lede?: string;
  title: string;
}

export function ContentSection({
  children,
  eyebrow,
  id,
  lede,
  title,
}: ContentSectionProps) {
  return (
    <section className={styles.section} id={id}>
      <header className={styles.sectionIntro}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <h2>{title}</h2>
        {lede ? <p className={styles.lede}>{lede}</p> : null}
      </header>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}
