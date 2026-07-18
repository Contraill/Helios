"use client";

import { useState } from "react";

import styles from "./space-data.module.css";

interface RemoteMediaProps {
  readonly alt: string;
  readonly className?: string;
  readonly fallbackLabel: string;
  readonly src?: string;
}

export function RemoteMedia({
  alt,
  className,
  fallbackLabel,
  src,
}: RemoteMediaProps) {
  const [failed, setFailed] = useState(!src);
  if (failed || !src) {
    return (
      <div
        className={`${styles.remoteFallback} ${className ?? ""}`}
        role="img"
        aria-label={`${alt}. ${fallbackLabel}`}
      >
        <span>{fallbackLabel}</span>
      </div>
    );
  }
  return (
    // Remote scientific media is intentionally left unoptimized; providers and dates vary.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
      src={src}
    />
  );
}
