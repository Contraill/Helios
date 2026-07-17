export type ScaleMode = "exploration" | "scientific";
export type QualityLevel = "low" | "medium" | "high";
export type MotionPreference = "system" | "reduced" | "standard";

export const TIME_SCALE_OPTIONS = [0.25, 1, 4, 16] as const;
export type TimeScale = (typeof TIME_SCALE_OPTIONS)[number];

export function isTimeScale(value: number): value is TimeScale {
  return TIME_SCALE_OPTIONS.includes(value as TimeScale);
}
