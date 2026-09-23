import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, maxContentWidth } from '@/theme';

import { FilledIcon, Icon, type FilledIconName, type IconName } from './Icon';
import { AppText } from './Typography';

const TABS: Record<string, { label: string; icon: IconName; active: FilledIconName }> = {
  index: { label: 'Inicio', icon: 'home', active: 'home' },
  explore: { label: 'Explorar', icon: 'search', active: 'search' },
  saved: { label: 'Guardados', icon: 'bookmark', active: 'bookmark' },
  friends: { label: 'Amigos', icon: 'users', active: 'people' },
  profile: { label: 'Perfil', icon: 'user', active: 'person' },
};

/** Bottom navigation from the design: Inicio · Explorar · Guardados · Amigos · Perfil. */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const current = state.routes[state.index]?.name;
  // Hidden routes (e.g. the map) light up their parent tab.
  const activeName = current === 'map' ? 'explore' : current;
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.inner}>
        {state.routes.map((route) => {
          const tab = TABS[route.name];
          if (!tab) return null;
          const focused = route.name === activeName;
          const color = focused ? colors.blue : colors.textFaint;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={tab.label}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (route.name !== current && !event.defaultPrevented) navigation.navigate(route.name, route.params);
              }}
              style={styles.item}>
              {focused ? <FilledIcon name={tab.active} size={22} color={color} /> : <Icon name={tab.icon} size={21} color={color} />}
              <AppText style={[styles.label, { color, fontFamily: focused ? fonts.sansSemi : fonts.sansMedium }]}>
                {tab.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderStrong,
    paddingTop: 8,
  },
  inner: { flexDirection: 'row', width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' },
  item: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 },
  label: { fontSize: 11 },
});
