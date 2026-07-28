import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import ts from "typescript";

const root = process.cwd();
const contractsPath = path.join(
  root,
  "src/lib/data/external/provider-contracts.ts",
);
const source = fs.readFileSync(contractsPath, "utf8");
const output = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: contractsPath,
}).outputText;
const cjsModule = { exports: {} };
new Function("exports", "module", "require", output)(
  cjsModule.exports,
  cjsModule,
  () => {
    throw new Error("Provider contracts must not require runtime modules.");
  },
);
const contracts = cjsModule.exports.externalProviderContracts;
const errors = [];
const ids = Object.keys(contracts);
const providerNames = Object.values(contracts).map(({ name }) => name);

if (ids.length !== 12) {
  errors.push(`Expected 12 provider contracts, found ${ids.length}.`);
}
if (new Set(providerNames).size !== providerNames.length) {
  errors.push("Provider display names must be unique.");
}

for (const [id, contract] of Object.entries(contracts)) {
  if (contract.id !== id) errors.push(`${id}: contract id mismatch.`);
  for (const field of [
    "name",
    "origin",
    "endpoint",
    "documentationUrl",
    "notes",
  ]) {
    if (!String(contract[field] ?? "").trim()) {
      errors.push(`${id}: missing ${field}.`);
    }
  }
  for (const field of ["origin", "documentationUrl"]) {
    try {
      const url = new URL(contract[field]);
      if (url.protocol !== "https:")
        errors.push(`${id}: ${field} must use HTTPS.`);
    } catch {
      errors.push(`${id}: ${field} is not a valid URL.`);
    }
  }
  if (contract.authentication === "historical-snapshot") {
    if (contract.timeoutMs !== 0 || contract.revalidateSeconds !== 0) {
      errors.push(
        `${id}: historical snapshots must not define network timing.`,
      );
    }
  } else if (contract.timeoutMs <= 0 || contract.revalidateSeconds <= 0) {
    if (!id.endsWith("-trek")) {
      errors.push(
        `${id}: runtime providers need positive timeout and cache values.`,
      );
    }
  }
  if (id === "cneos-cad" && contract.expectedApiVersion !== "1.5") {
    errors.push("cneos-cad: expected API version must remain 1.5.");
  }
  if (id === "cneos-fireball" && contract.expectedApiVersion !== "1.2") {
    errors.push("cneos-fireball: expected API version must remain 1.2.");
  }
}

const providerSource = fs.readFileSync(
  path.join(root, "src/lib/data/external/providers/space-data.server.ts"),
  "utf8",
);
if (/metadata\(\s*["'](?:NASA|JPL)/u.test(providerSource)) {
  errors.push(
    "Runtime metadata must use provider IDs instead of hard-coded provider names.",
  );
}
const snapshotSource = fs.readFileSync(
  path.join(root, "src/content/snapshots/external-data.ts"),
  "utf8",
);
const hardCodedSnapshotProviders = [
  ...snapshotSource.matchAll(/provider:\s*["']([^"']+)["']/gu),
].map((match) => match[1]);
const allowedSnapshotProviders = new Set(["NASA NeoWs / JPL CNEOS"]);
for (const provider of hardCodedSnapshotProviders) {
  if (!allowedSnapshotProviders.has(provider)) {
    errors.push(
      `Snapshot provider ${provider} must come from the central provider registry.`,
    );
  }
}
if (providerSource.includes("/insight_weather/")) {
  errors.push(
    "Runtime provider code must not call the retired InSight weather path.",
  );
}
if (
  !providerSource.includes(
    'externalProviderContracts["cneos-cad"].expectedApiVersion',
  )
) {
  errors.push("CAD parser is not pinned to the central provider contract.");
}
if (
  !providerSource.includes(
    'externalProviderContracts["cneos-fireball"].expectedApiVersion',
  )
) {
  errors.push(
    "Fireball parser is not pinned to the central provider contract.",
  );
}

if (errors.length) {
  console.error("Provider contract audit failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Provider contract audit passed: ${ids.length} providers checked.`);
