/**
 * Dot drawings for the home page. Every drawing lives in a 400×400 box and is
 * a list of dots; sizes and opacity do the shading. Pure functions, so the
 * same dots render on the server and in the browser.
 */

export interface Dot {
  x: number;
  y: number;
  r: number;
  o: number;
}

export interface TimedDot extends Dot {
  /** Negative animation delay in seconds, so each dot starts mid-cycle. */
  delay: number;
}

export interface WaveColumn {
  delay: number;
  dots: Dot[];
}

const round = (n: number) => Math.round(n * 100) / 100;

export function buildRecord(): Dot[] {
  const out: Dot[] = [];
  for (let y = 6; y < 400; y += 11) {
    for (let x = 6; x < 400; x += 11) {
      const dx = x - 200;
      const dy = y - 200;
      const d = Math.hypot(dx, dy);
      if (d > 184 || d < 15) continue;
      if (d < 58) {
        out.push({ x, y, r: 2.5, o: 0.5 });
        continue;
      }
      // Grooves, plus a sheen on one side so the spin reads.
      const sheen = Math.max(0, Math.cos(Math.atan2(dy, dx) + 0.9));
      const r = 1 + 1.6 * (0.5 + 0.5 * Math.sin(d / 4.2)) + 1.5 * sheen ** 6;
      out.push({ x, y, r: round(r), o: 1 });
    }
  }
  return out;
}

/** A voice on the radio: columns of dots, each pulsing on its own beat. */
export function buildWave(): WaveColumn[] {
  const cols: WaveColumn[] = [];
  for (let i = 0; i < 17; i++) {
    const x = 40 + i * 20;
    const amp = 0.25 + 0.75 * Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.33));
    const n = Math.max(1, Math.round(amp * 8));
    const dots: Dot[] = [{ x, y: 200, r: 4.4, o: 1 }];
    for (let k = 1; k < n; k++) {
      const r = round(4.4 - (2.2 * k) / n);
      const o = round(1 - (0.45 * k) / n);
      dots.push({ x, y: 200 - k * 13, r, o }, { x, y: 200 + k * 13, r, o });
    }
    cols.push({ delay: -round((i * 0.13) % 0.9), dots });
  }
  return cols;
}

/** The Flatiron's prow: two facades meeting at a narrow front edge. */
export function buildBuilding(): Dot[] {
  const faces = [
    { x0: 110, x1: 200, top0: 112, top1: 80, bot0: 330, bot1: 342 },
    { x0: 200, x1: 290, top0: 80, top1: 112, bot0: 342, bot1: 330 },
  ];
  const out: Dot[] = [];
  for (const f of faces) {
    for (let x = f.x0; x <= f.x1; x += 15) {
      const t = (x - f.x0) / (f.x1 - f.x0);
      const top = f.top0 + (f.top1 - f.top0) * t;
      const bot = f.bot0 + (f.bot1 - f.bot0) * t;
      const outline = x === f.x0 || x === f.x1;
      for (let y = top; y <= bot + 0.5; y += 14) {
        const edge = outline || y - top < 1 || bot - y < 14;
        out.push({
          x,
          y: round(y),
          r: x === 200 ? 3.6 : edge ? 2.8 : 1.7,
          o: edge ? 1 : 0.55,
        });
      }
    }
  }
  for (let x = 80; x <= 320; x += 12) out.push({ x, y: 356, r: 2, o: 0.55 });
  return out;
}

