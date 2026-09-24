// The artwork itself. Coordinates are in each viewBox; see motifs.ts for the building blocks.
import {
  asterisk,
  featherFrond,
  serratedFrond,
  sodaBottle,
  sparkle,
  sun,
  trunk,
  wineGlass,
} from './motifs';
import { guide, sketch, type Pen, type Pt } from './pen';

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

/** Fist gripping a vertical stem at x=0; grip spans y=0..23. Arm leaves at `angle`° (down-left by default). */
function fist(p: Pen, arm: { len: number; angle: number }) {
  // curled index finger over the back of the hand
  p.curve([
    [-14, 4],
    [-7, 0.8],
    [1, 0],
    [7.5, 1.8],
    [10.6, 5.6],
    [8.6, 9.4],
    [3, 9.8],
  ]);
  // middle finger
  p.curve([
    [8.8, 10],
    [11.2, 13.4],
    [9, 16.6],
    [3.4, 16.8],
  ]);
  // ring + pinky
  p.curve([
    [8.4, 17],
    [9.8, 20.2],
    [6.6, 22.8],
    [0, 23],
  ]);
  // heel of the palm
  p.curve([
    [0, 23],
    [-7, 24],
    [-13, 22.4],
    [-17, 19.4],
  ]);
  // thumb over the index finger
  p.curve([
    [-12, 7.6],
    [-5, 9.4],
    [2, 8.2],
    [4.4, 5.6],
  ]);
  p.line(-2, 3.2, 1.4, 3.6);
  // forearm
  const a = (arm.angle * Math.PI) / 180;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  p.line(-14, 4, -14 + ux * arm.len, 4 + uy * arm.len, -1.4);
  p.line(-17, 19.4, -17 + ux * arm.len * 0.84, 19.4 + uy * arm.len * 0.84, -1);
  // cuff with a bit of hatching
  const cx = -15.5 + ux * arm.len * 0.4;
  const cy = 11.7 + uy * arm.len * 0.4;
  const nx = -uy;
  const ny = ux;
  p.line(cx + nx * 9, cy + ny * 9, cx - nx * 9.5, cy - ny * 9.5, 0.8);
  for (let i = 0; i < 4; i++) {
    const k = 0.44 + i * 0.06;
    const x = -15.5 + ux * arm.len * k;
    const y = 11.7 + uy * arm.len * k;
    p.line(x + nx * 6, y + ny * 6, x + nx * 1 + ux * 3, y + ny * 1 + uy * 3);
  }
}

/** Glass held in a fist: glass rim at (0,0), hand gripping the middle of the stem. */
function heldGlass(p: Pen, liquid: number, armLen: number) {
  const r = 21;
  const h = 46;
  const grip = 10;
  const s = 1.2;
  const gh = 23 * s;
  const stem = grip + gh + 8;
  wineGlass(p, r, h, stem, { liquid, bubbles: 5, stemFrom: 0, stemTo: grip });
  p.line(-1.2, h + grip + gh, -1.1, h + stem).line(1.2, h + grip + gh, 1.1, h + stem);
  p.push(0, h + grip, 0, s);
  fist(p, { len: armLen, angle: 122 });
  p.pop();
}

/** Serrated Caracas palm, crown at (0,0), trunk base around (-66, 126). */
function caracasPalm(p: Pen, veins = true) {
  trunk(
    p,
    [
      [-66, 126],
      [-56, 92],
      [-40, 58],
      [-20, 26],
      [-4, 6],
    ],
    12,
    8,
    12,
  );
  const f = (pts: Pt[], w: number, teeth: number) => serratedFrond(p, [[0, 0], ...pts], w, teeth, { veins });
  f([[12, -26], [30, -50], [54, -68], [68, -72]], 14, 9);
  f([[24, -12], [50, -18], [72, -12], [86, 4]], 14, 8);
  f([[20, 12], [38, 36], [48, 62], [50, 84]], 13, 8);
  f([[-14, -22], [-32, -36], [-52, -40], [-66, -34]], 13, 7);
  f([[-22, 0], [-46, 8], [-64, 24], [-72, 44]], 13, 7);
  f([[2, -26], [4, -46], [12, -62]], 9, 5);
}

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */

export const welcomeArt = sketch(320, 256, 7, (p) => {
  p.w(2.4);
  // palm behind the table
  trunk(
    p,
    [
      [44, 190],
      [48, 156],
      [58, 120],
      [70, 90],
      [80, 68],
    ],
    8,
    5.5,
    13,
  );
  const C: Pt = [80, 66];
  const fr = (pts: Pt[], leaf: number, count: number, droop = 0.35) =>
    featherFrond(p, [C, ...pts], leaf, count, { droop });
  p.w(2);
  fr([[96, 44], [116, 26], [134, 16]], 13, 9, 0.2);
  fr([[82, 42], [90, 22], [98, 10]], 10, 7, 0.1);
  fr([[62, 48], [44, 36], [26, 32]], 12, 8, 0.25);
  fr([[56, 66], [34, 72], [18, 88]], 12, 8, 0.4);
  fr([[102, 62], [124, 66], [142, 80]], 12, 8, 0.4);
  fr([[66, 84], [54, 102], [46, 122]], 10, 7, 0.3);
  fr([[92, 84], [100, 100], [104, 116]], 9, 6, 0.3);

  p.w(2.4);
  // table top (diamond in perspective) + thickness
  p.line(12, 196, 146, 242, 1.2);
  p.line(146, 242, 240, 194, -1);
  p.line(14, 203, 146, 249, 1.2);
  p.line(146, 249, 236, 203, -0.6);
  p.line(12, 196, 14, 203);
  // back edges, broken where objects stand
  p.line(12, 196, 39, 190.8);
  p.line(50, 188.7, 82, 182.6);
  p.line(104, 178.4, 112, 177);
  p.line(136, 172.4, 156, 168.8);
  p.line(160, 168.2, 190, 177.8);
  p.line(222, 188.3, 240, 194);
  // bottles
  p.push(94, 190);
  sodaBottle(p, 58, 20, 'v');
  p.pop();
  p.push(124, 184);
  sodaBottle(p, 68, 21, 'heart');
  p.pop();
  // small wine glass
  p.push(168, 150);
  wineGlass(p, 9, 22, 16, { liquid: 0.42, bubbles: 2 });
  p.pop();
  // big goblet-bottle at right
  p.curve([
    [203, 92],
    [202, 108],
    [199, 118],
    [190, 132],
    [188, 150],
    [196, 168],
    [205, 175],
  ]);
  p.curve([
    [213, 92],
    [214, 108],
    [218, 118],
    [226, 132],
    [228, 150],
    [220, 168],
    [211, 175],
  ]);
  p.oval(208, 92, 5, 1.8, { from: 180, to: 545 });
  p.line(202.5, 98, 213.5, 98);
  p.oval(208, 140, 18.5, 4, { from: 5, to: 175 });
  p.oval(208, 140, 18.5, 4, { from: 200, to: 340 });
  p.line(206, 175, 206.4, 188).line(210, 175, 209.6, 188);
  p.oval(208, 189, 11, 2.6, { from: 180, to: 546 });
  p.line(198, 152, 200, 147).line(214, 150, 217, 154).dot(206, 158, 1).dot(219, 160, 0.9);
  // plate on a placemat
  p.poly([
    [80, 212],
    [148, 198],
    [166, 222],
    [96, 238],
    [80, 212],
  ]);
  p.oval(123, 217, 30, 10.5, { from: -150, to: 222 });
  p.oval(123, 217, 19, 6, { from: -40, to: 330 });
  p.oval(117, 216, 4, 2.4).oval(129, 214, 3.4, 2);
  p.dot(124, 219.5, 1.1).dot(111, 219, 0.9).dot(133, 219, 0.9);
  // napkin + fork hatch
  p.hatch([90, 240], [104, 236.6], [93, 244], [107, 240.6], 4);
  // chair
  p.curve([
    [244, 198],
    [245, 160],
    [246, 118],
  ]);
  p.curve([
    [298, 190],
    [297, 150],
    [296, 110],
  ]);
  p.curve([
    [244, 120],
    [256, 104],
    [276, 100],
    [296, 104],
    [300, 112],
  ]);
  p.curve([
    [246, 128],
    [262, 114],
    [280, 112],
    [296, 118],
  ]);
  for (let i = 0; i < 5; i++) {
    const x = 253 + i * 8.6;
    p.line(x, 120 - i * 0.6, x + 0.4, 196 - i * 1.6);
  }
  // seat
  p.poly([
    [236, 200],
    [298, 190],
    [312, 218],
    [250, 230],
    [236, 200],
  ]);
  p.line(250, 230, 250, 237).line(312, 218, 312, 225);
  p.line(250, 237, 312, 225, 0.5);
  p.hatch([256, 231], [306, 221], [256, 236], [306, 226], 7);
  // pop! sparkles above the goblet
  p.w(2.2);
  p.rays(208, 82, 12, 42, [-150, -118, -92, -66, -38]);
  p.push(176, 60);
  sparkle(p, 3.5);
  p.pop();
  p.push(234, 50);
  sparkle(p, 3);
  p.pop();
  p.line(238, 76, 244, 72).line(180, 84, 175, 82);
  p.dot(247, 62, 1.2).dot(170, 72, 1.1);
  // crumbs
  p.dot(40, 208, 1.1).dot(48, 206, 0.9).dot(188, 222, 1).dot(206, 214, 0.9);
  p.line(60, 222, 64, 220).line(176, 236, 180, 233);
});

