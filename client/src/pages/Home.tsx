/**
 * Home — a few short lines, each with phrases worth hovering.
 *
 * - Card phrases (Olayinka, Flatiron Health, small things, vinyls) open a
 *   small card above the phrase and soften the rest of the copy. On phones
 *   the card becomes a sheet at the bottom of the screen.
 * - Drawing phrases (plants, skydive, tennis, quick 5K) only change the dot
 *   drawing beside the copy.
 * - With a mouse on a wide screen, hovering previews a card and moving away
 *   closes it. Clicking or tapping pins it open until Escape, a click
 *   outside, "( close )" or a second click. Where cards become sheets,
 *   hovering does nothing, so the mouse can travel to the sheet.
 */

import { createContext, useContext, useEffect, useState } from "react";
import { Link } from "wouter";
import DotArt, { type Drawing } from "@/components/DotArt";
import PageMeta from "@/components/PageMeta";
import { useTheme } from "@/contexts/ThemeContext";
import { VINYLS } from "@/data/vinyls";
import { sanitise, toPhonetic } from "@/lib/nato";
import "./home.css";

type Key =
  | "hello"
  | "flatiron"
  | "things"
  | "records"
  | "plants"
  | "plane"
  | "tennis"
  | "run";

const CARD_KEYS: Key[] = ["hello", "flatiron", "things", "records"];
// Keep in sync with the sheet breakpoint in home.css.
const HOVER_QUERY = "(hover: hover) and (min-width: 768px)";
const LINKEDIN = "https://www.linkedin.com/in/olayinkaetitilola/";

const ART: Record<Key | "idle", [Drawing, string]> = {
  idle: ["record", "spinning, gently"],
  hello: ["hand", "hello there"],
  flatiron: ["building", "the day job"],
  things: ["wave", "alfa, bravo, over"],
  records: ["recordFast", "needle down"],
  plants: ["plant", "still alive, mostly"],
  plane: ["chute", "falling, on purpose"],
  tennis: ["ball", "love all"],
  run: ["track", "12½ laps"],
};

const SHELF = VINYLS.map(v => v.title);
const CARD_COVERS = ["gnx", "for-broken-ears", "the-blueprint"].flatMap(id => {
  const vinyl = VINYLS.find(v => v.id === id);
  return vinyl?.coverUrl ? [{ ...vinyl, coverUrl: vinyl.coverUrl }] : [];
});

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Olayinka Titilola",
  jobTitle: "Product Manager",
  worksFor: { "@type": "Organization", name: "Flatiron Health" },
  url: "https://olayinka.xyz",
  sameAs: [LINKEDIN, "https://github.com/pgcactus"],
};

interface HomeState {
  active: Key | null;
  /** Opens `key` unless another card is pinned. */
  open: (key: Key) => void;
  /** Opens `key` from a mouse hover, where hover previews are allowed. */
  hover: (key: Key) => void;
  /** Closes `key` if it is open and not pinned. */
  release: (key: Key) => void;
  close: () => void;
  toggle: (key: Key) => void;
}

function canHover() {
  return window.matchMedia?.(HOVER_QUERY).matches ?? true;
}

const HomeContext = createContext<HomeState | null>(null);

function useHome() {
  const ctx = useContext(HomeContext);
  if (!ctx) throw new Error("useHome must be used inside Home");
  return ctx;
}

function Text({ children }: { children: React.ReactNode }) {
  return <span className="hm-t">{children}</span>;
}

/** A phrase that opens a card. `href` makes it a link as well. */
function CardPhrase({
  k,
  label,
  href,
  children,
}: {
  k: Key;
  label: string;
  href?: string;
  children: React.ReactNode;
}) {
  const { active, open, hover, release, close, toggle } = useHome();
  const on = active === k;
  const cls = `hm-door${on ? " hm-door--on" : ""}`;
  const shared = {
    className: cls,
    "aria-expanded": on,
    "aria-controls": `hm-card-${k}`,
    onFocus: () => open(k),
  };

  return (
    <span
      className="hm-doorwrap"
      onPointerEnter={e => e.pointerType === "mouse" && hover(k)}
      onPointerLeave={e => e.pointerType === "mouse" && release(k)}
      onBlur={e => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null))
          release(k);
      }}
    >
      {href ? (
        <a {...shared} href={href} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      ) : (
        <button {...shared} type="button" onClick={() => toggle(k)}>
          {label}
        </button>
      )}
      {on && (
        <span className="hm-cardwrap" id={`hm-card-${k}`}>
          <span className="hm-card" role="group" aria-label={label}>
            {children}
            <button
              type="button"
              className="hm-card-close"
              onClick={() => close()}
            >
              ( close )
            </button>
          </span>
        </span>
      )}
    </span>
  );
}

/** A phrase that only changes the drawing. */
function DrawingPhrase({ k, children }: { k: Key; children: React.ReactNode }) {
  const { active, open, hover, release } = useHome();
  return (
    <span
      className={`hm-hint${active === k ? " hm-hint--on" : ""}`}
      tabIndex={0}
      onPointerEnter={e => e.pointerType === "mouse" && hover(k)}
      onPointerLeave={e => e.pointerType === "mouse" && release(k)}
      onFocus={() => open(k)}
      onBlur={() => release(k)}
    >
      {children}
    </span>
  );
}

