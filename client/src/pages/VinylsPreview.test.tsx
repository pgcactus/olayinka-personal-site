// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Real previews are resolved at build time, so give one record a fake clip.
vi.mock("@/data/vinyls", async importOriginal => {
  const actual = await importOriginal<typeof import("@/data/vinyls")>();
  return {
    ...actual,
    VINYLS: actual.VINYLS.map(v =>
      v.id === "mbdtf"
        ? {
            ...v,
            preview: {
              track: "Runaway",
              url: "https://audio-ssl.itunes.apple.com/runaway.m4a",
              link: "https://music.apple.com/gb/album/runaway",
            },
          }
        : v
    ),
  };
});

const { default: Vinyls } = await import("./Vinyls");

beforeEach(() => {
  window.matchMedia = (query: string) =>
    ({ matches: false, media: query }) as MediaQueryList;
  // jsdom has no media playback: play and pause just fire the events.
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (
    this: HTMLMediaElement
  ) {
    Object.defineProperty(this, "paused", { value: false, configurable: true });
    this.dispatchEvent(new Event("play"));
    return Promise.resolve();
  });
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (
    this: HTMLMediaElement
  ) {
    Object.defineProperty(this, "paused", { value: true, configurable: true });
    this.dispatchEvent(new Event("pause"));
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Vinyl previews", () => {
  it("plays only when asked, and stops when another record opens", async () => {
    const user = userEvent.setup();
    render(<Vinyls />);
    await user.click(
      screen.getByRole("button", {
        name: "My Beautiful Dark Twisted Fantasy by Kanye West",
      })
    );
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    expect(
      screen
        .getByRole("link", { name: "on Apple Music ↗" })
        .getAttribute("href")
    ).toBe("https://music.apple.com/gb/album/runaway");

    await user.click(
      screen.getByRole("button", { name: "Play a preview of Runaway" })
    );
    expect(screen.getByRole("button", { name: "pause" })).toBeTruthy();

    await user.click(
      screen.getByRole("button", { name: "For Broken Ears by Tems" })
    );
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: /preview|pause/ })).toBeNull();
  });
});
