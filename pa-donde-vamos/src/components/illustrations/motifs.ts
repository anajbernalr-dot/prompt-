// Reusable hand-drawn motifs, drawn in local coordinates (use pen.push to place them).
import { guide, type Pen, type Pt } from './pen';

const add = (a: Pt, b: Pt, k = 1): Pt => [a[0] + b[0] * k, a[1] + b[1] * k];
const rot = (v: Pt, deg: number): Pt => {
  const a = (deg * Math.PI) / 180;
  return [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
};

/** Palm trunk along a guide from base to crown, with ring ticks. */
export function trunk(p: Pen, pts: Pt[], w0: number, w1: number, rings: number) {
  const g = guide(pts);
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i <= 8; i++) {
    const s = i / 8;
    const f = g.at(s);
    const hw = (w0 + (w1 - w0) * s) / 2;
    left.push(add(f.p, f.n, hw));
    right.push(add(f.p, f.n, -hw));
  }
  p.curve(left, { jitter: 0.5 }).curve(right, { jitter: 0.5 });
  for (let i = 1; i <= rings; i++) {
    const s = (i - 0.3 + p.r() * 0.15) / (rings + 0.2);
    const f = g.at(s);
    const hw = ((w0 + (w1 - w0) * s) / 2) * 0.95;
    const a = add(f.p, f.n, hw);
    const b = add(f.p, f.n, -hw * (0.55 + 0.45 * Math.abs(p.r())));
    const mid: Pt = [(a[0] + b[0]) / 2 - f.t[0] * hw * 0.22, (a[1] + b[1]) / 2 - f.t[1] * hw * 0.22];
    p.curve([a, mid, b], { jitter: 0.2 });
  }
}

/** Feathery palm frond: a rib with long leaflets sweeping to the tip. */
export function featherFrond(p: Pen, pts: Pt[], leaf: number, count: number, opts: { angle?: number; droop?: number; one?: -1 | 1 } = {}) {
  const angle = opts.angle ?? 38;
  const droop = opts.droop ?? 0.35;
  const g = guide(pts);
  p.curve(pts, { jitter: 0.3 });
  for (let i = 0; i < count; i++) {
    const s = 0.14 + (0.84 * (i + 0.5)) / count;
    const f = g.at(s);
    const len = leaf * Math.pow(Math.sin(Math.PI * (0.18 + 0.8 * s)), 0.7) * (1 + p.r() * 0.12);
    for (const side of [1, -1] as const) {
      if (opts.one && opts.one !== side) continue;
      const dir = rot(f.t, side * (angle + p.r() * 6));
      const start = add(f.p, f.t, -0.4);
      const mid = add(add(start, dir, len * 0.55), [0, 1], len * droop * 0.25);
      const end = add(add(start, dir, len), [0, 1], len * droop);
      p.curve([start, mid, end], { jitter: 0.25 });
    }
  }
}

/** Chunky palm frond: barbed outline sweeping to the tip, a mid-rib and a few vein strokes. */
export function serratedFrond(p: Pen, pts: Pt[], width: number, teeth: number, opts: { veins?: boolean } = {}) {
  const g = guide(pts);
  const prof = (s: number) => Math.pow(Math.sin(Math.PI * Math.min(0.98, 0.06 + s * 0.94)), 0.7) * (1 - 0.3 * s);
  const edge = (side: 1 | -1) => {
    const out: Pt[] = [];
    for (let i = 0; i < teeth; i++) {
      const s0 = 0.08 + (0.9 * i) / teeth;
      const s1 = 0.08 + (0.9 * (i + 0.78)) / teeth;
      const a = g.at(s0);
      const b = g.at(s1);
      out.push(add(a.p, a.n, side * width * prof(s0) * 0.5 * (1 + p.r() * 0.1)));
      out.push(add(b.p, b.n, side * width * prof(s1) * (1 + p.r() * 0.12)));
    }
    return out;
  };
  const base = g.at(0).p;
  const tip = g.at(1).p;
  p.poly([base, ...edge(1), tip], 0.2);
  p.poly([base, ...edge(-1), tip], 0.2);
  p.curve([base, g.at(0.3).p, g.at(0.55).p, g.at(0.8).p], { jitter: 0.15 });
  if (opts.veins) {
    for (let i = 1; i < teeth - 1; i += 2) {
      const s = 0.08 + (0.9 * (i + 0.3)) / teeth;
      const f = g.at(s);
      const side = i % 4 === 1 ? 1 : -1;
      const e = g.at(s + 0.6 / teeth);
      p.line(f.p[0], f.p[1], e.p[0] + e.n[0] * side * width * prof(s) * 0.6, e.p[1] + e.n[1] * side * width * prof(s) * 0.6);
    }
  }
}

