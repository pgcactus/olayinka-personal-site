/**
 * The home page's background: one continuous line that draws an open
 * notebook, then redraws itself as whatever the highlighted phrase is about.
 *
 * Each subject is a few strokes of line art in 3D. The strokes are joined end
 * to end (joins drawn faintly) and resampled to the same number of points, so
 * any drawing can morph point by point into any other.
 */

type V = number[];
interface Stroke {
  pts: V[];
  col: V;
}
interface Subject {
  /** How much of the frame the drawing fills, relative to the others. */
  size?: number;
  tilt?: V;
  strokes: Stroke[];
}
interface Point {
  p: V;
  col: V;
  join: boolean;
}

export type SubjectKey =
  | "idle"
  | "flatiron"
  | "things"
  | "records"
  | "plants"
  | "plane"
  | "tennis"
  | "run"
  | "lost";

const TAU = Math.PI * 2;

const INK = {
  cream: [0.96, 0.94, 0.88],
  skin: [0.95, 0.78, 0.64],
  shirt: [0.98, 0.93, 0.84],
  stone: [0.95, 0.9, 0.8],
  yellow: [1, 0.86, 0.5],
  red: [1, 0.62, 0.6],
  green: [0.7, 0.92, 0.72],
  terracotta: [1, 0.74, 0.6],
  ball: [0.93, 0.97, 0.6],
  track: [1, 0.72, 0.62],
};

// ---- stroke helpers; every stroke is a list of [x, y, z] points
const add = (a: V, b: V) => a.map((x, i) => x + b[i]);
const scl = (a: V, k: number) => a.map(x => x * k);
const ellipse = (c: V, u: V, v: V, a0 = 0, a1 = TAU, n = 48): V[] =>
  [...Array(n + 1)].map((_, i) => {
    const t = a0 + ((a1 - a0) * i) / n;
    return add(c, add(scl(u, Math.cos(t)), scl(v, Math.sin(t))));
  });
const line = (a: V, b: V, n = 8): V[] =>
  [...Array(n + 1)].map((_, i) => add(a, scl(add(b, scl(a, -1)), i / n)));
const poly = (pts: V[], closed = false, n = 8): V[] => {
  const out: V[] = [];
  const ring = closed ? [...pts, pts[0]] : pts;
  for (let i = 0; i < ring.length - 1; i++)
    out.push(...line(ring[i], ring[i + 1], n).slice(i ? 1 : 0));
  return out;
};
const X = [1, 0, 0];
const Y = [0, 1, 0];
const Z = [0, 0, 1];
const circleXY = (c: V, r: number, a0: number, a1: number, n: number) =>
  ellipse(c, scl(X, r), scl(Y, r), a0, a1, n);
const circleXZ = (c: V, r: number, a0: number, a1: number, n: number) =>
  ellipse(c, scl(X, r), scl(Z, r), a0, a1, n);
const stadium = (c: V, a: number, r: number, n = 18): V[] => {
  const pts: V[] = [];
  for (let i = 0; i <= n; i++) {
    const t = -Math.PI / 2 + (i / n) * Math.PI;
    pts.push([c[0] + a + r * Math.cos(t), c[1], c[2] + r * Math.sin(t)]);
  }
  for (let i = 0; i <= n; i++) {
    const t = Math.PI / 2 + (i / n) * Math.PI;
    pts.push([c[0] - a + r * Math.cos(t), c[1], c[2] + r * Math.sin(t)]);
  }
  pts.push(pts[0]);
  return pts;
};
const S = (pts: V[], col: V): Stroke => ({ pts, col });

