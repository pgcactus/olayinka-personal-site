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

const caption = () => document.querySelector(".da-caption")?.textContent;
const copy = () => document.querySelector(".hm-copy");

describe("Home", () => {
  it("links the name to LinkedIn and invites a poke", () => {
    renderHome();
    const name = screen.getByRole("link", { name: "Olayinka" });
    expect(name.getAttribute("href")).toBe(
      "https://www.linkedin.com/in/olayinkaetitilola/"
    );
    expect(caption()).toBe("( spinning, gently · poke it )");
  });

  it("opens the Flatiron card and closes it with Escape", async () => {
    const user = userEvent.setup();
    renderHome();
    const flatiron = screen.getByRole("button", { name: "Flatiron Health" });

    await user.click(flatiron);
    expect(flatiron.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText(/I work on identity and access/)).toBeTruthy();
    expect(copy()?.classList.contains("hm-copy--focus")).toBe(true);
    expect(caption()).toBe("( the day job )");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(flatiron.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText(/I work on identity and access/)).toBeNull();
  });

  it("keeps a clicked card open when the mouse moves away", async () => {
    const user = userEvent.setup();
    renderHome();
    const flatiron = screen.getByRole("button", { name: "Flatiron Health" });

    await user.hover(flatiron);
    expect(flatiron.getAttribute("aria-expanded")).toBe("true");
    await user.unhover(flatiron);
    expect(flatiron.getAttribute("aria-expanded")).toBe("false");

    await user.click(flatiron);
    await user.unhover(flatiron);
    await user.hover(screen.getByText("tennis"));
    expect(flatiron.getAttribute("aria-expanded")).toBe("true");

    await user.click(flatiron);
    expect(flatiron.getAttribute("aria-expanded")).toBe("false");
  });

  it("opens cards only on click where they become sheets", async () => {
    window.matchMedia = (query: string) =>
      ({ matches: false, media: query }) as MediaQueryList;
    try {
      const user = userEvent.setup();
      renderHome();
      const things = screen.getByRole("button", { name: "small things" });

      await user.hover(things);
      expect(things.getAttribute("aria-expanded")).toBe("false");

      await user.click(things);
      await user.unhover(things);
      await user.type(
        screen.getByLabelText("NATO phonetic alphabet"),
        "{Backspace>8}hi"
      );
      expect(screen.getByText("Hotel • India")).toBeTruthy();
    } finally {
      // @ts-expect-error jsdom has no matchMedia of its own.
      delete window.matchMedia;
    }
  });

  it("converts text in the small things card", async () => {
    const user = userEvent.setup();
    renderHome();
    await user.click(screen.getByRole("button", { name: "small things" }));

    const input = screen.getByLabelText("NATO phonetic alphabet");
    fireEvent.change(input, { target: { value: "ab!" } });
    expect(screen.getByText("Alfa • Bravo")).toBeTruthy();
  });

  it("links the vinyls card to the wall", async () => {
    const user = userEvent.setup();
    renderHome();
    await user.click(screen.getByRole("button", { name: "vinyls" }));
    expect(
      screen.getByRole("link", { name: "see the wall →" }).getAttribute("href")
    ).toBe("/things/vinyls");
  });

  it("changes only the drawing for drawing phrases", () => {
    renderHome();
    const tennis = screen.getByText("tennis");

    act(() => tennis.focus());
    expect(caption()).toBe("( love all )");
    expect(copy()?.classList.contains("hm-copy--focus")).toBe(false);

    act(() => tennis.blur());
    expect(caption()).toBe("( spinning, gently · poke it )");
  });
});
