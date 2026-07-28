import { localeTag, type Locale } from "./locale";

export const defaultLocale = "en-US";

type SupportedLocale = Locale | string;

function resolveTag(locale: SupportedLocale = "en"): string {
  return locale === "en" || locale === "tr" ? localeTag(locale) : locale;
}

function formatNumber(
  value: number,
  maximumFractionDigits: number,
  locale: SupportedLocale = "en",
): string {
  return new Intl.NumberFormat(resolveTag(locale), {
    maximumFractionDigits,
  }).format(value);
}

export function formatOneDecimal(
  value: number,
  locale: SupportedLocale = "en",
): string {
  return formatNumber(value, 1, locale);
}

export function formatZeroDecimals(
  value: number,
  locale: SupportedLocale = "en",
): string {
  return formatNumber(value, 0, locale);
}

export function formatTwoDecimals(
  value: number,
  locale: SupportedLocale = "en",
): string {
  return formatNumber(value, 2, locale);
}

export function formatCompactNumber(
  value: number,
  locale: SupportedLocale = "en",
): string {
  return new Intl.NumberFormat(resolveTag(locale), {
    maximumFractionDigits: 2,
    notation: "compact",
  }).format(value);
}

export function formatSignedNumber(
  value: number,
  locale: SupportedLocale = "en",
): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatOneDecimal(value, locale)}`;
}

export function formatSourceDate(value: string, locale: Locale = "en"): string {
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(value);
  if (!match) return value;

  const [, year, month, day] = match;
  const date = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day ?? 1)),
  );
  return new Intl.DateTimeFormat(
    resolveTag(locale),
    day
      ? { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }
      : { month: "long", year: "numeric", timeZone: "UTC" },
  ).format(date);
}

export function formatHoursAsClockDuration(
  hours: number,
  locale: Locale = "en",
): string {
  const totalMinutes = Math.round(hours * 60);
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = Math.abs(totalMinutes % 60);
  return locale === "tr"
    ? `${wholeHours} sa ${minutes.toString().padStart(2, "0")} dk`
    : `${wholeHours}h ${minutes.toString().padStart(2, "0")}m`;
}

export function formatMinutesAsDuration(
  minutes: number,
  locale: Locale = "en",
): string {
  const rounded = Math.round(minutes);
  const hours = Math.floor(Math.abs(rounded) / 60);
  const remainingMinutes = Math.abs(rounded) % 60;
  const prefix = rounded < 0 ? "−" : "";
  if (locale === "tr") {
    return hours > 0
      ? `${prefix}${hours} sa ${remainingMinutes} dk`
      : `${prefix}${remainingMinutes} dk`;
  }
  return hours > 0
    ? `${prefix}${hours}h ${remainingMinutes}m`
    : `${prefix}${remainingMinutes}m`;
}
