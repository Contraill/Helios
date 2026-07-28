import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  LocaleProvider,
  resetLocaleStore,
  useLocaleStore,
} from "./locale-store";

function LocaleProbe() {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);
  return (
    <div>
      <output aria-label="current locale">{locale}</output>
      <button onClick={() => setLocale("en")} type="button">
        Switch to English
      </button>
    </div>
  );
}

describe("locale provider", () => {
  afterEach(() => resetLocaleStore());

  it("uses the request locale on the first render", () => {
    render(
      <LocaleProvider initialLocale="tr">
        <LocaleProbe />
      </LocaleProvider>,
    );

    expect(screen.getByLabelText("current locale")).toHaveTextContent("tr");
  });

  it("updates provider consumers without waiting for a route refresh", () => {
    render(
      <LocaleProvider initialLocale="tr">
        <LocaleProbe />
      </LocaleProvider>,
    );

    act(() => screen.getByRole("button").click());
    expect(screen.getByLabelText("current locale")).toHaveTextContent("en");
  });

  it("adopts a refreshed request locale without an effect-driven state update", () => {
    const { rerender } = render(
      <LocaleProvider initialLocale="en">
        <LocaleProbe />
      </LocaleProvider>,
    );

    rerender(
      <LocaleProvider initialLocale="tr">
        <LocaleProbe />
      </LocaleProvider>,
    );

    expect(screen.getByLabelText("current locale")).toHaveTextContent("tr");
  });
});
