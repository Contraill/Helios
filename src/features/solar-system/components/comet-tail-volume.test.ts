import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const volumeSource = readFileSync(
  join(
    process.cwd(),
    "src/features/solar-system/components/comet-tail-volume.tsx",
  ),
  "utf8",
);
const extendedSource = readFileSync(
  join(
    process.cwd(),
    "src/features/solar-system/components/extended-solar-system.tsx",
  ),
  "utf8",
);

describe("comet particle-volume renderer", () => {
  it("removes hard cone and sphere prototype primitives", () => {
    expect(extendedSource).not.toMatch(/<coneGeometry\b/);
    expect(volumeSource).not.toMatch(/<coneGeometry\b/);
    expect(volumeSource).not.toMatch(/<sphereGeometry\b/);
  });

  it("uses separate soft dust, ion and coma point populations", () => {
    expect(volumeSource).toMatch(/<points\b/);
    expect(volumeSource).toMatch(/<shaderMaterial\b/);
    expect(volumeSource).toMatch(/role="dust"/);
    expect(volumeSource).toMatch(/role="ion"/);
    expect(volumeSource).toMatch(/role="coma"/);
    expect(volumeSource).toMatch(/gl_PointCoord/);
    expect(volumeSource).toMatch(/softCore/);
  });
});
