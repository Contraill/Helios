import Link from "next/link";

import { uiStrings } from "@/lib/i18n/ui-strings";

const navItems = [
  { href: "/explore", label: uiStrings.nav.explore },
  { href: "/compare", label: uiStrings.nav.compare },
  { href: "/data", label: uiStrings.nav.data },
  { href: "/about", label: uiStrings.nav.about },
  { href: "/case-study", label: uiStrings.nav.caseStudy },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-4">
        <Link href="/" className="font-display text-lg tracking-wide">
          {uiStrings.site.name}
        </Link>
        <nav aria-label={uiStrings.a11y.mainNavLabel}>
          <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="hover:text-foreground focus-visible:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
