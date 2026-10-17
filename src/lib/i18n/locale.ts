export const SUPPORTED_LOCALES = ["en", "tr"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_COOKIE_KEY = "helios-locale";
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && SUPPORTED_LOCALES.includes(value as Locale)
  );
}

export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function localeTag(locale: Locale): "en-US" | "tr-TR" {
  return locale === "tr" ? "tr-TR" : "en-US";
}

/** Prefixes an internal path for non-default locales: `/body/mars` → `/tr/body/mars`. */
export function localizedPath(path: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE || !path.startsWith("/")) return path;
  return path === "/" || path.startsWith("/?") || path.startsWith("/#")
    ? `/${locale}${path.slice(1)}`
    : `/${locale}${path}`;
}

/** Removes a locale prefix from a browser pathname: `/tr/body/mars` → `/body/mars`. */
export function stripLocalePrefix(pathname: string): string {
  const [, firstSegment] = pathname.split("/");
  if (!isLocale(firstSegment)) return pathname;
  return pathname.slice(firstSegment.length + 1) || "/";
}
