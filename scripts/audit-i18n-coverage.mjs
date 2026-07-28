import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { createJiti } from "jiti";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

globalThis.React = React;

const root = process.cwd();
const jiti = createJiti(path.join(root, "scripts/i18n-audit-runner.cjs"), {
  interopDefault: true,
  jsx: true,
  alias: { "@": path.join(root, "src") },
});

const catalogues = [
  ["site", "src/lib/i18n/site-copy.ts", "siteCopy"],
  ["landing", "src/lib/i18n/landing-copy.ts", "landingCopy"],
  ["comparison", "src/lib/i18n/comparison-copy.ts", "comparisonCopy"],
  ["data", "src/lib/i18n/data-page-copy.ts", "dataPageCopy"],
  ["editorial", "src/lib/i18n/editorial-page-copy.ts", "editorialPageCopy"],
  ["body page", "src/lib/i18n/body-page-copy.ts", "bodyPageCopy"],
  ["planet page", "src/lib/i18n/planet-page-copy.ts", "planetPageCopy"],
  [
    "Explore page",
    "src/lib/i18n/explore-page-copy.ts",
    "explorePageCopyByLocale",
  ],
  [
    "Explore scene",
    "src/lib/i18n/explore-scene-copy.ts",
    "exploreSceneCopyByLocale",
  ],
  ["space data", "src/lib/i18n/space-data-copy.ts", "spaceDataCopy"],
];

const errors = [];

const englishLocaleLeakPatterns = [
  /\bgüncel\b/iu,
  /\bkaynak\b/iu,
  /\byörünge\b/iu,
  /\bgezegen\b/iu,
  /\buydu\b/iu,
  /\bgörsel\b/iu,
  /\bmekânsal\b/iu,
  /\bsunucu\b/iu,
  /\bdoğrula(?:r|nmış|ma)?\b/iu,
  /\bAlan modeli\b/iu,
];

function checkEnglishLocaleLeak(value, location) {
  if (typeof value !== "string") return;
  for (const pattern of englishLocaleLeakPatterns) {
    if (pattern.test(value)) {
      errors.push(
        `${location}: likely Turkish text leaked into the English catalogue.`,
      );
      return;
    }
  }
}

const turkishLocaleLeakPatterns = [
  /\bsnapshot\b/iu,
  /\bfallback\b/iu,
  /\brender(?:er)?\b/iu,
  /\bruntime\b/iu,
  /\bpayload\b/iu,
  /\bprovider\b/iu,
  /\btexture\b/iu,
  /\basset\b/iu,
  /\broute\b/iu,
  /\bprosedürel\b/iu,
];

function checkTurkishLocaleLeak(value, location) {
  if (typeof value !== "string") return;
  for (const pattern of turkishLocaleLeakPatterns) {
    if (pattern.test(value)) {
      errors.push(
        `${location}: untranslated implementation term leaked into the Turkish catalogue.`,
      );
      return;
    }
  }
}

function kind(value) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

function compareShape(en, tr, location) {
  const enKind = kind(en);
  const trKind = kind(tr);
  if (enKind !== trKind) {
    errors.push(`${location}: EN is ${enKind}, TR is ${trKind}.`);
    return;
  }
  if (enKind === "string") {
    if (!en.trim() || !tr.trim())
      errors.push(`${location}: empty translation.`);
    checkEnglishLocaleLeak(en, `${location}.en`);
    checkTurkishLocaleLeak(tr, `${location}.tr`);
    return;
  }
  if (enKind === "function") return;
  if (enKind === "array") {
    if (en.length !== tr.length) {
      errors.push(`${location}: array length ${en.length} / ${tr.length}.`);
      return;
    }
    en.forEach((value, index) =>
      compareShape(value, tr[index], `${location}[${index}]`),
    );
    return;
  }
  if (enKind !== "object") return;
  const enKeys = Object.keys(en).sort();
  const trKeys = Object.keys(tr).sort();
  if (enKeys.join("\0") !== trKeys.join("\0")) {
    errors.push(
      `${location}: key mismatch (${enKeys.join(", ")} / ${trKeys.join(", ")}).`,
    );
    return;
  }
  for (const key of enKeys)
    compareShape(en[key], tr[key], `${location}.${key}`);
}

const directTurkishSources = [
  "src/content/planet-details/tr.ts",
  "src/features/body-details/lib/body-detail-copy.tr.ts",
  "src/features/body-details/lib/extended-body-copy.tr.ts",
  "src/features/body-details/lib/region-detail-copy.tr.ts",
];

for (const relativePath of directTurkishSources) {
  const source = fs.readFileSync(path.join(root, relativePath), "utf8");
  for (const pattern of turkishLocaleLeakPatterns) {
    if (pattern.test(source)) {
      errors.push(
        `${relativePath}: untranslated implementation term leaked into Turkish content.`,
      );
      break;
    }
  }
}

