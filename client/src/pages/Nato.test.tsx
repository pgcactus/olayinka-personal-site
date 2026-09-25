// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Nato from "./Nato";

afterEach(cleanup);

function renderNato() {
  return render(
    <ThemeProvider switchable>
      <Nato />
    </ThemeProvider>
  );
}

const words = () =>
  [...document.querySelectorAll(".nt-word")].map(el => el.textContent);

describe("Nato", () => {
  it("starts on ROGER THAT and follows the site's language", () => {
    window.localStorage.setItem("lang", "fr");
    try {
      renderNato();
      expect(
        screen.getByRole("heading", { name: "Alphabet phonétique OTAN" })
      ).toBeTruthy();
      expect(words().slice(0, 5)).toEqual([
        "Romeo",
        "Oscar",
        "Golf",
        "Echo",
        "Romeo",
      ]);
    } finally {
      window.localStorage.clear();
    }
  });

  it("turns each letter into a tile, grouped by word", () => {
    renderNato();
    fireEvent.change(screen.getByLabelText("Type anything"), {
      target: { value: "hi yo!" },
    });
    expect(words()).toEqual(["Hotel", "India", "Yankee", "Oscar"]);
    expect(document.querySelectorAll(".nt-group")).toHaveLength(2);
  });

  it("tells a word's story when its tile is chosen", async () => {
    const user = userEvent.setup();
    renderNato();
    fireEvent.change(screen.getByLabelText("Type anything"), {
      target: { value: "a" },
    });
    await user.click(screen.getByRole("button", { name: "A for Alfa" }));
    expect(screen.getByText(/Spelled 'Alfa'/)).toBeTruthy();
  });

  it("converts NATO words back and flags unknown ones", async () => {
    const user = userEvent.setup();
    renderNato();
    await user.click(screen.getByRole("button", { name: "NATO → word" }));
    const input = screen.getByLabelText("Type NATO words, separated by spaces");

    await user.type(input, "alfa bravo");
    expect(document.querySelector(".nt-result")?.textContent).toBe("AB");

    fireEvent.change(input, { target: { value: "alfa bogus" } });
    expect(screen.getByRole("alert").textContent).toMatch(/bogus/);
  });
});
