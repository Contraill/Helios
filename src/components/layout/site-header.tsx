"use client";

import Link from "next/link";

import { siteCopy } from "@/lib/i18n/site-copy";
import { useLocaleStore } from "@/stores/locale-store";

import { LocaleSwitcher } from "./locale-switcher";
import styles from "./site-header.module.css";

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
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          {copy.site.name}
        </Link>

        <nav className={styles.navigation} aria-label={copy.a11y.mainNavLabel}>
          <ul className={styles.navigationList}>
            {NAV_PATHS.map(([href, key]) => (
              <li key={href}>
                <Link href={href} className={styles.navigationLink}>
                  {copy.nav[key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.locale}>
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
