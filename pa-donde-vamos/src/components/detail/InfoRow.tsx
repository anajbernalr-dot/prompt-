import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { AppText } from '@/components/Typography';
import { colors } from '@/theme';

/** Icon + text line ("La Castellana, Caracas · 1.4 km"). */
export function InfoRow({
  icon,
  children,
  color = colors.text,
  iconColor,
}: {
  icon: IconName;
  children: ReactNode;
  color?: string;
  iconColor?: string;
}) {
  return (
    <View style={styles.row}>
      <Icon name={icon} size={18} color={iconColor ?? color} />
      <AppText variant="body" color={color} style={styles.text}>
        {children}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  text: { flex: 1, fontSize: 15.5 },
});
