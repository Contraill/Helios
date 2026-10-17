"use client";

import { getExplorePageCopy } from "@/lib/i18n/explore-page-copy";
import { useLocaleStore } from "@/stores/locale-store";

// loading receives no route params; the [locale] layout's provider supplies the locale.
export default function Loading() {
  const locale = useLocaleStore((state) => state.locale);
  const copy = getExplorePageCopy(locale);
  return (
    <div
      className="scene-loading scene-loading--route"
      data-route-loading="explore"
      role="status"
    >
      <span>{copy.loading}</span>
    </div>
  );
}
