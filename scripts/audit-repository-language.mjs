import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const ignoredDirectories = new Set([
  ".git",
  ".next",
  "node_modules",
  "playwright-report",
  "test-artifacts",
  "test-results",
]);
const includedRoots = [
  "README.md",
  ".gitignore",
  ".github",
  "docs",
  "e2e",
  "scripts",
  "src",
  "test",
];
const readableExtensions = new Set([
  ".cjs",
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".py",
  ".ts",
  ".tsx",
  ".txt",
  ".yml",
  ".yaml",
]);
const selfPath = path.join(root, "scripts/audit-repository-language.mjs");

const fromCodes = (codes) => String.fromCharCode(...codes);
const reservedMarkers = [
  [67, 104, 97, 116, 71, 80, 84],
  [67, 108, 97, 117, 100, 101],
  [79, 112, 101, 110, 65, 73],
  [
    97, 114, 116, 105, 102, 105, 99, 105, 97, 108, 32, 105, 110, 116, 101, 108,
    108, 105, 103, 101, 110, 99, 101,
  ],
  [76, 76, 77],
  [112, 114, 111, 109, 112, 116],
  [
    99, 117, 109, 117, 108, 97, 116, 105, 118, 101, 32, 111, 118, 101, 114, 108,
    97, 121,
  ],
  [
    103, 101, 110, 101, 114, 97, 116, 101, 100, 32, 100, 101, 108, 105, 118,
    101, 114, 121, 32, 114, 101, 112, 111, 114, 116,
  ],
  [119, 111, 114, 107, 116, 114, 101, 101],
  [104, 97, 110, 100, 111, 102, 102, 32, 112, 97, 99, 107, 97, 103, 101],
].map(fromCodes);
const retiredMilestoneMarkers = [
  [78, 69, 88, 84, 95, 69, 88, 80, 76, 79, 82, 69, 95, 71, 65, 84, 69, 83],
  [103, 97, 116, 101, 49],
  [103, 97, 116, 101, 50],
  [103, 97, 116, 101, 51],
  [103, 97, 116, 101, 51, 98],
  [111, 112, 101, 110, 105, 110, 103, 32, 103, 97, 116, 101],
  [97, 99, 99, 101, 112, 116, 101, 100, 32, 103, 97, 116, 101],
].map(fromCodes);

const escaped = (value) => value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
const disallowedContent = [
  ...reservedMarkers.map((value) => ({
    matcher: new RegExp(`\b${escaped(value)}s?\b`, "iu"),
    label: "reserved repository marker",
  })),
  ...retiredMilestoneMarkers.map((value) => ({
    matcher: new RegExp(escaped(value), "iu"),
    label: "retired milestone marker",
  })),
];
const disallowedFileName = new RegExp(
  reservedMarkers
    .slice(0, 6)
    .map((value) => escaped(value.replaceAll(" ", "[-_ ]?")))
    .join("|"),
  "iu",
);
const errors = [];

function visit(absolutePath) {
  if (!fs.existsSync(absolutePath)) return;
  const stat = fs.statSync(absolutePath);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(absolutePath, { withFileTypes: true })) {
      if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
      visit(path.join(absolutePath, entry.name));
    }
    return;
  }

  const relativePath = path.relative(root, absolutePath);
  if (absolutePath === selfPath) return;
  if (disallowedFileName.test(path.basename(relativePath))) {
    errors.push(`${relativePath}: filename contains a reserved marker.`);
  }
  if (!readableExtensions.has(path.extname(relativePath).toLowerCase())) return;

  const source = fs.readFileSync(absolutePath, "utf8");
  const lines = source.split(/\r?\n/u);
  for (const { label, matcher } of disallowedContent) {
    lines.forEach((line, index) => {
      if (matcher.test(line))
        errors.push(`${relativePath}:${index + 1}: ${label}.`);
    });
  }
}

for (const relativePath of includedRoots) visit(path.join(root, relativePath));

if (errors.length) {
  console.error("Repository language audit failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  "Repository language audit passed: published copy, source comments and filenames contain no reserved authorship or delivery markers.",
);
