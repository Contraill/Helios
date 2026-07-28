const FALLBACK_SITE_URL = "https://heliios.vercel.app";

interface SiteUrlEnvironment {
  readonly [key: string]: string | undefined;
  readonly SITE_URL?: string;
  readonly VERCEL_PROJECT_PRODUCTION_URL?: string;
  readonly VERCEL_URL?: string;
}

export function resolveSiteUrl(
  environment: SiteUrlEnvironment = process.env,
): URL {
  const explicit = environment.SITE_URL?.trim();
  if (explicit) return httpUrl(explicit);

  const vercelHost =
    environment.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    environment.VERCEL_URL?.trim();
  if (vercelHost) {
    const origin = vercelHost.startsWith("http")
      ? vercelHost
      : `https://${vercelHost}`;
    return httpUrl(origin);
  }

  return httpUrl(FALLBACK_SITE_URL);
}

function httpUrl(value: string): URL {
  const url = new URL(value);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new TypeError("SITE_URL must use http or https.");
  }
  if (url.pathname !== "/" || url.search || url.hash) {
    throw new TypeError(
      "SITE_URL must be an origin without a path, query or hash.",
    );
  }
  return url;
}

export function absoluteSiteUrl(
  path: string,
  environment?: SiteUrlEnvironment,
): string {
  return new URL(path, resolveSiteUrl(environment)).toString();
}
