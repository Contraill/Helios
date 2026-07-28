import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { createJiti } from "jiti";

const root = process.cwd();
const budgets = JSON.parse(
  fs.readFileSync(path.join(root, "config/performance-budgets.json"), "utf8"),
);
const textureManifest = JSON.parse(
  fs.readFileSync(
    path.join(root, "scripts/data/texture-runtime-manifest.json"),
    "utf8",
  ),
);
const jiti = createJiti(path.join(root, "scripts/static-budget-runner.cjs"), {
  interopDefault: true,
  alias: { "@": path.join(root, "src") },
});
const { HIGH_VISUAL_CONTRACT } = jiti(
  path.join(root, "src/features/solar-system/lib/quality.ts"),
);
const { CELESTIAL_SCOPE } = jiti(
  path.join(root, "src/features/solar-system/lib/celestial-scope.ts"),
);
const { externalProviderContracts } = jiti(
  path.join(root, "src/lib/data/external/provider-contracts.ts"),
);
const sitemap = jiti(path.join(root, "src/app/sitemap.ts")).default;
const errors = [];

function expectEqual(label, actual, expected) {
  if (actual !== expected)
    errors.push(`${label}: expected ${expected}, received ${actual}.`);
}
function expectMaximum(label, actual, maximum) {
  if (actual > maximum) errors.push(`${label}: ${actual} exceeds ${maximum}.`);
}

expectEqual("visual contracts", 1, budgets.scene.visualContracts);
expectMaximum(
  "maximum DPR",
  HIGH_VISUAL_CONTRACT.dpr[1],
  budgets.scene.maxDevicePixelRatio,
);
expectMaximum(
  "local star count",
  HIGH_VISUAL_CONTRACT.starCount,
  budgets.scene.maxLocalStarCount,
);
expectMaximum(
  "orbit segments",
  HIGH_VISUAL_CONTRACT.orbitSegments,
  budgets.scene.maxOrbitSegments,
);
expectMaximum(
  "ring segments",
  HIGH_VISUAL_CONTRACT.ringSegments,
  budgets.scene.maxRingSegments,
);
expectMaximum(
  "runtime texture count",
  textureManifest.assets.length,
  budgets.textures.maxRuntimeAssets,
);

for (const asset of textureManifest.assets) {
  if (["primary-surface", "primary-layer"].includes(asset.kind)) {
    expectMaximum(
      `${asset.path} width`,
      asset.width,
      budgets.textures.primaryMaxWidth,
    );
    expectMaximum(
      `${asset.path} height`,
      asset.height,
      budgets.textures.primaryMaxHeight,
    );
  }
  if (asset.kind === "secondary-surface") {
    expectMaximum(
      `${asset.path} width`,
      asset.width,
      budgets.textures.secondaryMaxWidth,
    );
    expectMaximum(
      `${asset.path} height`,
      asset.height,
      budgets.textures.secondaryMaxHeight,
    );
  }
  if (asset.kind === "ring-albedo")
    expectMaximum(
      `${asset.path} height`,
      asset.height,
      budgets.textures.ringMaxHeight,
    );
}

expectEqual(
  "real bodies",
  CELESTIAL_SCOPE.realBodies,
  budgets.product.realBodies,
);
expectEqual(
  "system regions",
  CELESTIAL_SCOPE.systemRegions,
  budgets.product.systemRegions,
);
expectEqual(
  "detail destinations",
  CELESTIAL_SCOPE.detailDestinations,
  budgets.product.detailDestinations,
);
expectEqual(
  "external providers",
  Object.keys(externalProviderContracts).length,
  budgets.product.externalProviders,
);
expectEqual(
  "canonical sitemap entries",
  sitemap().length,
  budgets.product.canonicalSitemapEntries,
);

const searchableRoots = ["src/app", "src/components", "src/features"];
for (const directory of searchableRoots) {
  const stack = [path.join(root, directory)];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(absolute);
      else if (
        /\.(?:ts|tsx)$/.test(entry.name) &&
        !entry.name.includes(".test.")
      ) {
        const source = fs.readFileSync(absolute, "utf8");
        if (/QualitySelector|setQualityLevel/.test(source)) {
          errors.push(
            `${path.relative(root, absolute)}: retired user-facing quality control reference.`,
          );
        }
      }
    }
  }
}

if (errors.length) {
  console.error("Static budget audit failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log(
  JSON.stringify(
    {
      errors: [],
      scene: HIGH_VISUAL_CONTRACT,
      scope: CELESTIAL_SCOPE,
      providers: Object.keys(externalProviderContracts).length,
      sitemapEntries: sitemap().length,
      runtimeTextures: textureManifest.assets.length,
    },
    null,
    2,
  ),
);
