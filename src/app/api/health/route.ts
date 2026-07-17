import { getServerEnv } from "@/lib/env/server";

/**
 * Health endpoint (05 — Faz 1).
 *
 * Cache behaviour is declared explicitly instead of relying on framework
 * defaults (03 §4): health must be evaluated on every request. The response
 * also proves the server environment parses — variable names may appear in
 * the error message, values never do.
 */
export const dynamic = "force-dynamic";

export function GET(): Response {
  try {
    getServerEnv();
  } catch (error) {
    return Response.json(
      {
        status: "error",
        message:
          error instanceof Error ? error.message : "Invalid server environment",
      },
      { status: 500 },
    );
  }

  return Response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
