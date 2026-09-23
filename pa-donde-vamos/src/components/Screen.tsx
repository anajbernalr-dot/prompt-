import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, gutter, maxContentWidth } from '@/theme';

type ScreenProps = {
  children: ReactNode;
  /** Wrap content in a ScrollView (default true). */
  scroll?: boolean;
  /** Apply the horizontal page gutter (default true). */
  padded?: boolean;
  /** Add top safe-area padding (default true). Set false when a full-bleed hero sits at the top. */
  safeTop?: boolean;
  /** Add bottom safe-area padding (default true). Tab screens get it from the tab bar instead. */
  safeBottom?: boolean;
  /** Content pinned to the bottom, outside the scroll area (e.g. primary buttons, chat input). */
  footer?: ReactNode;
  background?: string;
  keyboard?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  scrollProps?: ScrollViewProps;
};

/** Page container: cream background, safe areas, page gutter, max width on web. */
export function Screen({
  children,
  scroll = true,
  padded = true,
  safeTop = true,
  safeBottom = true,
  footer,
  background = colors.background,
  keyboard = false,
  contentStyle,
  scrollProps,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const pad: ViewStyle = {
    paddingHorizontal: padded ? gutter : 0,
    paddingTop: safeTop ? insets.top + 8 : 0,
    paddingBottom: footer ? 16 : safeBottom ? insets.bottom + 16 : 24,
  };

  const body = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      {...scrollProps}
      contentContainerStyle={[pad, styles.grow, contentStyle, scrollProps?.contentContainerStyle]}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, pad, contentStyle]}>{children}</View>
  );

  const inner = (
    <View style={[styles.column, { backgroundColor: background }]}>
      {body}
      {footer ? (
        <View
          style={[
            styles.footer,
            { paddingHorizontal: padded ? gutter : 0, paddingBottom: safeBottom ? insets.bottom + 12 : 12 },
          ]}>
          {footer}
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: background }]}>
      {keyboard ? (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {inner}
        </KeyboardAvoidingView>
      ) : (
        inner
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  grow: { flexGrow: 1 },
  column: { flex: 1, width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' },
  footer: { paddingTop: 8, gap: 12 },
});
