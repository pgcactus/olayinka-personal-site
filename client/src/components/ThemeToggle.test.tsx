// @vitest-environment jsdom

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ThemeToggle from "./ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: () => ({
        matches: false,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }),
    });
    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    document.documentElement.classList.remove("dark");
  });

  it("toggles dark mode using a normal button interaction", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider switchable>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole("button", {
      name: "Switch to dark mode",
    });
    await user.click(button);

    await waitFor(() => {
      expect(button.getAttribute("aria-pressed")).toBe("true");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
  });
});
