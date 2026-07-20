import { NextResponse } from "next/server";

import {
  HorizonsError,
  loadHorizonsEphemeris,
} from "@/lib/data/ephemeris/horizons.server";
import { fallbackBundleFor } from "@/lib/data/ephemeris/horizons-snapshot";

import { requestedDateFrom, requestRangeFrom } from "./request-parameters";

export const dynamic = "force-dynamic";

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
