// @vitest-environment jsdom

import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import App from "./App";

beforeAll(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  window.scrollTo = () => undefined;
});

// Mirrors scripts/prerender.ts: render the route on the "server", then hydrate
// it in the browser with whatever state the visitor has, and fail on any
// hydration mismatch React reports.
async function hydrateRoute(url: string, visitorState?: () => void) {
  const { pathname } = new URL(url, "http://localhost");
  const html = renderToString(
    <Router ssrPath={pathname}>
      <App />
    </Router>
  );

  // Browser-only state is applied after the "server" render, as in production.
  visitorState?.();
  window.history.replaceState(null, "", url);
  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.appendChild(container);

  // React reports attribute mismatches only through console.error.
  const errors: unknown[] = [];
  const consoleError = vi
    .spyOn(console, "error")
    .mockImplementation(message => {
      if (/hydrat/i.test(String(message))) errors.push(message);
    });
  try {
    await act(async () => {
      hydrateRoot(container, <App />, {
        onRecoverableError: error => errors.push(error),
      });
    });
  } finally {
    consoleError.mockRestore();
  }
  return { container, errors };
}

describe("hydration", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    document.documentElement.classList.remove("dark");
    window.localStorage.clear();
  });

  it.each(["/", "/nato", "/things/places", "/things/vinyls"])(
    "hydrates %s without a mismatch",
    async route => {
      const { errors } = await hydrateRoute(route);
      expect(errors).toEqual([]);
    }
  );

  it("applies a stored dark theme after hydrating", async () => {
    const { container, errors } = await hydrateRoute("/", () =>
      window.localStorage.setItem("theme", "dark")
    );
    expect(errors).toEqual([]);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(
      container.querySelector(".theme-toggle")?.getAttribute("aria-label")
    ).toBe("Switch to light mode");
  });

  it("shows a shared NATO value after hydrating", async () => {
    const { container, errors } = await hydrateRoute("/nato?q=abc");
    expect(errors).toEqual([]);
    expect(container.querySelector(".nato-output")?.textContent).toBe(
      "Alfa • Bravo • Charlie"
    );
  });
});
