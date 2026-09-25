// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Vinyls from "./Vinyls";

const renderVinyls = () =>
  render(
    <ThemeProvider switchable>
      <Vinyls />
    </ThemeProvider>
  );

// jsdom has no layout or Web Animations, so this exercises the mobile path
// (bottom sheet, no flying sleeve); the desktop flight is checked in a browser.
beforeEach(() => {
  window.matchMedia = (query: string) =>
    ({ matches: false, media: query }) as MediaQueryList;
});

afterEach(cleanup);

function detail() {
  return document.getElementById("vx-detail")!;
}

describe("Vinyls", () => {
  it("renders every record as a button", () => {
    renderVinyls();
    expect(
      screen.getByRole("button", { name: "For Broken Ears by Tems" })
    ).toBeTruthy();
    expect(screen.getAllByRole("button", { name: / by / })).toHaveLength(11);
  });

  it("opens a record's details and closes them with Escape", async () => {
    const user = userEvent.setup();
    renderVinyls();
    const record = screen.getByRole("button", {
      name: "GNX by Kendrick Lamar",
    });

    await user.click(record);
    expect(record.getAttribute("aria-expanded")).toBe("true");
    expect(detail().getAttribute("aria-hidden")).toBe("false");
    expect(detail().textContent).toContain(
      "Favourite track: wacced out murals."
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(record.getAttribute("aria-expanded")).toBe("false");
    expect(detail().getAttribute("aria-hidden")).toBe("true");
  });

  it("switches records and closes when the same record is chosen again", async () => {
    const user = userEvent.setup();
    renderVinyls();
    const gnx = screen.getByRole("button", { name: "GNX by Kendrick Lamar" });
    const blueprint = screen.getByRole("button", {
      name: "The Blueprint by Jay-Z",
    });

    await user.click(gnx);
    await user.click(blueprint);
    expect(gnx.getAttribute("aria-expanded")).toBe("false");
    expect(blueprint.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(
      "The Blueprint"
    );

    await user.click(blueprint);
    expect(blueprint.getAttribute("aria-expanded")).toBe("false");
  });
});
