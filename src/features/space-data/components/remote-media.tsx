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
  const [failedSrc, setFailedSrc] = useState<string>();
  if (!src || failedSrc === src) {
    return (
      <div
        className={`${styles.remoteFallback} ${className ?? ""}`}
        data-remote-media-fallback
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
      data-remote-media
      loading="lazy"
      onError={() => setFailedSrc(src)}
      src={src}
    />
  );
}
