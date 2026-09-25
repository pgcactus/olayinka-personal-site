/**
 * /things/vinyls — records on wall shelves.
 *
 * - Stone-paper wall and floating shelves in the site's colours (light and
 *   dark); shelf tops foreshorten against a fixed eye line as the page scrolls.
 * - 5 records per shelf from 768px, 3 below; partial shelves are centred.
 * - Desktop: choosing a record flies its sleeve out to the right-hand panel
 *   while the wall slides left; choosing again, clicking the wall or pressing
 *   Escape sends it back. Mobile: a bottom sheet slides up instead.
 * - Every record is a real button, and the page prerenders like the others.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import PageMeta from "@/components/PageMeta";
import { useTheme } from "@/contexts/ThemeContext";
import { VINYLS, type Vinyl } from "@/data/vinyls";
import "./vinyls.css";

const DESKTOP_QUERY = "(min-width: 768px)";
const FLIGHT_MS = 900;
const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
// Keep in sync with vinyls.css: panel width, wall shift and panel cover size.
const PANEL_WIDTH = 0.32;
const WALL_SHIFT = 0.2;
const PANEL_COVER = 0.36;
const PANEL_COVER_TOP = 0.18;

const DESKTOP_COLS = 5;
const MOBILE_COLS = 3;
const shelfCount = (cols: number) => Math.ceil(VINYLS.length / cols);

function isDesktop() {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Where a flown-out sleeve rests: centred in the panel, in viewport pixels. */
function panelCoverRect() {
  const size = window.innerHeight * PANEL_COVER;
  const panelLeft = window.innerWidth * (1 - PANEL_WIDTH);
  return {
    left: panelLeft + (window.innerWidth * PANEL_WIDTH - size) / 2,
    top: window.innerHeight * PANEL_COVER_TOP,
    width: size,
    height: size,
  };
}

type Box = { left: number; top: number; width: number; height: number };

function placeAt(el: HTMLElement, box: Box) {
  el.style.left = `${box.left}px`;
  el.style.top = `${box.top}px`;
  el.style.width = `${box.width}px`;
  el.style.height = `${box.height}px`;
}

