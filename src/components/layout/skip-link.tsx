"use client";

import { siteCopy } from "@/lib/i18n/site-copy";
import { useLocaleStore } from "@/stores/locale-store";

export function SkipLink() {
  const locale = useLocaleStore((state) => state.locale);

  return (
    <a href="#main-content" className="site-skip-link">
      {siteCopy[locale].a11y.skipToContent}
    </a>
  );
}
