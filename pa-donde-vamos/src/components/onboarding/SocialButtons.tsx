import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { FilledIcon } from '@/components/Icon';
import { GoogleLogo } from '@/components/illustrations';
import { Divider } from '@/components/Surfaces';
import { useAppStore } from '@/store/useAppStore';
import { colors } from '@/theme';

/** "o continúa con" divider + Google / Apple buttons side by side. */
export function SocialButtons() {
  const signInWithProvider = useAppStore((s) => s.signInWithProvider);
  return (
    <View style={styles.wrap}>
      <Divider label="o continúa con" />
      <View style={styles.row}>
        <Button
          label="Google"
          variant="outline"
          size="md"
          fullWidth={false}
          style={styles.half}
          accessibilityLabel="Continuar con Google"
          leading={<GoogleLogo width={18} />}
          onPress={() => signInWithProvider('google')}
        />
        <Button
          label="Apple"
          variant="outline"
          size="md"
          fullWidth={false}
          style={styles.half}
          accessibilityLabel="Continuar con Apple"
          leading={<FilledIcon name="logo-apple" size={20} color={colors.ink} />}
          onPress={() => signInWithProvider('apple')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 18 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1, height: 52 },
});
