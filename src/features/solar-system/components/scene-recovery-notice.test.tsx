import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SceneRecoveryNotice } from "./scene-recovery-notice";

describe("SceneRecoveryNotice", () => {
  it("moves focus to retry after a terminal renderer failure", () => {
    const onRetry = vi.fn();

    render(
      <SceneRecoveryNotice
        body="The renderer could not be restored."
        failed
        onRetry={onRetry}
        retryLabel="Retry"
        title="Scene unavailable"
      />,
    );

    const notice = screen.getByRole("alert", { name: "Scene unavailable" });
    const retry = screen.getByRole("button", { name: "Retry" });

    expect(notice).toHaveAttribute("aria-busy", "false");
    expect(notice).toHaveAccessibleDescription(
      "The renderer could not be restored.",
    );
    expect(retry).toHaveFocus();

    retry.click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("announces an automatic recovery without exposing an unusable button", () => {
    render(
      <SceneRecoveryNotice
        body="Restoring the renderer."
        failed={false}
        onRetry={() => undefined}
        retryLabel="Retry"
        title="Reconnecting"
      />,
    );

    const notice = screen.getByRole("status", { name: "Reconnecting" });
    expect(notice).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
