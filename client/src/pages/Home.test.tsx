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
  afterEach(() => {
    window.localStorage.clear();
    document.documentElement.lang = "en";
  });

  it("shows a different favourite track on the next visit", async () => {
    renderHome();
    const first = await screen.findByText(/now listening to:/);
    const pick = window.localStorage.getItem("listening");
    expect(first.closest("a")?.getAttribute("href")).toBe("/things/vinyls");
    cleanup();
    renderHome();
    await screen.findByText(/now listening to:/);
    expect(window.localStorage.getItem("listening")).not.toBe(pick);
  });

  it("keeps a card open while the mouse is on it", async () => {
    const user = userEvent.setup();
    renderHome();
    await user.hover(screen.getByRole("button", { name: "Flatiron Health" }));
    await user.hover(panel()!);
    await act(() => new Promise(r => setTimeout(r, 700)));
    expect(panel()).not.toBeNull();
  });

  it("opens the speller empty, with a hint", async () => {
    const user = userEvent.setup();
    renderHome();
    await user.click(screen.getByRole("button", { name: "small things" }));
    const input = screen.getByLabelText("Type anything") as HTMLInputElement;
    expect(input.value).toBe("");
    expect(input.placeholder).toBe("ROGER THAT");
  });

  it("reads drawing-only phrases as plain words", () => {
    renderHome();
    expect(screen.queryByRole("button", { name: "tennis" })).toBeNull();
    expect(screen.getByText("tennis").getAttribute("tabindex")).toBe("0");
  });

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
    expect(
      screen
        .getByRole("link", { name: /flatironhealth\.co\.uk/ })
        .getAttribute("href")
    ).toBe("https://flatironhealth.co.uk/");

    await user.unhover(flatiron);
    await act(() => new Promise(r => setTimeout(r, 700)));
    expect(panel()).toBeNull();
  });

  it("opens the NATO speller on click and closes it with Escape", async () => {
    const user = userEvent.setup();
    renderHome();
    const things = screen.getByRole("button", { name: "small things" });

    await user.click(things);
    expect(things.getAttribute("aria-expanded")).toBe("true");
    fireEvent.change(screen.getByLabelText("Type anything"), {
      target: { value: "ab!" },
    });
    expect(screen.getByText("Alfa • Bravo")).toBeTruthy();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(things.getAttribute("aria-expanded")).toBe("false");
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
