"use client";

import { getExplorePageCopy } from "@/lib/i18n/explore-page-copy";
import { useLocaleStore } from "@/stores/locale-store";

export function SceneFallback() {
  const locale = useLocaleStore((state) => state.locale);
  const copy = getExplorePageCopy(locale);

  return (
    <div className="scene-fallback" role="status">
      <strong>{copy.fallbackTitle}</strong>
      <span>{copy.fallbackBody}</span>
    </div>
  );
}
