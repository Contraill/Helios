import styles from "./data-presentation.module.css";

interface MethodologyNoteProps {
  body: string;
  label: string;
  title: string;
}

export function MethodologyNote({ body, label, title }: MethodologyNoteProps) {
  return (
    <aside className={styles.methodology}>
      <p className={styles.methodologyLabel}>{label}</p>
      <h3>{title}</h3>
      <p>{body}</p>
    </aside>
  );
}
