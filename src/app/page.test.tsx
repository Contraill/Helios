import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "./page";

describe("home page", () => {
  it("renders the product name and the explore call to action", async () => {
    render(await HomePage());
    expect(
      screen.getByRole("heading", { level: 1, name: "Helios" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Explore the system" }),
    ).toHaveAttribute("href", "/explore");
  });
});
