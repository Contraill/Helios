import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipLink } from "@/components/layout/skip-link";
import { uiStrings } from "@/lib/i18n/ui-strings";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: uiStrings.site.name,
    template: `%s · ${uiStrings.site.name}`,
  },
  description: uiStrings.site.tagline,
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SkipLink />
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
