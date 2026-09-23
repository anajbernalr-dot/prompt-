import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/TabBar';
import { colors } from '@/theme';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.background } }}>
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explorar' }} />
      <Tabs.Screen name="saved" options={{ title: 'Guardados' }} />
      <Tabs.Screen name="friends" options={{ title: 'Amigos' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
      {/* Not a tab button: reached from Inicio/Explorar; the tab bar highlights "Explorar". */}
      <Tabs.Screen name="map" options={{ title: 'Mapa', href: null }} />
    </Tabs>
  );
}
