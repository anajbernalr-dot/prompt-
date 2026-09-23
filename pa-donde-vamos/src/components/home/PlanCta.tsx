import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Asterisk } from '@/components/illustrations';
import { Card } from '@/components/Surfaces';
import { AppText, Handwritten } from '@/components/Typography';
import { useAppStore } from '@/store/useAppStore';
import { colors } from '@/theme';

/** "¿Armamos algo?" call to action that starts the create-plan flow. */
export function PlanCta() {
  const start = () => {
    useAppStore.getState().resetDraft();
    router.push('/plan/new');
  };

  return (
    <Card style={styles.card}>
      <Asterisk width={26} style={styles.asterisk} />
      <Handwritten rotate={-4} size={26}>
        ¿Armamos algo?
      </Handwritten>
      <AppText variant="body" color={colors.textMuted} style={styles.body}>
        Elige el sitio, invita a tus panas y listo. Nosotros les avisamos.
      </AppText>
      <View style={styles.actions}>
        <Button label="Crear plan" size="sm" iconRight="arrow-right" fullWidth={false} onPress={start} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, gap: 8, overflow: 'hidden' },
  asterisk: { position: 'absolute', top: 16, right: 18, transform: [{ rotate: '12deg' }] },
  body: { maxWidth: 260 },
  actions: { flexDirection: 'row', marginTop: 6 },
});
