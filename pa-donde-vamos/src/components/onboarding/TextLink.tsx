import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/Typography';
import { colors } from '@/theme';

/** Small centered text link ("Ya tengo cuenta"). `strong` is rendered in blue after `label`. */
export function TextLink({
  label,
  strong,
  onPress,
  style,
}: {
  label: string;
  strong?: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={strong ? `${label} ${strong}` : label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.link, pressed && { opacity: 0.6 }, style]}>
      <AppText variant="small" color={colors.text} align="center">
        {label}
        {strong ? (
          <AppText variant="small" weight="semibold" color={colors.blue}>
            {' '}
            {strong}
          </AppText>
        ) : null}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: { minHeight: 44, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', paddingHorizontal: 12 },
});
