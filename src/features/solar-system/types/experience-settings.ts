export type ScaleMode = "exploration" | "scientific";

export const SECONDS_PER_JULIAN_YEAR = 31_557_600;

export const TIME_SCALE_OPTIONS = [
  1,
  21_600,
  86_400,
  604_800,
  2_592_000,
  SECONDS_PER_JULIAN_YEAR,
] as const;
export type TimeScale = (typeof TIME_SCALE_OPTIONS)[number];

export function isTimeScale(value: number): value is TimeScale {
  return TIME_SCALE_OPTIONS.includes(value as TimeScale);
}

export function timeScaleLabel(
  value: TimeScale,
  locale: "en" | "tr" = "en",
): string {
  const labels =
    locale === "tr"
      ? {
          1: "Gerçek zaman",
          21_600: "Saniyede 6 saat",
          86_400: "Saniyede 1 gün",
          604_800: "Saniyede 1 hafta",
          2_592_000: "Saniyede 1 ay",
          [SECONDS_PER_JULIAN_YEAR]: "Saniyede 1 yıl",
        }
      : {
          1: "Real time",
          21_600: "6 hours / sec",
          86_400: "1 day / sec",
          604_800: "1 week / sec",
          2_592_000: "1 month / sec",
          [SECONDS_PER_JULIAN_YEAR]: "1 year / sec",
        };
  return labels[value];
}
