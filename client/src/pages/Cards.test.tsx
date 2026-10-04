// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Cards from "./Cards";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const slots = () =>
  screen.getAllByRole("button", { name: /Card \d, face down/ });

async function pickAndShuffle(name: string) {
  fireEvent.click(screen.getByRole("button", { name }));
  // Watching, turning over and a first-round shuffle all finish well inside this.
  await act(() => vi.advanceTimersByTimeAsync(10_000));
}

describe("Find the card", () => {
  it("shuffles after a pick, then counts a correct find", async () => {
    render(<Cards />);
    expect(screen.getByText("Pick a card, any card.")).toBeTruthy();
    await pickAndShuffle("Ace of hearts");
    expect(slots()).toHaveLength(6);
    expect(screen.getByText("Where did it go?")).toBeTruthy();

    // The heart's button keeps its identity while it moves.
    const heart = document.querySelector<HTMLElement>('[data-card="heart"]')!;
    fireEvent.click(heart);
    expect(screen.getByText("Found it.")).toBeTruthy();
    expect(screen.getByText("streak 1")).toBeTruthy();
    expect(screen.getByRole("button", { name: "faster →" })).toBeTruthy();
  });

  it("shows where the card was after a miss and resets the streak", async () => {
    render(<Cards />);
    await pickAndShuffle("Ace of spades");
    fireEvent.click(document.querySelector<HTMLElement>('[data-card="club"]')!);
    expect(screen.getByText("Not this time. Your card was here.")).toBeTruthy();
    expect(screen.getByText("streak 0")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Ace of spades" })).toBeTruthy();
  });

  it("ignores clicks while shuffling", async () => {
    render(<Cards />);
    fireEvent.click(screen.getByRole("button", { name: "Ace of clubs" }));
    await act(() => vi.advanceTimersByTimeAsync(2_000));
    expect(screen.getByText("Shuffling…")).toBeTruthy();
    fireEvent.click(document.querySelector<HTMLElement>('[data-card="club"]')!);
    expect(screen.getByText("Shuffling…")).toBeTruthy();
  });
});
