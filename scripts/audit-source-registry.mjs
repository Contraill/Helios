import path from "node:path";
import process from "node:process";

import { createJiti } from "jiti";

const root = process.cwd();
const jiti = createJiti(path.join(root, "scripts/source-audit-runner.cjs"), {
  interopDefault: true,
  alias: { "@": path.join(root, "src") },
});
const { planetaryReferenceSources } = jiti(
  path.join(root, "src/content/sources/planetary-reference.ts"),
);
const { externalProviderContracts } = jiti(
  path.join(root, "src/lib/data/external/provider-contracts.ts"),
);
const errors = [];
const ids = new Set();
const urls = new Set();

for (const source of planetaryReferenceSources) {
  if (ids.has(source.id)) errors.push(`Duplicate source id: ${source.id}.`);
  ids.add(source.id);
  const url = new URL(source.url);
  if (url.protocol !== "https:")
    errors.push(`${source.id}: source URL must use HTTPS.`);
  if (urls.has(source.url))
    errors.push(`${source.id}: duplicate source URL ${source.url}.`);
  urls.add(source.url);
  if (source.notes && (!source.notes.en?.trim() || !source.notes.tr?.trim())) {
    errors.push(`${source.id}: source note must include EN and TR.`);
  }
}

for (const contract of Object.values(externalProviderContracts)) {
  for (const field of ["origin", "documentationUrl"]) {
    if (new URL(contract[field]).protocol !== "https:") {
      errors.push(`${contract.id}: ${field} must use HTTPS.`);
    }
  }
}

if (errors.length) {
  console.error("Source registry audit failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log(
  `Source registry audit passed: ${planetaryReferenceSources.length} references and ${Object.keys(externalProviderContracts).length} provider contracts checked.`,
);
