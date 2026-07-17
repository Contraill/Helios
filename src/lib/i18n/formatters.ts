export const defaultLocale = "en-US";

const oneDecimalFormatter = new Intl.NumberFormat(defaultLocale, {
  maximumFractionDigits: 1,
});

export function formatOneDecimal(value: number): string {
  return oneDecimalFormatter.format(value);
}
