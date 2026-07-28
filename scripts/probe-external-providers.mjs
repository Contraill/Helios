import process from "node:process";

const nasaKey = process.env.NASA_API_KEY;
const requireKey = process.argv.includes("--require-key");
const timeoutMs = 15_000;
const today = new Date().toISOString().slice(0, 10);
const tomorrowDate = new Date();
tomorrowDate.setUTCDate(tomorrowDate.getUTCDate() + 1);
const tomorrow = tomorrowDate.toISOString().slice(0, 10);

const probes = [
  {
    id: "apod",
    url: `https://api.nasa.gov/planetary/apod?date=${today}${nasaKey ? `&api_key=${encodeURIComponent(nasaKey)}` : ""}`,
    requiresKey: true,
    validate: (value) =>
      typeof value?.date === "string" && typeof value?.title === "string",
  },
  {
    id: "donki",
    url: `https://api.nasa.gov/DONKI/FLR?startDate=${today}&endDate=${tomorrow}${nasaKey ? `&api_key=${encodeURIComponent(nasaKey)}` : ""}`,
    requiresKey: true,
    validate: Array.isArray,
  },
  {
    id: "neows",
    url: `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${tomorrow}${nasaKey ? `&api_key=${encodeURIComponent(nasaKey)}` : ""}`,
    requiresKey: true,
    validate: (value) => typeof value?.near_earth_objects === "object",
  },
  {
    id: "epic",
    url: "https://epic.gsfc.nasa.gov/api/natural",
    validate: Array.isArray,
  },
  {
    id: "eonet",
    url: "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=1",
    validate: (value) => Array.isArray(value?.events),
  },
  {
    id: "nasa-images",
    url: "https://images-api.nasa.gov/search?q=Mars&page_size=1&media_type=image",
    validate: (value) => Array.isArray(value?.collection?.items),
  },
  {
    id: "cneos-cad",
    url: "https://ssd-api.jpl.nasa.gov/cad.api?date-min=now&date-max=%2B7&dist-max=0.05&limit=1",
    validate: (value) =>
      value?.signature?.version === "1.5" && Array.isArray(value?.fields),
  },
  {
    id: "cneos-fireball",
    url: "https://ssd-api.jpl.nasa.gov/fireball.api?limit=1",
    validate: (value) =>
      value?.signature?.version === "1.2" && Array.isArray(value?.fields),
  },
];

const results = [];
let failed = false;
for (const probe of probes) {
  if (probe.requiresKey && !nasaKey) {
    results.push({
      id: probe.id,
      status: "skipped",
      reason: "NASA_API_KEY missing",
    });
    if (requireKey) failed = true;
    continue;
  }
  try {
    const response = await fetch(probe.url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Helios-provider-probe/1.0",
      },
      signal: AbortSignal.timeout(timeoutMs),
    });
    const value = await response.json();
    const valid = response.ok && probe.validate(value);
    results.push({
      id: probe.id,
      status: valid ? "ok" : "invalid",
      httpStatus: response.status,
    });
    if (!valid) failed = true;
  } catch (error) {
    results.push({
      id: probe.id,
      status: "error",
      reason: error instanceof Error ? error.message : String(error),
    });
    failed = true;
  }
}

for (const [id, url] of [
  [
    "gibs",
    "https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/1.0.0/WMTSCapabilities.xml",
  ],
  ["mars-trek", "https://trek.nasa.gov/mars/"],
  ["mercury-trek", "https://trek.nasa.gov/mercury/"],
]) {
  try {
    const response = await fetch(url, {
      method: id === "gibs" ? "GET" : "HEAD",
      signal: AbortSignal.timeout(timeoutMs),
    });
    const valid = response.ok;
    results.push({
      id,
      status: valid ? "ok" : "invalid",
      httpStatus: response.status,
    });
    if (!valid) failed = true;
  } catch (error) {
    results.push({
      id,
      status: "error",
      reason: error instanceof Error ? error.message : String(error),
    });
    failed = true;
  }
}

results.push({
  id: "insight",
  status: "historical-snapshot",
  reason: "No runtime endpoint is used by Helios.",
});

console.log(
  JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2),
);
if (failed) process.exitCode = 1;