/** Wine glass hanging from its rim centre (0,0); bowl depth h, stem length stem. */
export function wineGlass(
  p: Pen,
  r: number,
  h: number,
  stem: number,
  opts: { liquid?: number; bubbles?: number; stemFrom?: number; stemTo?: number; foot?: boolean } = {},
) {
  const ry = r * 0.3;
  // rim
  p.oval(0, 0, r, ry, { from: 175, to: 175 + 372, wobble: 0.03 });
  // bowl
  p.curve(
    [
      [-r, 0.5],
      [-r * 0.99, h * 0.38],
      [-r * 0.82, h * 0.74],
      [-r * 0.42, h * 0.96],
      [0, h],
      [r * 0.42, h * 0.96],
      [r * 0.82, h * 0.74],
      [r * 0.99, h * 0.38],
      [r, 0.5],
    ],
    { jitter: 0.3 },
  );
  if (opts.liquid) {
    const y = h * opts.liquid;
    const k = opts.liquid;
    const hw = r * (k < 0.38 ? 0.99 : 0.99 - (k - 0.38) * 0.5);
    p.oval(0, y, hw * 0.97, ry * 0.8, { from: 0, to: 180, wobble: 0.02 });
    p.oval(0, y, hw * 0.97, ry * 0.8, { from: 196, to: 344, wobble: 0.02 });
  }
  for (let i = 0; i < (opts.bubbles ?? 0); i++) {
    const bx = (p.r() * 0.55) * r;
    const by = h * (0.62 + 0.22 * Math.abs(p.r()));
    if (i % 2) p.dot(bx, by, 0.9);
    else p.line(bx, by, bx + 1.2, by - 1.6);
  }
  const s0 = h + (opts.stemFrom ?? 0);
  const s1 = h + (opts.stemTo ?? stem);
  p.line(-1.3, s0, -1.1, s1).line(1.3, s0, 1.2, s1);
  if (opts.foot !== false) {
    const fy = h + stem;
    p.oval(0, fy, r * 0.62, r * 0.14, { from: 180, to: 180 + 368, wobble: 0.03 });
  }
}

/** Soda bottle standing on (0,0), height h, max width w. `mark` draws a label doodle. */
export function sodaBottle(p: Pen, h: number, w: number, mark: 'v' | 'heart' | 'none' = 'none') {
  const hw = w / 2;
  const side = (s: 1 | -1): Pt[] => [
    [s * hw * 0.34, -h],
    [s * hw * 0.36, -h * 0.86],
    [s * hw * 0.46, -h * 0.7],
    [s * hw * 0.92, -h * 0.52],
    [s * hw * 0.8, -h * 0.34],
    [s * hw * 0.98, -h * 0.16],
    [s * hw * 0.9, -h * 0.02],
  ];
  p.curve(side(-1), { jitter: 0.3 }).curve(side(1), { jitter: 0.3 });
  p.oval(0, -h, hw * 0.36, hw * 0.12, { from: 180, to: 540, wobble: 0.02 });
  p.line(-hw * 0.4, -h * 0.9, hw * 0.4, -h * 0.9);
  p.oval(0, -h * 0.02, hw * 0.9, hw * 0.22, { from: 0, to: 180, wobble: 0.02 });
  // label band
  p.oval(0, -h * 0.45, hw * 0.86, hw * 0.2, { from: 8, to: 172, wobble: 0.02 });
  p.oval(0, -h * 0.24, hw * 0.84, hw * 0.2, { from: 8, to: 172, wobble: 0.02 });
  if (mark === 'v') {
    p.poly([
      [-hw * 0.3, -h * 0.4],
      [0, -h * 0.29],
      [hw * 0.3, -h * 0.4],
    ]);
  } else if (mark === 'heart') {
    p.oval(0, -h * 0.35, hw * 0.28, hw * 0.34, { wobble: 0.05 });
    p.dot(0, -h * 0.35, 1);
  }
}

/** Hand-drawn sun: a wobbly loop plus rays of mixed length. */
export function sun(p: Pen, r: number, rayIn: number, rayOut: number, angles: number[]) {
  p.oval(0, 0, r, r * 0.96, { from: -120, to: 262, wobble: 0.04 });
  for (const a of angles) {
    const out = rayOut * (0.8 + 0.3 * Math.abs(p.r()));
    p.rays(0, 0, rayIn, out, [a + p.r() * 4]);
  }
}

/** Asterisk made of `arms` crossing strokes. */
export function asterisk(p: Pen, r: number, arms = 4, tilt = 0) {
  for (let i = 0; i < arms; i++) {
    const a = ((tilt + (180 / arms) * i + p.r() * 6) * Math.PI) / 180;
    const r1 = r * (0.9 + p.r() * 0.1);
    const r2 = r * (0.9 + p.r() * 0.1);
    p.line(-Math.cos(a) * r1, -Math.sin(a) * r1, Math.cos(a) * r2, Math.sin(a) * r2);
  }
}

/** Little four-point sparkle "+" with a hint of diagonal. */
export function sparkle(p: Pen, r: number) {
  p.line(0, -r, 0, r).line(-r * 0.8, 0, r * 0.8, 0);
}

/** Confetti bean (hollow oval). */
export function bean(p: Pen, x: number, y: number, len: number, angle: number) {
  p.oval(x, y, len / 2, len * 0.28, { rot: angle, wobble: 0.05, spiral: 0.02 });
}
