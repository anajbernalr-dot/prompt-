// PopUp Analytics — Design System
// Corporate · Apple-grade · Premium Dark

export const Colors = {
  bg0: '#08080E',
  bg1: '#0D0D16',
  bg2: '#13131F',
  bg3: '#1A1A2E',
  bg4: '#212136',

  primary: '#5E5CE6',
  primarySoft: '#5E5CE620',
  primaryMid: '#5E5CE650',

  green: '#30D158',
  greenSoft: '#30D15818',
  red: '#FF453A',
  redSoft: '#FF453A18',
  orange: '#FF9F0A',
  orangeSoft: '#FF9F0A18',
  blue: '#0A84FF',
  blueSoft: '#0A84FF18',
  teal: '#5AC8FA',

  label1: '#FFFFFF',
  label2: 'rgba(255,255,255,0.75)',
  label3: 'rgba(255,255,255,0.45)',
  label4: 'rgba(255,255,255,0.22)',

  sep: 'rgba(255,255,255,0.07)',
  sepStrong: 'rgba(255,255,255,0.13)',

  glass: 'rgba(255,255,255,0.05)',
  glassStrong: 'rgba(255,255,255,0.09)',
  overlay: 'rgba(0,0,0,0.6)',
  scrim: 'rgba(8,8,14,0.88)',

  // Legacy aliases so old code doesn't break
  background: '#0D0D16',
  card: '#13131F',
  cardElevated: '#1A1A2E',
  border: 'rgba(255,255,255,0.07)',
  subtext: 'rgba(255,255,255,0.45)',
  text: '#FFFFFF',
  accent: '#30D158',
  danger: '#FF453A',
  warning: '#FF9F0A',
  success: '#30D158',
  info: '#0A84FF',
};

export const R = {
  xs: 6, sm: 10, md: 14, lg: 20, xl: 26, xxl: 32, full: 999,
};

export const S = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, xxxl: 40,
};

export const F = {
  micro: 11, caption: 12, footnote: 13, sub: 14, body: 16,
  callout: 17, headline: 18, title3: 20, title2: 22, title1: 28,
  largeTitle: 34, display: 48, hero: 64,
  regular: '400' as const, medium: '500' as const, semibold: '600' as const,
  bold: '700' as const, heavy: '800' as const, black: '900' as const,
};
