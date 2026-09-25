// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Home from "./Home";

afterEach(cleanup);

function renderHome() {
  return render(
    <ThemeProvider switchable>
      <Home />
    </ThemeProvider>
  );
}

const panel = () => document.querySelector(".hm-panel");

describe("Home", () => {
  it("greets and links to LinkedIn", () => {
    renderHome();
    expect(
      screen.getByRole("heading", { name: "Hi, I’m Olayinka." })
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "LinkedIn" }).getAttribute("href")
    ).toBe("https://www.linkedin.com/in/olayinkaetitilola/");
    expect(panel()).toBeNull();
  });

  it("shows the day job on hover and hides it when the mouse leaves", async () => {
    const user = userEvent.setup();
    renderHome();
    const flatiron = screen.getByRole("button", { name: "Flatiron Health" });

    await user.hover(flatiron);
    expect(screen.getByText(/identity and access/)).toBeTruthy();

    await user.unhover(flatiron);
    await act(() => new Promise(r => setTimeout(r, 700)));
    expect(panel()).toBeNull();
  });

  it("opens the NATO speller on click and closes it with Escape", async () => {
    const user = userEvent.setup();
    renderHome();
    const things = screen.getByRole("button", { name: "small things" });

    await user.click(things);
    expect(things.getAttribute("aria-pressed")).toBe("true");
    fireEvent.change(screen.getByLabelText("Type anything"), {
      target: { value: "ab!" },
    });
    expect(screen.getByText("Alfa • Bravo")).toBeTruthy();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(things.getAttribute("aria-pressed")).toBe("false");
    expect(panel()).toBeNull();
  });

  it("links the vinyls panel to the wall", async () => {
    const user = userEvent.setup();
    renderHome();
    await user.click(screen.getByRole("button", { name: "vinyls" }));
    expect(
      screen.getByRole("link", { name: "see the wall →" }).getAttribute("href")
    ).toBe("/things/vinyls");
  });

  it("switches the copy to French and back", async () => {
    const user = userEvent.setup();
    renderHome();
    await user.click(
      screen.getByRole("button", { name: "Translate to French" })
    );
    await act(() => new Promise(r => setTimeout(r, 300)));
    expect(
      screen.getByRole("heading", { name: "Bonjour, je m’appelle Olayinka." })
    ).toBeTruthy();
    expect(document.documentElement.lang).toBe("fr");

    await user.click(
      screen.getByRole("button", { name: "Traduire en anglais" })
    );
    await act(() => new Promise(r => setTimeout(r, 300)));
    expect(
      screen.getByRole("heading", { name: "Hi, I’m Olayinka." })
    ).toBeTruthy();
  });
});
