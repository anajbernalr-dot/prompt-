import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { Card } from '@/components/Surfaces';
import { AppText } from '@/components/Typography';
import { colors, fonts } from '@/theme';

export function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText style={styles.title} accessibilityRole="header">
        {title}
      </AppText>
      <Card style={styles.card}>{children}</Card>
    </View>
  );
}

/** Label + optional hint with an RN Switch; the whole row toggles. */
export function SwitchRow({
  label,
  hint,
  value,
  onChange,
  last,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      onPress={() => onChange(!value)}
      style={[styles.row, !last && styles.divider]}>
      <View style={{ flex: 1 }}>
        <AppText style={styles.label}>{label}</AppText>
        {hint ? (
          <AppText variant="small" color={colors.textFaint}>
            {hint}
          </AppText>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.blue, false: colors.borderStrong }}
        thumbColor={colors.white}
        {...({ activeThumbColor: colors.white } as object)}
      />
    </Pressable>
  );
}

/** Red text button for destructive actions ("Cerrar sesión"). */
export function DangerButton({ label, icon, onPress }: { label: string; icon: IconName; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.danger, pressed && { backgroundColor: colors.surfaceMuted }]}>
      <Icon name={icon} size={18} color={colors.danger} />
      <AppText style={styles.dangerText}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  danger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 50,
    borderRadius: 999,
  },
  dangerText: { fontFamily: fonts.sansSemi, fontSize: 15.5, color: colors.danger },
  section: { marginBottom: 22 },
  title: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: { paddingVertical: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 58, paddingVertical: 8 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderStrong },
  label: { fontFamily: fonts.sansMedium, fontSize: 15.5, color: colors.text },
});
