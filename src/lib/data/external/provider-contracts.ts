import type { DataFreshness } from "@/lib/data/schemas/source";

import type { ProviderId } from "./types";

export interface ExternalProviderContract {
  readonly id: ProviderId;
  readonly name: string;
  readonly origin: string;
  readonly endpoint: string;
  readonly documentationUrl: string;
  readonly authentication: "nasa-api-key" | "none" | "historical-snapshot";
  readonly freshness: DataFreshness;
  readonly timeoutMs: number;
  readonly revalidateSeconds: number;
  readonly expectedApiVersion?: string;
  readonly fallback: "verified-snapshot" | "static-catalogue";
  readonly notes: string;
}

export const externalProviderContracts = {
  apod: {
    id: "apod",
    name: "NASA Astronomy Picture of the Day",
    origin: "https://api.nasa.gov",
    endpoint: "/planetary/apod",
    documentationUrl: "https://api.nasa.gov/",
    authentication: "nasa-api-key",
    freshness: "latest-available",
    timeoutMs: 5_000,
    revalidateSeconds: 86_400,
    fallback: "verified-snapshot",
    notes:
      "Daily archive content; media dates remain visible in the interface.",
  },
  donki: {
    id: "donki",
    name: "NASA DONKI",
    origin: "https://api.nasa.gov",
    endpoint: "/DONKI/*",
    documentationUrl: "https://api.nasa.gov/",
    authentication: "nasa-api-key",
    freshness: "latest-available",
    timeoutMs: 5_000,
    revalidateSeconds: 1_800,
    fallback: "verified-snapshot",
    notes:
      "A partial status is retained when only some event families respond.",
  },
  neows: {
    id: "neows",
    name: "NASA NeoWs",
    origin: "https://api.nasa.gov",
    endpoint: "/neo/rest/v1/feed",
    documentationUrl: "https://api.nasa.gov/",
    authentication: "nasa-api-key",
    freshness: "latest-available",
    timeoutMs: 5_000,
    revalidateSeconds: 10_800,
    fallback: "verified-snapshot",
    notes: "Potentially hazardous is a classification, not an impact forecast.",
  },
  insight: {
    id: "insight",
    name: "NASA/JPL-Caltech InSight historical archive",
    origin: "https://science.nasa.gov/mission/insight/",
    endpoint: "bundled historical snapshot",
    documentationUrl: "https://science.nasa.gov/mission/insight/",
    authentication: "historical-snapshot",
    freshness: "historical",
    timeoutMs: 0,
    revalidateSeconds: 0,
    fallback: "verified-snapshot",
    notes:
      "No current Open APIs endpoint is treated as a production dependency. Helios displays a dated landing-site observation only.",
  },
  epic: {
    id: "epic",
    name: "NASA DSCOVR EPIC",
    origin: "https://epic.gsfc.nasa.gov",
    endpoint: "/api/natural",
    documentationUrl: "https://epic.gsfc.nasa.gov/about/api",
    authentication: "none",
    freshness: "latest-available",
    timeoutMs: 5_000,
    revalidateSeconds: 10_800,
    fallback: "verified-snapshot",
    notes: "Natural-color archive records; capture time is shown explicitly.",
  },
  eonet: {
    id: "eonet",
    name: "NASA EONET",
    origin: "https://eonet.gsfc.nasa.gov",
    endpoint: "/api/v3/events",
    documentationUrl: "https://eonet.gsfc.nasa.gov/docs/v3",
    authentication: "none",
    freshness: "near-live",
    timeoutMs: 5_000,
    revalidateSeconds: 1_800,
    fallback: "verified-snapshot",
    notes: "Natural-event context, not an emergency-warning service.",
  },
  gibs: {
    id: "gibs",
    name: "NASA EOSDIS GIBS",
    origin: "https://gibs.earthdata.nasa.gov",
    endpoint: "/wmts/epsg4326/best/1.0.0/WMTSCapabilities.xml",
    documentationUrl: "https://www.earthdata.nasa.gov/data/tools/gibs",
    authentication: "none",
    freshness: "latest-available",
    timeoutMs: 15_000,
    revalidateSeconds: 86_400,
    fallback: "static-catalogue",
    notes:
      "Layer timestamps and color treatment remain visible beside imagery.",
  },
  "nasa-images": {
    id: "nasa-images",
    name: "NASA Image and Video Library",
    origin: "https://images-api.nasa.gov",
    endpoint: "/search",
    documentationUrl:
      "https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf",
    authentication: "none",
    freshness: "latest-available",
    timeoutMs: 5_000,
    revalidateSeconds: 259_200,
    fallback: "verified-snapshot",
    notes:
      "Search results are normalized and limited before reaching the page.",
  },
  "mars-trek": {
    id: "mars-trek",
    name: "NASA Solar System Treks — Mars Trek",
    origin: "https://trek.nasa.gov",
    endpoint: "/mars/",
    documentationUrl: "https://trek.nasa.gov/",
    authentication: "none",
    freshness: "reference",
    timeoutMs: 0,
    revalidateSeconds: 0,
    fallback: "static-catalogue",
    notes:
      "Helios links to dated, curated regions; it does not proxy the map application.",
  },
  "mercury-trek": {
    id: "mercury-trek",
    name: "NASA Solar System Treks — Mercury Trek",
    origin: "https://trek.nasa.gov",
    endpoint: "/mercury/",
    documentationUrl: "https://trek.nasa.gov/",
    authentication: "none",
    freshness: "reference",
    timeoutMs: 0,
    revalidateSeconds: 0,
    fallback: "static-catalogue",
    notes: "Reference link only; no live telemetry or embedded map claim.",
  },
  "cneos-cad": {
    id: "cneos-cad",
    name: "JPL CNEOS Close-Approach Data",
    origin: "https://ssd-api.jpl.nasa.gov",
    endpoint: "/cad.api",
    documentationUrl: "https://ssd-api.jpl.nasa.gov/doc/cad.html",
    authentication: "none",
    freshness: "latest-available",
    timeoutMs: 10_000,
    revalidateSeconds: 10_800,
    expectedApiVersion: "1.5",
    fallback: "verified-snapshot",
    notes:
      "Response signature is rejected when its documented version changes.",
  },
  "cneos-fireball": {
    id: "cneos-fireball",
    name: "JPL CNEOS Fireball Data",
    origin: "https://ssd-api.jpl.nasa.gov",
    endpoint: "/fireball.api",
    documentationUrl: "https://ssd-api.jpl.nasa.gov/doc/fireball.html",
    authentication: "none",
    freshness: "historical",
    timeoutMs: 5_000,
    revalidateSeconds: 86_400,
    expectedApiVersion: "1.2",
    fallback: "verified-snapshot",
    notes:
      "Radiated energy and estimated impact energy remain separate fields.",
  },
} as const satisfies Record<ProviderId, ExternalProviderContract>;

export function providerContract(id: ProviderId): ExternalProviderContract {
  return externalProviderContracts[id];
}

export function providerName(id: ProviderId): string {
  return externalProviderContracts[id].name;
}
