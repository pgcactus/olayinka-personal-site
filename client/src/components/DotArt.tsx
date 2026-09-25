/**
 * DotArt — the dotted drawing beside the home page copy.
 *
 * Each drawing is a set of SVG circles with its own gentle motion. Moving a
 * pointer over it pushes nearby dots away; they ease back when it leaves.
 * The push is applied straight to the circles' transforms, so pointer moves
 * never re-render React. While the pointer is over a drawing its motion
 * pauses, so the dots under it stay put.
 */

import { useRef, useState } from "react";
import {
  buildBall,
  buildBuilding,
  buildChute,
  buildHand,
  buildPlant,
  buildRecord,
  buildRunner,
  buildTrack,
  buildWave,
  repel,
  type Dot,
} from "@/lib/dot-art";

export type Drawing =
  | "record"
  | "recordFast"
  | "wave"
  | "building"
  | "chute"
  | "ball"
  | "track"
  | "plant"
  | "hand";

const RUNNER_PERIOD = 2.8;
const record = buildRecord();

const DRAWINGS: Record<Drawing, { dots: Dot[]; motion: string }> = {
  record: { dots: record, motion: "da-spin" },
  recordFast: { dots: record, motion: "da-spin da-spin--fast" },
  wave: { dots: [], motion: "" },
  building: { dots: buildBuilding(), motion: "da-fade" },
  chute: { dots: buildChute(), motion: "da-bob" },
  ball: { dots: buildBall(), motion: "da-bounce" },
  track: { dots: buildTrack(), motion: "" },
  plant: { dots: buildPlant(), motion: "da-sway" },
  hand: { dots: buildHand(), motion: "da-wave" },
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
        <g key={drawing} ref={groupRef} className={motion}>
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
