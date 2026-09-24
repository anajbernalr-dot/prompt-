import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { IconButton } from '@/components/Button';
import { BackButton } from '@/components/Header';
import { Icon, type IconName } from '@/components/Icon';
import { AppText } from '@/components/Typography';
import type { Friend } from '@/data/types';
import { colors, fonts, radius, shadow } from '@/theme';

export type MenuItem = { key: string; label: string; icon: IconName; onPress: () => void };

/** Back arrow, avatar, name + presence, and a kebab that toggles a small popover menu. */
export function ChatHeader({
  friend,
  menuOpen,
  onToggleMenu,
  items,
}: {
  friend: Friend;
  menuOpen: boolean;
  onToggleMenu: () => void;
  items: MenuItem[];
}) {
  return (
    <View style={styles.row}>
      <BackButton fallback="/friends" />
      <Avatar name={friend.name} image={friend.avatar} size={46} />
      <View style={styles.body}>
        <AppText variant="title" style={styles.name} numberOfLines={1}>
          {friend.name}
        </AppText>
        <AppText variant="small" color={friend.online ? colors.success : colors.textFaint}>
          {friend.online ? 'en línea' : 'activo hace un rato'}
        </AppText>
      </View>
      <IconButton
        icon="more-vertical"
        iconSize={20}
        accessibilityLabel="Más opciones"
        onPress={onToggleMenu}
        background={menuOpen ? colors.surfaceMuted : 'transparent'}
      />
      {menuOpen ? (
        <View style={[styles.menu, shadow]} accessibilityRole="menu">
          {items.map((item, i) => (
            <Pressable
              key={item.key}
              accessibilityRole="menuitem"
              onPress={item.onPress}
              style={({ pressed }) => [
                styles.item,
                i < items.length - 1 && styles.itemDivider,
                pressed && { backgroundColor: colors.surfaceMuted },
              ]}>
              <Icon name={item.icon} size={17} color={colors.ink} />
              <AppText style={styles.itemText}>{item.label}</AppText>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, marginBottom: 8, zIndex: 10 },
  body: { flex: 1, gap: 1 },
  name: { fontSize: 18, lineHeight: 23 },
  menu: {
    position: 'absolute',
    top: 52,
    right: 0,
    minWidth: 210,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, minHeight: 48 },
  itemDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderStrong },
  itemText: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.text },
});