export const cheersArt = sketch(260, 195, 11, (p) => {
  p.w(2.5);
  p.push(109, 38, 17);
  heldGlass(p, 0.42, 110);
  p.pop();
  p.push(151, 38, -17, -1, 1);
  heldGlass(p, 0.46, 110);
  p.pop();
  // clink sparks
  p.w(2.3);
  p.rays(130, 34, 11, 30, [-158, -128, -96, -64, -30]);
  p.rays(130, 74, 12, 26, [72, 92, 112]);
  // swish lines beside the bowls
  p.line(58, 44, 72, 46).line(60, 58, 70, 57).line(188, 46, 202, 44).line(190, 57, 200, 58);
  p.line(66, 28, 74, 34).line(194, 34, 202, 28);
  // confetti ticks + dots
  p.line(34, 36, 40, 30).line(222, 30, 228, 36).line(28, 100, 35, 102).line(228, 96, 234, 91);
  p.line(96, 8, 100, 14).line(162, 14, 167, 8);
  p.push(48, 70);
  sparkle(p, 4);
  p.pop();
  p.push(212, 72);
  sparkle(p, 3.6);
  p.pop();
  p.dot(22, 62, 1.6).dot(240, 60, 1.6).dot(130, 8, 1.4).dot(150, 150, 1.3).dot(110, 156, 1.2).dot(84, 18, 1.2);
});

export const palmSunArt = sketch(300, 240, 23, (p) => {
  p.w(2.6);
  p.push(96, 90);
  caracasPalm(p);
  p.pop();
  p.w(2.8);
  p.push(232, 110);
  sun(p, 19, 30, 46, [-150, -112, -80, -46, -12, 24, 58, 92, 128, 170]);
  p.pop();
  // ground
  p.line(58, 222, 134, 200, -1.5);
  p.line(162, 196, 210, 208, -1);
  p.dot(262, 192, 1.5).dot(274, 187, 1.5);
});

export const glassesArt = sketch(80, 72, 5, (p) => {
  p.w(2.2);
  p.push(32, 22, 22);
  wineGlass(p, 10, 22, 18, { liquid: 0.45 });
  p.pop();
  p.push(50, 20, -18);
  wineGlass(p, 10, 22, 18, { liquid: 0.45 });
  p.pop();
  p.w(2);
  p.rays(42, 16, 7, 14, [-140, -100, -60, -20]);
  p.line(8, 30, 14, 32).line(70, 34, 76, 32);
});

export const asteriskArt = sketch(24, 24, 3, (p) => {
  p.w(2.3);
  p.push(12, 12);
  asterisk(p, 9.5, 4, 8);
  p.pop();
});

export const burstArt = sketch(40, 40, 9, (p) => {
  p.w(3);
  p.push(21, 20);
  p.line(-3, 11, 5, -12);
  p.line(-10, 2, 12, -2);
  p.line(-2, -11, 1, 10);
  p.pop();
  p.line(8, 8, 12, 12);
  p.line(30, 28, 33, 32);
  p.line(32, 6, 34, 4);
});