export function buildChute(): Dot[] {
  const out: Dot[] = [];
  const cx = 200;
  const cy = 190;
  [96, 108, 120].forEach((rad, i) => {
    const steps = Math.round((Math.PI * rad) / 12);
    for (let k = 0; k <= steps; k++) {
      const a = Math.PI + (Math.PI * k) / steps;
      out.push({
        x: round(cx + rad * Math.cos(a)),
        y: round(cy + rad * Math.sin(a)),
        r: i === 1 ? 3.4 : 2.4,
        o: i === 1 ? 1 : 0.7,
      });
    }
  });
  const jumper = { x: 200, y: 312 };
  [Math.PI, (Math.PI * 4) / 3, (Math.PI * 5) / 3, Math.PI * 2].forEach(a => {
    const sx = cx + 108 * Math.cos(a);
    const sy = cy + 108 * Math.sin(a);
    const len = Math.hypot(jumper.x - sx, jumper.y - sy);
    for (let t = 12; t < len - 14; t += 12) {
      out.push({
        x: round(sx + ((jumper.x - sx) * t) / len),
        y: round(sy + ((jumper.y - sy) * t) / len),
        r: 1.4,
        o: 0.7,
      });
    }
  });
  const body: [number, number, number][] = [
    [200, 306, 5.5],
    [200, 322, 4.5],
    [200, 336, 4],
    [188, 320, 3],
    [212, 320, 3],
    [193, 350, 3],
    [207, 350, 3],
  ];
  for (const [x, y, r] of body) out.push({ x, y, r, o: 1 });
  return out;
}

/** A tennis ball: two seams curving in from either side. */
export function buildBall(): Dot[] {
  const out: Dot[] = [];
  for (let y = 80; y <= 320; y += 11) {
    for (let x = 80; x <= 320; x += 11) {
      if (Math.hypot(x - 200, y - 200) > 118) continue;
      const seam = Math.min(
        Math.abs(Math.hypot(x - 50, y - 200) - 128),
        Math.abs(Math.hypot(x - 350, y - 200) - 128)
      );
      out.push({
        x,
        y,
        r: seam < 6.5 ? 3.6 : 2.1,
        o: seam < 6.5 ? 1 : 0.55,
      });
    }
  }
  return out;
}

/** Points roughly every 11px around a running track lane. */
function lane(rad: number): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  const x0 = 130;
  const x1 = 270;
  const cy = 200;
  for (let x = x0; x < x1; x += 11) pts.push({ x, y: cy - rad });
  const bend = (cx: number, from: number) => {
    const steps = Math.round((Math.PI * rad) / 11);
    for (let k = 0; k < steps; k++) {
      const a = from + (Math.PI * k) / steps;
      pts.push({
        x: round(cx + rad * Math.cos(a)),
        y: round(cy + rad * Math.sin(a)),
      });
    }
  };
  bend(x1, -Math.PI / 2);
  for (let x = x1; x > x0; x -= 11) pts.push({ x, y: cy + rad });
  bend(x0, Math.PI / 2);
  return pts;
}

export function buildTrack(): Dot[] {
  return [62, 98].flatMap(rad =>
    lane(rad).map(p => ({ ...p, r: 1.8, o: 0.5 }))
  );
}

/** The middle lane lights up in sequence, like someone lapping it. */
export function buildRunner(period: number): TimedDot[] {
  const pts = lane(80);
  return pts.map((p, i) => ({
    ...p,
    r: 3.4,
    o: 1,
    delay: -round(((pts.length - i) / pts.length) * period),
  }));
}

/** A potted plant: a dotted pot, a stem and five leaves. */
export function buildPlant(): Dot[] {
  const out: Dot[] = [];
  for (let y = 280; y <= 352; y += 11) {
    const half = 72 - 18 * ((y - 280) / 72);
    for (let x = 200 - half; x <= 200 + half + 0.5; x += 11) {
      out.push({
        x: round(x),
        y,
        r: y === 280 ? 3.4 : 2.6,
        o: y === 280 ? 1 : 0.8,
      });
    }
  }
  for (let y = 268; y >= 128; y -= 11) out.push({ x: 200, y, r: 2.4, o: 0.9 });
  const leaves: [number, number, number][] = [
    [164, 232, -0.5],
    [238, 204, 0.5],
    [168, 176, -0.45],
    [232, 150, 0.45],
    [200, 112, 0],
  ];
  leaves.forEach(([cx, cy, a], i) => {
    const rx = i === 4 ? 18 : 40;
    const ry = i === 4 ? 26 : 15;
    for (let y = cy - 44; y <= cy + 44; y += 9) {
      for (let x = cx - 44; x <= cx + 44; x += 9) {
        const u = ((x - cx) * Math.cos(a) + (y - cy) * Math.sin(a)) / rx;
        const v = (-(x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)) / ry;
        const e = u * u + v * v;
        if (e <= 1)
          out.push({ x, y, r: e > 0.6 ? 2.6 : 1.9, o: e > 0.6 ? 1 : 0.65 });
      }
    }
  });
  return out;
}

