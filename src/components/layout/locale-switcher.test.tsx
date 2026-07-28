import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LocaleProvider, resetLocaleStore } from "@/stores/locale-store";

import { LocaleSwitcher } from "./locale-switcher";

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

describe("LocaleSwitcher", () => {
  beforeEach(() => {
    refresh.mockClear();
    resetLocaleStore();
    document.cookie = "helios-locale=; Max-Age=0; Path=/";
    document.documentElement.lang = "en-US";
  });

  afterEach(() => resetLocaleStore());

  it("changes language without disabling or dropping focus from the trigger", () => {
    render(
      <LocaleProvider initialLocale="en">
        <LocaleSwitcher />
      </LocaleProvider>,
    );

    const turkish = screen.getByRole("button", { name: "TR" });
    turkish.focus();
    fireEvent.click(turkish);

    expect(turkish).toHaveFocus();
    expect(turkish).not.toBeDisabled();
    expect(turkish).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.lang).toBe("tr-TR");
    expect(document.cookie).toContain("helios-locale=tr");
    expect(refresh).toHaveBeenCalledOnce();
    expect(screen.getByRole("status")).toHaveTextContent(/Arayüz dili/);
  });
});
