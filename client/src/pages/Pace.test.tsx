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
    expect(results()).toEqual(["5:00/km", "8:03/mile", "12.0km/h"]);
    expect(document.querySelectorAll(".pc-splits li")).toHaveLength(5);
  });

  it("turns a pace into a marathon finish time", async () => {
    const user = userEvent.setup();
    render(<Pace />);
    await user.click(screen.getByRole("button", { name: "Marathon" }));
    await user.click(screen.getByRole("button", { name: "pace → time" }));
    expect(results()[0]).toBe("3:30:59");
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
