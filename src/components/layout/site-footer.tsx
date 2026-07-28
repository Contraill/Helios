"use client";

import { siteCopy } from "@/lib/i18n/site-copy";
import { useLocaleStore } from "@/stores/locale-store";

export function SiteFooter() {
  const locale = useLocaleStore((state) => state.locale);

  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-7xl px-5 py-6 text-sm text-muted">
        <p>{siteCopy[locale].footer}</p>
      </div>
    </footer>
  );
}
