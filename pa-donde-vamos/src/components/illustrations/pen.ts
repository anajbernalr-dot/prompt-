// Tiny "hand-drawn ink" toolkit: turns hand-placed points into slightly wobbly cubic paths.
// Artwork is computed once at module load and grouped into one <Path> per stroke width.

export type Pt = [number, number];

export type Layer = { d: string; w: number; fill: boolean };

export type Artwork = { vw: number; vh: number; layers: Layer[] };

type Matrix = [number, number, number, number, number, number];

export type Frame = { p: Pt; t: Pt; n: Pt };

export type Pen = {
  /** Set the stroke width for the following strokes. */
  w(width: number): Pen;
  /** Smooth curve through points (Catmull-Rom → cubic). */
  curve(pts: Pt[], opts?: { closed?: boolean; jitter?: number }): Pen;
  /** Slightly bowed straight-ish stroke. */
  line(ax: number, ay: number, bx: number, by: number, bend?: number): Pen;
  /** Chain of straight-ish strokes with round joins (jagged edges, zigzags). */
  poly(pts: Pt[], jitter?: number): Pen;
  /** Hand-drawn ellipse/arc. Angles in degrees, 0 = +x, clockwise. */
  oval(cx: number, cy: number, rx: number, ry: number, opts?: { from?: number; to?: number; rot?: number; wobble?: number; spiral?: number }): Pen;
  /** Small solid accent. */
  dot(x: number, y: number, r: number): Pen;
  /** Radiating ticks around a centre. */
  rays(cx: number, cy: number, r0: number, r1: number, angles: number[], bend?: number): Pen;
  /** Parallel hatch strokes between two guide lines. */
  hatch(a0: Pt, a1: Pt, b0: Pt, b1: Pt, count: number): Pen;
  /** Push a local transform (translate, rotate°, scale, mirror). */
  push(tx: number, ty: number, rot?: number, sx?: number, sy?: number): Pen;
  pop(): Pen;
  /** Local → artwork coordinates. */
  map(x: number, y: number): Pt;
  /** Deterministic random in [-1, 1]. */
  r(): number;
};

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const num = (n: number) => String(Math.round(n * 10) / 10);
const pt = (p: Pt) => `${num(p[0])} ${num(p[1])}`;

