import { readFile, readdir, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { extname, join, relative, resolve } from "node:path";
import process from "node:process";

const root = process.cwd();
const manifestPath = resolve(
  root,
  "scripts/data/texture-runtime-manifest.json",
);
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const errors = [];
const warnings = [];

function u24(buffer, offset) {
  return (
    buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16)
  );
}

function webpDimensions(buffer) {
  if (
    buffer.toString("ascii", 0, 4) !== "RIFF" ||
    buffer.toString("ascii", 8, 12) !== "WEBP"
  ) {
    throw new Error("not a WebP RIFF file");
  }
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const type = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const data = offset + 8;
    if (type === "VP8X") {
      return {
        width: u24(buffer, data + 4) + 1,
        height: u24(buffer, data + 7) + 1,
      };
    }
    if (type === "VP8 ") {
      return {
        width: buffer.readUInt16LE(data + 6) & 0x3fff,
        height: buffer.readUInt16LE(data + 8) & 0x3fff,
      };
    }
    if (type === "VP8L") {
      const bits = buffer.readUInt32LE(data + 1);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
      };
    }
    offset = data + size + (size % 2);
  }
  throw new Error("WebP dimensions unavailable");
}

async function filesUnder(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) output.push(...(await filesUnder(path)));
    else output.push(path);
  }
  return output;
}

const owners = new Set();
const paths = new Set();
for (const asset of manifest.assets) {
  if (!asset.owner || owners.has(asset.owner))
    errors.push(`duplicate or missing owner: ${asset.owner}`);
  owners.add(asset.owner);
  if (!asset.path || paths.has(asset.path))
    errors.push(`duplicate or missing path: ${asset.path}`);
  paths.add(asset.path);
  if (
    !asset.attribution ||
    !asset.sourceId ||
    !asset.provider ||
    !asset.license
  ) {
    errors.push(`incomplete provenance: ${asset.path}`);
  }
  if (!asset.sha256 || !/^[0-9a-f]{64}$/.test(asset.sha256)) {
    errors.push(`missing or invalid SHA-256: ${asset.path}`);
  }
  if (
    !asset.projection ||
    !asset.northPoleConvention ||
    typeof asset.primeMeridianVerified !== "boolean"
  ) {
    errors.push(`incomplete orientation metadata: ${asset.path}`);
  }
  const physical = resolve(root, "public", asset.path.replace(/^\//, ""));
  let bytes;
  try {
    bytes = await readFile(physical);
  } catch {
    errors.push(`missing runtime asset: ${asset.path}`);
    continue;
  }
  const dimensions = webpDimensions(bytes);
  const digest = createHash("sha256").update(bytes).digest("hex");
  if (digest !== asset.sha256) errors.push(`SHA-256 mismatch ${asset.path}`);
  const details = await stat(physical);
  if (dimensions.width !== asset.width || dimensions.height !== asset.height) {
    errors.push(
      `dimension mismatch ${asset.path}: manifest ${asset.width}x${asset.height}, file ${dimensions.width}x${dimensions.height}`,
    );
  }
  if (details.size !== asset.byteSize)
    errors.push(`byte-size mismatch ${asset.path}`);
  if (
    asset.kind === "primary-surface" &&
    (dimensions.width > 2048 || dimensions.height > 1024)
  ) {
    errors.push(`primary surface exceeds 2K ceiling: ${asset.path}`);
  }
  if (
    asset.kind === "secondary-surface" &&
    (dimensions.width > 2048 || dimensions.height > 1024)
  ) {
    errors.push(`secondary surface exceeds 2K ceiling: ${asset.path}`);
  }
  if (
    asset.kind === "primary-layer" &&
    (dimensions.width > 2048 || dimensions.height > 1024)
  ) {
    errors.push(`primary layer exceeds 2K ceiling: ${asset.path}`);
  }
  if (asset.kind === "ring-albedo" && dimensions.height > 256) {
    errors.push(`ring wastes vertical pixel budget: ${asset.path}`);
  }
  if (/(?:^|[-_.])(low|medium|high)(?:[-_.]|$)/i.test(asset.path)) {
    errors.push(`stale quality variant in manifest: ${asset.path}`);
  }
}

const runtimeFiles = (await filesUnder(resolve(root, "public/textures")))
  .filter((path) =>
    [".webp", ".png", ".jpg", ".jpeg", ".avif"].includes(
      extname(path).toLowerCase(),
    ),
  )
  .map(
    (path) =>
      `/${relative(resolve(root, "public"), path).replaceAll("\\", "/")}`,
  );
for (const path of runtimeFiles) {
  if (!paths.has(path)) errors.push(`orphan runtime texture: ${path}`);
  if (/(?:^|[-_.])(low|medium|high)(?:[-_.]|$)/i.test(path))
    errors.push(`stale runtime quality variant: ${path}`);
}
for (const path of paths)
  if (!runtimeFiles.includes(path))
    errors.push(`manifest path is not a runtime image: ${path}`);

const searchableRoots = ["src", "e2e", "scripts"];
const referenced = new Set();
const dynamicReferenceFamilies = new Set();
for (const directory of searchableRoots) {
  for (const file of await filesUnder(resolve(root, directory))) {
    if (!/[.](?:ts|tsx|js|mjs|json)$/.test(file)) continue;
    const text = await readFile(file, "utf8");
    for (const match of text.matchAll(
      /["'`](\/textures\/[^"'`?#]+?[.](?:webp|png|jpe?g|avif))["'`]/gi,
    )) {
      if (!match[1].includes("${") && !match[1].includes("\\"))
        referenced.add(match[1]);
    }
    if (/\/textures\/planets\/\$\{bodyId\}\.webp/.test(text)) {
      dynamicReferenceFamilies.add("primary-body-surface");
    }
  }
}

const dynamicReferences = new Set();
if (dynamicReferenceFamilies.has("primary-body-surface")) {
  for (const asset of manifest.assets) {
    if (asset.kind === "primary-surface") dynamicReferences.add(asset.path);
  }
}

for (const path of referenced)
  if (!paths.has(path))
    errors.push(`unowned dynamic/static texture reference: ${path}`);
for (const path of paths)
  if (!referenced.has(path) && !dynamicReferences.has(path))
    warnings.push(
      `manifest-owned path has no static or dynamic owner: ${path}`,
    );

const publicNames = runtimeFiles.join("\n");
if (/(4k|8k|4096|8192)/i.test(publicNames))
  errors.push("source-master naming leaked into public runtime assets");

const report = {
  assets: manifest.assets.length,
  referencedPaths: referenced.size,
  dynamicReferencedPaths: dynamicReferences.size,
  dynamicReferenceFamilies: [...dynamicReferenceFamilies],
  runtimeFiles: runtimeFiles.length,
  errors,
  warnings,
};
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
