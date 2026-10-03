// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ErrorBoundary from "./ErrorBoundary";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function Broken(): never {
  throw new Error("secret internals");
}

describe("ErrorBoundary", () => {
  it("shows a calm page without the error details", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>
    );
    expect(
      screen.getByRole("heading", { name: "Something went wrong." })
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "try again" })).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "← back home" }).getAttribute("href")
    ).toBe("/");
    expect(document.body.textContent).not.toContain("secret internals");
  });
});
