// Hand-drawn blue line illustrations from the design.
// PLACEHOLDER STUBS — final artwork is drawn with react-native-svg.
// Every component keeps this exact props contract.
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/theme';

export type IllustrationProps = {
  /** Rendered width in px; height follows the artwork's aspect ratio. */
  width?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

function Stub({ width = 200, ratio = 1, color = colors.blue, style }: IllustrationProps & { ratio?: number }) {
  return (
    <View
      style={[
        { width, height: width * ratio, borderWidth: 2, borderColor: color, borderStyle: 'dashed', borderRadius: 12 },
        style,
      ]}
    />
  );
}

/** Welcome: palm tree, table with bottles, wine glass, plate, chair, sparkles. Aspect ~ 1 : 0.8 */
export const WelcomeScene = (p: IllustrationProps) => <Stub ratio={0.8} {...p} />;

/** Two hands toasting wine glasses with spark lines (Conecta / Tu plan está listo). Aspect ~ 1 : 0.75 */
export const CheersScene = (p: IllustrationProps) => <Stub ratio={0.75} {...p} />;

/** Palm tree + sun with rays (Caracas siempre es una buena idea). Aspect ~ 1 : 0.8 */
export const PalmSunScene = (p: IllustrationProps) => <Stub ratio={0.8} {...p} />;

/** Small hand-drawn toasting glasses doodle (chat). Aspect ~ 1 : 0.9 */
export const GlassesDoodle = (p: IllustrationProps) => <Stub ratio={0.9} {...p} />;

/** Asterisk/star doodle "✳" used as decoration. Square. */
export const Asterisk = (p: IllustrationProps) => <Stub ratio={1} {...p} />;

/** Burst of short strokes around a point (signup top-right). Square. */
export const Burst = (p: IllustrationProps) => <Stub ratio={1} {...p} />;

/** Scribbly underline / swoosh under handwritten notes. Aspect ~ 1 : 0.25 */
export const Swoosh = (p: IllustrationProps) => <Stub ratio={0.25} {...p} />;

/** Small palm-leaf + sparkle doodle used on the event sticky note. Aspect ~ 1 : 1 */
export const LeafDoodle = (p: IllustrationProps) => <Stub ratio={1} {...p} />;

/** Full-color Google "G" logo for the "Google" sign-in button. Square; `color` is ignored. */
export const GoogleLogo = (p: IllustrationProps) => <Stub ratio={1} {...p} />;
