// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import NotFound from "./NotFound";

afterEach(cleanup);

describe("NotFound", () => {
  it("says what happened and links back", () => {
    render(<NotFound />);
    expect(
      screen.getByRole("heading", { name: "Page not found." })
    ).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "see the vinyls →" })
        .getAttribute("href")
    ).toBe("/things/vinyls");
    expect(document.querySelector(".nf-art canvas")).toBeTruthy();
  });
});
