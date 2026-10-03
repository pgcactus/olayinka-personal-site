// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ThemeToggle from "./ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    document.documentElement.classList.remove("dark");
  });

  it("switches both ways when browser storage is blocked", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Storage blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage blocked");
    });
    const user = userEvent.setup();
    render(
      <ThemeProvider switchable>
        <ThemeToggle />
      </ThemeProvider>
    );
    await user.click(
      screen.getByRole("button", { name: "Switch to dark mode" })
    );
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    await user.click(
      screen.getByRole("button", { name: "Switch to light mode" })
    );
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("switches to dark mode and back, remembering the choice", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider switchable>
        <ThemeToggle />
      </ThemeProvider>
    );

    await user.click(
      screen.getByRole("button", { name: "Switch to dark mode" })
    );
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(window.localStorage.getItem("theme")).toBe("dark");

    await user.click(
      screen.getByRole("button", { name: "Switch to light mode" })
    );
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(window.localStorage.getItem("theme")).toBe("light");
  });
});