// ---- the drawings, sized against each other
const SUBJECTS = {
  // An open notebook with a pen resting on it.
  idle: {
    size: 1,
    tilt: [0.75, 0, 0],
    strokes: (() => {
      const page = (d: number): V[] => [
        [0, 0, 1.3],
        [d * 1.0, 0.22, 1.3],
        [d * 2.1, 0.12, 1.3],
        [d * 2.1, 0.12, -1.3],
        [d * 1.0, 0.22, -1.3],
        [0, 0, -1.3],
      ];
      const lines: Stroke[] = [];
      for (let k = 0; k < 5; k++) {
        const z = -0.8 + k * 0.38;
        lines.push(
          S(line([0.45, 0.2, z], [k === 4 ? 1.2 : 1.8, 0.16, z], 8), INK.stone)
        );
      }
      const sketch: V[] = [];
      for (let i = 0; i <= 24; i++) {
        const t = i / 24;
        sketch.push([
          -1.75 + t * 1.3,
          0.2,
          0.2 - Math.sin(t * Math.PI * 2) * 0.35,
        ]);
      }
      return [
        S(poly(page(-1), false, 8), INK.cream),
        S(sketch, INK.yellow),
        S(line([0, 0, -1.3], [0, 0, 1.3], 12), INK.cream),
        S(poly(page(1), false, 8), INK.cream),
        ...lines,
        S(
          poly(
            [
              [0.9, 0.55, 1.5],
              [2.4, 0.9, -0.2],
              [2.5, 0.95, -0.35],
            ],
            false,
            10
          ),
          INK.yellow
        ),
        S(
          poly(
            [
              [0.9, 0.55, 1.5],
              [0.75, 0.5, 1.72],
            ],
            false,
            3
          ),
          INK.cream
        ),
      ];
    })(),
  },
  // The Flatiron: a wedge with floor lines across its two front faces.
  flatiron: {
    size: 0.95,
    tilt: [0, 0.55, 0],
    strokes: (() => {
      const P = [
        [0, 1.05],
        [-0.95, -0.65],
        [0.95, -0.65],
      ];
      const bot = -1.7;
      const top = 2.9;
      const at = (i: number, y: number): V => [P[i][0], y, P[i][1]];
      const s = [
        S(poly([at(1, bot), at(0, bot), at(2, bot)], false, 10), INK.stone),
      ];
      s.push(S(line(at(2, bot), at(2, top), 30), INK.stone));
      s.push(
        S(
          poly([at(2, top), at(0, top), at(1, top), at(2, top)], false, 10),
          INK.stone
        )
      );
      s.push(S(line(at(0, top), at(0, bot), 30), INK.stone));
      for (let k = 0; k < 7; k++) {
        const y = bot + 0.5 + k * 0.6;
        const floor =
          k % 2 === 0
            ? [at(1, y), at(0, y), at(2, y)]
            : [at(2, y), at(0, y), at(1, y)];
        s.push(S(poly(floor, false, 10), INK.stone));
      }
      s.push(S(line(at(1, top), at(1, bot), 30), INK.stone));
      return s;
    })(),
  },
  // A walkie-talkie: body, antenna, screen with a signal, speaker slots.
  things: {
    size: 0.78,
    tilt: [0, -0.3, 0],
    strokes: [
      S(
        poly(
          [
            [-1.1, -1.2, 0.4],
            [1.1, -1.2, 0.4],
            [1.1, 2.7, 0.4],
            [-1.1, 2.7, 0.4],
          ],
          true,
          14
        ),
        INK.yellow
      ),
      S(
        poly(
          [
            [-1.1, 2.7, 0.4],
            [-1.1, 2.7, -0.4],
            [1.1, 2.7, -0.4],
            [1.1, -1.2, -0.4],
            [1.1, -1.2, 0.4],
          ],
          false,
          10
        ),
        INK.yellow
      ),
      S(line([-0.6, 2.7, 0], [-0.6, 4.2, 0], 14), INK.cream),
      S(
        circleXY([-0.6, 4.4, 0], 0.2, -Math.PI / 2, (3 * Math.PI) / 2, 16),
        INK.red
      ),
      S(
        poly(
          [
            [-0.75, 1.3, 0.42],
            [0.75, 1.3, 0.42],
            [0.75, 2.2, 0.42],
            [-0.75, 2.2, 0.42],
          ],
          true,
          10
        ),
        INK.cream
      ),
      S(
        poly(
          [
            [-0.55, 1.75, 0.42],
            [-0.3, 1.95, 0.42],
            [-0.05, 1.55, 0.42],
            [0.2, 1.95, 0.42],
            [0.45, 1.6, 0.42],
          ],
          false,
          5
        ),
        INK.green
      ),
      ...[0.6, 0.3, 0, -0.3, -0.6].map(y =>
        S(line([-0.7, y, 0.42], [0.7, y, 0.42], 10), INK.yellow)
      ),
      S(
        poly(
          [
            [1.1, 1.2, 0.2],
            [1.25, 1.2, 0.2],
            [1.25, 0.3, 0.2],
            [1.1, 0.3, 0.2],
          ],
          false,
          4
        ),
        INK.cream
      ),
    ],
  },
  // Two sleeves, a record and a front sleeve.
  records: {
    size: 1,
    strokes: [
      S(
        poly(
          [
            [-2.9, 0, -0.5],
            [-0.5, 0, 0.2],
            [-0.5, 2.4, 0.2],
            [-2.9, 2.4, -0.5],
          ],
          true,
          12
        ),
        INK.red
      ),
      S(
        poly(
          [
            [0.5, 0, 0.2],
            [2.9, 0, -0.5],
            [2.9, 2.4, -0.5],
            [0.5, 2.4, 0.2],
          ],
          true,
          12
        ),
        INK.yellow
      ),
      S(
        circleXY([0.4, 2.3, 0.35], 1.2, Math.PI * 0.9, Math.PI * 2.9, 64),
        INK.cream
      ),
      S(circleXY([0.4, 2.3, 0.36], 0.9, 0, TAU, 44), INK.cream),
      S(circleXY([0.4, 2.3, 0.37], 0.38, 0, TAU, 24), INK.red),
      S(
        poly(
          [
            [-1.3, -0.2, 0.45],
            [1.3, -0.2, 0.45],
            [1.3, 2.4, 0.45],
            [-1.3, 2.4, 0.45],
          ],
          true,
          14
        ),
        INK.cream
      ),
      S(line([-1.1, 0.2, 0.46], [0.1, 0.2, 0.46], 8), INK.cream),
    ],
  },
  // A pot with a stem and five leaves.
  plants: {
    size: 0.85,
    strokes: [
      S(circleXZ([0, -1.9, 0], 0.85, 0, TAU, 36), INK.terracotta),
      S(line([0.85, -1.9, 0], [1.2, -0.1, 0], 12), INK.terracotta),
      S(circleXZ([0, -0.1, 0], 1.2, 0, TAU, 48), INK.terracotta),
      S(circleXZ([0, 0.15, 0], 1.28, 0, TAU, 48), INK.terracotta),
      S(line([-1.2, -0.1, 0], [-0.85, -1.9, 0], 12), INK.terracotta),
      S(
        poly(
          [
            [0, 0.1, 0],
            [-0.3, 1.4, 0.2],
            [-0.9, 2.3, 0.3],
          ],
          false,
          8
        ),
        INK.green
      ),
      S(
        ellipse(
          [-1.6, 2.6, 0.3],
          [0.8, 0.35, 0],
          [0, 0.32, 0.1],
          Math.PI,
          Math.PI * 3,
          30
        ),
        INK.green
      ),
      S(line([-0.9, 2.3, 0.3], [-2.3, 2.9, 0.3], 8), INK.green),
      S(
        poly(
          [
            [-0.9, 2.3, 0.3],
            [-0.3, 1.4, 0.2],
            [0.1, 2.4, -0.1],
            [0.3, 3.4, 0],
          ],
          false,
          8
        ),
        INK.green
      ),
      S(
        ellipse(
          [0.3, 3.95, 0],
          [0.3, 0, 0],
          [0, 0.6, 0.05],
          -Math.PI / 2,
          Math.PI * 1.5,
          30
        ),
        INK.green
      ),
      S(line([0.3, 3.4, 0], [0.3, 4.5, 0], 8), INK.green),
      S(
        poly(
          [
            [0.3, 3.4, 0],
            [0.2, 2.2, -0.1],
            [0.9, 2.9, -0.2],
          ],
          false,
          8
        ),
        INK.green
      ),
      S(
        ellipse(
          [1.6, 3.15, -0.2],
          [0.8, 0.3, 0],
          [0, 0.32, -0.1],
          Math.PI,
          Math.PI * 3,
          30
        ),
        INK.green
      ),
      S(line([0.9, 2.9, -0.2], [2.35, 3.4, -0.2], 8), INK.green),
      S(
        poly(
          [
            [0.9, 2.9, -0.2],
            [0.2, 1.5, 0],
            [1.0, 1.8, 0.5],
          ],
          false,
          8
        ),
        INK.green
      ),
      S(
        ellipse(
          [1.55, 1.95, 0.6],
          [0.6, 0.2, 0.1],
          [0, 0.25, 0],
          Math.PI,
          Math.PI * 3,
          24
        ),
        INK.green
      ),
    ],
  },
  // A parachute: scalloped canopy, panel seams, cords and a small figure.
  plane: {
    size: 0.95,
    strokes: (() => {
      const s: Stroke[] = [];
      const top = 4.1;
      const rimY = 2.6;
      const R = 2.2;
      const rim: V[] = [];
      for (let i = 0; i <= 96; i++) {
        const a = (i / 96) * TAU;
        rim.push([
          Math.cos(a) * R,
          rimY + Math.abs(Math.sin(a * 5)) * 0.18,
          Math.sin(a) * R,
        ]);
      }
      s.push(S(rim, INK.red));
      for (let g = 0; g < 10; g++) {
        const a = (g / 10) * TAU;
        const p = [...Array(13)].map((_, i) => {
          const t = i / 12;
          return [
            Math.cos(a) * R * Math.sin((t * Math.PI) / 2),
            rimY + (top - rimY) * Math.cos((t * Math.PI) / 2),
            Math.sin(a) * R * Math.sin((t * Math.PI) / 2),
          ];
        });
        s.push(S(g % 2 ? p.reverse() : p, INK.red));
      }
      const hip = [0, 0.4, 0];
      [0, 1, 2, 3].forEach(k => {
        const a = (k / 4) * TAU + 0.4;
        s.push(
          S(
            line([Math.cos(a) * R, rimY, Math.sin(a) * R], [0, 1.15, 0], 12),
            INK.cream
          )
        );
      });
      s.push(
        S(
          circleXY([0, 1.35, 0], 0.22, -Math.PI / 2, (3 * Math.PI) / 2, 16),
          INK.skin
        )
      );
      s.push(
        S(
          poly(
            [[0, 1.13, 0], hip, [-0.3, -0.35, 0.1], hip, [0.3, -0.35, -0.1]],
            false,
            6
          ),
          INK.shirt
        )
      );
      s.push(
        S(
          poly(
            [
              [-0.45, 0.95, 0],
              [0, 0.85, 0],
              [0.45, 0.95, 0],
            ],
            false,
            6
          ),
          INK.shirt
        )
      );
      return s;
    })(),
  },
  // A tennis ball with its seam, spinning and bouncing.
  tennis: {
    size: 0.55,
    strokes: (() => {
      const R = 0.95;
      const c = [0, 1.1, 0];
      const seam = [...Array(97)].map((_, i) => {
        const t = (i / 96) * TAU;
        const v = [
          0.75 * Math.cos(t) + 0.25 * Math.cos(3 * t),
          0.75 * Math.sin(t) - 0.25 * Math.sin(3 * t),
          0.866 * Math.sin(2 * t),
        ];
        let q = scl(v, R / Math.hypot(...v));
        // Tip the seam towards the viewer so it reads as a curve on a sphere.
        q = [
          q[0],
          q[1] * Math.cos(0.6) - q[2] * Math.sin(0.6),
          q[1] * Math.sin(0.6) + q[2] * Math.cos(0.6),
        ];
        q = [
          q[0] * Math.cos(0.4) + q[2] * Math.sin(0.4),
          q[1],
          -q[0] * Math.sin(0.4) + q[2] * Math.cos(0.4),
        ];
        return add(c, q);
      });
      return [
        S(circleXY(c, R, -Math.PI / 2, (3 * Math.PI) / 2, 60), INK.ball),
        S(seam, INK.cream),
      ];
    })(),
  },
  // A running track with four lanes, a start line and a tiny runner.
  run: {
    size: 0.9,
    tilt: [1.0, 0, 0],
    strokes: (() => {
      const lanes = [0.6, 0.78, 0.96, 1.14];
      const s = lanes.map((r, i) =>
        S(
          i % 2
            ? stadium([0, 0, 0], 0.7, r).reverse()
            : stadium([0, 0, 0], 0.7, r),
          INK.track
        )
      );
      s.push(S(line([0.3, 0, 0.6], [0.3, 0, 1.14], 6), INK.cream));
      const f = [-0.4, 0, 0.87];
      const R = (v: V) => add(f, scl(v, 0.26));
      s.push(
        S(
          poly(
            [
              R([-0.18, 0, 0]),
              R([0, 0, -0.62]),
              R([0.08, 0, -1.25]),
              R([0.3, 0, -0.62]),
              R([0.5, 0, -0.07]),
            ],
            false,
            5
          ),
          INK.shirt
        )
      );
      s.push(
        S(
          poly(
            [R([-0.3, 0, -0.85]), R([0.08, 0, -1.05]), R([0.45, 0, -0.8])],
            false,
            5
          ),
          INK.shirt
        )
      );
      s.push(S(circleXZ(R([0.08, 0, -1.55]), 0.07, 0, TAU, 12), INK.skin));
      return s;
    })(),
  },
} as Record<SubjectKey, Subject>;

