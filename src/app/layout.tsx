import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipLink } from "@/components/layout/skip-link";
import { localeTag } from "@/lib/i18n/locale";
import { getRequestLocale } from "@/lib/i18n/request-locale.server";
import { siteCopy } from "@/lib/i18n/site-copy";
import { resolveSiteUrl } from "@/lib/metadata/site-url";
import { LocaleProvider } from "@/stores/locale-store";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = siteCopy[locale];
  return {
    metadataBase: resolveSiteUrl(),
    title: {
      default: copy.site.name,
      template: `%s · ${copy.site.name}`,
    },
    description: copy.site.tagline,
    openGraph: {
      type: "website",
      locale: localeTag(locale).replace("-", "_"),
      siteName: copy.site.name,
      title: copy.site.name,
      description: copy.site.tagline,
    },
    twitter: {
      card: "summary_large_image",
      title: copy.site.name,
      description: copy.site.tagline,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const locale = await getRequestLocale();
  return (
    <html lang={localeTag(locale)}>
      <body>
        <div aria-hidden="true" className="site-ambient-backdrop">
          <span className="site-ambient-glow" />
          <span className="site-ambient-orbit site-ambient-orbit--inner" />
          <span className="site-ambient-orbit site-ambient-orbit--outer" />
          <span className="site-ambient-marker" />
        </div>
        <LocaleProvider initialLocale={locale}>
          <div className="site-shell">
            <SkipLink />
            <SiteHeader />
            <main id="main-content">{children}</main>
            <SiteFooter />
          </div>
        </LocaleProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
