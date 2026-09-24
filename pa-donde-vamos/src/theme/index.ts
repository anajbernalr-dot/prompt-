import { Platform } from 'react-native';

export const colors = {
  // Surfaces
  background: '#EFE9DC',
  surface: '#F6F1E6',
  surfaceMuted: '#E7DFCF',
  card: '#F3EDE1',
  border: '#DDD3C1',
  borderStrong: '#CFC3AD',

  // Ink
  ink: '#141A2A',
  inkSoft: '#2A2F3C',
  text: '#1D1F24',
  textMuted: '#6B665C',
  textFaint: '#9A9486',
  placeholder: '#A39D8F',

  // Brand
  blue: '#2451F5',
  blueSoft: '#DCE4FF',
  blueInk: '#1E3FCC',

  // Utility
  white: '#FFFFFF',
  black: '#000000',
  star: '#C8963E',
  success: '#2E8B57',
  danger: '#C4452B',
  overlay: 'rgba(12, 14, 20, 0.55)',

  // Dark (event detail)
  night: '#15151A',
  nightSoft: '#22222A',
} as const;

export const fonts = {
  // Headlines — heavy editorial serif
  serifSemi: 'Fraunces_600SemiBold',
  serifBold: 'Fraunces_700Bold',
  serifBlack: 'Fraunces_900Black',
  // UI / body
  sans: 'DMSans_400Regular',
  sansMedium: 'DMSans_500Medium',
  sansSemi: 'DMSans_600SemiBold',
  sansBold: 'DMSans_700Bold',
  // Hand-drawn accents
  marker: 'PermanentMarker_400Regular',
  hand: 'CoveredByYourGrace_400Regular',
  // Welcome display lettering only
  displayCondensed: 'AbrilFatface_400Regular',
  script: 'CaveatBrush_400Regular',
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

/** Horizontal page gutter used by every screen. */
export const gutter = 22;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 26,
  pill: 999,
} as const;

export const shadow = Platform.select({
  web: { boxShadow: '0 6px 20px rgba(40, 30, 10, 0.10)' } as object,
  default: {
    shadowColor: '#3A2A10',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
}) as object;

/** Max width of the app column on wide (web/tablet) screens. */
export const maxContentWidth = 520;