// The 404 page: the same notebook with its right page torn out, the page
// floating loose above it.
SUBJECTS.lost = {
  size: 1,
  tilt: [0.75, 0, 0],
  strokes: (() => {
    const left: V[] = [
      [0, 0, 1.3],
      [-1.0, 0.22, 1.3],
      [-2.1, 0.12, 1.3],
      [-2.1, 0.12, -1.3],
      [-1.0, 0.22, -1.3],
      [0, 0, -1.3],
    ];
    // A torn edge: zigzag down the right page where it was ripped out.
    const torn: V[] = [
      [0, 0, 1.3],
      [0.6, 0.14, 1.3],
    ];
    for (let k = 0; k <= 12; k++) {
      const z = 1.3 - (k / 12) * 2.6;
      torn.push([0.6 + (k % 2 ? 0.18 : 0), 0.14, z]);
    }
    torn.push([0, 0, -1.3]);
    const loose: V[] = [
      [0.9, 1.4, 1.0],
      [2.4, 1.9, 0.9],
      [2.6, 1.8, -1.2],
      [1.1, 1.3, -1.1],
      [0.9, 1.4, 1.0],
    ];
    return [
      S(poly(left, false, 8), INK.cream),
      S(line([0, 0, -1.3], [0, 0, 1.3], 12), INK.cream),
      S(poly(torn, false, 4), INK.cream),
      S(poly(loose, false, 10), INK.yellow),
      S(line([1.3, 1.55, 0.4], [2.2, 1.85, 0.35], 8), INK.stone),
      S(line([1.35, 1.5, -0.1], [2.0, 1.72, -0.15], 8), INK.stone),
    ];
  })(),
};

