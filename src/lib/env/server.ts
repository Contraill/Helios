import "server-only";

import { parseServerEnv, type ServerEnv } from "./schema";

let cachedEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  cachedEnv ??= parseServerEnv(process.env);
  return cachedEnv;
}

export function resetServerEnvCache(): void {
  cachedEnv = null;
}
