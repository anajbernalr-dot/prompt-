// Hand-drawn blue line illustrations from the design, drawn with react-native-svg.
// Artwork paths are generated once at module load (see ./illustrations/scenes.ts).
import type { StyleProp, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors } from '@/theme';

import { askArt, handArt } from './illustrations/ask';
import type { Artwork } from './illustrations/pen';
import {
  asteriskArt,
  burstArt,
  cheersArt,
  glassesArt,
  leafArt,
  palmSunArt,
  swooshArt,
  welcomeArt,
} from './illustrations/scenes';

export type IllustrationProps = {
  /** Rendered width in px; height follows the artwork's aspect ratio. */
  width?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

function Ink({ art, width = 200, color = colors.blue, style }: IllustrationProps & { art: Artwork }) {
  return (
    <Svg
      width={width}
      height={(width * art.vh) / art.vw}
      viewBox={`0 0 ${art.vw} ${art.vh}`}
      style={style}
      pointerEvents="none"
    >
      {art.layers.map((l) =>
        l.fill ? (
          <Path key={`f${l.w}`} d={l.d} fill={color} />
        ) : (
          <Path
            key={`s${l.w}`}
            d={l.d}
            fill="none"
            stroke={color}
            strokeWidth={l.w}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ),
      )}
    </Svg>
  );
}

/** Welcome: palm tree, table with bottles, wine glass, plate, chair, sparkles. Aspect ~ 1 : 0.8 */
export const WelcomeScene = (p: IllustrationProps) => <Ink art={welcomeArt} width={320} {...p} />;

/** Two hands toasting wine glasses with spark lines (Conecta / Tu plan está listo). Aspect ~ 1 : 0.75 */
export const CheersScene = (p: IllustrationProps) => <Ink art={cheersArt} width={260} {...p} />;

/** Palm tree + sun with rays (Caracas siempre es una buena idea). Aspect ~ 1 : 0.8 */
export const PalmSunScene = (p: IllustrationProps) => <Ink art={palmSunArt} width={300} {...p} />;

/** Small hand-drawn toasting glasses doodle (chat). Aspect ~ 1 : 0.9 */
export const GlassesDoodle = (p: IllustrationProps) => <Ink art={glassesArt} width={80} {...p} />;

/** Asterisk/star doodle "✳" used as decoration. Square. */
export const Asterisk = (p: IllustrationProps) => <Ink art={asteriskArt} width={24} {...p} />;

/** Burst of short strokes around a point (signup top-right). Square. */
export const Burst = (p: IllustrationProps) => <Ink art={burstArt} width={40} {...p} />;

/** Scribbly underline / swoosh under handwritten notes. Aspect ~ 1 : 0.25 */
export const Swoosh = (p: IllustrationProps) => <Ink art={swooshArt} width={120} {...p} />;

/** Small palm-leaf + sparkle doodle used on the event sticky note. Aspect ~ 1 : 1 */
export const LeafDoodle = (p: IllustrationProps) => <Ink art={leafArt} width={48} {...p} />;

/** Two panas chatting under a speech bubble ("Crear recomendación"). Aspect ~ 1 : 0.65 */
export const AskScene = (p: IllustrationProps) => <Ink art={askArt} width={260} {...p} />;

/** Small raised-hand doodle used on question posts. Square. */
export const HandDoodle = (p: IllustrationProps) => <Ink art={handArt} width={44} {...p} />;

/** Full-color Google "G" logo for the "Google" sign-in button. Square; `color` is ignored. */
export function GoogleLogo({ width = 20, style }: IllustrationProps) {
  return (
    <Svg width={width} height={width} viewBox="0 0 48 48" style={style} pointerEvents="none">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <Path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </Svg>
  );
}
