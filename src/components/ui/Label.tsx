import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { Colors, F } from '../../theme/colors';

type Variant = 'largeTitle' | 'title1' | 'title2' | 'title3' | 'headline' |
               'callout' | 'body' | 'sub' | 'footnote' | 'caption' | 'micro';
type Weight = 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy' | 'black';
type Color = 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'brand' |
             'green' | 'red' | 'orange' | 'blue';

interface Props {
  children: React.ReactNode;
  variant?: Variant;
  weight?: Weight;
  color?: Color;
  style?: TextStyle | TextStyle[];
  numberOfLines?: number;
}

const sizeMap: Record<Variant, number> = {
  largeTitle: F.largeTitle, title1: F.title1, title2: F.title2,
  title3: F.title3, headline: F.headline, callout: F.callout,
  body: F.body, sub: F.sub, footnote: F.footnote,
  caption: F.caption, micro: F.micro,
};

const colorMap: Record<Color, string> = {
  primary: Colors.label1, secondary: Colors.label2, tertiary: Colors.label3,
  quaternary: Colors.label4, brand: Colors.primary,
  green: Colors.green, red: Colors.red, orange: Colors.orange, blue: Colors.blue,
};

export default function Label({ children, variant = 'body', weight = 'regular', color = 'primary', style, numberOfLines }: Props) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[{ fontSize: sizeMap[variant], fontWeight: F[weight], color: colorMap[color], letterSpacing: variant === 'largeTitle' ? -0.5 : variant === 'title1' ? -0.3 : 0 }, style]}
    >
      {children}
    </Text>
  );
}
