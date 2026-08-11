export type GameRenderTier = "economy" | "balanced" | "high";

export interface GameRenderBudget {
  readonly pixelRatio: number;
  readonly reducedMotion: boolean;
  readonly shadowBlur: number;
  readonly starAreaDivisor: number;
  readonly starMaximum: number;
  readonly tier: GameRenderTier;
}

export const MAX_STORED_BEST_SCORE = 999_999;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function gameCanvasPixelRatio(
  width: number,
  height: number,
  devicePixelRatio: number,
  coarsePointer: boolean,
): number {
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const shortSide = Math.min(safeWidth, safeHeight);
  const logicalArea = safeWidth * safeHeight;
  const compactHandheld = coarsePointer && shortSide < 560;
  const cap =
    logicalArea > 1_000_000
      ? 1
      : compactHandheld
        ? 1
        : coarsePointer
          ? 1.15
          : 1.25;
  return clamp(
    Number.isFinite(devicePixelRatio) ? devicePixelRatio : 1,
    1,
    cap,
  );
}

export function gameRenderBudget(
  width: number,
  height: number,
  devicePixelRatio: number,
  coarsePointer: boolean,
  reducedMotion = false,
): GameRenderBudget {
  const pixelRatio = gameCanvasPixelRatio(
    width,
    height,
    devicePixelRatio,
    coarsePointer,
  );
  const logicalArea = Math.max(1, width) * Math.max(1, height);
  const effectiveArea = logicalArea * pixelRatio * pixelRatio;
  const shortSide = Math.min(Math.max(1, width), Math.max(1, height));

  if (
    (coarsePointer && shortSide < 520) ||
    (coarsePointer && effectiveArea > 1_050_000)
  ) {
    return {
      pixelRatio,
      reducedMotion,
      shadowBlur: reducedMotion ? 2 : 4,
      starAreaDivisor: 15_500,
      starMaximum: 78,
      tier: "economy",
    };
  }

  if (coarsePointer || effectiveArea > 2_200_000) {
    return {
      pixelRatio,
      reducedMotion,
      shadowBlur: reducedMotion ? 3 : 6,
      starAreaDivisor: 12_000,
      starMaximum: 118,
      tier: "balanced",
    };
  }

  return {
    pixelRatio,
    reducedMotion,
    shadowBlur: reducedMotion ? 4 : 8,
    starAreaDivisor: 9_000,
    starMaximum: 170,
    tier: "high",
  };
}

export function normalizedGameDelta(deltaMilliseconds: number): number {
  if (!Number.isFinite(deltaMilliseconds) || deltaMilliseconds <= 0) return 0;
  return Math.min(1 / 30, deltaMilliseconds / 1_000);
}

export function normalizeStoredBestScore(value: string | null): number {
  if (!value) return 0;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.min(MAX_STORED_BEST_SCORE, Math.floor(parsed));
}