// Gentle motions only, so each drawing stays readable while it moves:
// [rotate x, rotate y, rotate z, lift].
const MOTION: Record<SubjectKey, (t: number) => V> = {
  idle: t => [0, Math.sin(t * 0.35) * 0.3, 0, 0],
  flatiron: t => [0, Math.sin(t * 0.3) * 0.35, 0, 0],
  things: t => [0, Math.sin(t * 0.5) * 0.25, Math.sin(t * 0.8) * 0.04, 0],
  records: t => [0, Math.sin(t * 0.35) * 0.2, 0, 0],
  plants: t => [0, Math.sin(t * 0.4) * 0.35, Math.sin(t * 0.9) * 0.03, 0],
  plane: t => [
    0,
    Math.sin(t * 0.3) * 0.3,
    Math.sin(t * 0.9) * 0.06,
    Math.sin(t * 1.2) * 0.15,
  ],
  tennis: t => [0, 0, -t * 1.2, Math.abs(Math.sin(t * 2.4)) * 0.9 - 0.2],
  run: t => [0, Math.sin(t * 0.25) * 0.2, 0, 0],
  lost: t => [
    0,
    Math.sin(t * 0.35) * 0.3,
    Math.sin(t * 0.7) * 0.03,
    Math.sin(t * 0.9) * 0.08,
  ],
};