function NatoCard() {
  const [value, setValue] = useState("OLAYINKA");
  return (
    <>
      <span className="hm-tab">try it</span>
      <label className="hm-nato-label">
        NATO phonetic alphabet
        <input
          className="hm-nato-input"
          value={value}
          onChange={e => setValue(sanitise(e.target.value).slice(0, 24))}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="characters"
        />
      </label>
      <span className="hm-nato-out" aria-live="polite">
        {toPhonetic(value) || "…"}
      </span>
      <Link href="/nato">the full tool →</Link>
    </>
  );
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [card, setCard] = useState<{ key: Key; pinned: boolean } | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [shelf, setShelf] = useState(0);
  const active = card?.key ?? null;

  const open = (key: Key) =>
    setCard(current =>
      current?.key === key || current?.pinned ? current : { key, pinned: false }
    );
  const state: HomeState = {
    active,
    open,
    hover: key => {
      if (canHover()) open(key);
    },
    release: key =>
      setCard(current =>
        current?.key === key && !current.pinned ? null : current
      ),
    close: () => setCard(null),
    // The first click or tap pins the card; a second one closes it.
    toggle: key =>
      setCard(current =>
        current?.key === key && current.pinned ? null : { key, pinned: true }
      ),
  };

  // The clock and shelf note are filled in after hydration, so the
  // prerendered HTML and the first client render match.
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const clock = window.setInterval(tick, 15000);
    const rotate = window.setInterval(
      () => setShelf(s => (s + 1) % SHELF.length),
      5000
    );
    return () => {
      window.clearTimeout(first);
      window.clearInterval(clock);
      window.clearInterval(rotate);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCard(null);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!(e.target as Element | null)?.closest(".hm-doorwrap, .hm-hint"))
        setCard(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [active]);

  const focused = active !== null && CARD_KEYS.includes(active);
  const [drawing, caption] = ART[active ?? "idle"];
  const time =
    now === null
      ? null
      : new Date(now).toLocaleTimeString("en-GB", {
          timeZone: "Europe/London",
          hour: "2-digit",
          minute: "2-digit",
        });

  return (
    <HomeContext.Provider value={state}>
      <div className="hm">
        <PageMeta
          title="Olayinka Titilola"
          description="Product manager in London. I lead product work at Flatiron Health, build small things, collect vinyls and try to keep my plants alive."
          path="/"
          jsonLd={personJsonLd}
        />

        <button
          type="button"
          className="hm-note hm-theme"
          onClick={toggleTheme}
          aria-pressed={theme === "dark"}
        >
          ( {theme === "dark" ? "day mode" : "night mode"} )
        </button>

        <main className="hm-main">
          <div className={`hm-copy${focused ? " hm-copy--focus" : ""}`}>
            <h1 className="hm-line hm-greet">
              <Text>Hi, I’m </Text>
              <CardPhrase k="hello" label="Olayinka" href={LINKEDIN}>
                <span className="hm-tab">say hello</span>
                <span className="hm-card-title">
                  Click to go to LinkedIn ↗
                </span>
              </CardPhrase>
              <Text>.</Text>
            </h1>

            <p className="hm-line">
              <Text>Right now, I lead product work at </Text>
              <CardPhrase k="flatiron" label="Flatiron Health">
                <span className="hm-tab">day job</span>
                <span className="hm-card-title">Flatiron Health</span>
                <span className="hm-card-muted">
                  Healthtech putting real-world data to work on cancer research
                  and care.
                </span>
                <span className="hm-card-muted">
                  I work on identity and access, making them hold up at scale.
                </span>
                <a href={LINKEDIN} target="_blank" rel="noopener noreferrer">
                  linkedin ↗
                </a>
              </CardPhrase>
              <Text>.</Text>
            </p>

            <p className="hm-line">
              <Text>Outside of work, I build </Text>
              <CardPhrase k="things" label="small things">
                <NatoCard />
              </CardPhrase>
              <Text>, collect </Text>
              <CardPhrase k="records" label="vinyls">
                <span className="hm-tab">on the shelf</span>
                <span className="hm-covers">
                  {CARD_COVERS.map(v => (
                    <img
                      key={v.id}
                      src={v.coverUrl}
                      alt={`${v.title} by ${v.artist}`}
                      width={84}
                      height={84}
                      loading="lazy"
                    />
                  ))}
                </span>
                <span className="hm-card-row">
                  <span className="hm-card-muted">
                    {VINYLS.length} records, one at a time
                  </span>
                  <Link href="/things/vinyls">see the wall →</Link>
                </span>
              </CardPhrase>
              <Text> and battle to </Text>
              <DrawingPhrase k="plants">keep my plants alive</DrawingPhrase>
              <Text>.</Text>
            </p>

            <p className="hm-line">
              <Text>For a clean reset, I’d happily </Text>
              <DrawingPhrase k="plane">skydive</DrawingPhrase>
              <Text>, play </Text>
              <DrawingPhrase k="tennis">tennis</DrawingPhrase>
              <Text> or do a </Text>
              <DrawingPhrase k="run">quick 5K</DrawingPhrase>
              <Text> with friends.</Text>
            </p>
          </div>

          <DotArt
            className="hm-art"
            drawing={drawing}
            caption={caption}
            hint={active ? undefined : "poke it"}
          />
        </main>

        <p className="hm-note hm-clock">
          {time ? `( ${time} in london )` : "( london )"}
        </p>
        <p className="hm-note hm-shelf" aria-hidden="true">
          ( on the shelf: {SHELF[shelf]} )
        </p>
      </div>
    </HomeContext.Provider>
  );
}
