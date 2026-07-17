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
    template: `%s \u2014 ${uiStrings.site.name}`,
  },
  description: uiStrings.site.tagline,
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col antialiased">
        <SkipLink />
        <SiteHeader />
        <main
          id="main-content"
          className="mx-auto w-full max-w-3xl flex-1 px-6 py-12"
        >
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
