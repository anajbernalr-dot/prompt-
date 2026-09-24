import { memo, useMemo } from 'react';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path, Rect, Text as SvgText } from 'react-native-svg';

import { colors, fonts } from '@/theme';

// Stylized, desaturated street map of east Caracas (not real tiles).
// Everything is laid out in 0..1 fractions of the box and scaled to pixels.

const LAND = '#E7E4D5';
const LAND_SOUTH = '#E9E5D7';
const GREEN = '#DCE0CA';
const PARK = '#CBD5B8';
const PARK_EDGE = '#B8C5A2';
const TREES = '#BDCAA8';
const STREET = '#FBFAF5';
const AVENUE_EDGE = '#D8D1BF';
const RIVER = '#A8BDC8';
const RIVER_LABEL = '#7F98A6';
const PARK_LABEL = '#7E8E68';

type Pt = [number, number];
type Cubic = [Pt, Pt, Pt, Pt];

// Main roads (fractions).
const MIRANDA: [Pt, Pt] = [
  [-0.05, 0.47],
  [1.05, 0.29],
];
const AUTOPISTA: Cubic = [
  [-0.05, 0.7],
  [0.3, 0.77],
  [0.62, 0.67],
  [1.05, 0.74],
];
const GUAIRE: Cubic = [
  [-0.05, 0.765],
  [0.3, 0.835],
  [0.62, 0.735],
  [1.05, 0.805],
];
const AV_NORTH_SOUTH: [Pt, Pt] = [
  [0.61, -0.05],
  [0.45, 0.72],
];
const AV_MERCEDES: [Pt, Pt] = [
  [0.4, 0.76],
  [0.33, 1.05],
];

const DISTRICTS: { label: string; x: number; y: number }[] = [
  { label: 'LOS PALOS GRANDES', x: 0.78, y: 0.075 },
  { label: 'EL ROSAL', x: 0.2, y: 0.125 },
  { label: 'LA CASTELLANA', x: 0.64, y: 0.235 },
  { label: 'CHACAO', x: 0.25, y: 0.5 },
  { label: 'ALTAMIRA', x: 0.73, y: 0.505 },
  { label: 'LAS MERCEDES', x: 0.2, y: 0.93 },
];

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function cubicAt([p0, p1, p2, p3]: Cubic, t: number): Pt {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
}

