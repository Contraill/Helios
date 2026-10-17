import "server-only";

import { resolveLocale, type Locale } from "./locale";

export interface LocaleRouteProps {
  readonly params: Promise<{ locale: string }>;
}

// src/proxy.ts maps every page URL onto the [locale] segment, so the locale is a static route param.
export async function getRequestLocale(
  params?: Promise<{ locale?: string }>,
): Promise<Locale> {
  return resolveLocale((await params)?.locale);
}
