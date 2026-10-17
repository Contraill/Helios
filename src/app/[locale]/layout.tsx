import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipLink } from "@/components/layout/skip-link";
import { localeTag, SUPPORTED_LOCALES } from "@/lib/i18n/locale";
import {
  getRequestLocale,
  type LocaleRouteProps,
} from "@/lib/i18n/request-locale.server";
import { siteCopy } from "@/lib/i18n/site-copy";
import { socialImages } from "@/lib/metadata/page-metadata";
import { resolveSiteUrl } from "@/lib/metadata/site-url";
import { LocaleProvider } from "@/stores/locale-store";

import "../globals.css";
import "../mobile-layout.css";
import "../mobile-layout-pass-2.css";
import "../mobile-layout-pass-3.css";
import "../mobile-layout-pass-4.css";
import "../responsive-polish.css";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocaleRouteProps): Promise<Metadata> {
  const locale = await getRequestLocale(params);
  const copy = siteCopy[locale];
  return {
    metadataBase: resolveSiteUrl(),
    title: {
      default: copy.site.title,
      template: `%s · ${copy.site.name}`,
    },
    description: copy.site.tagline,
    openGraph: {
      type: "website",
      locale: localeTag(locale).replace("-", "_"),
      siteName: copy.site.name,
      title: copy.site.title,
      description: copy.site.tagline,
      images: socialImages.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: copy.site.title,
      description: copy.site.tagline,
      images: socialImages.twitter,
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: LocaleRouteProps & { readonly children: ReactNode }) {
  const locale = await getRequestLocale(params);
  const isVercelDeployment = process.env.VERCEL === "1";

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
        {isVercelDeployment ? (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        ) : null}
      </body>
    </html>
  );
}
