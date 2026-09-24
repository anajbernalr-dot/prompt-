import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Chip } from '@/components/Chip';
import { showToast } from '@/components/Toast';
import { AppText } from '@/components/Typography';
import { allPreferences } from '@/data/seed';
import { tap } from '@/lib/actions';
import { useAppStore } from '@/store/useAppStore';
import { colors, fonts } from '@/theme';

/** "Mis preferencias": chosen tags (tap to remove) + "+ Agregar" that opens an inline picker. */
export function Preferences() {
  const preferences = useAppStore((s) => s.preferences);
  const toggle = useAppStore((s) => s.togglePreference);
  const [picking, setPicking] = useState(false);
  const available = allPreferences.filter((p) => !preferences.includes(p));

  const remove = (p: string) => {
    tap();
    toggle(p);
    showToast(`Quitaste ${p} de tus preferencias`, 'x');
  };

  const add = (p: string) => {
    tap();
    toggle(p);
    showToast(`${p} agregado a tus preferencias`);
  };

  return (
    <View>
      <View style={styles.wrap}>
        {preferences.map((p) => (
          <Chip key={p} label={`•  ${p}`} tone="tag" onPress={() => remove(p)} />
        ))}
        {available.length ? (
          <Chip
            label={picking ? 'Listo' : 'Agregar'}
            icon={picking ? 'check' : 'plus'}
            tone="dashed"
            selected={picking}
            onPress={() => setPicking((v) => !v)}
          />
        ) : null}
      </View>
      {picking && available.length ? (
        <View style={styles.picker}>
          <AppText variant="small" style={styles.hint}>
            Toca para agregar
          </AppText>
          <View style={styles.wrap}>
            {available.map((p) => (
              <Chip key={p} label={p} icon="plus" tone="dashed" size="sm" onPress={() => add(p)} />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  picker: {
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  hint: { fontFamily: fonts.sansMedium },
});
