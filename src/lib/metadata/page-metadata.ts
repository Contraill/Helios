import type { Metadata } from "next";

import { localeTag, type Locale } from "@/lib/i18n/locale";
import { siteCopy } from "@/lib/i18n/site-copy";

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
  const siteName = siteCopy[locale].site.name;
  const socialTitle = title ? `${title} · ${siteName}` : siteName;

  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: localeTag(locale).replace("-", "_"),
      siteName,
      url: canonical,
      title: socialTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
    },
  };
}
