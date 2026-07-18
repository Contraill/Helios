import { NextResponse } from "next/server";

import {
  HorizonsError,
  loadHorizonsEphemeris,
} from "@/lib/data/ephemeris/horizons.server";
import { fallbackBundleFor } from "@/lib/data/ephemeris/horizons-snapshot";

const MINIMUM_DATE = Date.UTC(1900, 0, 1);
const MAXIMUM_DATE = Date.UTC(2100, 11, 31, 23, 59, 59, 999);

export const dynamic = "force-dynamic";

export function requestedDateFrom(value: string | null): Date | null {
  if (!value) return null;
  const timestamp = Date.parse(value);
  if (
    !Number.isFinite(timestamp) ||
    timestamp < MINIMUM_DATE ||
    timestamp > MAXIMUM_DATE
  ) {
    return null;
  }
  return new Date(timestamp);
}

export async function GET(request: Request) {
  const requestedAt = requestedDateFrom(
    new URL(request.url).searchParams.get("at"),
  );
  if (!requestedAt) {
    return NextResponse.json(
      {
        error:
          "Provide an ISO date between 1900-01-01 and 2100-12-31 in the at parameter.",
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
