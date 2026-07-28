import path from "node:path";
import { createRequire } from "node:module";

import React from "react";
import { createJiti } from "jiti";

const ROOT = process.cwd();
const require = createRequire(import.meta.url);
globalThis.React = React;
require.extensions[".css"] = (module) => {
  module.exports = new Proxy({}, { get: (_, property) => String(property) });
};

const jiti = createJiti(path.join(ROOT, "scripts/route-audit-runner.cjs"), {
  interopDefault: true,
  jsx: true,
  alias: {
    "@": path.join(ROOT, "src"),
    "server-only": path.join(ROOT, "scripts/audit-server-only-stub.cjs"),
  },
});

const { default: sitemap } = jiti(path.join(ROOT, "src/app/sitemap.ts"));
const { default: robots } = jiti(path.join(ROOT, "src/app/robots.ts"));
const staticRoutes = [
  ["home", "/", jiti(path.join(ROOT, "src/app/page.tsx")), true],
  ["Explore", "/explore", jiti(path.join(ROOT, "src/app/explore/page.tsx"))],
  ["Compare", "/compare", jiti(path.join(ROOT, "src/app/compare/page.tsx"))],
  ["Missions", "/missions", jiti(path.join(ROOT, "src/app/missions/page.tsx"))],
  ["Data", "/data", jiti(path.join(ROOT, "src/app/data/page.tsx"))],
  ["About", "/about", jiti(path.join(ROOT, "src/app/about/page.tsx"))],
  [
    "Case study",
    "/case-study",
    jiti(path.join(ROOT, "src/app/case-study/page.tsx")),
  ],
];
const bodyRoute = jiti(path.join(ROOT, "src/app/body/[slug]/page.tsx"));
const regionRoute = jiti(path.join(ROOT, "src/app/region/[slug]/page.tsx"));
const planetRoute = jiti(path.join(ROOT, "src/app/planet/[slug]/page.tsx"));
const objectRoute = jiti(path.join(ROOT, "src/app/object/[slug]/page.tsx"));
const { CELESTIAL_DETAIL_SLUGS, REAL_BODY_SLUGS, celestialDetailHref } = jiti(
  path.join(ROOT, "src/features/solar-system/lib/celestial-detail-routes.ts"),
);
const { SYSTEM_REGION_IDS } = jiti(
  path.join(ROOT, "src/features/solar-system/types/celestial-body.ts"),
);
const { planetIds } = jiti(path.join(ROOT, "src/content/planets/index.ts"));
const { EXTENDED_BODY_IDS } = jiti(
  path.join(ROOT, "src/features/solar-system/types/celestial-body.ts"),
);

function fail(message) {
  throw new Error(message);
}

function canonicalPath(metadata) {
  const canonical = metadata.alternates?.canonical;
  if (typeof canonical === "string") return canonical;
  return canonical?.url ?? null;
}

function metadataText(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "absolute" in value) {
    return String(value.absolute);
  }
  return "";
}

function auditMetadataFields(
  metadata,
  label,
  expectedCanonical,
  allowUntitled = false,
) {
  const canonical = canonicalPath(metadata);
  if (canonical !== expectedCanonical) {
    fail(
      `${label}: expected canonical ${expectedCanonical}, received ${canonical}`,
    );
  }

  const title = metadataText(metadata.title);
  const description = metadataText(metadata.description);
  if (!allowUntitled && !title) fail(`${label}: title is missing`);
  if (!description) fail(`${label}: description is missing`);
  if (title.length > 72) fail(`${label}: title exceeds 72 characters`);
  if (description.length > 180) {
    fail(`${label}: description exceeds 180 characters`);
  }

  const openGraphTitle = metadataText(metadata.openGraph?.title);
  const openGraphDescription = metadataText(metadata.openGraph?.description);
  const openGraphUrl = metadata.openGraph?.url;
  if (!openGraphTitle || !openGraphDescription || !openGraphUrl) {
    fail(`${label}: Open Graph title, description or URL is missing`);
  }
  if (String(openGraphUrl) !== expectedCanonical) {
    fail(`${label}: Open Graph URL does not match the canonical route`);
  }

  const twitterTitle = metadataText(metadata.twitter?.title);
  const twitterDescription = metadataText(metadata.twitter?.description);
  if (!twitterTitle || !twitterDescription) {
    fail(`${label}: Twitter title or description is missing`);
  }
  if (
    openGraphDescription !== description ||
    twitterDescription !== description
  ) {
    fail(`${label}: social descriptions diverge from page metadata`);
  }

  return {
    canonical,
    description,
    descriptionLength: description.length,
    title,
    titleLength: title.length,
  };
}

