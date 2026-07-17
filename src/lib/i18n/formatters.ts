export const defaultLocale = "en-US";

const oneDecimalFormatter = new Intl.NumberFormat(defaultLocale, {
  maximumFractionDigits: 1,
});

const zeroDecimalFormatter = new Intl.NumberFormat(defaultLocale, {
  maximumFractionDigits: 0,
});

const twoDecimalFormatter = new Intl.NumberFormat(defaultLocale, {
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat(defaultLocale, {
  maximumFractionDigits: 2,
  notation: "compact",
});

export function formatOneDecimal(value: number): string {
  return oneDecimalFormatter.format(value);
}

export function formatZeroDecimals(value: number): string {
  return zeroDecimalFormatter.format(value);
}

export function formatTwoDecimals(value: number): string {
  return twoDecimalFormatter.format(value);
}

export function formatCompactNumber(value: number): string {
  return compactFormatter.format(value);
}

export function formatSignedNumber(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${oneDecimalFormatter.format(value)}`;
}

export function formatHoursAsClockDuration(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = Math.abs(totalMinutes % 60);
  return `${wholeHours}h ${minutes.toString().padStart(2, "0")}m`;
}

export function formatMinutesAsDuration(minutes: number): string {
  const rounded = Math.round(minutes);
  const hours = Math.floor(Math.abs(rounded) / 60);
  const remainingMinutes = Math.abs(rounded) % 60;
  const prefix = rounded < 0 ? "−" : "";
  return hours > 0
    ? `${prefix}${hours}h ${remainingMinutes}m`
    : `${prefix}${remainingMinutes}m`;
}