// Drawings fill this share of the canvas's shorter side; the bounce and bob
// in MOTION are scaled by LIFT; DEPTH sets how strong the perspective is.
const FILL = 0.86;
const LIFT = 0.3;
const DEPTH = 7;

// Where the walkie-talkie's screen is, in its own drawing space.
const THINGS_SCREEN = [0, 1.75, 0.42];

// ---- maths for placing a drawing (row-major 3x3 matrices)
const rotX = (a: number) => [
  1,
  0,
  0,
  0,
  Math.cos(a),
  -Math.sin(a),
  0,
  Math.sin(a),
  Math.cos(a),
];
const rotY = (a: number) => [
  Math.cos(a),
  0,
  Math.sin(a),
  0,
  1,
  0,
  -Math.sin(a),
  0,
  Math.cos(a),
];
const rotZ = (a: number) => [
  Math.cos(a),
  -Math.sin(a),
  0,
  Math.sin(a),
  Math.cos(a),
  0,
  0,
  0,
  1,
];
const mul = (A: V, B: V) => {
  const C = new Array<number>(9);
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      C[i * 3 + j] =
        A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j];
  return C;
};
const apply = (M: V, v: V) => [
  M[0] * v[0] + M[1] * v[1] + M[2] * v[2],
  M[3] * v[0] + M[4] * v[1] + M[5] * v[2],
  M[6] * v[0] + M[7] * v[1] + M[8] * v[2],
];
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;

