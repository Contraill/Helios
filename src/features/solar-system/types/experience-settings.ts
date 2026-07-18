export type ScaleMode = "exploration" | "scientific";
export type QualityLevel = "low" | "medium" | "high";
export type MotionPreference = "system" | "reduced" | "standard";

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

export function timeScaleLabel(value: TimeScale): string {
  return {
    1: "Real time",
    21_600: "6 hours / sec",
    86_400: "1 day / sec",
    604_800: "1 week / sec",
    2_592_000: "1 month / sec",
    [SECONDS_PER_JULIAN_YEAR]: "1 year / sec",
  }[value];
}
