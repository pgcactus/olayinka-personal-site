/**
 * Home — "Hi, I'm Olayinka." over one continuous line drawing.
 *
 * - At rest the line draws an open notebook. Hovering a highlighted phrase
 *   (or focusing it) redraws the line as that thing; clicking or tapping pins
 *   it until Escape, a click elsewhere or a second click. Nothing changes on
 *   its own.
 * - Some phrases add a small panel above: the day job, the NATO speller
 *   (opened from the walkie-talkie's "type me" screen or a click) and a row
 *   of record covers.
 * - The copy can be switched to French; the prerendered page is English.
 * - Only the three phrases with a panel are buttons. The others only change
 *   the drawing, so assistive tech reads them as plain words; they can still
 *   be focused, and tapped on a phone.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import LangSwitch from "@/components/LangSwitch";
import PageMeta from "@/components/PageMeta";
import { VINYLS } from "@/data/vinyls";
import {
  createLineScene,
  type LineScene,
  type SubjectKey,
} from "@/lib/line-scene";
import { useLang } from "@/lib/lang";
import { STARTER_WORD, sanitise, toPhonetic } from "@/lib/nato";
import "./home.css";

type Key = Exclude<SubjectKey, "idle">;

const LINKEDIN = "https://www.linkedin.com/in/olayinkaetitilola/";
// Leaving a phrase waits this long before the notebook returns, so the mouse
// can reach the walkie-talkie's "type me" without the drawing changing.
const LEAVE_MS = 650;

const COPY = {
  en: {
    title: "Hi, I’m Olayinka.",
    body: [
      "Right now, I lead product work at {flatiron|Flatiron Health}.",
      "Outside of work, I build {things|small things}, collect {records|vinyls} and battle to {plants|keep my plants alive}.",
      "For a clean reset, I’d happily {plane|skydive}, play {tennis|tennis} or do a {run|quick 5K} with friends.",
    ],
    flatiron: [
      "day job",
      "Healthtech putting real-world data to work on cancer research and care. I work on identity and access.",
    ],
    things: ["small things", "A NATO alphabet speller."],
    typeMe: "type me",
    tryLabel: "Type anything",
    full: "the full tool →",
    records: [
      "on the shelf",
      `${VINYLS.length} records, one at a time`,
      "see the wall →",
    ],
    time: (t: string, city: string) =>
      city ? `${t} in ${city}` : `${t} your time`,
  },
  fr: {
    title: "Bonjour, je m’appelle Olayinka.",
    body: [
      "En ce moment, je dirige le travail produit chez {flatiron|Flatiron Health}.",
      "En dehors du travail, je crée de {things|petites choses}, je collectionne les {records|vinyles} et je me bats pour {plants|garder mes plantes en vie}.",
      "Pour décompresser, je fais volontiers du {plane|parachutisme}, du {tennis|tennis} ou un {run|petit 5 km} entre amis.",
    ],
    flatiron: [
      "au quotidien",
      "Une healthtech qui met les données de vie réelle au service de la recherche et des soins contre le cancer. Je travaille sur l’identité et les accès.",
    ],
    things: ["petites choses", "Un outil d’épellation OTAN."],
    typeMe: "écrivez-moi",
    tryLabel: "Tapez n’importe quoi",
    full: "l’outil complet →",
    records: [
      "sur l’étagère",
      `${VINYLS.length} disques, un par un`,
      "voir le mur →",
    ],
    time: (t: string) => `${t}, heure locale`,
  },
};

const COVERS = VINYLS.filter(v => v.coverUrl).slice(0, 5);

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Olayinka Titilola",
  jobTitle: "Product Manager",
  worksFor: { "@type": "Organization", name: "Flatiron Health" },
  url: "https://olayinka.xyz",
  sameAs: [LINKEDIN, "https://github.com/pgcactus"],
};

// Phrases that open a panel; the rest only change the drawing.
const WITH_PANEL: Key[] = ["flatiron", "things", "records"];

/** "text {key|label} text" → text and phrases. */
function Phrases({
  text,
  active,
  pinned,
}: {
  text: string;
  active: Key | null;
  pinned: Key | null;
}) {
  const parts = text.split(/(\{\w+\|[^}]+\})/);
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^\{(\w+)\|([^}]+)\}$/);
        if (!m) return part;
        const key = m[1] as Key;
        const className = `hm-mark${active === key ? " hm-mark--on" : ""}`;
        return WITH_PANEL.includes(key) ? (
          <button
            key={i}
            type="button"
            className={className}
            data-key={key}
            aria-expanded={pinned === key}
            aria-controls="hm-panel"
          >
            {m[2]}
          </button>
        ) : (
          <span key={i} className={className} data-key={key} tabIndex={0}>
            {m[2]}
          </span>
        );
      })}
    </>
  );
}

