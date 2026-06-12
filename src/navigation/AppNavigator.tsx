import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, R, F } from '../theme/colors';

import AuthScreen from '../screens/AuthScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import OrganizerSetupScreen from '../screens/OrganizerSetupScreen';
import StandJoinScreen from '../screens/StandJoinScreen';
import StandSetupScreen from '../screens/StandSetupScreen';
import DashboardScreen from '../screens/DashboardScreen';
import QuickTapScreen from '../screens/QuickTapScreen';
import PanicModeScreen from '../screens/PanicModeScreen';
import ReportsScreen from '../screens/ReportsScreen';
import OrganizerDashboardScreen from '../screens/OrganizerDashboardScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const NavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.bg0,
    card: Colors.bg1,
    text: Colors.label1,
    border: Colors.sep,
    primary: Colors.primary,
    notification: Colors.primary,
  },
};

// Custom animated tab bar button
function TabBtn({ children, onPress, accessibilityState }: any) {
  const scale = useSharedValue(1);
  const focused = accessibilityState?.selected;

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.selectionAsync();
        scale.value = withSpring(0.88, { damping: 8, stiffness: 500 }, () => {
          scale.value = withSpring(1, { damping: 10, stiffness: 300 });
        });
        onPress();
      }}
      style={styles.tabBtn}
      activeOpacity={1}
    >
      <Animated.View style={[styles.tabInner, focused && styles.tabInnerFocused, anim]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.label4,
        tabBarLabelStyle: styles.tabLabel,
        tabBarButton: (props) => <TabBtn {...props} />,
        tabBarIcon: ({ color, focused }) => {
          const icons: Record<string, [string, string]> = {
            Dashboard: ['home', 'home-outline'],
            QuickTap: ['flash', 'flash-outline'],
            Reports: ['bar-chart', 'bar-chart-outline'],
            Settings: ['settings', 'settings-outline'],
          };
          const [on, off] = icons[route.name] ?? ['ellipse', 'ellipse-outline'];
          return <Ionicons name={(focused ? on : off) as any} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="QuickTap" component={QuickTapScreen} options={{ title: 'Vender' }} />
      <Tab.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reportes' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Ajustes' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer theme={NavTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: Colors.bg0 },
          animationEnabled: true,
          cardStyleInterpolator: ({ current, layouts }) => ({
            cardStyle: {
              transform: [{
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [layouts.screen.width * 0.08, 0],
                }),
              }],
              opacity: current.progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.7, 1] }),
            },
          }),
        }}
        initialRouteName="Auth"
      >
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="OrganizerSetup" component={OrganizerSetupScreen} />
        <Stack.Screen name="StandJoin" component={StandJoinScreen} />
        <Stack.Screen name="StandSetup" component={StandSetupScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="PanicMode" component={PanicModeScreen} />
        <Stack.Screen name="OrganizerDashboard" component={OrganizerDashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.bg1,
    borderTopColor: Colors.sep,
    borderTopWidth: StyleSheet.hairlineWidth,
    height: 72,
    paddingTop: 8,
    paddingBottom: 16,
  },
  tabBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabInner: { alignItems: 'center', justifyContent: 'center', gap: 3, padding: 6, borderRadius: R.md },
  tabInnerFocused: { backgroundColor: Colors.primarySoft },
  tabLabel: { fontSize: F.micro, fontWeight: F.semibold, letterSpacing: 0.2 },
});
