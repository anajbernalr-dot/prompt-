import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

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

const DarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.background,
    card: Colors.card,
    text: Colors.text,
    border: Colors.border,
    primary: Colors.primary,
    notification: Colors.primary,
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 60,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.subtext,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'QuickTap') iconName = focused ? 'flash' : 'flash-outline';
          else if (route.name === 'Reports') iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
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
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: Colors.background },
          animationEnabled: true,
        }}
        initialRouteName="Onboarding"
      >
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
