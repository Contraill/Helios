const NASA_API_ORIGIN = "https://api.nasa.gov";

export interface NasaRequestInput {
  readonly apiKey: string;
  readonly params?: Readonly<Record<string, string | number | boolean>>;
  readonly path: `/${string}`;
}

export function buildNasaUrl({
  apiKey,
  params = {},
  path,
}: NasaRequestInput): URL {
  if (!apiKey.trim()) throw new Error("NASA API key is required.");
  if (!path.startsWith("/")) throw new Error("NASA API path must be absolute.");

  const url = new URL(path, NASA_API_ORIGIN);
  url.searchParams.set("api_key", apiKey);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  return url;
}