export const swooshArt = sketch(120, 30, 13, (p) => {
  p.w(3);
  p.curve([
    [6, 20],
    [34, 14],
    [66, 12],
    [98, 13],
    [114, 16],
  ]);
  p.curve([
    [22, 24],
    [52, 20],
    [86, 19],
    [104, 21],
  ]);
});

export const leafArt = sketch(48, 48, 17, (p) => {
  p.w(2.2);
  // leaf outline, midrib and veins
  p.curve([[12, 38], [10, 26], [16, 14], [28, 8], [38, 6]]);
  p.curve([[12, 38], [24, 36], [34, 28], [38, 17], [38, 6]]);
  p.curve([[6, 44], [12, 38], [22, 26], [31, 16], [37, 8]]);
  p.line(17, 31, 13, 24).line(22, 25, 18, 16).line(27, 19, 25, 11);
  p.line(19, 29, 27, 32).line(24, 23, 33, 24).line(29, 17, 36, 16);
  p.push(40, 36);
  sparkle(p, 4.2);
  p.pop();
  p.dot(6, 12, 1.3).dot(44, 26, 1.1);
});

/** Bold leaf-shaped frond (for the app icon): outline, partial midrib and a few notches. */
function leafFrond(p: Pen, pts: Pt[], width: number, cuts: number) {
  const g = guide(pts);
  const prof = (s: number) => Math.pow(Math.sin(Math.PI * s), 0.8) * (1 - 0.25 * s);
  const edge = (side: 1 | -1) => {
    const out: Pt[] = [];
    for (let i = 0; i <= 8; i++) {
      const s = i / 8;
      const f = g.at(s);
      out.push([f.p[0] + f.n[0] * side * width * prof(s), f.p[1] + f.n[1] * side * width * prof(s)]);
    }
    return out;
  };
  p.curve(edge(1), { jitter: 0.3 }).curve(edge(-1), { jitter: 0.3 });
  p.curve([g.at(0.08).p, g.at(0.35).p, g.at(0.62).p], { jitter: 0.2 });
  for (let i = 0; i < cuts; i++) {
    const s = 0.4 + (0.45 * (i + 0.5)) / cuts;
    for (const side of [1, -1] as const) {
      const f = g.at(s);
      const e = g.at(s + 0.1);
      const w0 = width * prof(s) * 1.05;
      p.line(
        f.p[0] + f.n[0] * side * w0,
        f.p[1] + f.n[1] * side * w0,
        e.p[0] + e.n[0] * side * w0 * 0.25,
        e.p[1] + e.n[1] * side * w0 * 0.25,
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/* App icon motif: Caracas palm + hand-lettered "HOY?"                */
/* ------------------------------------------------------------------ */

export const iconArt = sketch(200, 200, 29, (p) => {
  p.w(6);
  trunk(
    p,
    [
      [88, 120],
      [90, 100],
      [96, 78],
      [106, 58],
    ],
    15,
    11,
    4,
  );
  const C: Pt = [106, 54];
  const f = (pts: Pt[], w: number, cuts: number) => leafFrond(p, [C, ...pts], w, cuts);
  p.w(5.5);
  f([[130, 34], [158, 38], [176, 60]], 11, 3);
  f([[82, 34], [54, 38], [36, 60]], 11, 3);
  f([[126, 64], [138, 82], [140, 104]], 9, 2);
  f([[86, 64], [74, 82], [72, 104]], 9, 2);
  f([[110, 30], [122, 14], [140, 8]], 8, 2);
  p.w(5);
  p.push(168, 100);
  sparkle(p, 7);
  p.pop();
  p.dot(40, 100, 3.2);
  p.w(10);
  // H
  p.line(46, 134, 47, 182).line(74, 132, 73, 180).line(47, 158, 73, 156);
  // O
  p.oval(102, 157, 13.5, 23, { from: -100, to: 280 });
  // Y
  p.line(126, 134, 138, 156).line(152, 132, 138, 156).line(138, 156, 137, 180);
  // ?
  p.curve([
    [160, 142],
    [166, 131],
    [178, 132],
    [181, 144],
    [172, 156],
    [170, 166],
  ]);
  p.dot(170, 180, 5.5);
});
