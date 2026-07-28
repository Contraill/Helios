import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import ts from "typescript";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const FORBIDDEN_3D_PACKAGES = new Set([
  "three",
  "@react-three/fiber",
  "@react-three/drei",
  "@react-three/postprocessing",
]);

const entrypoints = {
  home: path.join(SRC, "app/page.tsx"),
  missions: path.join(SRC, "app/missions/page.tsx"),
};

function sourceText(file) {
  return readFileSync(file, "utf8");
}

function resolveLocalImport(fromFile, specifier) {
  const base = specifier.startsWith("@/")
    ? path.join(SRC, specifier.slice(2))
    : specifier.startsWith(".")
      ? path.resolve(path.dirname(fromFile), specifier)
      : null;
  if (!base) return null;

  for (const candidate of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
  ]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

function importsFor(file) {
  const source = ts.createSourceFile(
    file,
    sourceText(file),
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const imports = [];

  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    if (statement.importClause?.isTypeOnly) continue;
    const specifier = statement.moduleSpecifier.text;
    imports.push({
      local: resolveLocalImport(file, specifier),
      specifier,
    });
  }
  return imports;
}

function auditEntry(name, entry) {
  const visited = new Set();
  const queue = [entry];
  const forbidden = [];

  while (queue.length) {
    const file = queue.shift();
    if (!file || visited.has(file)) continue;
    visited.add(file);

    for (const imported of importsFor(file)) {
      const packageRoot = imported.specifier.startsWith("@")
        ? imported.specifier.split("/").slice(0, 2).join("/")
        : imported.specifier.split("/")[0];
      if (FORBIDDEN_3D_PACKAGES.has(packageRoot)) {
        forbidden.push({ file: path.relative(ROOT, file), ...imported });
      }
      if (imported.local) queue.push(imported.local);
    }
  }

  if (forbidden.length) {
    throw new Error(
      `${name} route reaches the WebGL dependency graph:\n${forbidden
        .map(({ file, specifier }) => `- ${file} -> ${specifier}`)
        .join("\n")}`,
    );
  }

  return {
    entry: path.relative(ROOT, entry),
    modules: visited.size,
    webglPackages: [],
  };
}

const routes = Object.fromEntries(
  Object.entries(entrypoints).map(([name, entry]) => [
    name,
    auditEntry(name, entry),
  ]),
);

process.stdout.write(
  `${JSON.stringify(
    {
      auditedAt: new Date().toISOString(),
      errors: [],
      routes,
    },
    null,
    2,
  )}\n`,
);
