/**
 * Pixel-art playing cards for /cards: four aces and two jokers, drawn from
 * small grids so they stay crisp at any size.
 */

import type { CardId } from "@/lib/cards";

// "#" is the suit colour; "." is empty.
const SPADE = [
  "....#....",
  "...###...",
  "..#####..",
  ".#######.",
  "#########",
  "#########",
  ".##.#.##.",
  "....#....",
  "...###...",
];
const HEART = [
  ".##...##.",
  "####.####",
  "#########",
  "#########",
  ".#######.",
  "..#####..",
  "...###...",
  "....#....",
];
const DIAMOND = [
  "....#....",
  "...###...",
  "..#####..",
  ".#######.",
  "#########",
  ".#######.",
  "..#####..",
  "...###...",
  "....#....",
];
const CLUB = [
  "...###...",
  "..#####..",
  "...###...",
  ".#.###.#.",
  "#########",
  "#########",
  ".#..#..#.",
  "....#....",
  "...###...",
];

// k ink, c hat, w face, y bells.
const JOKER = [
  "..y.....y..",
  ".cc.....cc.",
  ".ccc...ccc.",
  "..ccc.ccc..",
  "..ccccccc..",
  "..kwwwwwk..",
  "..wkwwwkw..",
  "..wwwwwww..",
  "..wkkkkkw..",
  "...wwwww...",
  ".kkk.k.kkk.",
  "..kkkkkkk..",
  "..ckkkkkc..",
  "..kk...kk..",
  ".kkk...kkk.",
];

const SUITS = {
  spade: { grid: SPADE, red: false },
  heart: { grid: HEART, red: true },
  diamond: { grid: DIAMOND, red: true },
  club: { grid: CLUB, red: false },
} as const;

function Pixels({
  grid,
  colours,
  className,
}: {
  grid: readonly string[];
  colours: Record<string, string>;
  className?: string;
}) {
  const w = grid[0].length;
  const h = grid.length;
  return (
    <svg
      className={className}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {grid.flatMap((row, y) =>
        [...row].map((ch, x) =>
          colours[ch] ? (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1.02}
              height={1.02}
              fill={colours[ch]}
            />
          ) : null
        )
      )}
    </svg>
  );
}

export function CardFace({ id }: { id: CardId }) {
  if (id === "joker" || id === "jokerDark") {
    const hat = id === "joker" ? "var(--card-red)" : "var(--card-grey)";
    return (
      <span className={`kd-face kd-face--joker kd-face--${id}`}>
        <span className="kd-joker-word">JOKER</span>
        <Pixels
          className="kd-joker"
          grid={JOKER}
          colours={{
            k: "var(--card-ink)",
            c: hat,
            w: "var(--card-paper)",
            y: "var(--card-gold)",
          }}
        />
        <span className="kd-joker-word kd-joker-word--flip">JOKER</span>
      </span>
    );
  }
  const suit = SUITS[id];
  const colours = { "#": suit.red ? "var(--card-red)" : "var(--card-ink)" };
  return (
    <span className={`kd-face${suit.red ? " kd-face--red" : ""}`}>
      <span className="kd-index">
        A
        <Pixels grid={suit.grid} colours={colours} className="kd-pip" />
      </span>
      <Pixels grid={suit.grid} colours={colours} className="kd-big" />
      <span className="kd-index kd-index--flip">
        A
        <Pixels grid={suit.grid} colours={colours} className="kd-pip" />
      </span>
    </span>
  );
}

export function CardBack() {
  return <span className="kd-back" />;
}
