import styles from "./data-presentation.module.css";

interface MetricCardProps {
  context?: string;
  label: string;
  unit?: string;
  value: string;
}

export function MetricCard({ context, label, unit, value }: MetricCardProps) {
  return (
    <div className={styles.metric}>
      <p className={styles.metricLabel}>{label}</p>
      <p className={styles.metricValue}>
        <span>{value}</span>
        {unit ? <span className={styles.metricUnit}>{unit}</span> : null}
      </p>
      {context ? <p className={styles.metricContext}>{context}</p> : null}
    </div>
  );
}

export function MetricGrid({ children }: { children: React.ReactNode }) {
  return <div className={styles.metricGrid}>{children}</div>;
}
