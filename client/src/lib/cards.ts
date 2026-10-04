/**
 * Find the card: the deck, the shuffle and how hard each round is.
 */

export type CardId =
  | "spade"
  | "heart"
  | "diamond"
  | "club"
  | "joker"
  | "jokerDark";

export const DECK: CardId[] = [
  "spade",
  "heart",
  "diamond",
  "club",
  "joker",
  "jokerDark",
];

/** A pair of slots whose cards trade places. */
export type Swap = [number, number];

/** Swaps that move cards around without ever swapping a slot with itself. */
export function makeSwaps(
  count: number,
  slots: number,
  random: () => number = Math.random
): Swap[] {
  const swaps: Swap[] = [];
  for (let i = 0; i < count; i++) {
    const a = Math.floor(random() * slots);
    let b = Math.floor(random() * (slots - 1));
    if (b >= a) b += 1;
    swaps.push([a, b]);
  }
  return swaps;
}

export function applySwap<T>(order: T[], [a, b]: Swap): T[] {
  const next = order.slice();
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}

/** Each correct find makes the next shuffle longer and quicker. */
export function difficulty(streak: number) {
  return {
    swaps: Math.min(7 + streak * 2, 22),
    ms: Math.max(140, 300 - streak * 35),
  };
}
