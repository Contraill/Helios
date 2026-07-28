"use client";

import Link from "next/link";

import { siteCopy } from "@/lib/i18n/site-copy";
import { useLocaleStore } from "@/stores/locale-store";

import { LocaleSwitcher } from "./locale-switcher";

const NAV_PATHS = [
  ["/explore", "explore"],
  ["/compare", "compare"],
  ["/missions", "missions"],
  ["/data", "data"],
  ["/about", "about"],
  ["/case-study", "caseStudy"],
] as const;

export function SiteHeader() {
  const locale = useLocaleStore((state) => state.locale);
  const copy = siteCopy[locale];

  return (
    <header className="site-header border-b border-line bg-background/90">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Link
          href="/"
          className="font-display text-lg tracking-[0.2em] uppercase"
        >
          {copy.site.name}
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-4">
          <nav aria-label={copy.a11y.mainNavLabel}>
            <ul className="flex flex-wrap gap-4 text-sm text-muted">
              {NAV_PATHS.map(([href, key]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="transition-colors hover:text-foreground"
                  >
                    {copy.nav[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
