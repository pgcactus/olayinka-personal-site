// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import Nato from "./Nato";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function renderNato() {
  return render(<Nato />);
}

const words = () =>
  [...document.querySelectorAll(".nt-word")].map(el => el.textContent);

describe("Nato", () => {
  it("reads the spelling aloud, lighting each word, and can stop", async () => {
    const spoken: { text: string; onstart?: () => void }[] = [];
    vi.stubGlobal(
      "SpeechSynthesisUtterance",
      class {
        lang = "";
        rate = 1;
        onstart?: () => void;
        constructor(public text: string) {}
      }
    );
    vi.stubGlobal("speechSynthesis", {
      speak: (u: { text: string; onstart?: () => void }) => spoken.push(u),
      cancel: vi.fn(),
    });
    const user = userEvent.setup();
    renderNato();
    fireEvent.change(screen.getByLabelText("Type anything"), {
      target: { value: "hi" },
    });
    await user.click(await screen.findByRole("button", { name: "listen" }));
    expect(spoken.map(u => u.text)).toEqual(["Hotel", "India"]);
    await act(() => spoken[1].onstart?.());
    expect(screen.getByText("India.")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "stop" }));
    expect(screen.getByRole("button", { name: "listen" })).toBeTruthy();
  });

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
});
