import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HORIZONS_SNAPSHOT } from "@/lib/data/ephemeris/horizons-snapshot";
import { resetEphemerisStore } from "@/stores/ephemeris-store";
import {
  currentSimulationTimeMs,
  resetSimulationStore,
  useSimulationStore,
} from "@/stores/simulation-store";

import { EphemerisPanel } from "./ephemeris-panel";
import { useEphemerisController } from "./ephemeris-controller";

function ControllerHarness({ showPanel }: { showPanel: boolean }) {
  const controller = useEphemerisController();
  return showPanel ? <EphemerisPanel controller={controller} /> : null;
}

function currentResponse(requestedAt: string) {
  return new Response(
    JSON.stringify({
      ...HORIZONS_SNAPSHOT,
      status: "current",
      requestedAt,
      observedAt: requestedAt,
      retrievedAt: requestedAt,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

describe("persistent ephemeris controller", () => {
  const now = Date.parse("2026-07-19T08:00:00.000Z");
  let clock = now;

  beforeEach(() => {
    clock = now;
    vi.spyOn(Date, "now").mockImplementation(() => clock);
    localStorage.clear();
    resetEphemerisStore();
    resetSimulationStore(now);
    window.history.replaceState({}, "", "/explore");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = new URL(String(input), window.location.origin);
        return currentResponse(url.searchParams.get("at")!);
      }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("initializes and requests ephemeris before the Time panel is mounted", async () => {
    render(<ControllerHarness showPanel={false} />);
    await act(async () => Promise.resolve());
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(useSimulationStore.getState().range.anchorUtcMs).toBe(now);
    expect(useSimulationStore.getState().simulationAtMs).toBe(now);
  });

  it("does not reset time or repeat initialization across Time → Navigator → Time", async () => {
    window.history.replaceState(
      {},
      "",
      "/explore?at=2024-01-15T12%3A30%3A00.000Z",
    );
    const { rerender } = render(<ControllerHarness showPanel />);
    await act(async () => Promise.resolve());
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const initializedAt = useSimulationStore.getState().simulationAtMs;
    const urlAt = new URL(window.location.href).searchParams.get("at");

    rerender(<ControllerHarness showPanel={false} />);
    clock += 1_000;
    await act(async () => Promise.resolve());
    rerender(<ControllerHarness showPanel />);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(useSimulationStore.getState().simulationAtMs).toBe(initializedAt);
    expect(new URL(window.location.href).searchParams.get("at")).toBe(urlAt);
    expect(screen.getByLabelText("UTC date and time")).toBeVisible();
  });

  it("does not rewind the visible clock when a background request fails after pause", async () => {
    window.history.replaceState(
      {},
      "",
      "/explore?at=2024-01-15T12%3A30%3A00.000Z",
    );
    let resolveRequest!: (response: Response) => void;
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolveRequest = resolve;
          }),
      ),
    );

    const { rerender, container } = render(
      <ControllerHarness showPanel={false} />,
    );
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    clock += 2_000;
    useSimulationStore.getState().togglePaused();
    const pausedAt = currentSimulationTimeMs(
      useSimulationStore.getState(),
      clock,
    );

    await act(async () => {
      resolveRequest(
        new Response(JSON.stringify({ error: "offline" }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }),
      );
      await Promise.resolve();
    });
    rerender(<ControllerHarness showPanel />);

    await waitFor(() =>
      expect(container.querySelector("time")).toHaveAttribute(
        "datetime",
        new Date(pausedAt).toISOString(),
      ),
    );
  });

  it("keeps playback alive while hidden and pause freezes the shared timestamp", async () => {
    render(<ControllerHarness showPanel={false} />);
    await act(async () => Promise.resolve());
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const before = currentSimulationTimeMs(
      useSimulationStore.getState(),
      clock,
    );
    clock += 2_000;
    const advanced = currentSimulationTimeMs(
      useSimulationStore.getState(),
      clock,
    );
    expect(advanced).toBeGreaterThan(before);

    useSimulationStore.getState().togglePaused();
    const paused = currentSimulationTimeMs(
      useSimulationStore.getState(),
      clock,
    );
    clock += 2_000;
    expect(currentSimulationTimeMs(useSimulationStore.getState(), clock)).toBe(
      paused,
    );
  });
});
