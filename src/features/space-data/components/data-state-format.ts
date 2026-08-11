import type { Locale } from "@/lib/i18n/locale";

const MONTHS = {
  en: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  tr: [
    "Oca",
    "Şub",
    "Mar",
    "Nis",
    "May",
    "Haz",
    "Tem",
    "Ağu",
    "Eyl",
    "Eki",
    "Kas",
    "Ara",
  ],
} as const;

const PROVIDER_MONTH_INDEX = new Map(
  MONTHS.en.map((month, index) => [month.toLowerCase(), index] as const),
);

interface TimestampParts {
  readonly year: number;
  readonly monthIndex: number;
  readonly day: number;
  readonly hours: number;
  readonly minutes: number;
}

function daysInMonth(year: number, monthIndex: number): number {
  if (monthIndex === 1) {
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    return leap ? 29 : 28;
  }
  return [3, 5, 8, 10].includes(monthIndex) ? 30 : 31;
}

function validParts(parts: TimestampParts): TimestampParts | null {
  if (
    !Number.isInteger(parts.year) ||
    parts.year < 1 ||
    !Number.isInteger(parts.monthIndex) ||
    parts.monthIndex < 0 ||
    parts.monthIndex > 11 ||
    !Number.isInteger(parts.day) ||
    parts.day < 1 ||
    parts.day > daysInMonth(parts.year, parts.monthIndex) ||
    !Number.isInteger(parts.hours) ||
    parts.hours < 0 ||
    parts.hours > 23 ||
    !Number.isInteger(parts.minutes) ||
    parts.minutes < 0 ||
    parts.minutes > 59
  ) {
    return null;
  }
  return parts;
}

function numericParts(match: RegExpMatchArray): TimestampParts | null {
  return validParts({
    year: Number(match[1]),
    monthIndex: Number(match[2]) - 1,
    day: Number(match[3]),
    hours: Number(match[4] ?? 0),
    minutes: Number(match[5] ?? 0),
  });
}

/**
 * Parse only the provider formats Helios accepts and displays.
 *
 * Do not delegate parsing to `new Date(string)`: JPL CAD/NeoWs calendar values
 * such as `2028-Jun-26 05:23` and CNEOS fireball values such as
 * `2015-10-13 12:23:08` are intentionally not ISO 8601. Their acceptance by
 * Date.parse differs between JS engines, which can make SSR text differ from
 * Safari/WebKit hydration text.
 */
function parseProviderTimestamp(value: string): TimestampParts | null {
  const iso = value.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::\d{2}(?:\.\d{1,9})?)?Z)?$/,
  );
  if (iso) return numericParts(iso);

  const numericProvider = value.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T_](\d{2}):(\d{2})(?::\d{2}(?:\.\d{1,9})?)?$/,
  );
  if (numericProvider) return numericParts(numericProvider);

  const namedMonthProvider = value.match(
    /^(\d{4})-([A-Za-z]{3})-(\d{2})[ T_](\d{2}):(\d{2})(?::\d{2}(?:\.\d{1,9})?)?$/,
  );
  if (!namedMonthProvider) return null;

  const monthIndex = PROVIDER_MONTH_INDEX.get(
    namedMonthProvider[2].toLowerCase(),
  );
  if (monthIndex === undefined) return null;

  return validParts({
    year: Number(namedMonthProvider[1]),
    monthIndex,
    day: Number(namedMonthProvider[3]),
    hours: Number(namedMonthProvider[4]),
    minutes: Number(namedMonthProvider[5]),
  });
}

/**
 * Keep hydrated timestamp text byte-for-byte identical across Node, Chromium,
 * Firefox and WebKit, including the non-ISO calendar formats returned by JPL
 * close-approach and CNEOS fireball providers.
 */
export function formatDataStateDate(value: string, locale: Locale): string {
  const parts = parseProviderTimestamp(value);
  if (!parts) return value;

  const month = MONTHS[locale][parts.monthIndex];
  const minute = String(parts.minutes).padStart(2, "0");

  if (locale === "tr") {
    return `${parts.day} ${month} ${parts.year} ${String(parts.hours).padStart(2, "0")}:${minute}`;
  }

  const period = parts.hours >= 12 ? "PM" : "AM";
  const hours12 = parts.hours % 12 || 12;
  return `${month} ${parts.day}, ${parts.year}, ${hours12}:${minute} ${period}`;
}
