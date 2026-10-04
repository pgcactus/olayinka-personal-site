import { describe, expect, it } from "vitest";
import { applySwap, DECK, difficulty, makeSwaps } from "./cards";

describe("cards", () => {
  it("never swaps a slot with itself and stays in range", () => {
    for (const [a, b] of makeSwaps(500, 6)) {
      expect(a).not.toBe(b);
      expect(a).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThan(6);
    }
  });

  it("moves cards without losing any", () => {
    let order = DECK.slice();
    for (const swap of makeSwaps(40, 6)) order = applySwap(order, swap);
    expect(order.slice().sort()).toEqual(DECK.slice().sort());
  });

  it("gets longer and faster, up to a limit", () => {
    expect(difficulty(0)).toEqual({ swaps: 7, ms: 300 });
    expect(difficulty(3)).toEqual({ swaps: 13, ms: 195 });
    expect(difficulty(20)).toEqual({ swaps: 22, ms: 140 });
  });
});
