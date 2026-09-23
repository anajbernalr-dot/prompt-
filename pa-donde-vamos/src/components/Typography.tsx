import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { colors, fonts } from '@/theme';

type Variant =
  | 'display' // PA' DONDE VAMOS
  | 'h1' // screen titles: "Crea tu cuenta", "Explorar"
  | 'h2' // detail titles: "Tostao Specialty Coffee"
  | 'h3' // section/card titles in serif
  | 'title' // sans semi-bold, e.g. list item names
  | 'body'
  | 'bodyLg'
  | 'small'
  | 'caption'
  | 'label'
  | 'button';

type Weight = 'regular' | 'medium' | 'semibold' | 'bold';

export type AppTextProps = TextProps & {
  variant?: Variant;
  weight?: Weight;
  color?: string;
  align?: TextStyle['textAlign'];
};

const sansByWeight: Record<Weight, string> = {
  regular: fonts.sans,
  medium: fonts.sansMedium,
  semibold: fonts.sansSemi,
  bold: fonts.sansBold,
};

const variantStyles: Record<Variant, TextStyle> = {
  display: { fontFamily: fonts.serifBlack, fontSize: 52, lineHeight: 52, letterSpacing: -1.5, color: colors.ink },
  h1: { fontFamily: fonts.serifBold, fontSize: 32, lineHeight: 37, letterSpacing: -0.6, color: colors.ink },
  h2: { fontFamily: fonts.serifBold, fontSize: 28, lineHeight: 32, letterSpacing: -0.5, color: colors.ink },
  h3: { fontFamily: fonts.serifBold, fontSize: 20, lineHeight: 24, letterSpacing: -0.2, color: colors.ink },
  title: { fontFamily: fonts.sansSemi, fontSize: 16, lineHeight: 21, color: colors.text },
  bodyLg: { fontFamily: fonts.sans, fontSize: 17, lineHeight: 25, color: colors.text },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.text },
  small: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 18, color: colors.textMuted },
  caption: { fontFamily: fonts.sans, fontSize: 11.5, lineHeight: 15, color: colors.textFaint },
  label: { fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 18, color: colors.text },
  button: { fontFamily: fonts.sansSemi, fontSize: 15.5, lineHeight: 20, color: colors.text },
};

export function AppText({ variant = 'body', weight, color, align, style, ...rest }: AppTextProps) {
  const isSerif = variant === 'display' || variant === 'h1' || variant === 'h2' || variant === 'h3';
  return (
    <Text
      {...rest}
      style={[
        variantStyles[variant],
        weight && !isSerif ? { fontFamily: sansByWeight[weight] } : null,
        color ? { color } : null,
        align ? { textAlign: align } : null,
        style,
      ]}
    />
  );
}

/** Serif headline shortcut. */
export function Title({ level = 1, ...rest }: AppTextProps & { level?: 1 | 2 | 3 }) {
  return <AppText variant={level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3'} accessibilityRole="header" {...rest} />;
}

type HandProps = TextProps & {
  /** Degrees. Notes in the design are slightly tilted. */
  rotate?: number;
  size?: number;
  color?: string;
  /** 'hand' = thin marker notes, 'marker' = bold brush ("HOY?"). */
  font?: 'hand' | 'marker';
};

/** Blue hand-written note, e.g. "LOS PANAS SIEMPRE SUMAN". */
export function Handwritten({ rotate = -6, size = 20, color = colors.blue, font = 'hand', style, ...rest }: HandProps) {
  return (
    <Text
      {...rest}
      style={[
        styles.hand,
        {
          fontFamily: font === 'marker' ? fonts.marker : fonts.hand,
          fontSize: size,
          lineHeight: size * 1.1,
          color,
          transform: [{ rotate: `${rotate}deg` }],
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  hand: { textTransform: 'uppercase', letterSpacing: 0.5 },
});
