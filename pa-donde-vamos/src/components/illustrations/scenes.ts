// The artwork itself. Coordinates are in each viewBox; see motifs.ts for the building blocks.
import {
  asterisk,
  bean,
  featherFrond,
  serratedFrond,
  sodaBottle,
  sparkle,
  sun,
  trunk,
  wineGlass,
} from './motifs';
import { sketch, type Pen, type Pt } from './pen';

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

/** Fist wrapped around a wine-glass stem (glass-local coords, stem top at y=h). Arm leaves to the lower left. */
function fist(p: Pen, h: number, arm: { len: number; angle: number }) {
  const y = h;
  // index finger + back of hand
  p.curve([
    [-15, y + 6],
    [-10, y + 2.6],
    [-3, y + 1.4],
    [4, y + 2.4],
    [7.6, y + 5.4],
    [6.4, y + 8.6],
    [1.6, y + 9],
  ]);
  // middle + ring fingers
  p.curve([
    [6.6, y + 9.4],
    [8.2, y + 12],
    [6.2, y + 14.6],
    [1.2, y + 14.6],
  ]);
  p.curve([
    [6.2, y + 15.2],
    [7.2, y + 17.8],
    [4.6, y + 19.8],
    [-1, y + 19.8],
  ]);
  // heel of the palm
  p.curve([
    [-1, y + 19.8],
    [-6.5, y + 20.8],
    [-12, y + 20.6],
    [-16, y + 18.5],
  ]);
  // thumb resting over the index finger
  p.curve([
    [-10, y + 7.4],
    [-3, y + 8.2],
    [2.6, y + 6.6],
  ]);
  // arm
  const a = (arm.angle * Math.PI) / 180;
  const dx = Math.cos(a) * arm.len;
  const dy = Math.sin(a) * arm.len;
  p.line(-15, y + 6, -15 + dx, y + 6 + dy, -1.2);
  p.line(-16, y + 18.5, -16 + dx * 0.86, y + 18.5 + dy * 0.86, -1);
  // sleeve texture
  for (let i = 0; i < 3; i++) {
    const k = 0.45 + i * 0.12;
    const x = -16 + dx * k * 0.86;
    const yy = y + 18.5 + dy * k * 0.86;
    p.line(x + 1, yy - 3, x + 3.4, yy - 4.6);
  }
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
  p.w(2.4);
  // left glass + hand
  p.push(112, 58, 14);
  wineGlass(p, 18, 42, 32, { liquid: 0.4, bubbles: 4, stemFrom: 0, stemTo: 32 });
  fist(p, 42 + 4, { len: 78, angle: 128 });
  p.pop();
  // right glass + hand (mirrored)
  p.push(148, 58, -14, -1, 1);
  wineGlass(p, 18, 42, 32, { liquid: 0.44, bubbles: 4 });
  fist(p, 42 + 4, { len: 78, angle: 128 });
  p.pop();
  // clink sparks
  p.w(2.2);
  p.rays(130, 44, 10, 26, [-150, -120, -90, -60, -30]);
  p.rays(130, 70, 10, 22, [60, 90, 120]);
  // around the glasses
  p.rays(90, 50, 26, 38, [-170, -140, 180]);
  p.rays(170, 50, 26, 38, [-10, -40, 0]);
  // confetti
  bean(p, 60, 24, 9, 60);
  bean(p, 206, 30, 9, -50);
  bean(p, 36, 96, 8, 20);
  bean(p, 222, 104, 8, -20);
  bean(p, 130, 150, 8, 80);
  bean(p, 96, 12, 7, 30);
  p.dot(24, 60, 1.6).dot(238, 70, 1.6).dot(160, 12, 1.4).dot(52, 140, 1.3).dot(206, 150, 1.3).dot(180, 176, 1.2);
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
  serratedFrond(p, [[10, 42], [18, 28], [28, 16], [40, 8]], 7, 5);
  p.push(38, 34);
  sparkle(p, 4);
  p.pop();
  p.dot(8, 12, 1.2);
});

/* ------------------------------------------------------------------ */
/* App icon motif: Caracas palm + hand-lettered "HOY?"                */
/* ------------------------------------------------------------------ */

export const iconArt = sketch(200, 200, 29, (p) => {
  p.w(6);
  p.push(80, 70, 0, 0.62);
  caracasPalm(p);
  p.pop();
  p.w(9);
  // H
  p.line(52, 128, 54, 172).line(78, 126, 78, 170).line(54, 150, 78, 148);
  // O
  p.oval(104, 148, 12, 21, { from: -100, to: 280 });
  // Y
  p.line(124, 128, 136, 150).line(150, 126, 136, 150).line(136, 150, 135, 172);
  // ?
  p.curve([
    [156, 136],
    [162, 125],
    [174, 126],
    [177, 138],
    [168, 150],
    [166, 160],
  ]);
  p.dot(166, 172, 4);
});
