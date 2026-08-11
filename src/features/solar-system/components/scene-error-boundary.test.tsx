import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SceneErrorBoundary } from "./scene-error-boundary";

function BrokenScene(): never {
  throw new Error("renderer failed");
}

describe("SceneErrorBoundary", () => {
  it("reports renderer failures while preserving the fallback", () => {
    const onError = vi.fn();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    try {
      render(
        <SceneErrorBoundary
          fallback={<div>Renderer fallback</div>}
          onError={onError}
        >
          <BrokenScene />
        </SceneErrorBoundary>,
      );

      expect(screen.getByText("Renderer fallback")).toBeInTheDocument();
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError.mock.calls[0]?.[0]).toBeInstanceOf(Error);
    } finally {
      consoleError.mockRestore();
    }
  });
});
