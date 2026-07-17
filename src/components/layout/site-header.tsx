import Link from "next/link";

import { uiStrings } from "@/lib/i18n/ui-strings";

const navItems = [
  ["/explore", uiStrings.nav.explore],
  ["/compare", uiStrings.nav.compare],
  ["/data", uiStrings.nav.data],
  ["/about", uiStrings.nav.about],
  ["/case-study", uiStrings.nav.caseStudy],
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-background/90">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Link
          href="/"
          className="font-display text-lg tracking-[0.2em] uppercase"
        >
          {uiStrings.site.name}
        </Link>
        <nav aria-label={uiStrings.a11y.mainNavLabel}>
          <ul className="flex flex-wrap gap-4 text-sm text-muted">
            {navItems.map(([href, label]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="transition-colors hover:text-foreground"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