for (const [label, relativePath, exportName] of catalogues) {
  const loadedModule = jiti(path.join(root, relativePath));
  const catalogue = loadedModule[exportName];
  if (!catalogue?.en || !catalogue?.tr) {
    errors.push(`${label}: missing EN/TR catalogue export ${exportName}.`);
    continue;
  }
  compareShape(catalogue.en, catalogue.tr, label);
}

const { CELESTIAL_DETAIL_SLUGS, detailDescription } = jiti(
  path.join(root, "src/features/body-details/lib/body-detail-model.ts"),
);
for (const locale of ["en", "tr"]) {
  const descriptions = CELESTIAL_DETAIL_SLUGS.map((slug) => ({
    slug,
    value: detailDescription(slug, locale).replace(/\s+/gu, " ").trim(),
  }));
  for (const { slug, value } of descriptions) {
    if (!value)
      errors.push(`${locale}:${slug}: metadata description is empty.`);
    if (value.length > 180) {
      errors.push(
        `${locale}:${slug}: metadata description exceeds 180 characters.`,
      );
    }
  }
  const duplicate = descriptions.find(
    ({ value }, index) =>
      descriptions.findIndex((entry) => entry.value === value) !== index,
  );
  if (duplicate) {
    errors.push(
      `${locale}:${duplicate.slug}: metadata description duplicates another detail page.`,
    );
  }
}

const site = jiti(path.join(root, "src/lib/i18n/site-copy.ts")).siteCopy;
if (
  site.en.a11y.localeCoverage !== "Language" ||
  site.tr.a11y.localeCoverage !== "Dil"
) {
  errors.push(
    "Locale switcher label must identify the language control in both locales.",
  );
}

const requiredLocalizedRoutes = [
  "src/app/page.tsx",
  "src/app/explore/page.tsx",
  "src/app/compare/page.tsx",
  "src/app/missions/page.tsx",
  "src/app/data/page.tsx",
  "src/app/about/page.tsx",
  "src/app/case-study/page.tsx",
  "src/app/body/[slug]/page.tsx",
  "src/app/region/[slug]/page.tsx",
  "src/app/planet/[slug]/page.tsx",
  "src/app/object/[slug]/page.tsx",
];
for (const relativePath of requiredLocalizedRoutes) {
  const source = fs.readFileSync(path.join(root, relativePath), "utf8");
  if (!source.includes("getRequestLocale")) {
    errors.push(`${relativePath}: server locale is not resolved.`);
  }
}

const productionFiles = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (/\.(?:ts|tsx)$/.test(entry.name) && !entry.name.includes(".test."))
      productionFiles.push(absolute);
  }
}
walk(path.join(root, "src"));
for (const file of productionFiles) {
  const source = fs.readFileSync(file, "utf8");
  if (source.includes("uiStrings.pages.explore")) {
    errors.push(
      `${path.relative(root, file)}: retired English-only Explore copy import.`,
    );
  }
}

const socialImage = fs.readFileSync(
  path.join(root, "src/app/social-image.tsx"),
  "utf8",
);
if (
  !socialImage.includes("Solar System / Güneş Sistemi") ||
  !socialImage.includes("Dünyalar, hareket ve ölçek")
) {
  errors.push("Social preview image must remain bilingual and product-facing.");
}

const requestLocale = fs.readFileSync(
  path.join(root, "src/lib/i18n/request-locale.server.ts"),
  "utf8",
);
const switcher = fs.readFileSync(
  path.join(root, "src/components/layout/locale-switcher.tsx"),
  "utf8",
);
if (
  !requestLocale.includes("LOCALE_COOKIE_KEY") ||
  !switcher.includes("router.refresh")
) {
  errors.push("Cookie-backed server locale refresh contract is incomplete.");
}

const layout = fs.readFileSync(path.join(root, "src/app/layout.tsx"), "utf8");
if (!layout.includes("<LocaleProvider initialLocale={locale}>")) {
  errors.push(
    "Request locale is not passed from the root layout to client surfaces.",
  );
}
if (
  fs.existsSync(path.join(root, "src/components/layout/locale-runtime.tsx"))
) {
  errors.push("Retired post-hydration locale runtime is still present.");
}

const { LocaleProvider, useLocaleStore } = jiti(
  path.join(root, "src/stores/locale-store.tsx"),
);
function LocaleProbe() {
  const locale = useLocaleStore((state) => state.locale);
  return React.createElement("output", null, locale);
}
const firstRender = renderToStaticMarkup(
  React.createElement(
    LocaleProvider,
    { initialLocale: "tr" },
    React.createElement(LocaleProbe),
  ),
);
if (firstRender !== "<output>tr</output>") {
  errors.push("Client surfaces do not receive Turkish on the first render.");
}

if (errors.length) {
  console.error("Language coverage audit failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log(
  `Language coverage audit passed: ${catalogues.length} paired catalogues and ${requiredLocalizedRoutes.length} server routes checked.`,
);