async function auditMetadata(route, slugs, expectedPath) {
  const results = [];
  for (const slug of slugs) {
    const metadata = await route.generateMetadata({
      params: Promise.resolve({ slug }),
    });
    const expected = expectedPath(slug);
    results.push(auditMetadataFields(metadata, slug, expected));
  }
  return results;
}

const entries = sitemap();
const paths = entries.map(({ url }) => new URL(url).pathname);
const expectedStaticRoutes = [
  "/",
  "/explore",
  "/compare",
  "/missions",
  "/data",
  "/about",
  "/case-study",
];

if (
  paths.length !==
  expectedStaticRoutes.length + CELESTIAL_DETAIL_SLUGS.length
) {
  fail(`sitemap entry count mismatch: ${paths.length}`);
}
if (new Set(paths).size !== paths.length)
  fail("sitemap contains duplicate URLs");
for (const route of expectedStaticRoutes) {
  if (!paths.includes(route)) fail(`sitemap is missing ${route}`);
}
for (const slug of CELESTIAL_DETAIL_SLUGS) {
  const href = celestialDetailHref(slug);
  if (!paths.includes(href)) fail(`sitemap is missing ${href}`);
}
if (paths.some((route) => route.startsWith("/planet/"))) {
  fail("sitemap contains legacy planet routes");
}
if (paths.some((route) => route.startsWith("/object/"))) {
  fail("sitemap contains legacy object routes");
}

const robotsPolicy = robots();
const rules = Array.isArray(robotsPolicy.rules)
  ? robotsPolicy.rules
  : [robotsPolicy.rules];
if (!rules.some((rule) => rule.allow === "/" && rule.disallow === "/api/")) {
  fail("robots policy does not allow the site while excluding API routes");
}
if (!String(robotsPolicy.sitemap).endsWith("/sitemap.xml")) {
  fail("robots policy does not expose sitemap.xml");
}

const staticMetadata = [];
for (const [
  label,
  expectedCanonical,
  route,
  allowUntitled = false,
] of staticRoutes) {
  const metadata = await route.generateMetadata();
  staticMetadata.push(
    auditMetadataFields(metadata, label, expectedCanonical, allowUntitled),
  );
}

const metadata = {
  static: staticMetadata,
  bodies: await auditMetadata(
    bodyRoute,
    REAL_BODY_SLUGS,
    (slug) => `/body/${slug}`,
  ),
  regions: await auditMetadata(
    regionRoute,
    SYSTEM_REGION_IDS,
    (slug) => `/region/${slug}`,
  ),
  legacyPlanets: await auditMetadata(
    planetRoute,
    planetIds,
    (slug) => `/body/${slug}`,
  ),
  legacyObjects: await auditMetadata(
    objectRoute,
    EXTENDED_BODY_IDS,
    (slug) => `/body/${slug}`,
  ),
};

const canonicalMetadata = [
  ...metadata.static,
  ...metadata.bodies,
  ...metadata.regions,
];
for (const field of ["title", "description"]) {
  const values = canonicalMetadata
    .map((entry) => entry[field].trim())
    .filter(Boolean);
  const duplicate = values.find(
    (value, index) => values.indexOf(value) !== index,
  );
  if (duplicate) {
    fail(`canonical metadata contains a duplicate ${field}: ${duplicate}`);
  }
}

process.stdout.write(
  `${JSON.stringify(
    {
      auditedAt: new Date().toISOString(),
      errors: [],
      metadataCounts: Object.fromEntries(
        Object.entries(metadata).map(([key, values]) => [key, values.length]),
      ),
      sitemapEntries: paths.length,
    },
    null,
    2,
  )}\n`,
);