/** Two path strings (minor streets, wider streets) for a family of parallel streets. */
function streetFamily(w: number, h: number, angle: number, spacing: number, seed: number) {
  const rand = rng(seed);
  const a = (angle * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const nx = -dy;
  const ny = dx;
  const D = Math.hypot(w, h);
  let minor = '';
  let major = '';
  let i = 0;
  for (let k = -D / 2; k < D / 2; k += spacing * (0.7 + rand() * 0.6), i++) {
    const px = w / 2 + nx * k;
    const py = h / 2 + ny * k;
    for (let t = -D / 2; t < D / 2; ) {
      const t2 = Math.min(t + 30 + rand() * D * 0.55, D / 2);
      const seg = `M${(px + dx * t).toFixed(1)} ${(py + dy * t).toFixed(1)}L${(px + dx * t2).toFixed(1)} ${(py + dy * t2).toFixed(1)}`;
      if (i % 4 === 0) major += seg;
      else minor += seg;
      t = t2 + (rand() < 0.4 ? 12 + rand() * 34 : 0);
    }
  }
  return { minor, major };
}

function CityMapBase({ width: w, height: h }: { width: number; height: number }) {
  const geo = useMemo(() => {
    const X = (x: number) => (x * w).toFixed(1);
    const Y = (y: number) => (y * h).toFixed(1);
    const P = ([x, y]: Pt) => `${X(x)} ${Y(y)}`;
    const line = ([a, b]: [Pt, Pt]) => `M${P(a)}L${P(b)}`;
    const cubic = ([a, b, c, d]: Cubic) => `M${P(a)}C${P(b)} ${P(c)} ${P(d)}`;

    // Land north of the highway and south of the river get different street grids.
    const north = `M${X(-0.1)} ${Y(-0.1)}L${X(1.1)} ${Y(-0.1)}L${P(AUTOPISTA[3])}C${P(AUTOPISTA[2])} ${P(AUTOPISTA[1])} ${P(AUTOPISTA[0])}Z`;
    const south = `M${P(GUAIRE[0])}C${P(GUAIRE[1])} ${P(GUAIRE[2])} ${P(GUAIRE[3])}L${X(1.1)} ${Y(1.1)}L${X(-0.1)} ${Y(1.1)}Z`;

    const gridN1 = streetFamily(w, h, -62, 30, 7);
    const gridN2 = streetFamily(w, h, 25, 34, 19);
    const gridS1 = streetFamily(w, h, -80, 26, 31);
    const gridS2 = streetFamily(w, h, 8, 30, 43);

    const park = `M${P([0.8, 0.515])}L${P([1.05, 0.485])}L${P([1.05, 0.7])}L${P([0.86, 0.705])}Q${P([0.76, 0.66])} ${P([0.8, 0.515])}Z`;
    const parkPaths = `M${P([0.82, 0.56])}Q${P([0.9, 0.6])} ${P([0.87, 0.66])}T${P([1.0, 0.68])}M${P([0.88, 0.52])}Q${P([0.95, 0.58])} ${P([1.05, 0.56])}`;

    const angleOf = ([a, b]: [Pt, Pt]) => (Math.atan2((b[1] - a[1]) * h, (b[0] - a[0]) * w) * 180) / Math.PI;
    const mirandaAt = (t: number): Pt => [
      MIRANDA[0][0] + (MIRANDA[1][0] - MIRANDA[0][0]) * t,
      MIRANDA[0][1] + (MIRANDA[1][1] - MIRANDA[0][1]) * t,
    ];
    const autoA = cubicAt(AUTOPISTA, 0.05);
    const autoB = cubicAt(AUTOPISTA, 0.16);
    const riverA = cubicAt(GUAIRE, 0.56);
    const riverB = cubicAt(GUAIRE, 0.66);

    return {
      north,
      south,
      gridN1,
      gridN2,
      gridS1,
      gridS2,
      park,
      parkPaths,
      miranda: line(MIRANDA),
      northSouth: line(AV_NORTH_SOUTH),
      mercedes: line(AV_MERCEDES),
      autopista: cubic(AUTOPISTA),
      guaire: cubic(GUAIRE),
      mirandaLabel: { at: mirandaAt(0.1), angle: angleOf(MIRANDA) },
      autoLabel: { at: autoA, angle: angleOf([autoA, autoB]) },
      riverLabel: { at: riverA, angle: angleOf([riverA, riverB]) },
    };
  }, [w, h]);

  const label = (text: string, at: Pt, angle: number, color: string, size = 7.5, dy = 2.6) => (
    <G transform={`translate(${(at[0] * w).toFixed(1)} ${(at[1] * h).toFixed(1)}) rotate(${angle.toFixed(1)})`}>
      <SvgText
        x={0}
        y={dy}
        fontSize={size}
        fontFamily={fonts.sansSemi}
        letterSpacing={1.2}
        fill={color}>
        {text}
      </SvgText>
    </G>
  );

  return (
    <Svg width={w} height={h} pointerEvents="none">
      <Defs>
        <ClipPath id="pdv-map-north">
          <Path d={geo.north} />
        </ClipPath>
        <ClipPath id="pdv-map-south">
          <Path d={geo.south} />
        </ClipPath>
      </Defs>

      <Rect x={0} y={0} width={w} height={h} fill={LAND} />
      <Path d={geo.south} fill={LAND_SOUTH} />

      {/* Soft green patches (plazas, gardens, the Ávila foothills) */}
      <Ellipse cx={w * 0.08} cy={h * 0.04} rx={w * 0.2} ry={h * 0.07} fill={GREEN} />
      <Ellipse cx={w * 0.48} cy={h * 0.02} rx={w * 0.16} ry={h * 0.04} fill={GREEN} />
      <Ellipse cx={w * 0.12} cy={h * 0.62} rx={w * 0.1} ry={h * 0.04} fill={GREEN} opacity={0.8} />
      <Ellipse cx={w * 0.72} cy={h * 0.92} rx={w * 0.16} ry={h * 0.05} fill={GREEN} opacity={0.8} />
      <Rect x={w * 0.6} y={h * 0.595} width={w * 0.06} height={h * 0.045} rx={3} fill={PARK} />
      <Rect x={w * 0.34} y={h * 0.2} width={w * 0.05} height={h * 0.035} rx={3} fill={PARK} opacity={0.85} />

      {/* Street grids */}
      <G clipPath="url(#pdv-map-north)" stroke={STREET} strokeLinecap="round" fill="none">
        <Path d={geo.gridN1.minor} strokeWidth={1.4} />
        <Path d={geo.gridN2.minor} strokeWidth={1.4} />
        <Path d={geo.gridN1.major} strokeWidth={2.8} />
        <Path d={geo.gridN2.major} strokeWidth={2.8} />
      </G>
      <G clipPath="url(#pdv-map-south)" stroke={STREET} strokeLinecap="round" fill="none">
        <Path d={geo.gridS1.minor} strokeWidth={1.3} />
        <Path d={geo.gridS2.minor} strokeWidth={1.3} />
        <Path d={geo.gridS1.major} strokeWidth={2.6} />
        <Path d={geo.gridS2.major} strokeWidth={2.6} />
      </G>

      {/* Parque del Este */}
      <Path d={geo.park} fill={PARK} stroke={PARK_EDGE} strokeWidth={1} />
      <Path d={geo.parkPaths} stroke={STREET} strokeWidth={1.2} fill="none" opacity={0.8} />
      <Circle cx={w * 0.84} cy={h * 0.6} r={7} fill={TREES} />
      <Circle cx={w * 0.97} cy={h * 0.53} r={9} fill={TREES} />
      <Circle cx={w * 0.95} cy={h * 0.645} r={6} fill={TREES} />

      {/* Río Guaire */}
      <Path d={geo.guaire} stroke={RIVER} strokeWidth={3} fill="none" strokeLinecap="round" />

      {/* Avenues */}
      <G fill="none" strokeLinecap="round">
        <Path d={geo.northSouth} stroke={AVENUE_EDGE} strokeWidth={6.5} />
        <Path d={geo.mercedes} stroke={AVENUE_EDGE} strokeWidth={6} />
        <Path d={geo.miranda} stroke={AVENUE_EDGE} strokeWidth={9} />
        <Path d={geo.autopista} stroke={AVENUE_EDGE} strokeWidth={12} />
        <Path d={geo.northSouth} stroke={colors.white} strokeWidth={4.5} />
        <Path d={geo.mercedes} stroke={colors.white} strokeWidth={4} />
        <Path d={geo.miranda} stroke={colors.white} strokeWidth={7} />
        <Path d={geo.autopista} stroke="#FFFDF7" strokeWidth={10} />
      </G>

      {/* Labels */}
      {label('AV. FRANCISCO DE MIRANDA', geo.mirandaLabel.at, geo.mirandaLabel.angle, colors.textFaint, 6.5, 2.3)}
      {label('AUTOPISTA', geo.autoLabel.at, geo.autoLabel.angle, colors.textFaint, 6.5, 2.3)}
      {label('Río Guaire', geo.riverLabel.at, geo.riverLabel.angle, RIVER_LABEL, 8, -5)}
      <SvgText
        x={w * 0.915}
        y={h * 0.585}
        fontSize={7}
        fontFamily={fonts.sansSemi}
        letterSpacing={1.2}
        fill={PARK_LABEL}
        textAnchor="middle">
        PARQUE
      </SvgText>
      <SvgText
        x={w * 0.915}
        y={h * 0.585 + 10}
        fontSize={7}
        fontFamily={fonts.sansSemi}
        letterSpacing={1.2}
        fill={PARK_LABEL}
        textAnchor="middle">
        DEL ESTE
      </SvgText>
      {DISTRICTS.map((d) => (
        <SvgText
          key={d.label}
          x={w * d.x}
          y={h * d.y}
          fontSize={9}
          fontFamily={fonts.sansBold}
          letterSpacing={1.8}
          fill={colors.textFaint}
          opacity={0.85}
          textAnchor="middle">
          {d.label}
        </SvgText>
      ))}
    </Svg>
  );
}

export const CityMap = memo(CityMapBase);
