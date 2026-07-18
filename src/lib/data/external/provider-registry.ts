import type { ProviderId } from "./types";

export interface ProviderPolicy {
  readonly id: ProviderId;
  readonly name: string;
  readonly origin: string;
  readonly authentication: "nasa-api-key" | "none";
}

export const providerPolicies = {
  apod: {
    id: "apod",
    name: "NASA APOD",
    origin: "https://api.nasa.gov",
    authentication: "nasa-api-key",
  },
  donki: {
    id: "donki",
    name: "NASA DONKI",
    origin: "https://api.nasa.gov",
    authentication: "nasa-api-key",
  },
  neows: {
    id: "neows",
    name: "NASA NeoWs",
    origin: "https://api.nasa.gov",
    authentication: "nasa-api-key",
  },
  insight: {
    id: "insight",
    name: "NASA InSight Weather Service",
    origin: "https://api.nasa.gov",
    authentication: "nasa-api-key",
  },
  epic: {
    id: "epic",
    name: "NASA EPIC",
    origin: "https://epic.gsfc.nasa.gov",
    authentication: "none",
  },
  eonet: {
    id: "eonet",
    name: "NASA EONET",
    origin: "https://eonet.gsfc.nasa.gov",
    authentication: "none",
  },
  gibs: {
    id: "gibs",
    name: "NASA Earthdata GIBS",
    origin: "https://gibs.earthdata.nasa.gov",
    authentication: "none",
  },
  "nasa-images": {
    id: "nasa-images",
    name: "NASA Image and Video Library",
    origin: "https://images-api.nasa.gov",
    authentication: "none",
  },
  "mars-trek": {
    id: "mars-trek",
    name: "NASA Mars Trek",
    origin: "https://trek.nasa.gov",
    authentication: "none",
  },
  "mercury-trek": {
    id: "mercury-trek",
    name: "NASA Mercury Trek",
    origin: "https://trek.nasa.gov",
    authentication: "none",
  },
  "cneos-cad": {
    id: "cneos-cad",
    name: "JPL CNEOS Close-Approach Data",
    origin: "https://ssd-api.jpl.nasa.gov",
    authentication: "none",
  },
  "cneos-fireball": {
    id: "cneos-fireball",
    name: "JPL CNEOS Fireball Data",
    origin: "https://ssd-api.jpl.nasa.gov",
    authentication: "none",
  },
} as const satisfies Record<ProviderId, ProviderPolicy>;