/** Animate `el` (already placed at `to`) so it appears to travel from `from`. */
function flyFrom(el: HTMLElement, from: Box, to: Box) {
  return el.animate(
    [
      {
        transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width})`,
      },
      { transform: "none" },
    ],
    {
      duration: prefersReducedMotion() ? 0 : FLIGHT_MS,
      easing: EASE,
      fill: "both",
    }
  );
}

function detailLines(vinyl: Vinyl) {
  if (vinyl.note) return vinyl.note;
  const lines = [`Released ${vinyl.year}.`];
  if (vinyl.favouriteTrack) {
    lines.push(`Favourite track: ${vinyl.favouriteTrack}.`);
  }
  return lines.join("\n");
}

export default function Vinyls() {
  const { theme, toggleTheme } = useTheme();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const flightLayerRef = useRef<HTMLDivElement>(null);
  const coverRefs = useRef(new Map<string, HTMLImageElement>());
  const flyers = useRef(new Map<string, HTMLImageElement>());

  // The panel keeps showing the last record while it fades out.
  const [shownId, setShownId] = useState<string | null>(null);
  const selected = VINYLS.find(v => v.id === selectedId) ?? null;
  const shown = selected ?? VINYLS.find(v => v.id === shownId) ?? null;

  // Keep the eye line a third of the way down the viewport, so shelves
  // foreshorten as they scroll past, like a fixed camera.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const wall = wallRef.current;
      if (!wall) return;
      const originY =
        window.innerHeight * 0.33 - wall.getBoundingClientRect().top;
      wall.style.setProperty("--vx-origin-y", `${originY}px`);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  /** Wall offset (px) right now, mid-transition included. */
  const currentWallShift = () => {
    const wall = wallRef.current;
    if (!wall) return 0;
    return new DOMMatrix(getComputedStyle(wall).transform).m41;
  };

  const launch = useCallback((id: string) => {
    const cover = coverRefs.current.get(id);
    const layer = flightLayerRef.current;
    if (!cover || !layer) return;
    const from = cover.getBoundingClientRect();
    const to = panelCoverRect();

    const flyer = document.createElement("img");
    flyer.src = cover.currentSrc || cover.src;
    flyer.alt = "";
    flyer.className = "vx-flyer";
    placeAt(flyer, to);
    layer.appendChild(flyer);
    flyers.current.set(id, flyer);
    cover.style.visibility = "hidden";
    flyFrom(flyer, from, to);
  }, []);

  const land = useCallback((id: string, wallStaysShifted: boolean) => {
    const cover = coverRefs.current.get(id);
    const flyer = flyers.current.get(id);
    if (!cover || !flyer) return;
    flyers.current.delete(id);

    // The slot moves with the wall, so aim for where it will be once the
    // wall finishes its own transition.
    const slot = cover.getBoundingClientRect();
    const finalShift = wallStaysShifted ? -window.innerWidth * WALL_SHIFT : 0;
    const to = {
      left: slot.left - currentWallShift() + finalShift,
      top: slot.top,
      width: slot.width,
      height: slot.height,
    };
    const from = flyer.getBoundingClientRect();
    flyer.getAnimations().forEach(animation => animation.cancel());
    placeAt(flyer, to);
    flyFrom(flyer, from, to).finished.then(
      () => {
        flyer.remove();
        cover.style.visibility = "";
      },
      () => undefined
    );
  }, []);

  const close = useCallback(() => {
    setSelectedId(current => {
      if (current && flyers.current.has(current)) land(current, false);
      return null;
    });
  }, [land]);

  const choose = (id: string) => {
    if (id === selectedId) {
      close();
      return;
    }
    if (isDesktop()) {
      if (selectedId) land(selectedId, true);
      launch(id);
    }
    setSelectedId(id);
    setShownId(id);
  };

  useEffect(() => {
    if (!selectedId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    // Keep a flown-out sleeve centred in the panel if the window resizes.
    const onResize = () => {
      const flyer = flyers.current.get(selectedId);
      if (flyer) placeAt(flyer, panelCoverRect());
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [selectedId, close]);

  return (
    <div className="vx-page" onClick={close}>
      <PageMeta
        title="Vinyls — Olayinka Titilola"
        description="Records in my collection, with a favourite track from each."
        path="/things/vinyls"
      />

      <header className="vx-header">
        <Link
          href="/"
          className="vx-home"
          onClick={event => event.stopPropagation()}
        >
          ← home
        </Link>
        <button
          type="button"
          className="vx-theme"
          aria-pressed={theme === "dark"}
          onClick={event => {
            event.stopPropagation();
            toggleTheme?.();
          }}
        >
          ( {theme === "dark" ? "day mode" : "night mode"} )
        </button>
      </header>

      <main className={`vx-stage${selected ? " vx-stage--open" : ""}`}>
        <div className="vx-heading">
          <h1 className="vx-title">Vinyls</h1>
          <span className="vx-count">
            ( {VINYLS.length} records, one at a time )
          </span>
        </div>
        <div className="vx-wall" ref={wallRef}>
          {Array.from({ length: shelfCount(DESKTOP_COLS) }, (_, row) => (
            <div
              key={`d${row}`}
              className="vx-shelf vx-shelf--desktop"
              style={{ "--vx-i": row } as React.CSSProperties}
              aria-hidden="true"
            />
          ))}
          {Array.from({ length: shelfCount(MOBILE_COLS) }, (_, row) => (
            <div
              key={`m${row}`}
              className="vx-shelf vx-shelf--mobile"
              style={{ "--vx-i": row } as React.CSSProperties}
              aria-hidden="true"
            />
          ))}

          <ul className="vx-records" aria-label="Record collection">
            {VINYLS.map(vinyl => (
              <li key={vinyl.id} className="vx-slot">
                <button
                  type="button"
                  className="vx-record"
                  aria-label={`${vinyl.title} by ${vinyl.artist}`}
                  aria-expanded={vinyl.id === selectedId}
                  aria-controls="vx-detail"
                  onClick={event => {
                    event.stopPropagation();
                    choose(vinyl.id);
                  }}
                >
                  {vinyl.coverUrl ? (
                    <img
                      ref={el => {
                        if (el) coverRefs.current.set(vinyl.id, el);
                        else coverRefs.current.delete(vinyl.id);
                      }}
                      className="vx-cover"
                      src={vinyl.coverUrl}
                      alt=""
                      draggable={false}
                    />
                  ) : (
                    <span className="vx-cover vx-cover--blank">
                      <span>{vinyl.title}</span>
                      <span>{vinyl.artist}</span>
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <div
        className="vx-flight-layer"
        ref={flightLayerRef}
        aria-hidden="true"
      />

      <aside
        id="vx-detail"
        className={`vx-panel${selected ? " vx-panel--open" : ""}`}
        aria-hidden={!selected}
        aria-live="polite"
      >
        {shown && (
          <div
            className="vx-panel-body"
            onClick={event => event.stopPropagation()}
          >
            {shown.coverUrl && (
              <img
                className="vx-panel-cover"
                src={shown.coverUrl}
                alt={`${shown.title} by ${shown.artist}`}
              />
            )}
            <div>
              <h2 className="vx-panel-title">{shown.title}</h2>
              <p className="vx-panel-artist">{shown.artist}</p>
            </div>
            <p className="vx-panel-note">{detailLines(shown)}</p>
          </div>
        )}
      </aside>
    </div>
  );
}
