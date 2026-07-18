import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HORIZONS_SNAPSHOT } from "@/lib/data/ephemeris/horizons-snapshot";
import { resetEphemerisStore } from "@/stores/ephemeris-store";
import { resetPreferencesStore } from "@/stores/preferences-store";
import { resetSimulationStore } from "@/stores/simulation-store";

import { EphemerisControls } from "./ephemeris-controls";

describe("EphemerisControls", () => {
  beforeEach(() => {
    localStorage.clear();
    resetEphemerisStore();
    resetPreferencesStore();
    resetSimulationStore();
    window.history.replaceState({}, "", "/explore");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = new URL(String(input), window.location.origin);
        const requestedAt = url.searchParams.get("at")!;
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
      }),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("loads now, navigates to a future day and keeps the time in the URL", async () => {
    render(<EphemerisControls />);

    await screen.findByText("JPL computed vector");
    fireEvent.click(
      screen.getByRole("button", { name: "Open ephemeris time controls" }),
    );
    const callsAfterInitialLoad = vi.mocked(fetch).mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: "+1d" }));

    await waitFor(() =>
      expect(vi.mocked(fetch).mock.calls.length).toBeGreaterThan(
        callsAfterInitialLoad,
      ),
    );
    expect(new URL(window.location.href).searchParams.get("at")).toMatch(
      /^\d{4}-\d{2}-\d{2}T/,
    );
  });

  it("applies an explicit past UTC date through the same normalized endpoint", async () => {
    render(<EphemerisControls />);
    await screen.findByText("JPL computed vector");
    fireEvent.click(
      screen.getByRole("button", { name: "Open ephemeris time controls" }),
    );

    fireEvent.change(screen.getByLabelText("UTC date and time"), {
      target: { value: "2024-01-15T12:30" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() =>
      expect(new URL(window.location.href).searchParams.get("at")).toBe(
        "2024-01-15T12:30:00.000Z",
      ),
    );
    expect(vi.mocked(fetch).mock.lastCall?.[0]).toContain(
      "2024-01-15T12%3A30%3A00.000Z",
    );
  });

  it("opens and collapses the time controls without hiding their status", async () => {
    render(<EphemerisControls />);
    await screen.findByText("JPL computed vector");

    fireEvent.click(
      screen.getByRole("button", { name: "Open ephemeris time controls" }),
    );
    const collapse = screen.getByRole("button", {
      name: "Collapse ephemeris time controls",
    });
    expect(collapse).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(collapse);
    expect(
      screen.getByRole("button", { name: "Open ephemeris time controls" }),
    ).toBeVisible();
    expect(screen.getByText("JPL computed vector")).toBeVisible();
  });

  it("accepts the exact dynamic minimum and maximum and stops request loops at the boundary", async () => {
    const now = Date.parse("2026-07-18T12:30:00.000Z");
    vi.spyOn(Date, "now").mockReturnValue(now);
    resetSimulationStore(now);
    render(<EphemerisControls />);
    await screen.findByText("JPL computed vector");
    fireEvent.click(
      screen.getByRole("button", { name: "Open ephemeris time controls" }),
    );

    const input = screen.getByLabelText("UTC date and time");
    expect(input).toHaveAttribute("min", "1526-07-18T12:30:00.000");
    expect(input).toHaveAttribute("max", "2626-07-18T12:30:00.000");

    fireEvent.change(input, {
      target: { value: "1526-07-18T12:30:00.000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    await waitFor(() =>
      expect(new URL(window.location.href).searchParams.get("at")).toBe(
        "1526-07-18T12:30:00.000Z",
      ),
    );

    fireEvent.change(input, {
      target: { value: "2626-07-18T12:30:00.000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    await waitFor(() =>
      expect(screen.getByText("Maximum supported date reached")).toBeVisible(),
    );
    const requestsAtBoundary = vi.mocked(fetch).mock.calls.length;
    await new Promise((resolve) => window.setTimeout(resolve, 600));
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(requestsAtBoundary);
    expect(screen.getByRole("button", { name: "+1d" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "+10y" })).toBeDisabled();
  });

  it("rejects an out-of-range shared URL and initializes from real now", async () => {
    window.history.replaceState(
      {},
      "",
      "/explore?at=1400-01-01T00%3A00%3A00.000Z",
    );
    render(<EphemerisControls />);
    await screen.findByText("JPL computed vector");

    expect(String(vi.mocked(fetch).mock.calls[0]?.[0])).not.toContain("1400-");
    expect(new URL(window.location.href).searchParams.get("at")).toMatch(
      /^20\d{2}-/,
    );
  });

  it("previews rapid year scrubbing without a provider request storm", async () => {
    render(<EphemerisControls />);
    await screen.findByText("JPL computed vector");
    fireEvent.click(
      screen.getByRole("button", { name: "Open ephemeris time controls" }),
    );
    const callsBeforeScrub = vi.mocked(fetch).mock.calls.length;
    const scrubber = screen.getByLabelText(/General date/i);

    fireEvent.change(scrubber, { target: { value: "-100" } });
    fireEvent.change(scrubber, { target: { value: "20" } });
    fireEvent.change(scrubber, { target: { value: "120" } });

    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(callsBeforeScrub);
    expect(screen.getByText("Approximate preview")).toBeVisible();
    fireEvent.pointerUp(scrubber);
    await waitFor(() =>
      expect(vi.mocked(fetch).mock.calls.length).toBe(callsBeforeScrub + 1),
    );
  });
});