export interface LineScene {
  show: (key: SubjectKey) => void;
  destroy: () => void;
}

/**
 * Starts drawing on `canvas`, sized to its parent. `onCta` receives where the
 * walkie-talkie's screen is (page pixels within the parent) while it's shown,
 * or null otherwise. `rest` is what the line draws when nothing is shown.
 *
 * To go easy on batteries it draws nothing while off screen or in a hidden
 * tab, runs at half rate once a drawing has settled, and with reduced motion
 * only redraws when something changes.
 */
export function createLineScene(
  canvas: HTMLCanvasElement,
  onCta: (pos: { x: number; y: number } | null) => void = () => undefined,
  rest: SubjectKey = "idle"
): LineScene {
  const ctx = canvas.getContext("2d");
  const stage = canvas.parentElement;
  if (!ctx || !stage)
    return { show: () => undefined, destroy: () => undefined };

  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  const still = () => reduced?.matches ?? false;
  const N = window.innerWidth < 640 ? 1500 : 2200;

  // Join strokes into one line, resample evenly to N points, centre it.
  const paths: Partial<Record<SubjectKey, { pts: Point[]; c: V; sc: number }>> =
    {};
  function path(key: SubjectKey) {
    const hit = paths[key];
    if (hit) return hit;
    const segs: { a: V; b: V; col: V; join: boolean }[] = [];
    let prev: V | null = null;
    for (const s of SUBJECTS[key].strokes) {
      if (prev) segs.push({ a: prev, b: s.pts[0], col: s.col, join: true });
      for (let i = 1; i < s.pts.length; i++)
        segs.push({ a: s.pts[i - 1], b: s.pts[i], col: s.col, join: false });
      prev = s.pts[s.pts.length - 1];
    }
    const len = segs.map(
      g =>
        Math.hypot(g.b[0] - g.a[0], g.b[1] - g.a[1], g.b[2] - g.a[2]) *
        (g.join ? 0.5 : 1)
    );
    const total = len.reduce((x, y) => x + y, 0);
    const out: Point[] = [];
    let si = 0;
    let acc = 0;
    for (let i = 0; i < N; i++) {
      const d = (i / (N - 1)) * total;
      while (si < segs.length - 1 && acc + len[si] < d) {
        acc += len[si];
        si++;
      }
      const g = segs[si];
      const k = len[si] ? Math.min(1, (d - acc) / len[si]) : 0;
      out.push({
        p: add(g.a, scl(add(g.b, scl(g.a, -1)), k)),
        col: g.col,
        join: g.join,
      });
    }
    const lo = [0, 1, 2].map(j => Math.min(...out.map(q => q.p[j])));
    const hi = [0, 1, 2].map(j => Math.max(...out.map(q => q.p[j])));
    const c = lo.map((x, j) => (x + hi[j]) / 2);
    // Scale every drawing to the same frame: its widest or tallest extent,
    // as seen at its resting tilt, becomes its relative size.
    const base = SUBJECTS[key].tilt ?? [0, 0, 0];
    const R0 = mul(rotY(base[1]), mul(rotZ(base[2]), rotX(base[0])));
    let extent = 0;
    for (const q of out) {
      const r = apply(
        R0,
        q.p.map((x, j) => x - c[j])
      );
      extent = Math.max(extent, Math.abs(r[0]), Math.abs(r[1]));
    }
    const sc = (SUBJECTS[key].size ?? 1) / Math.max(extent, 1e-6);
    const result = {
      pts: out.map(q => ({ ...q, p: q.p.map((x, j) => (x - c[j]) * sc) })),
      c,
      sc,
    };
    paths[key] = result;
    return result;
  }

  function frameOf(key: SubjectKey, t: number, tilt: { x: number; y: number }) {
    const m = MOTION[key](still() ? 0 : t);
    const s = SUBJECTS[key];
    const base = s.tilt ?? [0, 0, 0];
    const R = mul(
      rotX(tilt.y * 0.05),
      mul(
        rotY(tilt.x * 0.25 + m[1] + base[1]),
        mul(rotZ(m[2] + base[2]), rotX(m[0] + base[0]))
      )
    );
    return { R, off: [0, m[3] * LIFT, 0] };
  }

  let W = 0;
  let H = 0;
  let dpr = 1;
  function resize() {
    const box = stage!.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = box.width;
    H = box.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
  }
  // Every drawing is centred in the canvas and sized to its shorter side,
  // with a little perspective for depth.
  function project(w: V) {
    const k = (Math.min(W, H) / 2) * FILL;
    const persp = DEPTH / (DEPTH - w[2]);
    return { x: W / 2 + w[0] * k * persp, y: H / 2 - w[1] * k * persp };
  }

  const state = { from: rest, to: rest, morph: 1 };
  const tilt = { x: 0, y: 0 };
  const pointer = { nx: 0, ny: 0 };
  const proj: { x: number; y: number; z: number; col: V; join: boolean }[] =
    new Array(N);
  let drawIn = 0;
  let t = 0;
  let last = performance.now();
  let frame = 0;
  let ctaShown = false;
  let visible = true;
  let dirty = true;
  let skip = false;

  function draw(dt: number) {
    drawIn = Math.min(1, drawIn + dt / 2.2);
    const A = path(state.from).pts;
    const B = path(state.to).pts;
    const k0 = state.morph;
    const fA = frameOf(state.from, t, tilt);
    const fB = frameOf(state.to, t, tilt);
    const n = still() ? N : Math.max(2, Math.floor(N * ease(drawIn)));
    for (let i = 0; i < n; i++) {
      const a = A[i];
      const b = B[i];
      // The line redraws from its start to its end, a little behind the one before.
      const k = ease(Math.min(1, Math.max(0, (k0 - (i / N) * 0.4) / 0.6)));
      const pa = add(apply(fA.R, a.p), fA.off);
      const pb = add(apply(fB.R, b.p), fB.off);
      const w = [0, 1, 2].map(j => lerp(pa[j], pb[j], k));
      const at = project(w);
      proj[i] = {
        x: at.x,
        y: at.y,
        z: w[2],
        col: k < 0.5 ? a.col : b.col,
        join: k < 0.5 ? a.join : b.join,
      };
    }

    if (state.to === "things" && k0 >= 0.95) {
      const P = path("things");
      const lp = THINGS_SCREEN.map((x, j) => (x - P.c[j]) * P.sc);
      onCta(project(add(apply(fB.R, lp), fB.off)));
      ctaShown = true;
    } else if (ctaShown) {
      onCta(null);
      ctaShown = false;
    }

    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, W, H);
    ctx!.lineCap = "round";
    ctx!.lineJoin = "round";
    const width = Math.min(1.15, Math.max(0.85, Math.min(W, H) / 420));
    let i = 1;
    while (i < n) {
      const p = proj[i];
      const depth = Math.max(0, Math.min(1, (p.z + 1) / 2));
      ctx!.beginPath();
      ctx!.moveTo(proj[i - 1].x, proj[i - 1].y);
      let j = i;
      while (
        j < n &&
        j < i + 8 &&
        proj[j].col === p.col &&
        proj[j].join === p.join
      ) {
        ctx!.lineTo(proj[j].x, proj[j].y);
        j++;
      }
      const c = p.col.map(x => Math.round(x * 255));
      const alpha = p.join ? 0.1 : 0.62 + depth * 0.38;
      ctx!.strokeStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha.toFixed(3)})`;
      ctx!.lineWidth = (p.join ? 1 : 1.6 + depth * 1.4) * width;
      ctx!.stroke();
      i = j === i ? i + 1 : j;
    }
  }

  function loop(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    frame = requestAnimationFrame(loop);
    if (document.hidden || !visible) return;
    if (!still()) t += dt;
    tilt.x += (pointer.nx - tilt.x) * Math.min(1, dt * 3);
    tilt.y += (pointer.ny - tilt.y) * Math.min(1, dt * 3);
    if (state.morph < 1) state.morph = Math.min(1, state.morph + dt / 1.4);
    const settled = state.morph >= 1 && (still() || drawIn >= 1);
    if (still() && settled && !dirty) return;
    // Once settled, the gentle motion looks the same at half the frame rate.
    skip = settled && !skip;
    if (skip && !dirty) return;
    dirty = false;
    draw(still() ? 1 : dt * (settled ? 2 : 1));
  }

  const onMove = (e: PointerEvent) => {
    dirty = true;
    const box = stage.getBoundingClientRect();
    pointer.nx = ((e.clientX - box.left) / box.width - 0.5) * 2;
    pointer.ny = ((e.clientY - box.top) / box.height - 0.5) * 2;
  };
  const onLeave = () => {
    pointer.nx = 0;
    pointer.ny = 0;
  };
  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerleave", onLeave);
  const observer = new ResizeObserver(() => {
    resize();
    dirty = true;
  });
  observer.observe(stage);
  resize();
  const seen = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    dirty = true;
  });
  seen.observe(canvas);

  // Prepare the other drawings while the browser is idle.
  const idle =
    window.requestIdleCallback ??
    ((fn: () => void) => window.setTimeout(fn, 100));
  (Object.keys(SUBJECTS) as SubjectKey[]).forEach(k => idle(() => path(k)));

  frame = requestAnimationFrame(loop);

  return {
    show(target) {
      const key = target === "idle" ? rest : target;
      if (key === state.to) return;
      state.from = state.morph < 0.5 ? state.from : state.to;
      state.to = key;
      state.morph = still() ? 1 : 0;
      dirty = true;
    },
    destroy() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      seen.disconnect();
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
    },
  };
}