function crPath(pts: Pt[], closed: boolean): string {
  const n = pts.length;
  if (n < 2) return '';
  const get = (i: number): Pt => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${pt(pts[0])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return closed ? d + 'Z' : d;
}

/** Dense polyline along a Catmull-Rom curve. */
function crSample(pts: Pt[], per = 16): Pt[] {
  const n = pts.length;
  const get = (i: number) => pts[Math.max(0, Math.min(n - 1, i))];
  const out: Pt[] = [];
  for (let i = 0; i < n - 1; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    for (let k = 0; k < per; k++) {
      const t = k / per;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[n - 1]);
  return out;
}

/** Arc-length parametrised guide curve (for fronds, trunks…). `at(s)` with s in 0..1. */
export function guide(pts: Pt[]) {
  const dense = crSample(pts);
  const acc = [0];
  for (let i = 1; i < dense.length; i++) {
    acc.push(acc[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
  }
  const len = acc[acc.length - 1];
  const at = (s: number): Frame => {
    const target = Math.max(0, Math.min(1, s)) * len;
    let i = 1;
    while (i < acc.length - 1 && acc[i] < target) i++;
    const a = dense[i - 1];
    const b = dense[i];
    const seg = acc[i] - acc[i - 1] || 1;
    const k = (target - acc[i - 1]) / seg;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    const t: Pt = [dx / l, dy / l];
    return { p: [a[0] + dx * k, a[1] + dy * k], t, n: [-t[1], t[0]] };
  };
  return { at, len };
}

const mul = (m: Matrix, k: Matrix): Matrix => [
  m[0] * k[0] + m[2] * k[1],
  m[1] * k[0] + m[3] * k[1],
  m[0] * k[2] + m[2] * k[3],
  m[1] * k[2] + m[3] * k[3],
  m[0] * k[4] + m[2] * k[5] + m[4],
  m[1] * k[4] + m[3] * k[5] + m[5],
];

/** Draw an artwork. `seed` keeps the wobble deterministic. */
export function sketch(vw: number, vh: number, seed: number, draw: (p: Pen) => void): Artwork {
  const rand = rng(seed);
  const r = () => rand() * 2 - 1;
  const groups = new Map<string, string[]>();
  const stack: Matrix[] = [[1, 0, 0, 1, 0, 0]];
  let width = 2.6;

  const map = (x: number, y: number): Pt => {
    const m = stack[stack.length - 1];
    return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
  };
  const emit = (d: string, fill = false) => {
    const key = `${fill ? 'f' : 's'}${width}`;
    const list = groups.get(key) ?? [];
    list.push(d);
    groups.set(key, list);
  };

  const pen: Pen = {
    w(v) {
      width = v;
      return pen;
    },
    curve(pts, opts = {}) {
      const j = opts.jitter ?? 0.35;
      const moved = pts.map((p, i): Pt =>
        i === 0 || i === pts.length - 1 ? map(p[0], p[1]) : map(p[0] + r() * j, p[1] + r() * j),
      );
      emit(crPath(moved, !!opts.closed));
      return pen;
    },
    line(ax, ay, bx, by, bend = 0) {
      const dx = bx - ax;
      const dy = by - ay;
      const l = Math.hypot(dx, dy) || 1;
      const nx = -dy / l;
      const ny = dx / l;
      const o1 = bend + r() * l * 0.022;
      const o2 = bend * 0.85 + r() * l * 0.022;
      const a = map(ax, ay);
      const c1 = map(ax + dx / 3 + nx * o1, ay + dy / 3 + ny * o1);
      const c2 = map(ax + (2 * dx) / 3 + nx * o2, ay + (2 * dy) / 3 + ny * o2);
      const b = map(bx, by);
      emit(`M${pt(a)}C${pt(c1)} ${pt(c2)} ${pt(b)}`);
      return pen;
    },
    poly(pts, jitter = 0.25) {
      const m = pts.map((p) => map(p[0] + r() * jitter, p[1] + r() * jitter));
      emit('M' + m.map(pt).join('L'));
      return pen;
    },
    oval(cx, cy, rx, ry, opts = {}) {
      const from = opts.from ?? r() * 40 - 100;
      const to = opts.to ?? from + 360 + 22;
      const rot = ((opts.rot ?? 0) * Math.PI) / 180;
      const wob = opts.wobble ?? 0.035;
      const spiral = opts.spiral ?? (opts.to === undefined ? 0.06 : 0);
      const steps = Math.max(4, Math.round(Math.abs(to - from) / 40));
      const pts: Pt[] = [];
      for (let i = 0; i <= steps; i++) {
        const k = i / steps;
        const a = ((from + (to - from) * k) * Math.PI) / 180;
        const f = 1 + (i === 0 || i === steps ? 0 : r() * wob) - spiral * k;
        const x = Math.cos(a) * rx * f;
        const y = Math.sin(a) * ry * f;
        pts.push(map(cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)));
      }
      emit(crPath(pts, false));
      return pen;
    },
    dot(x, y, rad) {
      const pts: Pt[] = [];
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const f = 1 + r() * 0.12;
        pts.push(map(x + Math.cos(a) * rad * f, y + Math.sin(a) * rad * f));
      }
      emit(crPath(pts, true), true);
      return pen;
    },
    rays(cx, cy, r0, r1, angles, bend = 0) {
      for (const deg of angles) {
        const a = (deg * Math.PI) / 180;
        const j0 = r0 * (1 + r() * 0.08);
        const j1 = r1 * (1 + r() * 0.08);
        pen.line(cx + Math.cos(a) * j0, cy + Math.sin(a) * j0, cx + Math.cos(a) * j1, cy + Math.sin(a) * j1, bend);
      }
      return pen;
    },
    hatch(a0, a1, b0, b1, count) {
      for (let i = 0; i < count; i++) {
        const k = (i + 0.5 + r() * 0.15) / count;
        const ax = a0[0] + (a1[0] - a0[0]) * k;
        const ay = a0[1] + (a1[1] - a0[1]) * k;
        const bx = b0[0] + (b1[0] - b0[0]) * k;
        const by = b0[1] + (b1[1] - b0[1]) * k;
        pen.line(ax, ay, bx, by);
      }
      return pen;
    },
    push(tx, ty, rot = 0, sx = 1, sy = sx) {
      const a = (rot * Math.PI) / 180;
      const c = Math.cos(a);
      const s = Math.sin(a);
      const cur = stack[stack.length - 1];
      stack.push(mul(cur, [c * sx, s * sx, -s * sy, c * sy, tx, ty]));
      return pen;
    },
    pop() {
      if (stack.length > 1) stack.pop();
      return pen;
    },
    map,
    r,
  };

  draw(pen);

  const layers: Layer[] = [];
  groups.forEach((ds, key) => {
    layers.push({ d: ds.join(''), w: Number(key.slice(1)), fill: key[0] === 'f' });
  });
  return { vw, vh, layers };
}