export default function Home() {
  const lang = useLang();
  const [active, setActive] = useState<Key | null>(null);
  const [pinned, setPinned] = useState<Key | null>(null);
  const [cta, setCta] = useState<{ x: number; y: number } | null>(null);
  const [tryValue, setTryValue] = useState("");
  const [clock, setClock] = useState<string | null>(null);
  const [fading, setFading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<LineScene | null>(null);
  const leaveRef = useRef(0);
  const tryRef = useRef<HTMLInputElement>(null);
  const c = COPY[lang];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scene = createLineScene(canvas, setCta);
    sceneRef.current = scene;
    return () => {
      scene.destroy();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.show(active ?? "idle");
  }, [active]);

  // The viewer's own time and city, filled in after hydration.
  useEffect(() => {
    const tick = () => {
      const time = new Date().toLocaleTimeString(
        lang === "fr" ? "fr-FR" : "en-GB",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
      let city = "";
      try {
        const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        if (zone.includes("/") && !zone.startsWith("Etc/"))
          city = zone.split("/").pop()!.replace(/_/g, " ");
      } catch {
        /* no time zone */
      }
      setClock(COPY[lang].time(time, city));
    };
    const first = window.setTimeout(tick, 0);
    const timer = window.setInterval(tick, 15000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, [lang]);

  const close = useCallback(() => {
    window.clearTimeout(leaveRef.current);
    setPinned(null);
    setActive(null);
  }, []);

  const pinThings = useCallback(() => {
    window.clearTimeout(leaveRef.current);
    setPinned("things");
    setActive("things");
  }, []);

  useEffect(() => {
    if (pinned === "things") tryRef.current?.focus();
  }, [pinned]);

  useEffect(() => {
    if (!pinned) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onDown = (e: PointerEvent) => {
      if (
        !(e.target as Element | null)?.closest(".hm-mark, .hm-panel, .hm-cta")
      )
        close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [pinned, close]);

  const keyOf = (target: EventTarget | null) =>
    ((target as Element | null)?.closest(".hm-mark") as HTMLElement | null)
      ?.dataset.key as Key | undefined;

  const leave = () => {
    window.clearTimeout(leaveRef.current);
    leaveRef.current = window.setTimeout(() => setActive(null), LEAVE_MS);
  };

  const onOver = (e: React.PointerEvent) => {
    window.clearTimeout(leaveRef.current);
    const key = keyOf(e.target);
    if (key && e.pointerType === "mouse" && !pinned) setActive(key);
  };
  const onOut = (e: React.PointerEvent) => {
    const el = (e.target as Element).closest(".hm-mark");
    if (
      el &&
      e.pointerType === "mouse" &&
      !pinned &&
      !el.contains(e.relatedTarget as Node | null)
    )
      leave();
  };
  const onFocus = (e: React.FocusEvent) => {
    const key = keyOf(e.target);
    if (key && !pinned) setActive(key);
  };
  const onBlur = (e: React.FocusEvent) => {
    if (!pinned && keyOf(e.target) && !keyOf(e.relatedTarget)) setActive(null);
  };
  const onClick = (e: React.MouseEvent) => {
    const key = keyOf(e.target);
    if (!key) return;
    window.clearTimeout(leaveRef.current);
    if (pinned === key) close();
    else {
      setPinned(key);
      setActive(key);
    }
  };

  // Fade the words out, switch, and fade them back in.
  const fadeSwitch = (apply: () => void) => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      apply();
      return;
    }
    setFading(true);
    window.setTimeout(() => {
      apply();
      setFading(false);
    }, 250);
  };

  const shown = pinned ?? active;
  let panel: React.ReactNode = null;
  if (shown === "flatiron")
    panel = (
      <>
        <span className="hm-tag">{c.flatiron[0]}</span>
        <p>{c.flatiron[1]}</p>
      </>
    );
  else if (shown === "things" && pinned === "things")
    panel = (
      <>
        <span className="hm-tag">{c.things[0]}</span>
        <div className="hm-try">
          <label htmlFor="hm-try">{c.tryLabel}</label>
          <input
            id="hm-try"
            ref={tryRef}
            value={tryValue}
            placeholder={STARTER_WORD}
            maxLength={24}
            autoComplete="off"
            spellCheck={false}
            autoCapitalize="characters"
            onChange={e => setTryValue(sanitise(e.target.value).slice(0, 24))}
          />
          <output htmlFor="hm-try">{toPhonetic(tryValue) || "…"}</output>
        </div>
        <Link href="/nato">{c.full}</Link>
      </>
    );
  else if (shown === "things")
    panel = (
      <>
        <span className="hm-tag">{c.things[0]}</span>
        <p>{c.things[1]}</p>
      </>
    );
  else if (shown === "records")
    panel = (
      <>
        <span className="hm-tag">{c.records[0]}</span>
        <span className="hm-covers">
          {COVERS.map((v, i) => (
            <img
              key={v.id}
              src={v.coverUrl!}
              alt={`${v.title} by ${v.artist}`}
              width={64}
              height={64}
              style={{ animationDelay: `${i * 45}ms` }}
            />
          ))}
        </span>
        <span className="hm-row">
          <span>{c.records[1]}</span>
          <Link href="/things/vinyls">{c.records[2]}</Link>
        </span>
      </>
    );

  return (
    <div className={`hm hm--${lang}${fading ? " hm--fading" : ""}`}>
      <PageMeta
        title="Olayinka Titilola"
        description="Product manager in London. I lead product work at Flatiron Health, build small things, collect vinyls and try to keep my plants alive."
        path="/"
        jsonLd={personJsonLd}
      />
      <span className="hm-tick hm-tick--tl" />
      <span className="hm-tick hm-tick--tr" />
      <span className="hm-tick hm-tick--bl" />
      <span className="hm-tick hm-tick--br" />

      <header className="hm-header">
        <span className="hm-name">Olayinka Titilola</span>
        <div className="hm-actions">
          <a
            className="hm-round hm-round--icon"
            href={LINKEDIN}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.5h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1v5.46h-4v-4.84c0-1.16-.02-2.64-1.61-2.64-1.61 0-1.86 1.26-1.86 2.56v4.92h-4v-11Z" />
            </svg>
          </a>
          <LangSwitch className="hm-round hm-lang" onSwitch={fadeSwitch} />
        </div>
      </header>

      <div className="hm-stage">
        <div className="hm-aside" aria-live="polite">
          {panel && (
            <div
              className="hm-panel"
              id="hm-panel"
              key={`${shown}-${pinned}-${lang}`}
            >
              {panel}
            </div>
          )}
        </div>
        <div className="hm-art">
          <canvas ref={canvasRef} className="hm-scene" aria-hidden="true" />
          {cta && !pinned && (
            <button
              type="button"
              className="hm-cta"
              style={{
                transform: `translate(${Math.round(cta.x)}px, ${Math.round(cta.y)}px) translate(-50%, -50%)`,
              }}
              onPointerEnter={() => window.clearTimeout(leaveRef.current)}
              onPointerLeave={e =>
                e.pointerType === "mouse" && !pinned && leave()
              }
              onClick={pinThings}
            >
              {c.typeMe}
            </button>
          )}
        </div>
      </div>

      <main
        className="hm-main"
        onPointerOver={onOver}
        onPointerOut={onOut}
        onFocus={onFocus}
        onBlur={onBlur}
        onClick={onClick}
      >
        <h1 className="hm-title">{c.title}</h1>
        <p className="hm-copy">
          {c.body.map((line, i) => (
            <span key={i}>
              {i > 0 && " "}
              <Phrases text={line} active={shown} pinned={pinned} />
            </span>
          ))}
        </p>
      </main>

      <footer className="hm-footer">
        <span className="hm-note">{clock ?? " "}</span>
      </footer>
    </div>
  );
}
