// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import Pace from "./Pace";

afterEach(cleanup);

const results = () =>
  [...document.querySelectorAll(".pc-results dd")].map(dd => dd.textContent);

describe("Pace", () => {
  it("opens on a worked 5K example", () => {
    render(<Pace />);
    expect(
      (screen.getByLabelText("Finish time") as HTMLInputElement).value
    ).toBe("25:00");
    expect(results()).toEqual(["5:00/km", "12.0km/h"]);
    expect(document.querySelectorAll("ol.pc-rows li")).toHaveLength(5);
  });

  it("goes back to the small things list", () => {
    render(<Pace />);
    expect(
      screen.getByRole("link", { name: "← small things" }).getAttribute("href")
    ).toBe("/small-things");
  });

  it("shows what the same pace means over the other distances", async () => {
    const user = userEvent.setup();
    render(<Pace />);
    const rows = () =>
      [...document.querySelectorAll(".pc-rows--wide li")].map(
        li => li.textContent
      );
    expect(rows()).toEqual(["10K50:00", "Half1:45:29", "Marathon3:30:59"]);
    await user.click(screen.getByRole("button", { name: "Marathon" }));
    fireEvent.change(screen.getByLabelText("Finish time"), {
      target: { value: "3:30:59" },
    });
    expect(rows()[0]).toBe("5K25:00");
  });

  it("explains a time it can't read", () => {
    render(<Pace />);
    fireEvent.change(screen.getByLabelText("Finish time"), {
      target: { value: "25:99" },
    });
    expect(
      screen.getByText("Use minutes and seconds, like 25:00.")
    ).toBeTruthy();
    expect(results()).toEqual([]);
  });
});
