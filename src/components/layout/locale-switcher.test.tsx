import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LocaleProvider, resetLocaleStore } from "@/stores/locale-store";

import { LocaleSwitcher } from "./locale-switcher";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  usePathname: () => "/body/mars",
  useRouter: () => ({ replace }),
}));

describe("LocaleSwitcher", () => {
  beforeEach(() => {
    replace.mockClear();
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
    expect(replace).toHaveBeenCalledExactlyOnceWith("/tr/body/mars", {
      scroll: false,
    });
    expect(screen.getByRole("status")).toHaveTextContent(/Arayüz dili/);
  });
});
