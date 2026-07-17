import styles from "./data-presentation.module.css";

interface ComparisonRowProps {
  label: string;
  note?: string;
  value: string;
}

export function ComparisonRow({ label, note, value }: ComparisonRowProps) {
  return (
    <div className={styles.comparisonRow}>
      <span className={styles.comparisonLabel}>{label}</span>
      <span className={styles.comparisonValue}>{value}</span>
      {note ? <span className={styles.comparisonNote}>{note}</span> : null}
    </div>
  );
}
