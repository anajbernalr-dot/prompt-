// "Pide recomendaciones" artwork: panas chatting under a speech bubble, and a small raised hand.
import { sparkle } from './motifs';
import { sketch, type Pen } from './pen';

/** Head + shoulders of a person at (0,0) = chin, facing right (mirror with sx=-1). */
function pana(p: Pen, hair: 'curly' | 'bun') {
  p.w(2.5);
  // head
  p.oval(0, -22, 15, 19, { wobble: 0.6 });
  // eye, nose, smile
  p.dot(7, -24, 1.4);
  p.curve([[13, -22], [17, -17], [13, -15]]);
  p.curve([[4, -9], [8, -7], [11, -10]]);
  // ear
  p.oval(-8, -20, 3.2, 4.6);
  // hair
  if (hair === 'curly') {
    p.curve([[-15, -26], [-17, -38], [-8, -44], [2, -45], [11, -42], [16, -33]]);
    p.oval(-10, -40, 5, 5, { spiral: 0.3 });
    p.oval(-1, -45, 5, 4.6, { spiral: 0.3 });
    p.oval(8, -42, 4.6, 4.2, { spiral: 0.3 });
    p.oval(-15, -31, 4, 4.4, { spiral: 0.3 });
  } else {
    p.curve([[-15, -20], [-16, -36], [-4, -43], [10, -41], [16, -30]]);
    p.oval(-10, -46, 7, 6);
    p.line(-12, -30, 2, -38, 1);
  }
  // neck + shoulders
  p.line(-4, -4, -5, 6).line(6, -4, 7, 6);
  p.curve([[-5, 6], [-24, 12], [-34, 30], [-38, 52]]);
  p.curve([[7, 6], [24, 11], [34, 28], [37, 52]]);
  // collar
  p.curve([[-5, 7], [1, 14], [7, 7]]);
  // raised arm gesturing toward the other pana
  p.curve([[26, 20], [34, 8], [40, -8], [44, -20]]);
  p.curve([[33, 30], [42, 12], [49, -4], [51, -18]]);
  // hand
  p.curve([[44, -20], [42, -30], [44, -36], [47, -30]]);
  p.curve([[47, -32], [48, -41], [51, -41], [51, -30]]);
  p.curve([[51, -32], [53, -38], [56, -36], [54, -26], [51, -18]]);
}

export const askArt = sketch(260, 170, 31, (p) => {
  p.push(66, 108);
  pana(p, 'curly');
  p.pop();
  p.push(194, 108, 0, -1, 1);
  pana(p, 'bun');
  p.pop();
  // speech bubble
  p.w(2.6);
  p.curve(
    [
      [104, 30],
      [112, 14],
      [132, 8],
      [152, 12],
      [162, 26],
      [156, 40],
      [138, 46],
      [124, 45],
    ],
    { jitter: 0.6 },
  );
  p.curve([[124, 45], [114, 56], [116, 46], [106, 40], [104, 30]]);
  p.dot(119, 28, 2.6).dot(132, 27, 2.6).dot(145, 26, 2.6);
  // sparks
  p.w(2.3);
  p.rays(132, 26, 30, 42, [-160, -120, -60, -20]);
  p.push(30, 34);
  sparkle(p, 5);
  p.pop();
  p.push(232, 40);
  sparkle(p, 4.4);
  p.pop();
  // table line
  p.line(14, 162, 246, 160, -2);
  p.dot(18, 70, 1.6).dot(244, 88, 1.6).dot(96, 70, 1.3);
});

export const handArt = sketch(48, 48, 37, (p) => {
  p.w(2.2);
  // palm + wrist
  p.curve([[16, 44], [15, 34], [12, 28], [9, 20], [11, 17], [15, 21], [18, 26]]);
  p.curve([[31, 44], [32, 36], [36, 28], [36, 20]]);
  // fingers
  p.curve([[18, 26], [17, 16], [16, 8], [19, 6], [21, 12], [22, 22]]);
  p.curve([[22, 20], [22, 8], [24, 3], [27, 5], [27, 14], [27, 22]]);
  p.curve([[27, 18], [28, 9], [31, 7], [33, 10], [32, 18], [32, 23]]);
  p.curve([[32, 20], [34, 14], [37, 14], [37, 19], [36, 24]]);
  // motion ticks
  p.rays(24, 16, 16, 22, [-170, -140, -40, -10]);
});
