import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createJiti } from "jiti";
import * as parse5 from "parse5";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

globalThis.React = React;

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

require.extensions[".css"] = (module) => {
  module.exports = new Proxy({}, { get: (_, key) => String(key) });
};

const jiti = createJiti(path.join(ROOT, "scripts/editorial-audit-runner.cjs"), {
  interopDefault: true,
  jsx: true,
  alias: { "@": path.join(ROOT, "src") },
});

const { HomePresentation } = jiti(
  path.join(ROOT, "src/features/home/components/home-experience.tsx"),
);
const { MissionsPresentation } = jiti(
  path.join(ROOT, "src/features/missions/components/missions-experience.tsx"),
);
const { MISSION_CATALOGUE, MISSION_PLANET_COUNT } = jiti(
  path.join(ROOT, "src/features/missions/lib/mission-catalogue.ts"),
);
const { MarsDetailPage } = jiti(
  path.join(
    ROOT,
    "src/features/planet-details/components/mars-detail-page.tsx",
  ),
);
const { PlanetDetailPage } = jiti(
  path.join(
    ROOT,
    "src/features/planet-details/components/planet-detail-page.tsx",
  ),
);
const { createPlanetDetailModel } = jiti(
  path.join(ROOT, "src/features/planet-details/lib/planet-detail-model.ts"),
);
const { getPlanetDetailContent } = jiti(
  path.join(ROOT, "src/content/planet-details/index.ts"),
);
const { planets } = jiti(path.join(ROOT, "src/content/planets/index.ts"));
const { createComparisonPlanets } = jiti(
  path.join(ROOT, "src/features/comparison/lib/create-comparison-planets.ts"),
);
const { BodyDetailPage } = jiti(
  path.join(ROOT, "src/features/body-details/components/body-detail-page.tsx"),
);
const {
  REAL_BODY_SLUGS,
  createNonPlanetBodyDetailModel,
  createRegionDetailModel,
} = jiti(path.join(ROOT, "src/features/body-details/lib/body-detail-model.ts"));
const { SYSTEM_REGION_IDS } = jiti(
  path.join(ROOT, "src/features/solar-system/types/celestial-body.ts"),
);

const apodMetadata = {
  provider: "NASA",
  sourceTitle: "Astronomy Picture of the Day",
  sourceUrl: "https://apod.nasa.gov/apod/",
  freshness: "latest-available",
  retrievedAt: "2026-07-26T00:00:00.000Z",
  attribution: "NASA",
};

function fail(message) {
  throw new Error(message);
}

function attr(node, name) {
  return node.attrs?.find((entry) => entry.name === name)?.value;
}

function elements(root) {
  const result = [];
  const visit = (node) => {
    if (node.nodeName && node.nodeName !== "#text") result.push(node);
    for (const child of node.childNodes ?? []) visit(child);
  };
  visit(root);
  return result;
}

function textContent(node) {
  if (node.nodeName === "#text") return node.value ?? "";
  return (node.childNodes ?? []).map(textContent).join("");
}

function auditMarkup(name, html, { expectedLanguage } = {}) {
  const document = parse5.parseFragment(html);
  const nodes = elements(document);
  const ids = nodes.map((node) => attr(node, "id")).filter(Boolean);
  const headings = nodes.filter((node) => node.nodeName === "h1");
  const mains = nodes.filter((node) => node.nodeName === "main");

  if (headings.length !== 1) {
    fail(`${name}: expected exactly one h1, found ${headings.length}`);
  }
  if (mains.length !== 0) {
    fail(`${name}: route content must not create a nested main landmark`);
  }
  if (new Set(ids).size !== ids.length) {
    fail(`${name}: duplicate HTML id detected`);
  }
  if (/\b(?:NaN|Infinity|undefined)\b/.test(textContent(document))) {
    fail(`${name}: non-finite or undefined text leaked into markup`);
  }

  for (const node of nodes) {
    for (const attributeName of ["aria-labelledby", "aria-describedby"]) {
      const references = (attr(node, attributeName) ?? "")
        .split(/\s+/u)
        .filter(Boolean);
      for (const reference of references) {
        if (!ids.includes(reference)) {
          fail(`${name}: ${attributeName} points to missing #${reference}`);
        }
      }
    }
  }

  const longParagraphs = nodes
    .filter((node) => node.nodeName === "p")
    .map((node) => textContent(node).replace(/\s+/gu, " ").trim())
    .filter((text) => text.length >= 80);
  const repeatedParagraph = longParagraphs.find(
    (text, index) => longParagraphs.indexOf(text) !== index,
  );
  if (repeatedParagraph) {
    fail(`${name}: repeated long paragraph detected`);
  }

  for (const link of nodes.filter((node) => node.nodeName === "a")) {
    const href = attr(link, "href") ?? "";
    const accessibleName = (
      attr(link, "aria-label") ?? textContent(link)
    ).trim();
    if (!accessibleName) {
      fail(`${name}: link has no accessible name`);
    }
    if (href.startsWith("#") && !ids.includes(href.slice(1))) {
      fail(`${name}: link points to missing ${href}`);
    }
    if (attr(link, "target") === "_blank") {
      const rel = new Set((attr(link, "rel") ?? "").split(/\s+/));
      if (!rel.has("noopener") || !rel.has("noreferrer")) {
        fail(`${name}: external new-tab link is missing safe rel attributes`);
      }
    }
  }

  if (expectedLanguage) {
    const article = nodes.find((node) => node.nodeName === "article");
    if (attr(article, "lang") !== expectedLanguage) {
      fail(`${name}: expected article lang=${expectedLanguage}`);
    }
  }

  return {
    heading: textContent(headings[0]).trim(),
    ids: ids.length,
    links: nodes.filter((node) => node.nodeName === "a").length,
  };
}

