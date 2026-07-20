import { describe, expect, it } from "vitest";

import {
  MAX_CONCURRENT_SECONDARY_TEXTURE_REQUESTS,
  SecondaryTextureQueue,
} from "./secondary-texture-queue";

describe("secondary texture queue", () => {
  it("keeps requests bounded while allowing pending priority to be replaced", async () => {
    let active = 0;
    let maximum = 0;
    const resolvers: Array<() => void> = [];
    const started: string[] = [];
    const queue = new SecondaryTextureQueue((path) => {
      started.push(path);
      active += 1;
      maximum = Math.max(maximum, active);
      return new Promise<void>((resolve) => {
        resolvers.push(() => {
          active -= 1;
          resolve();
        });
      });
    });

    queue.update(["a", "b", "c", "d", "e", "f"]);
    expect(queue.activeCount()).toBe(MAX_CONCURRENT_SECONDARY_TEXTURE_REQUESTS);
    expect(maximum).toBe(MAX_CONCURRENT_SECONDARY_TEXTURE_REQUESTS);

    queue.update(["a", "b", "c", "d", "priority", "e", "f"]);
    resolvers.shift()?.();
    await Promise.resolve();
    await Promise.resolve();

    expect(started).toContain("priority");
    expect(maximum).toBe(MAX_CONCURRENT_SECONDARY_TEXTURE_REQUESTS);
    queue.dispose();
  });
});
