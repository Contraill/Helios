import "server-only";

import { parseServerEnv, type ServerEnv } from "./schema";

let cachedEnv: ServerEnv | null = null;

/**
 * Cached, validated server environment.
 *
 * Importing this module from client code fails at build time via the
 * `server-only` package — that architectural boundary (not a fragile
 * string-scan of build output) is what keeps API keys out of the client
 * bundle (03 §18).
 */
export function getServerEnv(): ServerEnv {
  cachedEnv ??= parseServerEnv(process.env);
  return cachedEnv;
}
