/**
 * /cards: find the card. Pick one of six face-up cards, watch them turn over
 * and shuffle, then pick again. Every find makes the next shuffle longer and
 * quicker.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import PageMeta from "@/components/PageMeta";
import SiteHeader from "@/components/SiteHeader";
import { CardBack, CardFace } from "@/components/PixelCard";
import { useLang } from "@/lib/lang";
import {
  applySwap,
  DECK,
  difficulty,
  makeSwaps,
  type CardId,
} from "@/lib/cards";
import "./cards.css";

const STRINGS = {
  en: {
    title: "Find the card",
    sub: "Pick a card. Watch the shuffle. Can you find it again?",
    names: {
      spade: "Ace of spades",
      heart: "Ace of hearts",
      diamond: "Ace of diamonds",
      club: "Ace of clubs",
      joker: "Red joker",
      jokerDark: "Black joker",
    } as Record<CardId, string>,
    pick: "Pick a card, any card.",
    watch: (name: string) => `${name}. Keep your eye on it.`,
    shuffling: "Shuffling…",
    find: "Pick a card, any card.",
    findHint: "Where did it go?",
    found: "Found it.",
    lost: "Not this time. Your card was here.",
    again: "go again →",
    faster: "faster →",
    streak: (n: number) => `streak ${n}`,
    best: (n: number) => `best ${n}`,
    faceDown: (n: number) => `Card ${n}, face down`,
    yours: "your card",
  },
  fr: {
    title: "Trouvez la carte",
    sub: "Choisissez une carte. Suivez le mélange. Saurez-vous la retrouver ?",
    names: {
      spade: "As de pique",
      heart: "As de cœur",
      diamond: "As de carreau",
      club: "As de trèfle",
      joker: "Joker rouge",
      jokerDark: "Joker noir",
    } as Record<CardId, string>,
    pick: "Choisissez une carte, n’importe laquelle.",
    watch: (name: string) => `${name}. Ne la quittez pas des yeux.`,
    shuffling: "Mélange…",
    find: "Choisissez une carte, n’importe laquelle.",
    findHint: "Où est-elle passée ?",
    found: "Trouvée.",
    lost: "Pas cette fois. Votre carte était ici.",
    again: "rejouer →",
    faster: "plus vite →",
    streak: (n: number) => `série ${n}`,
    best: (n: number) => `record ${n}`,
    faceDown: (n: number) => `Carte ${n}, face cachée`,
    yours: "votre carte",
  },
};

type Phase = "pick" | "watch" | "shuffling" | "find" | "found" | "lost";

const NARROW = "(max-width: 640px)";
const FLIP_MS = 450;
const WATCH_MS = 1100;

export default function Cards() {
  const t = STRINGS[useLang()];
  const [order, setOrder] = useState<CardId[]>(DECK);
  const [phase, setPhase] = useState<Phase>("pick");
  const [picked, setPicked] = useState<CardId | null>(null);
  const [guess, setGuess] = useState<CardId | null>(null);
  const [faceUp, setFaceUp] = useState<Set<CardId>>(() => new Set(DECK));
  const [moving, setMoving] = useState<CardId[]>([]);
  const [moveMs, setMoveMs] = useState(300);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [cols, setCols] = useState(6);
  const timers = useRef<number[]>([]);
  // The shuffle runs across many timeouts, so it tracks the order here.
  const orderRef = useRef<CardId[]>(DECK);

  const later = (ms: number) =>
    new Promise<void>(resolve => {
      timers.current.push(window.setTimeout(resolve, ms));
    });

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(id => window.clearTimeout(id));
  }, []);

  // Six in a row, or two rows of three on phones; read after hydration.
  useEffect(() => {
    const query = window.matchMedia?.(NARROW);
    if (!query) return;
    const update = () => setCols(query.matches ? 3 : 6);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    try {
      const stored = Number(window.localStorage.getItem("cards-best"));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored > 0) setBest(stored);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const runShuffle = useCallback(async (card: CardId, level: number) => {
    setPicked(card);
    setPhase("watch");
    await later(WATCH_MS);
    setFaceUp(new Set());
    await later(FLIP_MS + 150);

    setPhase("shuffling");
    const { swaps, ms } = difficulty(level);
    setMoveMs(ms);
    let current = orderRef.current;
    for (const swap of makeSwaps(swaps, DECK.length)) {
      const pair = [current[swap[0]], current[swap[1]]];
      current = applySwap(current, swap);
      orderRef.current = current;
      setMoving(pair);
      setOrder(current);
      await later(ms + 40);
    }
    setMoving([]);
    setPhase("find");
  }, []);

  const choose = (card: CardId) => {
    if (phase === "pick") {
      void runShuffle(card, streak);
    } else if (phase === "find") {
      setGuess(card);
      if (card === picked) {
        setFaceUp(new Set([card]));
        const next = streak + 1;
        setStreak(next);
        if (next > best) {
          setBest(next);
          try {
            window.localStorage.setItem("cards-best", String(next));
          } catch {
            /* storage unavailable */
          }
        }
        setPhase("found");
      } else {
        setFaceUp(new Set(DECK));
        setPhase("lost");
      }
    }
  };

  // After a find, the same deck goes again, faster. After a miss, start over.
  const playAgain = async () => {
    const level = phase === "found" ? streak : 0;
    if (phase === "lost") setStreak(0);
    setGuess(null);
    setPicked(null);
    setFaceUp(new Set(DECK));
    await later(FLIP_MS);
    if (phase === "found" && picked) void runShuffle(picked, level);
    else setPhase("pick");
  };

  const status =
    phase === "pick"
      ? t.pick
      : phase === "watch"
        ? t.watch(t.names[picked!])
        : phase === "shuffling"
          ? t.shuffling
          : phase === "find"
            ? t.find
            : phase === "found"
              ? t.found
              : t.lost;

  const clickable = phase === "pick" || phase === "find";

  return (
    <div className="site-page">
      <PageMeta
        title="Find the card — Olayinka Titilola"
        description="Pick a card, watch the shuffle, and try to find it again. Each find makes the next shuffle faster."
        path="/cards"
        image="/og-cards.png"
      />
      <SiteHeader back="things" />
      <main className="kd">
        <div className="kd-heading">
          <h1 className="kd-title">{t.title}</h1>
          <p className="kd-sub">{t.sub}</p>
        </div>

        <div
          className="kd-table"
          style={
            {
              "--kd-cols": cols,
              "--kd-move": `${moveMs}ms`,
            } as React.CSSProperties
          }
        >
          {DECK.map(card => {
            const slot = order.indexOf(card);
            const up = faceUp.has(card);
            const mark =
              (phase === "watch" || phase === "lost") && card === picked
                ? " kd-slot--yours"
                : phase === "found" && card === guess
                  ? " kd-slot--found"
                  : phase === "lost" && card === guess
                    ? " kd-slot--miss"
                    : "";
            return (
              <button
                key={card}
                type="button"
                data-card={card}
                className={`kd-slot${mark}${moving.includes(card) ? " kd-slot--moving" : ""}`}
                style={
                  {
                    "--kd-col": slot % cols,
                    "--kd-row": Math.floor(slot / cols),
                  } as React.CSSProperties
                }
                aria-label={up ? t.names[card] : t.faceDown(slot + 1)}
                aria-disabled={!clickable}
                onClick={() => clickable && choose(card)}
              >
                <span className={`kd-card${up ? "" : " kd-card--down"}`}>
                  <span className="kd-side kd-side--front">
                    <CardFace id={card} />
                  </span>
                  <span className="kd-side kd-side--back">
                    <CardBack />
                  </span>
                </span>
                {mark === " kd-slot--yours" && (
                  <span className="kd-tag" aria-hidden="true">
                    {t.yours}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="kd-foot">
          <p className="kd-status" aria-live="polite">
            {status}
            {phase === "find" && <span> {t.findHint}</span>}
          </p>
          <p className="kd-score">
            <span>{t.streak(streak)}</span>
            <span>{t.best(best)}</span>
          </p>
          {(phase === "found" || phase === "lost") && (
            <button type="button" className="kd-again" onClick={playAgain}>
              {phase === "found" ? t.faster : t.again}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
