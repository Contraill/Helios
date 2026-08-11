"use client";

import { useEffect, useId, useRef } from "react";

import styles from "./scene-recovery-notice.module.css";

export function SceneRecoveryNotice({
  body,
  failed,
  onRetry,
  retryLabel,
  title,
}: {
  readonly body: string;
  readonly failed: boolean;
  readonly onRetry: () => void;
  readonly retryLabel: string;
  readonly title: string;
}) {
  const titleId = useId();
  const bodyId = useId();
  const retryButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!failed) return;
    retryButtonRef.current?.focus({ preventScroll: true });
  }, [failed]);

  return (
    <div
      aria-atomic="true"
      aria-busy={!failed}
      aria-describedby={bodyId}
      aria-labelledby={titleId}
      aria-live={failed ? undefined : "polite"}
      className={styles.notice}
      data-testid="scene-recovery-notice"
      role={failed ? "alert" : "status"}
    >
      <div className={styles.card}>
        <span aria-hidden="true" className={styles.signal} />
        <strong id={titleId}>{title}</strong>
        <p id={bodyId}>{body}</p>
        {failed ? (
          <button onClick={onRetry} ref={retryButtonRef} type="button">
            {retryLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
