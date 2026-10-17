import type { Metadata } from "next";

import {
  DEFAULT_LOCALE,
  localeTag,
  localizedPath,
  SUPPORTED_LOCALES,
  type Locale,
} from "@/lib/i18n/locale";
import { siteCopy } from "@/lib/i18n/site-copy";

export const SOCIAL_IMAGE_ALT =
  "Helios Solar System atlas — worlds, motion and scale";
export const SOCIAL_IMAGE_SIZE = { width: 1200, height: 630 } as const;

// The image routes live at the app root, outside the [locale] layout, so Next does not attach them automatically.
export const socialImages = {
  openGraph: [
    {
      url: "/opengraph-image",
      alt: SOCIAL_IMAGE_ALT,
      type: "image/png",
      ...SOCIAL_IMAGE_SIZE,
    },
  ],
  twitter: [{ url: "/twitter-image", alt: SOCIAL_IMAGE_ALT }],
};

interface PageMetadataInput {
  readonly canonical: string;
  readonly description: string;
  readonly locale: Locale;
  readonly title?: string;
}

export function createPageMetadata({
  canonical,
  description,
  locale,
  title,
}: PageMetadataInput): Metadata {
  const { name: siteName, title: siteTitle } = siteCopy[locale].site;
  const socialTitle = title ? `${title} · ${siteName}` : siteTitle;
  const url = localizedPath(canonical, locale);

  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: url, languages: languageAlternates(canonical) },
    openGraph: {
      type: "website",
      locale: localeTag(locale).replace("-", "_"),
      siteName,
      url,
      title: socialTitle,
      description,
      images: socialImages.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: socialImages.twitter,
    },
  };
}

/** hreflang map for one page; `canonical` is the unprefixed (English) path. */
export function languageAlternates(canonical: string): Record<string, string> {
  return {
    ...Object.fromEntries(
      SUPPORTED_LOCALES.map((locale) => [
        locale,
        localizedPath(canonical, locale),
      ]),
    ),
    "x-default": localizedPath(canonical, DEFAULT_LOCALE),
  };
}