/** A raised hand: palm, four fingers and a thumb. */
export function buildHand(): Dot[] {
  const fingers: [number, number][] = [
    [160, 112],
    [186, 96],
    [212, 100],
    [238, 120],
  ];
  const seg = (
    x: number,
    y: number,
    ax: number,
    ay: number,
    bx: number,
    by: number
  ) => {
    const t = Math.max(
      0,
      Math.min(
        1,
        ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) /
          ((bx - ax) ** 2 + (by - ay) ** 2)
      )
    );
    return Math.hypot(x - (ax + t * (bx - ax)), y - (ay + t * (by - ay)));
  };
  const inside = (x: number, y: number) =>
    (x >= 148 && x <= 252 && y >= 196 && y <= 300) ||
    (y > 300 && Math.hypot(x - 200, y - 300) <= 52) ||
    fingers.some(([fx, top]) => seg(x, y, fx, top, fx, 205) <= 11) ||
    seg(x, y, 250, 268, 294, 214) <= 12;
  const out: Dot[] = [];
  for (let y = 80; y <= 356; y += 10) {
    for (let x = 120; x <= 310; x += 10) {
      if (!inside(x, y)) continue;
      const edge =
        !inside(x + 10, y) ||
        !inside(x - 10, y) ||
        !inside(x, y + 10) ||
        !inside(x, y - 10);
      out.push({ x, y, r: edge ? 3 : 1.8, o: edge ? 1 : 0.6 });
    }
  }
  return out;
}

const GLYPHS: Record<string, string[]> = {
  "0": [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
  "4": ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
};

/** A dot-matrix sign: `text` lit up on a faint grid, like a departures board. */
export function buildSign(text: string): Dot[] {
  const pitch = 16;
  const cols = text.length * 6 - 1;
  const x0 = 200 - ((cols - 1) * pitch) / 2;
  const y0 = 200 - 3 * pitch;
  const lit = new Set<string>();
  [...text].forEach((ch, i) => {
    GLYPHS[ch]?.forEach((row, r) =>
      [...row].forEach((cell, c) => {
        if (cell === "#") lit.add(`${i * 6 + c},${r}`);
      })
    );
  });
  const out: Dot[] = [];
  for (let r = -4; r <= 10; r++) {
    for (let c = -2; c <= cols + 1; c++) {
      const x = round(x0 + c * pitch);
      const y = y0 + r * pitch;
      if (x < 8 || x > 392 || y < 8 || y > 392) continue;
      out.push(
        lit.has(`${c},${r}`) ? { x, y, r: 6, o: 1 } : { x, y, r: 1.7, o: 0.25 }
      );
    }
  }
  return out;
}

/** How far a dot is pushed away from a pointer at (px, py), in viewBox units. */
export function repel(
  x: number,
  y: number,
  px: number,
  py: number,
  reach = 80,
  strength = 30
) {
  const dx = x - px;
  const dy = y - py;
  const dist = Math.hypot(dx, dy) || 1;
  if (dist >= reach) return null;
  const f = (1 - dist / reach) ** 2 * strength;
  return { tx: round((dx / dist) * f), ty: round((dy / dist) * f) };
}
