/**
 * DotArt — the dotted drawing beside the home page copy.
 *
 * Each drawing is a set of SVG circles with its own gentle motion. Moving a
 * pointer over it pushes nearby dots away; they ease back when it leaves.
 * The push is applied straight to the circles' transforms, so pointer moves
 * never re-render React. While the pointer is over a drawing its motion
 * pauses, so the dots under it stay put.
 *
 * "record" and "recordFast" share one spinning group: switching between them
 * eases the playback rate up or down, so the record never jumps.
 */

import { useEffect, useRef, useState } from "react";
import {
  buildBall,
  buildBuilding,
  buildChute,
  buildHand,
  buildPlant,
  buildRecord,
  buildRunner,
  buildSign,
  buildTrack,
  buildWave,
  repel,
  type Dot,
} from "@/lib/dot-art";
import "./dot-art.css";

export type Drawing =
  | "record"
  | "recordFast"
  | "wave"
  | "building"
  | "chute"
  | "ball"
  | "track"
  | "plant"
  | "hand"
  | "sign404";

const RUNNER_PERIOD = 2.8;
/** How much faster "recordFast" turns than the idle record. */
const SPIN_BOOST = 4;
const SPIN_EASE_MS = 900;
const record = buildRecord();

const DRAWINGS: Record<Drawing, { dots: Dot[]; motion: string }> = {
  record: { dots: record, motion: "da-spin" },
  recordFast: { dots: record, motion: "da-spin" },
  wave: { dots: [], motion: "" },
  building: { dots: buildBuilding(), motion: "" },
  chute: { dots: buildChute(), motion: "da-bob" },
  ball: { dots: buildBall(), motion: "da-bounce" },
  track: { dots: buildTrack(), motion: "" },
  plant: { dots: buildPlant(), motion: "da-sway" },
  hand: { dots: buildHand(), motion: "da-wave" },
  sign404: { dots: buildSign("404"), motion: "" },
};
const WAVE = buildWave();
const RUNNER = buildRunner(RUNNER_PERIOD);

interface DotArtProps {
  drawing: Drawing;
  caption: string;
  /** Shown after the caption until the first time someone moves over it. */
  hint?: string;
  className?: string;
}

export default function DotArt({
  drawing,
  caption,
  hint,
  className,
}: DotArtProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const frame = useRef(0);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const [poked, setPoked] = useState(false);
  const { dots, motion } = DRAWINGS[drawing];
  const groupKey = drawing === "recordFast" ? "record" : drawing;

  useEffect(() => {
    const spin = groupRef.current?.getAnimations?.()[0];
    if (!spin) return;
    const from = spin.playbackRate;
    const to = drawing === "recordFast" ? SPIN_BOOST : 1;
    if (from === to) return;
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / SPIN_EASE_MS);
      spin.playbackRate = from + (to - from) * (1 - (1 - k) ** 3);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [drawing]);

  const apply = () => {
    frame.current = 0;
    const svg = svgRef.current;
    const pt = pointer.current;
    if (!svg || !pt) return;
    const box = svg.getBoundingClientRect();
    const sp = {
      x: ((pt.x - box.left) / box.width) * 400,
      y: ((pt.y - box.top) / box.height) * 400,
    };
    // The drawing's group may be rotated or moved by its motion: map the
    // pointer into that frame so the dots under the pointer are the ones
    // that move.
    let gp = sp;
    const group = groupRef.current;
    if (group) {
      const style = getComputedStyle(group);
      if (style.transform && style.transform !== "none") {
        const [ox, oy] = style.transformOrigin.split(" ").map(parseFloat);
        const local = new DOMMatrix()
          .translate(ox, oy)
          .multiply(new DOMMatrix(style.transform))
          .translate(-ox, -oy)
          .inverse()
          .transformPoint(new DOMPoint(sp.x, sp.y));
        gp = { x: local.x, y: local.y };
      }
    }
    svg.querySelectorAll<SVGCircleElement>("circle").forEach(circle => {
      const p = circle.dataset.layer === "group" ? gp : sp;
      const push = repel(
        parseFloat(circle.getAttribute("cx") ?? "0"),
        parseFloat(circle.getAttribute("cy") ?? "0"),
        p.x,
        p.y
      );
      circle.style.transform = push
        ? `translate(${push.tx}px, ${push.ty}px)`
        : "";
    });
  };

  const onPointerMove = (event: React.PointerEvent) => {
    pointer.current = { x: event.clientX, y: event.clientY };
    if (!poked) setPoked(true);
    if (!frame.current) frame.current = requestAnimationFrame(apply);
  };

  const onPointerLeave = () => {
    pointer.current = null;
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    svgRef.current
      ?.querySelectorAll<SVGCircleElement>("circle")
      .forEach(circle => (circle.style.transform = ""));
  };

  return (
    <figure className={`da${className ? ` ${className}` : ""}`}>
      <svg
        ref={svgRef}
        className="da-svg"
        viewBox="0 0 400 400"
        aria-hidden="true"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        <g key={groupKey} className="da-enter">
          <g ref={groupRef} className={motion}>
            {dots.map((d, i) => (
              <circle
                key={i}
                data-layer="group"
                cx={d.x}
                cy={d.y}
                r={d.r}
                opacity={d.o}
              />
            ))}
          </g>
        </g>
        {drawing === "wave" &&
          WAVE.map((col, i) => (
            <g
              key={i}
              className="da-bar"
              style={{ animationDelay: `${col.delay}s` }}
            >
              {col.dots.map((d, j) => (
                <circle key={j} cx={d.x} cy={d.y} r={d.r} opacity={d.o} />
              ))}
            </g>
          ))}
        {drawing === "track" &&
          RUNNER.map((d, i) => (
            <circle
              key={i}
              className="da-chase"
              style={{
                animationDelay: `${d.delay}s`,
                animationDuration: `${RUNNER_PERIOD}s`,
              }}
              cx={d.x}
              cy={d.y}
              r={d.r}
            />
          ))}
      </svg>
      <figcaption className="da-caption" role="status" aria-live="polite">
        ( {caption}
        {hint && !poked ? ` · ${hint}` : ""} )
      </figcaption>
    </figure>
  );
}