function auditHomeOrbitGeometry(html) {
  const document = parse5.parseFragment(html);
  const nodes = elements(document);
  const orbitGroups = nodes.filter((node) => attr(node, "data-home-orbit"));
  if (orbitGroups.length !== 3) {
    fail(
      `home: expected three decorative orbit groups, found ${orbitGroups.length}`,
    );
  }

  for (const group of orbitGroups) {
    const descendants = elements(group);
    const ellipse = descendants.find((node) => node.nodeName === "ellipse");
    const planet = descendants.find((node) => attr(node, "data-home-planet"));
    if (!ellipse || !planet) {
      fail(`home: ${attr(group, "data-home-orbit")} orbit is incomplete`);
    }
    const cx = Number(attr(ellipse, "cx"));
    const cy = Number(attr(ellipse, "cy"));
    const rx = Number(attr(ellipse, "rx"));
    const ry = Number(attr(ellipse, "ry"));
    const px = Number(attr(planet, "cx"));
    const py = Number(attr(planet, "cy"));
    const equation = ((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2;
    if (!Number.isFinite(equation) || Math.abs(equation - 1) > 1e-9) {
      fail(
        `home: ${attr(group, "data-home-orbit")} planet is not on its ellipse`,
      );
    }
  }
}

function auditEditorialCssContracts() {
  const globalsCss = fs.readFileSync(
    path.join(ROOT, "src/app/globals.css"),
    "utf8",
  );
  const bodyCss = fs.readFileSync(
    path.join(
      ROOT,
      "src/features/body-details/components/body-detail.module.css",
    ),
    "utf8",
  );
  const planetCss = fs.readFileSync(
    path.join(
      ROOT,
      "src/features/planet-details/components/planet-detail.module.css",
    ),
    "utf8",
  );
  const marsCss = fs.readFileSync(
    path.join(
      ROOT,
      "src/features/planet-details/components/mars-detail.module.css",
    ),
    "utf8",
  );

  if (
    !/\.site-skip-link\s*\{[^}]*position:\s*fixed;/su.test(globalsCss) ||
    !/\.site-shell\s*\{[^}]*position:\s*relative;[^}]*z-index:\s*1;/su.test(
      globalsCss,
    )
  ) {
    fail("ambient backdrop layering can override fixed skip-link positioning");
  }
  if (
    !/\.site-ambient-backdrop\s*\{[^}]*position:\s*fixed;/su.test(globalsCss)
  ) {
    fail("ambient backdrop must remain fixed and outside document flow");
  }
  if (!globalsCss.includes("-webkit-mask-image")) {
    fail("ambient backdrop masks are missing the WebKit compatibility path");
  }
  if (
    !/\.site-ambient-backdrop::after\s*\{[^}]*background-position:\s*0\s+2\.5rem,\s*2\.5rem\s+0;/su.test(
      globalsCss,
    )
  ) {
    fail(
      "ambient grid can paint a visible one-pixel strip at the viewport edge",
    );
  }
  if (planetCss.includes("--planet-editorial-ring")) {
    fail(
      "the one-dimensional Saturn ring strip is being stretched as a page image",
    );
  }
  if (!planetCss.includes('.visual[data-planet="saturn"] .visualRing')) {
    fail("Saturn editorial ring treatment is missing");
  }
  for (const [label, css] of [
    ["body", bodyCss],
    ["planet", planetCss],
    ["mars", marsCss],
  ]) {
    if (!css.includes("will-change: transform")) {
      fail(`${label}: editorial texture motion is not compositor-oriented`);
    }
  }
  const genericTextureIndex = bodyCss.indexOf(
    '.orbitHalo[data-has-image="true"] .world::before',
  );
  const starTextureIndex = bodyCss.indexOf(
    '.orbitHalo[data-has-image="true"][data-visual-kind="star"] .world',
  );
  if (genericTextureIndex < 0 || starTextureIndex <= genericTextureIndex) {
    fail(
      "Sun-specific editorial glow is not restored after generic texture styling",
    );
  }
}

auditEditorialCssContracts();

const reports = [];
const representationNotesByLocale = { en: new Set(), tr: new Set() };
const surfaceNotesByLocale = { en: new Set(), tr: new Set() };

for (const locale of ["en", "tr"]) {
  const home = renderToStaticMarkup(
    React.createElement(HomePresentation, {
      locale,
      metadata: apodMetadata,
      records: [],
      status: "unavailable",
    }),
  );
  auditHomeOrbitGeometry(home);
  const missions = renderToStaticMarkup(
    React.createElement(MissionsPresentation, {
      locale,
      missions: MISSION_CATALOGUE,
      planetCount: MISSION_PLANET_COUNT,
    }),
  );

  reports.push({
    name: `home-${locale}`,
    ...auditMarkup(`home-${locale}`, home, { expectedLanguage: locale }),
  });
  reports.push({
    name: `missions-${locale}`,
    ...auditMarkup(`missions-${locale}`, missions, {
      expectedLanguage: locale,
    }),
  });
}

for (const locale of ["en", "tr"]) {
  for (const planet of planets) {
    const content = getPlanetDetailContent(planet.id, locale);
    const model = createPlanetDetailModel(
      planet,
      planets,
      content.sourceIds,
      locale,
    );
    const element =
      planet.id === "mars"
        ? React.createElement(MarsDetailPage, { locale, model })
        : React.createElement(PlanetDetailPage, {
            content,
            locale,
            model,
            showHumanScale: planet.id !== "earth",
          });
    const html = renderToStaticMarkup(element);
    const report = auditMarkup(`planet-${planet.id}-${locale}`, html);

    const expectedTexture = `/textures/planets/${planet.id}.webp`;
    if (!html.includes(expectedTexture)) {
      fail(
        `planet-${planet.id}-${locale}: editorial texture contract is missing`,
      );
    }
    if (html.includes('href="/planet/')) {
      fail(
        `planet-${planet.id}-${locale}: legacy previous/next route leaked into markup`,
      );
    }
    reports.push({ name: `planet-${planet.id}-${locale}`, ...report });
  }

  for (const slug of REAL_BODY_SLUGS.filter(
    (candidate) => !planets.some(({ id }) => id === candidate),
  )) {
    const model = createNonPlanetBodyDetailModel(slug, locale);
    if (!model.visualAssetPath?.startsWith("/textures/")) {
      fail(`body-${slug}-${locale}: editorial texture path is missing`);
    }
    if (!model.visualGeometry) {
      fail(`body-${slug}-${locale}: editorial geometry is missing`);
    }
    representationNotesByLocale[locale].add(model.representationNote);
    surfaceNotesByLocale[locale].add(model.surfaceNote);
    const html = renderToStaticMarkup(
      React.createElement(BodyDetailPage, { locale, model }),
    );
    reports.push({
      name: `body-${slug}-${locale}`,
      ...auditMarkup(`body-${slug}-${locale}`, html),
    });
  }

  for (const regionId of SYSTEM_REGION_IDS) {
    const model = createRegionDetailModel(regionId, locale);
    if (model.visualAssetPath || model.visualGeometry) {
      fail(
        `region-${regionId}-${locale}: schematic region claimed a body texture`,
      );
    }
    representationNotesByLocale[locale].add(model.representationNote);
    surfaceNotesByLocale[locale].add(model.surfaceNote);
    const html = renderToStaticMarkup(
      React.createElement(BodyDetailPage, { locale, model }),
    );
    reports.push({
      name: `region-${regionId}-${locale}`,
      ...auditMarkup(`region-${regionId}-${locale}`, html),
    });
  }
}

const comparisonPlanets = createComparisonPlanets(planets);
for (const planet of comparisonPlanets) {
  if (planet.texturePath !== `/textures/planets/${planet.id}.webp`) {
    fail(`${planet.id}: comparison texture path is not canonical`);
  }
}

for (const noteKind of [
  ["representation", representationNotesByLocale],
  ["surface", surfaceNotesByLocale],
]) {
  const [label, notes] = noteKind;
  if (notes.tr.size !== notes.en.size) {
    fail(
      `${label} note localization collapsed ${notes.en.size} English variants into ${notes.tr.size} Turkish variants`,
    );
  }
}

process.stdout.write(
  `${JSON.stringify(
    {
      auditedAt: new Date().toISOString(),
      errors: [],
      surfaces: reports,
      total: reports.length,
      visualContracts: {
        planetPortraits: planets.length,
        nonPlanetPortraits: REAL_BODY_SLUGS.length - planets.length,
        schematicRegions: SYSTEM_REGION_IDS.length,
        comparisonPortraits: comparisonPlanets.length,
      },
    },
    null,
    2,
  )}\n`,
);
