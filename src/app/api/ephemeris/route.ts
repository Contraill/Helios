import { NextResponse } from "next/server";

import {
  createSimulationRange,
  isWithinSimulationRange,
  type SimulationRange,
} from "@/features/solar-system/lib/simulation-range";
import {
  HorizonsError,
  loadHorizonsEphemeris,
} from "@/lib/data/ephemeris/horizons.server";
import { fallbackBundleFor } from "@/lib/data/ephemeris/horizons-snapshot";

const MAXIMUM_ANCHOR_SKEW_MS = 24 * 60 * 60 * 1_000;

export const dynamic = "force-dynamic";

export function requestRangeFrom(
  anchorValue: string | null,
  realNowMs = Date.now(),
): SimulationRange {
  const requestedAnchor = anchorValue ? Date.parse(anchorValue) : Number.NaN;
  const anchorUtcMs =
    Number.isFinite(requestedAnchor) &&
    Math.abs(requestedAnchor - realNowMs) <= MAXIMUM_ANCHOR_SKEW_MS
      ? requestedAnchor
      : realNowMs;
  return createSimulationRange(anchorUtcMs);
}

export function requestedDateFrom(
  value: string | null,
  range = createSimulationRange(Date.now()),
): Date | null {
  if (!value) return null;
  const timestamp = Date.parse(value);
  if (!isWithinSimulationRange(timestamp, range)) return null;
  return new Date(timestamp);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const range = requestRangeFrom(url.searchParams.get("anchor"));
  const requestedAt = requestedDateFrom(url.searchParams.get("at"), range);
  if (!requestedAt) {
    return NextResponse.json(
      {
        error: `Provide an ISO date from ${new Date(range.minimumUtcMs).toISOString()} through ${new Date(range.maximumUtcMs).toISOString()} in the at parameter.`,
      },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await loadHorizonsEphemeris(requestedAt), {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    const fallbackReason =
      error instanceof HorizonsError ? error.kind : "upstream";
    const fallback = fallbackBundleFor(requestedAt.toISOString());
    if (fallback) {
      return NextResponse.json(fallback, {
        headers: {
          "Cache-Control": "public, s-maxage=60",
          "X-Helios-Fallback": fallbackReason,
        },
      });
    }
    return NextResponse.json(
      { error: "JPL Horizons is temporarily unavailable for this date." },
      { status: 503, headers: { "X-Helios-Fallback": fallbackReason } },
    );
  }
}
